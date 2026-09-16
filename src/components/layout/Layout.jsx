import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { LogOut, Bell, Menu as MenuIcon, MailWarning } from 'lucide-react';
import NewOrderToast from './NewOrderToast';
import UserMenu from './UserMenu';
import NotificationCenter from './NotificationCenter';
import logoLockupDark from '../../assets/brand/logo-lockup-dark.png';
import { NAV, PAGE_META, UNIVERSAL_ROUTES, routesForRole, landingFor } from '../../config/nav';
import { API_URL, authAPI } from '../../api';

const socket = io(API_URL);

export default function Layout(){
  const {user,logout}=useAuth();
  const {t}=useLanguage();
  const nav=useNavigate();
  const loc=useLocation();
  const [pendingOrders,setPendingOrders]=useState(0);
  const [time,setTime]=useState(new Date());
  const [sbOpen,setSbOpen]=useState(false);
  const [notifications,setNotifications]=useState([]);
  const [resendingVerify,setResendingVerify]=useState(false);
  const [verifySent,setVerifySent]=useState(false);

  const resendVerification=async()=>{
    setResendingVerify(true);
    try{
      await authAPI.resendVerification();
      setVerifySent(true);
      toast.success('Verification email sent');
    }catch(err){
      toast.error(err.response?.data?.error||'Could not send verification email');
    }finally{setResendingVerify(false);}
  };

  useEffect(()=>{
    const timerId=setInterval(()=>setTime(new Date()),60000);
    return()=>clearInterval(timerId);
  },[]);

  useEffect(()=>{ setSbOpen(false); },[loc.pathname]);

  useEffect(()=>{
    if(!sbOpen) return;
    const onKey=e=>{ if(e.key==='Escape') setSbOpen(false); };
    document.addEventListener('keydown',onKey);
    return()=>document.removeEventListener('keydown',onKey);
  },[sbOpen]);

  const pushNotification=(type,message)=>{
    setNotifications(p=>[{id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type,message,time:Date.now(),read:false},...p].slice(0,30));
  };
  const markAllNotificationsRead=useCallback(()=>{
    setNotifications(p=>p.map(n=>n.read?n:{...n,read:true}));
  },[]);
  const clearNotifications=useCallback(()=>setNotifications([]),[]);

  useEffect(()=>{
    socket.emit('join_role',user.role);
    socket.on('new_order',o=>{
      setPendingOrders(p=>p+1);
      toast.custom(()=><NewOrderToast order={o}/>,{duration:4000});
      pushNotification('order',t('chrome.newOrderNotif','New order — Table {n}').replace('{n}',o.table_number||o.channel||'—'));
    });
    socket.on('waiter_called',d=>{
      toast(`Table ${d.table_num} calling waiter!`,{icon:<Bell size={16} color="var(--crimson)"/>,duration:6000});
      pushNotification('call',t('chrome.waiterCalledNotif','Table {n} is calling a waiter').replace('{n}',d.table_num));
    });
    return()=>{socket.off('new_order');socket.off('waiter_called')};
  },[user.role,t]);

  const sections=NAV[user.role]||NAV.owner;
  const meta=PAGE_META[loc.pathname]||{title:loc.pathname.slice(1),sub:''};

  // Real route enforcement: NAV is the single source of truth for what a role can
  // reach — if the current path isn't one of this role's own links, bounce them to
  // their default landing instead of silently rendering a page they shouldn't see.
  if(!routesForRole(user.role).includes(loc.pathname) && !UNIVERSAL_ROUTES.includes(loc.pathname)){
    return <Navigate to={landingFor(user.role)} replace/>;
  }

  return(
    <div className="app-shell">
      <div className={`sb-backdrop${sbOpen?' open':''}`} onClick={()=>setSbOpen(false)}/>
      {/* ── SIDEBAR ── */}
      {/* Only `opacity` is animated here (not `x`) — framer-motion would otherwise set an
          inline `transform` that permanently overrides the CSS media-query transform used
          to show/hide this as an off-canvas drawer on tablet/mobile. */}
      <motion.aside className={`sidebar${sbOpen?' open':''}`}
        initial={{opacity:0}} animate={{opacity:1}}
        transition={{duration:.3}}>
        
        <div className="sb-logo">
          <motion.img src={logoLockupDark} alt="THAAALI" className="sb-logo-img"
            whileHover={{scale:1.04}}
            transition={{type:'spring',stiffness:400}}/>
        </div>

        <nav className="sb-nav">
          {sections.map(sec=>(
            <div key={sec.sect}>
              <div className="sb-sect">{t(sec.sectKey,sec.sect)}</div>
              {sec.links.map((lk,i)=>{
                const active=loc.pathname.startsWith(lk.to);
                const isOrders=lk.to==='/app/orders';
                return(
                  <motion.button key={lk.to} type="button"
                    className={`sb-link${active?' on':''}`}
                    aria-current={active?'page':undefined}
                    onClick={()=>{nav(lk.to);if(isOrders)setPendingOrders(0)}}
                    initial={{opacity:0,x:-20}}
                    animate={{opacity:1,x:0}}
                    transition={{delay:i*0.04+0.1}}
                    whileHover={{x:4}}
                    whileTap={{scale:.97}}>
                    <div className="sb-bar"/>
                    <span className="sb-icon" aria-hidden="true"><lk.Icon size={16}/></span>
                    {t(lk.labelKey,lk.label)}
                    {isOrders&&pendingOrders>0&&(
                      <motion.span className="sb-badge"
                        key={pendingOrders}
                        initial={{scale:0}} animate={{scale:1}}
                        transition={{type:'spring',stiffness:500}}>
                        {pendingOrders}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sb-foot">
          <div className="sb-user">
            <div className="sb-av">{user.avatar}</div>
            <div>
              <div className="sb-uname">{user.name}</div>
              <div className="sb-urole">{user.role.replace('_',' ')}</div>
            </div>
          </div>
          <motion.button type="button" className="sb-link" onClick={logout}
            style={{marginTop:4,color:'rgba(255,255,255,.3)'}}
            whileHover={{x:4,color:'rgba(255,255,255,.7)'}}>
            <span className="sb-icon" aria-hidden="true"><LogOut size={16}/></span>{t('common.signOut','Sign Out')}
          </motion.button>
        </div>
      </motion.aside>

      {/* ── MAIN ── */}
      <div className="main-area">
        {!user.emailVerified && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            flexWrap: 'wrap', padding: '9px 16px', fontSize: 12.5, fontWeight: 600,
            background: 'var(--amber-50)', color: '#92400e', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MailWarning size={14} />{t('chrome.verifyBannerText', 'Please verify your email address to secure your account.')}
            </span>
            <button type="button" className="btn btn-gh" style={{ padding: '3px 10px', fontSize: 11.5 }}
              onClick={resendVerification} disabled={resendingVerify || verifySent}>
              {verifySent ? t('profile.verificationSent', 'Sent') : t('chrome.verifyBannerCta', 'Resend email')}
            </button>
          </div>
        )}
        <motion.header className="topbar"
          initial={{y:-64}} animate={{y:0}}
          transition={{type:'spring',stiffness:300,damping:30,delay:.1}}>
          <div className="tb-l">
            <button className="sb-hamburger" onClick={()=>setSbOpen(o=>!o)} aria-label={t('chrome.toggleNav','Toggle navigation menu')}>
              <MenuIcon size={18}/>
            </button>
            <div className="tb-title-wrap">
              <h1 className="page-h">{t(meta.titleKey,meta.title)}</h1>
              {meta.sub&&<div className="page-sub">{t(meta.subKey,meta.sub)}</div>}
            </div>
          </div>
          <div className="tb-r">
            <div className="live-pill">
              <div className="live-dot"/><span className="live-label">{t('chrome.live','LIVE')}</span>
            </div>
            <div className="tb-clock">
              {time.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
            </div>
            <NotificationCenter notifications={notifications} onMarkAllRead={markAllNotificationsRead} onClear={clearNotifications}/>
            <UserMenu/>
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.main key={loc.pathname} className="page-wrap"
            initial={{opacity:0,y:16,filter:'blur(4px)'}}
            animate={{opacity:1,y:0,filter:'blur(0px)'}}
            exit={{opacity:0,y:-10,filter:'blur(2px)'}}
            transition={{duration:.25,ease:[.16,1,.3,1]}}>
            <Outlet context={{socket}}/>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
