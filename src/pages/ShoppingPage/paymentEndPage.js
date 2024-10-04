import React, { Component } from 'react'
import { Text, View,TouchableOpacity, Image, StyleSheet, ScrollView,DeviceEventEmitter} from 'react-native'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import { RouteHelper } from 'react-navigation-easy-helper'
import Url from '../../api/Url'
import Request from '../../api/Request'
import { Toast, ModalIndicator } from 'teaset';
import { scaleSize } from '../../global/utils'
import { UserStore } from '../../store/UserStore';
import ApiUrl from '../../api/Url';
import WebViewHtmlView from '../../components/WebViewHtmlView';
import UIConfirm from '../../components/UIConfirm';
import ImagePicker from 'react-native-image-picker'
import { StackActions,NavigationActions } from 'react-navigation';


export default class PaymentEndPage extends Component {
    constructor(props) {
		super(props);
		this.state = {
            bigOrderId:props?.bigOrderId,
            loginuser:null,
            isPictureloading:false,
            submitForm: new FormData(),
            picture:'',
            isShili:false,
		};
	}

    componentDidMount(){
        console.log(this.state.bigOrderId);
        UserStore.getLoginUser().then(user => {
			this.setState({ loginuser: user })
		})
    }

    onBackAndroid() {
            return true;
    }

    addPicture(){
        const options = {
			title: '选择图片',
			cancelButtonTitle: '取消',
			takePhotoButtonTitle: '拍照',
			chooseFromLibraryButtonTitle: '选择照片',
			cameraType: 'back',
			mediaType: 'camera',
			videoQuality: 'high',
			durationLimit: 10,
			maxWidth: 1000,
			maxHeight: 1000,
			quality: 0.8,
			angle: 0,
			cropping: true,
			allowsEditing: false,
			noData: false,
			storageOptions: {
				skipBackup: true
			}
		}
        ImagePicker.showImagePicker(options, async (response) => {
			if (response.didCancel) {
				console.debug('User cancelled photo picker')
			} else if (response.error) {
				Toast.message("选择照片出错，请重试")
			} else if (response.customButton) {
				console.debug('User tapped custom button: ', response.customButton)
			} else {

				this.setState({ isPictureloading: true })

				let uploadFile = {
					uri: Platform.OS === 'android' ? response.uri : response.uri.replace('file://', ''),
					type: 'application/octet-stream',
					name: 'aaaaa.jpg'
				}
				// console.log('uploadFile',uploadFile);
				let formData = this.state.submitForm;

					formData.append('image1File', uploadFile);
					this.setState({ picture: response.uri, isPictureloading: false, submitForm: formData })
			}
		})
        // RouteHelper.navigate("OrderDetailPage")
    }

