import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	TextInput
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
export default class SearchPage extends Component {
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
		return <View style={{ flex: 1 }}>
			{/* <Text>launcher...</Text> */}
			<UINavBar 
				title="搜索"
			/>
			<View style={{flex:1,alignItems:'center'}}>
					<View style={{height:scaleSize(20)}}></View>
				<View style={styles.search_bar}>
					<View style={{
						width:scaleSize(50),
						alignItems:'center',
						justifyContent:'center',
						borderRightWidth:ONE_PX,
						borderColor:"#ccc",
				}}>
						<Text style={{color:"#D43D3E",fontSize:15}}>好友</Text>
					</View>
					<TextInput 
					placeholder="搜索好友"
					style={styles.input}
					onChangeText={()=>{

					}}
					/>
				</View>
				<View style={{height:scaleSize(30)}}></View>
			</View>
		</View>
	}

}


var styles={
	input:{
		margin:0,padding:0,
		paddingLeft:scaleSize(10),
		fontSize:15,
	},
	search_bar:{
		backgroundColor:"rgba(242,246,249,1)",
		borderRadius:scaleSize(3),
		// alignItems:'center',
		// justifyContent:'center',
		flexDirection:'row',
		width:scaleSize(355),
		height:scaleSize(35),
	},
	search_bar_text:{
		color:"#BBBBBB",
		fontSize:15,
		fontFamily:"PingFangSC-Regular",
	},
	search_icon:{
		marginRight:scaleSize(6),
		width:scaleSize(15),
		height:scaleSize(15),
	},
	row:{
		alignItems:'center',
		justifyContent:'center',
		height:scaleSize(50),
		flexDirection:'row',
	},
	item:{
		flex:1,
		alignItems:'center',
		justifyContent:'center',
	}
}




