import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  NativeAppEventEmitter,
  DeviceEventEmitter,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {TopView, Theme,Overlay,Label,Button} from 'teaset';
import './lang/index.js';
import './global/constants.js';
import './global/utils.js';
import './global/updateUtils.js';
import {createNavigation} from './AppNavigation';
import store from './store';
import JPush from 'jpush-react-native';
import JMessage from 'jmessage-react-plugin';
import {Provider} from 'mobx-react';
import {JG_APP_KEY} from './global/constants';
import simpleStore from './libs/simpleStore';
import { WebView } from 'react-native-webview';
import html from './html'
import WebViewHtmlView from './components/WebViewHtmlView';
import { scaleSize } from './global/utils.js';
import RNExitApp from 'react-native-exit-app';




const AppNavigation = createNavigation(store);

Theme.set({tvBarColor: '#fff'});

export default class App extends Component<any,any> {
  constructor(props:any) {
    super(props);
    this.state={
      isAgree:false,
      btn_state:true
    }
    // this.friendRequestCallback = this.friendRequestCallback.bind(this);
    // this.receiveMessageCallback.bind(this);
  }

  // friendRequestCallback = (evt: any) => {
  //   console.debug('【极光】收到好友事件: ', evt);

  //   // 好友请求事件
  //   if (evt && evt.fromUsername && evt.type === 'invite_received') {
  //     store.AppStore.getFriendRequest().then(async requests => {
  //       if (!requests) {
  //         let newRequestArr: any = [];
  //         newRequestArr.push(evt);

  //         store.AppStore.saveFriendRequest(newRequestArr);
  //       } else {
  //         let existingRequest = requests.find((item: {fromUsername: any}) => {
  //           item.fromUsername === evt.fromUsername;
  //         });

  //         if (!existingRequest) {
  //           let newRequestArr = [...requests];
  //           newRequestArr.push(evt);

  //           store.AppStore.saveFriendRequest(newRequestArr);
  //         }
  //       }

  //       JPush.addLocalNotification({
  //         messageID: Math.floor(Math.random() * (999999999 - 1) + 1).toString(),
  //         title: '',
  //         content: '你有来自' + evt.fromUsername + '的好友请求',
  //         extras: {key123: 'value123'},
  //       });
  //     });
  //   }

  //   // 好友请求通过事件
  //   if (evt && evt.fromUsername && evt.type === 'invite_accepted') {
  //     store.AppStore.getFriendRequest().then(async requests => {
  //       if (requests) {
  //         let existingRequestIndex = requests.findIndex(
  //           (item: {fromUsername: any}) => {
  //             item.fromUsername === evt.fromUsername;
  //           },
  //         );

  //         if (existingRequestIndex >= 0) {
  //           let newRequestArr = [...requests];
  //           newRequestArr.splice(existingRequestIndex, 1);

  //           store.AppStore.saveFriendRequest(newRequestArr);
  //         }
  //       }

  //       DeviceEventEmitter.emit('friendRequestAccepted');

  //       JPush.addLocalNotification({
  //         messageID: Math.floor(Math.random() * (999999999 - 1) + 1).toString(),
  //         title: '',
  //         content: evt.fromUsername + '通过了你的好友请求',
  //         extras: {key123: 'value123'},
  //       });
  //     });
  //   }

  //   // 好友请求拒绝事件
  //   if (evt && evt.fromUsername && evt.type === 'invite_declined') {
  //     store.AppStore.getFriendRequest().then(async requests => {
  //       if (requests) {
  //         let existingRequestIndex = requests.findIndex(
  //           (item: {fromUsername: any}) => {
  //             item.fromUsername === evt.fromUsername;
  //           },
  //         );

  //         if (existingRequestIndex >= 0) {
  //           let newRequestArr = [...requests];
  //           newRequestArr.splice(existingRequestIndex, 1);

