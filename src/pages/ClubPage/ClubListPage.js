import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast } from 'teaset';
import UINavBar from '../../components/UINavBar';
import UISelect from '../../components/UISelect';
import EmptyView from '../../components/EmptyView';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import ClubItem from './ClubItem';
import { UserStore } from '../../store/UserStore';
import Request from '../../api/Request';
import ApiUrl from '../../api/Url';
import UICitySelect from '../../components/UICitySelect';

export default class ClubListPage extends Component {
	constructor(props) {
		super(props)

		this.state = {
			loginuser: this.props.navigation.state.params.loginuser,
			areaList: this.props.navigation.state.params.areaList,
			categoryList: this.props.navigation.state.params.categoryList,
			filterArea: undefined,
			filterCategory: undefined,
			clubList: [],
		}
	}

	async componentDidMount() {
		DeviceEventEmitter.addListener("followClubUpdated", async () => {
			console.debug("【监听回调，俱乐部列表页】关注俱乐部更新")
			await this.getClubList();
			this.listView && this.listView.refresh();
		})
	}

	selectArea = () => {
		UICitySelect.show(this.state.areaList, (item) => {
			// console.debug("selected area: ", item)
			this.setState({ filterArea: item }, () => this.refreshFilteredList())
		})
	}

	selectCategory = () => {
		UISelect.show(this.state.categoryList, {
			title: "分类",
			onPress: (item) => {
				// console.debug("selected category: ", item)
				this.setState({ filterCategory: item }, () => this.refreshFilteredList())
				UISelect.hide()
			},
			onCancel: () => { }
		})
	}

	refreshFilteredList = () => {
		var filteredList = []

		var areaFilter = (this.state.filterArea && this.state.filterArea.id != -1) ? this.state.filterArea : undefined
		var categoryFilter = (this.state.categoryFilter && this.state.categoryFilter.code != -1) ? this.state.categoryFilter : undefined

		this.state.clubList.map(club => {
			var display = true

			if (areaFilter && areaFilter.city_name != club.city) display = false
			if (categoryFilter && categoryFilter.title != club.cate) display = false

			if (display) filteredList.push(club)
		})

		this.listView.updateDataSource(filteredList)
	}

	getClubList = async () => {
		await Request.post(ApiUrl.CLUB_LIST, {}).then(res => {
			if (res.status === 200) {
				var clubs = []

				// console.debug(res.data.rows)
				res.data.rows?.map(club => {
					var area = undefined

					for (var i = 0; i < this.state.areaList.length; i++) {
						var findArea = this.state.areaList[i].items?.find(i => i.id === club.areaId)
						if (findArea) {
							area = findArea
							break
						}
					}

					club.city = area?.city_name
					clubs.push({
						bgimg: club.image ? ApiUrl.CLUB_IMAGE + club.image : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
						avatar: club.avatar ? ApiUrl.CLUB_IMAGE + club.avatar : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
						name: club.title,
						city: area?.city_name,
						cate: this.state.categoryList.find(c => c.code === club.category)?.title,
						club: club
					})
				})
				this.setState({ clubList: clubs })
			}
		})
	}

	renderItem = (item, index) => {
		return <ClubItem item={item} index={index} loginuser={this.state.loginuser} type={'post'}/>
	}

	onFetch = async (page = 1, startFetch, abortFetch) => {
		var pageSize = 999999

		await this.getClubList()

		try {
			startFetch(this.state.clubList, pageSize);
		} catch (err) {
			abortFetch();
		}
	}

	render() {
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
			<UINavBar title="添加俱乐部" />
			<View style={{ flex: 1, marginTop: 1, paddingHorizontal: scaleSize(10) }}>
				<View style={{
					alignItems: 'center',
					flexDirection: "row",
					height: scaleSize(35),
					marginVertical: scaleSize(10),
					justifyContent: 'space-between',
				}}>
					<TouchableOpacity
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
							width: scaleSize(170),
							padding: scaleSize(8),
							margin: "auto",
							backgroundColor: "#fff",
							height: scaleSize(35)
						}}
						onPress={() => this.selectArea()}
					>
						<Text style={{ color: "#323232", fontSize: 14, fontWeight: "400" }}>
							{this.state.filterArea ? this.state.filterArea.city_name : "地区"}
						</Text>
						<Image
							source={images.common.arrow_down}
							style={{ width: scaleSize(8), height: scaleSize(5) }}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
							width: scaleSize(170),
							padding: scaleSize(8),
							margin: "auto",
							backgroundColor: "#fff",
							height: scaleSize(35)
						}}
						onPress={() => this.selectCategory()}
					>
						<Text style={{ color: "#323232", fontSize: 14, fontWeight: "400" }}>
							{this.state.filterCategory ? this.state.filterCategory.title : "分类"}
						</Text>
						<Image
							source={images.common.arrow_down}
							style={{ width: scaleSize(8), height: scaleSize(5) }}
						/>
					</TouchableOpacity>
				</View>

				<UltimateListView
					style={{ flex: 1 }}
					header={() => { return null }}
					allLoadedText={"没有更多了"}
					waitingSpinnerText={'加载中...'}
					ref={ref => this.listView = ref}
					onFetch={this.onFetch.bind(this)}
					keyExtractor={(item, index) => `${index} -`}
					item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
					displayDate
					emptyView={() => { return <EmptyView /> }}
				/>
			</View>
		</View>
	}

}