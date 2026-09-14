import {useState} from 'react';
import {motion} from 'framer-motion';
import {BedDouble,CheckCircle2,Sparkles,Wallet,User,Phone,DoorOpen,Key,ArrowLeft,Building2} from 'lucide-react';
import {hotelAPI} from '../api';
import {notifySuccess,notifyError} from '../lib/toast';
import {useApiData} from '../lib/useApiData';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {useLanguage} from '../context/LanguageContext';

const RSC={
  occupied:{bg:'rgba(255,107,0,.1)',border:'rgba(255,107,0,.3)',color:'var(--saffron-dark)',labelKey:'hotel.statusOccupied',labelFallback:'Occupied'},
  available:{bg:'rgba(15,122,69,.1)',border:'rgba(15,122,69,.3)',color:'var(--jade)',labelKey:'hotel.statusAvailable',labelFallback:'Available'},
  dirty:{bg:'rgba(245,158,11,.1)',border:'rgba(245,158,11,.3)',color:'#92400e',labelKey:'hotel.statusCleaning',labelFallback:'Cleaning'},
  inspecting:{bg:'rgba(124,58,237,.1)',border:'rgba(124,58,237,.3)',color:'var(--purple)',labelKey:'hotel.statusInspecting',labelFallback:'Inspecting'},
};

const TYPE_LABELS={
  all:{key:'hotel.roomTypeAll',fallback:'All'},
  standard:{key:'hotel.roomTypeStandard',fallback:'Standard'},
  deluxe:{key:'hotel.roomTypeDeluxe',fallback:'Deluxe'},
  suite:{key:'hotel.roomTypeSuite',fallback:'Suite'},
  presidential:{key:'hotel.roomTypePresidential',fallback:'Presidential'},
};

const EMPTY_CHECKIN={guest_name:'',phone:'',check_in:new Date().toISOString().slice(0,10)};

