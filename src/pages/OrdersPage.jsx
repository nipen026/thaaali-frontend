import {useEffect,useState} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {ordersAPI} from '../api';
import {useOutletContext} from 'react-router-dom';
import {UtensilsCrossed,Bike,MessageCircle,Globe,Phone,ClipboardList} from 'lucide-react';
import {useApiData} from '../lib/useApiData';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {formatQty} from '../lib/formatQty';
import {useLanguage} from '../context/LanguageContext';

const SB={pending:'bg-amber',preparing:'bg-saffron',ready:'bg-jade',delivered:'bg-gray',billed:'bg-gray'};
const CH={dine_in:UtensilsCrossed,zomato:Bike,swiggy:Bike,whatsapp:MessageCircle,direct:Globe,phone:Phone};

export default function OrdersPage(){
  const {socket}=useOutletContext();
  const {t}=useLanguage();
  const {data:orders,setData:setOrders,loading}=useApiData(()=>ordersAPI.getAll());
  const [filter,setFilter]=useState('active');
  const FILTER_LABEL={
    active:t('orders.filterActive','Active'), all:t('orders.filterAll','All'),
    pending:t('orders.statusPending','Pending'), preparing:t('orders.statusPreparing','Preparing'),
    ready:t('orders.statusReady','Ready'), delivered:t('orders.statusDelivered','Delivered'), billed:t('orders.statusBilled','Billed'),
  };

  useEffect(()=>{
    if(!socket)return;
    socket.on('new_order',o=>setOrders(p=>[o,...(p||[])]));
    socket.on('order_updated',o=>setOrders(p=>(p||[]).map(x=>x.id===o.id?o:x)));
    return()=>{socket.off('new_order');socket.off('order_updated')};
  },[socket,setOrders]);

  if(loading) return <div className="stack gap-3"><Skeleton variant="row" count={6}/></div>;

  const filtered=orders.filter(o=>filter==='active'?['pending','preparing','ready'].includes(o.status):filter==='all'?true:o.status===filter);

  return(
    <div>
      <div className="flex-between" style={{marginBottom:16,flexWrap:'wrap',gap:12}}>
        <div style={{fontSize:13,color:'var(--muted)'}}>{t('orders.activeTotalSummary','{active} active · {total} total').replace('{active}',orders.filter(o=>['pending','preparing','ready'].includes(o.status)).length).replace('{total}',orders.length)}</div>
      </div>
      <div className="filter-bar">
        {['active','all','pending','preparing','ready','delivered','billed'].map(s=>(
          <button key={s} className={`chip${filter===s?' on':''}`} onClick={()=>setFilter(s)}>{FILTER_LABEL[s]}</button>
        ))}
      </div>
      <div className="stack gap-2">
        <AnimatePresence>
          {filtered.map((o,i)=>{
            const Icon=CH[o.channel]||ClipboardList;
            return(
              <motion.div key={o.id} className="card"
                initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                transition={{delay:i*.03}}>
                <div className="flex gap-4" style={{padding:'13px 20px',flexWrap:'wrap'}}>
                  <Icon size={22} style={{color:'var(--slate)',flexShrink:0}}/>
                  <div style={{flex:1,minWidth:120}}>
                    <div style={{fontSize:13.5,fontWeight:700}}>{o.table_id?t('orders.tableLabel','Table {n}').replace('{n}',o.table_number):(o.channel||t('orders.orderFallback','Order'))}</div>
                    <div style={{fontSize:11.5,color:'var(--muted)'}}>#{o.id.slice(0,8).toUpperCase()} · {t('orders.itemsCount','{n} items').replace('{n}',o.items.length)}</div>
                  </div>
                  <div className="flex gap-1" style={{flexWrap:'wrap'}}>
                    {o.items.slice(0,3).map((it,i)=>(
                      <span key={i} style={{fontSize:12,color:'var(--slate)',background:'var(--surface)',padding:'2px 8px',borderRadius:4,border:'1px solid var(--border)'}}>{formatQty(it.qty,it.unit)} {it.name}</span>
                    ))}
                    {o.items.length>3&&<span style={{fontSize:12,color:'var(--muted)'}}>{t('orders.moreItems','+{n} more').replace('{n}',o.items.length-3)}</span>}
                  </div>
                  <div style={{textAlign:'right',minWidth:80}}>
                    <div style={{fontFamily:'var(--font-d)',fontWeight:800,color:'var(--saffron)'}}>₹{o.total}</div>
                    <span className={`badge ${SB[o.status]||'bg-gray'}`} style={{marginTop:4}}>{FILTER_LABEL[o.status]||o.status}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length===0&&(
          <EmptyState icon={<ClipboardList size={48} strokeWidth={1.5}/>} title={t('orders.noOrdersOfType','No {type} orders').replace('{type}',(FILTER_LABEL[filter]||filter).toLowerCase())}/>
        )}
      </div>
    </div>
  );
}
