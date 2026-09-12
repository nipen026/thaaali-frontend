import {useState} from 'react';
import {motion} from 'framer-motion';
import {Phone, Plus, Power, Pencil} from 'lucide-react';
import toast from 'react-hot-toast';
import {staffAPI} from '../api';
import {useAuth} from '../context/AuthContext';
import {useApiData} from '../lib/useApiData';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const RC={owner:'bg-saffron',restaurant_manager:'bg-sky',hotel_manager:'bg-purple',waiter:'bg-jade',cashier:'bg-amber',kitchen:'bg-crimson',hotel_desk:'bg-purple'};
const MANAGE_ROLES=['owner','restaurant_manager','hotel_manager'];
const ROLE_OPTIONS=[
  {value:'restaurant_manager',label:'Restaurant Manager'},
  {value:'hotel_manager',label:'Hotel Manager'},
  {value:'waiter',label:'Waiter'},
  {value:'cashier',label:'Cashier'},
  {value:'kitchen',label:'Kitchen'},
  {value:'hotel_desk',label:'Hotel Desk'},
];
const EMPTY_FORM={name:'',email:'',password:'',role:'waiter',phone:'',shift:'morning'};

export default function StaffPage(){
  const {user}=useAuth();
  const canManage=MANAGE_ROLES.includes(user.role);
  const {data:staff,setData:setStaff,loading}=useApiData(()=>staffAPI.getAll());
  const [modal,setModal]=useState(null); // null | 'create' | staff object being edited
  const [form,setForm]=useState(EMPTY_FORM);
  const [busy,setBusy]=useState(false);

  const openCreate=()=>{setForm(EMPTY_FORM);setModal('create');};
  const openEdit=(s)=>{setForm({name:s.name,role:s.role,phone:s.phone||'',shift:s.shift}); setModal(s);};
  const set=(field)=>(e)=>setForm(f=>({...f,[field]:e.target.value}));

  const submit=async(e)=>{
    e.preventDefault();
    setBusy(true);
    try{
      if(modal==='create'){
        const r=await staffAPI.create(form);
        setStaff(prev=>[...prev,r.data]);
        toast.success(`${r.data.name} added as ${r.data.role.replace('_',' ')}`);
      }else{
        const r=await staffAPI.update(modal.id,{name:form.name,role:form.role,phone:form.phone,shift:form.shift});
        setStaff(prev=>prev.map(s=>s.id===r.data.id?r.data:s));
        toast.success('Staff member updated');
      }
      setModal(null);
    }catch(err){
      toast.error(err?.response?.data?.error||'Something went wrong');
    }finally{setBusy(false);}
  };

  const toggleStatus=async(s)=>{
    try{
      const r=await staffAPI.updateStatus(s.id,s.status==='active'?'inactive':'active');
      setStaff(prev=>prev.map(x=>x.id===r.data.id?r.data:x));
      toast.success(`${r.data.name} marked ${r.data.status}`);
    }catch{
      toast.error('Could not update status');
    }
  };

  if(loading) return <div className="staff-grid"><Skeleton variant="card" count={6}/></div>;

  return(
    <div>
      <div className="flex-between" style={{marginBottom:20}}>
        <div style={{fontSize:13,color:'var(--muted)'}}>
          {staff.filter(s=>s.status==='active').length} on shift · {staff.length} total
        </div>
        {canManage&&(
          <button className="btn btn-pr btn-sm" onClick={openCreate}>
            <Plus size={14}/> Add Staff
          </button>
        )}
      </div>

      {staff.length===0?(
        <EmptyState
          title="No staff yet"
          subtitle={canManage?'Add your first team member to get started.':'No staff members have been added yet.'}
          action={canManage&&<button className="btn btn-pr" onClick={openCreate}><Plus size={14}/> Add Staff</button>}
        />
      ):(
        <div className="staff-grid">
          {staff.map((s,i)=>(
            <motion.div key={s.id} className="staff-card"
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.05}}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:50,height:50,borderRadius:'50%',
                  background:`linear-gradient(135deg,var(--saffron),#FF9340)`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:16,fontWeight:800,color:'white',flexShrink:0,
                  boxShadow:'0 4px 14px var(--saffron-glow)'}}>
                  {s.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14.5,fontWeight:700,marginBottom:4}}>{s.name}</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    <span className={`badge ${RC[s.role]||'bg-gray'}`}>{s.role.replace('_',' ')}</span>
                    <span className={`badge ${s.status==='active'?'bg-jade':'bg-gray'}`}>
                      {s.status==='active'?'On shift':'Off shift'}
                    </span>
                  </div>
                </div>
                {canManage&&(
                  <div className="flex gap-1">
                    <button className="tb-btn" style={{width:30,height:30}} onClick={()=>openEdit(s)} aria-label={`Edit ${s.name}`}>
                      <Pencil size={13}/>
                    </button>
                    <button className="tb-btn" style={{width:30,height:30}} onClick={()=>toggleStatus(s)} aria-label={`Toggle ${s.name}'s shift status`}>
                      <Power size={13}/>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-1" style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)',fontSize:12.5,color:'var(--muted)'}}>
                <Phone size={12}/> {s.phone||'—'} · {s.shift} shift
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={()=>setModal(null)}
        title={modal==='create'?'Add Staff Member':'Edit Staff Member'}
        footer={
          <>
            <button className="btn btn-sc" onClick={()=>setModal(null)}>Cancel</button>
            <button className="btn btn-pr" form="staff-form" type="submit" disabled={busy}>
              {busy?'Saving…':modal==='create'?'Add Staff':'Save Changes'}
            </button>
          </>
        }
      >
        <form id="staff-form" onSubmit={submit}>
          <div className="fgrp">
            <label className="flbl" htmlFor="staff-name">Name</label>
            <input id="staff-name" className="finput" value={form.name} onChange={set('name')} required/>
          </div>
          {modal==='create'&&(
            <>
              <div className="fgrp">
                <label className="flbl" htmlFor="staff-email">Email</label>
                <input id="staff-email" className="finput" type="email" value={form.email} onChange={set('email')} required/>
              </div>
              <div className="fgrp">
                <label className="flbl" htmlFor="staff-password">Temporary password</label>
                <input id="staff-password" className="finput" type="password" value={form.password} onChange={set('password')}
                  placeholder="At least 8 characters" required/>
              </div>
            </>
          )}
          <div className="grid-2 gap-3">
            <div className="fgrp">
              <label className="flbl" htmlFor="staff-role">Role</label>
              <select id="staff-role" className="finput" value={form.role} onChange={set('role')}>
                {ROLE_OPTIONS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="fgrp">
              <label className="flbl" htmlFor="staff-shift">Shift</label>
              <select id="staff-shift" className="finput" value={form.shift} onChange={set('shift')}>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>
          <div className="fgrp">
            <label className="flbl" htmlFor="staff-phone">Phone</label>
            <input id="staff-phone" className="finput" value={form.phone} onChange={set('phone')} placeholder="9876543210"/>
          </div>
        </form>
      </Modal>
    </div>
  );
}
