import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	ScrollView,
	TouchableOpacity
} from 'react-native'
import { inject, observer } from 'mobx-react'
import ApiUrl from '../../api/Url.js';
import UINavBar from '../../components/UINavBar';
import LoadingImage from '../../components/LoadingImage';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import HeaderCarousel from './HeaderCarousel';
import request from '../../api/Request'
import DynamicItem from './DynamicItem';
import { RouteHelper } from 'react-navigation-easy-helper';
import EmptyView from '../../components/EmptyView';
import { UserStore } from '../../store/UserStore';
import { scaleSize } from '../../global/utils.js';

export default class CoachJudgePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isCoach: props.fkTableId == 1,
			groupList: [],
			itemList: [],
			carouselList: [],
			loginuser: undefined,
		};
	}

	async componentDidMount() {
		let loginuser = await UserStore.getLoginUser()
		this.state.loginuser = loginuser
		this.forceUpdate()

		DeviceEventEmitter.addListener("likeUpdated", async () => {
			console.debug("【监听回调，点赞】动态有更新")
			this.listView?.refresh();
		});
	// let restApiUrl = this.state.isCoach ? ApiUrl.COACH_GROUP_LIST : ApiUrl.JUDGE_GROUP_LIST;

	// request.post(restApiUrl, {}).then(res => {
	// 	if (res.status === 200) {
	// 		this.setState({ groupList: res.data });
	// 	}
	// }).catch(err => console.log(err));
	// }

	// renderSessionItem(item, index) {

	// 	if (this.state.isCoach) {
	// 		item.peopleList = item.coachList;
	// 	} else {
	// 		item.peopleList = item.judgeList;
	// 	}

	// 	return <View key={index} style={{
	// 		marginBottom: scaleSize(16),
	// 		// alignItems:'center',
	// 		paddingHorizontal: scaleSize(28),
	// 		backgroundColor: "#fff",
	// 		paddingBottom: scaleSize(20)
	// 	}}>
	// 		<View style={{
	// 			height: scaleSize(50),
	// 			alignItems: 'center',
	// 			flexDirection: 'row',
	// 			justifyContent: 'center',
	// 		}}>
	// 			<View style={{ height: 1, width: scaleSize(10), marginRight: scaleSize(10), backgroundColor: PRIMARY_COLOR }}></View>
	// 			<Text style={{ color: "rgba(0,0,0,0.80)", textAlign: 'center', fontSize: 16, fontWeight: "500" }}>
	// 				{item.group}
	// 			</Text>
	// 			<View style={{ height: 1, width: scaleSize(10), marginLeft: scaleSize(10), backgroundColor: PRIMARY_COLOR }}></View>
	// 		</View>
	// 		<View style={{}}>
	// 			{/*item.peopleList.map((subItem, subIndex) => {
	// 				return this.renderItem(subItem, subIndex)
	// 			})*/}
	// 			{this.renderGuid(item.peopleList)}
	// 		</View>
	// 	</View>
	// }
	// renderGuid(list, limit) {
	// 	var rs = [];
	// 	var group = [];
	// 	for (var i = 0; i < list.length; i++) {
	// 		if (i % 3 == 0 && i != 0) {
	// 			rs.push(<View style={{ marginTop: scaleSize(8), height: scaleSize(135), flexDirection: "row", alignItems: 'center' }}>
	// 				{group}
	// 			</View>);
	// 			group = [];
	// 			group.push(<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
	// 				{this.renderItem(list[i], i)}
	// 			</View>)
	// 		} else {
	// 			group.push(<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
	// 				{this.renderItem(list[i], i)}
	// 			</View>)
	// 		}
	// 	}
	// 	if (group.length > 0) {
	// 		for (var i = 0; i < 3 - group.length; i++) {
	// 			group.push(<View style={{ flex: 1, alignItems: 'center' }}></View>)
	// 		}
	// 		rs.push(<View style={{ marginTop: scaleSize(8), height: scaleSize(135), flexDirection: 'row', alignItems: 'center' }}>
	// 			{group}
	// 		</View>)
	// 	}

	// 	return rs;
	}

	renderItem(item, index) {
		item.coachJudge = item
		item.mediaPath = ApiUrl.RECOMMEND_IMAGE

		this.state.isCoach ? item.isInstructor = true : item.isCoach = true

		return <DynamicItem
			onPress={(item, isOpenComment = false) => {
				RouteHelper.navigate("DynamicDetailPage", {
					item: item,
					type: "coachJudge",
					refreshHomePage: () => this.refreshPage(),
					loginuser: this.state.loginuser,
				});
			}}
			item={item}
			index={index}
			key={index}
			listData={this.listView.getRows()}
		/>
		// if (this.state.isCoach) {
		// 	item.category = item.remark + ' 教官';
		// 	item.avatar = ApiUrl.COACH_IMAGE + item.avatar;
		// } else {
		// 	item.category = item.remark + ' 裁判';
		// 	item.avatar = ApiUrl.JUDGE_IMAGE + item.avatar;
		// }

		// return <TouchableOpacity
		// 	style={{ alignItems: 'center', flex: 1 }}
		// 	onPress={() => {

		// 	}}
		// 	key={index}>
		// 	<LoadingImage
		// 		source={{ uri: item.avatar }}
		// 		style={{ width: scaleSize(68), height: scaleSize(68), borderRadius: scaleSize(68 / 2) }}
		// 	/>
		// 	<Text
		// 		numberOfLines={1}
		// 		style={{ fontSize: 16, color: '#000', fontWeight: "600", marginTop: scaleSize(7) }}>{item.nickname}</Text>
		// 	<Text
		// 		numberOfLines={1}
		// 		style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", marginTop: scaleSize(3) }}>{item.category}</Text>
		// </TouchableOpacity>
	}

	refreshPage() {
		this.listView?.refresh()
	}

	async callRestApi(restUrl, params = {}) {
		var result = [];

		await request.post(restUrl, params).then(res => {
			if (res.status === 200) {
				result = res.data.rows;
			}
		}).catch(err => () => { });

		return result;
	}


	async getDataFromRestApi(page, pageSize) {

		let result = [];

		// get carsouel list
		result = await this.callRestApi(ApiUrl.CAROUSEL_LIST, { onPage: this.state.isCoach ? 5 : 6 });
		this.setState({ carouselList: result });

		// get item list
		const loginuser = await UserStore.getLoginUser()
		var params = {
			pd: {
				pageNum: page,
				pageSize: pageSize
			},
			userId: loginuser.id
		}
		result = await this.callRestApi(this.state.isCoach ? ApiUrl.COACH_GROUP_LIST : ApiUrl.JUDGE_GROUP_LIST, params);
		this.setState({ itemList: result });
	}

	// extractDate(dateTime) {
	// 	return dateTime ? dateTime.substring(0, 10) : '';
	// }


	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20;

		await this.getDataFromRestApi(page, pageSize);

		try {
			startFetch(this.state.itemList, pageSize);
		} catch (err) {
			abortFetch();
		}
	};

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
				<UINavBar title={this.state.isCoach ? '教官' : '裁判'} />
				{/* <ScrollView>
					{this.state.groupList.map((item, index) => {
						return this.renderSessionItem(item, index)
					})}
				</ScrollView> */}
				<UltimateListView
					header={() => {
						var rs = [];
						rs.push(<View style={{ padding:scaleSize(10) }}><HeaderCarousel carouselList={this.state.carouselList} /></View>)
						rs.push(<View style={{ height: scaleSize(10), backgroundColor: "#F2F6F9" }} />)
						return rs;
					}}
					numColumns={1}
					allLoadedText={"没有更多了"}
					waitingSpinnerText={'加载中...'}
					ref={ref => this.listView = ref}
					onFetch={this.onFetch.bind(this)}
					keyExtractor={(item, index) => `${index}`}
					item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
					displayDate
					emptyView={() => {
						return <EmptyView />
					}}
				/>
			</View>
		)
	}

}







