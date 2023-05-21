export type APIState = {
  /**
   * A function to trigger the API to recheck itself.
   */
  recheck: () => Promise<APIStatus>,
  /**
   * The current status of the API.
   */
  status: APIStatus;
  /**
   * The URL for the API. Inherited from {AppState.api_url}.
   */
  url?: string | null;
}

export type APIStatus = "unknown" | "checking" | "running" | "error";

export type AppState = {
  /**
   * The port the API is running on.
   */
  api_port: number;
  /**
   * The URL for the API server (for use with web applications running on this computer).
   */
  api_url: string;
  /**
   * A list of available cash drawers in the system.
   */
  cash_drawers: CashDrawer[];
  /**
   * The default cash drawer for the application. If there is only one,
   * it will be automatically be selected.
   */
  default_cash_drawer?: CashDrawer | null;
  /**
   * The version of the application.
   */
  version: string;
}

/**
 * A struct that describes a cash drawer available on the system.
 * 
 * @see {isCashDrawer} ts-auto-guard:type-guard
 */
export type CashDrawer = {
  /**
   * The (system-specific) path for the cash drawer.
   * On Windows, this will be something like `COM3`.
   * On MacOS, this will be something like `/dev/cu.usbserial`.
   */
  path: string;
  /**
   * The manufacturer of the serial port adapter. Not guaranteed to be useful.
   */
  manufacturer: string;
  /**
   * The product identifier of the serial port adapter. May contain the manufacturer string.
   */
  product: string;
  /**
   * The serial number of the serial port adapter.
   */
  serial_number: string;
};

/**
 * A struct detailing different types of errors from interacting with cash drawers on the system.
 * 
 * @see {isCashDrawerError} ts-auto-guard:type-guard
 */
export type CashDrawerError = {
  kind: CashDrawerErrorKind;
  path: string;
  message: string;
};

/**
 * An enum delineating the different kinds of errors that might come back from the application.
 * 
 * @see {isCashDrawerErrorKind} ts-auto-guard:type-guard
 */
export type CashDrawerErrorKind = "CONFIG" | "IO" | "NO_DEVICE" | "UNKNOWN";

/**
 * The section of the app to render.
 */
export type NavSection = "home" | "drawers";

/**
 * Change which section is visible.
 */
export type NavSectionSetter = (section: NavSection) => void;

/**
 * Nav state for the application.
 */
export type NavState = {
  section: NavSection;
  setSection: NavSectionSetter;
};

/**
 * A valid pong response from the API.
 * 
 * @see {isPongResponse} ts-auto-guard:type-guard
 */
export type PongResponse = "PONG";