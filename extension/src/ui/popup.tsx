import React from "react";
import ReactDOM from "react-dom/client";
import ExtensionPopup from "./ExtensionPopup";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <ExtensionPopup />
  </React.StrictMode>
);
