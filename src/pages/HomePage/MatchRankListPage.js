import React, { Component, Fragment } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	ImageBackground,
	Navigator,
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../components/UINavBar';

import UICitySelect from '../../components/UICitySelect';
import request from '../../api/Request';
import ApiUrl from '../../api/Url.js';
import store from '../../store';
import DatePicker from 'react-native-datepicker'
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';
import { scaleSize } from '../../global/utils';

@inject('UserStore') //注入；
@observer
export default class MatchRankListPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			contestId: this.props.contestId,
			datetime: "",
			headData: [
			],
			listData: [
			],
			isShowEmpty: false,
			backColor:"",
		};
		this.UserStore = this.props.UserStore;
		this.headEnableScroll = true;
	}


	//组件初始渲染执行完毕后调用
	componentDidMount() {
		this.getListData();
	}

	//组件被卸载前会执行
	componentWillUnmount() {

	}

	async getListData() {
		this.state.listData = [];
		let restApiUrl = ApiUrl.MATCH_RANK_LIST;
		request.post(restApiUrl, { contestId: this.state.contestId }).then(res => {
			if (res.status === 200) {
				let groupList = ["1"];
				console.log("res.datas:" + JSON.stringify(res.data));
				groupList = res.data.list;
				this.state.matchName = res.data["contestName"];
				for (var i = 0; i < groupList.length; i++) {
					let rankItem = groupList[i];
					var items = [];
					rankItem.items.forEach((v, k) => {//k,v位置是反的哦
						// console.log("bestScore:" + v.bestScore + "totalCount:" + v.totalCount + "bestAvgScore:" + v.bestAvgScore);
						items.push({
							group_name:v.groupName,
							cpsa_mingci: v.cpsaRank,
							zong_mingci: v.totalRank,
							name: v.importName,
							score: v.score,
							precent: v.percentage == 1 ? (v.percentage*100).toFixed(2) : v.percentage.toFixed(2),
							avg: v.avgCoeff,
							avg_time: v.avgTime,
							avg_score: v.avgScore,
							remark: v.note == 'undefined' ? '' : v.note,
							id: v.id,
							color: v.color
						})
					})
					let contestStatusList = rankItem.contestStatsList;
					this.state.listData.push({
						cate_name: rankItem.cateName,
						items: items,
					})
				}
				if (this.state.listData[0].items.length > 0) {
					this.setState({ isShowEmpty: false });
				} else {
					this.setState({ isShowEmpty: true });
				}
				this.forceUpdate()
			}
		}).catch(err => console.log(err));
	}

	async callRestApi(restUrl, params = {}) {
		var result = [];
		request.post(restApiUrl, {}).then(res => {
			if (res.status === 200) {
				// alert(res.data);
				this.setState({ groupList: res.data });
			}
		}).catch(err => console.log(err));

		return result;
	}

	async callRestApis(restUrl, params = {}) {
		var result = [];
		request.post(restUrl, {}).then(res => {
			if (res.status === 200) {
				result = res.data.rows;
				this.setState({
					locationList: result
				})
				// alert(result);
			}
		}).catch(err => console.log(err));

		return result;
	}

	renderTableHead() {
		var result = [];
		result.push(<View style={{ backgroundColor: "#F7F8FA", height: scaleSize(68), flexDirection: "row" }}>
			<View style={[styles.border_right, { width: scaleSize(75), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }]}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>组名</Text>
			</View>
			<View style={[styles.border_right, { width: scaleSize(72), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }]}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>CPSA名次</Text>
			</View>
			<View style={{ ...styles.border_right, width: scaleSize(72), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>赛事总名次</Text>
			</View>
			<View style={{ ...styles.border_right, width: scaleSize(72), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>姓名</Text>
			</View>
			<View style={{ ...styles.border_right, width: scaleSize(72), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>分数</Text>
			</View>
			<View style={{ ...styles.border_right, width: scaleSize(72), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>百分比</Text>
			</View>
			<View style={{ ...styles.border_right, width: scaleSize(72), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>平均系数</Text>
			</View>
			{/* <View style={{ ...styles.border_right, width: scaleSize(72), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>平均时间</Text>
			</View>
			<View style={{ ...styles.border_right, width: scaleSize(72), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>平均得分</Text>
			</View> */}
			<View style={{ ...styles.border_right, width: scaleSize(72), alignItems: 'center', height: scaleSize(68), justifyContent: 'center' }}>
				<Text style={{
					fontSize: 12,
					fontWeight: "bold",
					color: "#323232",
					fontFamily: "PingFang SC",
				}}>备注</Text>
			</View>


			<View style={{
				width: ONE_PX,
				backgroundColor: "rgba(0,0,0,0.10196078431372549)",
				height: scaleSize(68),
			}}></View>
			{this.state.headData.map((item, index) => {
				var rs = [];
				rs.push(
					<View
						style={{ flex: 1, width: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}>
						<Text style={{ fontSize: 12, fontWeight: "500" }}>{item.day}</Text>
					</View>)
				rs.push(<View style={{
					width: ONE_PX,
					backgroundColor: "rgba(0,0,0,0.10196078431372549)",
					height: scaleSize(68),
				}}></View>)
				return <Fragment key={index}>
					{rs}
				</Fragment>
			})}
		</View>)


		// result.push(
		// )
		return result;
	}

	renderItem(item, index) {
		return <View key={index}>
			{/* <View style={[styles.border_right, { width: scaleSize(50), alignItems: 'center', justifyContent: 'center' }]}>
				<Text>{tem.cate_name}</Text>
			</View> */}
			<View style={{ flex: 1 }}>
				{item.items.map((item2, index2) => {
					// if(index>0){
					// 	var mod_num = index%2;
					// }else{
					// 	var mod_num=2;
					// }
					// console.warn("index2+index",(index2+index)%2);
					return <TouchableOpacity
						onPress={() => {
							RouteHelper.navigate("RankDetailPage", { resultId: item2.id });
						}}
						key={index2}>
							<View style={[styles.border_right, { 
								flexDirection: "row", 
								alignItems: 'center', 
								height: scaleSize(45), 
								borderBottomColor: 'rgba(0,0,0,0.1)',
								borderBottomWidth: scaleSize(1), 
								backgroundColor: index2 % 2 == 0 ? "#fff" : '#FBFBFB'
							}]}>
								<View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center', height: scaleSize(45), backgroundColor: item2.color }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.group_name}</Text>
								</View>
								<View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.cpsa_mingci == 999999 ? 0 : item2.cpsa_mingci}</Text>
								</View>
								<View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.zong_mingci == 999999 ? 0 : item2.zong_mingci}</Text>
								</View>
								<View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.name}</Text>
								</View>
								<View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.score}</Text>
								</View>
								<View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.precent}%</Text>
								</View>
								<View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.avg}</Text>
								</View>
								{/* <View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.avg_time}</Text>
								</View>
								<View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.avg_score}</Text>
								</View> */}
								<View style={{ ...styles.border_right, width: scaleSize(73), alignItems: 'center', justifyContent: 'center' }}>
									<Text style={{ fontSize: 13, fontWeight: "bold", color: "#323232" }}>{item2.remark}</Text>
								</View>
							</View>
							
					</TouchableOpacity>
				})}
			</View>
		</View>
	}

	renderEmptyView() {

	}

	renderUserMessage() {
	}

	render() {

		return <SafeAreaViewPlus style={{ flex: 1, backgroundColor: '#F2F6F9' }}>
			<UINavBar title="赛事成绩" />
			<View style={{ flex: 1 }}>
				{
					!this.state.isShowEmpty ? (
						<View>
							<ScrollView nestedScrollEnabled={true}>
								<ScrollView
									nestedScrollEnabled={true}
									ref={(ref) => {
										this.content_scroll = ref;
									}}
									showsVerticalScrollIndicator={false}
									showsHorizontalScrollIndicator={false}
									horizontal={true}
									removeClippedSubviews={true}
									onMomentumScrollEnd={() => {
										this.headEnableScroll = true;
									}}
									onScroll={(e) => {
										var scroll_y = e.nativeEvent.contentOffset.y;
										var scroll_x = e.nativeEvent.contentOffset.x;
										if (this.contentEnableScroll) {
											this.headEnableScroll = false;
											this.head_scroll && this.head_scroll.scrollTo({ x: scroll_x, y: 0, animated: false })
										}
									}}
								>
									<View style={{ flex: 1 }}>
										{this.renderTableHead()}
										{this.state.listData.map((item, index) => {
											return this.renderItem(item, index)
										})}
									</View>
								</ScrollView>
							</ScrollView>
						</View>
					) : (

							<ScrollView
								automaticallyAdjustContentInsets={false}
								horizontal={false}
								contentContainerStyle={styles.no_data}
								style={styles.base}
							>
								<TouchableOpacity
									onPress={() => {
									}}
									style={{ alignItems: 'center', justifyContent: "center", marginTop: scaleSize(0) }}>
									<Image style={{ width: scaleSize(110), height: scaleSize(150) }} source={images.common.club_empty} />
									<Text style={styles.text}>{"暂未上传成绩，请稍后再来查看"}</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => {
										RouteHelper.goBack();
									}}
									style={{ marginTop: scaleSize(70), borderRadius: 5, width: scaleSize(107), height: scaleSize(45), alignItems: 'center', backgroundColor: 'rgba(212, 61, 62, 1)', justifyContent: "center" }}>
									<Text style={{ alignItems: 'center', color: '#FFF', justifyContent: "center", fontSize: scaleSize(14) }}>{"返 回"}</Text>
								</TouchableOpacity>
							</ScrollView>

						)
				}
			</View>
		</SafeAreaViewPlus>
	}

}

var styles = {
	filter_item: {
		padding: scaleSize(8),
		backgroundColor: "#fff",
		borderRadius: scaleSize(2),
		width: scaleSize(105),
		height: scaleSize(30),
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: 'center',
	},
	border_right: {
		borderRightWidth: ONE_PX,
		borderColor: "rgba(0,0,0,0.10196078431372549)",
	},
	base: {

	},
	no_data: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 250
	},
	refreshControlBase: {
		backgroundColor: 'transparent'
	},
	text: {
		marginTop: scaleSize(20),
		height: scaleSize(33),
		color: '#707070',
		fontSize: scaleSize(13),
		fontWeight: '400',
	}
}