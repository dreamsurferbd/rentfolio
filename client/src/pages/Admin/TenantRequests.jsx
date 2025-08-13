import { useEffect, useState } from "react";
import http from "../../api/http";

export default function TenantRequests() {
  const [rows, setRows] = useState([]);
  const [approveForUnit, setApproveForUnit] = useState({}); // { [requestId]: unitId }
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const { data } = await http.get("/tenants/requests");
      setRows(data);
    } catch (ex) {
      setMsg(ex?.response?.data?.message || "Failed to load requests");
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setMsg("");
    try {
      const unit_id = Number(approveForUnit[id] || 0);
      if (!unit_id) return setMsg("Enter a unit ID to approve");
      const { data } = await http.post(`/tenants/requests/${id}/approve`, { unit_id });
      setMsg(`Approved: tenant ${data.tenant.public_code} → unit ${data.unit.public_code}`);
      load();
    } catch (ex) {
      setMsg(ex?.response?.data?.message || "Failed to approve");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Tenant Requests (Admin)</h2>
      {msg && <div style={{ color: msg.startsWith("Approved") ? "green" : "crimson" }}>{msg}</div>}
      <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th><th>Property</th><th>Unit</th><th>Name</th><th>Email</th><th>Status</th><th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.property_name}</td>
              <td>{r.unit_name} ({r.unit_code || "-"})</td>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.status}</td>
              <td>
                <input
                  style={{ width: 120 }}
                  placeholder="Unit ID"
                  value={approveForUnit[r.id] || ""}
                  onChange={(e) => setApproveForUnit({ ...approveForUnit, [r.id]: e.target.value })}
                />
                <button onClick={() => approve(r.id)}>Approve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
