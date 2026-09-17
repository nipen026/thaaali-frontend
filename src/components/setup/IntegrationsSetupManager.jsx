import {useState} from 'react';
import {Bike,Copy,Check,Eye,EyeOff,RefreshCw,Send,ChevronDown,ChevronUp,AlertCircle} from 'lucide-react';
import {integrationsAPI,menuAPI,API_URL} from '../../api';
import {notifySuccess,notifyError} from '../../lib/toast';
import {useApiData} from '../../lib/useApiData';
import Skeleton from '../ui/Skeleton';
import ConfirmDialog from '../ui/ConfirmDialog';

// Zomato and Swiggy are brand/product names — left untranslated on purpose (see NewOrderToast.jsx).
const PLATFORMS=[{id:'zomato',label:'Zomato'},{id:'swiggy',label:'Swiggy'}];

function webhookUrl(token){
  return `${API_URL}/api/webhooks/orders/${token}`;
}

async function copyToClipboard(text,onDone){
  try{ await navigator.clipboard.writeText(text); onDone(); }
  catch{ notifyError('Could not copy — select and copy manually'); }
}

function CopyField({value,label}){
  const [copied,setCopied]=useState(false);
  return(
    <div className="flex gap-2" style={{alignItems:'center'}}>
      <code style={{fontSize:12,background:'var(--bg-2)',padding:'6px 10px',borderRadius:'var(--r-sm)',overflowX:'auto',flex:1,whiteSpace:'nowrap'}}>{value}</code>
      <button type="button" className="tb-btn" style={{width:30,height:30,flexShrink:0}} aria-label={`Copy ${label}`}
        onClick={()=>copyToClipboard(value,()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);})}>
        {copied?<Check size={13}/>:<Copy size={13}/>}
      </button>
    </div>
  );
}

