import { useEffect, useState } from "react";
import http from "../../api/http";

export default function Invoices() {
  const [propsList, setPropsList] = useState([]);
  const [propertyCode, setPropertyCode] = useState("");
  const [unitId, setUnitId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [invoiceMonth, setInvoiceMonth] = useState("");
  const [items, setItems] = useState([
    { label: "Rent", amount: 0 },
    { label: "Water", amount: 0 },
    { label: "Service", amount: 0 },
    { label: "Garbage", amount: 0 },
  ]);
  const [previousDues, setPreviousDues] = useState(0);
  const [securityAdj, setSecurityAdj] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get("/properties");
        setPropsList(data);
      } catch {}
    })();
  }, []);

  const changeItem = (i, key, val) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [key]: key === "amount" ? Number(val || 0) : val };
    setItems(copy);
  };

  const createInvoice = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const prop = propsList.find((p) => p.public_code === propertyCode);
      if (!prop) return setMsg("Select a valid property");

      const payload = {
        property_id: prop.id,
        unit_id: Number(unitId),
        tenant_id: tenantId ? Number(tenantId) : 0,
        tenant_email: tenantEmail || undefined,
        invoice_month: invoiceMonth || new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
        items,
        previous_dues: Number(previousDues || 0),
        security_adjustment: Number(securityAdj || 0),
      };

      const { data } = await http.post("/invoices/create", payload);
      setMsg(`Created. Invoice code: ${data.public_code || data.id} • total: ${data.total_due}`);
    } catch (ex) {
      setMsg(ex?.response?.data?.message || "Failed to create invoice");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Invoices (Admin)</h2>
      <form onSubmit={createInvoice} style={{ display: "grid", gap: 8, maxWidth: 720 }}>
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

        <label>Invoice Month (e.g., August 2025)</label>
        <input value={invoiceMonth} onChange={(e) => setInvoiceMonth(e.target.value)} placeholder="August 2025" />

        <fieldset style={{ border: "1px solid #ddd", padding: 8 }}>
          <legend>Items</legend>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input
                value={it.label}
                onChange={(e) => changeItem(i, "label", e.target.value)}
                placeholder="Label"
                style={{ flex: 1 }}
              />
              <input
                type="number"
                value={it.amount}
                onChange={(e) => changeItem(i, "amount", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                style={{ width: 120 }}
              />
            </div>
          ))}
        </fieldset>

        <label>Previous Dues</label>
        <input type="number" value={previousDues} onChange={(e) => setPreviousDues(e.target.value)} />

        <label>Security Adjustment</label>
        <input type="number" value={securityAdj} onChange={(e) => setSecurityAdj(e.target.value)} />

        <button type="submit">Create Invoice</button>
        {msg && <div style={{ color: msg.startsWith("Created") ? "green" : "crimson" }}>{msg}</div>}
      </form>
    </div>
  );
}
