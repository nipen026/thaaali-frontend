import {useEffect,useState} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {tablesAPI,ordersAPI,menuAPI} from '../api';
import {useOutletContext,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {Flame,Receipt,Minus,Plus,ArrowLeft,Grid3X3,Pencil,Save} from 'lucide-react';
import {notifySuccess,notifyError} from '../lib/toast';
import {useApiData} from '../lib/useApiData';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const SC={
  available:{cls:'ts-available',label:'Available',dot:'#0F7A45'},
  occupied:{cls:'ts-occupied',label:'Occupied',dot:'#FF6B00'},
  bill_requested:{cls:'ts-bill',label:'Bill!',dot:'#C0392B'},
  reserved:{cls:'ts-reserved',label:'Reserved',dot:'#1565C0'},
};
const elapsed=ts=>{if(!ts)return'';const m=Math.floor((Date.now()-ts)/60000);return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60}m`;};

export default function TablesPage(){
  const {socket}=useOutletContext();
  const {user}=useAuth();
  const navigate=useNavigate();
  const {data:tables,setData:setTables,loading}=useApiData(()=>tablesAPI.getAll());
  const {data:menu}=useApiData(async()=>{const r=await menuAPI.getAll({available:true});return{data:r.data.items};});
  const [sel,setSel]=useState(null);
  const [orders,setOrders]=useState([]);
  const [cart,setCart]=useState([]);
  const [view,setView]=useState('detail'); // detail | order
  const [editingOrder,setEditingOrder]=useState(null); // null = building a new order; else the order being edited
  const [saving,setSaving]=useState(false);
  const [zone,setZone]=useState('all');
  const [,setTick]=useState(0);

  useEffect(()=>{
    const t=setInterval(()=>setTick(x=>x+1),30000);
    return()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    if(!socket)return;
    socket.on('table_updated',t=>setTables(p=>p.map(x=>x.id===t.id?t:x)));
    return()=>socket.off('table_updated');
  },[socket,setTables]);

  const pick=async tbl=>{
    setSel(tbl);setCart([]);setView('detail');setEditingOrder(null);
    if(tbl.status!=='available'){
      const r=await ordersAPI.getAll({table_id:tbl.id});
      setOrders(r.data.filter(o=>o.status!=='billed'));
    }else setOrders([]);
  };

  const startNewOrder=()=>{setEditingOrder(null);setCart([]);setView('order');};
  const startEditOrder=order=>{
    setEditingOrder(order);
    setCart(order.items.map(it=>({item_id:it.item_id,menu_id:it.menu_id,name:it.name,price:it.price,qty:it.qty,spice:it.spice,notes:it.notes})));
    setView('order');
  };
  const backToDetail=()=>{setView('detail');setEditingOrder(null);setCart([]);};

  const addToCart=item=>{
    setCart(p=>{
      const ex=p.find(c=>c.menu_id===item.id);
      return ex?p.map(c=>c.menu_id===item.id?{...c,qty:c.qty+1}:c)
        :[...p,{menu_id:item.id,name:item.name,price:item.price,qty:1,spice:item.spice,notes:''}];
    });
  };
  const removeFromCart=id=>setCart(p=>{const e=p.find(c=>c.menu_id===id);return e?.qty>1?p.map(c=>c.menu_id===id?{...c,qty:c.qty-1}:c):p.filter(c=>c.menu_id!==id)});

  const refreshTableOrders=async()=>{
    const r=await ordersAPI.getAll({table_id:sel.id});
    setOrders(r.data.filter(o=>o.status!=='billed'));
  };

  const saveOrder=async()=>{
    if(!cart.length)return notifyError('Cart is empty');
    setSaving(true);
    try{
      if(editingOrder){
        await ordersAPI.updateItems(editingOrder.id,cart);
        notifySuccess('Order updated');
      }else{
        await ordersAPI.create({table_id:sel.id,channel:'dine_in',items:cart});
        if(sel.status==='available'){
          const r=await tablesAPI.seat(sel.id,{guests:2,waiter:user?.id});
          setTables(p=>p.map(t=>t.id===sel.id?r.data:t));setSel(r.data);
        }
        notifySuccess('KOT fired to kitchen!');
      }
      backToDetail();
      await refreshTableOrders();
    }catch(err){
      notifyError(err?.response?.data?.error||'Could not save order');
    }finally{setSaving(false);}
  };

  const goToBilling=()=>{
    setSel(null);
    navigate(`/app/billing?table=${sel.id}`);
  };

  if(loading) return <div className="floor-grid"><Skeleton variant="card" count={12}/></div>;

  const zones=['all','indoor','outdoor','private'];
  const filtered=zone==='all'?tables:tables.filter(t=>t.zone===zone);

  return(
    <div>
      <div className="flex-between" style={{marginBottom:18,flexWrap:'wrap',gap:12}}>
        <div className="flex gap-4" style={{flexWrap:'wrap'}}>
          {Object.entries(SC).map(([k,v])=>(
            <div key={k} className="flex gap-2" style={{fontSize:12.5,color:'var(--slate)'}}>
              <motion.div style={{width:8,height:8,borderRadius:'50%',background:v.dot}}
                animate={{scale:k==='bill_requested'?[1,1.4,1]:1}}
                transition={{repeat:Infinity,duration:1.2}}/>
              {v.label} ({tables.filter(t=>t.status===k).length})
            </div>
          ))}
        </div>
        <div className="filter-bar" style={{margin:0}}>
          {zones.map(z=>(
            <button key={z} className={`chip${zone===z?' on':''}`} onClick={()=>setZone(z)}>
              {z.charAt(0).toUpperCase()+z.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length===0?(
        <EmptyState icon={<Grid3X3 size={48} strokeWidth={1.5}/>} title="No tables in this zone" subtitle="Try a different zone filter."/>
      ):(
        <div className="floor-grid">
          <AnimatePresence>
            {filtered.map((tbl,i)=>{
              const s=SC[tbl.status]||SC.available;
              return(
                <motion.button key={tbl.id} type="button"
                  className={`tcell ${s.cls}`}
                  onClick={()=>pick(tbl)}
                  initial={{opacity:0,scale:.7}}
                  animate={{opacity:1,scale:1}}
                  exit={{opacity:0,scale:.5}}
                  transition={{delay:i*.03,type:'spring',stiffness:300,damping:22}}
                  whileHover={{scale:1.08,zIndex:10}}
                  whileTap={{scale:.94}}
                  layout>
                  {tbl.status==='bill_requested'&&(
                    <motion.div style={{position:'absolute',inset:-2,borderRadius:'var(--r-md)',border:'2px solid var(--crimson)',zIndex:-1}}
                      animate={{opacity:[1,.3,1]}} transition={{duration:1,repeat:Infinity}}/>
                  )}
                  <div className="tcell-num">T{tbl.number}</div>
                  <div className="tcell-sub">
                    {tbl.status==='occupied'&&`${tbl.guests} guests`}
                    {tbl.status==='available'&&`Cap.${tbl.capacity}`}
                    {tbl.status==='bill_requested'&&'Bill req.'}
                    {tbl.status==='reserved'&&tbl.reservation_time}
                  </div>
                  {tbl.seated_at&&<div style={{fontSize:10,opacity:.6,marginTop:2}}>{elapsed(tbl.seated_at)}</div>}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={!!sel}
        onClose={()=>{setSel(null);setView('detail');setEditingOrder(null);}}
        title={sel?`Table ${sel.number}`:''}
        headerExtra={sel&&<span className={`badge bg-${sel.status==='occupied'?'saffron':sel.status==='available'?'jade':'crimson'}`}>{SC[sel.status]?.label}</span>}
      >
        {sel&&(view==='detail'?(
          <>
            {orders.length>0&&(
              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Current Orders</div>
                {orders.map(o=>{
                  const editable=!['delivered','billed','cancelled'].includes(o.status);
                  return(
                    <motion.div key={o.id}
                      initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}}
                      style={{background:'var(--surface)',borderRadius:'var(--r-sm)',padding:14,marginBottom:8,border:'1px solid var(--border)'}}>
                      <div className="flex-between" style={{marginBottom:8}}>
                        <span className={`badge status-${o.status}`}>{o.status}</span>
                        <div className="flex gap-2">
                          <span style={{fontWeight:700,color:'var(--saffron)'}}>₹{o.total}</span>
                          {editable&&(
                            <button className="tb-btn" style={{width:26,height:26}} aria-label="Edit this order" onClick={()=>startEditOrder(o)}>
                              <Pencil size={12}/>
                            </button>
                          )}
                        </div>
                      </div>
                      {o.items.map((it,i)=>(
                        <div key={i} style={{fontSize:13,color:'var(--slate)',padding:'2px 0'}}>
                          {it.qty}× {it.name}
                          {it.notes&&<span style={{color:'var(--crimson)',fontSize:11}}> ({it.notes})</span>}
                        </div>
                      ))}
                    </motion.div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-3">
              <button className="btn btn-pr" onClick={startNewOrder}><Plus size={15}/> Add Order</button>
              {sel.status!=='available'&&(
                <button className="btn btn-sc" onClick={goToBilling}><Receipt size={15}/> Generate Bill</button>
              )}
            </div>
          </>
        ):(
          <>
            <div style={{fontSize:13.5,fontWeight:700,marginBottom:14}}>
              {editingOrder?`Edit order — Table ${sel.number}`:`Add items — Table ${sel.number}`}
            </div>
            <div style={{maxHeight:280,overflowY:'auto',display:'flex',flexDirection:'column',gap:7,marginBottom:16}}>
              {(menu||[]).map(item=>{
                const inCart=cart.find(c=>c.menu_id===item.id);
                return(
                  <div key={item.id}
                    role="button" tabIndex={0}
                    style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',
                      background:'var(--surface)',borderRadius:'var(--r-sm)',border:'1px solid var(--border)',
                      cursor:'pointer',transition:'border-color .18s'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--saffron)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                    onClick={()=>addToCart(item)}
                    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();addToCart(item);}}}>
                    <span style={{fontSize:20}} aria-hidden="true">{item.image}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{item.name}</div>
                      <div style={{fontSize:11,color:'var(--muted)'}}>{item.spice} · ₹{item.price}</div>
                    </div>
                    {inCart?
                      <div className="flex gap-2">
                        <button aria-label={`Remove one ${item.name}`} onClick={e=>{e.stopPropagation();removeFromCart(item.id)}}
                          style={{width:24,height:24,borderRadius:'50%',background:'var(--surface-2)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <Minus size={13}/>
                        </button>
                        <span style={{fontWeight:800,color:'var(--saffron)',fontSize:15}}>{inCart.qty}</span>
                        <button aria-label={`Add one more ${item.name}`} className="mc-add" onClick={e=>{e.stopPropagation();addToCart(item)}} style={{opacity:1,transform:'none',width:24,height:24}}>
                          <Plus size={13}/>
                        </button>
                      </div>
                      :<button aria-label={`Add ${item.name} to cart`} className="mc-add" onClick={e=>{e.stopPropagation();addToCart(item)}} style={{opacity:.7,transform:'none'}}>
                        <Plus size={15}/>
                      </button>
                    }
                  </div>
                );
              })}
            </div>
            {cart.length>0&&(
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                style={{background:'var(--saffron-50)',border:'1px solid rgba(255,107,0,.25)',borderRadius:'var(--r-sm)',padding:14,marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:800,color:'var(--saffron-dark)',marginBottom:8}}>CART — {cart.reduce((s,c)=>s+c.qty,0)} items</div>
                {cart.map(c=>(
                  <div key={c.menu_id} className="flex-between" style={{fontSize:13,padding:'2px 0'}}>
                    <span>{c.qty}× {c.name}</span>
                    <span style={{fontWeight:700}}>₹{c.price*c.qty}</span>
                  </div>
                ))}
                <div className="flex-between" style={{borderTop:'1px solid rgba(255,107,0,.2)',marginTop:8,paddingTop:8,fontWeight:800,color:'var(--saffron-dark)'}}>
                  <span>Total</span><span>₹{cart.reduce((s,c)=>s+c.price*c.qty,0)}</span>
                </div>
              </motion.div>
            )}
            <div className="flex gap-3">
              <button className="btn btn-sc" onClick={backToDetail}><ArrowLeft size={15}/> Back</button>
              <motion.button className="btn btn-pr" style={{flex:1,justifyContent:'center'}}
                onClick={saveOrder} disabled={saving} whileHover={{scale:1.02}} whileTap={{scale:.97}}>
                {editingOrder?<><Save size={15}/> {saving?'Saving…':'Save Changes'}</>:<><Flame size={15}/> {saving?'Firing…':'Fire KOT to Kitchen'}</>}
              </motion.button>
            </div>
          </>
        ))}
      </Modal>
    </div>
  );
}
