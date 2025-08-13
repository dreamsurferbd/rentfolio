import { useEffect, useState } from "react";
import http from "../../api/http";

export default function Notices() {
  const [propsList, setPropsList] = useState([]);
  const [propertyCode, setPropertyCode] = useState("");
  const [propertyId, setPropertyId] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get("/properties");
        setPropsList(data);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const p = propsList.find((x) => x.public_code === propertyCode);
    setPropertyId(p?.id || null);
  }, [propertyCode, propsList]);

  const load = async () => {
    if (!propertyId) return setRows([]);
    try {
      const { data } = await http.get("/notices", { params: { property_id: propertyId } });
      setRows(data);
    } catch (ex) {
      setMsg(ex?.response?.data?.message || "Failed to load notices");
    }
  };

  useEffect(() => { load(); }, [propertyId]);

  const create = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await http.post("/notices", {
        property_id: propertyId,
        title,
        body,
        target: "ALL",
      });
      setMsg("Notice posted");
      setTitle(""); setBody("");
      setRows([data, ...rows]);
    } catch (ex) {
      setMsg(ex?.response?.data?.message || "Failed to post notice");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Notices (Admin)</h2>

      <label>Property</label>
      <select value={propertyCode} onChange={(e) => setPropertyCode(e.target.value)} required>
        <option value="">-- select --</option>
        {propsList.map((p) => (
          <option key={p.id} value={p.public_code}>
            {p.public_code} • {p.name}
          </option>
        ))}
      </select>

      <form onSubmit={create} style={{ display: "grid", gap: 8, maxWidth: 640, marginTop: 12 }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea rows={5} placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} required />
        <button type="submit" disabled={!propertyId}>Post Notice</button>
        {msg && <div style={{ color: msg.includes("posted") ? "green" : "crimson" }}>{msg}</div>}
      </form>

      <table border="1" cellPadding="6" style={{ marginTop: 12, width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Code</th><th>Title</th><th>Body</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><code>{r.public_code}</code></td>
              <td>{r.title}</td>
              <td>{r.body}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
