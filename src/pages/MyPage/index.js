import React, { Component } from 'react'
import { Text, View, DeviceEventEmitter, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import UISwitch from '../../components/UISwitch'
import LinearGradient from 'react-native-linear-gradient'
import store from '../../store'
import Url from '../../api/Url'
import Request from '../../api/Request'
import { ClientStatusEnum } from '../../global/constants'
import { Toast, ModalIndicator } from 'teaset';
import { scaleSize } from '../../global/utils'
import JMessage from 'jmessage-react-plugin';
import UIConfirm from '../../components/UIConfirm';

// iPhoneX
const X_WIDTH = 375;
const X_HEIGHT = 812;

// screen
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class MyPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			loginuser: undefined,
			isCertified: false,
			status: "",
			myFriends: [], // 我的好友
			myFollow: [], // 我的关注
			followMe: [], // 我的粉丝
			myClub: [], // 我关注的俱乐部
			myJoinClubs: [], // 我所属的俱乐部
			myCollection: [], // 我的收藏
			myTraing: [], // 我的培训
			myContest: [], // 我的赛事
			myJoinClubStr: "",
			showInfo: true,
			isIphoneX: false,
			rolesData: [],//荣誉榜
			userIntegral: false,
			userIntegralList: {}
		}
	}
	

	async componentDidMount() {
		ModalIndicator.show("获取数据")

		if (Platform.OS === 'ios' &&
			((SCREEN_HEIGHT === X_HEIGHT && SCREEN_WIDTH === X_WIDTH) ||
				(SCREEN_HEIGHT === X_WIDTH && SCREEN_WIDTH === X_HEIGHT))) {
			this.state.isIphoneX = true;
		}

		var user = await store.UserStore.getLoginUser()
		this.state.loginuser = user
		this.state.status = user?.status
		this.forceUpdate()
		if(user != null){
			await this.getFriends()
			await this.getMyInfo()
			await this.getMyRole()
			await this.getMyClub()
			await this.getMyFollowClub()
			await this.getMyCollection()

			await this.getOrderNum();

			// await this.getFollowMe()
			// await this.getFollow()
			// await this.getMyTrainingAndContest()
			await this.renderUserRole2ndRow()

			DeviceEventEmitter.addListener('userUpdated', (res) => {
				if (res.user) {
					console.debug("【监听回调，我的主页】用户信息更新ee")
					this.setState({ loginuser: res.user, status: res.user.status })
				}
			})

			DeviceEventEmitter.addListener("collectionUpdated", () => {
				console.debug("【监听回调，我的主页】我的收藏有更新")
				store.UserStore.getLoginUser().then(loginuser => {
					this.setState({ loginuser: loginuser, status: loginuser.status }, async () => {
						await this.getMyCollection()
					})
				})
			})

			// DeviceEventEmitter.addListener("baomingUpdated", () => {
			// 	console.debug("【监听回调，我的主页】我的赛事，培训有更新")
			// 	store.UserStore.getLoginUser().then(loginuser => {
			// 		this.setState({ loginuser: loginuser, status: loginuser.status }, async () => {
			// 			await this.getMyTrainingAndContest()
			// 		})
			// 	})
			// })

			DeviceEventEmitter.addListener("followUserUpdated", () => {
				console.debug("【监听回调，我的主页】关注用户更新")
				store.UserStore.getLoginUser().then(loginuser => {
					this.setState({ loginuser: loginuser, status: loginuser.status }, async () => {
						await this.getFollow()
					})
				})
			})

			DeviceEventEmitter.addListener("followClubUpdated", () => {
				console.debug("【监听回调，我的主页】关注俱乐部更新")
				store.UserStore.getLoginUser().then(loginuser => {
					this.setState({ loginuser: loginuser, status: loginuser.status }, async () => {
						await this.getMyFollowClub()
					})
				})
			})

			DeviceEventEmitter.addListener("orderEmit", () => {
				console.debug("【监听回调，我的主页】订单更新")
				store.UserStore.getLoginUser().then(loginuser => {
					this.setState({ loginuser: loginuser, status: loginuser.status }, async () => {
						await this.getOrderNum()
					})
				})
			})
		}

		DeviceEventEmitter.addListener("intrgralAdd", async () => {
			console.debug("【监听回调，我的主页】积分卡更新")
			await this.receiveintegral()
		})

		// await this.receiveintegral()

		ModalIndicator.hide()
	}

	getMyInfo = async () => {
		await Request.post(Url.USER_GET_BY_ID + this.state.loginuser.id).then(async (res) => {
			if (res.status === 200) {
				res.data.token = this.state.loginuser.token
				res.data.refreshToken = this.state.loginuser.refreshToken
				this.state.loginuser = res.data
				// this.state.loginuser.certExpireDate = res.data.certExpireDate
				console.log(this.state.loginuser);
				this.forceUpdate()
				// await store.UserStore.saveLoginUser(this.state.loginuser)
			}
		}).catch(err => ModalIndicator.hide())
	}

	getMyRole = async () => {
		await Request.post(Url.USER_ROLE_LIST, { userId: this.state.loginuser.id }).then(async (res) => {
			if (res.status === 200) {
				var roles = []
				for (var i = 0; i < res.data.rows.length; i++) {
					var role = res.data.rows[i].role
					roles.push({
						id: role.id,
						name: role.name,
						description: role.description
					})
				}

				this.state.loginuser.roles = roles
				this.forceUpdate()
				// await store.UserStore.saveLoginUser(this.state.loginuser)
			}
		}).catch(err => ModalIndicator.hide())
	}

	//获取我的好友
	getFriends = async () => {
		JMessage.getFriends(friendArr => {
			// console.debug("【极光好友列表】获取我的好友，总数: ", friendArr.length);
			this.setState({
				myFriends: friendArr,
			}, () => ModalIndicator.hide())
		},
			error => {
				ModalIndicator.hide();
				Toast.info("获取好友列表失败，请刷新重试");
				console.debug("【极光好友列表错误】获取好友列表异常: ", error);
			},
		);
	}

	// 获取我的粉丝
	getFollowMe = async () => {
		await Request.post(Url.USER_FOLLOW_LIST, { followId: this.state.loginuser.id, followType: "user" }).then(res => {
			if (res.status === 200) {
				// console.debug("我的粉丝", res.data.rows)
				this.setState({ followMe: res.data.rows })
			}
		}).catch(err => ModalIndicator.hide())
	}

	// 获取我的关注
	getFollow = async () => {
		await Request.post(Url.USER_FOLLOW_LIST, { clientUserId: this.state.loginuser.id, followType: "user" }).then(res => {
			if (res.status === 200) {
				// console.debug("我的关注", res.data.rows)
				this.setState({ myFollow: res.data.rows })
			}
		}).catch(err => ModalIndicator.hide())
	}

	// 获取我关注的俱乐部
	getMyFollowClub = async () => {
		await Request.post(Url.USER_FOLLOW_LIST, { clientUserId: this.state.loginuser.id, followType: "club" }).then(res => {
			if (res.status === 200) {
				// console.debug("我关注的俱乐部", res.data.rows)
				this.setState({ myClub: res.data.rows })
			}
		}).catch(err => ModalIndicator.hide())
	}

	// 获取我的俱乐部
	getMyClub = async () => {
		await Request.post(Url.MY_CLUB_LIST_ASSOC, { clientUserId: this.state.loginuser.id }).then(res => {
			if (res.status === 200) {
				if (res.data?.rows?.length > 0) {
					var myClubs = []
					res.data.rows.forEach(mc => myClubs.push(mc.club.title))
					this.state.myJoinClubStr = myClubs.join("/")
					this.forceUpdate()
				} else {
					this.state.myJoinClubStr = "未加入俱乐部"
					this.forceUpdate()
				}
			}
		}).catch(err => console.debug(err))
	}

	// 获取我的收藏
	getMyCollection = async () => {
		await Request.post(Url.USER_COLLECTION_LIST, { clientUserId: this.state.loginuser.id }).then(res => {
			if (res.status === 200) {
				// console.debug("我的收藏", res.data.rows)
				this.setState({ myCollection: res.data.rows })
			}
		}).catch(err => ModalIndicator.hide())
	}

	// 获取我的培训和赛事
	getMyTrainingAndContest = async () => {
		await Request.post(Url.REGISTER_LIST, { clientUserId: this.state.loginuser.id }).then(res => {
			if (res.status === 200) {
				var trainings = res.data.rows.filter(t => t.fkTable === 1)
				// console.debug("我的培训", trainings)
				var contests = res.data.rows.filter(c => c.fkTable === 2)
				// console.debug("我的赛事", contests)

				this.setState({ myTraing: trainings, myContest: contests })
			}
		}).catch(err => ModalIndicator.hide())
	}

	//判断是否领取过积分卡
	receiveintegral = async () => {
        await Request.post(Url.USERINTEGRAL_LIST,{ //分页随意传多少
            pd: {
                pageSize: 10,
                pageNum: 1
            },
			member: this.state.loginuser?.memberId == undefined ? '' : this.state.loginuser.memberId
        }).then(async (res) => {
			if (res?.data?.code === 0) {
				if(res?.data?.total > 0){
					this.setState({
						userIntegral: true,
						userIntegralList: res?.data?.rows[0]
					},()=>{
						RouteHelper.navigate("MyIntegralListPage", { loginuser: this.state.loginuser,userIntegralList: res?.data?.rows[0] })
					})
				}else{
					RouteHelper.navigate("MyIntegralCardPage", { loginuser: this.state.loginuser });
				}
			}
		}).catch(err => ModalIndicator.hide())
    }

	renderUserRole = (role) => {
		if (role.description === "实弹射手") {
			return (
				<TouchableOpacity style={styles.identity_item}>
					<Image source={images.mine.shidan} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</TouchableOpacity>
			)
		}

		if (role.description === "气枪射手") {
			return (
				<TouchableOpacity style={styles.identity_item}>
					<Image source={images.mine.qiqiang} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</TouchableOpacity>
			)
		}

		if (role.description === "国内裁判") {
			return (
				<TouchableOpacity style={styles.identity_item}>
					<Image source={images.mine.caipan} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</TouchableOpacity>
			)
		}

		if (role.description === "教官") {
			return (
				<TouchableOpacity style={styles.identity_item}>
					<Image source={images.mine.jiaoguan} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</TouchableOpacity>
			)
		}

		if (role.description === "国际裁判") {
			return (
				<TouchableOpacity style={styles.identity_item}>
					<Image source={images.mine.guojicaipan} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</TouchableOpacity>
			)
		}

		if (role.description === "会长") {
			return (
				<TouchableOpacity style={styles.identity_item}>
					<Image source={images.mine.huizhang} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</TouchableOpacity>
			)
		}
	}

	//获取订单数量
	getOrderNum = async ()=>{
		await Request.post(Url.GOODS_ORDER_NUM, { clientUserId: this.state.loginuser.id }).then(res => {
			// console.log("DD" + JSON.stringify(res));
			if (res.status === 200) {
				this.setState({
					orderStatusNum:res?.data
				})
			}
		}).catch(err => ModalIndicator.hide())
	}

	//荣誉榜
	renderUserRole2ndRow = async () => {
		await Request.post(Url.HONOR_LIST, { clientUserId: this.state.loginuser.id }).then(res => {
			if (res.status === 200) {
				this.setState({
					rolesData: res?.data?.rows
				})
			}
		}).catch(err => ModalIndicator.hide())

		// var roles = []
		// for (var i = 0; i < this.state.loginuser.roles.length; i++) {
		// 	roles.push(this.renderUserRole(this.state.loginuser.roles[i]))
		// }
		// return roles
	}

	renderExpireDt(date) {
		if (date == null || date == undefined || date == "" || date.length == 0) {
			return "未设置";
		} else {
			return date.split(" ")[0];
		}
	}

	//我的角色
	renderInfoRoles(){
		return (
			<View style={{ margin: scaleSize(15) }}>

				
					{
						this.state.loginuser?.roles?.length > 0 ? <>
							<TouchableOpacity onPress={()=>RouteHelper.navigate("MyRolesPage",{
								user: this.state.loginuser
							})} style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between'}}>
								<View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
									{
										this.state.loginuser?.roles?.slice(0,6).map((item,index)=>{
											return (
												<Image source={{ uri: Url.ROLE_IMAGE + item?.pictureUrl }} key={index} style={{ height: scaleSize(40), width: scaleSize(40),marginLeft: scaleSize(10) }} />
											)
										})
									}
								</View>
								<Image
									style={{ height: scaleSize(17), width: scaleSize(10),marginLeft: scaleSize(10) }}
									source={images.common.arrow_right2} tintColor="#fff" />
							</TouchableOpacity>		
						</> : <Text style={{color: '#FFFFFF'}}>暂无角色</Text>
					}
			</View>
		)
	}
	//个人信息
	renderInfoDetails() {
		// if (this.state.status === ClientStatusEnum.VERIFIED.code && this.state.showInfo) {
		return (
			<View>
				<View style={{ flexDirection: "row" }}>
					<View style={styles.myinfo_detais_row}>
						<Image source={images.mine.name} style={{ height: scaleSize(20), width: scaleSize(18), marginTop: scaleSize(3) }} />
						<Text style={styles.myinfo_details}>{this.state.loginuser?.realName ? this.state.loginuser.realName : "未设置"}</Text>
					</View>
					<View style={[styles.myinfo_detais_row]}>
						<Image source={images.mine.en_name} style={{ height: scaleSize(20), width: scaleSize(20), marginTop: scaleSize(3) }} />
						<Text style={styles.myinfo_details}>{this.state.loginuser?.englishName ? this.state.loginuser.englishName : "未设置"}</Text>
					</View>
					<View style={[styles.myinfo_detais_row]}>
						<Image source={images.mine.sex} style={{ height: scaleSize(20), width: scaleSize(20), marginTop: scaleSize(3) }} />
						<Text style={styles.myinfo_details}>{this.state.loginuser?.sex ? (this.state.loginuser.sex == 1 ? '男' : '女') : "未设置"}</Text>
					</View>
				</View>

				{/* <View style={styles.myinfo_detais_row}>
					<Image source={images.mine.clubs} style={{ height: scaleSize(14), width: scaleSize(14) }} />
					<Text style={styles.myinfo_details}>{this.state.myJoinClubStr}</Text>
				</View> */}

				<View style={{ flexDirection: "row" }}>
					<View style={styles.myinfo_detais_row}>
						<Image source={images.mine.city} style={{ height: scaleSize(18), width: scaleSize(18), marginTop: scaleSize(3) }} />
						<Text style={styles.myinfo_details}>{this.state.loginuser?.city ? this.state.loginuser?.city : "未设置"}</Text>
					</View>
					<View style={[styles.myinfo_detais_row, { width: scaleSize(180) }]}>
						<Image source={images.mine.vipNumber} style={{ height: scaleSize(20), width: scaleSize(20), marginTop: scaleSize(3) }} />
						<Text style={styles.myinfo_details}>{this.renderExpireDt(this.state.loginuser?.memberId)}</Text>
					</View>
				</View>

				<View style={[styles.myinfo_detais_row, { width: scaleSize(200) }]}>
					<Image source={images.mine.cert_dt} style={{ height: scaleSize(20), width: scaleSize(20), marginTop: scaleSize(3) }} />
					<Text style={styles.myinfo_details}>
						有效期：{this.renderExpireDt(this.state.loginuser?.certExpireDate)}
					</Text>
				</View>
				<View style={[styles.myinfo_detais_row, { width: scaleSize(300) }]}>
					<Image source={images.mine.club2} style={{ height: scaleSize(20), width: scaleSize(20) }} />
					<Text numberOfLines={1} style={[styles.myinfo_details, { width: scaleSize(260) }]}>
						{this.state.myJoinClubStr}
					</Text>
				</View>

				{/* 我的角色 */}
				{this.renderInfoRoles()}

				{/* <View style={[styles.myinfo_detais_row, { width: scaleSize(300) }]}>
					<Image source={images.mine.intro} style={{ height: scaleSize(20), width: scaleSize(20), marginTop: scaleSize(3) }} />
					<TouchableOpacity onPress={()=>{
						RouteHelper.navigate('UserIntroductionPage', {
							user: this.state.loginuser
						})
					}}>
						<Text numberOfLines={2} style={[styles.myinfo_details, { width: scaleSize(300) }]}>
							{this.state.loginuser?.introduction}
						</Text>
					</TouchableOpacity>
				</View> */}
			</View>
		)
		// }
	}

	render() {
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
			<UINavBar style={{ position: 'absolute' }} title={null} leftView={null} statusBarStyle={'dark-content'} />
			<ScrollView>
				<ImageBackground style={{ height: (this.state.status === ClientStatusEnum.VERIFIED.code && this.state.loginuser.roles && this.state.loginuser.roles.length > 0) ? scaleSize(360) : (this.state.loginuser == null ? scaleSize(180) : scaleSize(310)), paddingTop: statusBarHeight, paddingBottom: scaleSize(10) }} source={images.mine.headerbg} >
					<TouchableOpacity
						onPress={() => { 
							if(this.state.loginuser == null){
								UIConfirm.show("访客不可修改个人信息")
								return
							}	else{
								RouteHelper.navigate("EditInfoPage", { loginuser: this.state.loginuser, user: this.state.loginuser, myJoinClubStr: this.state.myJoinClubStr })
							}
							// else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
							// 	UIConfirm.show("认证通过后可以修改个人信息")
							// 	return
							// }
							
						
						}}
						style={{
							width: scaleSize(355),
							marginTop: scaleSize(20),
							borderTopLeftRadius: scaleSize(4),
							borderTopRightRadius: scaleSize(4),
							flexDirection: "row",
							alignItems: 'center',
							paddingLeft: scaleSize(12),
							paddingRight: scaleSize(10),
						}}>
						<View style={{ borderRadius: scaleSize(98 / 2), alignItems: 'center', justifyContent: "center" }}>
							<Image
								source={this.state.loginuser?.avatar ?
									{ uri: Url.CLIENT_USER_IMAGE + this.state.loginuser.avatar } :
									images.login.login_logo
								}
								style={{ width: scaleSize(98), height: scaleSize(98), borderRadius: scaleSize(98 / 2) }}
							/>
							{
								this.state.status === ClientStatusEnum.VERIFIED.code ?
									<Image
										style={{ width: scaleSize(120), height: scaleSize(35), position: "absolute", bottom: scaleSize(-5),  }}
										source={images.mine.vip}
									/> : null
							}
						</View>
						<View style={{ flex: 1, marginLeft: scaleSize(16) }}>
							{
								this.state.loginuser == null ? <Text numberOfLines={1} style={styles.nickname}>访客</Text>
								:
								<Text numberOfLines={1} style={styles.nickname}>{this.state.loginuser?.nickname}</Text>
							}
						</View>
						{
							this.state.loginuser != null && <Image
							style={{ position: "absolute", right: scaleSize(10), height: scaleSize(17), width: scaleSize(10), }}
							source={images.common.arrow_right2} tintColor="#fff" />
						}
					</TouchableOpacity>
					{
						this.state.loginuser != null && <>
							{this.renderInfoDetails()}
						</>
					}
				</ImageBackground>

				<View style={{ alignItems: 'center', marginTop: scaleSize(-20) }}>
					{
						(this.state.status === ClientStatusEnum.VERIFIED.code && this.state.loginuser?.roles && this.state.rolesData?.length > 0) ? <>
							<ImageBackground source={images.mine.rewardBack} style={{width: scaleSize(355),height: scaleSize(220)}} imageStyle={{borderRadius:5}}>
							 	<ImageBackground source={images.mine.reward} style={{width: scaleSize(120),height: scaleSize(40),zIndex: 999}}>
							 		<Text style={{color: '#FFFFFF',lineHeight: scaleSize(40),textAlign: 'center'}}>IPSC荣誉</Text>
							 	</ImageBackground>
							 	<TouchableOpacity onPress={()=>RouteHelper.navigate("HonorPage")} style={{position: 'absolute',right: scaleSize(10),marginTop: scaleSize(7)}}>
							 		<Text style={{color: '#795334'}}>查看全部 > </Text>
							 	</TouchableOpacity>
							 	<View style={{ backgroundColor: '#FFFFFF',height: scaleSize(180),margin: scaleSize(10),marginTop: scaleSize(-10) }}>
									<View style={{marginTop: scaleSize(20),paddingHorizontal: scaleSize(15)}}>
							 			{
											this.state.rolesData?.slice(0,3).map((item,index)=>{
												return (
													<View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',marginBottom: scaleSize(10)}} key={index}>
														<Image
															source={{uri: Url.HONOR_IMAGE + item?.pictureUrl}}
															style={{width: scaleSize(40),height: scaleSize(40),marginRight: scaleSize(15)}} />
														<Text numberOfLines={1}>{item?.title}</Text>
													</View>
												)
											})
										}
									</View>
								</View>
							</ImageBackground> 
							{/* <View style={{ height: 'auto', width: scaleSize(355), backgroundColor: '#FFE872' }}>
							 	<View style={{ height: scaleSize(25), flexDirection: "row", alignItems: 'center', justifyContent: "center", }}>
							 		<Image source={images.mine.reward1} style={{ height: scaleSize(17), width: scaleSize(85) }} />
							 	</View>
							 	<View style={{ display: 'flex',flexDirection: "row", alignItems: 'center', flexWrap: 'wrap', justifyContent: "space-around", paddingTop: scaleSize(8) }}>
							 		{this.renderUserRole2ndRow()}
							 	</View>
							 </View> */}
							</>
							: (
								this.state.status === ClientStatusEnum.IN_REVIEW.code ?
									<View
										style={{
											height: scaleSize(50),
											width: scaleSize(355),
											flexDirection: 'row',
											alignItems: 'center',
											borderBottomRightRadius: scaleSize(2),
											borderBottomLeftRadius: scaleSize(2),
											paddingLeft: scaleSize(10),
											backgroundColor: '#252223'
										}}>
										<Image
											source={images.mine.Subtract}
											style={{width: scaleSize(20),height: scaleSize(18),marginRight: scaleSize(5)}} />
																						<View>
										<Text style={{ fontWeight: "600", fontSize: 14, color: "#ECDEC7" }}>认证信息已提交，正在审核中</Text>
										</View>	
										{/* <Text style={{ fontWeight: "600", fontSize: 14, color: "#000" }}>认证信息已提交，正在审核中</Text> */}
									</View> : (
										this.state.status === ClientStatusEnum.NOT_VERIFIED.code ?
											<View
												style={{
													height: scaleSize(50),
													width: scaleSize(355),
													flexDirection: 'row',
													alignItems: 'center',
													borderBottomRightRadius: scaleSize(2),
													borderBottomLeftRadius: scaleSize(2),
													paddingLeft: scaleSize(10),
													backgroundColor: '#252223'
												}}>
												<Image
													source={images.mine.Subtract}
													style={{width: scaleSize(20),height: scaleSize(18),marginRight: scaleSize(5)}} />	
												<View>
													<Text style={{ fontWeight: "600", fontSize: 14, color: "#ECDEC7" }}>认证激活</Text>
													<Text style={{ fontWeight: "600", fontSize: 14, color: "#ECDEC7" }}>即可使用全部功能及射手权益</Text>
												</View>
												<LinearGradient colors={['#F1CF9F', '#FBF0D9']} style={{position: "absolute", right: scaleSize(20), height: scaleSize(29), width: scaleSize(83), borderRadius: scaleSize(15), alignItems: 'center', justifyContent: 'center'}}>
													<TouchableOpacity
														onPress={() => {
															RouteHelper.navigate("AuthenticationPage", {
																user: this.state.loginuser
															})
														}}>
															<Text style={{ fontSize: 14, fontWeight: "600", color: "#323232" }}>立即认证</Text>
													</TouchableOpacity>
												</LinearGradient>
											</View> : (
												this.state.status === ClientStatusEnum.RENEWAL_USER.code ?
												<View
													style={{
														height: scaleSize(50),
														width: scaleSize(355),
														flexDirection: 'row',
														alignItems: 'center',
														borderBottomRightRadius: scaleSize(2),
														borderBottomLeftRadius: scaleSize(2),
														paddingLeft: scaleSize(15),
														backgroundColor: '#FFE872'
													}}>
													<Text style={{ fontWeight: "600", fontSize: 14, color: "#ECDEC7" }}>认证已过期，请及时联系客服续费</Text>
													<LinearGradient colors={['#F1CF9F', '#FBF0D9']} style={{position: "absolute", right: scaleSize(20), height: scaleSize(29), width: scaleSize(83), borderRadius: scaleSize(15), alignItems: 'center', justifyContent: 'center'}}>
														<TouchableOpacity
															onPress={() => {
																
															}}>
															<Text style={{ fontSize: 14, fontWeight: "600", color: "#323232" }}>立即续费</Text>
														</TouchableOpacity>
													</LinearGradient>
													
												</View> : null
											)
									)
							)
					}
					
					{
						this.state.loginuser != null && <View style={{ alignItems: 'center' }}>
							<View style={{
								flexDirection: "row",
								height: scaleSize(60),
								marginTop: scaleSize(10),
								backgroundColor: "#fff",
								width: scaleSize(355),
								borderRadius: scaleSize(4),
							}}>
								{/* <TouchableOpacity
									onPress={() => {
										RouteHelper.navigate("MyFansPage", {
											loginuser: this.state.loginuser,
											fansList: this.state.followMe
										});
									}}
									style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
									<Text style={styles.count}>{this.state.followMe.length}</Text>
									<Text style={styles.count_label}>粉丝</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => {
										RouteHelper.navigate("MyFollowPage", {
											loginuser: this.state.loginuser,
											followList: this.state.myFollow
										});
									}}
									style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
									<Text style={styles.count}>{this.state.myFollow.length}</Text>
									<Text style={styles.count_label}>关注</Text>
								</TouchableOpacity> */}
								<TouchableOpacity
									onPress={() => {
										RouteHelper.navigate("ContactsPage");
									}}
									style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
									<Text style={styles.count}>{this.state.myFriends.length}</Text>
									<Text style={styles.count_label}>我的关注</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => {
										RouteHelper.navigate("MyClubPage", {
											loginuser: this.state.loginuser,
											clubs: this.state.myClub
										});
									}}
									style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
									<Text style={styles.count}>{this.state.myClub.length}</Text>
									<Text style={styles.count_label}>关注的俱乐部</Text>
								</TouchableOpacity>
							</View>
						</View>
					}

					<View style={styles.abount_my_box}>
						{
							this.state.status === ClientStatusEnum.NOT_VERIFIED.code || this.state.status === ClientStatusEnum.IN_REVIEW.code ? 
							<TouchableOpacity
								onPress={() => {
									if(this.state.loginuser == null){
										UIConfirm.show("访客不可查看")
									}else{
										RouteHelper.navigate("TrainingIntentionPage", {
											type: "contest",
											user: this.state.loginuser
										});
									}
								}}
								style={styles.abount_my_box_item}>
								<Image
									source={images.mine.saishi}
									style={styles.abount_my_box_icon} />
								<Text style={styles.abount_my_box_text}>我要参赛</Text>
							</TouchableOpacity>
							:
							<TouchableOpacity
								onPress={() => {
									if(this.state.loginuser == null){
										UIConfirm.show("访客不可查看")
									}else{
										RouteHelper.navigate("MyActivityPage", {
											type: "contest",
											// data: this.state.myContest,
											loginuser: this.state.loginuser
										});
									}
								}}
								style={styles.abount_my_box_item}>
								<Image
									source={images.mine.saishi}
									style={styles.abount_my_box_icon} />
								<Text style={styles.abount_my_box_text}>我的赛事</Text>
							</TouchableOpacity>
						}
						{
							this.state.status === ClientStatusEnum.NOT_VERIFIED.code || this.state.status === ClientStatusEnum.IN_REVIEW.code ? 
							<TouchableOpacity
								onPress={() => {
									if(this.state.loginuser == null){
										UIConfirm.show("访客不可查看")
									}else{
										RouteHelper.navigate("TrainingIntentionPage", {
											type: "training",
											user: this.state.loginuser
										});
									}
								}}
								style={styles.abount_my_box_item}>
								<Image
									source={images.mine.peixun}
									style={styles.abount_my_box_icon} />
								<Text style={styles.abount_my_box_text}>我要培训</Text>
							</TouchableOpacity>
							:
							<TouchableOpacity
								onPress={() => {
									if(this.state.loginuser == null){
										UIConfirm.show("访客不可查看")
									}else{
										RouteHelper.navigate("MyActivityPage", {
											type: "training",
											// data: this.state.myTraing,
											loginuser: this.state.loginuser
										});
									}
								}}
								style={styles.abount_my_box_item}>
								<Image
									source={images.mine.peixun}
									style={styles.abount_my_box_icon} />
								<Text style={styles.abount_my_box_text}>我的培训</Text>
							</TouchableOpacity>
						}
						<TouchableOpacity
							onPress={() => {
								if(this.state.loginuser == null){
									UIConfirm.show("访客不可查看")
								}else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
									UIConfirm.show("认证通过后可以查看")
									return
								}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
									UIConfirm.show("认证已过期，请及时续费")
									return
								}else{
									this.receiveintegral();
								}
							}}
							style={styles.abount_my_box_item}>
							<Image
								source={images.mine.jifenka}
								style={styles.abount_my_box_icon} />
							<Text style={styles.abount_my_box_text}>我的积分卡</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								if(this.state.loginuser == null){
									UIConfirm.show("访客不可查看")
								}else{
									RouteHelper.navigate("MyPointPage", { loginuser: this.state.loginuser });
								}
							}}
							style={styles.abount_my_box_item}>
							<Image
								source={images.mine.paiming}
								style={styles.abount_my_box_icon} />
							<Text style={styles.abount_my_box_text}>我的成绩</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								if(this.state.loginuser == null){
									UIConfirm.show("访客不可查看")
								}else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
									UIConfirm.show("认证通过后可以查看")
									return
								}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
									UIConfirm.show("认证已过期，请及时续费")
									return
								}else{
									RouteHelper.navigate("MyCollectPage", {
										loginuser: this.state.loginuser,
										myCollection: this.state.myCollection
									});
								}
							}}
							style={styles.abount_my_box_item}>
							<Image
								source={images.mine.shouchang}
								style={styles.abount_my_box_icon} />
							<Text style={styles.abount_my_box_text}>我的收藏</Text>
						</TouchableOpacity>
						{/* <TouchableOpacity 
							onPress={()=>{
								RouteHelper.navigate("MyPointPage");
							}}
							style={styles.abount_my_box_item}>
							<Image 
							source={images.mine.jifen}
							style={styles.abount_my_box_icon}  />
							<Text style={styles.abount_my_box_text}>我的积分</Text>
						</TouchableOpacity> */}
					</View>
					<View style={{ height: scaleSize(10) }}></View>
						<View style={{width:scaleSize(355),height:scaleSize(130),backgroundColor:'#fff',borderRadius:scaleSize(4), marginBottom:scaleSize(10),paddingHorizontal:scaleSize(10),paddingTop:scaleSize(10)}}>
							<View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
								<Text style={{fontSize:scaleSize(13),color:'#323232'}}>我的订单</Text>
								<TouchableOpacity style={{display:'flex',flexDirection:'row',alignItems:'center'}} onPress={()=>{
									RouteHelper.navigate("OrderPage",{status:0})
								}}>
									<Text style={{fontSize:scaleSize(12),color:'#646464'}}>查看全部订单</Text>
									<Image style={{width:scaleSize(6),height:scaleSize(11.12),marginLeft:scaleSize(5)}} source={images.jiantou}></Image>
								</TouchableOpacity>
							</View>

							<View style={{borderBottomWidth:scaleSize(1),borderBottomColor:'#eeeeee',marginTop:scaleSize(14)}}></View>

							<View style={{display:'flex',flexDirection:'row',justifyContent:'space-around', alignItems:'center',marginTop:scaleSize(10)}}>
								<TouchableOpacity style={{display:'flex',flexDirection:'column',justifyContent:'space-between',alignItems:'center'}} onPress={()=>{
									RouteHelper.navigate("OrderPage",{status:1})
								}}>
									{
										this.state.orderStatusNum?.待支付 != undefined &&<View style={{width:scaleSize(17),height:scaleSize(17),borderRadius:15,borderColor:'red',borderWidth:1,backgroundColor:'#fff', position:'absolute',right:-2,bottom:45,zIndex:999}}><Text style={{color:'red',textAlign:'center',fontSize:11}}>{this.state.orderStatusNum?.待支付}</Text></View>
									}
									<Image style={{width:scaleSize(42),height:scaleSize(42)}} source={images.daifukuan}></Image>
									<Text>待付款</Text>
								</TouchableOpacity>
								<TouchableOpacity style={{display:'flex',flexDirection:'column',justifyContent:'space-between',alignItems:'center'}} onPress={()=>{
									RouteHelper.navigate("OrderPage",{status:2})
								}}>
									{
										this.state.orderStatusNum?.待发货 != undefined &&<View style={{width:scaleSize(17),height:scaleSize(17),borderRadius:15,borderColor:'red',borderWidth:1,backgroundColor:'#fff', position:'absolute',right:-2,bottom:45,zIndex:999}}><Text style={{color:'red',textAlign:'center',fontSize:11}}>{this.state.orderStatusNum?.待发货}</Text></View>
									}
									<Image style={{width:scaleSize(42),height:scaleSize(42)}} source={images.daifahuo}></Image>
									<Text>待发货</Text>
								</TouchableOpacity>
								<TouchableOpacity style={{display:'flex',flexDirection:'column',justifyContent:'space-between',alignItems:'center'}} onPress={()=>{
									RouteHelper.navigate("OrderPage",{status:3})
								}}>
									{
										this.state.orderStatusNum?.待收货 != undefined &&<View style={{width:scaleSize(17),height:scaleSize(17),borderRadius:15,borderColor:'red',borderWidth:1,backgroundColor:'#fff', position:'absolute',right:-2,bottom:45,zIndex:999}}><Text style={{color:'red',textAlign:'center',fontSize:11}}>{this.state.orderStatusNum?.待收货}</Text></View>
									}
									<Image style={{width:scaleSize(42),height:scaleSize(42)}} source={images.daishouhuo}></Image>
									<Text>待收货</Text>
								</TouchableOpacity>
								<TouchableOpacity style={{display:'flex',flexDirection:'column',justifyContent:'space-between',alignItems:'center'}} onPress={()=>{
									RouteHelper.navigate("OrderPage",{status:4})
								}}>
									{
										this.state.orderStatusNum?.待评价 != undefined &&<View style={{width:scaleSize(17),height:scaleSize(17),borderRadius:15,borderColor:'red',borderWidth:1,backgroundColor:'#fff', position:'absolute',right:-2,bottom:45,zIndex:999}}><Text style={{color:'red',textAlign:'center',fontSize:11}}>{this.state.orderStatusNum?.待评价}</Text></View>
									}
									<Image style={{width:scaleSize(42),height:scaleSize(42)}} source={images.daipingjia}></Image>
									<Text>待评价</Text>
								</TouchableOpacity>
								<TouchableOpacity style={{display:'flex',flexDirection:'column',justifyContent:'space-between',alignItems:'center'}} onPress={()=>{
									RouteHelper.navigate('ChatPage', {
										loginUser: this.state.loginuser,
										conversation: {
											user: {
												nickname: "CPSA客服",
												username: "CPSA",
												name: "CPSA客服"
											},
											type: 'single'
										}
									})
								}}>
									<Image style={{width:scaleSize(42),height:scaleSize(42)}} source={images.shouhou}></Image>
									<Text>售后</Text>
								</TouchableOpacity>
							</View>
						</View>
					

					<TouchableOpacity
						onPress={() => {
							RouteHelper.navigate("AboutPage");
						}}
						style={styles.listrow}>
						<Image source={images.mine.tongyong} style={{width: scaleSize(17),height: scaleSize(16)}} />
						<Text style={styles.listrow_title}>通用</Text>
						<Image
							source={images.common.arrow_right2}
							style={styles.listrow_arrow} />
					</TouchableOpacity>

					<View style={{ height: scaleSize(10) }}></View>
					
					<TouchableOpacity
						onPress={() => {
							RouteHelper.navigate("CanvassBusinessPage", {
							});
						}}
						style={styles.listrow}>
						<Image source={images.mine.zhaoshang} style={{width: scaleSize(14),height: scaleSize(15)}} />
						<Text style={styles.listrow_title}>招商</Text>
						<Image
							source={images.common.arrow_right2}
							style={styles.listrow_arrow} />
					</TouchableOpacity>

					<View style={{ height: scaleSize(10) }}></View>
					
					<TouchableOpacity
						onPress={() => {
							RouteHelper.navigate("AboutUs");
						}}
						style={styles.listrow}>
						<Image source={images.mine.about} style={{width: scaleSize(15),height: scaleSize(13)}} />
						<Text style={styles.listrow_title}>关于我们</Text>
						<Image
							source={images.common.arrow_right2}
							style={styles.listrow_arrow} />
					</TouchableOpacity>

					{/* {
						this.state.status != ClientStatusEnum.VERIFIED.code && 			
						<TouchableOpacity
						onPress={() => {
							RouteHelper.navigate("TrainingIntentionPage"), {
								user: this.state.loginuser
							};
						}}
						style={styles.listrow}>
							<Image source={images.mine.zhaoshang} style={styles.listrow_icon} />
							<Text style={styles.listrow_title}>培训意向</Text>
							<Image
								source={images.common.arrow_right2}
								style={styles.listrow_arrow} />
						</TouchableOpacity>
					} */}

					{/*<TouchableOpacity 
					onPress={()=>{
						RouteHelper.navigate("BelongClubPage",{
						});
					}}
					style={styles.listrow}>
						<Image source={images.mine.club} style={styles.listrow_icon} />
						<Text style={styles.listrow_title}>所属俱乐部</Text>
						<Image  
						source={images.common.arrow_right2} 
						style={styles.listrow_arrow}/>
					</TouchableOpacity>
					*/}
					<View style={{ height: scaleSize(20) }}></View>
				</View>
			</ScrollView>
		</View >
	}

}

