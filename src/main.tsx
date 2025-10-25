import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import GlobalStyle from "./app/styles/GlobalStyle";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyle />
    <App />
  </StrictMode>
);
