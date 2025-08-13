import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemText, Box, Button, Divider
} from "@mui/material";

const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/properties", label: "Properties" },
  { to: "/admin/units", label: "Units" },
  { to: "/admin/agreements", label: "Agreements" },
  { to: "/admin/invoices", label: "Invoices" },
  { to: "/admin/notices", label: "Notices" },
  { to: "/admin/tenant-requests", label: "Tenant Requests" }
];

const tenantLinks = [
  { to: "/tenant", label: "My Dashboard" },
  { to: "/tenant/invoices", label: "My Invoices" },
  { to: "/tenant/payments", label: "My Payments" },
  { to: "/tenant/lease", label: "My Lease" },
  { to: "/tenant/notices", label: "Notices" }
];

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/login", label: "Login" },
  { to: "/signup", label: "Create account" }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const links =
    user?.role === "ADMIN" ? adminLinks :
    user?.role === "TENANT" ? tenantLinks :
    publicLinks;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px 1fr" }, minHeight: "100dvh" }}>
      <Drawer
        variant="permanent"
        sx={{ "& .MuiDrawer-paper": { position: "relative", width: 260, p: 2 } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box sx={{ width: 28, height: 28, bgcolor: "primary.main", borderRadius: 1 }} />
          <Typography fontWeight={700}>Rentfolio</Typography>
        </Box>

        <List dense>
          {links.map((l) => (
            <ListItemButton
              key={l.to}
              component={NavLink}
              to={l.to}
              sx={{ borderRadius: 2, "&.active": { bgcolor: "action.selected" } }}
            >
              <ListItemText primary={l.label} />
            </ListItemButton>
          ))}
        </List>

        {user && (
          <>
            <Divider sx={{ my: 2 }} />
            <Button fullWidth variant="outlined" onClick={logout}>Logout</Button>
          </>
        )}
      </Drawer>

      <Box sx={{ display: "grid", gridTemplateRows: "64px 1fr" }}>
        <AppBar position="relative" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {user ? (user.role === "ADMIN" ? "Admin" : "Tenant") : "Welcome"}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
