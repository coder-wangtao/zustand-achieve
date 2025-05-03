import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import BearsPage from "./pages/BearsPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BearsPage />
  </StrictMode>
);
