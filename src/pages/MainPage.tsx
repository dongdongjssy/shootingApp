import React, { Component } from 'react';
import { Text, View, DeviceEventEmitter, Keyboard, Image } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { TabView } from 'teaset';
import HomePage from './HomePage/index.js'
import MyPage from './MyPage/index.js'
import ShoppingPage from './ShoppingPage/index.js'
import ClubPage from './ClubPage/index.js'
import MsgPage from './MsgPage/index.js'
import DynamicPage from './DynamicPage/index.js'
import { scaleSize } from '../global/utils'
import { images } from '../res/images';
import { PRIMARY_COLOR } from '../global/constants';
import DynamicAddTypeSelect from './HomePage/DynamicAddTypeSelect';
import { ClientStatusEnum } from '../global/constants';
import UIConfirm from '../components/UIConfirm';
import { UserStore } from '../store/UserStore';

class CustomButton extends Component {
	render() {
		return null
	}
}

export interface Title {
	title: string,
	custom?: boolean,
	icon: object,
	activeIcon: object,
	com: string
}

let main_tabs: Title[] = [
	{ title: "首页", icon: images.tab.home, activeIcon: images.tab.home_active, com: 'HomePage' },
	{ title: "俱乐部", icon: images.tab.club, activeIcon: images.tab.club_active, com: 'ClubPage' },
	// { title: "", custom: true, icon: images.tab.push, activeIcon: images.tab.club, com: "CustomButton" },
	// { title: "消息", icon: images.tab.msg, activeIcon: images.tab.msg_active, com: 'MsgPage' },
	{ title: "射手动态", icon: images.tab.member, activeIcon: images.tab.member_active, com: 'DynamicPage' },
    { title: "商城", icon: images.tab.shopping, activeIcon: images.tab.shopping_active, com: 'ShoppingPage' },
	{ title: "我的", icon: images.tab.my, activeIcon: images.tab.my_active, com: 'MyPage' },
];

let pages_map = {
	HomePage: HomePage,
	MyPage: MyPage,
	ClubPage: ClubPage,
	MsgPage: MsgPage,
	ShoppingPage:ShoppingPage,
	CustomButton: CustomButton,
	DynamicPage: DynamicPage
};

@inject('UserStore') //注入；
@observer
export default class MainPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			keyboardShow: false,
			activeIndex: 0,
			loginuser: undefined,
		};

		this.UserStore = this.props.UserStore;
	}

	async componentDidMount() {
		this.listener = DeviceEventEmitter.addListener("tab_change", this.onTabChange.bind(this));
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));

		let loginuser = await UserStore.getLoginUser()
		this.state.loginuser = loginuser
		this.forceUpdate()
	}
	_keyboardDidShow() {
		this.setState({ keyboardShow: true })
	}

	_keyboardDidHide() {
		this.setState({ keyboardShow: false })
	}

	onTabChange(index) {
		this.setState({ activeIndex: index })
		// if (index === 2 || index === 1) {
		// 	DeviceEventEmitter.emit("tab_focus");
		// }
	}

	componentWillUnmount() {
		this.listener && this.listener.remove();
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	renderCustomButton(item, index) {
		let bigIcon = (
			<View key={index}>
				<Image source={item.icon} style={{ width: scaleSize(44), height: scaleSize(44), borderRadius: scaleSize(22) }} />
			</View>
		);

		return (
			<TabView.Sheet
				key={index}
				type='button'
				title=''
				icon={bigIcon}
				iconContainerStyle={{ justifyContent: 'flex-end' }}
				onPress={async () => {
					var user = await UserStore.getLoginUser()
					// console.log("user.status",user.status,ClientStatusEnum.VERIFIED.code)
					if (user.status === ClientStatusEnum.VERIFIED.code) {
						DynamicAddTypeSelect.show();
					} else {
						UIConfirm.show("您尚未完成认证，无法发布动态");
					}
					// RouteHelper.navigate("DynamicAddPage")
				}}
			/>
		);
	}
	getTabTitle(item, index) {
		// if (index > 1) {
		// 	var isActive = this.state.activeIndex == index - 1;
		// } else {
			const isActive = this.state.activeIndex == index;
		// }
		return <Text style={[{ color: isActive ? PRIMARY_COLOR : 'rgba(0,0,0,0.50)', fontSize: 10, fontWeight: "400",width: scaleSize(70),textAlign: 'center' }]}>{item.title}</Text>
	}
	getTabIcon(item, index) {
		// if (index > 1) {
		// 	var isActive = this.state.activeIndex == index - 1;
		// } else {
			const isActive = this.state.activeIndex == index;
		// }
		return <Image source={isActive ? item.activeIcon : item.icon} resizeMode="contain" style={{ width: 25, height: 25 }} />
	}
	renderTabContent() {
		if (main_tabs.length) {
			return (
				<TabView
					activeIndex={this.state.activeIndex}
					iconContainerStyle={{ width: scaleSize(21), height: scaleSize(21) }}
					onChange={(index) => {
						if (main_tabs[index].need_login && !this.UserStore.loginuser) {
							return RouteHelper.navigate("LoginPage");
						}

						// if(index == 3 && this.state.loginuser == null){
						// 	UIConfirm.show("访客不可查看")
						// 	return
						// }else if(index == 3 && (this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
						// 	UIConfirm.show("认证通过后可以查看")
						// 	return
						// }else if(index == 3 && (this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
						// 	UIConfirm.show("认证已过期，请及时续费")
						// 	return
						// }
						this.setState({
							activeIndex: index,
						})

					}}
					barStyle={[this.state.keyboardShow ? { height: 0, overflow: 'hidden' } : {}]}
					style={[{ flex: 1 }]} type='projector'>
					{
						main_tabs.map((item, index) => {
							var Mcom = pages_map[item.com];
							if (item.custom) {
								return this.renderCustomButton(item, index);
							}
							return (
								<TabView.Sheet
									ref='tab'
									key={index}
									title={this.getTabTitle(item, index)}
									icon={this.getTabIcon(item, index)}
								>
									<Mcom />
								</TabView.Sheet>
							)
						})
					}
				</TabView>
			)
		} else {
			return <Text>暂无页面..</Text>
		}
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				{this.renderTabContent()}
			</View>
		)
	}
}
