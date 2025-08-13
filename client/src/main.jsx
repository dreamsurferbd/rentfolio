import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ToasterProvider from "./components/Toaster";

const theme = createTheme({ palette:{ mode:"light", primary:{ main:"#7c3aed" } }});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToasterProvider>
        <App />
      </ToasterProvider>
    </ThemeProvider>
  </React.StrictMode>
);
