/*
 * Generated type guards for "types.d.ts".
 * WARNING: Do not manually change this file.
 */
import { CashDrawer, CashDrawerError, CashDrawerErrorKind, PongResponse } from "./types";

export function isCashDrawer(obj: unknown): obj is CashDrawer {
    const typedObj = obj as CashDrawer
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["path"] === "string" &&
        typeof typedObj["manufacturer"] === "string" &&
        typeof typedObj["product"] === "string" &&
        typeof typedObj["serial_number"] === "string"
    )
}

export function isCashDrawerError(obj: unknown): obj is CashDrawerError {
    const typedObj = obj as CashDrawerError
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        isCashDrawerErrorKind(typedObj["kind"]) as boolean &&
        typeof typedObj["path"] === "string" &&
        typeof typedObj["message"] === "string"
    )
}

export function isCashDrawerErrorKind(obj: unknown): obj is CashDrawerErrorKind {
    const typedObj = obj as CashDrawerErrorKind
    return (
        (typedObj === "CONFIG" ||
            typedObj === "IO" ||
            typedObj === "NO_DEVICE" ||
            typedObj === "UNKNOWN")
    )
}

export function isPongResponse(obj: unknown): obj is PongResponse {
    const typedObj = obj as PongResponse
    return (
        typedObj === "PONG"
    )
}
