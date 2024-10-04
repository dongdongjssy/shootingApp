import React, {Component} from 'react';
import {
    ScrollView,
    AsyncStorage,
    NativeModules,
    Text,
    View,
    ActivityIndicator,
    Animated,
    PushNotificationIOS,
    Platform,
    DeviceEventEmitter,
    InteractionManager,
    TouchableOpacity,
    ImageBackground,
     Image,
    StyleSheet,
} from 'react-native'
import {RouteHelper} from 'react-navigation-easy-helper'
import {inject, observer} from 'mobx-react'
import {images} from '../../res/images';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';

import {
	Toast,
	TabView,
	NavigationBar,
	Overlay
} from 'teaset';

export default{

	show(fromBounds,onSelect,onClose,bgColor){

	   // let fromBounds = {x:x, y:y-5, width, height};
	   // console.warn(fromBounds);
			let overlayView = (
			<Overlay.PopoverView
			style={{alignItems: 'center', justifyContent: 'center'}}
			modal={false}
			overlayOpacity={0}
			fromBounds={fromBounds}
			showArrow={false}
			onCloseRequest={()=>{
				// this.setState({
				// 	lang_arrow_dir:'down',
				// })
				Overlay.hide(this.overlay_key)
				onClose && onClose();
			}}
			>
			<View style={{
				width:scaleSize(105),
				height:scaleSize(87),
				backgroundColor:bgColor, //'rgba(255,255,255,0.5)',
				borderWidth:ONE_PX,
				borderColor:"#ccc",
				borderRadisus:scaleSize(5)}}>
				{
					Object.keys(lang_map).map((item,index)=>{
							return<TouchableOpacity 
							onPress={()=>{
								onSelect && onSelect(item);
								Overlay.hide(this.overlay_key)
							}}
							key={index} style={{flex:1,alignItems:'center',justifyContent:'center'}}>
								<Text style={{fontSize:16,color:'#2b2b2b',color:I18n.locale==item?'#005CB6':'#2B2B2B'}}>
								{lang_map[item]}
								</Text>
							</TouchableOpacity>
					})
				}
			</View> 
			</Overlay.PopoverView>
		);
		this.overlay_key = Overlay.show(overlayView);
	},
	hide(){

	}
}

