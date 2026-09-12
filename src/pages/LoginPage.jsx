import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import toast from 'react-hot-toast';
import {useAuth} from '../context/AuthContext';
import {
  Crown, Briefcase, Utensils, CreditCard, ChefHat,
  Building2, LogIn, BedDouble, Mail, Lock, Eye, EyeOff,
} from 'lucide-react';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';

const DEMOS=[
  {Icon:Crown,role:'Owner',email:'owner@thaali.in',desc:'Full access · All modules',bg:'var(--saffron-50)',fg:'var(--saffron-dark)'},
  {Icon:Briefcase,role:'Restaurant Manager',email:'manager@thaali.in',desc:'Operations · Reports · Staff',bg:'var(--purple-50)',fg:'var(--purple)'},
  {Icon:Utensils,role:'Waiter',email:'waiter@thaali.in',desc:'Tables · Orders · Menu',bg:'var(--jade-50)',fg:'var(--jade)'},
  {Icon:CreditCard,role:'Cashier',email:'cashier@thaali.in',desc:'Billing · Payments',bg:'var(--amber-50)',fg:'#92400e'},
  {Icon:ChefHat,role:'Kitchen',email:'kitchen@thaali.in',desc:'KDS Display only',bg:'var(--crimson-50)',fg:'var(--crimson)'},
  {Icon:Building2,role:'Hotel Desk',email:'hotel@thaali.in',desc:'Hotel module only',bg:'var(--sky-50)',fg:'var(--sky)'},
  {Icon:BedDouble,role:'Hotel Manager',email:'hotel.manager@thaali.in',desc:'Hotel · Staff · Analytics',bg:'var(--purple-50)',fg:'var(--purple)'},
];

export default function LoginPage(){
  const {login}=useAuth();
  const navigate=useNavigate();
  const [email,setEmail]=useState('owner@thaali.in');
  const [pw,setPw]=useState('thaali123');
  const [showPw,setShowPw]=useState(false);
  const [busy,setBusy]=useState(false);
  const [activeDemo,setActiveDemo]=useState(null);
  const [errored,setErrored]=useState(false);

  const doLogin=async(e,dEmail,dPassword)=>{
    e?.preventDefault();
    const em=dEmail||email;
    const password=dPassword||pw;
    setBusy(true);
    setErrored(false);
    try{
      const u=await login(em,password);
      toast.success(`Welcome, ${u.name}!`);
      navigate('/app/dashboard');
    }catch{
      toast.error('Invalid credentials');
      setErrored(true);
    }finally{setBusy(false);setActiveDemo(null);}
  };

  return(
    <div className="login-shell">

      <AuthBrandPanel/>

      {/* ─ FORM SIDE ─ */}
      <div className="login-form-col">
        <motion.div className="login-box"
          initial={{opacity:0,x:32}}
          animate={{opacity:1,x:0}}
          transition={{delay:.3,duration:.5}}>

          <h2>Sign in to THAAALI</h2>
          <p className="sub">India's most complete hospitality platform</p>

          <form onSubmit={doLogin}>
            <div className="fgrp">
              <label className="flbl" htmlFor="login-email">Email</label>
              <div className="finput-wrap">
                <Mail size={16} className="fi-icon"/>
                <input id="login-email" className={`finput${errored?' err':''}`} type="email" value={email}
                  onChange={e=>{setEmail(e.target.value);setErrored(false)}} placeholder="you@restaurant.in"
                  autoComplete="username" required/>
              </div>
            </div>
            <div className="fgrp">
              <label className="flbl" htmlFor="login-password">Password</label>
              <div className="finput-wrap">
                <Lock size={16} className="fi-icon"/>
                <input id="login-password" className={`finput${errored?' err':''}`} type={showPw?'text':'password'} value={pw}
                  onChange={e=>{setPw(e.target.value);setErrored(false)}} placeholder="••••••••"
                  autoComplete="current-password" style={{paddingRight:38}} required/>
                <button type="button" className="fi-toggle" onClick={()=>setShowPw(v=>!v)}
                  aria-label={showPw?'Hide password':'Show password'} tabIndex={-1}>
                  {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            <motion.button type="submit" className="btn btn-pr btn-lg"
              style={{width:'100%',justifyContent:'center',marginTop:4}}
              whileHover={{scale:1.02}} whileTap={{scale:.97}} disabled={busy}>
              {busy?(
                <motion.span style={{width:16,height:16,borderRadius:'50%',
                  border:'2px solid rgba(255,255,255,.4)',borderTopColor:'white',display:'inline-block'}}
                  animate={{rotate:360}} transition={{duration:.6,repeat:Infinity,ease:'linear'}}/>
              ):<><LogIn size={16}/>Sign In to THAAALI</>}
            </motion.button>
            <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'var(--muted)'}}>
              New to THAAALI? <Link to="/signup" style={{color:'var(--saffron-dark)',fontWeight:700}}>Create an account</Link>
            </div>
          </form>

          <div className="auth-divider">Quick Demo Access</div>

          <div className="demo-list">
            {DEMOS.map((d,i)=>(
              <motion.button key={d.email} className="demo-row"
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                transition={{delay:.45+i*.06}}
                onClick={()=>{setActiveDemo(d.email);doLogin(null,d.email,'thaali123')}}
                disabled={busy}>
                <span className="dr-icon" style={{background:d.bg,color:d.fg}}><d.Icon size={17}/></span>
                <div>
                  <div className="dr-name">{d.role}</div>
                  <div className="dr-email">{d.email} · {d.desc}</div>
                </div>
                {activeDemo===d.email&&busy?(
                  <motion.div style={{marginLeft:'auto',width:16,height:16,flexShrink:0,
                    borderRadius:'50%',border:'2px solid var(--saffron)',
                    borderTopColor:'transparent'}}
                    animate={{rotate:360}} transition={{duration:.6,repeat:Infinity,ease:'linear'}}/>
                ):(
                  <LogIn size={14} className="dr-go" style={{marginLeft:'auto',flexShrink:0}}/>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
