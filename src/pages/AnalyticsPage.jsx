import {useEffect,useState} from 'react';
import {motion} from 'framer-motion';
import {AreaChart,Area,BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts';
import {analyticsAPI} from '../api';
import {IndianRupee,ClipboardList,TrendingUp,Users} from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';

const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const PIE_COLORS=['#FF6B00','#0F7A45','#1565C0','#F59E0B'];
const ChartTip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(
    <div style={{background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'8px 12px',border:'none',boxShadow:'var(--sh-lg)'}}>
      <div style={{color:'rgba(255,255,255,.5)',fontSize:11,marginBottom:3}}>{label}</div>
      <div style={{color:'white',fontWeight:700,fontSize:14}}>
        {payload[0].name==='revenue'?'₹':''}{payload[0].value?.toLocaleString('en-IN')}
      </div>
    </div>
  );
};
export default function AnalyticsPage(){
  const [weekly,setWeekly]=useState([]);
  const [hourly,setHourly]=useState([]);
  const [channels,setChannels]=useState([]);
  const [topItems,setTopItems]=useState([]);
  const [stats,setStats]=useState(null);
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

  if(loading) return <div className="kpi-grid"><Skeleton variant="kpi" count={4}/></div>;

  return(
    <div>
      {stats&&(
        <div className="kpi-grid" style={{marginBottom:22}}>
          {[
            {label:"Today's Revenue",value:`₹${stats.revenue?.toLocaleString('en-IN')}`,delta:'↑ 18%',Icon:IndianRupee,color:'var(--saffron)',glow:'rgba(255,107,0,.07)'},
            {label:'Total Orders',value:stats.orders,delta:'↑ 12%',Icon:ClipboardList,color:'var(--jade)',glow:'rgba(15,122,69,.07)'},
            {label:'Avg Order Value',value:`₹${stats.avg_order}`,delta:'↑ ₹18',Icon:TrendingUp,color:'var(--sky)',glow:'rgba(21,101,192,.06)'},
            {label:'Covers Today',value:stats.covers,delta:'↑ 24',Icon:Users,color:'var(--purple)',glow:'rgba(124,58,237,.06)'},
          ].map((k,i)=>(
            <motion.div key={i} className="kpi" style={{'--glow-c':k.glow}}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}>
              <div className="kpi-stripe" style={{background:k.color}}/>
              <div className="kpi-lbl">{k.label}</div>
              <div className="kpi-val">{k.value}</div>
              {k.delta&&<div className="kpi-delta up">{k.delta} this week</div>}
              <k.Icon size={32} className="kpi-ico" style={{color:k.color}}/>
            </motion.div>
          ))}
        </div>
      )}
      <div className="grid-2" style={{gridTemplateColumns:'3fr 2fr',gap:14,marginBottom:14}}>
        <motion.div className="card" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.3}}>
          <div className="card-hd"><div className="card-hd-title">Weekly Revenue Trend</div><span className="badge bg-saffron">This Week</span></div>
          <div className="card-bd" style={{paddingTop:8}}>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={weekly} margin={{top:4,right:4,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="rG2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={.2}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fontSize:11,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2.5} fill="url(#rG2)"
                  dot={{r:4,fill:'#FF6B00',stroke:'white',strokeWidth:2}} activeDot={{r:6,fill:'white',stroke:'#FF6B00',strokeWidth:2}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div className="card" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.35}}>
          <div className="card-hd"><div className="card-hd-title">Channel Split</div></div>
          <div className="card-bd">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={channels} cx="50%" cy="50%" innerRadius={36} outerRadius={58} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270}>
                  {channels.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v}%`,'']} contentStyle={{borderRadius:'var(--r-sm)',fontSize:12}}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="stack gap-1" style={{marginTop:4}}>
              {channels.map((c,i)=>(
                <div key={i} className="flex gap-2" style={{fontSize:12.5}}>
                  <div style={{width:9,height:9,borderRadius:2,background:PIE_COLORS[i],flexShrink:0}}/>
                  <span style={{flex:1,color:'var(--slate)',textTransform:'capitalize'}}>{c.name}</span>
                  <span style={{fontWeight:800}}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <div className="grid-2" style={{gridTemplateColumns:'2fr 1fr',gap:14}}>
        <motion.div className="card" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.4}}>
          <div className="card-hd"><div className="card-hd-title">Hourly Order Volume</div></div>
          <div className="card-bd" style={{paddingTop:8}}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={hourly} barSize={11} margin={{top:4,right:4,left:0,bottom:0}}>
                <XAxis dataKey="h" tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="v" fill="#FF6B00" radius={[3,3,0,0]} fillOpacity={.82}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div className="card" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.45}}>
          <div className="card-hd"><div className="card-hd-title">Top 5 Dishes</div></div>
          <div style={{padding:'8px 0'}}>
            {topItems.map((item,i)=>(
              <div key={item.id} className="flex gap-3" style={{padding:'10px 20px',borderBottom:i<topItems.length-1?'1px solid var(--border)':''}}>
                <span style={{fontSize:20}} aria-hidden="true">{item.image}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{item.name}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{item.orders_count} orders</div>
                </div>
                <div style={{fontFamily:'var(--font-d)',fontWeight:800,color:'var(--saffron)',fontSize:14}}>₹{item.price}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
