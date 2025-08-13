import { createContext, useContext, useState, useCallback } from "react";
import { Alert, Snackbar } from "@mui/material";

const ToastCtx = createContext({ notify: () => {} });
export const useToast = () => useContext(ToastCtx);

export default function ToasterProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [severity, setSeverity] = useState("info");

  const notify = useCallback((message, sev="error") => {
    setMsg(String(message || "Something went wrong"));
    setSeverity(sev);
    setOpen(true);
  }, []);

  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <Snackbar open={open} autoHideDuration={3500} onClose={() => setOpen(false)}>
        <Alert severity={severity} variant="filled" onClose={() => setOpen(false)}>{msg}</Alert>
      </Snackbar>
    </ToastCtx.Provider>
  );
}
