import React, { Component, Fragment } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ImageBackground, DeviceEventEmitter, ScrollView, Dimensions } from 'react-native'
import HTMLView from 'react-native-htmlview';
import MediaShow from '../../components/MediaShow.js';
import { images } from '../../res/images';
import { RouteHelper } from 'react-navigation-easy-helper'
import UINavBar from '../../components/UINavBar';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView';
import DynamicItem from '../HomePage/DynamicItem';
import ApiUrl from '../../api/Url.js';
import CommonActivityListPage from '../HomePage/SubMenuPage/CommonActivityListPage.js';
import CommonActivityItem from '../HomePage/SubMenuPage/CommonActivityItem';
import request from '../../api/Request';
import { UserStore } from '../../store/UserStore';
import { Toast, ModalIndicator } from 'teaset'
import UIConfirm from '../../components/UIConfirm'
import { Overlay } from 'teaset';
import { AppStore } from '../../store/AppStore.js';
import { scaleSize } from '../../global/utils.js';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';

// screen
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


const htmlViewstyles = StyleSheet.create({
	p: {
		fontSize: 16,
		lineHeight: 25,
		color: "#111",
		fontWeight: "300",
		padding: 20,
		fontFamily: 'PingFang SC'
	},
})
export default class ClubDetailPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: this.props.loginuser,
			item: props.item,
			club: props.item.club,
			tabActiveIndex: 0,
			activeTabTextStyle: {
				fontSize: 18, fontWeight: "500", color: PRIMARY_COLOR,
				fontFamily: "PingFang SC",
			},
			jiaoguanList: [],
			judgeList: [],
			isShowAllJiaoguan: false,
			joinGroupStatus: undefined,
			content: "",
			fullContent: "",
			fixedTabbar: false,
			clubId: props.item.club.id,
			activeType: 'post',
			imagePath: ApiUrl.CLUB_ACTIVITY_IMAGE,
			fansCount: 0,
			clubCity: "",
			inforVisible: false,
			inforData: {},
			isheader2: true,//判断点击是在任教官还是在任裁判
		}
	}

	async componentDidMount() {
		// ModalIndicator.show("获取数据")

		var areaList = await AppStore.getAreaList()
		for (var i = 0; i < areaList.length; i++) {
			var findArea = areaList[i].items?.find(i => i.id === this.state.item.club.areaId)
			if (findArea) {
				this.state.clubCity = findArea.city_name
				this.forceUpdate()
				break
			}
		}

		await this.getFollowStatus()
		await this.getJoinGroupStatus()
		await this.getFansList()

		DeviceEventEmitter.addListener("followClubUpdated", async () => {
			console.debug("【监听回调，俱乐部页】关注俱乐部更新")
			await this.getFansList()
		})

		ModalIndicator.hide()
	}

	getJoinGroupStatus = async () => {
		await request.post(ApiUrl.JOIN_CLUB_APPLICATION_LIST, {
			clientUserId: this.props.loginuser.id,
			clubId: this.state.club.id,
		}).then(res => {
			if (res.data.total === 1) {
				this.setState({ joinGroupStatus: res.data.rows[0].status })
				this.setState({ joinId: res.data.rows[0].id })
			} else {
				this.setState({ joinGroupStatus: undefined })
			}
		}).catch(err => {
			ModalIndicator.hide()
			console.debug(err)
		})
	}

	getFollowStatus = async () => {
		await request.post(ApiUrl.USER_FOLLOW_LIST, {
			clientUserId: this.props.loginuser.id,
			followId: this.state.club.id,
			followType: "club"
		}).then(res => {
			if (res.data.total === 1) {
				this.setState({ isFollow: true })
				this.setState({ followId: res.data.rows[0].id })
			} else {
				this.setState({ isFollow: false })
			}
		}).catch(err => {
			ModalIndicator.hide()
			console.debug(err)
		})
	}

	getFansList = async () => {
		await request.post(ApiUrl.USER_FOLLOW_LIST, {
			followId: this.state.club.id,
			followType: "club"
		}).then(res => {
			if (res.data.total) {
				this.state.fansCount = res.data.total
				this.forceUpdate()
			}
		}).catch(err => {
			ModalIndicator.hide()
			console.debug(err)
		})
	}

	applyJoinGroup = async () => {
		await request.post(ApiUrl.JOIN_CLUB_APPLICATION_ADD, {
			clientUserId: this.props.loginuser.id,
			clubId: this.state.club.id,
			status: 0
		}).then(res => {
			// console.debug(res)
			if (res.data.code === 0) {
				this.setState({ joinGroupStatus: 0 })
				Toast.message("申请已提交，请等待审核")
			} else {
				this.setState({ joinGroupStatus: undefined })
				Toast.message("申请提交失败，请重试")
			}
		}).catch(err => console.debug(err))
	}

	followClub = async () => {
		await request.post(ApiUrl.USER_FOLLOW_ADD, {
			clientUserId: this.state.loginuser.id,
			followId: this.state.club.id,
			followType: "club"
		}).then(async (res) => {
			if (res.data.code === 0) {
				if (this.state.tabActiveIndex == 1 || this.state.tabActiveIndex == 2) {
					this.listView.refresh();
				}
				await this.getFollowStatus()
				this.setState({ isFollow: true }, () => {
					Toast.message("关注成功")
					this.state.fansCount += 1
					this.forceUpdate()
					// if (this.state.tabActiveIndex === 1) this.refs.activity_tab.refreshContent(true)
					// if (this.state.tabActiveIndex === 2) this.refs.image_tab.refreshContent(true)
					DeviceEventEmitter.emit("followClubUpdated", { id: this.state.club.id, isFollow: true })
				})
			}
		}).catch(err => Toast.message("关注失败，请重试"))
	}

	unfollowClub = async () => {
		await request.post(ApiUrl.USER_FOLLOW_DEL + this.state.followId).then(res => {
			if (res.data.code === 0) {
				this.setState({ isFollow: false }, () => {
					Toast.message("取关成功")
					this.state.fansCount -= 1
					this.forceUpdate()
					// if (this.state.tabActiveIndex === 1) this.refs.activity_tab.refreshContent(false)
					// if (this.state.tabActiveIndex === 2) this.refs.image_tab.refreshContent(false)
					DeviceEventEmitter.emit("followClubUpdated", { id: this.state.club.id, isFollow: false })
				})
			}

		}).catch(err => Toast.message("取注失败，请重试"))
	}

	onPressTab(index) {
		this.setState({
			tabActiveIndex: index,
		}, () => {
			this.listView && this.listView.refresh();
		})
	}

	renderSmallView(label, value) {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
				<Text style={{ color: PRIMARY_COLOR, fontSize: 15, fontWeight: "600" }}>{value}</Text>
				<Text style={{ fontWeight: '400', color: "rgba(0,0,0,0.6)", fontSize: 12, marginTop: scaleSize(6) }}>{label}</Text>
			</View>
		)
	}

	renderNode = (node, index, sibling, parent, defaultRenderer) => {
		// console.debug(node)
		// if (node.name == "div") {
		this.extractContent(node)
		// }

		return null
	}

	extractContent = (node) => {
		if (node.children?.length > 0) {
			node.children.map(nd => this.extractContent(nd))
		} else {
			if (this.state.content.length < 40) {
				this.state.content += (node.data ? node.data : "")
			}

			this.state.fullContent += (node.data ? node.data : "")

			if (this.state.content.length > 40) {
				this.state.content = this.state.content.substr(0, 40)
				this.state.content += "..."
			}

			this.forceUpdate()
		}
	}
	renderHeader() {
		let club = this.state.club;
		return (
			<Fragment>
				{<UINavBar
					style={{
						backgroundColor: "rgba(0,0,0,0)",
						position: "absolute",
						zIndex: 999
					}}
					backIconStyle={{ tintColor: "#fff" }}
					title={""} />
				}
				<ImageBackground
					style={{ height: scaleSize(237) }}
					source={{ uri: this.state.item.bgimg }}
				>
					<View style={{ backgroundColor: "rgba(0,0,0,0.3)", position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>

					</View>
					<View style={{ paddingTop: scaleSize(90), paddingHorizontal: scaleSize(16) }}>
						<View style={{ flexDirection: 'row' }}>
							<Image
								source={{ uri: this.state.item.avatar }}
								style={{ width: scaleSize(70), height: scaleSize(70), borderRadius: scaleSize(70 / 2) }}
							/>
							<View style={{ width: scaleSize(26) }}></View>
							<TouchableOpacity
								onPress={() => {
									if (!this.state.isFollow) this.followClub()
									else this.unfollowClub()
								}}
								style={{ ...styles.btn, backgroundColor: this.state.isFollow ? "rgba(212,61,62,0.3)" : '#D43D3E' }}>
								{!this.state.isFollow && <Image
									resizeMode="contain"
									style={{ width: scaleSize(14), height: scaleSize(14) }}
									source={images.common.plus_white}
								/>}
								<Text style={styles.btn_text}>{this.state.isFollow ? "已关注" : '关注'}</Text>
							</TouchableOpacity>
							<View style={{ width: scaleSize(24) }}></View>
							<TouchableOpacity style={{ ...styles.btn, backgroundColor: this.state.joinGroupStatus != undefined ? "rgba(212,61,62,0.3)" : '#D43D3E' }}
								onPress={() => {
									if (this.state.joinGroupStatus === undefined) this.applyJoinGroup()
								}}>
								<Image
									resizeMode="contain"
									style={{ width: scaleSize(18), height: scaleSize(18) }}
									source={images.common.group}
								/>
								<Text style={styles.btn_text}>
									{
										this.state.joinGroupStatus === undefined ? "申请入群" : (
											this.state.joinGroupStatus === 0 ? "等待审核" : "已加入群"
										)
									}
								</Text>
							</TouchableOpacity>
						</View>
						<View style={{ marginTop: scaleSize(5) }}>
							<Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 18 }}>{club.title}</Text>
							<View style={{ height: scaleSize(5) }}></View>
							<TouchableOpacity onPress={() => {
								let overlayView = (
									<Overlay.PopView style={{ alignItems: 'center', justifyContent: 'center' }} modal={false}>
										<View style={{ backgroundColor: '#fff', width: '100%', minHeight: scaleSize(350), width: scaleSize(270), borderRadius: scaleSize(7), }}>
											<ScrollView style={{ height: scaleSize(300) }}>
												<HTMLView value={club.profile || ""} stylesheet={htmlViewstyles} />
											</ScrollView>
											<View style={{ height: scaleSize(50), borderTopWidth: 1, borderColor: "#DDDDDD", flexDirection: "row" }}>
												<TouchableOpacity onPress={() => Overlay.hide(this.overlay_key)} style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
													<Text style={{ color: "#D43D3E", fontSize: 18 }}>确定</Text>
												</TouchableOpacity>
											</View>
										</View>
									</Overlay.PopView>
								);
								this.overlay_key = Overlay.show(overlayView);
							}}>
								<HTMLView value={club.profile || ""} renderNode={this.renderNode} />
								<Text style={{ fontSize: 12, color: "#f2f2f2", fontWeight: "300" }}>{this.state.content}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ImageBackground>
				<View style={{ height: scaleSize(60), backgroundColor: "#F2F6F9", flexDirection: 'row' }}>
					{this.renderSmallView('教官', this.state.jiaoguanList?.length)}
					{this.renderSmallView('学员', club.studentCount ? club.studentCount : 0)}
					{this.renderSmallView('粉丝', this.state.fansCount)}
					{this.renderSmallView('地区', this.state.clubCity)}
				</View>
				{this.renderTabbar()}
			</Fragment>
		)
	}
	renderTabbar() {
		return <View style={styles.tabbar}>
			<TouchableOpacity
				onPress={this.onPressTab.bind(this, 0)}
				style={[styles.tabItem, this.state.tabActiveIndex == 0 ? { borderBottomWidth: scaleSize(2), borderColor: PRIMARY_COLOR } : null]}
			>
				<Text style={[styles.tabItemText, this.state.tabActiveIndex == 0 ? this.state.activeTabTextStyle : null]}>主页</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={this.onPressTab.bind(this, 1)}
				style={[styles.tabItem, this.state.tabActiveIndex == 1 ? { borderBottomWidth: scaleSize(2), borderColor: PRIMARY_COLOR } : null]}>
				<Text style={[styles.tabItemText, this.state.tabActiveIndex == 1 ? this.state.activeTabTextStyle : null]}>活动</Text>
			</TouchableOpacity>
		</View>
	}
	//在任教官
	renderHeaderInstructor() {
		return (
			<>
			{
			this.state.jiaoguanList.length > 0 && <View style={styles.jiaoguan_box}>
				<View style={{ flexDirection: 'row', height: scaleSize(20) }}>
					<View style={{ width: scaleSize(4), height: scaleSize(20), backgroundColor: PRIMARY_COLOR, marginRight: scaleSize(6) }}></View>
					<Text style={{ color: PRIMARY_COLOR, fontWeight: "500", color: 'rgba(0,0,0,0.8)' }}>在任教官</Text>
				</View>
				<ScrollView style={{ flexDirection: 'row' }} horizontal={true}>
					{
						this.state.jiaoguanList.map((coach, index) => {
							return <TouchableOpacity
								style={{
									alignItems: 'center', width: scaleSize((375 - 40) / 3.4), marginVertical: scaleSize(10)
								}} 
								key={index}
								onPress={()=>{
									this.setState({
										inforVisible: true,
										inforData: coach,
										isheader2: true
									})
								}}>
								<Image
									style={{ width: scaleSize(70), height: scaleSize(70), borderRadius: scaleSize(70 / 2) }}
									source={{ uri: ApiUrl.COACH_IMAGE + coach.avatar }}
								/>
								<Text style={{ color: "#000", fontSize: 16, marginTop: scaleSize(10),width: scaleSize(100),textAlign: 'center' }}>{coach.nickname}</Text>
								<Text style={styles.zcStyle} numberOfLines={1}>{coach.remark}</Text>
								<Text style={styles.zcStyle} numberOfLines={1}>{coach.duty}</Text>
							</TouchableOpacity>
						})
					}
				</ScrollView>
			</View>
			}
			</>
			
		)
	}

	//在任裁判
	renderHeaderReferee() {
		return (
			<>
			{
			this.state.judgeList.length > 0 && <View style={styles.jiaoguan_box}>
			<View style={{ flexDirection: 'row', height: scaleSize(20) }}>
				<View style={{ width: scaleSize(4), height: scaleSize(20), backgroundColor: PRIMARY_COLOR, marginRight: scaleSize(6) }}></View>
				<Text style={{ color: PRIMARY_COLOR, fontWeight: "500", color: 'rgba(0,0,0,0.8)' }}>在任裁判</Text>
			</View>
			<ScrollView style={{ flexDirection: 'row' }} horizontal={true}>
				{
					this.state.judgeList.map((coach, index) => {
						return <TouchableOpacity
							style={{
								alignItems: 'center', width: scaleSize((375 - 40) / 3.4), marginVertical: scaleSize(10)
							}} 
							key={index}
							onPress={()=>{
								this.setState({
									inforVisible: true,
									inforData: coach,
									isheader2: false
								})
							}}>
							<Image
								style={{ width: scaleSize(70), height: scaleSize(70), borderRadius: scaleSize(70 / 2) }}
								source={{ uri: ApiUrl.JUDGE_IMAGE + coach.avatar }}
							/>
							<Text style={{ color: "#000", fontSize: 16, marginTop: scaleSize(10),width: scaleSize(100),textAlign: 'center' }} numberOfLines={1}>{coach.nickname}</Text>
							<Text style={styles.zcStyle} numberOfLines={1}>{coach.remark}</Text>
							<Text style={styles.zcStyle} numberOfLines={1}>{coach.duty}</Text>
						</TouchableOpacity>
					})
				}
			</ScrollView>
			</View>
			}
			</>
			
		)
	}

	//获取教官列表
	async getCoachList() {
		let restApiUrl = ApiUrl.CLUB_COACH_BY_CLUB_ID + this.state.clubId;
		await request.post(restApiUrl, {}).then(res => {
			if (res.status === ResponseCodeEnum.STATUS_CODE) {
				this.setState({ jiaoguanList: res.data });
			}
		}).catch(err => console.log(err));
	}

	//获取裁判列表
	async getRefereeList() {
		console.log(this.state.clubId)
		let restApiUrl = ApiUrl.CLUB_JUDGE_BY_CLUB_ID + this.state.clubId;
		await request.post(restApiUrl, {}).then(res => {
			if (res.status === ResponseCodeEnum.STATUS_CODE) {
				this.setState({ judgeList: res.data });
			}
		}).catch(err => console.log(err));
	}


	async getClubPostList(page, pageSize) {

		var clubPostList = [];

		let restApiUrl = ApiUrl.CLUB_POST_BY_CLUB_ID + this.state.clubId;

		await request.post(restApiUrl, {
			pd: {
				pageNum: page,
				pageSize: pageSize
			},
		}).then(res => {
			if (res.status === 200) {
				clubPostList = res.data.rows;
			}
		}).catch(err => console.log(err));

		return clubPostList;
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var club = this.state.club;
		if (page == 1) {
			await this.getCoachList();
			await this.getRefereeList();
		}

		var pageSize = 20
		var rows = [];
		if (this.state.tabActiveIndex === 0) {
			rows = await this.getClubPostList(page, pageSize);
		} else if (this.state.tabActiveIndex == 1) {
			if (this.state.isFollow) {
				var res = await request.post(ApiUrl.CLUB_ACTIVITY_BY_CLUB_ID + club.id, {
					pd: {
						pageNum: page,
						pageSize: pageSize
					},
				})
				if (res.status === 200) {
					rows = res.data.rows;
				}
			}
		} else {
			if (this.state.isFollow) {
				// rows = await this.getClubImageList();
			}
		}
		try {
			startFetch(rows, pageSize);
		} catch (err) {
			abortFetch();
		}
	}
	async getClubImageList() {
		var result = [];
		var res = await request.post(ApiUrl.CLUB_IMAGE_BY_CLUB_ID + this.state.clubId, {})
		if (res.status === 200) {
			result = res.data;
		}
		// console.log("getClubImageList",res.status);

		return result;
	}

	renderDynamicItem(item, index) {
		if (!item.clubPost) return null;
		item.clubPost.mediaPath = ApiUrl.CLUB_POST_IMAGE;
		item.clubPost.commentCount = item.commentDetailsList.length;

		// DynamicDetailPage
		return (
			<DynamicItem
				onPress={(itemDetails) => {
					itemDetails.clubPost.clientUser = {}
					itemDetails.clubPost.clientUser.avatar = this.state.club.avatar
					itemDetails.clubPost.clientUser.nickname = this.state.club.title

					RouteHelper.navigate("DynamicDetailPage", {
						loginuser: this.props.loginuser,
						item: itemDetails,
						type: this.state.activeType,
						refreshHomePage: () => this.listView.refresh(),
					});
				}}
				item={item}
				index={index}
				activeType={this.state.activeType}
				listData={this.listView.getRows()}
				isShowClubTitle={false}
				type={'post'}
			/>
		)
	}
	renderImgItem(image, index) {
		let item = {};
		item.isSmallImage = true;
		item.mediaPath = ApiUrl.CLUB_IMAGE;
		item.image1 = image;
		if (this.state.isFollow) {
			return (
				<TouchableOpacity style={{ alignItems: 'center', alignContent: 'center', marginLeft: scaleSize(15) }}>
					{<MediaShow item={item} imageStyle={{ width: scaleSize(100), height: scaleSize(100) }} />}

				</TouchableOpacity>
			)
		}
	}
	extractDate(dateTime) {
		return dateTime ? dateTime.substring(0, 10) : '';
	}
	renderActivityItem(item, index) {
		// in case this method repeat
		// console.log("activityitem", item);
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
		}

		if (this.state.tabActiveIndex == 1 && item.area) {
			item.pageText = "俱乐部活动"
			item.fkTableId = 3
			return <CommonActivityItem item={item} isShowClubTitle={false} index={index}/>
		} else {
			return null;
		}
	}
	render() {
		let club = this.state.club;
		/*console.log("ApiUrl.CLUB_ACTIVITY_BY_CLUB_ID + club.id",ApiUrl.CLUB_ACTIVITY_BY_CLUB_ID + club.id)
		return <CommonActivityListPage
	    isFollow={this.state.isFollow}
	    pageText='活动'
	    fkTableId='3'
	    restApiUrl={ApiUrl.CLUB_ACTIVITY_BY_CLUB_ID + club.id}
	    imagePath={ApiUrl.CLUB_ACTIVITY_IMAGE}
	    carouselOnPage='0'
	    ref={"activity_tab"}
	  />*/

		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
			{
				this.state.fixedTabbar
					? <UINavBar
						title={club.title} />
					: null
			}
			{this.state.fixedTabbar ? this.renderTabbar() : null}
			<UltimateListView
				style={{ flex: 1 }}
				header={() => {
					const header1 = this.renderHeader();
					const header2 = this.renderHeaderInstructor();
					const header3 = this.renderHeaderReferee();
					return <Fragment>
						{header1}
						{this.state.tabActiveIndex === 0 ? header2 : null}
						{this.state.tabActiveIndex === 0 ? header3 : null}
					</Fragment>
				}}
				onScroll={(e) => {
					var scroll_y = e.nativeEvent.contentOffset.y;
					var hh = 256;
					if (scaleSize(scroll_y) >= scaleSize(hh) + scaleSize(20)) {
						this.state.fixedTabbar = true;
						// console.log("e",e.nativeEvent.contentOffset.y);
						// console.warn("fixed",React.forwardRef(this.refs.navbar))
						// this.listView.updateRows();
						this.setState({
							fixedTabbar: true,
						})
					} else {
						if (this.state.fixedTabbar == true) {
							this.setState({
								fixedTabbar: false,
							})
						}
					}
				}}
				allLoadedText={"没有更多了"}
				waitingSpinnerText={'加载中...'}
				ref={ref => this.listView = ref}
				onFetch={this.onFetch.bind(this)}
				keyExtractor={(item, index) => `${index} -`}
				item={(item, index) => {
					if (this.state.tabActiveIndex == 0) {
						return this.renderDynamicItem(item, index);
					} else if (this.state.tabActiveIndex == 1) {
						return this.renderActivityItem(item, index);
					} else {
						return this.renderImgItem(item, index);
					}
					// this.renderItem.bind(this)
				}} // this takes three params (item, index, separator)
				displayDate
				numColumns={this.state.tabActiveIndex == 2 ? 3 : 1}
				emptyView={() => {
					// if (this.state.tabActiveIndex == 1 || this.state.tabActiveIndex == 2) {
					// 	if (!this.state.isFollow) {
					// 		return <Text style={{ color: "#D43D3E", fontSize: 16, textAlign: 'center', textAlignVertical: 'center', marginTop: scaleSize(100) }}>
					// 			{"关注后可查看，快去关注吧"}
					// 		</Text>
					// 	}
					// }
					return <EmptyView />
				}}
			/>
			{
				this.state.inforVisible && <View style={{backgroundColor: 'rgba(0,0,0,0.3)',position: 'absolute',width: SCREEN_WIDTH,height: SCREEN_HEIGHT+scaleSize(20)}}>
					<View style={styles.inforModal}>
						<View style={styles.inforContent}>
							<Image
								source={{uri: this.state.isheader2 ? ApiUrl.COACH_IMAGE + this.state.inforData?.avatar : ApiUrl.JUDGE_IMAGE + this.state.inforData?.avatar}}
								style={{ width: scaleSize(70), height: scaleSize(70),marginBottom: scaleSize(0),borderRadius: scaleSize(70/2) }}
							/>
							<Text style={{fontSize: scaleSize(20),marginBottom: scaleSize(10)}}>{this.state.inforData?.nickname}</Text>
							<Text style={{fontSize: scaleSize(16),marginBottom: scaleSize(10)}}>{this.state.inforData?.remark}</Text>
							<ScrollView style={{height: scaleSize(100)}}>
								<Text style={{lineHeight: scaleSize(25)}}>{this.state.inforData?.duty}</Text>
							</ScrollView>
							<TouchableOpacity style={styles.infoBtn} onPress={()=>this.setState({inforVisible: false})}>
								<Text style={{color: '#000000',lineHeight: scaleSize(40),}}>关闭</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			}
		</View>
	}
}



