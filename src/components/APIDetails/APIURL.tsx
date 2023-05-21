 import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";

import { useAPIState } from "../../contexts/APIState";

export default function APIURL() {
  const { url } = useAPIState();

  if (url) {
    return (
      <CopyToClipboard onCopy={textCopied} text={url}>
        <span className="font-mono cursor-copy" title="Click to copy this to your clipboard">{url}</span>
      </CopyToClipboard>
    );
  }

  return (
    <span className="font-mono cursor-not-allowed opacity-50">n/a</span>
  );
}

function textCopied(text: string, result: boolean) {
  toast.success("Copied API URL", {
    className: "bg-slate-600 text-white",
    duration: 1500,
    id: "api-url-copied",
    position: "bottom-right"
  });
}