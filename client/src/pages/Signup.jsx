import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import http from "../api/http";

import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Signup() {
  const nav = useNavigate();
  const [role, setRole] = useState("ADMIN"); // UI value; we'll send lowercase
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const extractMsg = (ex) =>
    ex?.response?.data?.message ||
    ex?.response?.data?.error ||
    ex?.response?.data?.errors?.[0]?.msg ||
    ex?.message ||
    "Sign up failed";

  const signUpRequest = async (payload) => {
    // Primary endpoint
    try {
      return await http.post("/auth/register", payload);
    } catch (ex) {
      // If 404/405, try common alt path
      const status = ex?.response?.status;
      if (status === 404 || status === 405) {
        return await http.post("/auth/signup", payload);
      }
      throw ex;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      const payload = {
        role: role.toLowerCase(),                 // 👈 send lowercase
        name,
        email,
        password,
        recaptchaToken: "dev",
        "g-recaptcha-response": "dev"
      };
      const { data } = await signUpRequest(payload);
      setOk(data?.message || "Account created! Redirecting to sign in…");
      setTimeout(() => nav("/login"), 900);
    } catch (ex) {
      console.error("Signup error:", ex?.response || ex);
      setErr(extractMsg(ex));
    }
  };

  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper elevation={6} sx={{ p: 4, width: "100%", maxWidth: 520 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: "primary.main", borderRadius: 2 }} />
            <Typography variant="h5" fontWeight={700}>Create Account</Typography>
          </Box>
          <Typography color="text.secondary">
            Start managing properties and tenants.
          </Typography>

          <Box component="form" onSubmit={onSubmit} noValidate>
            <Stack spacing={2}>
              <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)} fullWidth>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="TENANT">Tenant</MenuItem>
              </TextField>

              <TextField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />

              <TextField
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                helperText="At least 8 characters recommended."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPw ? "Hide password" : "Show password"}
                        onClick={() => setShowPw((v) => !v)}
                        edge="end"
                      >
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: "grey.50", color: "text.secondary", fontSize: 12 }}>
                reCAPTCHA will appear here (dev bypass enabled)
              </Box>

              {err && <Alert severity="error">{err}</Alert>}
              {ok && <Alert severity="success">{ok}</Alert>}

              <Button type="submit" variant="contained" size="large" startIcon={<PersonAddAltRoundedIcon />}>
                Create Account
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login" underline="hover">Sign in</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
