import {useEffect,useState} from 'react';
import {motion} from 'framer-motion';
import {AreaChart,Area,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts';
import {IndianRupee,Receipt,TrendingUp,Smartphone,CreditCard,Banknote,Shuffle} from 'lucide-react';
import {analyticsAPI} from '../api';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {useLanguage} from '../context/LanguageContext';

const METHOD_META={
  upi:{labelKey:'ledger.methodUpi',label:'UPI',Icon:Smartphone,color:'var(--saffron)'},
  card:{labelKey:'ledger.methodCard',label:'Card',Icon:CreditCard,color:'var(--sky)'},
  cash:{labelKey:'ledger.methodCash',label:'Cash',Icon:Banknote,color:'var(--jade)'},
  mixed:{labelKey:'ledger.methodSplit',label:'Split',Icon:Shuffle,color:'var(--purple)'},
  unknown:{labelKey:'ledger.methodOther',label:'Other',Icon:Shuffle,color:'var(--muted)'},
};

function toISODate(d){return d.toISOString().slice(0,10);}
function presetRange(preset){
  const today=new Date();
  if(preset==='year') return {from:toISODate(new Date(today.getFullYear(),0,1)),to:toISODate(today)};
  return {from:toISODate(new Date(today.getFullYear(),today.getMonth(),1)),to:toISODate(today)};
}

const ChartTip=({active,payload,label})=>{
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'8px 12px',boxShadow:'var(--sh-lg)'}}>
      <div style={{color:'rgba(255,255,255,.5)',fontSize:11,marginBottom:3}}>{label}</div>
      <div style={{color:'white',fontWeight:700,fontSize:14}}>₹{payload[0].value?.toLocaleString('en-IN')}</div>
    </div>
  );
};