class ClubImgList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			clubId: this.props.clubId,
			isFollow: this.props.isFollow
		};
	}

	async refreshContent(isFollow) {
		// ModalIndicator.show("更新图库")

		this.state.isFollow = isFollow
		this.forceUpdate()

		if (isFollow) {
			let imageList = await this.getClubImageList();
			this.listView.updateDataSource(imageList)
		} else {
			this.listView.updateDataSource([])
		}

		// ModalIndicator.hide()
	}

	async getClubImageList() {
		var result = [];
		await request.post(ApiUrl.CLUB_IMAGE_BY_CLUB_ID + this.state.clubId, {}).then(res => {
			if (res.status === 200) {
				result = res.data;
			}
		}).catch(err => {
			// ModalIndicator.hide()
			console.log(err)
		});

		return result;
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20

		let imageList = []
		if (this.props.isFollow) {
			imageList = await this.getClubImageList();
		}

		try {
			startFetch(imageList, pageSize);
		} catch (err) {
			abortFetch();
		}
	};

	renderItem(image, index) {
		let item = {};
		item.isSmallImage = true;
		item.mediaPath = ApiUrl.CLUB_IMAGE;
		item.image1 = image;

		if (this.props.isFollow) {
			return (
				<TouchableOpacity style={{ alignItems: 'center', alignContent: 'center' }}>
					<MediaShow item={item} imageStyle={{ width: scaleSize(90), height: scaleSize(90), margin: scaleSize(7) }} />
				</TouchableOpacity>
			)
		}
	}
	render() {
		if (this.state.isFollow) {
			return (
				<UltimateListView
					style={{ flex: 1 }}
					header={() => {
						return null
					}}
					allLoadedText={"没有更多了"}
					numColumns={3}
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
			)
		} else {
			return (
				<View>
					<Text style={{ color: "#D43D3E", fontSize: 16, textAlign: 'center', textAlignVertical: 'center', marginTop: scaleSize(100) }}>
						{"关注后可查看，快去关注吧"}
					</Text>
				</View>
			)
		}
	}
}

