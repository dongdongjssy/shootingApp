import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	DeviceEventEmitter,
	Alert
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import EmptyView from '../../components/EmptyView';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import Url from '../../api/Url';
import Request from '../../api/Request'
import { AppStore } from '../../store/AppStore'
import { UserStore } from '../../store/UserStore';

export default class MyFansPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: this.props.loginuser,
			clubs: this.props.clubs,
			clubList: [],
		};
	}

	async componentDidMount() {
		DeviceEventEmitter.addListener("followClubUpdated", async (res) => {
			console.debug("【监听回调，我的俱乐部页面】关注俱乐部更新")
			if (res.id) {
				if (res.isFollow) {
					let categories = await AppStore.getCategoryList()
					let areas = await AppStore.getAreaList()

					await Request.post(Url.CLUB_LIST, { id: res.id }).then(res => {
						if (res.status === 200) {
							var club = res.data.rows[0]
							// console.debug(club.image)
							club.followType = "club"
							club.avatarFullPath = Url.CLUB_IMAGE + club.avatar
							club.avatar = Url.CLUB_IMAGE + club.avatar
							club.bgimg = Url.CLUB_IMAGE + club.image
							club.name = club.name
							club.cate = categories.find(c => c.code === club.category)?.title
							club.club = club

							for (var i = 0; i < areas.length; i++) {
								var findArea = areas[i].items?.find(i => i.id === club.areaId)
								if (findArea) {
									club.city = findArea.city_name
									break
								}
							}

							this.state.clubList.push(club)
							this.forceUpdate()
						}
					}).catch(err => console.debug(err))
				} else {
					var findClubIndex = this.state.clubList.findIndex(cb => cb.id === res.id)
					if (findClubIndex >= 0) {
						this.state.clubList.splice(findClubIndex, 1)
						this.forceUpdate()
					}
				}
			}
		})
	}

	getClubDetail = async () => {
		var clubList = []
		if (this.props.clubs) {
			let categories = await AppStore.getCategoryList()
			let areas = await AppStore.getAreaList()

			for (var i = 0; i < this.props.clubs.length; i++) {
				if (this.props.clubs[i].followType === "club" || this.props.isMyJoinClub === true) {

					// console.debug(this.props.clubs[i].followId)
					let res = await Request.post(Url.CLUB_GET_BY_ID + (this.props.isMyJoinClub === true ? this.props.clubs[i].clubId : this.props.clubs[i].followId))

					if (res.status === 200) {
						// if(res.data.code && res.data.code === 500) {
						// 	continue;
						// }

						var club = res.data
						club.followType = "club"
						club.avatarFullPath = club.avatar ? Url.CLUB_IMAGE + club.avatar : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png"
						club.avatar = club.avatar ? Url.CLUB_IMAGE + club.avatar : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png"
						club.bgimg = Url.CLUB_IMAGE + club.image
						club.name = club.name
						club.cate = categories.find(c => c.code === club.category)?.title
						club.club = club

						if (!club.title) {
							club.title = "（该俱乐部已被删除）"
						}

						for (var j = 0; j < areas.length; j++) {
							var findArea = areas[j].items?.find(item => item.id === club.areaId)
							if (findArea) {
								club.city = findArea.city_name
								break
							}
						}

						clubList.push(club)
					}

				}

			}
		}

		this.setState({ clubList: clubList })
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		await this.getClubDetail()

		try {
			startFetch(this.state.clubList, pageSize);
		} catch (err) {
			abortFetch();
		}
	}

	renderItem(item, index) {
		// console.log(item)
		return <TouchableOpacity
			onPress={async () => {
				if (item.title !== "（该俱乐部已被删除）") {
					var loginuser = await UserStore.getLoginUser()
					RouteHelper.navigate("ClubDetailPage", {
						loginuser: loginuser,
						item: item,
					});
				} else {
					Alert.alert("俱乐部已被删除");
				}
			}}
		>
			<View
				style={{
					paddingLeft: scaleSize(16),
					height: scaleSize(72),
					width: SCREEN_WIDTH,
					flexDirection: 'row',
				}}>
				<View style={{ justifyContent: 'center' }}>
					<Image
						source={{ uri: item.avatarFullPath ? item.avatarFullPath : Url.CLUB_IMAGE + item.avatar }}
						style={{ width: scaleSize(44), height: scaleSize(44) }}
					/>
				</View>

				<View style={{
					flex: 1,
					justifyContent: 'center',
					marginLeft: scaleSize(16),
				}}>
					<Text style={{ color: "#000", fontSize: 18, fontWeight: "400" }}>{item.title}</Text>
					<View style={{ height: scaleSize(1), backgroundColor: "#E5E5E5", position: "absolute", right: 0, bottom: 0, width: scaleSize(300) }}></View>
				</View>
			</View>
		</TouchableOpacity>
	}

	render() {
		return <View style={{ flex: 1 }}>
			<UINavBar title={this.props.title ? this.props.title : "我关注的俱乐部"} />
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
					item={this.renderItem.bind(this)}
					displayDate
					emptyView={() => {
						return <EmptyView />
					}}
				/>
			</View>
		</View>
	}

}