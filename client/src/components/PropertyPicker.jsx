import { useEffect, useState } from "react";
import http from "../api/http";

export default function PropertyPicker({ value, onChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await http.get("/properties");
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Select Property --</option>
        {items.map((p) => (
          <option key={p.id} value={p.public_code}>
            {p.public_code} • {p.name}
          </option>
        ))}
      </select>
      {loading && <span>Loading...</span>}
    </div>
  );
}
