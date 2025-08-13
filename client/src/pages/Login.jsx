import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login() {
  const nav = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123!");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const data = await login(email, password);
      nav(data.user.role === "ADMIN" ? "/admin" : "/tenant");
    } catch (ex) {
      setErr(ex?.response?.data?.message || "Login failed");
    }
  };

  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper elevation={6} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: "primary.main", borderRadius: 2 }} />
            <Typography variant="h5" fontWeight={700}>Sign in</Typography>
          </Box>
          <Typography color="text.secondary">
            Welcome back! Please enter your details.
          </Typography>

          <Box component="form" onSubmit={onSubmit} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />

              <TextField
                label="Password"
                type={showPw ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

              {err && <Alert severity="error">{err}</Alert>}

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<LoginRoundedIcon />}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            New here?{" "}
            <Link component={RouterLink} to="/signup" underline="hover">
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