var styles = StyleSheet.create({
	nickname: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff"
	},
	level: {
		fontSize: 14,
		fontWeight: "400",
		color: "rgba(0,0,0,0.60)",
		marginTop: scaleSize(10),
	},
	member_validity: {
		fontSize: 10,
		fontWeight: "400",
		color: "#fff",
		textAlign: 'center',

	},
	identity_item: {
		width: scaleSize(110),
		height: scaleSize(80),
		alignItems: 'center',
		// justifyContent: 'center',	
	},
	count: {
		fontSize: 20,
		fontWeight: "800",
		color: PRIMARY_COLOR
	},
	count_label: {
		color: '#000',
		fontSize: 12,
		fontWeight: "400",
		fontFamily: 'PingFang SC',
		marginTop: scaleSize(4),
	},
	abount_my_box_item: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	abount_my_box: {
		height: scaleSize(90),
		width: scaleSize(355),
		backgroundColor: "#fff",
		borderRadius: scaleSize(4),
		flexDirection: "row",
		alignItems: 'center',
		marginTop: scaleSize(10),
	},
	abount_my_box_icon: {
		width: scaleSize(50),
		height: scaleSize(50),
	},
	abount_my_box_text: {
		color: "rgba(0,0,0,0.80)",
		fontSize: 12,
		fontWeight: "400",
		fontFamily: "PingFang SC",
	},
	listrow: {
		borderRadius: scaleSize(4),
		backgroundColor: "#fff",
		height: scaleSize(60),
		flexDirection: "row",
		alignItems: 'center',
		width: scaleSize(355),
		paddingHorizontal: scaleSize(10),
	},
	listrow_icon: {
		width: scaleSize(18),
		height: scaleSize(18),
	},
	listrow_title: {
		paddingLeft: scaleSize(10),
		color: "rgba(0,0,0,0.80)",
		fontSize: 14,
		fontWeight: "400",
	},
	listrow_arrow: {
		tintColor: "rgba(0,0,0,0.5)",
		position: "absolute",
		right: scaleSize(10),
		width: scaleSize(10),
		height: scaleSize(17)
	},
	myinfo_detais_row: {
		display: 'flex',
		flexDirection: "row",
		width: scaleSize(90),
		marginVertical: scaleSize(5),
		marginHorizontal: scaleSize(15),
		alignItems: 'center'
	},
	myinfo_details: {
		fontSize: 13,
		fontWeight: "600",
		color: "#fff",
		textAlignVertical: 'center',
		marginLeft: scaleSize(10)
	},
	role_badge: {
		color: "#FF7719",
		fontSize: 11,
		fontWeight: "400",
		paddingTop: scaleSize(5),
		width: scaleSize(110),
		textAlign: 'center',
		textAlignVertical: 'center',
	},
})




