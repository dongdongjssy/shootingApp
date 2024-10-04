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
import {
	Toast,
	TabView
} from 'teaset';

@inject('UserStore') //注入；
@observer
export default class UIArrow extends Component {
	constructor(props) {
	    super(props);
	    this.state = {

	    };	
	    this.UserStore= this.props.UserStore;
	}
	static defaultProps = {
	  color: '#666',
	  width:6
	}
	async componentDidMount(){
		
	}

	render(){
		var  conStyle={       
		borderWidth:this.props.width,
       borderTopColor:'#666',//下箭头颜色
       borderLeftColor:'transparent',//右箭头颜色
       borderBottomColor:'transparent',//上箭头颜色
       borderRightColor:'transparent'//左箭头颜色
   	}
   	var borderColor=this.props.color;
   		if(this.props.dir=='bottom'){
   			conStyle.borderTopColor=borderColor;
			conStyle.borderLeftColor='transparent',//右箭头颜色
	        conStyle.borderBottomColor='transparent',//上箭头颜色
	        conStyle.borderRightColor='transparent'//左箭头颜色
   		}
		return  <View style={[styles.arrow,conStyle,this.props.style]}/>
	}

}


const styles=StyleSheet.create({
   arrow:{
       width:0,
       height:0,
       borderStyle:'solid',
   }
})