var styles = {
	btn: {
		backgroundColor: "#D43D3E",
		borderWidth: 1,
		borderColor: "#D43D3E",
		borderRadius: scaleSize(4),
		height: scaleSize(32),
		width: scaleSize(110),
		alignItems: 'center',
		justifyContent: "center",
		flexDirection: 'row',
	},
	btn_text: {
		color: "#FFFFFF",
		fontWeight: '800',
		fontSize: 14,
		marginLeft: scaleSize(3),
	},
	tabbar: {
		height: scaleSize(42),
		flexDirection: 'row',
		backgroundColor: "#fff",
	},
	tabItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabItemText: {
		fontSize: 15, color: "#303030",
		fontFamily: 'PingFangSC-Regular',
	},
	jiaoguan_box: {
		minHeight: scaleSize(211),
		backgroundColor: "#fff",
		borderRadius: scaleSize(2),
		paddingHorizontal: scaleSize(15),
		paddingVertical: scaleSize(11),
		marginTop: scaleSize(10),
		marginBottom: scaleSize(15),
	},
	inforModal: {
		width: scaleSize(300),
		height: scaleSize(300),
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginLeft: scaleSize(-150),
		marginTop: scaleSize(-150),
		borderRadius: scaleSize(5)
	},
	inforContent: {
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
		padding: scaleSize(15),
	},
	infoBtn: {
		width: scaleSize(270),
		height: scaleSize(40),
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderWidth: scaleSize(1),
		borderColor: '#e5e4e1',
		borderRadius: scaleSize(5),
		fontWeight: 'bold',
		marginTop: scaleSize(20)
	},
	zcStyle: { 
		color: "rgba(0,0,0,0.6)", 
		fontSize: scaleSize(12), 
		marginTop: scaleSize(6),
		width: scaleSize(100),
		textAlign: 'center' 
	}
}




