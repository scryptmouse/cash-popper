import { useCallback } from "react";
import classNames from "classnames";
import toast from "react-hot-toast";
import { MdOutlineClose } from "react-icons/md";
import { HiExclamation } from "react-icons/hi";

import type { Toast } from "react-hot-toast";

import "./Message.css";

export default function Message(props: Props) {
  const { t, code, title, message } = props;

  const close = useCallback(function() {
    toast.dismiss(t.id);
  }, [t]);

  return (
    <div className={
      classNames([
        "toast-message--wrapper",
        t.visible ? "top-0" : "-top-96"
      ])
    }>
      <div className="toast-message--icon-wrapper">
        <HiExclamation />
      </div>
      <div className="toast-message--content">
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
      <div className="toast-message--close-icon" onClick={close}>
        <MdOutlineClose />
      </div>
      <footer className="toast-message--footer">
        {code && <span className="text-sm text-gray-600 font-mono">{code}</span>}
      </footer>
    </div>
  );
}

interface Props {
  t: Toast;
  code?: string;
  title: string;
  message: string;
} 