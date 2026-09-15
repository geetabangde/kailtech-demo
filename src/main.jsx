import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "i18n/config";

import "simplebar-react/dist/simplebar.min.css";


import "styles/index.css";

// Prevent mouse wheel from changing values in number inputs when scrolling
window.addEventListener(
  "wheel",
  (event) => {
    const active = document.activeElement;
    if (active && active.tagName === "INPUT" && active.type === "number") {
      active.blur();
    }
    const target = event.target;
    if (target && target.tagName === "INPUT" && target.type === "number") {
      target.blur();
    }
  },
  { capture: true }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
