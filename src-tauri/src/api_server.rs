use axum::{
  extract::State,
  http::{HeaderValue, Method, StatusCode},
  routing::get,
  routing::put,
  response::Json,
  response::IntoResponse,
  Router
};
use std::thread;
use tower_http::cors::CorsLayer;

use crate::app_state;

pub fn create_server(state: app_state::AppStateRef) -> std::thread::JoinHandle<()> {
  let app = create_router(state.clone());

  let addr = state.lock().expect("Could not get API socket").api_socket;

  thread::spawn(move || {
    tokio::runtime::Builder::new_current_thread()
    .enable_all()
    .build()
    .unwrap()
    .block_on(async {
      axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap()
    })
  })
}

pub fn create_router(state: app_state::AppStateRef) -> Router {
  let cors_layer = CorsLayer::new()
    .allow_origin("*".parse::<HeaderValue>().unwrap())
    .allow_methods([Method::GET, Method::PUT, Method::OPTIONS, Method::HEAD]);

  let app = Router::new()
    .route("/", get(root))
    .route("/ping", get(ping))
    .route("/state", get(get_state))
    .route("/default-drawer/open", put(trigger_default_drawer))
    .route("/version", get(version))
    .with_state(state)
    .layer(cors_layer)
  ;

  return app;
}

async fn root() -> &'static str {
  "Cash Popper"
}

async fn get_state(State(state): State<app_state::AppStateRef>) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
  match state.lock() {
    Ok(state) => {
      Ok(Json(state.as_json()))
    },
    _ => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!("Could not read state"))))    
  }
}

async fn ping() -> &'static str {
  "PONG"
}

async fn trigger_default_drawer(State(state): State<app_state::AppStateRef>) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
  match state.lock() {
    Ok(state) => {
      match state.open_default_drawer() {
        Ok(_) => Ok((StatusCode::NO_CONTENT, Json(""))),
        Err(error) => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!(error)))),
      }
    }
    _ => Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!("Could not read state"))))
  }
}

async fn version() -> &'static str {
  env!("CARGO_PKG_VERSION")
}