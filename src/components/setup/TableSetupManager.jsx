import {useState} from 'react';
import {Plus,Trash2,Grid3X3} from 'lucide-react';
import {tablesAPI} from '../../api';
import {notifySuccess,notifyError} from '../../lib/toast';
import {useApiData} from '../../lib/useApiData';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';
import {useLanguage} from '../../context/LanguageContext';

const EMPTY={number:'',capacity:4,zone:'indoor'};

export default function TableSetupManager(){
  const {t}=useLanguage();
  const {data:tables,setData:setTables,loading}=useApiData(()=>tablesAPI.getAll());
  const [form,setForm]=useState(EMPTY);
  const [busy,setBusy]=useState(false);
  const [toDelete,setToDelete]=useState(null);

  if(loading) return <Skeleton variant="row" count={4}/>;

  const set=(field)=>(e)=>setForm(f=>({...f,[field]:e.target.value}));

  const addTable=async e=>{
    e.preventDefault();
    if(!form.number) return notifyError(t('setup.tableEnterNumber','Enter a table number'));
    setBusy(true);
    try{
      const r=await tablesAPI.create({number:Number(form.number),capacity:Number(form.capacity),zone:form.zone});
      setTables(prev=>[...prev,r.data].sort((a,b)=>a.number-b.number));
      setForm(EMPTY);
      notifySuccess(t('setup.tableAddedToast','Table {n} added').replace('{n}',r.data.number));
    }catch(err){
      notifyError(err?.response?.data?.error||t('setup.tableAddError','Could not add table'));
    }finally{setBusy(false);}
  };

  const removeTable=async()=>{
    try{
      await tablesAPI.remove(toDelete.id);
      setTables(prev=>prev.filter(t=>t.id!==toDelete.id));
      notifySuccess(t('setup.tableRemovedToast','Table {n} removed').replace('{n}',toDelete.number));
    }catch(err){
      notifyError(err?.response?.data?.error||t('setup.tableRemoveError','Could not remove table'));
    }
  };

  return(
    <div>
      <form onSubmit={addTable} className="flex gap-3" style={{alignItems:'flex-end',marginBottom:20,flexWrap:'wrap'}}>
        <div className="fgrp" style={{marginBottom:0,width:100}}>
          <label className="flbl" htmlFor="tbl-number">{t('setup.tableNumber','Number')}</label>
          <input id="tbl-number" type="number" className="finput" value={form.number} onChange={set('number')} required/>
        </div>
        <div className="fgrp" style={{marginBottom:0,width:100}}>
          <label className="flbl" htmlFor="tbl-capacity">{t('setup.tableSeats','Seats')}</label>
          <input id="tbl-capacity" type="number" min="1" className="finput" value={form.capacity} onChange={set('capacity')} required/>
        </div>
        <div className="fgrp" style={{marginBottom:0,width:140}}>
          <label className="flbl" htmlFor="tbl-zone">{t('setup.tableZone','Zone')}</label>
          <select id="tbl-zone" className="finput" value={form.zone} onChange={set('zone')}>
            <option value="indoor">{t('setup.tableZoneIndoor','Indoor')}</option>
            <option value="outdoor">{t('setup.tableZoneOutdoor','Outdoor')}</option>
            <option value="private">{t('setup.tableZonePrivate','Private')}</option>
          </select>
        </div>
        <button type="submit" className="btn btn-pr" disabled={busy}><Plus size={15}/> {t('setup.addTable','Add Table')}</button>
      </form>

      {tables.length===0?(
        <EmptyState icon={<Grid3X3 size={40} strokeWidth={1.5}/>} title={t('setup.tableNoneYetTitle','No tables yet')} subtitle={t('setup.tableNoneYetSubtitle','Add your first table above.')}/>
      ):(
        <table className="inv-table">
          <thead><tr><th>{t('setup.tableColumnTable','Table')}</th><th>{t('setup.tableSeats','Seats')}</th><th>{t('setup.tableZone','Zone')}</th><th>{t('common.status','Status')}</th><th></th></tr></thead>
          <tbody>
            {tables.map(t2=>(
              <tr key={t2.id}>
                <td style={{fontWeight:700}}>T{t2.number}</td>
                <td>{t2.capacity}</td>
                <td style={{textTransform:'capitalize'}}>{t2.zone}</td>
                <td><span className={`badge ${t2.status==='available'?'bg-jade':'bg-gray'}`}>{t2.status.replace('_',' ')}</span></td>
                <td>
                  <button className="tb-btn" style={{width:30,height:30}} aria-label={t('setup.tableRemoveAriaLabel','Remove table {n}').replace('{n}',t2.number)}
                    disabled={t2.status!=='available'} onClick={()=>setToDelete(t2)}>
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
        title={t('setup.tableRemoveDialogTitle','Remove this table?')}
        message={toDelete&&t('setup.tableRemoveDialogMessage','Table {n} will be permanently removed.').replace('{n}',toDelete.number)}
        confirmLabel={t('setup.tableRemoveConfirmLabel','Remove')}
      />
    </div>
  );
}
