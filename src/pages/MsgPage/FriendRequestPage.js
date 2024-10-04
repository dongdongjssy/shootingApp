import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast, ModalIndicator } from 'teaset';
import UINavBar from '../../components/UINavBar';
import UISearchBar from '../../components/UISearchBar';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import store from '../../store';
import ApiUrl from '../../api/Url';
import Axios from 'axios';
import JMessage from 'jmessage-react-plugin';
import { JG_APP_KEY, JG_API_TOKEN } from '../../global/constants';

export default class FriendRequestPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			friendReqs: [],
			isLoaded: false
		};

		this.getFriendRequestInfos = this.getFriendRequestInfos.bind(this);
		this.acceptFriendRequest = this.acceptFriendRequest.bind(this);
		this.declineFriendRequest = this.declineFriendRequest.bind(this);
		this.removeFriendRequest = this.removeFriendRequest.bind(this);
	}

	async componentDidMount() {
		await this.getFriendRequestInfos();
	}

	getFriendRequestInfos = async () => {
		var friendsRequests = await store.AppStore.getFriendRequest()
		var requests = []

		if (friendsRequests) {
			friendsRequests.map(req => {
				if (!requests.find(item => item.fromUsername === req.fromUsername))
					requests.push(req)
			})
		}

		store.AppStore.saveFriendRequest(requests)

		if (requests && requests.length > 0) {
			let requestUsers = [];
			for (var index = 0; index < requests.length; index++) {
				var req = requests[index]

				// get user info from jiguang server
				await Axios.get(ApiUrl.JG_GET_USER_INFO + req.fromUsername,
					{
						headers: { Authorization: JG_API_TOKEN }
					}
				).then(userInfo => {
					if (userInfo.data?.username != "") {
						console.debug("【极光】获取用户信息成功: ", userInfo.data);
						requestUsers.push(userInfo.data);
						this.setState({ friendReqs: requestUsers })
					}
				}).catch(err => {
					ModalIndicator.hide();
					this.setState({ isLoaded: true })
					console.debug("【极光错误】获取用户信息失败: ", req.fromUsername, err);
				})
			}
		}

		this.setState({ isLoaded: true })
	};

	acceptFriendRequest = req => {
		JMessage.acceptInvitation({ username: req.username },
			() => {
				this.removeFriendRequest(req.username);
				DeviceEventEmitter.emit("friendRequestAccepted");
			}, (error) => {
				if (error.code === 805006) {
					Toast.info("该邀请事件已失效!");
					this.removeFriendRequest(req.username);
				} else {
					Toast.info("网络连接异常，请重试");
				}
				console.debug("【极光错误】同意好友申请： ", error);
			})
	};

	declineFriendRequest = req => {
		JMessage.declineInvitation({
			username: req.username,
			appKey: JG_APP_KEY,
			reason: '拒绝'
		}, () => {
			this.removeFriendRequest(req.username)
		}, (error) => {
			if (error.code === 805006) {
				Toast.info("该邀请事件已失效!")
				this.removeFriendRequest(req.username)
			} else {
				Toast.info("网络连接异常，请重试");
			}
			console.debug("【极光错误】拒绝好友申请： ", error);
		})
	};

	removeFriendRequest = username => {
		this.setState({ isLoaded: false })
		store.AppStore.getFriendRequest().then(async (requests) => {
			if (requests) {
				let existingRequestIndex = requests.findIndex(item => item.fromUsername === username);

				if (existingRequestIndex >= 0) {
					let newRequestArr = [...requests];
					newRequestArr.splice(existingRequestIndex, 1);

					store.AppStore.saveFriendRequest(newRequestArr);
				}

				existingRequestIndex = this.state.friendReqs.findIndex(item => item.username === username);

				if (existingRequestIndex >= 0) {
					let newRequestArr = [...this.state.friendReqs];
					newRequestArr.splice(existingRequestIndex, 1);

					this.setState({ friendReqs: newRequestArr });
				}
			}

			this.setState({ isLoaded: true });
		});
	};

	_renderItem(item, index) {
		var borderBottoomStyle = {};
		var rows = this.state.friendReqs;
		if (rows.length - 1 == index) {
			borderBottoomStyle = {
				borderBottomWidth: ONE_PX,
				borderColor: "rgba(0,0,0,0.1)",
			}
		}

		return (
			<View style={[styles.item, borderBottoomStyle]}>
				<View style={{ flex: 1, flexDirection: "row" }}>
					<Image
						source={{ uri: item.avatar ? ApiUrl.CLIENT_USER_IMAGE + item.avatar : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png" }}
						style={styles.avatar}
					/>
					<View style={{ flex: 1, marginLeft: scaleSize(15), flexDirection: 'row' }}>
						<View style={{ flex: 1, marginRight: scaleSize(10) }}>
							<Text style={styles.name}>{item.nickname}</Text>
							{/*<View style={{height:scaleSize(5)}}></View>*/}
							<View style={{ padding: 0, margin: 0 }}>
								<Text style={styles.mobile}>手机号{item.extras?.phone}</Text>
								<Text style={styles.mobile}>用户名：{item.username}</Text>
							</View>
						</View>

					</View>
				</View>
				<View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around", marginTop: scaleSize(15) }}>
					<TouchableOpacity style={styles.rejectBtn} onPress={() => this.declineFriendRequest(item)}>
						<Text style={styles.planBtnText}>拒绝</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.resolveBtn} onPress={() => this.acceptFriendRequest(item)}>
						<Text style={styles.resolveText}>同意</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	render() {
		this.state.isLoaded ? ModalIndicator.hide() : ModalIndicator.show("数据更新中");

		return (
			<View style={{ flex: 1, }}>
				<UINavBar title="好友请求" />
				<View style={{ flex: 1 }}>
					{
						this.state.friendReqs.length > 0 || !this.state.isLoaded ?
							this.state.friendReqs.map((item, index) => {
								return this._renderItem(item, index)
							}) :
							<View style={{ marginTop: scaleSize(26), flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
								<Text style={{ textAlign: 'center', width: scaleSize(240), color: PRIMARY_COLOR, fontSize: 16 }}>
									没有好友请求
								</Text>
							</View>
					}
				</View>
			</View>
		)
	}
}

var styles = {
	item: {
		height: scaleSize(158),
		// flexDirection:'row',
		// alignItems:'center',
		paddingHorizontal: scaleSize(15),
		marginTop: scaleSize(10),
		borderTopWidth: ONE_PX,
		borderColor: "rgba(0,0,0,0.1)",
		paddingTop: scaleSize(22),
		paddingBottom: scaleSize(5),
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
	name: {
		color: "#000",
		fontSize: 18,
		fontWeight: "400",
		top: scaleSize(-7)
	},
	mobile: {
		color: "#8F8F8F",
		fontSize: 14,
		fontWeight: '400',
	},
	resolveBtn: {
		width: scaleSize(90),
		height: scaleSize(37),
		backgroundColor: PRIMARY_COLOR,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: scaleSize(4),
	},
	resolveText: {
		color: '#fff',
	},
	rejectBtn: {
		width: scaleSize(90),
		height: scaleSize(37),
		borderWidth: ONE_PX,
		borderColor: "rgba(0,0,0,0.5019607843137255)",
		borderRadius: scaleSize(4),
		alignItems: 'center',
		justifyContent: 'center',
	},
	planBtnText: {
		color: "rgba(0,0,0,0.50)",
		fontWeight: "400",
		fontSize: 14,
	}
}