  //           store.AppStore.saveFriendRequest(newRequestArr);
  //         }
  //       }

  //       JPush.addLocalNotification({
  //         messageID: Math.floor(Math.random() * (999999999 - 1) + 1).toString(),
  //         title: '',
  //         content: evt.fromUsername + '拒绝了你的好友请求',
  //         extras: {key123: 'value123'},
  //       });
  //     });
  //   }
  // };

  // // receiveMessageCallback = (evt: any) => {

  // // };

  // async componentDidMount() {
  //   //查是否已经同意隐私

  //   let isAgree = await simpleStore.get("privacy")
  //   if(isAgree){
  //     JPush.init();
  //     console.debug('【极光】极光推送初始化完成');
     
  //     JMessage.init({
  //       appkey: JG_APP_KEY,
  //       isOpenMessageRoaming: false, // 是否开启消息漫游，默认不开启
  //       isProduction: true, // 是否为生产模式
  //     });
  //     console.debug('【极光】极光IM初始化完成');
  
  //     JMessage.setDebugMode({enable: true});
  
  //     codePushCheckForUpdate();
  
  //     // 极光事件监听
  //     JMessage.addContactNotifyListener(this.friendRequestCallback);
  //     console.debug('【极光】监听好友请求');
  //     // JMessage.addReceiveMessageListener(this.receiveMessageCallback);
  //     // console.debug("【极光】监听新消息");
  //   }

  //   DeviceEventEmitter.addListener("privacy",res=>{
  //     JPush.init();
  //     console.debug('【极光】极光推送初始化完成');
     
  //     JMessage.init({
  //       appkey: JG_APP_KEY,
  //       isOpenMessageRoaming: false, // 是否开启消息漫游，默认不开启
  //       isProduction: true, // 是否为生产模式
  //     });
  //     console.debug('【极光】极光IM初始化完成');
  
  //     JMessage.setDebugMode({enable: true});
  
  //     codePushCheckForUpdate();
  
  //     // 极光事件监听
  //     JMessage.addContactNotifyListener(this.friendRequestCallback);
  //     console.debug('【极光】监听好友请求');
  //   })

  //   this.setState({
  //     isAgree
  //   })
    
  // }

  // componentWillUnmount() {
  //   //移除监听
  //   JMessage.removeContactNotifyListener(this.friendRequestCallback);
  //   // JMessage.removeContactNotifyListener(this.receiveMessageCallback);
  // }

  render() {
    return (
      <View style={styles.container}>
       <Provider {...store}>
          <TopView>
            <View style={{backgroundColor: '#fff', flex: 1}}>
            {
          this.state.isAgree?<AppNavigation />:
          <>
            <WebViewHtmlView content={html} onLoad={()=>{
              this.setState({
                btn_state:false
              })
            }} />
              <View style={{position:'absolute',bottom:0,borderTopWidth:1,backgroundColor:'#fff'}}>
                  <View style={{width:'100%',display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                    <TouchableOpacity style={{width:scaleSize(150),height:scaleSize(60)}} onPress={()=>{
                        RNExitApp.exitApp();
                    }}>
                      <Text style={{fontSize:16,fontWeight:'bold', textAlign:'center',lineHeight:scaleSize(60),color:'#DB090A'}}>不同意</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{width:scaleSize(150),height:scaleSize(60)}} disabled={this.state.btn_state}  onPress={()=>{
                          simpleStore.save("privacy",true);
                          this.setState({
                            isAgree:true
                          },()=>{
                            DeviceEventEmitter.emit("privacy");
                          })
                    }}>
                      <Text style={{fontSize:16,fontWeight:'bold',textAlign:'center',lineHeight:scaleSize(60),color:this.state.btn_state?'#ddd':'#DB090A'}}>同意</Text>
                    </TouchableOpacity>
                  </View>
                
              </View>
            </>
          }
            </View>
          </TopView>
        </Provider>



      </View>


    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
