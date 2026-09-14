import {useEffect,useState,useCallback} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {ordersAPI} from '../api';
import {useOutletContext} from 'react-router-dom';
import {
  UtensilsCrossed,Bike,MessageCircle,Globe,Phone,ClipboardList,
  Flame,CheckCircle,Check,ChefHat,AlertTriangle,FileText,Timer,RefreshCw,
} from 'lucide-react';
import {notifySuccess,notifyInfo} from '../lib/toast';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {useLanguage} from '../context/LanguageContext';

const elapsed=ts=>{
  const m=Math.floor((Date.now()-ts)/60000);
  return{text:m<60?`${m}m`:`${Math.floor(m/60)}h${m%60}m`,urgent:m>15,rushing:m>8};
};
const CH_ICON={dine_in:UtensilsCrossed,zomato:Bike,swiggy:Bike,whatsapp:MessageCircle,direct:Globe,phone:Phone};

function ChannelBadge({order,t}){
  if(order.table_id) return <>{t('kitchen.tableLabel','Table {n}').replace('{n}',order.table_number)}</>;
  const Icon=CH_ICON[order.channel]||ClipboardList;
  return <span className="flex gap-1"><Icon size={14}/> {order.channel}</span>;
}

export default function KDSPage(){
  const {socket}=useOutletContext();
  const {t}=useLanguage();
  const [orders,setOrders]=useState(null);
  const [filter,setFilter]=useState('all');
  const [,setTick]=useState(0);
  const FILTER_LABEL={
    all:t('kitchen.filterAll','All'), pending:t('kitchen.filterPending','Pending'),
    preparing:t('kitchen.filterPreparing','Preparing'), ready:t('kitchen.filterReady','Ready'),
  };

  const load=useCallback(()=>{ordersAPI.getActive().then(r=>setOrders(r.data));},[]);
  useEffect(()=>{load();},[load]);
  useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),60000);return()=>clearInterval(t);},[]);

  useEffect(()=>{
    if(!socket)return;
    socket.on('new_order',o=>{setOrders(p=>[o,...(p||[])]);notifyInfo(t('kitchen.newOrderNotify','New order!'));});
    socket.on('order_updated',o=>setOrders(p=>(p||[]).map(x=>x.id===o.id?o:x).filter(x=>['pending','preparing','ready'].includes(x.status))));
    return()=>{socket.off('new_order');socket.off('order_updated');};
  },[socket,t]);

  const upd=async(id,status)=>{
    await ordersAPI.updateStatus(id,status);
    if(status==='delivered') setOrders(p=>p.filter(o=>o.id!==id));
    else setOrders(p=>p.map(o=>o.id===id?{...o,status}:o));
    notifySuccess(status==='ready'?t('kitchen.orderReady','Order ready!'):status==='delivered'?t('kitchen.deliveredNotify','Delivered!'):t('kitchen.updated','Updated'));
  };

  if(orders===null) return <div className="kds-grid"><Skeleton variant="card" count={6}/></div>;

  const filtered=filter==='all'?orders:orders.filter(o=>o.status===filter);
  const counts={all:orders.length,pending:orders.filter(o=>o.status==='pending').length,
    preparing:orders.filter(o=>o.status==='preparing').length,ready:orders.filter(o=>o.status==='ready').length};

  const cardBorder={pending:'#FCD34D',preparing:'var(--saffron)',ready:'var(--jade)'};
  const hdBg={pending:'var(--amber-50)',preparing:'var(--saffron-50)',ready:'var(--jade-50)'};
  const hdColor={pending:'#92400e',preparing:'var(--saffron-dark)',ready:'var(--jade)'};

  return(
    <div>
      <div className="flex-between" style={{marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <div className="flex gap-3" style={{marginBottom:2}}>
            <span style={{fontFamily:'var(--font-d)',fontSize:20,fontWeight:800}}>{t('kitchen.title','Kitchen Display')}</span>
            {orders.length>0&&(
              <motion.div key={orders.length}
                initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:500}}
                style={{background:'var(--saffron)',color:'white',borderRadius:100,padding:'2px 10px',fontSize:12,fontWeight:800}}>
                {t('kitchen.activeCount','{n} active').replace('{n}',orders.length)}
              </motion.div>
            )}
          </div>
          <div style={{fontSize:12.5,color:'var(--muted)'}}>{t('kitchen.realtimeSubtitle','Real-time · Auto-updates every minute')}</div>
        </div>
        <div className="flex gap-2" style={{flexWrap:'wrap'}}>
          {['all','pending','preparing','ready'].map(s=>(
            <button key={s}
              className={`chip${filter===s?' on':''}`}
              style={filter===s&&s==='ready'?{background:'var(--jade)',borderColor:'var(--jade)',boxShadow:'var(--sh-jade)'}:
                     filter===s&&s==='pending'?{background:'var(--amber)',borderColor:'var(--amber)'}:{}}
              onClick={()=>setFilter(s)}>
              {FILTER_LABEL[s]} ({counts[s]||0})
            </button>
          ))}
          <button className="btn btn-sc btn-sm" onClick={load}><RefreshCw size={13}/> {t('common.refresh','Refresh')}</button>
        </div>
      </div>

      {orders.length===0?(
        <EmptyState
          icon={<ChefHat size={64} strokeWidth={1.5}/>}
          title={t('kitchen.kitchenClear','Kitchen is clear!')}
          subtitle={t('kitchen.noActiveOrdersSubtitle','No active orders. Enjoy the calm before the storm.')}
        />
      ):(
        <div className="kds-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map(order=>{
              const t=elapsed(order.created_at);
              return(
                <motion.div key={order.id}
                  className="kds-card"
                  style={{borderColor:cardBorder[order.status]||'var(--border)'}}
                  initial={{opacity:0,scale:.88,y:20}}
                  animate={{opacity:1,scale:1,y:0}}
                  exit={{opacity:0,scale:.85,x:-30}}
                  layout
                  transition={{type:'spring',stiffness:280,damping:24}}>
                  <div className="kds-hd" style={{background:hdBg[order.status]}}>
                    <div>
                      <div className="kds-table-lbl" style={{color:hdColor[order.status]}}>
                        <ChannelBadge order={order} t={t}/>
                      </div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>
                        {t('kitchen.itemsCount','{n} items').replace('{n}',order.items.length)} · #{order.id.slice(0,6).toUpperCase()}
                      </div>
                    </div>
                    <div className={`kds-time flex gap-1${t.urgent?' urgent':t.rushing?' rushing':''}`}>
                      <Timer size={13}/> {t.text}
                    </div>
                  </div>

                  <div className="kds-items">
                    {order.items.map((item,i)=>(
                      <div key={i} className="kds-row">
                        <span className="kds-qty">{item.qty}×</span>
                        <div style={{flex:1}}>
                          <div className="kds-name">{item.name}</div>
                          {item.spice&&item.spice!=='mild'&&<div className="kds-note flex gap-1"><Flame size={11}/> {item.spice}</div>}
                          {item.notes&&<div className="kds-note flex gap-1"><FileText size={11}/> {item.notes}</div>}
                          {(item.notes?.toLowerCase().includes('jain')||item.dietary?.includes('jain'))&&(
                            <div className="kds-allergen-tag flex gap-1"><AlertTriangle size={11}/> {t('kitchen.jainTag','JAIN — No onion/garlic/root veg')}</div>
                          )}
                        </div>
                        <div style={{fontSize:12,color:'var(--muted)',minWidth:50,textAlign:'right'}}>₹{item.price*item.qty}</div>
                      </div>
                    ))}
                  </div>

                  <div className="kds-actions">
                    {order.status==='pending'&&(
                      <motion.button className="btn btn-sm"
                        style={{flex:1,justifyContent:'center',background:'var(--saffron-50)',color:'var(--saffron-dark)',border:'1px solid rgba(255,107,0,.3)'}}
                        whileHover={{scale:1.02}} whileTap={{scale:.96}}
                        onClick={()=>upd(order.id,'preparing')}><Flame size={14}/> {t('kitchen.startCooking','Start Cooking')}</motion.button>
                    )}
                    {order.status==='preparing'&&(
                      <motion.button className="btn btn-su btn-sm"
                        style={{flex:1,justifyContent:'center'}}
                        whileHover={{scale:1.02}} whileTap={{scale:.96}}
                        onClick={()=>upd(order.id,'ready')}><CheckCircle size={14}/> {t('kitchen.markReady','Mark Ready')}</motion.button>
                    )}
                    {order.status==='ready'&&(
                      <motion.button className="btn btn-sm"
                        style={{flex:1,justifyContent:'center',background:'var(--jade)',color:'white',border:'none'}}
                        whileHover={{scale:1.02}} whileTap={{scale:.96}}
                        onClick={()=>upd(order.id,'delivered')}><Check size={14}/> {t('kitchen.delivered','Delivered')}</motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
