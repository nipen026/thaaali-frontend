import {useState} from 'react';
import {Plus,ScanLine,PenLine,Trash2,UploadCloud,Sparkles,FileText} from 'lucide-react';
import {menuAPI,aiAPI} from '../../api';
import {notifySuccess,notifyError} from '../../lib/toast';
import {useApiData} from '../../lib/useApiData';
import Skeleton from '../ui/Skeleton';
import {useLanguage} from '../../context/LanguageContext';

const NEW_CATEGORY='__new__';
const EMPTY_ITEM={category:'',newCategoryName:'',name:'',price:'',pricingUnit:'item',type:'veg',spice:'mild'};

function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

export default function MenuSetupManager(){
  const {t}=useLanguage();
  const {data:menu,setData:setMenu,loading}=useApiData(()=>menuAPI.getAll());
  const [mode,setMode]=useState('manual');
  const [form,setForm]=useState(EMPTY_ITEM);
  const [busy,setBusy]=useState(false);

  const [imagePreview,setImagePreview]=useState(null);
  const [imageBase64,setImageBase64]=useState(null);
  const [fileName,setFileName]=useState(null);
  const [scanning,setScanning]=useState(false);
  const [extracted,setExtracted]=useState(null); // null | array
  const [saving,setSaving]=useState(false);

  if(loading) return <Skeleton variant="card"/>;

  const categories=menu.categories;

  async function resolveCategoryId(name, cacheMap){
    const key=name.trim().toLowerCase();
    if(cacheMap.has(key)) return cacheMap.get(key);
    const existing=categories.find(c=>c.name.toLowerCase()===key);
    if(existing){ cacheMap.set(key,existing.id); return existing.id; }
    const r=await menuAPI.createCategory({name:name.trim()});
    categories.push(r.data);
    cacheMap.set(key,r.data.id);
    return r.data.id;
  }

  // ── Manual add ──────────────────────────────────────────
  const set=(field)=>(e)=>setForm(f=>({...f,[field]:e.target.value}));

  const addManualItem=async e=>{
    e.preventDefault();
    if(!form.name||!form.price) return notifyError(t('setup.menuNameAndPriceRequired','Name and price are required'));
    if(form.category===NEW_CATEGORY&&!form.newCategoryName) return notifyError(t('setup.menuEnterCategoryName','Enter a category name'));
    setBusy(true);
    try{
      const cache=new Map();
      const categoryId=form.category===NEW_CATEGORY
        ? await resolveCategoryId(form.newCategoryName,cache)
        : form.category||await resolveCategoryId('Uncategorized',cache);
      const r=await menuAPI.create({category:categoryId,name:form.name,price:Number(form.price),pricing_unit:form.pricingUnit,type:form.type,spice:form.spice});
      setMenu(prev=>({...prev,items:[...prev.items,r.data]}));
      setForm(EMPTY_ITEM);
      notifySuccess(t('setup.menuItemAddedToast','{name} added to menu').replace('{name}',r.data.name));
    }catch{
      notifyError(t('setup.menuAddItemError','Could not add item'));
    }finally{setBusy(false);}
  };

  // ── Scan flow ───────────────────────────────────────────
  const MAX_FILE_BYTES=6*1024*1024; // ~6MB raw stays under the backend's 8MB base64-char cap

  const onFileChange=async e=>{
    const file=e.target.files?.[0];
    if(!file) return;
    if(file.size>MAX_FILE_BYTES){
      notifyError(t('setup.menuFileTooLarge','That file is too large — please use a photo under 6MB'));
      e.target.value='';
      return;
    }
    const b64=await fileToBase64(file);
    setImageBase64(b64);
    setFileName(file.name);
    setImagePreview(file.type.startsWith('image/')?b64:null);
    setExtracted(null);
  };

  const runScan=async()=>{
    setScanning(true);
    try{
      const r=await aiAPI.scanMenu(imageBase64);
      setExtracted(r.data.items.map((it,i)=>({...it,localId:i,include:true})));
    }catch(err){
      notifyError(err?.response?.data?.error||t('setup.menuScanFailed','Scan failed — please try again'));
    }finally{setScanning(false);}
  };

  const updateExtracted=(localId,field)=>e=>{
    setExtracted(prev=>prev.map(it=>it.localId===localId?{...it,[field]:e.target.value}:it));
  };
  const removeExtracted=localId=>setExtracted(prev=>prev.filter(it=>it.localId!==localId));

  const saveExtracted=async()=>{
    const toSave=extracted.filter(it=>it.include);
    if(!toSave.length) return notifyError(t('setup.menuNoItemsSelected','No items selected'));
    setSaving(true);
    try{
      const cache=new Map();
      const created=[];
      for(const it of toSave){
        const categoryId=await resolveCategoryId(it.category_name||'Uncategorized',cache);
        const r=await menuAPI.create({category:categoryId,name:it.name,price:Number(it.price),type:it.type,spice:it.spice});
        created.push(r.data);
      }
      setMenu(prev=>({...prev,items:[...prev.items,...created]}));
      const addedLabel=created.length===1
        ? t('setup.menuItemAddedToastOne','{n} item added to menu')
        : t('setup.menuItemAddedToastMany','{n} items added to menu');
      notifySuccess(addedLabel.replace('{n}',created.length));
      setExtracted(null);setImageBase64(null);setImagePreview(null);setFileName(null);
    }catch{
      notifyError(t('setup.menuSaveSomeItemsError','Could not save some items'));
    }finally{setSaving(false);}
  };

  return(
    <div>
      <div className="filter-bar">
        <button className={`chip${mode==='manual'?' on':''}`} onClick={()=>setMode('manual')}><PenLine size={13}/> {t('setup.menuAddManually','Add Manually')}</button>
        <button className={`chip${mode==='scan'?' on':''}`} onClick={()=>setMode('scan')}><ScanLine size={13}/> {t('setup.menuScanAMenu','Scan a Menu')}</button>
      </div>

      <div style={{fontSize:13,color:'var(--muted)',marginBottom:16}}>{t('setup.menuItemsCountSoFar','{n} items on your menu so far').replace('{n}',menu.items.length)}</div>

      {mode==='manual'?(
        <form onSubmit={addManualItem} className="stack gap-3" style={{maxWidth:480}}>
          <div className="fgrp">
            <label className="flbl" htmlFor="mi-category">{t('setup.menuCategory','Category')}</label>
            <select id="mi-category" className="finput" value={form.category} onChange={set('category')}>
              <option value="">{t('setup.menuChooseCategory','Choose a category…')}</option>
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              <option value={NEW_CATEGORY}>{t('setup.menuNewCategoryOption','+ New category…')}</option>
            </select>
          </div>
          {form.category===NEW_CATEGORY&&(
            <div className="fgrp">
              <label className="flbl" htmlFor="mi-newcat">{t('setup.menuNewCategoryName','New category name')}</label>
              <input id="mi-newcat" className="finput" value={form.newCategoryName} onChange={set('newCategoryName')}/>
            </div>
          )}
          <div className="fgrp">
            <label className="flbl" htmlFor="mi-name">{t('setup.menuItemName','Item name')}</label>
            <input id="mi-name" className="finput" value={form.name} onChange={set('name')} required/>
          </div>
          <div className="fgrp">
            <label className="flbl">{t('setup.menuPricingType','Pricing')}</label>
            <div className="filter-bar" style={{margin:0}}>
              <button type="button" className={`chip${form.pricingUnit==='item'?' on':''}`} onClick={()=>setForm(f=>({...f,pricingUnit:'item'}))}>
                {t('setup.menuPricingPerItem','Per item')}
              </button>
              <button type="button" className={`chip${form.pricingUnit==='gram'?' on':''}`} onClick={()=>setForm(f=>({...f,pricingUnit:'gram'}))}>
                {t('setup.menuPricingByWeight','By weight (g)')}
              </button>
            </div>
          </div>
          <div className="grid-2 gap-3">
            <div className="fgrp">
              <label className="flbl" htmlFor="mi-price">
                {form.pricingUnit==='gram'?t('setup.menuPricePerGram','Price per gram (₹)'):t('setup.menuPrice','Price (₹)')}
              </label>
              <input id="mi-price" type="number" min="0" step="0.01" className="finput" value={form.price} onChange={set('price')} required/>
            </div>
            <div className="fgrp">
              <label className="flbl" htmlFor="mi-type">{t('setup.menuType','Type')}</label>
              <select id="mi-type" className="finput" value={form.type} onChange={set('type')}>
                <option value="veg">{t('setup.menuTypeVeg','Veg')}</option>
                <option value="non_veg">{t('setup.menuTypeNonVeg','Non-Veg')}</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-pr" disabled={busy} style={{alignSelf:'flex-start'}}>
            <Plus size={15}/> {busy?t('setup.menuAdding','Adding…'):t('setup.menuAddItem','Add Item')}
          </button>
        </form>
      ):(
        <div>
          {!extracted&&(
            <div className="card" style={{padding:24,maxWidth:480}}>
              <div className="fgrp">
                <label className="flbl" htmlFor="menu-photo">{t('setup.menuUploadPhotoLabel','Upload a photo or PDF of your menu')}</label>
                <input id="menu-photo" type="file" accept="image/*,application/pdf" onChange={onFileChange} className="finput"/>
              </div>
              {imagePreview&&<img src={imagePreview} alt={t('setup.menuPreviewAlt','Menu preview')} style={{maxWidth:'100%',borderRadius:'var(--r-sm)',marginBottom:14}}/>}
              {imageBase64&&!imagePreview&&(
                <div className="flex gap-2 badge bg-gray" style={{marginBottom:14,padding:'8px 12px'}}>
                  <FileText size={14}/> {fileName}
                </div>
              )}
              <button className="btn btn-pr" disabled={!imageBase64||scanning} onClick={runScan}>
                {scanning?<>{t('setup.menuScanning','Scanning…')}</>:<><Sparkles size={15}/> {t('setup.menuScanMenu','Scan Menu')}</>}
              </button>
              {!imageBase64&&<div style={{fontSize:12,color:'var(--muted)',marginTop:10}} className="flex gap-1"><UploadCloud size={13}/> {t('setup.menuChoosePhotoToStart','Choose a photo or PDF to get started')}</div>}
            </div>
          )}

          {extracted&&(
            <div>
              <div style={{fontSize:12.5,color:'var(--muted)',marginBottom:14}}>
                {t('setup.menuFoundItemsReview','Found {n} items — review and edit before saving. This is a demo extraction; always double-check prices.').replace('{n}',extracted.length)}
              </div>
              <div className="stack gap-2" style={{marginBottom:16}}>
                {extracted.map(it=>(
                  <div key={it.localId} className="card flex gap-3" style={{padding:'12px 16px',alignItems:'center'}}>
                    <input className="finput" style={{flex:2}} value={it.name} onChange={updateExtracted(it.localId,'name')}/>
                    <input className="finput" style={{width:90}} type="number" value={it.price} onChange={updateExtracted(it.localId,'price')}/>
                    <input className="finput" style={{flex:1}} value={it.category_name} onChange={updateExtracted(it.localId,'category_name')}/>
                    <span className="badge bg-gray">{Math.round(it.confidence*100)}%</span>
                    <button className="tb-btn" style={{width:30,height:30}} aria-label={t('setup.menuRemoveExtractedAriaLabel','Remove {name}').replace('{name}',it.name)} onClick={()=>removeExtracted(it.localId)}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="btn btn-sc" onClick={()=>{setExtracted(null);setImageBase64(null);setImagePreview(null);setFileName(null);}}>{t('setup.menuStartOver','Start Over')}</button>
                <button className="btn btn-pr" disabled={saving} onClick={saveExtracted}>
                  {saving?t('setup.menuSavingItems','Saving…'):t('setup.menuSaveItemsButton','Save {n} Items').replace('{n}',extracted.length)}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
