// ==== src/pages/admin/Units.jsx ====
import { useEffect, useState } from 'react'
import http from '../../api/http'
import PropertyPicker from '../../components/PropertyPicker'



export default function Units(){
  const [propertyCode,setPropertyCode]=useState('')
  const [unitName,setUnitName]=useState('')
  const [rows,setRows]=useState([])
  const [err,setErr]=useState('')

  const load = async(code)=>{
    if (!code) { setRows([]); return }
    try{
      const { data } = await http.get(`/units`, { params: { property_code: code } })
      setRows(data)
    }catch(ex){ setErr(ex?.response?.data?.message || 'Failed to load') }
  }

  useEffect(()=>{ if (propertyCode) load(propertyCode) },[propertyCode])

  const create = async (e)=>{
    e.preventDefault(); setErr('')
    try{
      const { data } = await http.post('/units', { property_code: propertyCode, unit_name: unitName })
      setRows([data, ...rows])
      setUnitName('')
    }catch(ex){ setErr(ex?.response?.data?.message || 'Failed') }
  }

  return (
    <div style={{padding:16}}>
      <h2>Units</h2>
      <div style={{display:'grid',gap:12,maxWidth:520}}>
        <PropertyPicker value={propertyCode} onChange={setPropertyCode} />
        <form onSubmit={create} style={{display:'flex',gap:8,alignItems:'center'}}>
          <input placeholder="Unit name (unique per property)" value={unitName} onChange={e=>setUnitName(e.target.value)} required />
          <button type="submit" disabled={!propertyCode}>Add Unit</button>
        </form>
        {err && <span style={{color:'crimson'}}>{err}</span>}
      </div>

      <table border="1" cellPadding="6" style={{marginTop:12, width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>Code</th><th>Unit</th><th>Status</th><th>Tenant</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td><code>{r.public_code}</code></td>
              <td>{r.unit_name}</td>
              <td>{r.status}</td>
              <td>{r.current_tenant_id ?? '-'}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
