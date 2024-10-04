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
export default class AutoWHImage extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
			width:0,
			mstyle:{
			},
	    };	
	    this.UserStore= this.props.UserStore;
	}
	componentDidMount(){
		var {width,height} =  Image.resolveAssetSource(this.props.source)

		if(this.props.width &&this.props.height){
			this.setState({
				mstyle:{
					width:this.props.width,
					height:this.props.height,
				}
			});
		}else if(this.props.width && !this.props.height){
			var mheight = width/height /this.props.width;
			this.setState({
				mstyle:{
					width:this.props.width,
					height:mheight,
				}
			});
		}else if(!this.props.width && this.props.height){
			var mwidth = width/height *this.props.height;
			// console.warn(mwidth,this.props.height,width,height)
			this.setState({
				mstyle:{
					width:mwidth,
					height:this.props.height,
				}
			});
		}
	}

	render(){
		return <Image
			{...this.props}
			source={this.props.source}
			style={[this.state.mstyle,this.props.style]}
		/>
	}

}