function MappingList({integrationId,menuItems}){
  const {data:mappings,setData:setMappings,loading}=useApiData(()=>integrationsAPI.getMappings(integrationId),[integrationId]);
  if(loading) return <Skeleton variant="row" count={2}/>;
  if(!mappings.length) return <div style={{fontSize:12.5,color:'var(--muted)'}}>No items received from this platform yet.</div>;

  const setMapping=async(mappingId,menuItemId)=>{
    try{
      const r=await integrationsAPI.setMapping(mappingId,menuItemId||null);
      setMappings(prev=>prev.map(m=>m.id===mappingId?r.data:m));
    }catch{ notifyError('Could not save mapping'); }
  };

  const unmapped=mappings.filter(m=>!m.menu_item_id).length;

  return(
    <div className="stack gap-2">
      {unmapped>0&&(
        <div className="flex gap-2 badge bg-amber" style={{padding:'8px 12px',alignSelf:'flex-start'}}>
          <AlertCircle size={13}/> {unmapped} item{unmapped===1?'':'s'} {unmapped===1?'needs':'need'} mapping — orders still come through using the platform's name/price until mapped.
        </div>
      )}
      {mappings.map(m=>(
        <div key={m.id} className="flex gap-3" style={{alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
          <div style={{flex:1,fontSize:13.5}}>{m.external_name}</div>
          <select className="finput" style={{width:220}} value={m.menu_item_id||''} onChange={e=>setMapping(m.id,e.target.value)}>
            <option value="">Not mapped</option>
            {menuItems.map(mi=><option key={mi.id} value={mi.id}>{mi.name}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

function IntegrationCard({platform,integration,menuItems,onConnect,onUpdate}){
  const [busy,setBusy]=useState(false);
  const [showSecret,setShowSecret]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [confirmRegen,setConfirmRegen]=useState(false);

  const connect=async()=>{
    setBusy(true);
    try{
      const r=await integrationsAPI.connect(platform.id);
      onConnect(r.data);
      notifySuccess(`${platform.label} connected — copy the webhook URL below into your ${platform.label}/aggregator dashboard`);
    }catch(err){ notifyError(err?.response?.data?.error||`Could not connect ${platform.label}`); }
    finally{ setBusy(false); }
  };

  const toggleEnabled=async()=>{
    try{
      const r=await integrationsAPI.setEnabled(integration.id,!integration.enabled);
      onUpdate(r.data);
    }catch{ notifyError('Could not update'); }
  };

  const regenerateSecret=async()=>{
    try{
      const r=await integrationsAPI.regenerateSecret(integration.id);
      onUpdate(r.data);
      notifySuccess('Secret regenerated — update it wherever the old one was configured');
    }catch{ notifyError('Could not regenerate secret'); }
  };

  const sendTest=async()=>{
    setBusy(true);
    try{
      await integrationsAPI.simulateOrder(integration.id);
      notifySuccess(`Test order sent — check the Orders page`);
      setExpanded(true);
    }catch(err){ notifyError(err?.response?.data?.error||'Could not send test order'); }
    finally{ setBusy(false); }
  };

  return(
    <div className="card" style={{padding:20}}>
      <div className="flex gap-3" style={{alignItems:'center'}}>
        <Bike size={20}/>
        <div style={{fontWeight:700,flex:1}}>{platform.label}</div>
        {integration?(
          <span className={`badge ${integration.enabled?'bg-jade':'bg-gray'}`}>{integration.enabled?'Active':'Paused'}</span>
        ):(
          <button className="btn btn-pr" disabled={busy} onClick={connect}>{busy?'Connecting…':'Connect'}</button>
        )}
      </div>

      {integration&&(
        <div className="stack gap-3" style={{marginTop:16}}>
          <div className="fgrp" style={{marginBottom:0}}>
            <label className="flbl">Webhook URL</label>
            <div style={{fontSize:11.5,color:'var(--muted)',marginBottom:6}}>
              Paste this into {platform.label} (or your POS aggregator, e.g. Petpooja/UrbanPiper) as the order push endpoint.
            </div>
            <CopyField value={webhookUrl(integration.webhook_token)} label="webhook URL"/>
          </div>

          <div className="fgrp" style={{marginBottom:0}}>
            <label className="flbl">Webhook secret</label>
            <div style={{fontSize:11.5,color:'var(--muted)',marginBottom:6}}>
              Sent back as the <code>x-webhook-secret</code> header on every request from the platform.
            </div>
            <div className="flex gap-2" style={{alignItems:'center'}}>
              {showSecret?<CopyField value={integration.webhook_secret} label="secret"/>:(
                <code style={{fontSize:12,background:'var(--bg-2)',padding:'6px 10px',borderRadius:'var(--r-sm)',flex:1}}>••••••••••••••••</code>
              )}
              <button type="button" className="tb-btn" style={{width:30,height:30}} aria-label={showSecret?'Hide secret':'Show secret'} onClick={()=>setShowSecret(s=>!s)}>
                {showSecret?<EyeOff size={13}/>:<Eye size={13}/>}
              </button>
              <button type="button" className="tb-btn" style={{width:30,height:30}} aria-label="Regenerate secret" onClick={()=>setConfirmRegen(true)}>
                <RefreshCw size={13}/>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-sc" onClick={toggleEnabled}>{integration.enabled?'Pause':'Resume'}</button>
            <button className="btn btn-sc" disabled={busy} onClick={sendTest}><Send size={14}/> Send Test Order</button>
            <button className="btn btn-sc" onClick={()=>setExpanded(e=>!e)}>
              {expanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>} Item Mapping
            </button>
          </div>

          {expanded&&<MappingList integrationId={integration.id} menuItems={menuItems}/>}
        </div>
      )}

      <ConfirmDialog
        open={confirmRegen}
        onClose={()=>setConfirmRegen(false)}
        onConfirm={regenerateSecret}
        title="Regenerate webhook secret?"
        message={`The old secret will stop working immediately — ${platform.label} (or your aggregator) will need the new one before orders can come through again.`}
        confirmLabel="Regenerate"
      />
    </div>
  );
}

export default function IntegrationsSetupManager(){
  const {data:integrations,setData:setIntegrations,loading}=useApiData(()=>integrationsAPI.getAll());
  const {data:menu,loading:menuLoading}=useApiData(()=>menuAPI.getAll());

  if(loading||menuLoading) return <Skeleton variant="card"/>;

  const byPlatform=Object.fromEntries(integrations.map(i=>[i.platform,i]));

  const handleConnect=(integration)=>setIntegrations(prev=>[...prev,integration]);
  const handleUpdate=(integration)=>setIntegrations(prev=>prev.map(i=>i.id===integration.id?integration:i));

  return(
    <div className="stack gap-3">
      <div style={{fontSize:13,color:'var(--muted)'}}>
        Connect a delivery platform once and orders placed there will appear automatically on the Orders and Kitchen (KDS) pages — no manual entry.
        Zomato and Swiggy don't offer a direct order feed to individual restaurants; point the webhook URL below at whichever aggregator (Petpooja, UrbanPiper, Speedyy, etc.) holds your platform partnership, or at a direct integration if you have one.
      </div>
      {PLATFORMS.map(p=>(
        <IntegrationCard key={p.id} platform={p} integration={byPlatform[p.id]} menuItems={menu.items}
          onConnect={handleConnect} onUpdate={handleUpdate}/>
      ))}
    </div>
  );
}
