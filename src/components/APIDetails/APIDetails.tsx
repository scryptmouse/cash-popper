import { useAppState } from "../../contexts/AppState";

import APIStatus from "./APIStatus";
import APIURL from "./APIURL";

import "./APIDetails.css";

export default function APIDetails() {
  const appState = useAppState();

  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="api-details--title">API</h3>
        <p className="api-details--help-message">
          Information about the trigger API.
        </p>
        <p className="api-details--help-message">
          Clicking on the URL (if available) will copy it to your clipboard,
          and you can store it in your POS application where prompted.
        </p>
      </div>
      <div className="api-details--wrapper">
        <dl className="divide-y divide-gray-100">
          <div className="api-details--row">
            <dt className="api-details--detail-label">Status</dt>
            <dd className="api-details--detail-value"><APIStatus /></dd>
          </div>
          <div className="api-details--row">
            <dt className="api-details--detail-label">URL</dt>
            <dd className="api-details--detail-value"><APIURL /></dd>
          </div>
        </dl>
      </div>
    </div>
  );
}