export default function HotelPage(){
  const {t}=useLanguage();
  const {data:rooms,setData:setRooms,loading:roomsLoading}=useApiData(()=>hotelAPI.getRooms());
  const {data:stats}=useApiData(()=>hotelAPI.getStats());
  const {data:reservations}=useApiData(()=>hotelAPI.getReservations());
  const [sel,setSel]=useState(null);
  const [zone,setZone]=useState('all');
  const [checkinMode,setCheckinMode]=useState(false);
  const [checkinForm,setCheckinForm]=useState(EMPTY_CHECKIN);
  const [busy,setBusy]=useState(false);

  if(roomsLoading) return <div className="room-grid"><Skeleton variant="card" count={10}/></div>;

  const statusLabel=status=>{
    const cfg=RSC[status];
    return cfg?t(cfg.labelKey,cfg.labelFallback):status;
  };

  const filtered=zone==='all'?rooms:rooms.filter(r=>r.type.toLowerCase()===zone);

  const openRoom=room=>{setSel(room);setCheckinMode(false);setCheckinForm(EMPTY_CHECKIN);};

  const upd=async(room,status)=>{
    const r=await hotelAPI.updateRoom(room.id,{status});
    setRooms(p=>p.map(x=>x.id===room.id?r.data:x));
    notifySuccess(t('hotel.roomStatusChanged','Room {number} → {status}').replace('{number}',room.number).replace('{status}',statusLabel(status)));
    setSel(null);
  };
  const checkout=async room=>{
    const r=await hotelAPI.checkOut(room.id);
    setRooms(p=>p.map(x=>x.id===room.id?r.data:x));
    notifySuccess(t('hotel.roomCheckedOut','Room {number} checked out').replace('{number}',room.number));
    setSel(null);
  };
  const submitCheckin=async e=>{
    e.preventDefault();
    setBusy(true);
    try{
      const r=await hotelAPI.checkIn({room_id:sel.id,guest_name:checkinForm.guest_name,phone:checkinForm.phone,check_in:checkinForm.check_in});
      setRooms(p=>p.map(x=>x.id===sel.id?r.data:x));
      notifySuccess(t('hotel.guestCheckedIn','{guest} checked into Room {number}').replace('{guest}',checkinForm.guest_name).replace('{number}',sel.number));
      setSel(null);
    }catch{
      notifyError(t('hotel.checkInFailed','Check-in failed'));
    }finally{setBusy(false);}
  };

  const types=['all','standard','deluxe','suite','presidential'];

  return(
    <div>
      {stats&&(
        <div className="kpi-grid" style={{marginBottom:20}}>
          {[
            {label:t('hotel.statusOccupied','Occupied'),value:`${stats.occupied}/${stats.total}`,Icon:BedDouble,color:'var(--saffron)',glow:'rgba(255,107,0,.07)'},
            {label:t('hotel.statusAvailable','Available'),value:stats.available,Icon:CheckCircle2,color:'var(--jade)',glow:'rgba(15,122,69,.07)'},
            {label:t('hotel.needCleaning','Need Cleaning'),value:stats.dirty,Icon:Sparkles,color:'var(--amber)',glow:'rgba(245,158,11,.07)'},
            {label:t('hotel.todayRevenue','Today Revenue'),value:`₹${stats.today_revenue?.toLocaleString('en-IN')}`,Icon:Wallet,color:'var(--purple)',glow:'rgba(124,58,237,.06)'},
          ].map((k,i)=>(
            <motion.div key={i} className="kpi" style={{'--glow-c':k.glow}}
              initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}>
              <div className="kpi-stripe" style={{background:k.color}}/>
              <div className="kpi-lbl">{k.label}</div>
              <div className="kpi-val">{k.value}</div>
              <k.Icon size={32} className="kpi-ico" style={{color:k.color}}/>
            </motion.div>
          ))}
        </div>
      )}
      <div className="filter-bar">
        {types.map(ty=>(
          <button key={ty} className={`chip${zone===ty?' on':''}`} onClick={()=>setZone(ty)}>
            {t(TYPE_LABELS[ty].key,TYPE_LABELS[ty].fallback)}
          </button>
        ))}
      </div>
      <div className="grid-2" style={{gridTemplateColumns:'1fr 300px',gap:20}}>
        <div>
          <div style={{fontSize:11,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:14}}>{t('hotel.roomGrid','Room Grid')}</div>
          {filtered.length===0?(
            <EmptyState icon={<Building2 size={48} strokeWidth={1.5}/>} title={t('hotel.noRoomsOfType','No rooms of this type')}/>
          ):(
            <div className="room-grid">
              {filtered.map((room,i)=>{
                const sc=RSC[room.status]||RSC.available;
                return(
                  <motion.button key={room.id} type="button" className="room-card"
                    style={{background:sc.bg,borderColor:sc.border,textAlign:'left'}}
                    onClick={()=>openRoom(room)}
                    initial={{opacity:0,scale:.88}} animate={{opacity:1,scale:1}} transition={{delay:i*.04,type:'spring',stiffness:280,damping:22}}
                    whileHover={{scale:1.05,boxShadow:'var(--sh-md)'}}>
                    <div className="room-num" style={{color:sc.color}}>#{room.number}</div>
                    <div className="room-type-lbl">{room.type} · {t('hotel.floorNum','Floor {n}').replace('{n}',room.floor)}</div>
                    <span className="badge" style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,marginBottom:6}}>{statusLabel(room.status)}</span>
                    {room.guest&&<div className="room-guest-name flex gap-1"><User size={11}/> {room.guest}</div>}
                    <div style={{fontSize:11,color:'var(--muted)',marginTop:4}}>{t('hotel.perNight','₹{amount}/night').replace('{amount}',room.rate.toLocaleString('en-IN'))}</div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:14}}>{t('hotel.upcomingArrivals','Upcoming Arrivals')}</div>
          <div className="stack gap-2">
            {(reservations||[]).length===0&&<div style={{fontSize:13,color:'var(--muted)'}}>{t('hotel.noUpcomingReservations','No upcoming reservations.')}</div>}
            {(reservations||[]).map(res=>(
              <motion.div key={res.id} className="card" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}}>
                <div style={{padding:16}}>
                  <div className="flex-between" style={{marginBottom:6}}>
                    <div style={{fontSize:13.5,fontWeight:700}}>{res.guest_name}</div>
                    <span className="badge bg-jade">{res.status}</span>
                  </div>
                  <div style={{fontSize:12.5,color:'var(--slate)'}}>{res.room_type} · {res.guests} {res.guests>1?t('hotel.guestPlural','guests'):t('hotel.guestSingular','guest')}</div>
                  <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{res.check_in} → {res.check_out}</div>
                  <div className="flex gap-1" style={{fontSize:12,color:'var(--muted)'}}><Phone size={11}/> {res.phone}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?t('hotel.roomModalTitle','Room {number} — {type}').replace('{number}',sel.number).replace('{type}',sel.type):''}>
        {sel&&(checkinMode?(
          <form onSubmit={submitCheckin}>
            <div className="fgrp">
              <label className="flbl" htmlFor="ci-name">{t('hotel.guestNameLabel','Guest name')}</label>
              <input id="ci-name" className="finput" value={checkinForm.guest_name}
                onChange={e=>setCheckinForm(f=>({...f,guest_name:e.target.value}))} required/>
            </div>
            <div className="fgrp">
              <label className="flbl" htmlFor="ci-phone">{t('common.phone','Phone')}</label>
              <input id="ci-phone" className="finput" value={checkinForm.phone}
                onChange={e=>setCheckinForm(f=>({...f,phone:e.target.value}))} placeholder="9876543210" required/>
            </div>
            <div className="fgrp">
              <label className="flbl" htmlFor="ci-date">{t('hotel.checkInDateLabel','Check-in date')}</label>
              <input id="ci-date" type="date" className="finput" value={checkinForm.check_in}
                onChange={e=>setCheckinForm(f=>({...f,check_in:e.target.value}))} required/>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn btn-sc" onClick={()=>setCheckinMode(false)}><ArrowLeft size={14}/> {t('common.back','Back')}</button>
              <button type="submit" className="btn btn-pr" style={{flex:1,justifyContent:'center'}} disabled={busy}>
                <Key size={15}/> {busy?t('hotel.checkingIn','Checking in…'):t('hotel.confirmCheckIn','Confirm Check-In')}
              </button>
            </div>
          </form>
        ):(
          <>
            <div className="grid-2 gap-3" style={{marginBottom:20}}>
              {[[t('common.status','Status'),statusLabel(sel.status)],[t('hotel.rate','Rate'),t('hotel.perNight','₹{amount}/night').replace('{amount}',sel.rate?.toLocaleString('en-IN'))],
                sel.guest&&[t('hotel.guestLabel','Guest'),sel.guest],sel.check_out&&[t('hotel.checkOutFieldLabel','Check-out'),sel.check_out]].filter(Boolean).map(([k,v])=>(
                <div key={k} style={{background:'var(--surface)',borderRadius:'var(--r-sm)',padding:14}}>
                  <div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>{k.toUpperCase()}</div>
                  <div style={{fontWeight:700,fontSize:13.5}}>{v}</div>
                </div>
              ))}
            </div>
            <div className="stack gap-2">
              {sel.status==='occupied'&&<button className="btn btn-da" style={{justifyContent:'center'}} onClick={()=>checkout(sel)}><DoorOpen size={15}/> {t('hotel.checkOut','Check Out')}</button>}
              {sel.status==='dirty'&&<button className="btn btn-sc" style={{justifyContent:'center'}} onClick={()=>upd(sel,'inspecting')}><Sparkles size={15}/> {t('hotel.startInspection','Start Inspection')}</button>}
              {sel.status==='inspecting'&&<button className="btn btn-su" style={{justifyContent:'center'}} onClick={()=>upd(sel,'available')}><CheckCircle2 size={15}/> {t('hotel.markAvailable','Mark Available')}</button>}
              {sel.status==='available'&&<button className="btn btn-pr" style={{justifyContent:'center'}} onClick={()=>setCheckinMode(true)}><Key size={15}/> {t('hotel.checkInGuest','Check In Guest')}</button>}
            </div>
          </>
        ))}
      </Modal>
    </div>
  );
}
