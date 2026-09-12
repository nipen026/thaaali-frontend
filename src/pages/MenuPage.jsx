import {useState} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {menuAPI} from '../api';
import {Search,Star,Flame,Zap} from 'lucide-react';
import {notifySuccess} from '../lib/toast';
import {useApiData} from '../lib/useApiData';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const FILTERS=[
  {key:'all',label:'All Items'},
  {key:'veg',label:'Veg'},
  {key:'non_veg',label:'Non-Veg'},
  {key:'jain',label:'Jain'},
  {key:'c1',label:'Starters',cat:true},
  {key:'c2',label:'Main Course',cat:true},
  {key:'c3',label:'Breads',cat:true},
  {key:'c4',label:'Rice & Biryani',cat:true},
  {key:'c5',label:'Dal',cat:true},
  {key:'c6',label:'Desserts',cat:true},
  {key:'c7',label:'Beverages',cat:true},
];

export default function MenuPage(){
  const {data:items,setData:setItems,loading}=useApiData(async()=>{const r=await menuAPI.getAll();return{data:r.data.items};});
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');

  if(loading) return <div className="menu-grid"><Skeleton variant="card" count={8}/></div>;

  const filtered=items.filter(item=>{
    const s=item.name.toLowerCase().includes(search.toLowerCase());
    if(filter==='all') return s;
    if(filter==='veg') return s&&item.type==='veg';
    if(filter==='non_veg') return s&&item.type==='non_veg';
    if(filter==='jain') return s&&item.dietary.includes('jain');
    return s&&item.category===filter;
  });

  const toggle=async item=>{
    await menuAPI.update(item.id,{available:!item.available});
    setItems(p=>p.map(i=>i.id===item.id?{...i,available:!i.available}:i));
    notifySuccess(`${item.name} ${item.available?'marked sold out':'back on menu'}`);
  };

  return(
    <div>
      <div className="flex-between" style={{marginBottom:16,flexWrap:'wrap',gap:12}}>
        <div style={{fontSize:13,color:'var(--muted)'}}>
          {items.length} items · {items.filter(i=>i.available).length} available · {items.filter(i=>!i.available).length} sold out
        </div>
        <div className="search-wrap">
          <Search size={15} className="search-ico"/>
          <input className="finput" style={{width:220,paddingLeft:36}} placeholder="Search menu…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      <div className="filter-bar">
        {FILTERS.map(f=>(
          <button key={f.key} className={`chip${filter===f.key?' on':''}`} onClick={()=>setFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      <div className="menu-grid">
        <AnimatePresence>
          {filtered.map((item,i)=>(
            <motion.div key={item.id}
              className={`menu-card${!item.available?' unavailable':''}`}
              initial={{opacity:0,y:20,scale:.93}}
              animate={{opacity:item.available?1:.55,y:0,scale:1}}
              exit={{opacity:0,scale:.88}}
              transition={{delay:i*.03,duration:.3,ease:[.16,1,.3,1]}}
              layout>
              {item.orders_count>500&&<div className="mc-bestseller flex gap-1"><Star size={11}/> Bestseller</div>}
              <div className="mc-thumb" aria-hidden="true">{item.image}</div>
              <div className="mc-body">
                <div className="flex gap-2" style={{marginBottom:4}}>
                  <div className={`vdot ${item.type}`}/>
                  <div className="mc-name">{item.name}</div>
                </div>
                <div className="mc-desc">{item.description}</div>
                <div className="mc-foot">
                  <div className="mc-price">₹{item.price}</div>
                  <div className="flex gap-2">
                    <span style={{fontSize:11,color:'var(--muted)'}}>{item.orders_count}×</span>
                    <motion.button
                      style={{fontSize:11.5,padding:'3px 9px',borderRadius:'var(--r-xs)',border:'1px solid var(--border)',
                        background:item.available?'var(--crimson-50)':'var(--jade-50)',
                        color:item.available?'var(--crimson)':'var(--jade)',fontWeight:600,transition:'all .18s'}}
                      whileHover={{scale:1.05}} whileTap={{scale:.96}}
                      onClick={()=>toggle(item)}>
                      {item.available?'Sold Out':'Available'}
                    </motion.button>
                  </div>
                </div>
                <div className="flex gap-1" style={{flexWrap:'wrap',marginTop:8}}>
                  <span className="badge bg-gray flex gap-1" style={{fontSize:10}}><Flame size={10}/> {item.spice}</span>
                  {item.dietary.map(d=><span key={d} className="badge bg-jade" style={{fontSize:10}}>{d}</span>)}
                  <span className="badge bg-gray flex gap-1" style={{fontSize:10}}><Zap size={10}/> {item.calories}cal</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length===0&&(
          <div style={{gridColumn:'1/-1'}}>
            <EmptyState icon={<Search size={48} strokeWidth={1.5}/>} title={`No items match "${search||filter}"`}/>
          </div>
        )}
      </div>
    </div>
  );
}
