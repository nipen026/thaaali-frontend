import {useEffect,useState,useRef} from 'react';
import {motion} from 'framer-motion';
import {AreaChart,Area,BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts';
import {analyticsAPI} from '../api';
import {useAuth} from '../context/AuthContext';
import {IndianRupee,ClipboardList,Grid3X3,Hourglass,TrendingUp,Package,CircleDot,AlertTriangle} from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import ItemAvatar from '../components/ui/ItemAvatar';
import {useLanguage} from '../context/LanguageContext';

const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const PIE_COLORS=['#FF6B00','#0F7A45','#1565C0','#F59E0B'];

function AnimNum({to,prefix='',suffix=''}){
  const [val,setVal]=useState(0);
  const ref=useRef(null);
  useEffect(()=>{
    let start=0;const end=parseFloat(String(to).replace(/[^0-9.]/g,''))||0;
    const dur=1000;const step=16;const inc=end/(dur/step);
    const t=setInterval(()=>{
      start=Math.min(start+inc,end);
      setVal(start);
      if(start>=end) clearInterval(t);
    },step);
    return()=>clearInterval(t);
  },[to]);
  const fmt=v=>prefix+(Number.isInteger(parseFloat(String(to).replace(/[^0-9]/g,'')))?Math.round(v).toLocaleString('en-IN'):v.toFixed(0))+suffix;
  return <span>{fmt(val)}</span>;
}

function KPI({label,value,delta,Icon,color,glow,delay=0}){
  return(
    <motion.div className="kpi"
      style={{'--glow-c':glow}}
      initial={{opacity:0,y:24,scale:.95}}
      animate={{opacity:1,y:0,scale:1}}
      transition={{delay,duration:.45,ease:[.16,1,.3,1]}}>
      <div className="kpi-stripe" style={{background:color}}/>
      <div className="kpi-lbl">{label}</div>
      <div className="kpi-val"><AnimNum to={value} prefix={String(value).startsWith('₹')?'₹':''}/></div>
      {delta&&(
        <div className={`kpi-delta ${delta.startsWith('↑')?'up':delta.startsWith('↓')?'dn':'nu'}`}>
          {delta}
        </div>
      )}
      <Icon size={32} className="kpi-ico" style={{color}}/>
    </motion.div>
  );
}

const ChartTip=({active,payload,label})=>{
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'10px 14px',
      border:'none',boxShadow:'var(--sh-lg)'}}>
      <div style={{color:'rgba(255,255,255,.5)',fontSize:11,marginBottom:4}}>{label}</div>
      <div style={{color:'white',fontWeight:700,fontSize:14}}>₹{payload[0].value?.toLocaleString('en-IN')}</div>
    </div>
  );
};

