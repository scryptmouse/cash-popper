import { useCallback } from "react";
import classNames from "classnames";

import { useCashDrawers } from "../../contexts/AppState";
import { useNavState } from "../../contexts/NavState";

import "./Nav.css";

export default function Nav() {
  const cashDrawers = useCashDrawers();

  const { section, setSection } = useNavState();

  const goHome = useCallback(() => {
    setSection("home");
  }, [setSection]);

  const goDrawers = useCallback(() => {
    setSection("drawers");
  }, [setSection]);

  return (
    <>
      <nav className="relative flex flex-wrap items-center justify-between px-2 py-3 bg-gray-800 border-gray-600 border-b mb-3">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-auto static block justify-start">
            <button
              className={classNames([
                "nav--btn-home",
                {
                  "active": section === "home",
                }
              ])}
              onClick={goHome}
            >
              Cash Popper
            </button>
          </div>
          <div className="flex flex-grow items-center">
            <ul className="flex flex-row list-none ml-auto">
              <li className={classNames([
                "nav--item",
                {
                  "active": section === "drawers",
                }
              ])}>
                <button
                  className="nav--btn-other"
                  onClick={goDrawers}
                >
                  Drawers ({cashDrawers.length})
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}