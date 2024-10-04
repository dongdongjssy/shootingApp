import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView
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
export default class ClubItem extends Component {
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
		var {item,index}= this.props;
		return <TouchableOpacity 
		onPress={()=>{
			RouteHelper.navigate("ClubDetailPage",{
				item:item,
			});
		}}
		style={{ 
			flex: 1,
			height:scaleSize(72),
			paddingHorizontal:scaleSize(16),
			flexDirection:'row',
			alignItems:'center',
			 }}>
			<Image 
			style={{width:scaleSize(44),height:scaleSize(44)}}
			source={{uri:item.img}}/>
			<View style={{
				flex:1,
				height:'100%',
				alignItems:'center',
				flexDirection:'row',
				marginLeft:scaleSize(16),
				borderBottomWidth:ONE_PX,
				borderColor:"#E5E5E5"}}>
				<Text style={{color:"#000000",fontWeight:'400',fontSize:18,fontFamily:"PingFang SC"}}>{item.name}</Text>
			</View>
		</TouchableOpacity>
	}

}







var styles={
	
}
