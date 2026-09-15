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
import {useLanguage} from '../context/LanguageContext';

const RC={owner:'bg-saffron',restaurant_manager:'bg-sky',hotel_manager:'bg-purple',waiter:'bg-jade',cashier:'bg-amber',kitchen:'bg-crimson',hotel_desk:'bg-purple'};
const MANAGE_ROLES=['owner','restaurant_manager','hotel_manager'];
const ROLE_BADGE_KEY={owner:'staff.roleBadgeOwner',restaurant_manager:'staff.roleBadgeRestaurantManager',hotel_manager:'staff.roleBadgeHotelManager',waiter:'staff.roleBadgeWaiter',cashier:'staff.roleBadgeCashier',kitchen:'staff.roleBadgeKitchen',hotel_desk:'staff.roleBadgeHotelDesk'};
const SHIFT_KEY={morning:'staff.shiftMorning',evening:'staff.shiftEvening',night:'staff.shiftNight'};
const EMPTY_FORM={name:'',email:'',password:'',role:'waiter',phone:'',shift:'morning',required_hours_per_day:8};

export default function StaffPage(){
  const {t}=useLanguage();
  const {user}=useAuth();
  const canManage=MANAGE_ROLES.includes(user.role);
  const {data:staff,setData:setStaff,loading}=useApiData(()=>staffAPI.getAll());
  const [modal,setModal]=useState(null); // null | 'create' | staff object being edited
  const [form,setForm]=useState(EMPTY_FORM);
  const [busy,setBusy]=useState(false);

  const ROLE_OPTIONS=[
    {value:'restaurant_manager',label:t('staff.roleRestaurantManager','Restaurant Manager')},
    {value:'hotel_manager',label:t('staff.roleHotelManager','Hotel Manager')},
    {value:'waiter',label:t('staff.roleWaiter','Waiter')},
    {value:'cashier',label:t('staff.roleCashier','Cashier')},
    {value:'kitchen',label:t('staff.roleKitchen','Kitchen')},
    {value:'hotel_desk',label:t('staff.roleHotelDesk','Hotel Desk')},
  ];
  const roleBadgeLabel=(role)=>t(ROLE_BADGE_KEY[role],role.replace('_',' '));
  const shiftLabel=(shift)=>t(SHIFT_KEY[shift],shift);

  const openCreate=()=>{setForm(EMPTY_FORM);setModal('create');};
  const openEdit=(s)=>{setForm({name:s.name,role:s.role,phone:s.phone||'',shift:s.shift,required_hours_per_day:s.required_hours_per_day??8}); setModal(s);};
  const set=(field)=>(e)=>setForm(f=>({...f,[field]:e.target.value}));

  const submit=async(e)=>{
    e.preventDefault();
    setBusy(true);
    try{
      const payload={...form,required_hours_per_day:Number(form.required_hours_per_day)||8};
      if(modal==='create'){
        const r=await staffAPI.create(payload);
        setStaff(prev=>[...prev,r.data]);
        toast.success(`${r.data.name} ${t('staff.addedAs','added as')} ${roleBadgeLabel(r.data.role)}`);
      }else{
        const r=await staffAPI.update(modal.id,{name:form.name,role:form.role,phone:form.phone,shift:form.shift,required_hours_per_day:payload.required_hours_per_day});
        setStaff(prev=>prev.map(s=>s.id===r.data.id?r.data:s));
        toast.success(t('staff.staffUpdated','Staff member updated'));
      }
      setModal(null);
    }catch(err){
      toast.error(err?.response?.data?.error||t('staff.somethingWrong','Something went wrong'));
    }finally{setBusy(false);}
  };

  const toggleStatus=async(s)=>{
    try{
      const r=await staffAPI.updateStatus(s.id,s.status==='active'?'inactive':'active');
      setStaff(prev=>prev.map(x=>x.id===r.data.id?r.data:x));
      toast.success(`${r.data.name} marked ${r.data.status==='active'?t('staff.statusActiveLower','active'):t('staff.statusInactiveLower','inactive')}`);
    }catch{
      toast.error(t('staff.statusUpdateFailed','Could not update status'));
    }
  };

  if(loading) return <div className="staff-grid"><Skeleton variant="card" count={6}/></div>;

  return(
    <div>
      <div className="flex-between" style={{marginBottom:20}}>
        <div style={{fontSize:13,color:'var(--muted)'}}>
          {t('staff.onShift','{n} on shift').replace('{n}',staff.filter(s=>s.status==='active').length)} · {t('staff.totalCount','{n} total').replace('{n}',staff.length)}
        </div>
        {canManage&&(
          <button className="btn btn-pr btn-sm" onClick={openCreate}>
            <Plus size={14}/> {t('staff.addStaff','Add Staff')}
          </button>
        )}
      </div>

      {staff.length===0?(
        <EmptyState
          title={t('staff.noStaffYet','No staff yet')}
          subtitle={canManage?t('staff.addFirstMember','Add your first team member to get started.'):t('staff.noStaffAdded','No staff members have been added yet.')}
          action={canManage&&<button className="btn btn-pr" onClick={openCreate}><Plus size={14}/> {t('staff.addStaff','Add Staff')}</button>}
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
                    <span className={`badge ${RC[s.role]||'bg-gray'}`}>{roleBadgeLabel(s.role)}</span>
                    <span className={`badge ${s.status==='active'?'bg-jade':'bg-gray'}`}>
                      {s.status==='active'?t('staff.onShiftBadge','On shift'):t('staff.offShiftBadge','Off shift')}
                    </span>
                  </div>
                </div>
                {canManage&&(
                  <div className="flex gap-1">
                    <button className="tb-btn" style={{width:30,height:30}} onClick={()=>openEdit(s)} aria-label={t('staff.editAriaLabel','Edit {name}').replace('{name}',s.name)}>
                      <Pencil size={13}/>
                    </button>
                    <button className="tb-btn" style={{width:30,height:30}} onClick={()=>toggleStatus(s)} aria-label={t('staff.toggleAriaLabel',"Toggle {name}'s shift status").replace('{name}',s.name)}>
                      <Power size={13}/>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-1" style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)',fontSize:12.5,color:'var(--muted)'}}>
                <Phone size={12}/> {s.phone||'—'} · {shiftLabel(s.shift)} {t('staff.shiftSuffix','shift')} · {t('staff.requiredHoursShort','{h}h/day required').replace('{h}',s.required_hours_per_day??8)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={()=>setModal(null)}
        title={modal==='create'?t('staff.addStaffMember','Add Staff Member'):t('staff.editStaffMember','Edit Staff Member')}
        footer={
          <>
            <button className="btn btn-sc" onClick={()=>setModal(null)}>{t('common.cancel','Cancel')}</button>
            <button className="btn btn-pr" form="staff-form" type="submit" disabled={busy}>
              {busy?t('staff.saving','Saving…'):modal==='create'?t('staff.addStaff','Add Staff'):t('staff.saveChanges','Save Changes')}
            </button>
          </>
        }
      >
        <form id="staff-form" onSubmit={submit}>
          <div className="fgrp">
            <label className="flbl" htmlFor="staff-name">{t('common.name','Name')}</label>
            <input id="staff-name" className="finput" value={form.name} onChange={set('name')} required/>
          </div>
          {modal==='create'&&(
            <>
              <div className="fgrp">
                <label className="flbl" htmlFor="staff-email">{t('common.email','Email')}</label>
                <input id="staff-email" className="finput" type="email" value={form.email} onChange={set('email')} required/>
              </div>
              <div className="fgrp">
                <label className="flbl" htmlFor="staff-password">{t('staff.temporaryPassword','Temporary password')}</label>
                <input id="staff-password" className="finput" type="password" value={form.password} onChange={set('password')}
                  placeholder={t('staff.passwordPlaceholder','At least 8 characters')} required/>
              </div>
            </>
          )}
          <div className="grid-2 gap-3">
            <div className="fgrp">
              <label className="flbl" htmlFor="staff-role">{t('staff.role','Role')}</label>
              <select id="staff-role" className="finput" value={form.role} onChange={set('role')}>
                {ROLE_OPTIONS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="fgrp">
              <label className="flbl" htmlFor="staff-shift">{t('staff.shift','Shift')}</label>
              <select id="staff-shift" className="finput" value={form.shift} onChange={set('shift')}>
                <option value="morning">{t('staff.shiftOptionMorning','Morning')}</option>
                <option value="evening">{t('staff.shiftOptionEvening','Evening')}</option>
                <option value="night">{t('staff.shiftOptionNight','Night')}</option>
              </select>
            </div>
          </div>
          <div className="grid-2 gap-3">
            <div className="fgrp">
              <label className="flbl" htmlFor="staff-phone">{t('common.phone','Phone')}</label>
              <input id="staff-phone" className="finput" value={form.phone} onChange={set('phone')} placeholder="9876543210"/>
            </div>
            <div className="fgrp">
              <label className="flbl" htmlFor="staff-required-hours">{t('staff.requiredHoursPerDay','Required hours/day')}</label>
              <input id="staff-required-hours" className="finput" type="number" min="0" max="24" step="0.5"
                value={form.required_hours_per_day} onChange={set('required_hours_per_day')}/>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
