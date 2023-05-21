//! A module for transforming port data from the [serialport] crate
//! and interacting with any ports that conform to the expected cash
//! drawer shape.
use serde::ser::{Serializer, SerializeStruct};
use serialport::{available_ports, ErrorKind, SerialPortInfo, SerialPortType, UsbPortInfo};
use std::fmt;

/// A struct that describes a port on the system that is _likely_
/// to be tied to a cash drawer.
#[derive(Clone, Debug)]
pub struct CashDrawer {
  pub path: String,
  pub manufacturer: String,
  pub product: String,
  pub serial_number: String,
}

impl CashDrawer {
  pub fn matches(&self, path: &str) -> bool {
    self.path == path
  }

  pub fn str(&self) -> &str {
    let s_slice: &str = &self.path[..];

    return s_slice;
  }
}

impl fmt::Display for CashDrawer {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "Port: {} (Product: {}) [Serial: {}]", self.path, self.product, self.serial_number)
  }
}

impl serde::Serialize for CashDrawer {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    let mut state: <S as Serializer>::SerializeStruct = serializer.serialize_struct("CashDrawer", 4)?;

    state.serialize_field("path", &self.path)?;
    state.serialize_field("manufacturer", &self.manufacturer)?;
    state.serialize_field("product", &self.product)?;
    state.serialize_field("serial_number", &self.serial_number)?;
    state.end()
  }
}

const NO_PATH: &str = "n/a";

#[derive(Debug)]
pub struct CashDrawerError {
  kind: CashDrawerErrorKind,
  path: String,
  message: String,
}

impl CashDrawerError {
  pub fn config_error(message: &str) -> CashDrawerError {
    CashDrawerError {
      kind: CashDrawerErrorKind::Config,
      path: String::from(NO_PATH),
      message: String::from(message),
    }
  }

  pub fn no_default_drawer() -> CashDrawerError {
    CashDrawerError::config_error("No Default Drawer Set")
  }

  pub fn unreadable_app_state() -> CashDrawerError {
    CashDrawerError::config_error("Problem Reading App State")
  }
}

impl fmt::Display for CashDrawerError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "[ERR:{}][{}]: {}", self.kind, self.path, self.message)
  }
}

impl serde::Serialize for CashDrawerError {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    let mut state = serializer.serialize_struct("CashDrawerError", 3)?;

    state.serialize_field("kind", &self.kind)?;
    state.serialize_field("path", &self.path)?;
    state.serialize_field("message", &self.message)?;
    state.end()
  }
}

#[derive(Debug)]
pub enum CashDrawerErrorKind {
  Config,
  NoDevice,
  IO,
  Unknown
}

impl fmt::Display for CashDrawerErrorKind {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    let rep = match *self {
      Self::Config => "CONFIG",
      Self::NoDevice => "NO_DEVICE",
      Self::IO => "IO",
      Self::Unknown => "UNKNOWN"
    };

    write!(f, "{}", rep)
  }
}

impl serde::Serialize for CashDrawerErrorKind {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
    {
      serializer.serialize_str(&self.to_string())
    }
}

/// Use the `serialport` crate to find likely cash drawer ports.
/// As of now, it just looks for USB serial ports. If we find it
/// necessary, we might need to do some filtering for certain
/// products or manufacturers.
pub fn find_available_drawers() -> Vec<CashDrawer> {
  let ports: Vec<SerialPortInfo> = available_ports().expect("Could not read port info");

  let found_ports: Vec<CashDrawer> = ports.into_iter().filter_map(check_port).collect();

  return found_ports;
}

/// Open a cash drawer by its `path`, see [CashDrawerPort#path].
pub fn open_drawer(path: &str) -> Result<(), CashDrawerError> {
  match raw_open_drawer(path) {
    Ok(_) => Ok(()),
    Err(serialport::Error { kind, description }) => {
      let kind: CashDrawerErrorKind = match kind {
        ErrorKind::NoDevice => CashDrawerErrorKind::NoDevice,
        ErrorKind::Io(_) => CashDrawerErrorKind::IO,
        _ => CashDrawerErrorKind::Unknown,
      };

      let path = String::from(path);

      Err(CashDrawerError { path, kind, message: description })
    },
  }
}

/// Arbitrary message to use to trigger the cash drawer to pop open.
/// Thanks, Jerry.
static OPEN_MESSAGE: [u8; 17] = [0x73, 0x68, 0x6f, 0x77, 0x20, 0x6d, 0x65, 0x20, 0x74, 0x68, 0x65, 0x20, 0x6d, 0x6f, 0x6e, 0x65, 0x79];

fn raw_open_drawer(path: &str) -> Result<(), serialport::Error> {
  let mut port = serialport::new(path, 9600).open()?;

  port.write(&OPEN_MESSAGE)?;

  port.clear(serialport::ClearBuffer::All)?;

  return Ok(());
}

/// Figure out if a detected port (from `serialport::available_ports()`)
/// is what we are looking for.
fn check_port(port: SerialPortInfo) -> Option<CashDrawer> {
  match port.port_type {
    SerialPortType::UsbPort(info) => check_port_info(port.port_name, info),
    _ => None,
  }
}

/// A filtering function for [check_port] that builds a [CashDrawerPort].
/// 
/// In the future, this may filter by product or manufacturer, but
/// for the current use case just filtering to USB ports is fine.
fn check_port_info(port_name: String, info: UsbPortInfo) -> Option<CashDrawer> {
  let manufacturer: String = info.manufacturer.unwrap_or("".to_string());
  let product = info.product.unwrap_or("".to_string());
  let serial_number = info.serial_number.unwrap_or("".to_string());

  let drawer_port = CashDrawer {
    path: port_name,
    manufacturer,
    product,
    serial_number,
  };

  return Some(drawer_port);
}