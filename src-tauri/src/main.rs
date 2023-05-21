// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri::SystemTray;
use tauri::{CustomMenuItem, SystemTrayEvent, SystemTrayMenu};

mod cash_drawer;
mod app_state;
mod api_server;

#[tauri::command]
fn get_app_state(state: tauri::State<app_state::AppStateRef>) -> Result<serde_json::Value, cash_drawer::CashDrawerError> {
  match state.lock() {
    Ok(state) => Ok(state.as_json()),
    Err(_) => Err(cash_drawer::CashDrawerError::unreadable_app_state())
  }
}

#[tauri::command]
fn open_default_drawer(state: tauri::State<app_state::AppStateRef>) -> Result<(), cash_drawer::CashDrawerError> {
  match state.lock() {
    Ok(state) => state.open_default_drawer(),
    Err(_) => Err(cash_drawer::CashDrawerError::unreadable_app_state())
  }
}

#[tauri::command]
fn open_drawer(path: &str) -> Result<(), cash_drawer::CashDrawerError> {
  cash_drawer::open_drawer(path)
}

#[tauri::command]
fn reload_drawers(state: tauri::State<app_state::AppStateRef>, app_handle: tauri::AppHandle) -> Result<(), cash_drawer::CashDrawerError> {
  match state.lock() {
    Ok(mut state) => {
      state.load_cash_drawers();

      debug_print::debug_println!("app state is now {state:?}");

      match app_handle.emit_all("app-state-changed", state.as_json()) {
        Ok(_) => Ok(()),
        Err(_) => Err(cash_drawer::CashDrawerError::unreadable_app_state()),
      }
    },
    Err(_) => Err(cash_drawer::CashDrawerError::unreadable_app_state())
  }
}

#[tauri::command]
fn set_default_drawer(state: tauri::State<app_state::AppStateRef>, app_handle: tauri::AppHandle, path: &str) -> Result<(), cash_drawer::CashDrawerError> {
  match state.lock() {
    Ok(mut state) => {
      state.set_default(path);

      match app_handle.emit_all("app-state-changed", state.as_json()) {
        Ok(_) => Ok(()),
        Err(_) => Err(cash_drawer::CashDrawerError::unreadable_app_state()),
      }
    },
    Err(_) => Err(cash_drawer::CashDrawerError::unreadable_app_state())
  }
}

fn main() {
  let app_state = app_state::init();

  api_server::create_server(app_state.clone());

  let hide = CustomMenuItem::new("hide".to_string(), "Hide");
  let reload = CustomMenuItem::new("reload".to_string(), "Reload Drawers");
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");
  
  let tray_menu = SystemTrayMenu::new()
    .add_item(hide)
    .add_item(reload)
    .add_item(quit);

  let tray = SystemTray::new()
    .with_menu(tray_menu);

  tauri::Builder::default()
    .manage(app_state)
    .system_tray(tray)
    .invoke_handler(tauri::generate_handler![
      get_app_state,
      open_default_drawer,
      open_drawer,
      reload_drawers,
      set_default_drawer
    ])
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick { .. } => {
        let window = app.get_window("main").unwrap();

        window.show().unwrap();

        debug_print::debug_println!("System Tray Click");
      }
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "hide" => {
            let window = app.get_window("main").unwrap();

            window.hide().unwrap();
          }
          "quit" => {
            debug_print::debug_println!("Quit Invoked");

            app.app_handle().exit(0);
          }
          "reload" => {
            let app_state: tauri::State<app_state::AppStateRef> = app.try_state::<app_state::AppStateRef>().unwrap();

            match app_state.lock() {
              Ok(mut state) => {
                state.load_cash_drawers();

                debug_print::debug_println!("app state now {state:?}");

                app.emit_all("app-state-changed", state.as_json()).unwrap();
              },
              Err(_) => {
                debug_print::debug_println!("Problem reloading drawers");
              }
            };
          }
          _ => {}
        }
      }
      _ => {}
    })
    .on_window_event(|event| match event.event() {
      tauri::WindowEvent::CloseRequested { api, .. } => {
        event.window().hide().unwrap();
        api.prevent_close();
      }
      _ => {}
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|_app_handle, event| match event {
      tauri::RunEvent::ExitRequested { api, .. } => {
        api.prevent_exit();
      }
      _ => {}
    });
}