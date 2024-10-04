import { StyleSheet,DeviceEventEmitter,Alert,ToastAndroid,Linking} from 'react-native'
import {
  Toast
} from 'teaset';
import DeviceInfo from 'react-native-device-info';
import CodePush from 'react-native-code-push'
import {AppStore} from '../store/AppStore';
onCodepushStatus(); //codepush 状态监听；

global.codePushCheckForUpdate=async function(isClickCheck){



	try {
        const message = await  CodePush.checkForUpdate(codepush_key);
        console.log("checkForUpdate",message);
        // alert("aaa")
        if (message) {
            const {
                appVersion,
                deploymentKey,
                description,
                failedInstall,
                isFirstRun,
                isMandatory,
                isPending,
                label,
                packageHash,
                packageSize,
                download,
                downloadUrl
            } = message;
            // console.log('size', packageSize);
            var updateDialog={
                        appendReleaseDescription: true,//是否显示更新description，默认为false
                        descriptionPrefix: "更新内容：",//更新说明的前缀。 默认是” Description:
                        mandatoryContinueButtonLabel: "立即更新",//强制更新的按钮文字，默认为continue
                        mandatoryUpdateMessage: "",//- 强制更新时，更新通知. Defaults to “An update is available that must be installed.”.
                        optionalIgnoreButtonLabel: '稍后',//非强制更新时，取消按钮文字,默认是ignore
                        optionalInstallButtonLabel: '后台更新',//非强制更新时，确认文字. Defaults to “Install”
                        optionalUpdateMessage: '有新版本了，是否更新？',//非强制更新时，更新通知. Defaults to “An update is available. Would you like to install it?”.
                        title: '更新提示'//要显示的更新通知的标题. Defaults to “Update available”.
                    };
            await CodePush.notifyAppReady();
              // alert("111");   
            CodePush.sync(
                {
                    deploymentKey: codepush_key,
                    installMode: CodePush.InstallMode.IMMEDIATE,
                    updateDialog: updateDialog
                },
                state => {
                    // console.log('code-push-state', state);
                    DeviceEventEmitter.emit("code-push-state",state);
                },
                progress => {
                    console.log(progress);
                    // let title = "当前下载进度：" + msg 
                    // console.log(progress);
                    // receivedBytes: 804428, totalBytes: 6777301
                    // console.log('code-push-progress',(progress*100)+"%");
                    DeviceEventEmitter.emit("code-push-progress",progress);
                });
        } else {
            // alert("111");
            if(isClickCheck){
                Toast.success("当前为最新版本了！");
            }
            CodePush.sync();//就算没有更新也需要调用一次，不然会执行回滚
            if (__DEV__) {
                // alert("333");
                console.log('code-push没有新版')
            }
        }
        
    } catch (e) {
        console.log('checkForUpdate--error', e)
    }
}


async function onCodepushStatus(){
      // console.log('CodePush', await CodePush.getCurrentPackage())

        DeviceEventEmitter.addListener("code-push-state",(status)=>{
         console.log('code-push-state', status);
          switch(status) {
                  case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                    // this.setState({
                    //   isUpdateModal:true
                    // });
                    console.log("Checking for updates.");
                     Toast.message("正在检查安装");
                     
                    break;
                  case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                      // console.log("Downloading package.");
                      Toast.message("正在下载安装包...");
                      // this.setState({
                      //     installState:"正在下载安装包..."
                      //  })                    
                      break;
                  case CodePush.SyncStatus.INSTALLING_UPDATE:
                      console.log("Installing update.");
                      Toast.message("正在安装...");
                                            
                      break;
                  case CodePush.SyncStatus.UP_TO_DATE:
                      // console.log("Installing update.");
                      Toast.smile("安装完成了");
                        
                      break;
                  case CodePush.SyncStatus.UPDATE_IGNORED:
                      Toast.message("取消了更新");
                      // this.setState({ progress: false });
                      break;
                  case CodePush.SyncStatus.UPDATE_INSTALLED:
                      console.log("Update installed.");
                                          
                      break;
                  case CodePush.SyncStatus.UNKNOWN_ERROR:
                      Toast.message("出错了");
                      // this.setState({progress: false });
                      break;
                }

        });
        DeviceEventEmitter.addListener("code-push-progress",(progress)=>{
          var percentage = (progress.receivedBytes/progress.totalBytes).toFixed(2);
          if(Number(percentage)==0.98){
            
          }
          var progress=parseInt((Number(percentage)*100));
          Toast.message("已下载:"+progress+"%");       

      });     
}