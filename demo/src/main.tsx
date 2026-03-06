import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StableKitModeProvider } from "@/context/stablekit-mode";
import { App } from "@/App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StableKitModeProvider>
      <App />
    </StableKitModeProvider>
  </StrictMode>,
);
