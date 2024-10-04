import React, { Component } from 'react';
import {
	View,
	Image,
	Text
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import {images} from '../../res/images';
import {
	Toast
} from 'teaset';

@inject('UserStore') //注入；
@observer
export default class tmp extends Component {
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
		return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			{/* <Text>launcher...</Text> */}
			<Text style={{fontSize:30,fontWeight:'bold'}}>peixun</Text>
		</View>
	}

}







