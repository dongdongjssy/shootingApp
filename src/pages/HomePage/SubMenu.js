import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity,DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast } from 'teaset';
import ApiUrl from '../../api/Url.js';
import UIConfirm from '../../components/UIConfirm';
import { ClientStatusEnum } from '../../global/constants';
import { Item } from '../../components/UITabBar';

@observer
export default class SubMenu extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: props.loginuser,
			menus: [
				{
					routePath: "CommonActivityListPage",
					params: {
						pageText: "认证/培训",
						fkTableId: 1,
						restApiUrl: ApiUrl.TRAINING_LIST,
						imagePath: ApiUrl.TRAINING_IMAGE,
						carouselOnPage: 2,
					},
					icon: images.submenu.peixun,
					title: "培训",
				},
				{
					routePath: "CommonActivityListPage",
					params: {
						pageText: "国内/际赛事",
						fkTableId: 2,
						restApiUrl: ApiUrl.CONTEST_LIST,
						imagePath: ApiUrl.CONTEST_IMAGE,
						carouselOnPage: 3
					},
					icon: images.submenu.saishi,
					title: "赛事",
				},
				{
					routePath: "RankPage",
					params: {},
					icon: images.submenu.chengji,
					title: "成绩",
				},
				{
					routePath: "CoachJudgePage",
					params: {
						fkTableId: 1,
					},
					icon: images.submenu.jiaoguan,
					title: "教官",
				},
				{
					routePath: "CoachJudgePage",
					params: {
						fkTableId: 2,
					},
					icon: images.submenu.caipan,
					title: "裁判",
				}
			]
		};
	}

	async componentDidMount() {
		DeviceEventEmitter.addListener('userUpdated', (res) => {
			if (res.user) {
				console.debug("【监听回调，首页】更新用户信息")
				this.setState({ loginuser: res.user })
			}
		})
	}

	renderMenuItem(menu, index) {
		return (
			<TouchableOpacity key={index}
				style={{ flex: 1, alignItems: "center", justifyContent: 'center',backgroundColor: '#FFFFFF' }}
				onPress={() => {
					if(this.props.loginuser == null && (menu.title == "教官" || menu.title == "裁判")){
						UIConfirm.show("访客不可查看")
						return
					}
					//未认证用户不可查看成绩
					else if ((this.props.loginuser.status == ClientStatusEnum.NOT_VERIFIED.code || this.props.loginuser.status == ClientStatusEnum.IN_REVIEW.code) && (menu.title == "教官" || menu.title == "裁判")) {
						UIConfirm.show("认证通过后可以查看")
						return
					}
					//待续费用户
					else if ((this.props.loginuser.status == ClientStatusEnum.RENEWAL_USER.code) && (menu.title == "教官" || menu.title == "裁判")) {
						UIConfirm.show("认证已过期，请及时续费")
						return
					}
					
					if (index == 2) {
						RouteHelper.navigate(menu.routePath, { loginuser: this.props.loginuser });
					} else {
						RouteHelper.navigate(menu.routePath, menu.params);
					}
				}}>
				<Image source={menu.icon}
					resizeMode="contain"
					style={{ width: index === 0 ? scaleSize(70) : scaleSize(62), height:  index === 0 ? scaleSize(54) : scaleSize(47) }} />
				<Text style={{ color: "rgba(0,0,0,0.80)", fontSize: 14, fontWeight: "400", marginTop: index === 0 ? scaleSize(-2) : scaleSize(6) }}>{menu.title}</Text>
			</TouchableOpacity>
		)
	}

	render() {
		return <View style={{ height: scaleSize(84), flexDirection: 'row' }}>
			{
				this.state.menus.map((menu, index) => {
					return this.renderMenuItem(menu, index)
				})
			}
		</View>
	}
}







