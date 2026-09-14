import {useState} from 'react';
import {motion} from 'framer-motion';
import {AlertTriangle,ShoppingCart} from 'lucide-react';
import {inventoryAPI} from '../api';
import {notifySuccess,notifyError} from '../lib/toast';
import {useApiData} from '../lib/useApiData';
import Skeleton from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {useLanguage} from '../context/LanguageContext';

export default function InventoryPage(){
  const {t}=useLanguage();
  const {data:items,setData:setItems,loading}=useApiData(()=>inventoryAPI.getAll());
  const [confirmOpen,setConfirmOpen]=useState(false);
  const [reordering,setReordering]=useState(false);

  if(loading) return <Skeleton variant="card" count={1}/>;

  const alerts=items.filter(i=>i.stock<=i.reorder_at);

  const confirmReorder=async()=>{
    setReordering(true);
    try{
      const r=await inventoryAPI.reorder(alerts.map(a=>a.id));
      setItems(prev=>prev.map(i=>r.data.find(u=>u.id===i.id)||i));
      notifySuccess((r.data.length===1?t('inventory.reorderedOne','Reordered {n} item'):t('inventory.reorderedMany','Reordered {n} items')).replace('{n}',r.data.length));
    }catch{
      notifyError(t('inventory.reorderFailed','Could not place reorder'));
    }finally{setReordering(false);}
  };

  return(
    <div>
      {alerts.length>0&&(
        <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}}
          className="flex gap-3"
          style={{background:'var(--crimson-50)',border:'1px solid #f5c6c2',borderRadius:'var(--r-md)',padding:'14px 20px',marginBottom:20}}>
          <AlertTriangle size={22} style={{color:'var(--crimson)',flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13.5,fontWeight:700,color:'var(--crimson)'}}>
              {(alerts.length===1?t('inventory.reorderAlertOne','{n} item need reordering'):t('inventory.reorderAlertMany','{n} items need reordering')).replace('{n}',alerts.length)}
            </div>
            <div style={{fontSize:12,color:'var(--crimson)',opacity:.8,marginTop:2}}>{alerts.map(a=>a.name).join(' · ')}</div>
          </div>
          <button className="btn btn-da btn-sm" onClick={()=>setConfirmOpen(true)}>
            <ShoppingCart size={14}/> {t('inventory.orderNow','Order Now')}
          </button>
        </motion.div>
      )}
      <div className="card">
        <table className="inv-table">
          <thead>
            <tr><th>{t('inventory.colItem','Item')}</th><th>{t('inventory.colSupplier','Supplier')}</th><th>{t('inventory.colStockLevel','Stock Level')}</th><th>{t('inventory.colUnit','Unit')}</th><th>{t('common.status','Status')}</th><th>{t('inventory.colPricePerUnit','₹/Unit')}</th></tr>
          </thead>
          <tbody>
            {items.map((item,i)=>{
              const pct=Math.min(item.stock/(item.reorder_at*3)*100,100);
              const low=item.stock<=item.reorder_at;
              return(
                <motion.tr key={item.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*.04}}>
                  <td style={{fontWeight:600}}>{item.name}</td>
                  <td style={{color:'var(--muted)',fontSize:13}}>{item.supplier}</td>
                  <td>
                    <div className="flex gap-3">
                      <div className="stock-bar">
                        <motion.div className="stock-fill"
                          initial={{width:0}} animate={{width:`${pct}%`}}
                          transition={{delay:i*.04+.3,duration:.7,ease:'easeOut'}}
                          style={{background:low?'var(--crimson)':pct<50?'var(--amber)':'var(--jade)'}}/>
                      </div>
                      <span style={{fontSize:13.5,fontWeight:600,color:low?'var(--crimson)':'var(--ink)',minWidth:36}}>{item.stock} {item.unit}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--muted)',fontSize:13}}>{item.unit}</td>
                  <td><span className={`badge ${low?'bg-crimson':'bg-jade'}`}>{low?t('inventory.lowStock','Low Stock'):t('inventory.inStock','In Stock')}</span></td>
                  <td style={{fontWeight:600}}>₹{item.price_per_unit}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={()=>setConfirmOpen(false)}
        onConfirm={confirmReorder}
        danger={false}
        title={t('inventory.reorderTitle','Reorder low-stock items?')}
        message={t('inventory.reorderMessage','This will place a restock order for: {names}. Stock will be topped up to a healthy level once received.').replace('{names}',alerts.map(a=>a.name).join(', '))}
        confirmLabel={reordering?t('inventory.ordering','Ordering…'):t('inventory.orderNow','Order Now')}
      />
    </div>
  );
}
