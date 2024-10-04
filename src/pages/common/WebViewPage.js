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
    BackHandler,
    ProgressViewIOS,
    ProgressBarAndroid,
    DeviceInfo
} from 'react-native'
import {RouteHelper} from 'react-navigation-easy-helper'
import {inject, observer} from 'mobx-react'
import images from '../../res/images';
import {
	Toast,
	TabView,
	NavigationBar
} from 'teaset';
import { WebView } from "react-native-webview";
import UINavBar from '../../components/UINavBar';


@inject('UserStore') //注入；
@observer
export default class WebViewPage extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
			title:this.props.navigation.state.params.title||"",
			uri:this.props.navigation.state.params.url||'https://www.baidu.com/s?wd=%E6%97%B6%E9%97%B4%E6%A0%BC%E5%BC%8F&rsv_spt=1&rsv_iqid=0xc6414629000b91d7&issp=1&f=8&rsv_bp=1&rsv_idx=2&ie=utf-8&tn=baiduhome_pg&rsv_enter=1&rsv_dl=tb&rsv_sug3=22&rsv_sug1=18&rsv_sug7=101&rsv_sug2=0&inputT=4441&rsv_sug4=4442',
			progress:0,
	    };	
	    this.UserStore= this.props.UserStore;
	    this.canGoBack=false;
	}
	async componentDidMount(){
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}
	handleBackPress = () => {
	    // this.goBack(); // works best when the goBack is async
	    var params_data =this.props.navigation.state.params
	    params_data.onGoBackPress && params_data.onGoBackPress();
	    if(this.canGoBack){
	    	this.refs.webview.goBack();
	    	// console.warn('this.webview',this.webview);
	    	return true;
	    }
	    return false;
	}
	componentWillUnmount() {
	    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	  }
	  renderProgressBar(){
		if(_IOS_){
			return <ProgressViewIOS
                    //这是进度条颜色
                    progressTintColor="#1b75bb"
                    progress={this.state.progress}/>
		}else{
			return <ProgressBarAndroid
	          styleAttr="Horizontal"
	          color="#1b75bb"
	          indeterminate={false}
	          progress={this.state.progress}
	        />
		}
	}
	render(){
		return (<View style={{flex:1}}>
			<UINavBar 
				title={this.state.title}
			/>
			{this.state.progress !== 1 && this.renderProgressBar()}
			<View style={{flex:1,overflow:'hidden'}}>
				<WebView
					ref="webview"
			        source={{ uri: this.state.uri }}
			        style={{ marginTop: 20 }}
			         originWhitelist={['*']}
			        onLoadProgress={({nativeEvent}) => {
			        	console.log(nativeEvent.progress)
			        	this.setState({
			        		progress: nativeEvent.progress
			        	})
			        }}
			        onError={(syntheticEvent)=>{
			        	const { nativeEvent } = syntheticEvent;
			        	console.warn('WebView error: ', nativeEvent);
			        }}
			        onNavigationStateChange={navState => {
					    // Keep track of going back navigation within component
					    // console.log("navState",navState);
					    this.canGoBack = navState.canGoBack;
					}}
					renderError={errorName => {
						return <View style={{justifyContent:"center",alignItems:'center',flex:1}}><Text>{errorName}</Text></View>
					}}
			      />
			      {DeviceInfo.isIPhoneX_deprecated
			      ?<View style={[{height:34}, {backgroundColor: 'transparent'}]}/>
			      :null
			      }
			</View>
		</View>)
	}

}

