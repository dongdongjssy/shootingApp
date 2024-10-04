import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, DeviceEventEmitter, ScrollView, ActivityIndicator, Dimensions } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images';
import { NavigationBar, ModalIndicator } from 'teaset';
import HeaderCarousel from './HeaderCarousel';
import SubMenu from './SubMenu';
import DynamicItem from './DynamicItem';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView';
import ApiUrl from '../../api/Url.js';
import request from '../../api/Request';
import { UserStore } from '../../store/UserStore';
import JPush from 'jpush-react-native';
import JMessage from 'jmessage-react-plugin';
// import * as WeChat from 'react-native-wechat';
import { Time } from '../../libs/react-native-af-video-player/components';
import { AppStore } from '../../store/AppStore';
import MsgPage from '../MsgPage';
import { ClientStatusEnum } from '../../global/constants';
import { scaleSize } from '../../global/utils';
import UIConfirm from '../../components/UIConfirm';
import * as WeChat from 'react-native-wechat-lib';
import menusList from './components/MenusList';
import { homePageListener, callRestListApi,callRestListApiByAll } from './components/HomePageUtils';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import { renderTimeStamp, renderTimeDuration } from '../../global/DateTimeUtils';

// screen
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


export default class HomePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: undefined,
			launcher_img: [],
			list: [],
			activeType: this.props.activeType ? this.props.activeType : "recommend", //dynamic
			carouselList: [],
			itemDetailsList: [],
			menus: menusList,
			msgList: [],
			inforModalVisible: false,
			unReadMsg: false,
			msgTitle: '',
			msgContent: ''
		};

		WeChat.registerApp('wx7eff16632b6e3a40', "https://zjw.tjjzshw.com/").then((error) => { })

		this.getIMMsg()
		JMessage.addReceiveMessageListener(this.receiveMessageCallback);
	}

	async componentDidMount() {
		let loginuser = await UserStore.getLoginUser()
		this.state.loginuser = loginuser
		this.forceUpdate()

		let _that = this;
		homePageListener(_that);

		this.getMsgData();

		//极光SDK初始化
		JPush.init();
		//连接状态
		this.connectListener = result => {
			console.log("connectListener:" + JSON.stringify(result))
		};
		JPush.addConnectEventListener(this.connectListener);

		JPush.setAlias({ "sequence": 1, "alias": loginuser?.id + "" });
		//通知回调
		this.notificationListener = async (result) => {
			if (result.notificationEventType === "notificationArrived") {
				console.debug("【收到新通知】:" + JSON.stringify(result))
				await AppStore.addMsgList(result)
				await AppStore.setUnReadMsg(true)
				DeviceEventEmitter.emit("notifyArrived")

				// 身份认证审核结果
				if (result.extras?.type === "5") {
					var reviewResult = result.extras?.orderId
					if (reviewResult === "pass") {
						//审核通过
						loginuser.status = ClientStatusEnum.VERIFIED.code
						await UserStore.saveLoginUser(loginuser)
					} else {
						// 审核失败
						loginuser.status = ClientStatusEnum.NOT_VERIFIED.code
						await UserStore.saveLoginUser(loginuser)
					}

					// await this.getMyInfo()
				}

				// 角色变更
				if (result.extras?.type === "6") {
					await this.getMyInfo()
				}

				if (result.extras?.type === "3" && result.extras?.isImportant === "1") {
					this.setState({
						inforModalVisible: true,
						msgTitle: result.title,
						msgContent: result.content
					})
				}

				if(result.extras?.type === "9"){
					DeviceEventEmitter.emit("orderEmit")
				}

				//系统消息
				const msgList = await AppStore.getMsgList()
				this.setState({
					msgList: [...msgList,result]
				})
				this.setState({ unReadMsg: true })
		

			}
			///点击手机通知栏通知直接进入消息类型对应的页面
			if (result.notificationEventType === "notificationOpened") {
				console.debug("【新通知被点击】:" + result)
				if (result.extras?.type === "1") {
					if (result.extras?.subType === "1") {
						RouteHelper.navigate(this.state.menus[0].routePath, this.state.menus[0].params);
					} else if (result.extras?.subType === "2") {
						//alert("培训详情")
						this.getNotificationMsgDetailData(true, result.extras?.orderId);
					}
				} else if (result.extras?.type === "2") {
					if (result.extras?.subType === "1") {
						RouteHelper.navigate(this.state.menus[1].routePath, this.state.menus[1].params);
					} else if (result.extras?.subType === "2") {
						//alert("赛事详情")
						this.getNotificationMsgDetailData(false, result.extras?.orderId);
					}
				} else if (result.extras?.type === "3") {
					//var user = await UserStore.getLoginUser();
					//RouteHelper.navigate("SysytemNotificationDetailPage",{itemData:item,loginuser: user});
					RouteHelper.navigate("NotificationsPage")
				} else if (result.extras?.type === "5") {
					//alert("用户信息")
					var user = await UserStore.getLoginUser()
					RouteHelper.navigate("UserCenterPage", { loginuser: user, user: user })
				}  else if(item.extras.type == "7"){
					RouteHelper.navigate("MyActivityPage", {
						type: "training",
						loginuser: user
					});
				} else if(item.extras.type == "8"){
					RouteHelper.navigate("MyActivityPage", {
						type: "contest",
						loginuser: user
					});
				} else if(item.extras.type == '9'){
					RouteHelper.navigate("OrderPage",{status:0})
				}else {
					RouteHelper.navigate("NotificationsPage")
				}
			}
		};
		JPush.addNotificationListener(this.notificationListener);
		//本地通知回调
		this.localNotificationListener = result => {
			console.log("localNotificationListener:" + JSON.stringify(result))
		};
		JPush.addLocalNotificationListener(this.localNotificationListener);
		//自定义消息回调
		this.customMessageListener = result => {
			console.log("customMessageListener:" + JSON.stringify(result))
		};
		JPush.addCustomMessagegListener(this.customMessageListener);
		//tag alias事件回调
		this.tagAliasListener = result => {
			// console.log("tagAliasListener:" + JSON.stringify(result))
		};
		JPush.addTagAliasListener(this.tagAliasListener);
		//手机号码事件回调
		this.mobileNumberListener = result => {
			console.log("mobileNumberListener:" + JSON.stringify(result))
		};
		JPush.addMobileNumberListener(this.mobileNumberListener);

		// get register id for this device and save it to global.
		JPush.getRegistrationID(result => {
			console.debug("【极光】该设备的推送编号：" + result.registerID)
			global.JIGUANG_REG_ID = result.registerID;
		});

		
	}

	receiveMessageCallback = async message => {
		if (message.target && message.target.type === 'group') {
			if (message.from && message.from.username && message.from.username == '系统消息') return
			else this.setState({ unReadMsg: true })
		}
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

	//获取消息列表
	getMsgData = async () => {
		const messageList = await AppStore.getMsgList()
		this.setState({
			msgList: messageList
		})
	};

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

	async getRecommend(page, pageSize) {
		let result = await callRestListApiByAll(ApiUrl.RECOMMEND_LIST, {
			pd: {
				pageNum: page,
				pageSize: pageSize
			},
		})
		// this.setState({ itemDetailsList: result })
		return result;
	}

	// 获取关注的人或俱乐部的动态
	async getPost(page, pageSize) {
		let loginuser = await UserStore.getLoginUser()
		let params = {
			pd: {
				pageNum: page,
				pageSize: pageSize
			},
			clientUserId: loginuser?.id
		}
		// console.log(ApiUrl.USER_FOLLOW_POSTS);
		let myFollowPosts = await callRestListApiByAll(ApiUrl.USER_FOLLOW_POSTS, params)
		myFollowPosts = myFollowPosts.data.rows;
		if (myFollowPosts && myFollowPosts.length > 0) {
			for (let i = 0; i < myFollowPosts.length; i++) {
				if (myFollowPosts[i].clientUser) {
					myFollowPosts[i].post = myFollowPosts[i]
					myFollowPosts[i].post.mediaPath = ApiUrl.POST_IMAGE
				}

				if (myFollowPosts[i].club) {
					myFollowPosts[i].clubPost = myFollowPosts[i]
					myFollowPosts[i].clubPost.mediaPath = ApiUrl.CLUB_POST_IMAGE
				}
			}
		}

		// console.debug("获取", myFollowPosts.length, "条动态")
		// this.setState({ itemDetailsList: myFollowPosts })
		return myFollowPosts;
	}

	async getDataFromRestApi(page, pageSize) {
		// ModalIndicator.show("获取数据")

		if (this.state.activeType === "recommend") return await this.getRecommend(page, pageSize)
		if (this.state.activeType === "dynamic") return await this.getPost(page, pageSize)

		// ModalIndicator.hide()
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
				//alert(result.course.name);
			}
		}).catch(err => {
			// ModalIndicator.hide()
			console.log(err)
		});
		let user = await UserStore.getLoginUser();
		RouteHelper.navigate("ActivityDetailPage", { detailData: result, loginuser: user });

		return result;
	}

	onSearch = async () => {
		let user = await UserStore.getLoginUser()
		let userStatus = user.status
		if (userStatus !== ClientStatusEnum.VERIFIED.code) {
			UIConfirm.show("认证通过后可以使用搜索功能")
			return
		}

		RouteHelper.navigate("SearchPage");
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

	async handleTabOnPress(tabName) {
		let user = await UserStore.getLoginUser()
		let userStatus = user.status
		let msg = undefined

		// console.debug(userStatus)

		if (tabName === "dynamic" && userStatus === ClientStatusEnum.IN_REVIEW.code)
			msg = "您的身份认证正在审核中，暂时无法查看动态"
		if (tabName === "dynamic" && userStatus === ClientStatusEnum.NOT_VERIFIED.code)
			msg = "您尚未完成认证，暂时无法查看动态"
		if (tabName === "dynamic" && userStatus === ClientStatusEnum.RENEWAL_USER.code)
			msg = "认证已过期，请及时续费"

		if (msg !== undefined) {
			UIConfirm.show(msg)
			return
		} else {
			// this.setState(
			// 	{ activeType: tabName, itemDetailsList: [] },
			// 	() => this.listView && this.listView.refresh()
			// )
		}
		this.setState({
			activeType: tabName
		}, () => {
			this.listView.refresh();
		})
		// this.forceUpdate();
	}

	refreshPage() {
		this.listView?.refresh()
	}

	renderTabs() {
		var tabs = [
			{ 'tabName': 'recommend', 'tabText': '官方推荐' },
			{ 'tabName': 'dynamic', 'tabText': '动态' }
		];
		return (
			<View style={{
				flexDirection: "row",
				height: scaleSize(40),
				backgroundColor: "#efefef",
			}}>
				{
					tabs.map((tab, index) => {
						return (
							<Tab
								key={index}
								tabText={tab.tabText}
								isActiveTab={this.state.activeType == tab.tabName}
								onPress={() => this.handleTabOnPress(tab.tabName)}
							/>
						)
					})
				}
			</View>
		)
	}

	renderInfor() {
		return (
			<TouchableOpacity
				onPress={() => {
					RouteHelper.navigate("NotificationsPage")
					this.setState({unReadMsg: false})
				}}
				style={{
					backgroundColor: BACK_COLOR
				}}>
				<View style={styles.infoView}>
					<View style={{ width: scaleSize(310) }}>
						
						<View style={{ display: 'flex', flexDirection: "row",alignItems: 'center' }}>
							<Image
								source={images.common.honor}
								style={{ width: scaleSize(43), height: scaleSize(43), marginRight: scaleSize(10) }}
							/>
							<View>
								{
									this.state.msgList.length > 0 ? <>{
										this.state.msgList?.slice(0,2).map((item, index) => {
											return (
												<View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
													<View style={styles.blackPoint}></View>
													<Text numberOfLines={1} style={styles.textInfo}>{item?.content}</Text>
												</View>
											)
										})
									}</> : <Text numberOfLines={1} style={styles.textInfo}>暂无消息</Text>
								}
							</View>
						</View>
					</View>
					<View style={{ flexDirection: "row", alignItems: 'center', }}>
						{
							this.state.unReadMsg  && <Image
								source={images.common.redPoint}
								style={{ width: scaleSize(7), height: scaleSize(7), marginRight: scaleSize(7) }}
							/>
						}
						<Image
							source={images.common.arrow}
							style={{ width: scaleSize(8), height: scaleSize(15) }}
						/>
					</View>
				</View>
			</TouchableOpacity>
		)
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		if (page == 1) {
			let res = await callRestListApi(ApiUrl.CAROUSEL_LIST, { onPage: 1, pd: { pageNum: 1, pageSize: 3 } });
			this.setState(
				{ carouselList: res.rows }
			);
		}
		var pageSize = 5;
		var rows = await this.getDataFromRestApi(page, pageSize);
		try {
			if(Math.ceil(rows.data.total / pageSize) >= page){
				startFetch(rows?.data?.rows || [], pageSize);
			}else{
				startFetch([], pageSize);
			}
			// startFetch(this.state.itemDetailsList, pageSize);
		} catch (err) {
			abortFetch();
		}
	};

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: BACK_COLOR }}>
				{/* <Text>launcher...</Text> */}
				<NavigationBar
					style={{ backgroundColor: PRIMARY_COLOR, position: 'relative', paddingBottom: scaleSize(30) }}
					title={
						<>
							<TouchableOpacity
								onPress={this.onSearch}
								style={styles.search_bar}>
								<Image
									source={images.common.search}
									style={{ width: scaleSize(15), height: scaleSize(15), marginRight: scaleSize(6) }}
								/>
								<Text style={styles.search_text}>赛事、培训、俱乐部、好友等	</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => RouteHelper.navigate("MsgPage")}>
								<Image
									source={images.common.infor_icon}
									style={{ width: scaleSize(22), height: scaleSize(22) }}
								/>
							</TouchableOpacity>
							{ this.state.unReadMsg ?
								<Image
									source={images.common.point_icon}
									style={{ width: scaleSize(7), height: scaleSize(7), position: 'absolute', right: scaleSize(7), top: scaleSize(7) }}
								/> : null
							}
						</>
					}
				/>

				<UltimateListView
					header={() => {
						var rs = [];
						rs.push(<HeaderCarousel carouselList={this.state.carouselList} />)
						rs.push(<SubMenu loginuser={this.state.loginuser} />)
						rs.push(this.renderInfor())
						// rs.push(this.renderTabs())
						return rs;
					}}
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
					keyExtractor={(item, index) => `${item.id + "" + index}`}
					item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
					displayDate
					emptyView={() => {
						return <EmptyView onRefresh={() => {
							this.listView.refresh();
						}} />
					}}
				/>

				{/* 重大消息提示 */}
				{
					this.state.inforModalVisible &&
					<View style={{ backgroundColor: 'rgba(0,0,0,0.3)', position: 'absolute', width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
						<View style={styles.inforModal}>
							<Image
								source={images.common.inforModal}
								style={{ width: scaleSize(300), height: scaleSize(140), marginBottom: scaleSize(0) }}
							/>
							<View style={styles.inforContent}>
								<Text style={{ fontSize: scaleSize(20), marginBottom: scaleSize(10), marginTop: scaleSize(-15) }}>{this.state.msgTitle}</Text>
								<ScrollView style={{ height: scaleSize(100) }}>
									<Text style={{ lineHeight: scaleSize(25) }}>{this.state.msgContent}</Text>
								</ScrollView>
								<TouchableOpacity style={styles.infoBtn} onPress={() => this.setState({ inforModalVisible: false })}>
									<Text style={{ color: '#FFFFFF', lineHeight: scaleSize(40), }}>我已知晓</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				}
			</View>
		)
	}
}

