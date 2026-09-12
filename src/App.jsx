import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TablesPage from './pages/TablesPage';
import OrdersPage from './pages/OrdersPage';
import KDSPage from './pages/KDSPage';
import MenuPage from './pages/MenuPage';
import BillingPage from './pages/BillingPage';
import InventoryPage from './pages/InventoryPage';
import StaffPage from './pages/StaffPage';
import HotelPage from './pages/HotelPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LedgerPage from './pages/LedgerPage';
import OnboardingWizardPage from './pages/OnboardingWizardPage';
import RestaurantSetupPage from './pages/setup/RestaurantSetupPage';
import TableSetupPage from './pages/setup/TableSetupPage';
import MenuSetupPage from './pages/setup/MenuSetupPage';
import { landingFor } from './config/nav';
import ThaaliMark from './components/brand/ThaaliMark';

function Splash(){
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--ink)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{margin:'0 auto 18px',width:56,height:56,animation:'badge-pop .5s var(--ease-spring) both'}}>
          <ThaaliMark size={56}/>
        </div>
        <div style={{
          fontSize:60,fontFamily:'var(--font-d)',fontWeight:800,color:'white',
          letterSpacing:'-2px',animation:'float-in .6s var(--ease-out) forwards'
        }}>THAAA<span style={{color:'var(--saffron)'}}>LI</span></div>
        <div style={{color:'rgba(255,255,255,.35)',marginTop:12,fontSize:13,letterSpacing:'.06em'}}>LOADING YOUR KITCHEN…</div>
        <div style={{marginTop:20,display:'flex',gap:6,justifyContent:'center'}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{
              width:6,height:6,borderRadius:'50%',background:'var(--saffron)',
              animation:`badge-pop .4s var(--ease-spring) ${i*.1}s both`
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function Guarded({children}){
  const {user,loading}=useAuth();
  if(loading) return <Splash/>;
  return user ? children : <Navigate to="/login" replace/>;
}

function RootRoute(){
  const {user,loading}=useAuth();
  if(loading) return <Splash/>;
  return user ? <Navigate to={landingFor(user.role)} replace/> : <LandingPage/>;
}

function AppIndexRedirect(){
  const {user}=useAuth();
  return <Navigate to={landingFor(user.role)} replace/>;
}

export default function App(){
  return(
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style:{fontFamily:'var(--font-b)',borderRadius:'var(--r-sm)',
              fontSize:13.5,boxShadow:'var(--sh-lg)',border:'1px solid var(--border)'},
            duration:3500,
          }}
        />
        <Routes>
          <Route path="/" element={<RootRoute/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<SignupPage/>}/>
          <Route path="/onboarding" element={<Guarded><OnboardingWizardPage/></Guarded>}/>
          <Route path="/app" element={<Guarded><Layout/></Guarded>}>
            <Route index element={<AppIndexRedirect/>}/>
            <Route path="dashboard" element={<DashboardPage/>}/>
            <Route path="tables"    element={<TablesPage/>}/>
            <Route path="orders"    element={<OrdersPage/>}/>
            <Route path="kitchen"   element={<KDSPage/>}/>
            <Route path="menu"      element={<MenuPage/>}/>
            <Route path="billing"   element={<BillingPage/>}/>
            <Route path="inventory" element={<InventoryPage/>}/>
            <Route path="staff"     element={<StaffPage/>}/>
            <Route path="hotel"     element={<HotelPage/>}/>
            <Route path="analytics" element={<AnalyticsPage/>}/>
            <Route path="ledger"    element={<LedgerPage/>}/>
            <Route path="setup/restaurant" element={<RestaurantSetupPage/>}/>
            <Route path="setup/tables"     element={<TableSetupPage/>}/>
            <Route path="setup/menu"       element={<MenuSetupPage/>}/>
          </Route>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
