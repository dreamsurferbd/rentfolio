import { useEffect, useState } from "react";
import http from "../api/http";

export default function TenantDashboard() {
  const [payments, setPayments] = useState([]);
  const [propertyId, setPropertyId] = useState("");
  const [propsList, setPropsList] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get("/payments/mine");
        setPayments(data);
      } catch {}
      try {
        const { data } = await http.get("/properties"); // tenants may not have this; if forbidden, hide property picker
        setPropsList(data);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!propertyId) return setNotices([]);
      try {
        const { data } = await http.get("/notices", { params: { property_id: propertyId } });
        setNotices(data);
      } catch {}
    })();
  }, [propertyId]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Tenant Dashboard</h2>

      <h3>My Payments</h3>
      <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Payment Code</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td><code>{p.public_code}</code></td>
              <td>{p.invoice_id}</td>
              <td>{p.amount}</td>
              <td>{p.method}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 18 }}>Notices</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span>Property:</span>
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          <option value="">-- select --</option>
          {propsList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.public_code} • {p.name}
            </option>
          ))}
        </select>
      </div>
      <ul>
        {notices.map((n) => (
          <li key={n.id}>
            <b>{n.title}</b> — {n.body} <i>({new Date(n.created_at).toLocaleString()})</i>
          </li>
        ))}
      </ul>
    </div>
  );
}