var styles = {
	search_bar: {
		backgroundColor: "#fff",
		height: scaleSize(30),
		width: scaleSize(325),
		borderRadius: scaleSize(4),
		flexDirection: 'row',
		alignItems: "center",
		paddingHorizontal: scaleSize(15),
		marginRight: scaleSize(10),
	},
	search_text: {
		fontSize: 14,
		color: "#646464",
		fontWeight: '400',
	},
	textInfo: {
		width: scaleSize(200),
		lineHeight: scaleSize(30),
	},
	timeInfo: {
		lineHeight: scaleSize(30),
		color: '#999999',
		marginRight: scaleSize(10)
	},
	infoView: {
		backgroundColor: '#FFFFFF',
		margin: scaleSize(10),
		flexDirection: "row",
		alignItems: 'center',
		alignContent: 'space-between',
		padding: scaleSize(8),
		borderRadius: scaleSize(4)
	},
	inforModal: {
		width: scaleSize(300),
		height: scaleSize(300),
		position: 'absolute',
		top: scaleSize(150),
		left: '50%',
		marginLeft: scaleSize(-150),
		borderRadius: scaleSize(5)
	},
	inforContent: {
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
		padding: scaleSize(15),
		marginTop: scaleSize(-5)
	},
	infoBtn: {
		width: scaleSize(270),
		height: scaleSize(40),
		alignItems: 'center',
		backgroundColor: '#e50014',
		borderRadius: scaleSize(5),
		fontWeight: 'bold',
		marginTop: scaleSize(20)
	},
	blackPoint: {
		width: scaleSize(2),
		height: scaleSize(2),
		backgroundColor: '#000000',
		borderRadius: scaleSize(2),
		marginRight: scaleSize(5)
	}
}

function Tab(props) {
	return (
		<TouchableOpacity
			onPress={props.onPress}
			style={{
				flex: 1,
				backgroundColor: props.isActiveTab ? "#FFFFFF" : "#EFEFEF",
				alignItems: 'center', justifyContent: 'center',
				borderTopLeftRadius: props.isActiveTab ? 15 : 0,
				borderTopRightRadius: props.isActiveTab ? 15 : 0
			}}
		>
			<Text style={[{ fontSize: 16, fontWeight: "400", color: props.isActiveTab ? "#D43D3E" : "rgba(0,0,0,0.80)" }]}>
				{props.tabText}
			</Text>
			{props.isActiveTab ?
				<Image source={images.home.tab_decor} style={{ width: 22, height: 9 }} /> : null
			}
		</TouchableOpacity>
	)
}




