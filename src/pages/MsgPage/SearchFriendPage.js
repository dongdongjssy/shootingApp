import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { Toast, ModalIndicator } from 'teaset';
import UINavBar from '../../components/UINavBar';
import UISearchBar from '../../components/UISearchBar';
import ApiUrl from '../../api/Url';
import Axios from 'axios';
import Request from '../../api/Request';
import JMessage from 'jmessage-react-plugin';
import { JG_API_TOKEN } from '../../global/constants';
import { UserStore } from '../../store/UserStore';

export default class SearchFriendPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isFocus: false,
			firstTimeSearch: true,
			findUser: undefined,
			loginUser: undefined,
			friendList: []
		};
	}

	async startSearch(keyword) {
		ModalIndicator.show('搜索中');

		let loginUser = await UserStore.getLoginUser()
		this.state.loginUser = loginUser
		this.forceUpdate()

		await this.getFriends()

		Request.get(
			ApiUrl.FIND_USER_BY_PHONE_OR_USERNAME + keyword
		).then(res => {
			if (res.status !== 200 || res.data?.code === 1) {
				this.setState({ findUser: undefined, firstTimeSearch: false });
				ModalIndicator.hide();
			} else if (res.data.code === 0) {
				if (res.data.data.jgUsername) {
					// get user info from jiguang server
					console.log(res.data.data.jgUsername)
					Axios.get(ApiUrl.JG_GET_USER_INFO + res.data.data.jgUsername,
						{
							headers: { Authorization: JG_API_TOKEN }
						}
					).then(userInfo => {
						if (userInfo.data?.username != "") {
							console.debug("【极光】搜索成功 : ", userInfo.data)
							this.setState({ firstTimeSearch: false, findUser: userInfo.data });
						}
						ModalIndicator.hide();
					}).catch(err => {
						console.debug("【极光错误】搜索好友: ", err);
						ModalIndicator.hide();
						Toast.info("搜索的用户不存在");
					})
				} else {
					this.setState({ findUser: undefined, firstTimeSearch: false });
					ModalIndicator.hide();
				}
			} else {
				ModalIndicator.hide();
			}

		}).catch(err => {
			console.error(err);
			ModalIndicator.hide();
		});
	};

	sendFriendRequest() {
		if (this.state.findUser) {
			console.debug("【极光】发送好友请求: ", this.state.findUser);

			JMessage.sendInvitationRequest({
				username: this.state.findUser.username,
				reason: '请求添加好友'
			}, () => {
				Toast.info("请求已发送");
			}, (error) => {
				Toast.info("网络连接异常，请重试");
				console.debug("【极光错误】发送好友请求出错: ", error);
			})
		}
	}

	async getFriends() {
		JMessage.getFriends(friendArr => {
			console.debug("【极光好友列表】获取我的好友，总数: ", friendArr.length)
			this.setState({ friendList: friendArr })
		}, error => {
			ModalIndicator.hide()
			Toast.info("搜索失败，请重试")
			console.debug("【极光好友列表错误】获取好友列表异常: ", error)
		})
	}

	isFriend(user) {
		var isFriend = false
		if (user) {
			console.debug(this.state.friendList)
			this.state.friendList.map(item => {
				if (item.username === user.username) {
					isFriend = true
				}
			})
		} else {
			return false
		}

		return isFriend
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				{!this.state.isFocus && <UINavBar title="添加好友" />}
				{this.state.isFocus && <View style={{ height: statusBarHeight }}></View>}

				<View style={{ flex: 1 }}>
					<UISearchBar
						placeholder="请输入手机号或对方真实姓名"
						onBlur={() => this.setState({ isFocus: false })}
						onFocus={() => this.setState({ isFocus: true })}
						onCancel={() => RouteHelper.goBack()}
						onSearch={text => this.startSearch(text)}
					/>

					{
						this.state.findUser ?
							<View style={styles.findUser}>
								<Image
									source={
										this.state.findUser.avatar ?
											{ uri: ApiUrl.CLIENT_USER_IMAGE + this.state.findUser.avatar } :
											{ uri: "http://static.boycodes.cn/shejiixiehui-images/dongtai.png" }
									}
									style={styles.avatar}
								/>
								<View style={{ flex: 1, marginLeft: scaleSize(15), flexDirection: 'row' }}>
									<View style={{ flex: 1, marginRight: scaleSize(10) }}>
										<Text style={styles.nickname}>{this.state.findUser.nickname}</Text>
										{/*<View style={{height:scaleSize(5)}}></View>*/}
										<View>
											<Text style={styles.phone}>手机号: {this.state.findUser?.username}</Text>
											<Text style={styles.phone}>用户名: {this.state.findUser?.username}</Text>
										</View>
									</View>
									{this.state.loginUser.phone != this.state.findUser?.username ?
										(
											!this.isFriend(this.state.findUser) ?
												<TouchableOpacity
													onPress={() => this.sendFriendRequest()}
													style={styles.addBtn}>
													<Text style={styles.addText}>添加</Text>
												</TouchableOpacity> :
												<View>
													<Text style={[styles.addBtn, styles.addText, { textAlign: 'center', textAlignVertical: 'center' }]}>已添加</Text>
												</View>
										) :
										<View>
											<Text style={[styles.addBtn, styles.addText, { textAlign: 'center', textAlignVertical: 'center' }]}>自己</Text>
										</View>
									}
								</View>
							</View> : (
								!this.state.firstTimeSearch ?
									<View style={{ marginTop: scaleSize(26), flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
										<Text style={{ textAlign: 'center', width: scaleSize(240), color: PRIMARY_COLOR, fontSize: 16 }}>该手机号、用户名未注册或输入有误，请重新输入</Text>
									</View> : null
							)
					}
				</View>
			</View>
		)
	};
};

var styles = {
	findUser: {
		height: scaleSize(50),
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: scaleSize(15),
		marginTop: scaleSize(15),
	},
	avatar: {
		width: scaleSize(44),
		height: scaleSize(44),
	},
	addBtn: {
		alignItems: 'center',
		justifyContent: 'center',
		width: scaleSize(67),
		height: scaleSize(37),
		borderRadius: scaleSize(4),
		backgroundColor: "#D43D3E",
	},
	addText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: '400',
	},
	nickname: {
		color: "#000",
		fontSize: 18,
		fontWeight: "400",
		top: scaleSize(-7)
	},
	phone: {
		color: "#8F8F8F",
		fontSize: 14,
		fontWeight: '400',
	}
};
