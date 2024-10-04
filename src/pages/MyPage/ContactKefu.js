import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	ImageBackground,
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import {images} from '../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../components/UINavBar';

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			launcher_img: [],
		};
		this.UserStore = this.props.UserStore;

	}

	async componentDidMount() {
		
		
	}
	
	render() {
		return <View style={{ flex: 1 ,backgroundColor:"#F2F6F9"}}>
			<UINavBar title="联系客服" />
			<View style={{flex:1,paddingHorizontal:scaleSize(15)}}>
				<TouchableOpacity 
				style={{height:scaleSize(50),flexDirection:'row',alignItems:'center',justifyContent:"space-between"}}>
					<Text style={{color:"#000",fontSize:18}}>客服电话：</Text>
					<Text style={{color:"#000",fontSize:18}}>12345678910</Text>
				</TouchableOpacity>
			</View>
		</View>
	}

}







var styles={
	
}
