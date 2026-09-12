import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import {Building2,Grid3X3,UtensilsCrossed,CheckCircle2,ArrowRight,ArrowLeft} from 'lucide-react';
import RestaurantInfoForm from '../components/setup/RestaurantInfoForm';
import TableSetupManager from '../components/setup/TableSetupManager';
import MenuSetupManager from '../components/setup/MenuSetupManager';

const STEPS=[
  {key:'info',label:'Restaurant Info',Icon:Building2},
  {key:'tables',label:'Tables & Seating',Icon:Grid3X3},
  {key:'menu',label:'Menu Setup',Icon:UtensilsCrossed},
  {key:'done',label:'Done',Icon:CheckCircle2},
];

export default function OnboardingWizardPage(){
  const navigate=useNavigate();
  const [step,setStep]=useState(0);

  const next=()=>setStep(s=>Math.min(s+1,STEPS.length-1));
  const back=()=>setStep(s=>Math.max(s-1,0));
  const finish=()=>navigate('/app/dashboard');

  return(
    <div style={{minHeight:'100vh',background:'var(--surface)'}}>
      <div style={{maxWidth:760,margin:'0 auto',padding:'48px 24px'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div className="sb-mark" style={{width:56,height:56,fontSize:24,margin:'0 auto 16px'}}>थ</div>
          <h1 style={{fontFamily:'var(--font-d)',fontSize:26,fontWeight:800,color:'var(--ink)'}}>Let's set up your business</h1>
          <p style={{color:'var(--muted)',fontSize:14,marginTop:6}}>Takes about five minutes — you can always finish this later from Setup.</p>
        </div>

        <div className="flex-between" style={{marginBottom:32,maxWidth:520,marginLeft:'auto',marginRight:'auto'}}>
          {STEPS.map((s,i)=>(
            <div key={s.key} className="flex-col" style={{alignItems:'center',flex:1,position:'relative'}}>
              <div style={{
                width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                background:i<=step?'var(--saffron)':'var(--surface-2)',
                color:i<=step?'white':'var(--muted)',fontWeight:700,transition:'all .2s',
              }}>
                <s.Icon size={16}/>
              </div>
              <div style={{fontSize:11,marginTop:6,color:i<=step?'var(--ink)':'var(--muted)',fontWeight:i===step?700:500,textAlign:'center'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}} transition={{duration:.25}}>
            <div className="card" style={{padding:28}}>
              {STEPS[step].key==='info'&&<RestaurantInfoForm onSaved={next}/>}
              {STEPS[step].key==='tables'&&<TableSetupManager/>}
              {STEPS[step].key==='menu'&&<MenuSetupManager/>}
              {STEPS[step].key==='done'&&(
                <div style={{textAlign:'center',padding:'24px 0'}}>
                  <CheckCircle2 size={56} style={{color:'var(--jade)',marginBottom:16}}/>
                  <h2 style={{fontFamily:'var(--font-d)',fontSize:20,fontWeight:800,marginBottom:8}}>You're all set!</h2>
                  <p style={{color:'var(--muted)',fontSize:14,marginBottom:24}}>
                    You can add more tables or menu items anytime from the Setup section in the sidebar.
                  </p>
                  <button className="btn btn-pr btn-lg" onClick={finish}>Go to Dashboard <ArrowRight size={16}/></button>
                </div>
              )}
            </div>

            {STEPS[step].key!=='done'&&(
              <div className="flex-between" style={{marginTop:20}}>
                <button className="btn btn-gh" onClick={back} disabled={step===0} style={{visibility:step===0?'hidden':'visible'}}>
                  <ArrowLeft size={15}/> Back
                </button>
                <div className="flex gap-3">
                  <button className="btn btn-gh" onClick={()=>navigate('/app/dashboard')}>Skip for now</button>
                  {STEPS[step].key!=='info'&&(
                    <button className="btn btn-pr" onClick={next}>Next <ArrowRight size={15}/></button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
