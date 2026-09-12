import RestaurantInfoForm from '../../components/setup/RestaurantInfoForm';

export default function RestaurantSetupPage(){
  return(
    <div className="card" style={{padding:24,maxWidth:560}}>
      <RestaurantInfoForm/>
    </div>
  );
}