export default function LedgerPage(){
  const {t}=useLanguage();
  const [preset,setPreset]=useState('month');
  const [customFrom,setCustomFrom]=useState(toISODate(new Date()));
  const [customTo,setCustomTo]=useState(toISODate(new Date()));
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);

  const range=preset==='custom'?{from:customFrom,to:customTo}:presetRange(preset);

  useEffect(()=>{
    setLoading(true);
    analyticsAPI.ledger(range.from,range.to).then(r=>setData(r.data)).finally(()=>setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[preset,customFrom,customTo]);

  return(
    <div>
      <div className="filter-bar" style={{marginBottom:20}}>
        <button className={`chip${preset==='month'?' on':''}`} onClick={()=>setPreset('month')}>{t('ledger.thisMonth','This Month')}</button>
        <button className={`chip${preset==='year'?' on':''}`} onClick={()=>setPreset('year')}>{t('ledger.thisYear','This Year')}</button>
        <button className={`chip${preset==='custom'?' on':''}`} onClick={()=>setPreset('custom')}>{t('ledger.customRange','Custom Range')}</button>
        {preset==='custom'&&(
          <div className="flex gap-2" style={{marginLeft:8}}>
            <input type="date" className="finput" style={{width:150}} value={customFrom} onChange={e=>setCustomFrom(e.target.value)}/>
            <span style={{color:'var(--muted)',alignSelf:'center'}}>{t('ledger.to','to')}</span>
            <input type="date" className="finput" style={{width:150}} value={customTo} onChange={e=>setCustomTo(e.target.value)}/>
          </div>
        )}
      </div>

      {loading||!data?(
        <div className="kpi-grid"><Skeleton variant="kpi" count={3}/></div>
      ):(
        <>
          <div className="kpi-grid" style={{marginBottom:20}}>
            <motion.div className="kpi" style={{'--glow-c':'rgba(255,107,0,.07)'}} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
              <div className="kpi-stripe" style={{background:'var(--saffron)'}}/>
              <div className="kpi-lbl">{t('ledger.totalRevenue','Total Revenue')}</div>
              <div className="kpi-val">₹{data.total_revenue.toLocaleString('en-IN')}</div>
              <IndianRupee size={32} className="kpi-ico" style={{color:'var(--saffron)'}}/>
            </motion.div>
            <motion.div className="kpi" style={{'--glow-c':'rgba(15,122,69,.07)'}} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.05}}>
              <div className="kpi-stripe" style={{background:'var(--jade)'}}/>
              <div className="kpi-lbl">{t('ledger.billsCollected','Bills Collected')}</div>
              <div className="kpi-val">{data.bills_count}</div>
              <Receipt size={32} className="kpi-ico" style={{color:'var(--jade)'}}/>
            </motion.div>
            <motion.div className="kpi" style={{'--glow-c':'rgba(21,101,192,.06)'}} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
              <div className="kpi-stripe" style={{background:'var(--sky)'}}/>
              <div className="kpi-lbl">{t('ledger.avgBillValue','Avg Bill Value')}</div>
              <div className="kpi-val">₹{Math.round(data.avg_bill_value).toLocaleString('en-IN')}</div>
              <TrendingUp size={32} className="kpi-ico" style={{color:'var(--sky)'}}/>
            </motion.div>
          </div>

          <div className="grid-2" style={{gridTemplateColumns:'2fr 1fr',gap:14,marginBottom:14}}>
            <div className="card">
              <div className="card-hd"><div className="card-hd-title">{t('ledger.revenueTrend','Revenue Trend')}</div></div>
              <div className="card-bd" style={{paddingTop:8}}>
                {data.daily_breakdown.length===0?(
                  <EmptyState title={t('ledger.noPaidBills','No paid bills in this range')} subtitle={t('ledger.tryWiderRange','Try a wider date range.')}/>
                ):(
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data.daily_breakdown} margin={{top:4,right:4,left:0,bottom:0}}>
                      <defs>
                        <linearGradient id="ledgerG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B00" stopOpacity={.22}/>
                          <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`}/>
                      <Tooltip content={<ChartTip/>}/>
                      <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2.5} fill="url(#ledgerG)"/>
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-hd"><div className="card-hd-title">{t('ledger.paymentMethods','Payment Methods')}</div></div>
              <div className="card-bd stack gap-3">
                {Object.keys(data.by_payment_method).length===0?(
                  <div style={{fontSize:13,color:'var(--muted)'}}>{t('ledger.noPaymentsYet','No payments yet.')}</div>
                ):Object.entries(data.by_payment_method).sort(([,a],[,b])=>b-a).map(([method,amount])=>{
                  const meta=METHOD_META[method]||METHOD_META.unknown;
                  const pct=data.total_revenue?Math.round(amount/data.total_revenue*100):0;
                  return(
                    <div key={method} className="flex gap-3">
                      <meta.Icon size={18} style={{color:meta.color,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div className="flex-between" style={{fontSize:13,fontWeight:600,marginBottom:3}}>
                          <span>{t(meta.labelKey,meta.label)}</span><span>₹{amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="stock-bar" style={{width:'100%'}}>
                          <div className="stock-fill" style={{width:`${pct}%`,background:meta.color}}/>
                        </div>
                      </div>
                      <span style={{fontSize:12,color:'var(--muted)',minWidth:32,textAlign:'right'}}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><div className="card-hd-title">{t('ledger.topSellingDishes','Top Selling Dishes')}</div></div>
            {data.top_items.length===0?(
              <EmptyState title={t('ledger.noItemsSold','No items sold in this range')}/>
            ):(
              <div style={{padding:'8px 0'}}>
                {data.top_items.map((item,i)=>(
                  <div key={item.name} className="flex-between" style={{padding:'10px 20px',borderBottom:i<data.top_items.length-1?'1px solid var(--border)':''}}>
                    <div className="flex gap-3">
                      <span style={{fontFamily:'var(--font-d)',fontWeight:800,color:'var(--muted)',minWidth:20}}>{i+1}</span>
                      <div>
                        <div style={{fontSize:13.5,fontWeight:600}}>{item.name}</div>
                        <div style={{fontSize:11,color:'var(--muted)'}}>{t('ledger.qtySold','{n} sold').replace('{n}',item.qty)}</div>
                      </div>
                    </div>
                    <div style={{fontFamily:'var(--font-d)',fontWeight:800,color:'var(--saffron)'}}>₹{item.revenue.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
