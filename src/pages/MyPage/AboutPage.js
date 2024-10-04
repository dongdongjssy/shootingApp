import React, { Component } from 'react'
import { View, Image, Text, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import store from '../../store'
import UIConfirm from '../../components/UIConfirm'
import { scaleSize } from '../../global/utils'
import DeviceInfo from 'react-native-device-info';

// screen
const { width } = Dimensions.get('window');

export default class AboutPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: undefined,
			isNormalUser: true
		}
	}

	async componentDidMount() {
		const user = await store.UserStore.getLoginUser()
		this.state.loginuser = user
		this.forceUpdate()
		if(!(/^[1][3,4,5,7,8,9][0-9]{9}$/.test(user.phone))){
			this.setState({
				isNormalUser: false
			})
		}
	}

	logout = () => {
		UIConfirm.show("确定退出应用吗？", () => {
			//confirm
			store.UserStore.cleanLoginUser()
			RouteHelper.reset("LoginPage")
		}, () => {
			//cancel
		})
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<UINavBar title="通用" />
				<View style={{ flex: 1, backgroundColor: "#F2F6F9", alignItems: 'center' }}>
					<View style={{ height: 1 }}></View>
					<ScrollView contentContainerStyle={{ flex: 1 }}	>
						{/* <ListRow title="总会官员" onPress={() => RouteHelper.navigate("ContactAssociation")} />/ */}
						<ListRow title="APP客服" onPress={async () => {
							var loginuser = await store.UserStore.getLoginUser()

							RouteHelper.navigate('ChatPage', {
								loginUser: loginuser,
								conversation: {
									user: {
										nickname: "CPSA客服",
										username: "CPSA",
										name: "CPSA客服"
									},
									type: 'single'
								}
							})
						}} />
						<ListRow title="帮助与反馈" onPress={() => RouteHelper.navigate("Help")} />
						{/* <ListRow title="服务协议" onPress={() => RouteHelper.navigate("ServiceAggreement")} /> */}
						<ListRow title="隐私政策" onPress={() => RouteHelper.navigate("PrivacyPolicy")} />
						{
							!this.state.isNormalUser && <ListRow title="修改密码" onPress={() => RouteHelper.navigate("EditPassword")} />
						}
						
						<TouchableOpacity
							onPress={()=>{
								// codePushCheckForUpdate();
							}}
							style={{
								height: scaleSize(72),
								flexDirection: "row",
								alignItems: 'center',
								borderBottomWidth: 1,
								borderColor: "#E5E5E5",
								backgroundColor: "#fff",
								width: width,
							}}
						>
							<View style={{ paddingLeft: scaleSize(15) }}>
								<Text style={{ color: "#000", fontSize: 18, fontFamily: 'PingFang SC', fontWeight: "400" }}>版本号  {DeviceInfo.getVersion()}</Text>
							</View>
							<Text style={{ position: "absolute", right: scaleSize(20), color: PRIMARY_COLOR, fontSize: scaleSize(18) }}>
								当前已是最新版本
							</Text>
						</TouchableOpacity>
						

						<View style={{ alignItems: 'center', position: 'absolute', bottom: 30, justifyContent: 'center', right: 40, left: 40 }}>
							<TouchableOpacity
								onPress={this.logout}
								style={{
									marginTop: scaleSize(126),
									width: scaleSize(330),
									height: scaleSize(50),
									alignItems: 'center',
									justifyContent: 'center',
									borderWidth: 1,
									borderRadius: scaleSize(4),
									borderColor: "#D43D3E",
									backgroundColor: "rgba(212,61,62,0.1)",
								}}>
								<Text style={{ fontSize: 18, color: PRIMARY_COLOR, fontWeight: 'bold' }}>退出登录</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

class ListRow extends Component {
	render() {
		return <TouchableOpacity
			onPress={this.props.onPress}
			style={{
				height: scaleSize(72),
				flexDirection: "row",
				alignItems: 'center',
				borderBottomWidth: 1,
				borderColor: "#E5E5E5",
				backgroundColor: "#fff",
				width: width,
			}}
		>
			<View style={{ paddingLeft: scaleSize(15) }}>
				<Text style={{ color: "#000", fontSize: 18, fontFamily: 'PingFang SC', fontWeight: "400" }}>{this.props.title}</Text>
			</View>
			<Image source={images.common.arrow_right2}
				style={{ width: scaleSize(10), height: scaleSize(17), position: "absolute", right: scaleSize(10), tintColor: PRIMARY_COLOR }} />
		</TouchableOpacity>
	}
}

/*
<Image
					source={images.common.about_logo}
					style={{width:scaleSize(297),height:scaleSize(75),marginTop:scaleSize(15)}} />
					<View style={{height:scaleSize(27)}}></View>
					<Text style={{color:"rgba(0,0,0,0.80)",fontSize:14,lineHeight:scaleSize(30)}}>
						中国实用射击协会China Practical Shooting
					Association (CPSA)成立于2008年，是国际实用射击
					联盟(International Practical Shooting Confederation
					(IPSC)在中国大陆授权的唯一官方机构，致力于推广及
					发展IPSC等实用射击运动，提供国内及海外训练、考
					证及筹办各级国际赛事服务，帮助国内实用射击爱好
					者掌握各种IPSC射击场景所必需的设计技巧，并取得
					安全射手证及IPSC国际比赛的参赛资格。
					</Text>
*/

