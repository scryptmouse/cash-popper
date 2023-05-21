use debug_print::{debug_println};
use serde::ser::{Serializer, SerializeStruct};
use std::sync::{Arc,Mutex};
use std::net::TcpListener;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};

use crate::cash_drawer::{CashDrawer, CashDrawerError, find_available_drawers, open_drawer};

const VERSION: &str = env!("CARGO_PKG_VERSION");

#[allow(dead_code)]
#[derive(Debug)]
pub struct AppState {
  pub api_port: u16,
  pub api_socket: SocketAddr,
  pub api_url: String,
  pub cash_drawers: Vec<CashDrawer>,
  pub default_cash_drawer: Option<CashDrawer>,
  pub version: &'static str,
}

#[allow(dead_code)]
impl AppState {
  pub fn as_json(&self) -> serde_json::Value {
    serde_json::json!(self)
  }

  pub fn default_path(&self) -> Option<String> {
    match self.default_cash_drawer.clone() {
      Some(d) => Some(d.path),
      _ => None,
    }
  }

  pub fn has_default(&self) -> bool {
    match self.default_cash_drawer {
      Some(_) => true,
      _ => false,
    }
  }

  pub fn has_one_drawer(&self) -> bool {
    self.cash_drawers.len() == 1
  }

  pub fn load_cash_drawers(&mut self) {
    let current_default_path = self.default_path();
  
    let cash_drawers: Vec<CashDrawer> = find_available_drawers();

    let dup = cash_drawers.clone();

    let num_drawers = cash_drawers.len();

    self.cash_drawers = cash_drawers;
  
    if num_drawers == 1 {
      let path: &str = dup[0].str();
    
      self.set_default(path);
    } else {
      match current_default_path {
        Some(path) => self.set_default(path.as_str()),
        None => ()
      }
    }

    return ();
  }

  pub fn open_default_drawer(&self) -> Result<(), CashDrawerError> {
    match self.default_path() {
      Some(path) => open_drawer(path.as_str()),
      None => {
        Err(CashDrawerError::no_default_drawer())
      },
    }
  }

  pub fn set_default(&mut self, path: &str) {
    for drawer in self.cash_drawers.clone() {
      if drawer.matches(path) {
        self.default_cash_drawer = Some(drawer);

        return;
      }
    }

    self.default_cash_drawer = None;
  }
}

impl serde::Serialize for AppState {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    let mut state: <S as Serializer>::SerializeStruct = serializer.serialize_struct("AppState", 6)?;

    state.serialize_field("api_port", &self.api_port)?;
    state.serialize_field("api_socket", &self.api_socket)?;
    state.serialize_field("api_url", &self.api_url)?;
    state.serialize_field("cash_drawers", &self.cash_drawers)?;
    state.serialize_field("default_cash_drawer", &self.default_cash_drawer)?;
    state.serialize_field("version", &self.version)?;
    state.end()
  }
}

pub type AppStateRef = Arc<Mutex<AppState>>;

/// Initialize the app state to be used.
pub fn init() -> AppStateRef {
  let cash_drawers: Vec<CashDrawer> = vec![];

  let default_cash_drawer = None;

  let api_port = find_available_tcp_port().expect("no port available");
  let api_socket = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), api_port);
  let api_url = format!("http://127.0.0.1:{api_port}");

  let mut state: AppState = AppState {
    api_port,
    api_socket,
    api_url,
    cash_drawers,
    default_cash_drawer,
    version: VERSION,
  };

  state.load_cash_drawers();

  debug_println!("APP STATE IS {state:?}");

  Arc::new(Mutex::new(state))
}

/// The default port used by this application to run its API Server.
/// If it's not available, the app will attempt to find an available
/// port in the upper ranges (40000...60000).
pub const DEFAULT_PORT: u16 = 31198;

/// Find an available port to use for the API Server.
/// 
/// It will try [DEFAULT_PORT] first, and failing that,
/// it will look for an available port in the range of
/// 40000-60000. See [port_is_available].
fn find_available_tcp_port() -> Option<u16> {  
  if port_is_available(DEFAULT_PORT) {
    return Some(DEFAULT_PORT);
  } else {
    (40000u16..60000u16).find(|port| port_is_available(*port))
  }
}

/// Check if a port is available
fn port_is_available(port: u16) -> bool {
  match TcpListener::bind(("127.0.0.1", port)) {
    Ok(_) => true,
    Err(_) => false,
  }
}