    submitPicture(){
        if(this.state.picture==''){
            DeviceEventEmitter.emit("addEva");
            RouteHelper.navigate("OrderPage",{status:0})
            return;
        }
        console.log(this.state.loginuser?.token);
        this.state.submitForm.append("id", this.state.bigOrderId)

        this.forceUpdate()

		ModalIndicator.show("信息提交中")

		fetch(Url.ORDER_UPLOAD, {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + this.state.loginuser?.token,
				 'Content-Type': 'multipart/form-data',
			},
			body: this.state.submitForm
		}).then(res => {
			return res.json()
		}).then((res) => {
			console.log("提交结果: ", res)
			if(res.error) {
				this.state.submitForm = new FormData()
				this.forceUpdate()
				ModalIndicator.hide()
				Toast.message("信息提交出错，请重试")
			} else if (res.code === 0) {
                Toast.message("上传成功")
                ModalIndicator.hide()
                DeviceEventEmitter.emit("addEva");
                RouteHelper.navigate("OrderPage",{status:0})
			} else {
				this.state.submitForm = new FormData()
				this.forceUpdate()
				ModalIndicator.hide()
				Toast.message("登陆失效")
                DeviceEventEmitter.emit("addEva");
                RouteHelper.navigate("OrderPage",{status:0})
			}
		}).catch((error) => {
			this.state.submitForm = new FormData()
			this.forceUpdate()
			console.debug("提交身份证出错: ", JSON.stringify(error));
			Toast.message("信息提交出错，请重试");
			ModalIndicator.hide()
		})
    }

    render(){
        return<View style={{flex:1,backgroundColor:'#F5F6F8'}}>
            
                     {
                        this.state.isShili&&<View style={{width:'100%',height:'100%',backgroundColor: 'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',justifyContent:'center',position:'absolute'}}>
                            <View   style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                                 <Text style={{textAlign:'center',lineHeight:scaleSize(33)}}></Text>
                                <TouchableOpacity style={{width:scaleSize(60),height:scaleSize(33),marginBottom:scaleSize(10),marginRight:scaleSize(12.5),borderWidth:1,borderColor:'#fff',borderRadius:scaleSize(4)}} onPress={()=>{
                                    this.setState({
                                        isShili:false
                                    })
                                }}>
                                    <Text style={{textAlign:'center',lineHeight:scaleSize(33),color:'#fff'}}>返回</Text>
                                </TouchableOpacity>
                            </View>

                            <Image style={{width:scaleSize(350),height:'85%',marginLeft:scaleSize(12.5)}} source={images.fukuanshili}></Image>
                        </View>
                    }
                    <UINavBar title="确认付款" leftView={null}/>
                    {/* <View style={styles.paymentSuccess}>
                        <Text style={{fontSize:scaleSize(12),fontWeight:'bold',color:'#ff0000',marginTop:scaleSize(15)}}>请上传付款凭证截图，待商城管理员确认后安排发货</Text>
                    </View> */}

                    <View style={styles.content}>
                    <Image style={{width:scaleSize(141),height:scaleSize(128.18)}} source={images.common.register_success}></Image>

                        <View style={{width:'100%',  display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>

                        <Text style={{width:scaleSize(200), fontSize:scaleSize(18),fontWeight:'bold',color:'#ff0000',marginLeft:scaleSize(16.03)}}>1.上传付款凭证截图
                         </Text>

                        <TouchableOpacity onPress={()=>{
                            this.setState({
                                isShili:true
                            })
                        }}>
                            <View style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                <Image style={{width:scaleSize(18),height:scaleSize(18)}} source={images.shili}></Image>
                                <Text style={{fontSize:scaleSize(14),fontWeight:'400',color:'#333333',marginLeft:scaleSize(10)}}>付款凭证示例</Text>
                                {/* <Image style={{width:scaleSize(18),height:scaleSize(18),marginLeft:scaleSize(10)}} source={images.dayoujiantou}></Image> */}
                            </View>
                        </TouchableOpacity>
                            {/* <Image style={{width:scaleSize(28),height:scaleSize(28)}} source={images.dengpao}></Image> */}
     
                    </View>


 
                        {
                            this.state.picture?<TouchableOpacity style={{marginTop:scaleSize(36)}} onPress={()=>this.addPicture()}>
                            <Image style={{width:scaleSize(300),height:scaleSize(195)}} source={{uri: this.state.picture}}></Image>
                        </TouchableOpacity>:<TouchableOpacity style={{marginTop:scaleSize(36)}} onPress={()=>this.addPicture()}>
                            <Image style={{width:scaleSize(300),height:scaleSize(195)}} source={images.shangchuan} resizeMode='cover'></Image>
                        </TouchableOpacity>
                        }
 
 <View style={{width:'100%',display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
            <Text style={{fontSize:scaleSize(18), fontWeight:'bold',color:'#ff0000',marginLeft:scaleSize(16.03)}}>2.提交商城管理员确认收款
            </Text>
            <TouchableOpacity onPress={()=>{
                            this.setState({
                                isShili:true
                            })
                        }}>
                            <View style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                <Text style={{fontSize:scaleSize(14),fontWeight:'400',color:'#fff',marginLeft:scaleSize(10)}}>付款凭证示例</Text>
                                {/* <Image style={{width:scaleSize(18),height:scaleSize(18),marginLeft:scaleSize(10)}} source={images.dayoujiantou}></Image> */}
                            </View>
                        </TouchableOpacity>
 </View>

                        
                        <TouchableOpacity style={styles.addPicturl} onPress={()=>this.submitPicture()}>
                            <Text style={{textAlign:'center',lineHeight:scaleSize(56)}}>提交截图</Text>
                        </TouchableOpacity>
                    </View>
        </View>
    }

}

var styles = StyleSheet.create({
    paymentSuccess:{
        width:'100%',
        height:scaleSize(210),
        backgroundColor:'#fff',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center'
    },

    content:{
        flex:1, 
        width:'100%',
        backgroundColor:'#fff',
        marginTop:scaleSize(15),
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-around',
        alignItems:'center'
    },

    addPicturl:{
        width:scaleSize(250),
        height:scaleSize(56),
        borderWidth:scaleSize(1),
        borderColor:'#4f4f4f',
    }
})