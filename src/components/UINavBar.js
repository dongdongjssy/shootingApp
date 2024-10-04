/**
 *
 * Copyright 2016-present reading
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from 'react';
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Image,
} from 'react-native';
import { images } from '../res/images';
import {
	Toast,
	TabView,
	Carousel,
	NavigationBar
} from 'teaset';
import { RouteHelper } from 'react-navigation-easy-helper'
import { observer } from 'mobx-react'


export default class UINavBar extends React.Component {
	getLeftView() {
		if (this.props.leftView === null) {
			return null;
		}
		if (this.props.leftView) {
			return this.props.leftView;
		}

		return <TouchableOpacity
			onPress={() => {
				RouteHelper.goBack();
			}}
			style={{ flex: 1, marginLeft: scaleSize(6), alignItems: 'center', justifyContent: 'center' }}>
			<Image source={images.back}
				resizeMode="contain"
				style={{
					width: scaleSize(20),
					height: scaleSize(20),
					tintColor: '#FFFFFF',
					...this.props.backIconStyle
				}} />
		</TouchableOpacity>
	}
	render() {
		return (
			<NavigationBar
				style={{ position: 'relative', backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : PRIMARY_COLOR, ...this.props.style }}
				title={this.props.title}
				titleStyle={{ color: '#FFFFFF', fontFamily: 'PingFang SC', fontWeight: "bold", fontSize: scaleSize(18) }}
				leftView={this.getLeftView()}
				rightView={this.props.rightView}
				statusBarStyle={'dark-content'}
			/>
		)
	}
}


const styles = StyleSheet.create({
	base: {

	},
	no_data: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 100
	},
	refreshControlBase: {
		backgroundColor: 'transparent'
	}
});
