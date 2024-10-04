import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import {
	Toast, ModalIndicator
} from 'teaset';
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
			fansList: this.props.fansList,
			myFans: []
		};
	}

	getUserDetail = async () => {
		// ModalIndicator.show("获取数据")

		var myFans = []
		// console.log(this.state.fansList)
		for (var i = 0; i < this.state.fansList.length; i++) {
			if (this.state.fansList[i].followType === "user") {
				await Request.post(Url.USER_GET_BY_ID + this.state.fansList[i].clientUserId).then(res => {
					if (res.status === 200) {
						res.data.followType = "user"
						res.data.avatarFullPath = Url.CLIENT_USER_IMAGE + res.data.avatar
						res.data.name = res.data.nickname
						myFans.push(res.data)
					}
				}).catch(err => ModalIndicator.hide())
			}

			this.setState({ myFans: myFans })
			ModalIndicator.hide()
		}
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		await this.getUserDetail()
		try {
			startFetch(this.state.myFans, pageSize);
		} catch (err) {
			abortFetch();
		}
	}

	renderItem(item, index) {
		return <TouchableOpacity
			onPress={() => {
				RouteHelper.navigate("UserCenterPage", {
					loginuser: this.state.loginuser,
					user: item
				});
			}}
		>
			<View
				style={{
					paddingLeft: scaleSize(16),
					height: scaleSize(72),
					width: SCREEN_WIDTH,
					flexDirection: 'row',
					paddingTop: scaleSize(16),
					// paddingVertical:scaleSize(50),
					// alignItems:'center',
					// justifyContent:'center'
				}}>
				<Image
					source={{ uri: item.avatarFullPath }}
					style={{ width: scaleSize(44), height: scaleSize(44) }}
				/>

				<View style={{
					flex: 1,
					// borderBottomWidth:ONE_PX,
					// borderColor:"#E5E5E5",
					marginLeft: scaleSize(16),
				}}>
					<Text style={{ color: "#000", fontSize: 18, fontWeight: "400" }}>{item.name}</Text>
					<Text style={{ color: "#8F8F8F", fontWeight: "400", fontSize: 14, marginTop: scaleSize(5) }}>{item.level}</Text>
					<View style={{ height: scaleSize(1), backgroundColor: "#E5E5E5", position: "absolute", right: 0, bottom: 0, width: scaleSize(300) }}></View>
				</View>
			</View>
		</TouchableOpacity>
		// return <DynamicItem 
		// onPress={(item)=>{
		// 	RouteHelper.navigate("DynamicDetailPage",{
		// 		item:item,
		// 	});
		// }}
		// item={item} 
		// index={index} 
		// activeType={this.state.activeType}
		// listData={this.listView.getRows()}
		// />
	}

	render() {
		return <View style={{ flex: 1 }}>
			<UINavBar title="粉丝" />
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







var styles = {

}
