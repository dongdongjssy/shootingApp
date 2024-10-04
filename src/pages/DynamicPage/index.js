import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, Alert, DeviceEventEmitter, ShadowPropTypesIOS, ActivityIndicator } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images';
import { NavigationBar, ModalIndicator } from 'teaset';
import DynamicItem from '../HomePage/DynamicItem';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView';
import ApiUrl from '../../api/Url.js';
import request from '../../api/Request';
import { UserStore } from '../../store/UserStore';
import JPush from 'jpush-react-native';
import JMessage from 'jmessage-react-plugin';
import { Time } from '../../libs/react-native-af-video-player/components';
import { AppStore } from '../../store/AppStore';
import { ClientStatusEnum } from '../../global/constants';
import { scaleSize } from '../../global/utils';
import menusList from '../HomePage/components/MenusList';
import {homePageListener,callRestListApi} from '../HomePage/components/HomePageUtils';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import UINavBar from '../../components/UINavBar';
import DynamicAddTypeSelect from '../HomePage/DynamicAddTypeSelect';
import LoadingImage from '../../components/LoadingImage';
import UIConfirm from '../../components/UIConfirm';

export default class HomePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: undefined,
			launcher_img: [],
			list: [],
			activeType: "dynamic", //dynamic
			carouselList: [],
			itemDetailsList: [],
			menus: menusList,
			msgList: [],
			unReadMsg: false
		};

		this.getIMMsg()

	}

	async componentDidMount() {
		let loginuser = await UserStore.getLoginUser()
		this.state.loginuser = loginuser
		this.forceUpdate()

		let _that =this;
		homePageListener(_that);
		DeviceEventEmitter.addListener("postAdded", async () => {
			console.debug("【监听回调，会员动态】动态有更新")
			 _that.listView?.refresh();
		});

		
		await AppStore.setUnReadMsg(false)
        DeviceEventEmitter.addListener("notifyArrived", async () => {
            console.debug("来了新消息，刷新列表")
			this.setState({ unReadMsg: true })
        })

	}

	getIMMsg = () => {
		JMessage.getMyInfo(userInfo => {
			if (userInfo.username === undefined) {
				// 极光未登录成功
			} else {
				JMessage.getConversations(conArr => {

					var findServiceMsgIndex = conArr.findIndex(msg => msg.title === 'CPSA');
					if (findServiceMsgIndex >= 0) conArr.splice(findServiceMsgIndex, 1)

					var convs = conArr.filter(c =>
						c.latestMessage &&
						c.latestMessage.from &&
						c.latestMessage.from.username &&
						c.latestMessage.from.username !== '系统消息',
					)
					if (convs.length == 0) this.setState({ unReadMsg: false })
					else {
						convs.map(conv => {
							if( conv.unreadCount && conv.unreadCount > 0 ) this.setState({ unReadMsg: true })
						})
					}
				}, error => {
					Toast.info('获取会话列表出错，请重试');
					console.debug('【极光错误】获取会话列表出错: ', error);
				})
			}
		})
	}

	getMyInfo = async () => {
		let user = await UserStore.getLoginUser()
		request.post(ApiUrl.USER_GET_BY_ID + user.id).then(async (res) => {
			if (res.status === ResponseCodeEnum.STATUS_CODE) {
				res.data.token = user.token
				res.data.refreshToken = user.refreshToken
				UserStore.saveLoginUser(res.data)
			}
		}).catch(err => ModalIndicator.hide())
	}

	getMyRole = async () => {
		let user = await UserStore.getLoginUser()
		request.post(ApiUrl.USER_ROLE_LIST, { userId: user.id }).then(async (res) => {
			if (res.status === ResponseCodeEnum.STATUS_CODE && res.data.rows) {
				var roles = res.data.rows
				this.state.loginuser.roles = roles
				console.debug(roles)
				this.forceUpdate()
				await UserStore.saveLoginUser(this.state.loginuser)
			}
		}).catch(err => ModalIndicator.hide())
	}

	// 获取关注的人或俱乐部的动态
	async getPost(page,pageSize) {
		let loginuser = await UserStore.getLoginUser()
		let params = {
			pd: {
				pageNum: page,
				pageSize: pageSize
			},
			clientUserId: loginuser.id
		}

		let myFollowPosts = await callRestListApi(ApiUrl.USER_FOLLOW_POSTS, params)
		let myFollowPostData = myFollowPosts?.rows;
		if (myFollowPostData && myFollowPostData.length > 0) {
			for (let i = 0; i < myFollowPostData.length; i++) {
				if (myFollowPostData.clientUser) {
					myFollowPostData.post = myFollowPostData
					myFollowPostData.post.mediaPath = ApiUrl.POST_IMAGE
				}
				if (myFollowPostData.club) {
					myFollowPostData.clubPost = myFollowPostData
					myFollowPostData.clubPost.mediaPath = ApiUrl.CLUB_POST_IMAGE
				}
			}
		}

		return myFollowPosts;
	}

	async getNotificationMsgDetailData(isTrain, orderId) {
		let apiUrl;
		if (isTrain) {
			apiUrl = ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL;
		} else {
			apiUrl = ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL;
		}
		let result = {};
		await request.post(apiUrl + '/' + orderId, {}).then(res => {
			if (res.status === 200) {
				result = res.data;
			}
		}).catch(err => {
			console.log(err)
		});
		let user = await UserStore.getLoginUser();
		RouteHelper.navigate("ActivityDetailPage", { detailData: result, loginuser: user });

		return result;
	}

	renderItem(item, index) {
		// return <Text>{item.title}</Text>
		const isRecommend = this.state.activeType === 'recommend';

		// avoid the repeat render when switcg between Recommend and Dynamic
		if (isRecommend && (item.post || item.clubPost)) {
			return;
		}
		if (!isRecommend && item.recommend) {
			return;
		}

		if (isRecommend) {
			item.recommend = item
			item.mediaPath = ApiUrl.RECOMMEND_IMAGE
		}
		else {
			if (item.clientUser) {
				item.post = item
				item.mediaPath = ApiUrl.POST_IMAGE
			}
			if (item.club) {
				item.clubPost = item
				item.mediaPath = ApiUrl.CLUB_POST_IMAGE
			}
		}
		
		return <DynamicItem
			onPress={(item, isOpenComment = false) => {
				RouteHelper.navigate("DynamicDetailPage", {
					loginuser: this.state.loginuser,
					item: item,
					type: this.state.activeType,
					refreshHomePage: () => this.refreshPage(),
					isOpenComment: isOpenComment,
				});
			}}
			item={item}
			index={index}
			type={this.state.activeType}
			listData={this.listView.getRows()}
			refreshHomePage={() => this.refreshPage()}
		/>
	}

	refreshPage() {
		this.listView?.refresh()
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		if (page == 1) {
			let res = await callRestListApi(ApiUrl.CAROUSEL_LIST, {onPage: 1,pd:{ pageNum: 1, pageSize: 3 }});
			this.setState(
				{ carouselList: res }
			);
		}
		const pageSize = 3;
		const result = await this.getPost(page,pageSize);
		try {
			if(Math.ceil(result.total / pageSize) >= page){
				startFetch(result.rows || [], pageSize);
			}else{
				startFetch([], pageSize);
			}
		} catch (err) {
			abortFetch();
		}
	};

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
		return (
			<View style={{ flex: 1,backgroundColor: BACK_COLOR,position: 'relative' }}>
				<UINavBar
					leftView={null}
					rightView={
						<View style={{ position: 'relative' }}>
							<TouchableOpacity
								onPress={()=>RouteHelper.navigate("MsgPage")}>
								<Image
									source={images.common.infor_icon}
									style={{ width: scaleSize(22), height: scaleSize(22),marginRight: scaleSize(10),justifyContent: 'space-between' }}
								/>
								{ this.state.unReadMsg && <Image
									source={images.common.point_icon}
									style={{ width: scaleSize(7), height: scaleSize(7), position: 'absolute', right: scaleSize(7), top: scaleSize(-2) }}
								/> 
								}
							</TouchableOpacity>
						</View>
					}
					title="射手动态"
				/>
				<UltimateListView
					paginationFetchingView={() => {
						return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
							<View style={{ height: scaleSize(50) }}></View>
							<ActivityIndicator color={PRIMARY_COLOR} size='large' />
						</View>
					}}
					numColumns={1}
					allLoadedText={"没有更多了"}
					waitingSpinnerText={'加载中...'}
					ref={ref => this.listView = ref}
					onFetch={this.onFetch.bind(this)}
					keyExtractor={(item, index) => `${item.id+""+index}`}
					// item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
					item={(item, index)=>{
						if(item.onPage){
							return this.carouseImg(item)
						}else{
							return this.renderItem(item, index)
						}
					}}
					displayDate
					emptyView={() => {
						return <EmptyView onRefresh={() => {
							this.listView.refresh();
						}} />
					}}
				/>
				<TouchableOpacity 
				style={{position: 'absolute',bottom: scaleSize(30), right: scaleSize(30)}} 
				onPress={()=> {
					if(this.state.loginuser == null){
						UIConfirm.show("访客不可发帖")
						return
					}else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
						UIConfirm.show("认证通过后可以发帖")
						return
					}else{
						DynamicAddTypeSelect.show()
					}
				}}>
					<Image
						source={images.common.publish}
						style={{ width: scaleSize(50), height: scaleSize(50) }}
					/>
				</TouchableOpacity>
				
			</View>
		)
	}
}





