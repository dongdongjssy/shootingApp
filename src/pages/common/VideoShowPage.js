import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import {images} from '../../res/images';
import {
  Toast,
    TabView,
    AlbumView,
    Overlay,
    Carousel,
    TransformView,
    NavigationBar
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import RNFS from 'react-native-fs';
// console.log("CameraRoll",CameraRoll);
import CameraRoll from "@react-native-community/cameraroll";
import Video from '../../libs/react-native-af-video-player';

@inject('UserStore') //注入；
@observer
export default class VideoShowPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeIndex:this.props.defaultIndex,
		};
		this.UserStore = this.props.UserStore;

	}

	async componentDidMount() {
		
		
	}
		
	render() {
		console.log("this.props.url",this.props.url);
		return <View style={{ flex: 1 ,backgroundColor:"#393939"}}>
			<UINavBar 
			rightView={this.props.rightView}
			title="" 
      		style={{backgroundColor:"transparent",zIndex:999,position:"absolute",zIndex:999}} />
      
      <Video 
      style={{flex:1}}
      autoPlay={true}
      inlineOnly={true}
      resizeMode={'cover'}
      url={this.props.url}
      />
		</View>
	}

}







