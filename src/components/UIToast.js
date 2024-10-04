import React, {Component} from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Image
} from 'react-native';

import {
	Toast,
	TabView,
	NavigationBar,
	Carousel,
	Overlay,
} from 'teaset';
import {
	images
} from '../res/images';
var custom_key=null;
export default{
	success(text,duration=3000){
	 if (custom_key) return;
		let overlayView = (
		  <Overlay.View
		    style={{alignItems: 'center', justifyContent: 'center'}}
		    modal={true}
		    overlayOpacity={0}
		    animated={true}
		    onCloseRequest={()=>{
		    	Overlay.hide(custom_key);
		    	custom_key=null;
		    }}
		    ref={v => this.overlayView = v}
		    >
		   	<ToastContent text={text} icon={images.success_tip_icon} duration={duration} onClose={()=>{
		   		Overlay.hide(custom_key);
		    	custom_key=null;
		   	}}/>
		  </Overlay.View>
		);
		custom_key=Overlay.show(overlayView);
	},
	fail(text,duration=3000){
		if (custom_key) return;
		let overlayView = (
		  <Overlay.View
		    style={{alignItems: 'center', justifyContent: 'center'}}
		    modal={true}
		    animated={true}
		    overlayOpacity={0}
		    onCloseRequest={()=>{
		    	Overlay.hide(custom_key);
		    	custom_key=null;
		    }}
		    ref={v => this.overlayView = v}
		    >
		   	<ToastContent text={text} icon={images.error_tip_icon} duration={duration} onClose={()=>{
		   		Overlay.hide(custom_key);
		    	custom_key=null;
		   	}}/>
		  </Overlay.View>
		);
		custom_key=Overlay.show(overlayView);
	},
	message(text){
		Toast.message(text)
	},
	hide(){
      if (!custom_key) return;
	  Toast.hide(custom_key);
	  custom_key = null;
	},
	loading(){
	
	}
}
class ToastContent extends Component{
	componentDidMount(){
		var {text,duration,icon} = this.props;
		this.timer = setTimeout(()=>{
			clearInterval(this.timer);
			this.props.onClose && this.props.onClose()
		},duration)
	}
	componentWillUnmount(){
		clearInterval(this.timer);
		this.props.onClose && this.props.onClose()
	}
	render(){
		var {text,duration,icon} = this.props;
		return (
			<View style={{
		    		backgroundColor: 'rgba(0,0,0,0.75)', 
		    		width: 200, 
		    		height:200,
		    		borderRadius: 16, 
		    		justifyContent:'center',
		    		alignItems: 'center'}}>
		    	<Image source={icon} style={{width:84,height:84}}/>
		    	<Text style={{color:'#fff',fontSize:16,fontWeight:'400',lineHeight:19,paddingTop:19}}>{text}</Text>
		    </View>
			)
	}
}
// custom_key= Toast.show({
// 	    text:text,
// 	    icon: <Image source={images.success_tip_icon} style={{width:84,height:84,marginHorizontal:54,marginTop:20}} />,
// 	    position: 'center',
// 	    duration: 3000,
// 	  });

