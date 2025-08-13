// ==== src/pages/admin/Properties.jsx ====
import { useEffect, useState } from 'react'
import http from '../../api/http'

export default function Properties(){
  const [rows,setRows]=useState([])
  const [name,setName]=useState('')
  const [address,setAddress]=useState('')
  const [err,setErr]=useState('')

  const load = async()=>{
    const { data } = await http.get('/properties')
    setRows(data)
  }
  useEffect(()=>{ load() },[])

  const create = async (e)=>{
    e.preventDefault(); setErr('')
    try{
      const { data } = await http.post('/properties', { name, address })
      setRows([data, ...rows])
      setName(''); setAddress('')
    }catch(ex){ setErr(ex?.response?.data?.message || 'Failed') }
  }

  return (
    <div style={{padding:16}}>
      <h2>Properties</h2>
      <form onSubmit={create} style={{display:'grid',gap:8,maxWidth:480}}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
        {err && <span style={{color:'crimson'}}>{err}</span>}
        <button type="submit">Add Property</button>
      </form>

      <table border="1" cellPadding="6" style={{marginTop:12, width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>Code</th><th>Name</th><th>Address</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td><code>{r.public_code}</code></td>
              <td>{r.name}</td>
              <td>{r.address}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
