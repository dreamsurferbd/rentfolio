import { useEffect, useState } from "react";
import http from "../../api/http";

export default function Agreements() {
  const [propsList, setPropsList] = useState([]);
  const [propertyCode, setPropertyCode] = useState("");
  const [unitId, setUnitId] = useState("");
  const [tenantId, setTenantId] = useState("");      // or leave blank & use tenantEmail
  const [tenantEmail, setTenantEmail] = useState(""); // optional for email notify
  const [body, setBody] = useState("Standard lease body…");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [renewal, setRenewal] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get("/properties");
        setPropsList(data);
      } catch {}
    })();
  }, []);

  const sendAgreement = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const payload = {
        property_id: undefined, // resolved via code on backend if you’ve added it; else keep id
        unit_id: Number(unitId),
        tenant_id: tenantId ? Number(tenantId) : 0,
        tenant_email: tenantEmail || undefined,
        body,
        lease_start: leaseStart,
        lease_end: leaseEnd,
        renewal_option: renewal,
      };

      // backend we wrote expects numeric property_id; but you also have property code-based patterns elsewhere.
      // Quick resolve property_id from code (client-side):
      const match = propsList.find((p) => p.public_code === propertyCode);
      if (!match) return setMsg("Select a valid property");
      payload.property_id = match.id;

      const { data } = await http.post("/agreements/send", payload);
      setMsg(`Sent. Agreement code: ${data.public_code || data.id}`);
    } catch (ex) {
      setMsg(ex?.response?.data?.message || "Failed to send agreement");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Agreements (Admin)</h2>
      <form onSubmit={sendAgreement} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <label>Property</label>
        <select value={propertyCode} onChange={(e) => setPropertyCode(e.target.value)} required>
          <option value="">-- select --</option>
          {propsList.map((p) => (
            <option key={p.id} value={p.public_code}>
              {p.public_code} • {p.name}
            </option>
          ))}
        </select>

        <label>Unit ID (numeric)</label>
        <input value={unitId} onChange={(e) => setUnitId(e.target.value)} type="number" min="1" required />

        <label>Tenant ID (numeric) — or Tenant Email</label>
        <input value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="e.g. 7" />
        <input value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} placeholder="tenant@example.com" />

        <label>Lease Start</label>
        <input type="date" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} required />
        <label>Lease End</label>
        <input type="date" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} required />

        <label style={{ display: "flex", gap: 8 }}>
          <input type="checkbox" checked={renewal} onChange={(e) => setRenewal(e.target.checked)} />
          Renewal option
        </label>

        <label>Agreement Body</label>
        <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />

        <button type="submit">Send Agreement</button>
        {msg && <div style={{ color: msg.startsWith("Sent") ? "green" : "crimson" }}>{msg}</div>}
      </form>
    </div>
  );
}