export default function DashboardPage(){
  const {user}=useAuth();
  const {t}=useLanguage();
  const [stats,setStats]=useState(null);
  const [weekly,setWeekly]=useState([]);
  const [hourly,setHourly]=useState([]);
  const [channels,setChannels]=useState([]);
  const [topItems,setTopItems]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([
      analyticsAPI.overview().then(r=>setStats(r.data)),
      analyticsAPI.weekly().then(r=>setWeekly(r.data.map((v,i)=>({day:DAYS[i],revenue:v})))),
      analyticsAPI.hourly().then(r=>setHourly(r.data.map((v,i)=>({h:`${i}h`,v})).filter((_,i)=>i>=7&&i<=22))),
      analyticsAPI.channels().then(r=>setChannels(Object.entries(r.data).map(([k,v])=>({name:k.replace(/_/g,' '),value:v})))),
      analyticsAPI.topItems().then(r=>setTopItems(r.data)),
    ]).finally(()=>setLoading(false));
  },[]);

  const hr=new Date().getHours();
  const greet=hr<12?t('dashboard.greetMorning','Good morning'):hr<17?t('dashboard.greetAfternoon','Good afternoon'):t('dashboard.greetEvening','Good evening');

  if(loading) return <div className="kpi-grid"><Skeleton variant="kpi" count={6}/></div>;

  return(
    <div>
      {/* Greeting */}
      <motion.div style={{marginBottom:22}}
        initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.4}}>
        <div className="flex-between" style={{alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontFamily:'var(--font-d)',fontSize:22,fontWeight:800,color:'var(--ink)'}}>
              {greet}, {user.name.split(' ')[0]}
            </div>
            <div style={{fontSize:13,color:'var(--muted)',marginTop:3}}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </div>
          </div>
          <div className="flex gap-2" style={{flexWrap:'wrap'}}>
            <div className="badge bg-jade flex gap-1"><CircleDot size={11}/> {t('dashboard.allSystemsLive','All systems live')}</div>
            <div className="badge bg-saffron">{t('dashboard.activeOrdersBadge','{n} active orders').replace('{n}',stats?.active_orders??0)}</div>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      {stats&&(
        <div className="kpi-grid">
          <KPI delay={.05} label={t('dashboard.todaysRevenue',"Today's Revenue")} value={`₹${stats.revenue}`} delta={t('dashboard.deltaVsYesterday','↑ 18% vs yesterday')} Icon={IndianRupee} color="var(--saffron)" glow="rgba(255,107,0,.07)"/>
          <KPI delay={.10} label={t('dashboard.ordersToday','Orders Today')} value={stats.orders} delta={t('dashboard.deltaFromYesterday','↑ 12 from yesterday')} Icon={ClipboardList} color="var(--jade)" glow="rgba(15,122,69,.07)"/>
          <KPI delay={.15} label={t('dashboard.tablesOccupied','Tables Occupied')} value={`${stats.tables_occupied}/${stats.tables_total}`} delta={t('dashboard.occupancyPct','{n}% occupancy').replace('{n}',Math.round(stats.tables_occupied/stats.tables_total*100))} Icon={Grid3X3} color="var(--sky)" glow="rgba(21,101,192,.06)"/>
          <KPI delay={.20} label={t('dashboard.activeOrders','Active Orders')} value={stats.active_orders} delta={stats.active_orders>5?t('dashboard.rush','Rush'):t('dashboard.normalPace','Normal pace')} Icon={Hourglass} color="var(--amber)" glow="rgba(245,158,11,.07)"/>
          <KPI delay={.25} label={t('dashboard.avgOrderValue','Avg Order Value')} value={`₹${stats.avg_order}`} delta={t('dashboard.deltaThisWeek','↑ ₹18 this week')} Icon={TrendingUp} color="var(--purple)" glow="rgba(124,58,237,.06)"/>
          <KPI delay={.30} label={t('dashboard.lowStockAlerts','Low Stock Alerts')} value={stats.low_stock_alerts} delta={stats.low_stock_alerts>0?t('dashboard.actionNeeded','Action needed'):t('dashboard.allStocked','All stocked')} Icon={stats.low_stock_alerts>0?AlertTriangle:Package} color={stats.low_stock_alerts>0?'var(--crimson)':'var(--jade)'} glow="rgba(192,57,43,.06)"/>
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid-2" style={{gridTemplateColumns:'3fr 2fr',gap:14,marginBottom:14}}>
        <motion.div className="card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.35}}>
          <div className="card-hd">
            <div className="card-hd-title">{t('dashboard.weeklyRevenue','Weekly Revenue')}</div>
            <div className="badge bg-saffron">{t('dashboard.thisWeek','This Week')}</div>
          </div>
          <div className="card-bd" style={{paddingTop:8}}>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={weekly} margin={{top:4,right:4,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={.22}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fontSize:11,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2.5}
                  fill="url(#revG)"
                  dot={{r:4,fill:'#FF6B00',stroke:'white',strokeWidth:2}}
                  activeDot={{r:6,stroke:'#FF6B00',strokeWidth:2,fill:'white'}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.4}}>
          <div className="card-hd"><div className="card-hd-title">{t('dashboard.channelSplit','Channel Split')}</div></div>
          <div className="card-bd stack">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={channels} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                  paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270}>
                  {channels.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v}%`,'']} contentStyle={{borderRadius:'var(--r-sm)',fontSize:12}}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="stack gap-1">
              {channels.map((c,i)=>(
                <div key={i} className="flex gap-2" style={{fontSize:12.5}}>
                  <div style={{width:10,height:10,borderRadius:3,background:PIE_COLORS[i],flexShrink:0}}/>
                  <span style={{flex:1,color:'var(--slate)',textTransform:'capitalize'}}>{c.name}</span>
                  <span style={{fontWeight:700}}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid-2" style={{gridTemplateColumns:'2fr 1fr',gap:14}}>
        <motion.div className="card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.45}}>
          <div className="card-hd"><div className="card-hd-title">{t('dashboard.hourlyVolumeToday','Hourly Volume Today')}</div></div>
          <div className="card-bd" style={{paddingTop:8}}>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={hourly} barSize={12} margin={{top:4,right:4,left:0,bottom:0}}>
                <XAxis dataKey="h" tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:'var(--r-sm)',fontSize:12,border:'1px solid var(--border)'}}/>
                <Bar dataKey="v" fill="#FF6B00" radius={[3,3,0,0]} fillOpacity={.82}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.5}}>
          <div className="card-hd"><div className="card-hd-title">{t('dashboard.topDishes','Top Dishes')}</div></div>
          <div style={{padding:'8px 0'}}>
            {topItems.map((item,i)=>(
              <motion.div key={item.id}
                initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:.55+i*.06}}
                className="flex gap-3"
                style={{padding:'10px 20px',borderBottom:i<topItems.length-1?'1px solid var(--border)':''}}>
                <ItemAvatar id={item.id} name={item.name} size={32}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{item.name}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{t('dashboard.ordersCount','{n} orders').replace('{n}',item.orders_count)}</div>
                </div>
                <div style={{fontFamily:'var(--font-d)',fontWeight:800,color:'var(--saffron)',fontSize:14}}>
                  ₹{item.price}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
