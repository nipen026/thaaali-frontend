import {useState} from 'react';
import {Plus,Trash2,Grid3X3} from 'lucide-react';
import {tablesAPI} from '../../api';
import {notifySuccess,notifyError} from '../../lib/toast';
import {useApiData} from '../../lib/useApiData';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';

const EMPTY={number:'',capacity:4,zone:'indoor'};

export default function TableSetupManager(){
  const {data:tables,setData:setTables,loading}=useApiData(()=>tablesAPI.getAll());
  const [form,setForm]=useState(EMPTY);
  const [busy,setBusy]=useState(false);
  const [toDelete,setToDelete]=useState(null);

  if(loading) return <Skeleton variant="row" count={4}/>;

  const set=(field)=>(e)=>setForm(f=>({...f,[field]:e.target.value}));

  const addTable=async e=>{
    e.preventDefault();
    if(!form.number) return notifyError('Enter a table number');
    setBusy(true);
    try{
      const r=await tablesAPI.create({number:Number(form.number),capacity:Number(form.capacity),zone:form.zone});
      setTables(prev=>[...prev,r.data].sort((a,b)=>a.number-b.number));
      setForm(EMPTY);
      notifySuccess(`Table ${r.data.number} added`);
    }catch(err){
      notifyError(err?.response?.data?.error||'Could not add table');
    }finally{setBusy(false);}
  };

  const removeTable=async()=>{
    try{
      await tablesAPI.remove(toDelete.id);
      setTables(prev=>prev.filter(t=>t.id!==toDelete.id));
      notifySuccess(`Table ${toDelete.number} removed`);
    }catch(err){
      notifyError(err?.response?.data?.error||'Could not remove table');
    }
  };

  return(
    <div>
      <form onSubmit={addTable} className="flex gap-3" style={{alignItems:'flex-end',marginBottom:20,flexWrap:'wrap'}}>
        <div className="fgrp" style={{marginBottom:0,width:100}}>
          <label className="flbl" htmlFor="tbl-number">Number</label>
          <input id="tbl-number" type="number" className="finput" value={form.number} onChange={set('number')} required/>
        </div>
        <div className="fgrp" style={{marginBottom:0,width:100}}>
          <label className="flbl" htmlFor="tbl-capacity">Seats</label>
          <input id="tbl-capacity" type="number" min="1" className="finput" value={form.capacity} onChange={set('capacity')} required/>
        </div>
        <div className="fgrp" style={{marginBottom:0,width:140}}>
          <label className="flbl" htmlFor="tbl-zone">Zone</label>
          <select id="tbl-zone" className="finput" value={form.zone} onChange={set('zone')}>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="private">Private</option>
          </select>
        </div>
        <button type="submit" className="btn btn-pr" disabled={busy}><Plus size={15}/> Add Table</button>
      </form>

      {tables.length===0?(
        <EmptyState icon={<Grid3X3 size={40} strokeWidth={1.5}/>} title="No tables yet" subtitle="Add your first table above."/>
      ):(
        <table className="inv-table">
          <thead><tr><th>Table</th><th>Seats</th><th>Zone</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {tables.map(t=>(
              <tr key={t.id}>
                <td style={{fontWeight:700}}>T{t.number}</td>
                <td>{t.capacity}</td>
                <td style={{textTransform:'capitalize'}}>{t.zone}</td>
                <td><span className={`badge ${t.status==='available'?'bg-jade':'bg-gray'}`}>{t.status.replace('_',' ')}</span></td>
                <td>
                  <button className="tb-btn" style={{width:30,height:30}} aria-label={`Remove table ${t.number}`}
                    disabled={t.status!=='available'} onClick={()=>setToDelete(t)}>
                    <Trash2 size={13}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={()=>setToDelete(null)}
        onConfirm={removeTable}
        title="Remove this table?"
        message={toDelete&&`Table ${toDelete.number} will be permanently removed.`}
        confirmLabel="Remove"
      />
    </div>
  );
}
