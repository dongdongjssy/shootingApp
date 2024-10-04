import React, { Component } from 'react';
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
import AutoHeightWebView from './AutoHeightWebView/index.js';
import { RouteHelper } from 'react-navigation-easy-helper'

export default class WebViewHtmlView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			htmlHegiht: 0,
			isLoading: true,
		};
	}
	static defaultProps = {
		content: ''
	}
	componentDidMount() {

	}

	render() {
		var content = this.props.content;
		// console.log("content",content);
		// content = content.replace(/https\:\/\/api\.arefa-china\.com\//g,"http://api.arefa-china.com/")
		// console.log("content", content);
		// return <Image 
		// style={{width:100,height:200}}
		// onError={(err)=>{
		// 	console.log("err", err.nativeEvent.error);
		// }}
		// source={{ uri:"https://api.arefa-china.com/map_src/recommend/45f6b24aac431cc8b4039964082877f3.jpg"}}
		//  />
		return (<AutoHeightWebView
			// onLoadStart={syntheticEvent => {
			//           // update component to be aware of loading status
			//               const { nativeEvent } = syntheticEvent;
			//               this.setState({
			//               	isLoading:nativeEvent.loading,
			//               })
			//           }}
			//           onLoadEnd={syntheticEvent => {
			//            // update component to be aware of loading status
			//            const { nativeEvent } = syntheticEvent;
			//            // this.isLoading = nativeEvent.loading;
			//             this.setState({
			//               	isLoading:nativeEvent.loading,
			//               });
			//         }}
			source={{ html: content }}
			style={[{ marginTop: 0, height: this.state.htmlHegiht || 40, width: '100%' }]}
			onSizeUpdated={(size) => {
				if (size.height != this.state.htmlHegiht) {
					this.props.onSizeUpdated && this.props.onSizeUpdated(size);
					// if (this.state.htmlHegiht > size.height){
					// 	// this.setState({
					// 	// 	htmlHegiht: size.height,
					// 	// });
					// }else{
					this.setState({
						htmlHegiht: size.height,
					});
					// }
					console.log("size", size);
					this.props.onLoad && this.props.onLoad()
				}
			}}
			startInLoadingState={true}
			renderLoading={() => {
				return <View style={{alignItems:'center',justifyContent:'center'}}>
					<ActivityIndicator size='large' color="#D43D3E" />
					<Text style={{fontSize:16,color:"#999",marginTop:6}}>加载中...</Text>
				</View>	
			}}
			onClickImg={(data) => {
				// alert(url);
				console.log("imgdata",data)
				RouteHelper.navigate("BigImageShowPage", {
					imgs: data.urls.map((item) => {
						return { url: item }
					}),
					defaultIndex: data.curIndex,
				})

			}}
			zoomable={false}
			scrollEnabledWithZoomedin={false}

			viewportContent={'viewport-fit=cover,user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0'}
			// disableTouchHideKeyboard={true}
			customScript={`

		    	`}
			scalesPageToFit={true}
			customStyle={`
			     img{
			     	max-width:100%!important;
			     	height:auto!important;
					 object-fit:contain;
					 min-height:20px;
					 min-width:100px;
			     }
			     p{
					 text-align:justify;
			     }
			     body{

			     }
			    `}
		/>)
	}

}

