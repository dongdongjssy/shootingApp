import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	Alert
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast } from 'teaset';
import UINavBar from '../../components/UINavBar';
import UITabBar from '../../components/UITabBar';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';
import UISelect from '../../components/UISelect';
import RankAchievementList from './RankAchievementList';
import RankHistoryList from './RankHistoryList';
import request from '../../api/Request';
import ApiUrl from '../../api/Url.js';
import store from '../../store';
import UICitySelect from '../../components/UICitySelect';
import ActivityListPage from './SubMenuPage/ActivityListPage';
import MyPointPage from './MyPointPage';
import { scaleSize } from '../../global/utils';

@inject('UserStore') //注入；
@observer
export default class RankPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: props.loginuser,
			activeIndex: 0,
			filterOptions: {
				cate: "实弹",
				cate2: "全部",
				cate3: "全部"
			},
			courseList: [],
			levelList: [],
			rankTabIndex: 0,
			params: {
				pageText: "国内/际赛事",
				fkTableId: 2,
				restApiUrl: ApiUrl.CONTEST_LIST,
				imagePath: ApiUrl.CONTEST_IMAGE,
				carouselOnPage: 3
			}
		};
	}

	async componentDidMount() {
		var levels = await store.AppStore.getLevelList()
		this.setState({ levelList: levels })
	}

	async callRestApi(restUrl, params = {}) {
		var result = [];
		await request.get(restUrl).then(res => {
			if (res.status === 200) {
				result = res.data;
			}
		}).catch(err => {
			console.debug(err)
		});

		return result;
	}

	render() {
		return <SafeAreaViewPlus style={{ flex: 1, backgroundColor: '#F2F6F9' }}>
			<UINavBar title="成绩" 
			rightView={
				<TouchableOpacity
					onPress={() => {
						RouteHelper.navigate("RankRulePage");
					}}
					style={{ marginRight: scaleSize(5), width: scaleSize(50), height: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}
				>
					<Image style={{ width: scaleSize(24), height: scaleSize(24) }} source={images.common.rule} />
				</TouchableOpacity>
			}/>
			<View style={{ flex: 1 }}>
				<UITabBar
					onChange={(index) => {
						this.setState({
							rankTabIndex: index,
						})
					}}
					activeIndex={this.state.rankTabIndex}
				>
					<UITabBar.Item label="我的成绩">
						<MyPointPage loginuser={this.state.loginuser}/>
					</UITabBar.Item>
					<UITabBar.Item label="赛事成绩">
						<ActivityListPage />
					</UITabBar.Item>
					<UITabBar.Item label="CPSA年度积分">
						<RankList loginuser={this.state.loginuser} courseList={this.state.courseList} levelList={this.state.levelList} />
					</UITabBar.Item>
				</UITabBar>
			</View>

			
		</SafeAreaViewPlus>
	}
}

