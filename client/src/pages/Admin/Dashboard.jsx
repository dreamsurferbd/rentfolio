import { Grid, Paper, Typography } from "@mui/material";

export default function AdminDashboard() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Total Earnings</Typography>
          <Typography variant="h5" fontWeight={700}>$32,400</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Open Invoices</Typography>
          <Typography variant="h5" fontWeight={700}>14</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Vacant Units</Typography>
          <Typography variant="h5" fontWeight={700}>6</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
