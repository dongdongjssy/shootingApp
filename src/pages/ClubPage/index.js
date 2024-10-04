import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images';
import { ModalIndicator } from 'teaset';
import UINavBar from '../../components/UINavBar';
import UISelect from '../../components/UISelect';
import { UltimateListView } from 'react-native-ultimate-listview';
import { UserStore } from '../../store/UserStore';
import { AppStore } from '../../store/AppStore';
import HeaderCarousel from '../HomePage/HeaderCarousel';
import Request from '../../api/Request';
import ApiUrl from '../../api/Url';
import UICitySelect from '../../components/UICitySelect';
import DynamicItem from '../HomePage/DynamicItem';
import EmptyView from '../../components/EmptyView';
import UIConfirm from '../../components/UIConfirm';
import { ClientStatusEnum } from '../../global/constants';
import CommonActivityItem from '../HomePage/SubMenuPage/CommonActivityItem';
import LoadingImage from '../../components/LoadingImage';
import { scaleSize } from '../../global/utils';
import request from '../../api/Request';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';

export default class ClubPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: undefined,
			clubList: [],
			carouselList: [],
			areaList: [],
			categoryList: [],
			activeType: "post",
			fixedFilter: false,
			filterArea: undefined,
			filterCategory: undefined,
			postList: undefined,
			myClub: [],
			imagePath: ApiUrl.CLUB_ACTIVITY_IMAGE,
		};
	}

	async componentDidMount() {
		ModalIndicator.show("获取数据")

		var user = await UserStore.getLoginUser()
		this.state.loginuser = user
		this.forceUpdate()

		await this.getCarouselList()
		// await this.getCategoryList()

		var areas = await AppStore.getAreaList()
		this.setState({ areaList: areas })

		if(this.state.loginuser != null){
			await this.getMyClub()
		}
		

		ModalIndicator.hide()


		DeviceEventEmitter.addListener("followClubUpdated", async () => {
			console.debug("【监听回调，俱乐部主页】关注俱乐部更新")
			await this.getMyClub();
			this.listView && this.listView.refresh();
		})

		DeviceEventEmitter.addListener('userUpdated', (res) => {
			if (res.user) {
				console.debug("【监听回调，俱乐部主页】更新用户信息")
				this.setState({ loginuser: res.user })
			}
		})

		DeviceEventEmitter.addListener("likeUpdated", async () => {
			console.debug("【监听回调，点赞】动态有更新")
			this.listView?.refresh();
		});
	}

	// 获取我关注的俱乐部
	getMyClub = async () => {
		await Request.post(ApiUrl.USER_FOLLOW_LIST, { clientUserId: this.state.loginuser.id, followType: "club" }).then(res => {
			if (res.status === 200) {
				// console.debug("我关注的俱乐部", res.data.rows)
				this.setState({ myClub: res.data.rows })
			}
		}).catch(err => ModalIndicator.hide())
	}

	getClubPosts = async (callback) => {
		let user = await UserStore.getLoginUser()
		await Request.post(ApiUrl.MY_CLUB_POST + user.id).then(res => {
			if (res.status === 200) {
				callback && callback(res.data.rows)
			}
		}).catch(err => console.log(err));
	}

	getCarouselList = async () => {
		Request.post(ApiUrl.CAROUSEL_LIST, { onPage: 4 }).then(res => {
			if (res.status === 200) {
				this.setState({ carouselList: res.data.rows })
			}
		})
	}

	getCategoryList = async () => {
		Request.post(ApiUrl.CLUB_CATEGORY_LIST, {
			type: "shooting_club_category"
		}).then(res => {
			if (res.status === 200) {
				var categories = []
				res.data.categories.map(item => {
					categories.push({ title: item.value, code: item.code })
				})

				categories.push({ title: "全部", code: -1 })
				this.setState({ categoryList: categories })
			}
		})
	}

	selectArea = () => {
		UICitySelect.show(this.state.areaList, (item) => {
			this.setState({ filterArea: item }, () => this.refreshFilteredList())
		})
	}

	selectCategory = () => {
		UISelect.show(this.state.categoryList, {
			title: "分类",
			onPress: (item) => {
				this.setState({ filterCategory: item }, () => this.refreshFilteredList());
				UISelect.hide();
			},
			onCancel: () => {

			}
		})
	}

	refreshFilteredList = () => {
		var filteredList = []

		var areaFilter = (this.state.filterArea && this.state.filterArea.id != -1) ? this.state.filterArea : undefined
		var categoryFilter = (this.state.categoryFilter && this.state.categoryFilter.code != -1) ? this.state.categoryFilter : undefined

		for (var i = 0; i < this.state.postList.length; i++) {
			var post = this.state.postList[i]
			var display = true

			if (areaFilter && areaFilter.id != post.club.areaId) display = false
			if (categoryFilter && categoryFilter.title != post.club.category) display = false

			if (display) {
				filteredList.push(post)
			}
		}

		this.listView.updateDataSource(filteredList)
	}

	renderItem(item, index) {
		item.clubPost = item
		item.clubPost.mediaPath = ApiUrl.CLUB_POST_IMAGE;
		// item.clubPost.commentCount = item.commentDetailsList.length;
		item.clientUser = {}
		item.clientUser.avatar = item.club?.avatar
		item.clientUser.nickname = item.club?.title
		item.bgimg = ApiUrl.CLUB_IMAGE + item.club?.image
		item.avatar = ApiUrl.CLUB_IMAGE + item.club?.avatar
		item.club.clientUser = item?.clientUser

		return (
			<DynamicItem
				onPress={(itemDetails, isOpenComment = false) => {
					// itemDetails.clientUser = itemDetails.club
					itemDetails.clientUser = {}
					itemDetails.clientUser.avatar = itemDetails.club?.avatar
					itemDetails.clientUser.nickname = itemDetails.club?.title
					itemDetails.bgimg = ApiUrl.CLUB_IMAGE + itemDetails.club?.image
					itemDetails.avatar = ApiUrl.CLUB_IMAGE + itemDetails.club?.avatar
					itemDetails.club.clientUser = itemDetails.clientUser
					RouteHelper.navigate("DynamicDetailPage", {
						loginuser: this.state.loginuser,
						item: itemDetails,
						refreshHomePage: () => this.refreshPage(),
						isOpenComment: isOpenComment,
						type: 'post'
					});
				}}
				item={item}
				index={index}
				key={index}
				type={'post'}
				listData={this.listView.getRows()}
			/>
		)
	}

	extractDate(dateTime) {
		return dateTime ? dateTime.substring(0, 10) : '';
	}
	renderActivityItem(item, index) {
		if (!item.area) return null;
		if (!item.shootType) {
			item.imageUrl = item.imageUrl ? this.state.imagePath + item.imageUrl : '';
			item.startDate = this.extractDate(item.startDate);
			item.endDate = this.extractDate(item.endDate);
			item.area = item.area.name;
			item.course = item.course.name;
			item.shootType = item.type.name;
			item.pageText = this.state.pageText;
			item.fkTableId = this.state.fkTableId;
			item.clubPost = item
			item.clubPost.mediaPath = ApiUrl.CLUB_POST_IMAGE;
		}

		item.pageText = "俱乐部活动"
		item.fkTableId = 3
		return <CommonActivityItem item={item} isShowClubTitle={true} index={index}/>

	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 40

		try {
			await this.getClubPosts((rows) => {
				this.setState({ postList: rows })
				startFetch(rows, pageSize);
			})
		} catch (err) {
			abortFetch();
		}
	}
	renderFilter() {
		return (
			<View style={{
				alignItems: 'center',
				flexDirection: "row",
				height: scaleSize(35),
				marginTop: scaleSize(10),
				// marginVertical: scaleSize(10),
				justifyContent: 'space-between',
				// flex:1
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
		)
	}
	renderHeader() {
		return (
			<View style={{ padding: scaleSize(10) }}>
				<HeaderCarousel carouselList={this.state.carouselList} />
				{this.renderFilter()}
			</View>
		)
	}

	//轮播图广告
	carouseImg(item) {
		return (
			<View style={{ height: scaleSize(160), width: "100%",paddingLeft: scaleSize(10),paddingRight: scaleSize(10),marginBottom: scaleSize(10) }}>
				<TouchableOpacity
					onPress={async () => {
						if (item.mediaType == 1) {
							// var user = await UserStore.getLoginUser();
							let item = { "content": item.title, "htmlContent": item.subTitle }
							RouteHelper.navigate("SysytemNotificationDetailPage", { itemData: item, from: "carousel" });
						} else if (item.mediaType == 2) {
							this.getDetailData(ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL, item.contestId);//关联赛事
						} else if (item.mediaType == 3) {
							this.getDetailData(ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL, item.trainingId);//关联培训
						} else if (item.mediaType == 4) {
							this.getDetailData(ApiUrl.SYSTEM_MESSAGE_COACH_DETAIL, item.coachId);//关联教官
						} else if (item.mediaType == 5) {
							this.getDetailData(ApiUrl.SYSTEM_MESSAGE_JUDGE_DETAIL, item.judgeId);//关联裁判
						} else if (item.mediaType == 6) {
							this.getDetailData(ApiUrl.RECOMMEND_GET_DETAIL_BY_ID, item.recommendId);//关联总会推荐
						} else if (item.mediaType == 7) {
							this.getDetailData(ApiUrl.CLUB_POST_DETAIL_BY_ID, item.clubPostId);//关联俱乐部动态
						} else if (item.mediaType == 8) {
							this.getDetailData(ApiUrl.CLUB_ACTIVITY_BY_ID, item.clubActivityId);//关联俱乐部赛事
						} 
					}}
					style={{ flex: 1 }}
				>
					<LoadingImage
						style={{ height: scaleSize(156), width: "100%" }} resizeMode='cover'
						source={{ uri: ApiUrl.CAROUSEL_IMAGE + item.mediaUrl }}
					/>

				</TouchableOpacity>
			</View>
		)
	}

	async getDetailData(apiUrl, orderId) {
		ModalIndicator.show("获取数据")
		let result = {};
		let res;
		if(apiUrl == ApiUrl.RECOMMEND_GET_DETAIL_BY_ID || apiUrl == ApiUrl.CLUB_POST_DETAIL_BY_ID || apiUrl == ApiUrl.CLUB_ACTIVITY_BY_ID){
			res = await request.post(apiUrl + orderId, {})
		}else{
			res = await request.post(apiUrl + '/' + orderId, {})
		}
		if (res.status === ResponseCodeEnum.STATUS_CODE) {
			result = res.data;
			if (result) {
				// var user = await UserStore.getLoginUser();
				if (apiUrl === ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL || apiUrl === ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL || apiUrl === ApiUrl.CLUB_ACTIVITY_BY_ID) {
					if (apiUrl === ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL) result.imageUrl = result.imageUrl ? ApiUrl.TRAINING_IMAGE + result.imageUrl : '';
					if (apiUrl === ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL) result.imageUrl = result.imageUrl ? ApiUrl.CONTEST_IMAGE + result.imageUrl : '';
					if (apiUrl === ApiUrl.CLUB_ACTIVITY_BY_ID) {
						result.imageUrl = result.imageUrl ? ApiUrl.CLUB_ACTIVITY_IMAGE + result.imageUrl : '';
						result.area = result.areaName;
						result.course = result.courseName;
						result.shootType = result.typeName;
					}else{
						result.area = result.area.name;
						result.course = result.course.name;
						result.shootType = result.type.name;
					}
					result.startDate = this.extractDate(result.startDate);
					result.endDate = this.extractDate(result.endDate);
					result.enrollDeadline = this.extractDate(result.enrollDeadline);
					
					// result.pageText = this.state.pageText;
					// result.fkTableId = props.fkTableId;
					if (apiUrl === ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL) {result.pageText = "培训"; result.fkTableId = 1}
					if (apiUrl === ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL) {result.pageText = "赛事"; result.fkTableId = 2}
					if (apiUrl === ApiUrl.CLUB_ACTIVITY_BY_ID) {result.pageText = "俱乐部活动"; result.fkTableId = 3}

					ModalIndicator.hide()
					RouteHelper.navigate("CommonActivityDetailPage", { detailData: result });
				} else {
					result.coachJudge = result
					result.mediaPath = ApiUrl.RECOMMEND_IMAGE
					// if (apiUrl === ApiUrl.SYSTEM_MESSAGE_COACH_DETAIL) result.pageText = "教官"
					// if (apiUrl === ApiUrl.SYSTEM_MESSAGE_JUDGE_DETAIL) result.pageText = "裁判"
					// else result.imageUrl = result.imageUrl ? ApiUrl.RECOMMEND_IMAGE + result.imageUrl : '';
					ModalIndicator.hide()
					RouteHelper.navigate("DynamicDetailPage", {
						item: result,
						type: "coachJudge"
					});
				}
				ModalIndicator.hide()
			} else {
				ModalIndicator.hide()
				Toast.fail("获取关联信息失败")
			}
		} else {
			ModalIndicator.hide()
			Toast.fail("获取关联信息失败")
		}

		ModalIndicator.hide()
		return result;
	}

	extractDate(dateTime) {
		return dateTime ? dateTime.substring(0, 10) : '';
	}

	render() {
		var club_focus_iconPath = require('../../res/images/RankResult/club_focus.png');
		return (
			<View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
				<UINavBar
					leftView={null}
					rightView={
						<View style={{ flexDirection: 'row', marginRight: scaleSize(5), width: scaleSize(50), height: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}>
							{/* <TouchableOpacity
								onPress={() => {
									if (this.state.loginuser && this.state.loginuser.status !== ClientStatusEnum.VERIFIED.code) {
										UIConfirm.show("认证通过后可以关注俱乐部")
										return
									}

									RouteHelper.navigate("MyClubPage", {
										loginuser: this.state.loginuser,
										clubs: this.state.myClub
									});
								}}
								style={{ marginRight: scaleSize(-10), width: scaleSize(50), height: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}
							>
								<Image style={{ width: scaleSize(22), height: scaleSize(22) }} source={club_focus_iconPath} />
							</TouchableOpacity> */}
							<TouchableOpacity
								onPress={() => {
									if (this.state.loginuser && this.state.loginuser.status !== ClientStatusEnum.VERIFIED.code) {
										UIConfirm.show("认证通过后可以关注俱乐部")
										return
									}

									RouteHelper.navigate("ClubListPage", {
										areaList: this.state.areaList,
										categoryList: this.state.categoryList,
										loginuser: this.state.loginuser
									})
								}}
								style={{ marginRight: scaleSize(5), width: scaleSize(50), height: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}
							>
								<Image style={{ width: scaleSize(22), height: scaleSize(22) }} source={images.common.plus_white} />
							</TouchableOpacity>
						</View>
					}
					title="俱乐部"
				/>
				<View style={{ backgroundColor: "#F2F6F9", flex: 1 }}>
					{this.state.fixedFilter ? <View style={{ padding: scaleSize(10) }}>
						{this.renderFilter()}
					</View> : null}	
					<UltimateListView
						// header={() => {
						// 	return this.renderHeader();
						// }}
						// onScroll={(e) => {
						// 	var scroll_y = e.nativeEvent.contentOffset.y;
						// 	var hh = 156;
						// 	if (scaleSize(scroll_y) >= scaleSize(hh) + scaleSize(20)) {
						// 		this.setState({
						// 			fixedFilter: true,
						// 		})
						// 	} else {
						// 		this.setState({
						// 			fixedFilter: false,
						// 		})
						// 	}
						// }}
						allLoadedText={"没有更多了"}
						waitingSpinnerText={'加载中...'}
						ref={ref => this.listView = ref}
						onFetch={this.onFetch.bind(this)}
						keyExtractor={(item, index) => `${index} -`}
						item={(item, index)=>{
							if(item.enrollDeadline){
								return this.renderActivityItem(item, index);
							}else if(item.onPage){
								return this.carouseImg(item)
							}else{
								return this.renderItem(item, index)
							}
						}} // this takes three params (item, index, separator)       
						displayDate
						emptyView={() => {
							if ((this.state.postList !== undefined && this.state.postList.length === 0) && this.state.myClub.length > 0) {
								return <EmptyView />
							} else {
								return <View style={{ flex: 1, alignItems: 'center' }}>
									<Image
										source={images.common.club_empty}
										style={{
											width: scaleSize(124),
											height: scaleSize(124),
											marginTop: scaleSize(30),
										}}
									/>
									<Text style={{
										fontSize: 14, color: "rgba(0,0,0,0.60)",
										marginTop: scaleSize(13),
										fontWeight: "400"
									}}>暂无关注俱乐部</Text>
									<TouchableOpacity
										onPress={() => {
											if(this.state.loginuser == null){
												UIConfirm.show("访客不可关注俱乐部")
												return
											}else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
												UIConfirm.show("认证通过后可以关注")
												return
											}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
												UIConfirm.show("认证已过期，请及时续费")
												return
											}else{
												RouteHelper.navigate("ClubListPage", {
													areaList: this.state.areaList,
													categoryList: this.state.categoryList,
													loginuser: this.state.loginuser
												});
											}
										}}
										style={{
											width: scaleSize(100),
											height: scaleSize(37),
											flexDirection: 'row',
											alignItems: 'center',
											justifyContent: 'center',
											backgroundColor: PRIMARY_COLOR,
											borderRadius: scaleSize(4),
											marginTop: scaleSize(30),
										}}
									>
										<Image
											style={{ width: scaleSize(16), height: scaleSize(16) }}
											source={images.common.plus_white} />
										<Text style={{ marginLeft: scaleSize(6), fontSize: 14, color: "#fff", fontWeight: "400" }}>去关注</Text>
									</TouchableOpacity>
								</View>
							}
						}}
					/>
				</View>
			</View>
		)
	}
}