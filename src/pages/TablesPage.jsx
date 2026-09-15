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
import ItemAvatar from '../components/ui/ItemAvatar';
import {formatQty} from '../lib/formatQty';
import {useLanguage} from '../context/LanguageContext';

const DEFAULT_GRAMS=100;

const SC={
  available:{cls:'ts-available',dot:'#0F7A45'},
  occupied:{cls:'ts-occupied',dot:'#FF6B00'},
  bill_requested:{cls:'ts-bill',dot:'#C0392B'},
  reserved:{cls:'ts-reserved',dot:'#1565C0'},
};
const elapsed=ts=>{if(!ts)return'';const m=Math.floor((Date.now()-ts)/60000);return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60}m`;};

export default function TablesPage(){
  const {socket}=useOutletContext();
  const {user}=useAuth();
  const {t}=useLanguage();
  const navigate=useNavigate();
  const STATUS_LABEL={
    available:t('tables.statusAvailable','Available'), occupied:t('tables.statusOccupied','Occupied'),
    bill_requested:t('tables.statusBillRequested','Bill!'), reserved:t('tables.statusReserved','Reserved'),
  };
  const ZONE_LABEL={
    all:t('tables.zoneAll','All'), indoor:t('tables.zoneIndoor','Indoor'),
    outdoor:t('tables.zoneOutdoor','Outdoor'), private:t('tables.zonePrivate','Private'),
  };
  const ORDER_STATUS_LABEL={
    pending:t('tables.orderStatusPending','Pending'), preparing:t('tables.orderStatusPreparing','Preparing'),
    ready:t('tables.orderStatusReady','Ready'), delivered:t('tables.orderStatusDelivered','Delivered'),
    cancelled:t('tables.orderStatusCancelled','Cancelled'),
  };
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
  const [customerName,setCustomerName]=useState('');
  const [customerPhone,setCustomerPhone]=useState('');

  useEffect(()=>{
    const t=setInterval(()=>setTick(x=>x+1),30000);
    return()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    if(!socket)return;
    socket.on('table_updated',tbl=>setTables(p=>p.map(x=>x.id===tbl.id?tbl:x)));
    return()=>socket.off('table_updated');
  },[socket,setTables]);

  const pick=async tbl=>{
    setSel(tbl);setCart([]);setView('detail');setEditingOrder(null);setCustomerName('');setCustomerPhone('');
    if(tbl.status!=='available'){
      const r=await ordersAPI.getAll({table_id:tbl.id});
      setOrders(r.data.filter(o=>o.status!=='billed'));
    }else setOrders([]);
  };

  // Reuses whatever name/phone was captured on this table's other open orders, so re-opening
  // "Add Order" on an already-seated table doesn't ask the customer to repeat themselves.
  const startNewOrder=()=>{
    setEditingOrder(null);setCart([]);setView('order');
    const withCustomer=orders.find(o=>o.customer_name||o.customer_phone);
    setCustomerName(withCustomer?.customer_name||'');
    setCustomerPhone(withCustomer?.customer_phone||'');
  };
  const startEditOrder=order=>{
    setEditingOrder(order);
    setCart(order.items.map(it=>({item_id:it.item_id,menu_id:it.menu_id,name:it.name,price:it.price,qty:it.qty,unit:it.unit||'item',spice:it.spice,notes:it.notes})));
    setView('order');
  };
  const backToDetail=()=>{setView('detail');setEditingOrder(null);setCart([]);};

  // Gram-priced items don't make sense to add "one at a time" — they start at a sensible
  // default weight and are then adjusted via a direct grams input (see setCartGrams below),
  // not the +/- stepper unit-counted items use.
  const addToCart=item=>{
    setCart(p=>{
      const ex=p.find(c=>c.menu_id===item.id);
      if(item.pricing_unit==='gram') return ex?p:[...p,{menu_id:item.id,name:item.name,price:item.price,qty:DEFAULT_GRAMS,unit:'gram',spice:item.spice,notes:''}];
      return ex?p.map(c=>c.menu_id===item.id?{...c,qty:c.qty+1}:c)
        :[...p,{menu_id:item.id,name:item.name,price:item.price,qty:1,unit:'item',spice:item.spice,notes:''}];
    });
  };
  const removeFromCart=id=>setCart(p=>{const e=p.find(c=>c.menu_id===id);return e?.qty>1&&e.unit!=='gram'?p.map(c=>c.menu_id===id?{...c,qty:c.qty-1}:c):p.filter(c=>c.menu_id!==id)});
  const setCartGrams=(id,grams)=>setCart(p=>p.map(c=>c.menu_id===id?{...c,qty:Math.max(0,grams)}:c));

  const refreshTableOrders=async()=>{
    const r=await ordersAPI.getAll({table_id:sel.id});
    setOrders(r.data.filter(o=>o.status!=='billed'));
  };

  const saveOrder=async()=>{
    if(!cart.length)return notifyError(t('tables.cartEmpty','Cart is empty'));
    setSaving(true);
    try{
      if(editingOrder){
        await ordersAPI.updateItems(editingOrder.id,cart);
        notifySuccess(t('tables.orderUpdated','Order updated'));
      }else{
        await ordersAPI.create({table_id:sel.id,channel:'dine_in',items:cart,
          customer_name:customerName.trim()||undefined,customer_phone:customerPhone.trim()||undefined});
        if(sel.status==='available'){
          const r=await tablesAPI.seat(sel.id,{guests:2,waiter:user?.id});
          setTables(p=>p.map(tb=>tb.id===sel.id?r.data:tb));setSel(r.data);
        }
        notifySuccess(t('tables.kotFired','KOT fired to kitchen!'));
      }
      backToDetail();
      await refreshTableOrders();
    }catch(err){
      notifyError(err?.response?.data?.error||t('tables.couldNotSave','Could not save order'));
    }finally{setSaving(false);}
  };

  const goToBilling=()=>{
    setSel(null);
    navigate(`/app/billing?table=${sel.id}`);
  };

  if(loading) return <div className="floor-grid"><Skeleton variant="card" count={12}/></div>;

  const zones=['all','indoor','outdoor','private'];
  const filtered=zone==='all'?tables:tables.filter(tb=>tb.zone===zone);

  return(
    <div>
      <div className="flex-between" style={{marginBottom:18,flexWrap:'wrap',gap:12}}>
        <div className="flex gap-4" style={{flexWrap:'wrap'}}>
          {Object.entries(SC).map(([k,v])=>(
            <div key={k} className="flex gap-2" style={{fontSize:12.5,color:'var(--slate)'}}>
              <motion.div style={{width:8,height:8,borderRadius:'50%',background:v.dot}}
                animate={{scale:k==='bill_requested'?[1,1.4,1]:1}}
                transition={{repeat:Infinity,duration:1.2}}/>
              {STATUS_LABEL[k]} ({tables.filter(tb=>tb.status===k).length})
            </div>
          ))}
        </div>
        <div className="filter-bar" style={{margin:0}}>
          {zones.map(z=>(
            <button key={z} className={`chip${zone===z?' on':''}`} onClick={()=>setZone(z)}>
              {ZONE_LABEL[z]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length===0?(
        <EmptyState icon={<Grid3X3 size={48} strokeWidth={1.5}/>} title={t('tables.noTablesInZone','No tables in this zone')} subtitle={t('tables.tryDifferentZone','Try a different zone filter.')}/>
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
                    {tbl.status==='occupied'&&t('tables.guestsCount','{n} guests').replace('{n}',tbl.guests)}
                    {tbl.status==='available'&&t('tables.capacityShort','Cap.{n}').replace('{n}',tbl.capacity)}
                    {tbl.status==='bill_requested'&&t('tables.billReq','Bill req.')}
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
        title={sel?t('tables.tableNumber','Table {n}').replace('{n}',sel.number):''}
        headerExtra={sel&&<span className={`badge bg-${sel.status==='occupied'?'saffron':sel.status==='available'?'jade':'crimson'}`}>{STATUS_LABEL[sel.status]}</span>}
      >
        {sel&&(view==='detail'?(
          <>
            {orders.length>0&&(
              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>{t('tables.currentOrders','Current Orders')}</div>
                {orders.map(o=>{
                  const editable=!['delivered','billed','cancelled'].includes(o.status);
                  return(
                    <motion.div key={o.id}
                      initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}}
                      style={{background:'var(--surface)',borderRadius:'var(--r-sm)',padding:14,marginBottom:8,border:'1px solid var(--border)'}}>
                      <div className="flex-between" style={{marginBottom:8}}>
                        <span className={`badge status-${o.status}`}>{ORDER_STATUS_LABEL[o.status]||o.status}</span>
                        <div className="flex gap-2">
                          <span style={{fontWeight:700,color:'var(--saffron)'}}>₹{o.total}</span>
                          {editable&&(
                            <button className="tb-btn" style={{width:26,height:26}} aria-label={t('tables.editThisOrder','Edit this order')} onClick={()=>startEditOrder(o)}>
                              <Pencil size={12}/>
                            </button>
                          )}
                        </div>
                      </div>
                      {o.customer_name&&(
                        <div style={{fontSize:12,fontWeight:600,color:'var(--ink)',marginBottom:6}}>
                          {t('tables.customerLabel','Customer: {n}').replace('{n}',o.customer_name)}
                        </div>
                      )}
                      {o.items.map((it,i)=>(
                        <div key={i} style={{fontSize:13,color:'var(--slate)',padding:'2px 0'}}>
                          {formatQty(it.qty,it.unit)} {it.name}
                          {it.notes&&<span style={{color:'var(--crimson)',fontSize:11}}> ({it.notes})</span>}
                        </div>
                      ))}
                    </motion.div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-3">
              <button className="btn btn-pr" onClick={startNewOrder}><Plus size={15}/> {t('tables.addOrder','Add Order')}</button>
              {sel.status!=='available'&&(
                <button className="btn btn-sc" onClick={goToBilling}><Receipt size={15}/> {t('tables.generateBill','Generate Bill')}</button>
              )}
            </div>
          </>
        ):(
          <>
            <div style={{fontSize:13.5,fontWeight:700,marginBottom:14}}>
              {editingOrder?t('tables.editOrderTitle','Edit order — Table {n}').replace('{n}',sel.number):t('tables.addItemsTitle','Add items — Table {n}').replace('{n}',sel.number)}
            </div>
            {!editingOrder&&(
              <div className="grid-2 gap-3">
                <div className="fgrp">
                  <label className="flbl" htmlFor="order-customer-name">{t('tables.customerName','Customer name (optional)')}</label>
                  <input id="order-customer-name" className="finput" value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder={t('tables.customerNamePlaceholder','Priya Sharma')}/>
                </div>
                <div className="fgrp">
                  <label className="flbl" htmlFor="order-customer-phone">{t('tables.customerPhone','Phone (optional)')}</label>
                  <input id="order-customer-phone" className="finput" type="tel" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value.replace(/\D/g,''))} maxLength={10} placeholder="9876543210"/>
                </div>
              </div>
            )}
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
                    <ItemAvatar id={item.id} name={item.name} size={32}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{item.name}</div>
                      <div style={{fontSize:11,color:'var(--muted)'}}>{item.spice} · ₹{item.price}{item.pricing_unit==='gram'&&'/g'}</div>
                    </div>
                    {item.pricing_unit==='gram'?(
                      inCart?
                        <div className="flex gap-2" onClick={e=>e.stopPropagation()}>
                          <input type="number" min="0" step="10" className="finput" style={{width:70,padding:'5px 8px',fontSize:13,textAlign:'right'}}
                            value={inCart.qty} onChange={e=>setCartGrams(item.id,Number(e.target.value))}
                            aria-label={t('tables.gramsFor','Grams of {name}').replace('{name}',item.name)}/>
                          <span style={{fontSize:12,color:'var(--muted)',alignSelf:'center'}}>g</span>
                          <button aria-label={t('tables.removeItem','Remove {name}').replace('{name}',item.name)} onClick={()=>setCart(p=>p.filter(c=>c.menu_id!==item.id))}
                            style={{width:24,height:24,borderRadius:'50%',background:'var(--crimson-50)',color:'var(--crimson)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Minus size={13}/>
                          </button>
                        </div>
                        :<button aria-label={t('tables.addToCart','Add {name} to cart').replace('{name}',item.name)} className="mc-add" onClick={e=>{e.stopPropagation();addToCart(item)}} style={{opacity:.7,transform:'none'}}>
                          <Plus size={15}/>
                        </button>
                    ):(
                      inCart?
                        <div className="flex gap-2">
                          <button aria-label={t('tables.removeOne','Remove one {name}').replace('{name}',item.name)} onClick={e=>{e.stopPropagation();removeFromCart(item.id)}}
                            style={{width:24,height:24,borderRadius:'50%',background:'var(--surface-2)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Minus size={13}/>
                          </button>
                          <span style={{fontWeight:800,color:'var(--saffron)',fontSize:15}}>{inCart.qty}</span>
                          <button aria-label={t('tables.addOneMore','Add one more {name}').replace('{name}',item.name)} className="mc-add" onClick={e=>{e.stopPropagation();addToCart(item)}} style={{opacity:1,transform:'none',width:24,height:24}}>
                            <Plus size={13}/>
                          </button>
                        </div>
                        :<button aria-label={t('tables.addToCart','Add {name} to cart').replace('{name}',item.name)} className="mc-add" onClick={e=>{e.stopPropagation();addToCart(item)}} style={{opacity:.7,transform:'none'}}>
                          <Plus size={15}/>
                        </button>
                    )}
                  </div>
                );
              })}
            </div>
            {cart.length>0&&(
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                style={{background:'var(--saffron-50)',border:'1px solid rgba(255,107,0,.25)',borderRadius:'var(--r-sm)',padding:14,marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:800,color:'var(--saffron-dark)',marginBottom:8}}>{t('tables.cartLabel','CART — {n} items').replace('{n}',cart.length)}</div>
                {cart.map(c=>(
                  <div key={c.menu_id} className="flex-between" style={{fontSize:13,padding:'2px 0'}}>
                    <span>{formatQty(c.qty,c.unit)} {c.name}</span>
                    <span style={{fontWeight:700}}>₹{c.price*c.qty}</span>
                  </div>
                ))}
                <div className="flex-between" style={{borderTop:'1px solid rgba(255,107,0,.2)',marginTop:8,paddingTop:8,fontWeight:800,color:'var(--saffron-dark)'}}>
                  <span>{t('common.total','Total')}</span><span>₹{cart.reduce((s,c)=>s+c.price*c.qty,0)}</span>
                </div>
              </motion.div>
            )}
            <div className="flex gap-3">
              <button className="btn btn-sc" onClick={backToDetail}><ArrowLeft size={15}/> {t('common.back','Back')}</button>
              <motion.button className="btn btn-pr" style={{flex:1,justifyContent:'center'}}
                onClick={saveOrder} disabled={saving} whileHover={{scale:1.02}} whileTap={{scale:.97}}>
                {editingOrder?<><Save size={15}/> {saving?t('tables.saving','Saving…'):t('tables.saveChanges','Save Changes')}</>:<><Flame size={15}/> {saving?t('tables.firing','Firing…'):t('tables.fireKot','Fire KOT to Kitchen')}</>}
              </motion.button>
            </div>
          </>
        ))}
      </Modal>
    </div>
  );
}
