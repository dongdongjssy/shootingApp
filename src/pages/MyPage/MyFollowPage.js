import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView, DeviceEventEmitter
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { ModalIndicator, Toast } from 'teaset';
import UINavBar from '../../components/UINavBar';
import EmptyView from '../../components/EmptyView';
import Url from '../../api/Url';
import Request from '../../api/Request'
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';

export default class MyFansPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: this.props.loginuser,
			followList: this.props.followList,
			myFollows: []
		};
	}

	async componentDidMount() {
		DeviceEventEmitter.addListener("followUserUpdated", async (res) => {
			console.debug("【监听回调，我的关注页面】关注用户更新")
			if (res.id) {
				if (res.isFollow) {
					await Request.post(Url.USER_GET_BY_ID + res.id).then(res => {
						if (res.status === 200) {
							res.data.followType = "user"
							res.data.avatarFullPath = Url.CLIENT_USER_IMAGE + res.data.avatar
							res.data.name = res.data.nickname
							this.state.myFollows.push(res.data)
							this.forceUpdate()
						}
					}).catch(err => console.debug(err))
				} else {
					var findUserIndex = this.state.myFollows.findIndex(mf => mf.id === res.id)
					if (findUserIndex >= 0) {
						this.state.myFollows.splice(findUserIndex, 1)
						this.forceUpdate()
					}
				}
			}
		})
	}

	getUserDetail = async () => {
		// ModalIndicator.show("获取数据")

		var myFollows = []
		for (var i = 0; i < this.state.followList.length; i++) {
			if (this.state.followList[i].followType === "user") {
				await Request.post(Url.USER_GET_BY_ID + this.state.followList[i].followId).then(res => {
					if (res.status === 200) {
						res.data.followType = "user"
						res.data.avatarFullPath = Url.CLIENT_USER_IMAGE + res.data.avatar
						res.data.name = res.data.nickname
						myFollows.push(res.data)
					}
				}).catch(err => ModalIndicator.hide())
			}

			if (this.state.followList[i].followType === "club") {
				await Request.post(Url.CLUB_GET_BY_ID + this.state.followList[i].followId).then(res => {
					if (res.status === 200) {
						res.data.followType = "club"
						myFollows.push(res.data)
					}
				}).catch(err => ModalIndicator.hide())
			}

			this.setState({ myFollows: myFollows })
			ModalIndicator.hide()
		}
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		await this.getUserDetail()

		try {
			startFetch(this.state.myFollows, pageSize);
		} catch (err) {
			abortFetch();
		}
	}

	renderItem(item, index) {
		return <TouchableOpacity
			onPress={() => {
				if (item.followType === "user") {
					RouteHelper.navigate("UserCenterPage", {
						loginuser: this.state.loginuser,
						user: item
					})
				}
				if (item.followType === "club") {
					RouteHelper.navigate("ClubDetailPage")
				}
			}}
		>
			<View
				style={{
					paddingLeft: scaleSize(16),
					height: scaleSize(72),
					width: SCREEN_WIDTH,
					flexDirection: 'row',
					paddingTop: scaleSize(16)
				}}>
				<Image
					source={{ uri: item.avatarFullPath }}
					style={{ width: scaleSize(44), height: scaleSize(44) }}
				/>

				<View style={{
					flex: 1,
					marginLeft: scaleSize(16),
				}}>
					<Text style={{ color: "#000", fontSize: 18, fontWeight: "400" }}>{item.name}</Text>
					<Text style={{ color: "#8F8F8F", fontWeight: "400", fontSize: 14, marginTop: scaleSize(5) }}>{item.level}</Text>
					<View style={{ height: scaleSize(1), backgroundColor: "#E5E5E5", position: "absolute", right: 0, bottom: 0, width: scaleSize(300) }}></View>
				</View>
			</View>
		</TouchableOpacity>
	}

	render() {
		return <View style={{ flex: 1 }}>
			<UINavBar title="我的关注" />
			<View style={{ height: scaleSize(1), backgroundColor: "#F2F6F9" }}></View>
			<View style={{ flex: 1 }}>
				<UltimateListView
					style={{ flex: 1 }}
					header={() => {
						return null;
					}}
					allLoadedText={"没有更多了"}
					waitingSpinnerText={'加载中...'}
					ref={ref => this.listView = ref}
					onFetch={this.onFetch.bind(this)}
					keyExtractor={(item, index) => `${index} -`}
					item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
					displayDate
					emptyView={() => {
						return <EmptyView />
					}}
				/>
			</View>
		</View>
	}

}