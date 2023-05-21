import toast from "react-hot-toast";

import { isCashDrawerError } from "../../types.guard";
import Message from "./Message";

import type { ToastPosition } from "react-hot-toast";


/**
 * Display a toast message in the application.
 *
 * @param title a title for the toast message
 * @param message a message to display
 */
export default function notify({ position = "top-center", ...props }: Options) {
  toast.custom(
    (toast) => (
      <Message {...props} t={toast} />
    ),
    {
      duration: Infinity,
      id: "unique-notification",
      position,
    }
  );
}

export function notifyError(err: unknown) {
  if (isCashDrawerError(err)) {
    notify({
      title: "Error!",
      code: err.kind,
      message: err.message
    });
  } else if (err instanceof Error) {
    notify({
      title: "Error!",
      message: err.message,
    });
  } else {
    console.info("Something seriously went wrong");
    console.error(err);

    notify({
      title: "Something went wrong",
      message: "You should not encounter this message",
    });
  }
}

interface Options {
  code?: string;
  title: string;
  message: string;
  position?: ToastPosition;
}