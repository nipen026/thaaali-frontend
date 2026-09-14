import {useEffect,useState} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {useSearchParams} from 'react-router-dom';
import {billingAPI,tablesAPI,ordersAPI} from '../api';
import {Smartphone,CreditCard,Banknote,Shuffle,CheckCircle2,Wallet,ArrowLeft,Receipt} from 'lucide-react';
import {notifySuccess,notifyError} from '../lib/toast';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {useLanguage} from '../context/LanguageContext';

export default function BillingPage(){
  const {t}=useLanguage();
  const PAY=[
    {id:'upi',Icon:Smartphone,label:t('billing.payUpi','UPI')},
    {id:'card',Icon:CreditCard,label:t('billing.payCard','Card')},
    {id:'cash',Icon:Banknote,label:t('billing.payCash','Cash')},
    {id:'mixed',Icon:Shuffle,label:t('billing.paySplit','Split')},
  ];
  const [searchParams]=useSearchParams();
  const [tables,setTables]=useState(null);
  const [sel,setSel]=useState(null);
  const [orders,setOrders]=useState([]);
  const [pay,setPay]=useState('upi');
  const [discount,setDiscount]=useState(0);
  const [bills,setBills]=useState(null);
  const [success,setSuccess]=useState(null);

  const pickTable=async t=>{
    setSel(t);setSuccess(null);setDiscount(0);
    const r=await ordersAPI.getAll({table_id:t.id});
    setOrders(r.data.filter(o=>o.status!=='billed'));
  };

  useEffect(()=>{
    Promise.all([
      tablesAPI.getAll(),
      billingAPI.getAll(),
    ]).then(([tRes,bRes])=>{
      const openTables=tRes.data.filter(t=>['occupied','bill_requested'].includes(t.status));
      setTables(openTables);
      setBills(bRes.data.slice(0,12));
      const preselectId=searchParams.get('table');
      if(preselectId){
        const match=openTables.find(t=>t.id===preselectId);
        if(match) pickTable(match);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const allItems=orders.flatMap(o=>o.items);
  const gross=allItems.reduce((s,i)=>s+i.price*i.qty,0);
  const net=Math.max(0,gross-discount);
  const cgst=net*.025,sgst=net*.025,total=net+cgst+sgst;

  const collect=async()=>{
    if(!sel||!orders.length)return notifyError(t('billing.noActiveOrders','No active orders'));
    const r=await billingAPI.generate({table_id:sel.id,order_ids:orders.map(o=>o.id),discount,payment_method:pay});
    setSuccess(r.data);
    setBills(p=>[r.data,...p.slice(0,11)]);
    setTables(p=>p.filter(tb=>tb.id!==sel.id));
    notifySuccess(t('billing.collectedToast','₹{amount} collected via {method}').replace('{amount}',r.data.grand_total.toFixed(0)).replace('{method}',pay.toUpperCase()));
  };

  if(tables===null) return <div className="grid-2 gap-4"><Skeleton variant="card"/><Skeleton variant="card"/></div>;

  return(
    <div>
      <div className="grid-2 gap-4" style={{marginBottom:20}}>
        {/* Table picker */}
        <div className="card">
          <div className="card-hd"><div className="card-hd-title">{t('billing.selectTable','Select Table to Bill')}</div></div>
          <div className="card-bd">
            {tables.length===0?(
              <EmptyState icon={<Wallet size={40} strokeWidth={1.5}/>} title={t('billing.noTablesAwaiting','No tables awaiting billing')}/>
            ):(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(72px,1fr))',gap:10}}>
                {tables.map(t=>(
                  <motion.button key={t.id}
                    onClick={()=>pickTable(t)}
                    whileHover={{scale:1.08,y:-2}} whileTap={{scale:.94}}
                    style={{aspectRatio:1,borderRadius:'var(--r-md)',
                      border:`2px solid ${sel?.id===t.id?'var(--saffron)':t.status==='bill_requested'?'var(--crimson)':'var(--saffron)'}`,
                      background:sel?.id===t.id?'var(--saffron)':t.status==='bill_requested'?'var(--crimson-50)':'var(--saffron-50)',
                      color:sel?.id===t.id?'white':t.status==='bill_requested'?'var(--crimson)':'var(--saffron-dark)',
                      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                      fontFamily:'var(--font-d)',fontWeight:800,fontSize:18}}>
                    T{t.number}
                    <span style={{fontSize:10,fontWeight:500,marginTop:3}}>{t.guests}g</span>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent bills */}
        <div className="card">
          <div className="card-hd"><div className="card-hd-title">{t('billing.todaysBills',"Today's Bills")}</div></div>
          <div style={{maxHeight:260,overflowY:'auto'}}>
            {bills.length===0?<EmptyState icon={<Receipt size={40} strokeWidth={1.5}/>} title={t('billing.noBillsYet','No bills yet')}/>
            :bills.map((b,i)=>(
              <motion.div key={b.id} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:i*.04}}
                className="flex" style={{padding:'10px 20px',borderBottom:'1px solid var(--border)'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700}}>#{b.bill_number}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{new Date(b.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <div style={{fontFamily:'var(--font-d)',fontWeight:800,color:'var(--saffron)',marginRight:10}}>
                  ₹{b.grand_total?.toFixed(0)}
                </div>
                <span className={`badge ${b.status==='paid'?'bg-jade':'bg-amber'}`}>{b.status==='paid'?t('billing.statusPaid','paid'):t('billing.statusGenerated','generated')}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bill detail */}
      <AnimatePresence>
        {sel&&!success&&orders.length>0&&(
          <motion.div className="card"
            initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}}
            transition={{type:'spring',stiffness:280,damping:26}}>
            <div className="card-hd">
              <div className="card-hd-title">{t('billing.billPreview','Table {n} — Bill Preview').replace('{n}',sel.number)}</div>
              <div className="flex gap-2">
                <span className="badge bg-jade">{t('billing.gstIncl','GST Incl.')}</span>
                <span className="badge bg-saffron">{t('billing.fssaiCompliant','FSSAI Compliant')}</span>
              </div>
            </div>
            <div className="card-bd">
              <div className="bill-layout">
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12}}>{t('billing.orderItems','Order Items')}</div>
                  {allItems.map((it,i)=>(
                    <motion.div key={i} className="bill-row"
                      initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*.04}}>
                      <div className="bill-row-name">{it.name}</div>
                      <div className="bill-row-qty">× {it.qty}</div>
                      <div className="bill-row-price">₹{(it.price*it.qty).toLocaleString('en-IN')}</div>
                    </motion.div>
                  ))}
                  <div style={{marginTop:16}}>
                    <label className="flbl" htmlFor="billing-discount">{t('billing.discountInputLabel','Discount (₹)')}</label>
                    <input id="billing-discount" type="number" className="finput" value={discount}
                      onChange={e=>setDiscount(Math.min(+e.target.value,gross))}
                      min={0} max={gross} style={{width:140}}/>
                  </div>
                </div>

                <div>
                  <div className="bill-summary">
                    <div className="bill-ln"><span>{t('billing.subtotal','Subtotal')}</span><span>₹{gross.toFixed(2)}</span></div>
                    {discount>0&&<div className="bill-ln" style={{color:'var(--jade)'}}><span>{t('billing.discount','Discount')}</span><span>−₹{discount.toFixed(2)}</span></div>}
                    <div className="bill-ln"><span>{t('billing.cgstLabel','CGST (2.5%)')}</span><span>₹{cgst.toFixed(2)}</span></div>
                    <div className="bill-ln"><span>{t('billing.sgstLabel','SGST (2.5%)')}</span><span>₹{sgst.toFixed(2)}</span></div>
                    <div className="bill-total"><span>{t('common.total','Total')}</span><span>₹{total.toFixed(2)}</span></div>
                  </div>

                  <div style={{marginTop:14}}>
                    <div style={{fontSize:11,fontWeight:800,color:'var(--muted)',marginBottom:10,letterSpacing:'.07em'}}>{t('billing.paymentMethod','PAYMENT METHOD')}</div>
                    <div className="pay-grid">
                      {PAY.map(m=>(
                        <button key={m.id} type="button" className={`pay-btn${pay===m.id?' sel':''}`} onClick={()=>setPay(m.id)}>
                          <m.Icon size={20} className="pico"/>{m.label}
                        </button>
                      ))}
                    </div>
                    <motion.button className="btn btn-pr btn-lg" style={{width:'100%',justifyContent:'center',marginTop:8}}
                      onClick={collect} whileHover={{scale:1.02}} whileTap={{scale:.97}}>
                      <Wallet size={16}/> {t('billing.collectButton','Collect ₹{amount} via {method}').replace('{amount}',total.toFixed(0)).replace('{method}',pay.toUpperCase())}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {success&&(
          <motion.div className="card"
            initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}}
            style={{textAlign:'center',padding:48}}>
            <motion.div
              initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:400,delay:.1}}
              style={{marginBottom:16}}>
              <CheckCircle2 size={64} style={{color:'var(--jade)'}}/>
            </motion.div>
            <div style={{fontFamily:'var(--font-d)',fontSize:24,fontWeight:800,marginBottom:6}}>{t('billing.paymentCollected','Payment Collected!')}</div>
            <div style={{fontSize:40,fontWeight:800,color:'var(--saffron)',fontFamily:'var(--font-d)',margin:'12px 0'}}>
              ₹{success.grand_total?.toFixed(0)}
            </div>
            <div style={{color:'var(--muted)',marginBottom:20}}>{t('billing.billRef','Bill #{n} · {method}').replace('{n}',success.bill_number).replace('{method}',pay.toUpperCase())}</div>
            <button className="btn btn-sc" onClick={()=>{setSel(null);setSuccess(null)}}><ArrowLeft size={14}/> {t('billing.newBill','New Bill')}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
