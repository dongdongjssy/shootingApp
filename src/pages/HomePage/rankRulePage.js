import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity,DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { observer } from 'mobx-react'
import { images } from '../../res/images';
import UINavBar from '../../components/UINavBar';
import UITabBar from '../../components/UITabBar';
import WebViewHtmlView from '../../components/WebViewHtmlView';
import ApiUrl from '../../api/Url.js';
import request from '../../api/Request';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';
import { scaleSize } from '../../global/utils';

@observer
export default class SubMenu extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: undefined,
			rankTabIndex: 0,
			resData: {}
		};
	}

	async componentDidMount() {
		DeviceEventEmitter.addListener('userUpdated', (res) => {
			if (res.user) {
				this.setState({ loginuser: res.user })
			}
		})

		this.getRuleData()
	}

	async getRuleData(){
		await request.post(ApiUrl.RANKINSTRUCTIONS_LIST, {}).then(res => {
			if (res?.status === ResponseCodeEnum.STATUS_CODE) {
				this.setState({
					resData: res?.data?.rows[0]
				})
			}
		}).catch(err => console.log(err));
	}


	render() {
		return <SafeAreaViewPlus style={{ flex: 1, backgroundColor: '#F2F6F9' }}>
			<UINavBar title="规则说明" />
			<UITabBar
				onChange={(index) => {
					this.setState({
						rankTabIndex: index,
					})
				}}
				activeIndex={this.state.rankTabIndex}
			>
				<UITabBar.Item label="我的成绩说明">
					<View style={{ flex: 1,minHeight: scaleSize(500),padding: scaleSize(10) }}>
						<WebViewHtmlView content={this.state.resData?.myRank} />
					</View>
				</UITabBar.Item>
				<UITabBar.Item label="赛事成绩说明">
					<View style={{ flex: 1,minHeight: scaleSize(500),padding: scaleSize(10) }}>
						<WebViewHtmlView content={this.state.resData?.matchRank} />
					</View>
				</UITabBar.Item>
				<UITabBar.Item label="年度积分说明">
					<View style={{ flex: 1,minHeight: scaleSize(500),padding: scaleSize(10) }}>
						<WebViewHtmlView content={this.state.resData?.annualIntegral} />
					</View>
				</UITabBar.Item>
			</UITabBar>
		</SafeAreaViewPlus>
	}
}







