import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity,Dimensions } from 'react-native'
import { images } from '../../../res/images';
import { UltimateListView } from 'react-native-ultimate-listview';
import EmptyView from '../../../components/EmptyView';
import request from '../../../api/Request'
import UISelect from '../../../components/UISelect';
import ApiUrl from '../../../api/Url.js';
import UICitySelect from '../../../components/UICitySelect';
import store from '../../../store';
import CommonMatchItem from './CommonMatchItem';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import {getCurrMonthDays} from '../../../global/DateTimeUtils';
import moment from "moment";
import { scaleSize } from '../../../global/utils';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class CommonActivityListPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pageText: '国内/际赛事',
			fkTableId: 2,
			restApiUrl: ApiUrl.CONTEST_LIST,
			imagePath: ApiUrl.CONTEST_IMAGE,
			carouselOnPage: 3,
			filterOptions: {
				area: {
					"id": null,
					"title": "全部"
				},
				kemu: {
					"courseId": null,
					"typeId": null,
					"title": "全部"
				},
				level: {
					"code": null,
					"title": "全部"
				},
				time: {
					"code": null,
					"title": "全部"
				}
			},
			carouselList: [],
			itemList: [],
			areaList: [],
			courseList: [],
			levelList: [],
			date: moment().format("YYYY-MM"),
			dotsList: {},
		};
	}

	async componentDidMount() {
		// 获取地区列表
		const areas = await store.AppStore.getAreaList();
		this.state.areaList = [];
		this.setState({ areaList: areas });

		// 获取科目，课程列表
		const courses = await store.AppStore.getCourseList();
		this.state.courseList = [];
		this.setState({ courseList: courses })

		// 获取赛事级别列表
		if (this.state.fkTableId === 2) {
			const levels = await store.AppStore.getLevelList();
			this.state.levelList = [];
			this.setState({ levelList: levels })
		}

		// this.getCalendarData();
	}


	async callRestApi(restUrl, params = {}) {
		var result = [];

		var res = await request.post(restUrl, params)

		if (res.status === 200) {
			result = res.data.rows;
		}
		return result;
	}

	extractDate(dateTime) {
		return dateTime ? dateTime.substring(0, 10) : '';
	}

	renderItem(item) {
		// in case this method repeat
		if (!item.shootType) {
			item.imageUrl = item.imageUrl ? this.state.imagePath + item.imageUrl : '';
			item.startDate = this.extractDate(item.startDate);
			item.endDate = this.extractDate(item.endDate);
			item.enrollDeadline = this.extractDate(item.enrollDeadline);
			item.area = item.area.name;
			item.course = item.course.name;
			item.shootType = item.type.name;
			item.pageText = this.state.pageText;
			item.fkTableId = this.state.fkTableId;
		}

		return <CommonMatchItem item={item} isMatch={false}/>

	}

	async getFilterListData(page,pageSize) {
		this.state.itemList = [];
		const result = await this.callRestApi(this.state.restApiUrl, {
			pd: {
				pageNum: page,
				pageSize: pageSize
			},
			areaId: this.state.filterOptions.area.id,
			typeId: this.state.filterOptions.kemu.typeId,
			courseId: this.state.filterOptions.kemu.courseId,
			timeType: this.state.filterOptions.level.code,
			params: {
				beginTime: getCurrMonthDays(this.state.date)[0],
				endTime: getCurrMonthDays(this.state.date)[1],
			}
		})
		this.setState({
			itemList: result 
		});
	}

	//获取日历赛事列表
	async getCalendarData(date){
		await request.post(ApiUrl.CALENDAR_LIST, {
			params: {
				beginTime: getCurrMonthDays(date)[0],
				endTime: getCurrMonthDays(date)[1],
			}
		}).then(res => {
			let dots = []
			let dateList = []
			let newDots = {};
			for(var i in res?.data){
				for(var j in res?.data[i]){
					dateList.push(j)
					if(res?.data[i][j].length > 0){
						let dayContestList = []
						for(var m in res?.data[i][j]){
							dayContestList.push({color: res?.data[i][j][m].color})
						}
						dots.push( {dots: dayContestList} )
					}else{
						dots.push( {} )
					}
				}
			}

			for(var k in dots){
				for(var l in dateList){
					let obj = {}
					if(k == l){
						obj[dateList[l]] = dots[k]
						newDots = Object.assign(newDots,obj)
					}
				}
			}

			console.log('newDots=='+JSON.stringify(newDots))
			this.setState({
				dotsList: newDots
			})
		})
	}

	renderFilter() {
		return (
			<>
				<View style={{ flexDirection: "row", marginTop: scaleSize(10),marginBottom: scaleSize(10), justifyContent: "space-between" }}>
					<TouchableOpacity
						onPress={() => {
							UICitySelect.show(this.state.courseList, (item) => {
								this.state.filterOptions.kemu = item;
								if (item.courseId == -1) {
									this.state.filterOptions.kemu.courseId = null;
								} else {
									this.state.filterOptions.kemu.courseId = item.courseId;
								}
								if (item.typeId == -1) {
									this.state.filterOptions.kemu.typeId = null;
								} else {
									this.state.filterOptions.kemu.typeId = item.typeId;
								}
								this.listView && this.listView.refresh();
							}, () => { }, "类别")
						}}
						style={styles.filter_item}>
						{/* <Text style={styles.filter_label}>科目</Text> */}
						<Text style={styles.filter_label}>
							{this.state.filterOptions.kemu.id >= 0 ?
								this.state.filterOptions.kemu.country_name + "|" + this.state.filterOptions.kemu.city_name : "类别"}
						</Text>
						<Image source={images.common.arrow_down} style={{ width: scaleSize(8), height: scaleSize(5) }} />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => {
							UICitySelect.show(this.state.areaList, (item) => {
								this.state.filterOptions.area = item;
								if (item.id == -1) {
									this.state.filterOptions.area.id = null;
								} else {
									this.state.filterOptions.area.id = item.id;
								}
								this.listView && this.listView.refresh();
							})
						}}
						style={styles.filter_item}>
						<Text style={styles.filter_label}>
							{this.state.filterOptions.area.id != null ? this.state.filterOptions.area.city_name : "地区"}
						</Text>
						<Image source={images.common.arrow_down} style={{ width: scaleSize(8), height: scaleSize(5) }} />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => {
							UISelect.show(this.state.levelList, {
								title: "级别",
								onPress: (item) => {
									this.state.filterOptions.level = item;
									if (item.code == -1) {
										this.state.filterOptions.level.code = null;
									} else {
										this.state.filterOptions.level.code = item.code;
									}
									this.state.filterOptions.level.code = item.code;
									this.listView && this.listView.refresh();
									UISelect.hide();
								}
							})
						}}
						style={styles.filter_item}>
						<Text style={styles.filter_label}>
							{this.state.filterOptions.level.code != null ? this.state.filterOptions.level.title : "级别"}
						</Text>
						<Image
							source={images.common.arrow_down}
							style={{ width: scaleSize(8), height: scaleSize(5) }} />
					</TouchableOpacity>
				</View>
				<CalendarList
				//回调，当滚动视图中可见月份改变时执行
				onVisibleMonthsChange={(months) => {
					const dateStr = months[0].dateString;
					// this.getCalendarData(dateStr)
					this.setState({
						date: dateStr
					},()=>{
						this.listView && this.listView.refresh();
					})
				}}
				//最多可以滚动到过去的月数。默认值= 50 
				pastScrollRange={50}
				//允许滚动到将来的最大月份数。默认值= 50 
				futureScrollRange={50}
				//启用或禁用日历列表滚动
				scrollEnabled={false}
				//启用水平滚动，默认= false 
				horizontal={true}
				//启用水平分页，默认= false 
				pagingEnabled={true}
				//设置自定义calendarWidth。
				calendarWidth = { scaleSize(345) } 
				monthFormat={'yyyy MM'}
				markedDates={this.state.dotsList}
				markingType={'multi-dot'}
				//隐藏月份导航箭头。默认值= false 
				hideArrows = { false } 
				//启用在月份之间滑动的选项。默认值= false 
				enableSwipeMonths = { true } 
				style={{height: scaleSize(60)}}
				theme={{
					// monthTextColor: '#000000',
					textMonthFontWeight: 'bold',
					textMonthFontSize: scaleSize(24),
				}}
				/>
			</>
		)
	}

	resetFilter() {
		if (this.state.filterOptions.kemu) this.state.filterOptions.kemu = undefined
		if (this.state.filterOptions.time) this.state.filterOptions.time = undefined
		if (this.state.filterOptions.area) this.state.filterOptions.area = undefined
		if (this.state.filterOptions.level) this.state.filterOptions.level = undefined

		this.forceUpdate()
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		const pageSize = 10
		await this.getFilterListData(page,pageSize);
		try {
			startFetch(this.state.itemList, pageSize);
		} catch (err) {
			abortFetch();
		}
	};

	render() {
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
			<UltimateListView
				style={{ flex: 1 }}
				header={()=>{
					return <View style={{ backgroundColor: "#F2F6F", paddingBottom: scaleSize(10), paddingHorizontal:scaleSize(15)}}>
						{this.renderFilter()}
					</View>
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
	}

}


var styles = {
	filter_item: {
		padding: scaleSize(8),
		backgroundColor: "#fff",
		borderRadius: scaleSize(2),
		width: scaleSize(110),
		height: scaleSize(35),
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: 'center',
	},
	filter_label: {

	},

}







