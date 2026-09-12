import {useState} from 'react';
import {Save} from 'lucide-react';
import {tenantAPI} from '../../api';
import {notifySuccess,notifyError} from '../../lib/toast';
import {useApiData} from '../../lib/useApiData';
import Skeleton from '../ui/Skeleton';

export default function RestaurantInfoForm({onSaved}){
  const {data:tenant,loading}=useApiData(()=>tenantAPI.get());
  const [form,setForm]=useState(null);
  const [busy,setBusy]=useState(false);

  const current=form||(tenant?{
    name:tenant.name, business_type:tenant.business_type,
    currency:tenant.currency, gst_percent:(tenant.gst_rate*100).toFixed(2), timezone:tenant.timezone,
  }:null);

  if(loading||!current) return <Skeleton variant="card"/>;

  const set=(field)=>(e)=>setForm({...current,[field]:e.target.value});

  const submit=async e=>{
    e.preventDefault();
    setBusy(true);
    try{
      await tenantAPI.update({
        name:current.name, business_type:current.business_type,
        currency:current.currency, gst_rate:Number(current.gst_percent)/100, timezone:current.timezone,
      });
      notifySuccess('Restaurant info saved');
      onSaved?.();
    }catch{
      notifyError('Could not save — please try again');
    }finally{setBusy(false);}
  };

  return(
    <form onSubmit={submit}>
      <div className="fgrp">
        <label className="flbl" htmlFor="ri-name">Business name</label>
        <input id="ri-name" className="finput" value={current.name} onChange={set('name')} required/>
      </div>
      <div className="grid-2 gap-3">
        <div className="fgrp">
          <label className="flbl" htmlFor="ri-type">Business type</label>
          <select id="ri-type" className="finput" value={current.business_type} onChange={set('business_type')}>
            <option value="restaurant">Restaurant</option>
            <option value="hotel">Hotel</option>
            <option value="both">Restaurant &amp; Hotel</option>
          </select>
        </div>
        <div className="fgrp">
          <label className="flbl" htmlFor="ri-currency">Currency</label>
          <input id="ri-currency" className="finput" value={current.currency} onChange={set('currency')} maxLength={3}/>
        </div>
      </div>
      <div className="grid-2 gap-3">
        <div className="fgrp">
          <label className="flbl" htmlFor="ri-gst">GST rate (%)</label>
          <input id="ri-gst" type="number" step="0.01" min="0" max="28" className="finput" value={current.gst_percent} onChange={set('gst_percent')}/>
        </div>
        <div className="fgrp">
          <label className="flbl" htmlFor="ri-tz">Timezone</label>
          <input id="ri-tz" className="finput" value={current.timezone} onChange={set('timezone')}/>
        </div>
      </div>
      <button type="submit" className="btn btn-pr" disabled={busy}>
        <Save size={15}/> {busy?'Saving…':'Save'}
      </button>
    </form>
  );
}
