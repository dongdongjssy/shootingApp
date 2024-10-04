import React, { Component } from 'react';
import { View, Image, PermissionsAndroid, Platform, Dimensions, ImageBackground } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../res/images';
import JMessage from 'jmessage-react-plugin';
import { UserStore } from '../store/UserStore';
import ApiUrl from '../api/Url.js';
import request from '../api/Request';
import ResponseCodeEnum from '../constants/ResponseCodeEnum';

export default class StartPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			advertisement: {},
		}
	}

	async componentDidMount() {
		let loginuser = await UserStore.getLoginUser()
		this.setState({
			loginuser: loginuser
		})
		console.debug("loginuser: ", loginuser)
		this.getAdvertisementData()
	}


	getAdvertisementData = async ()=> {
		await request.post(ApiUrl.STARTADVERTISEMENT_LIST, {}).then(res => {
			if (res?.status === ResponseCodeEnum.STATUS_CODE) {
				if(res?.data){
					RouteHelper.navigate("Advertisement",{
						advertisement: res?.data
					})
				}else{
					setTimeout(() => {
						this.openApp()
					}, 2000)
				}
			}
		}).catch(err => {
			console.log('广告err=='+err)
		});
	}

	async openApp() {
		if (Platform.OS !== "ios") {
			var granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.debug('获得了音频权限');
			} else {
				console.debug("获取音频权限失败！");
			}

			var granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.debug('获得了存储权限');
			} else {
				console.debug('获得存储权限失败');
			}
		}

		const loginuser = await UserStore.getLoginUser()
		if (loginuser && loginuser.token) {
			UserStore.validateToken(loginuser.token).then(res => {
				if (res.code !== 200) {
					Alert.alert('', "登录已过期",
						[{ text: "去登陆", onPress: () => RouteHelper.reset("LoginPage") }],
						{ cancelable: false }
					)
				} else {
					// 登录极光IMs
					JMessage.login({
						username: loginuser.jgUsername,
						password: loginuser.jgUsername
					}, () => {
						console.debug("【极光】登录成功: ", loginuser.jgUsername)
					}, (error) => console.debug(error))

					RouteHelper.reset("MainPage")
				}
			}).catch(() => {
				RouteHelper.reset("LoginPage")
			})
		} else {
			RouteHelper.reset("LoginPage")
		}
	}

	render() {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<ImageBackground 
				source={images.startPage} 
				resizeMode="cover" style={{ width: "100%", height: "100%" }} />
			</View>
		)
	}
}