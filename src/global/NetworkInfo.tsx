
import { NetworkInfo } from 'react-native-network-info';


 export async function   getIpv4Address () {
  
    //Get IPv4 IP (priority: WiFi first, cellular second)
    let ipv4Address =  await NetworkInfo.getIPV4Address();
    return  ipv4Address;

    

  }