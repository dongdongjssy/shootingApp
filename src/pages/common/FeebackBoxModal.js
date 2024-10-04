import React, {Component} from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert,
    View,
    Platform,
    Text,
    ActivityIndicator,
    ProgressBarAndroid,
    ActivityIndicatorIOS,
    Image,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import {
    ListRow,
    Toast,
    Badge,
    Input,
    Button,
    SearchInput,
    NavigationBar,
    Checkbox,
    Overlay
} from 'teaset'
// import * as WeChat from 'react-native-wechat'
import * as WeChat from 'react-native-wechat-lib';

import {inject, observer} from 'mobx-react'
import {toJS} from 'mobx';
import {RouteHelper} from 'react-navigation-easy-helper'
import {images} from '../../res/images';
import { scanFile } from 'react-native-fs';
import { scaleSize } from '../../global/utils';
export default {
	checkInstallWX(callback){
      WeChat.isWXAppInstalled().then((isInstalled)=>{
      	if(!isInstalled){
      		 return Alert.alert('请安装微信');
      	}
      	callback();
      })
	},
	//"title":title,"content":content,"shareUrl":shareUrl
	show(options={}){
		var overlay_key=null;
		var shareTitle = "动态";
		if(options.title==null || options.title == undefined || options.title == "" || options.title.length == 0){
           shareTitle = "动态";
		}else{
		   shareTitle = options.title;
		}
		var shareContent = "";
		if(options.content==null || options.content == undefined || options.content == "" || options.content.length == 0){
            shareContent = "点击查看更多";
        }else{
       	    shareContent = "点击查看更多";
       	}
		///alert("shareTitle"+shareTitle);
		let overlayView = (
		  <Overlay.PullView
		  	// type={'zoomIn'}
		  	side="bottom"
		    style={{alignItems: 'center', justifyContent: 'center'}}
		    >
		    <View style={{backgroundColor: '#fff', width:SCREEN_WIDTH,height: scaleSize(240)}}>
				<View style={{flexDirection: 'row',padding: scaleSize(15),marginLeft: scaleSize(15),borderBottomColor: '#E9E9E9',borderBottomWidth: scaleSize(1)}}>
					<Image
						resizeMode="contain"
						source={images.common.share} style={{ width: scaleSize(22), height: scaleSize(22),marginRight: scaleSize(10) }}
					/>
					<Text style={{fontSize: scaleSize(18),lineHeight: scaleSize(22)}}>分享</Text>
				</View>
		   		<View style={{flex:1,flexDirection:'row',alignItems:'center',marginLeft: scaleSize(15),borderBottomColor: '#E9E9E9',borderBottomWidth: scaleSize(1)}}>
		   			<TouchableOpacity onPress={ async () => {
						this.checkInstallWX( async ()=>{
							let result = await WeChat.shareWebpage({
								title:shareTitle,
								description: options.content,
								webpageUrl:options.shareUrl,
								thumbImageUrl:'https://zjw.tjjzshw.com/logo.jpg',
								scene:0
							});
						})
		   			}} style={styles.share_item}>
		   				<Image style={styles.share_icon} source={images.share.wx_icon} />
		   				<Text  style={styles.share_text}>微信好友</Text>
		   			</TouchableOpacity>
		   			
		   			<TouchableOpacity onPress={ async () => {
						this.checkInstallWX( async ()=>{
			   				let result = await WeChat.shareWebpage({
									title:shareTitle,
									description: options.content,
									webpageUrl:options.shareUrl,
									thumbImageUrl:'http://static.boycodes.cn/shejiixiehui-images/logo.png',
									scene:1
								});
			   			})                  
		   			}} style={styles.share_item}>
		   				<Image style={styles.share_icon} source={images.share.friend_circle_icon} />
		   				<Text style={styles.share_text}>朋友圈</Text>
		   			</TouchableOpacity>
		   		</View>

				<TouchableOpacity 
				onPress={() => {
					RouteHelper.navigate("ReportPage")
					Overlay.hide(overlay_key);
				}}
				style={{flex:1,flexDirection: 'row',alignItems: 'center',paddingLeft: scaleSize(25),position: 'relative'}}>
					<Image
						resizeMode="contain"
						source={images.common.report} style={{ width: scaleSize(22), height: scaleSize(22),marginRight: scaleSize(10) }}
					/>
					<Text style={{fontSize: scaleSize(18),marginRight:scaleSize(15)}}>举报</Text>
					<Text style={{fontSize: scaleSize(14),color: 'rgba(0,0,0,0.5)'}}>违法、时政、色情等</Text>
					<Image
						resizeMode="contain"
						source={images.common.arrow} style={{ width: scaleSize(18), height: scaleSize(18),position:'absolute',right: scaleSize(10) }}
					/>
				</TouchableOpacity>
				
		   		<TouchableOpacity 
		   		onPress={()=>{
		   			Overlay.hide(overlay_key);
		   		}}
		   		style={styles.foot_btn}>
		   			<Text style={{fontSize:16,fontWeight:"400"}}>取消</Text>
		   		</TouchableOpacity>
		    </View> 
		  </Overlay.PullView>
		);
		overlay_key=Overlay.show(overlayView);		
	}
}

var styles= StyleSheet.create({
	title:{
		fontSize:setSpText(15),
		fontWeight:'bold',
		lineHeight:30
	},
	foot_btn:{
		height:scaleSize(50),
		width:'100%',
		alignItems:'center',
		justifyContent:'center',
		backgroundColor: '#F5F6F8'
	},
	head_img:{
		width:scaleSize(397),
		height:scaleSize(191),
		position:"absolute",
		top:scaleSize(-191),
		left:scaleSize(60),
	},
	share_icon:{
		width:scaleSize(50),
		height:scaleSize(50)
	},
	share_item:{
		flex:1,
		alignItems:'center',
		// justifyContent:"center",
		flexDirection: 'row'
	},
	share_text:{
		color:'rgba(0,0,0,0.80)',
		fontSize:16,
		fontWeight:'400',
		marginTop:scaleSize(0),
	}
})