class RankList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			headData: [],
			filterOptions: {
				kemu: {
					"code": 0,
					"title": "枪组"
				},
				ageGroup: {
					"code": 0,
					"title": "年龄组"
				},
				level: {
					"id": -1,
					"courseId": 2,
					"typeId": 1
				}
			},
			loginuser: props.loginuser,
			filterOptionCate1: 1,
			filterOptionCate2: 0,
			filterOptionCate3: 0,
			myRankData: {
				rank: "-",
				name: props.loginuser.realName,
				changcis: [
					{
						score: "-",
						changci: '-',
						avg_score: "-",
					},
					{
						score: "-",
						changci: '-',
						avg_score: "-",
					}
				]
			},
			listData: [],
			courseList: props.courseList,
			ageGroupList: [],
			levelList: props.levelList,
			yearGroupList: [{ title: 2021, code: 2021 }, { title: 2020, code: 2020 }, { title: 2019, code: 2019 }, { title: 2018, code: 2018 }],
			currentYear: 2021,
			currentIntegral: true,//默认根据积分排名
		};
		this.contentEnableScroll = true;
		this.headEnableScroll = true;
		this.myRankEnableScroll = true;
	}

	renderFilter() {
		return (
			<>
				<View style={{ flexDirection: "row", marginTop: scaleSize(10), justifyContent: "space-between", padding: scaleSize(10) }}>
					<TouchableOpacity
						onPress={() => {
							UISelect.show(this.state.yearGroupList, {
								onPress: (item) => {
									this.state.currentYear = item.code;
									this.getRecommend();
									this.forceUpdate();
									UISelect.hide();
								}
							})
						}}
						style={styles.filter_item}>
						<Text style={styles.filter_label}>	{this.state.currentYear ? this.state.currentYear : "2020"}</Text>
						<Image
							source={images.common.arrow_down}
							style={{ width: scaleSize(8), height: scaleSize(5) }} />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							UICitySelect.show(this.state.levelList, (item) => {
								this.state.filterOptions.level = item;
								this.getRecommend();
								this.forceUpdate();
								UISelect.hide();
							}, () => { }, "类型")
						}}
						style={styles.filter_item}>
						<Text style={styles.filter_label}>
							{this.state.filterOptions.level.id >= 0 ?
								this.state.filterOptions.level.country_name + "|" + this.state.filterOptions.level.city_name : "类型"}
						</Text>
						<Image source={images.common.arrow_down} style={{ width: scaleSize(8), height: scaleSize(5) }} />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							UISelect.show(this.state.courseList, {
								onPress: (item) => {
									this.state.filterOptions.kemu = item;
									this.getRecommend();
									this.forceUpdate();
									UISelect.hide();
								}
							})
						}}
						style={styles.filter_item}>
						<Text style={styles.filter_label}>	{this.state.filterOptions.kemu ? this.state.filterOptions.kemu.title : ""}</Text>
						<Image source={images.common.arrow_down} style={{ width: scaleSize(8), height: scaleSize(5) }} />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							UISelect.show(this.state.ageGroupList, {
								onPress: (item) => {
									this.state.filterOptions.ageGroup = item;
									this.getRecommend();
									this.forceUpdate();
									UISelect.hide();
								}
							})
						}}
						style={styles.filter_item}>
						<Text style={styles.filter_label}>	{this.state.filterOptions.ageGroup ? this.state.filterOptions.ageGroup.title : ""}</Text>
						<Image
							source={images.common.arrow_down}
							style={{ width: scaleSize(8), height: scaleSize(5) }} />
					</TouchableOpacity>
				</View>
				<View style={{ flexDirection: "row",justifyContent: "space-between",padding: scaleSize(10),marginTop: scaleSize(-10) }}>
					<Text style={{lineHeight: scaleSize(30)}}>{this.state.currentIntegral?'按总积分排名':'按总分数排名'}</Text>
					<View style={{flexDirection: "row", justifyContent: "space-between"}}>
						<TouchableOpacity onPress={()=>{
							this.setState({
								currentIntegral: true
							},()=>{
								this.getRecommend();
								this.forceUpdate();
							})
						}}>
							<Text style={[styles.textFilter,{backgroundColor: this.state.currentIntegral?'#FFFFFF':'#C4C4C4',color: this.state.currentIntegral?'#DF2223':'#323232'}]}>总积分</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={()=>{
							this.setState({
								currentIntegral: false
							},()=>{
								this.getRecommend();
								this.forceUpdate();
							})
						}}>
							<Text style={[styles.textFilter,{backgroundColor: this.state.currentIntegral?'#C4C4C4':'#FFFFFF',color: this.state.currentIntegral?'#323232':'#DF2223'}]}>总分数</Text>
						</TouchableOpacity>
					</View>
				</View>
			</>
		)
	}

	refreshList() {
		//var areaFilter = (this.state.filterOptions.area && this.state.filterOptions.area.id >= 0) ? this.state.filterOptions.area : undefined
		var kemuFilter = (this.state.filterOptions.kemu && this.state.filterOptions.kemu.code >= 0) ? this.state.filterOptions.kemu : undefined
		//var timeFilter = (this.state.filterOptions.time && this.state.filterOptions.time.code >= 0) ? this.state.filterOptions.time : undefined
		var filteredList = []

		this.state.itemList.map(item => {
			var display = true

			//if (areaFilter && item.areaId != areaFilter.id) display = false
			if (kemuFilter && item.courseId != kemuFilter.code) display = false

			if (display) filteredList.push(item)
		})

		this.listView.updateDataSource(filteredList)
	}

	async componentDidMount() {
		let restApiUrl = ApiUrl.RANK_PAGE_YEAR_LIST;
		request.post(restApiUrl, { year: this.state.currentYear }).then(res => {
			if (res.status === 200) {
				// console.debug("RANK_PAGE_YEAR_LIST: ", res.data)
				this.setState({ headData: res.data });
			}
		}).catch(err => console.log(err));

		//请求成绩列表数据
		this.getRecommend();

		var levels = await store.AppStore.getCourseList()
		this.setState({ levelList: levels })

		var courses = await this.callRestApis(ApiUrl.MATCH_RANK_COURSE_LIST);
		var courseList = [];
		courses.map(c => {
			courseList.push({ title: c.name, code: c.id })
		})
		this.setState({ courseList: courseList })

		var ageGroups = await this.callRestApis(ApiUrl.MATCH_RANK_AGE_GROUP_LIST);
		var ageGroupList = [];
		ageGroups.map(c => {
			ageGroupList.push({ title: c.name, code: c.id })
		})
		this.setState({ ageGroupList: ageGroupList })
	}

	async callRestApis(restUrl, params = {}) {
		var result = [];
		await request.get(restUrl).then(res => {
			if (res.status === 200) {
				//alert('返分组成功' +res.data);
				result = res.data;
			}
		}).catch(err => {
			console.debug(err)
		});
		return result;
	}

	async getRecommend() {
		this.state.listData = [];
		this.setState({
			myRankData: {
				rank: "-",
				name: this.state.loginuser.realName,
				changcis: [{
					score: "-",
					changci: '-',
					avg_score: "-",
				}, {
					score: "-",
					changci: '-',
					avg_score: "-",
				}],
			}
		})
		let result = await this.callRestApi(ApiUrl.RANK_PAGE_SCORE_LIST, {
			pd: {
				pageNum: 1,
				pageSize: 30
			},
			year: this.state.currentYear,
			courseId: this.state.filterOptions.level.courseId,
			typeId: this.state.filterOptions.level.typeId,
			contestGroupId: this.state.filterOptions.kemu.code,
			ageGroup: this.state.filterOptions.ageGroup.code,
			sendUserId: this.state.loginuser.id,
			sortByScore: !this.state.currentIntegral,//总积分传false，总分数传true
		})
		for (var i = 0; i < result.length; i++) {
			let rankItem = result[i];
			var changcis = [];
			let totalScoreFs = (result[i].score).toFixed(3);
			rankItem.contestStatsList.forEach((v, k) => {//k,v位置是反的哦
				let bestScore = v.bestScore;
				let totalScore = v.totalScore;
				if (bestScore === undefined || bestScore === null) {
					bestScore = '-';
				}
				if (totalScore === undefined || totalScore === null) {
					totalScore = '-';
				}
				if (totalScoreFs === undefined || totalScoreFs === null) {
					totalScoreFs = '-';
				}
				let totalCount;
				let sscore;
				let bestAvgScore;
				if (k === 1) {
					sscore = bestScore;
					totalCount = v.bestCount;
					bestAvgScore = v.bestAvgScore;
				} else {
					sscore = totalScore;
					totalCount = v.totalCount;
					bestAvgScore = v.totalAvgScore;
				}
				if (totalCount === undefined || totalCount === null) {
					totalCount = '-';
				}

				if (bestAvgScore === undefined || bestAvgScore === null) {
					bestAvgScore = '-';
				}

				changcis.push({
					score: sscore,
					changci: totalCount,
					avg_score: bestAvgScore,
				})
			})
			this.state.listData.push({
				rank: rankItem.rank,
				name: rankItem.realName,
				changcis: changcis,
				itMe: rankItem.itMe,
				totalScoreFs: totalScoreFs
			})
		}
		this.forceUpdate()
		//  this.setState({ itemDetailsList: result })
	}

	async callRestApi(restUrl, params = {}) {
		var result = [];
		await request.post(restUrl, params).then(res => {
			if (res.status === 200) {
				result = res.data.rows;
			}
		}).catch(err => {
			console.debug(err)
		});
		return result;
	}

	renderTableHead() {
		var result = [];
		result.push(<View style={{ backgroundColor: "#F7F8FA", height: scaleSize(45), flexDirection: "row" }}>
			<View style={[styles.tableHeaderView, {width: scaleSize(50)}]}>
				<Text style={styles.tableHeaderBoldText}>序号</Text>
			</View>
			<View style={styles.tableHeaderLine}></View>
			<View style={[styles.tableHeaderView, {width: scaleSize(72)}]}>
				<Text style={styles.tableHeaderBoldText}>姓名</Text>
			</View>
			<View style={styles.tableHeaderLine}></View>
			<View style={[styles.tableHeaderView, {width: scaleSize(72)}]}>
				<Text style={styles.tableHeaderBoldText}>总分数</Text>
			</View>
			<View style={styles.tableHeaderLine}></View>
			{
				this.state.headData.map((item, index) => {
				var rs = [];
				rs.push(
				<View style={{ height: scaleSize(45), width: scaleSize(181) }} key={index}>
					{/* <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
						<Text style={{ fontSize: 12, fontWeight: "500" }}>{item}</Text>
					</View> */}
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
						<Text style={styles.tableHeaderText}>{index == 0 ? '总积分' : '最好三场积分'}</Text>
						<View style={styles.tableHeaderLine}></View>
						<Text style={styles.tableHeaderText}>{index == 0 ? '总场次' : '场次'}</Text>
						<View style={styles.tableHeaderLine}></View>
						{/* <Text style={styles.tableHeaderText}>平均分</Text> */}
					</View>
				</View>
				)
				return rs;
			})}
		</View>)
		return result;
	}
	renderItem(item, index) {
		return <View
			key={index}
			ref={(ref) => {}}
			showsVerticalScrollIndicator={false}
			showsHorizontalScrollIndicator={false}
			horizontal={true}
			style={{
				height: scaleSize(45),
				flexDirection: "row",
				backgroundColor: index % 2 == 0 ? "#fff" : '#FBFBFB',
			}}>
			<View style={[styles.tableHeaderView, {width: scaleSize(50)}]}>
				<Text style={{ color: item.rank <= 3 ? '#D43D3E' : '#323232', fontSize: 12, fontWeight: "600", }}>{item.rank}</Text>
			</View>
			<View style={styles.tableHeaderLine}></View>
			<View style={[styles.tableHeaderView, {width: scaleSize(72)}]}>
				<Text style={[styles.tableBodyText,{color: item.itMe ? "red" : "#323232"}]}>{item.name}</Text>
			</View>
			<View style={styles.tableHeaderLine}></View>
			<View style={[styles.tableHeaderView, {width: scaleSize(72)}]}>
				<Text style={[styles.tableBodyText,{color: item.itMe ? "red" : "#323232"}]}>{item.totalScoreFs}</Text>
			</View>
			<View style={styles.tableHeaderLine}></View>
			{item.changcis.map((item, index) => {
				return <View
					key={index}
					style={{ width: scaleSize(181), height: '100%', flexDirection: "row", alignItems: 'center' }}>
					<View style={styles.tableBodyView}>
						<Text style={styles.tableBodyText}>{item.score}</Text>
					</View>
					<View style={styles.tableHeaderLine}></View>
					<View style={styles.tableBodyView}>
						<Text style={styles.tableBodyText}>{item.changci}</Text>
					</View>
					<View style={styles.tableHeaderLine}></View>
					{/* <View style={styles.tableBodyView}>
						<Text style={styles.tableBodyText}>{item.avg_score}</Text>
					</View>*/}
				</View>
			})}
		</View>
	}
	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		var rowData = []
		try {
			var res = this.state.listData
			startFetch(res, pageSize);
		} catch (err) {
			abortFetch();
		}
	};
	render() {
		var myRankData = this.state.myRankData;
		return <View style={{ flex: 1 }}>
			{this.renderFilter()}
			{
				this.state.currentYear == 2018 || this.state.currentYear == 2019 ?
				<RankHistoryList />
				:
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
							this.myRankEnableScroll = true
						}}
						onScroll={(e) => {
							var scroll_y = e.nativeEvent.contentOffset.y;
							var scroll_x = e.nativeEvent.contentOffset.x;
							if (this.contentEnableScroll) {
								this.headEnableScroll = false;
								this.myRankEnableScroll = false;
								this.head_scroll && this.head_scroll.scrollTo({ x: scroll_x, y: 0, animated: false })
								this.my_rank_scroll && this.my_rank_scroll.scrollTo({ x: scroll_x, y: 0, animated: false })
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
			}
		</View>
	}
}

var styles = {
	filter_item: {
		padding: scaleSize(8),
		backgroundColor: "#fff",
		borderRadius: scaleSize(2),
		width: scaleSize(80),
		height: scaleSize(35),
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: 'center',
	},
	tableHeaderText: { 
		fontWeight: "400", 
		color: "#323232", 
		fontSize: 12, 
		textAlign: 'center', 
		flex: 1, 
		alignItems: 'center', 
		justifyContent: 'center' 
	},
	tableHeaderBoldText: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#323232",
		fontFamily: "PingFang SC",
	},
	tableHeaderView: {
		alignItems: 'center', 
		height: scaleSize(45), 
		justifyContent: 'center'
	},
	tableHeaderLine: {
		width: ONE_PX,
		backgroundColor: "rgba(0,0,0,0.10196078431372549)",
		height: scaleSize(45),
	},
	tableBodyView: { 
		alignItems: 'center', 
		justifyContent: 'center', 
		flex: 1 
	},
	tableBodyText: { 
		fontSize: 12, 
		fontWeight: "500", 
		color: "#323232" 
	},
	textFilter: {
		width: scaleSize(70),
		height: scaleSize(30),
		textAlign: 'center',
		lineHeight: scaleSize(30)
	}
}







