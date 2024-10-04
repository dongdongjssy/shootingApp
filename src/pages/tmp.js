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
		return <View style={{ flex: 1 }}>
			<UINavBar title="动态" />
		</View>
	}

}







var styles={
	
}
