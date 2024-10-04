import React, { Component, Fragment } from 'react'
import { View, Image, Text, TouchableOpacity, ImageBackground, StyleSheet, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images'
import { Toast, ModalIndicator } from 'teaset'
import UINavBar from '../../components/UINavBar'
import EmptyView from '../../components/EmptyView'
import UIConfirm from '../../components/UIConfirm'
import { UltimateListView } from 'react-native-ultimate-listview'
import Url from '../../api/Url'
import Request from '../../api/Request'
import HTMLView from 'react-native-htmlview';
import ApiUrl from '../../api/Url.js';
import { ClientStatusEnum, PRIMARY_COLOR } from '../../global/constants'
import LoadingImage from '../../components/LoadingImage';
import MediaShow from '../../components/MediaShow.js';
import { scaleSize } from '../../global/utils';
import JMessage from 'jmessage-react-plugin'
import { AppStore } from '../../store/AppStore'


export default class UserCenterPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isFollow: undefined,
			user: this.props.user,
			loginuser: this.props.loginuser,
			postList: [],
			fixedNavBar: false,
			myJoinClubStr: this.props.myJoinClubStr,
			friendStatus: 'n',
			rolesData:[]
		}

		// console.debug("user: ", this.props.user)
		// console.debug("loginuser", this.props.loginuser)
	}

	async componentDidMount() {
		ModalIndicator.show("获取数据")

		await this.getUserInfo()

		console.debug("####user:", this.state.user.userName)
		console.debug("####loginuser:", this.state.loginuser.userName)
		if (this.state.user.userName !== this.state.loginuser.userName) {
			await this.getFriendStatus()
		}

		if (!this.state.myJoinClubStr) {
			await this.getJoinClubStr()
		}
		await this.renderUserRole2ndRowRy()

		ModalIndicator.hide()

		DeviceEventEmitter.addListener('userUpdated', (res) => {
			if (res.user) {
				console.debug("【监听回调，用户信息页】更新用户信息")
				if (this.state.user.userName === this.state.loginuser.userName) {
					this.setState({ loginuser: res.user, user: res.user })
				} else {
					this.setState({ loginuser: res.user })
				}
			}
		})
	}

		//荣誉榜
		renderUserRole2ndRowRy = async () => {
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

	// 获取和对方的好友状态
	getFriendStatus = async () => {
		JMessage.getFriends(friendArr => {
			console.debug("【极光好友列表】获取我的好友，总数: ", friendArr.length);

			for (var i = 0; i < friendArr.length; i++) {
				let item = friendArr[i]
				if (item?.username === this.state.user?.userName) {
					this.setState({ friendStatus: 'y' })
					break
				}
			}

			if (this.state.friendStatus === 'n') {
				AppStore.getSentFriendRequest().then(requests => {
					if (requests.find(item => item === this.state.user.userName))
						this.setState({ friendStatus: 'waiting' })
				})
			}
		}, error => {
			ModalIndicator.hide();
			Toast.info("获取好友列表失败，请刷新重试");
			console.debug("【极光好友列表错误】获取好友列表异常: ", error);
		});

		console.debug(this.state.friendStatus)
	}

	// 获取所属俱乐部
	getJoinClubStr = async () => {
		await Request.post(ApiUrl.MY_CLUB_LIST_ASSOC, { clientUserId: this.state.user.id }).then(res => {
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
		}).catch(err => {
			ModalIndicator.hide()
			console.debug(err)
		})
	}

	getFollowStatus = async () => {
		await Request.post(Url.USER_FOLLOW_LIST, {
			clientUserId: this.state.loginuser.id,
			followId: this.state.user.id,
			followType: "user"
		}).then(res => {
			if (res.data.total === 1) {
				this.setState({ isFollow: true })
				this.setState({ followId: res.data.rows[0].id })
			} else {
				this.setState({ isFollow: false })
			}
		}).catch(err => ModalIndicator.hide())
	}

	getUserInfo = async () => {
		await Request.post(Url.USER_GET_BY_ID + this.state.user.id).then(async (res) => {
			if (res.status === 200) {
				if (this.state.user.userName === this.state.loginuser.userName) {
					res.data.token = this.state.loginuser.token
					res.data.refreshToken = this.state.loginuser.refreshToken
					this.state.loginuser = res.data
					// this.state.loginuser.certExpireDate = res.data.certExpireDate
					// this.forceUpdate()
					// await store.UserStore.saveLoginUser(this.state.loginuser)
				}

				this.state.user = res.data
				this.forceUpdate()
			}
		}).catch(err => ModalIndicator.hide())
	}

	getRoles = async (userId) => {
		await Request.post(Url.USER_ROLE_LIST, { userId: userId }).then(async (res) => {
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

				if (this.state.user.userName === this.state.loginuser.userName) {
					this.state.loginuser.roles = roles
					// this.forceUpdate()
					// await store.UserStore.saveLoginUser(this.state.loginuser)
				}
				this.state.user.roles = roles
				this.forceUpdate()
			}
		}).catch(err => ModalIndicator.hide())
	}

	getPostList = async (page, pageSize) => {
		var params = this.state.user.userName === this.state.loginuser.userName ?
			{
				clientUserId: this.state.user.id,
				pd: {
					pageNum: page,
					pageSize: pageSize
				},
			} :
			{
				clientUserId: this.state.user.id,
				status: 1,
				pd: {
					pageNum: page,
					pageSize: pageSize
				},
			}

		var res = await Request.post(Url.POST_LIST_PAGE, params)
		if (res.status === 200) {
			return res.data.rows;
		}
		return [];

	}

	deletePost = async (post, index) => {
		ModalIndicator.show("删除中")

		await Request.post(Url.POST_DEL_BY_ID + post.id).then(res => {
			if (res.data.code === 0) {
				post.deleteTime = Date.now();
				this.listView.updateRows();
				// this.state.postList.splice(index, 1)
				// this.forceUpdate()
				// this.listView.updateDataSource(this.state.postList)
			}

			Toast.message("动态删除成功")
			ModalIndicator.hide()
		}).catch(err => ModalIndicator.hide())
	}

	followUser = async () => {
		await Request.post(Url.USER_FOLLOW_ADD, {
			clientUserId: this.state.loginuser.id,
			followId: this.state.user.id,
			followType: "user"
		}).then(res => {
			if (res.data.code === 0) {
				Toast.message("关注成功")
				this.getFollowStatus()
				var user = { ...this.state.user }
				user.clientUserId = this.state.loginuser.id
				user.followId = this.state.user.id
				DeviceEventEmitter.emit("followUserUpdated", { id: user.id, isFollow: true })
			}

		}).catch(err => Toast.message("关注失败，请重试"))
	}

	unfollowUser = async () => {
		await Request.post(Url.USER_FOLLOW_DEL + this.state.followId).then(res => {
			if (res.data.code === 0) {
				this.setState({ isFollow: false }, () => {
					Toast.message("取关成功")
					this.setState({ followId: undefined })
					DeviceEventEmitter.emit("followUserUpdated", { id: this.state.user.id, isFollow: false })
				})
			}

		}).catch(err => Toast.message("取注失败，请重试"))
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20

		var rows = await this.getPostList(page, pageSize)
		// console.log('rows',rows);
		try {
			startFetch(rows, pageSize);
		} catch (err) {
			abortFetch();
		}
	}

	onPrevImage(imgs, index) {
		RouteHelper.navigate("BigImageShowPage", {
			defaultIndex: index,
			imgs: imgs.map((itt) => {
				return { url: itt }
			}),
		})
	}

	renderImgs(item) {
		var imgs = []
		for (var i = 1; i <= 9; i++) {
			if (item["image" + i]) {
				imgs.push(Url.POST_IMAGE + item["image" + i])
			}
		}

		// console.debug(imgs)

		if (imgs.length) {
			if (imgs.length == 1) {
				return <TouchableOpacity
					key={1}
					style={{ height: scaleSize(150), width: scaleSize(345), marginTop: scaleSize(16) }}
					onPress={() => {
						RouteHelper.navigate("BigImageShowPage", {
							defaultIndex: 0,
							imgs: imgs.map((itt) => {
								return { url: itt }
							}),
						})
					}}>
					<LoadingImage
						source={{ uri: imgs[0] }}
						style={{ height: scaleSize(150), width: scaleSize(345) }}
						resizeMode="cover"
					/>
				</TouchableOpacity>
			} else {
				return <View style={{ marginTop: scaleSize(16), flexDirection: 'row', flexWrap: "wrap" }}>
					{
						imgs.map((img, index) => {
							return <TouchableOpacity
								key={index}
								onPress={this.onPrevImage.bind(this, imgs, index)}
								style={{
									width: scaleSize(100),
									height: scaleSize(100),
									margin: scaleSize(4),
								}}
							>
								<LoadingImage
									source={{ uri: img }}
									style={{ height: scaleSize(100), width: scaleSize(100) }}
									resizeMode="cover"
								/>
							</TouchableOpacity>
						})
					}
				</View>
			}
		}
		return null;
	}

	renderVideo(item) {
		if (item.video) {
			// console.warn("video", item);
			// b1c47475444ee4213d40f3bb854ca37b.mp4
			return <TouchableOpacity
				onPress={() => {
					RouteHelper.navigate("VideoShowPage", {
						url: Url.POST_IMAGE + item.video,
					})
				}}
				style={{ width: scaleSize(345), height: scaleSize(226), marginTop: scaleSize(16) }}>
				<ImageBackground
					style={{
						width: scaleSize(345),
						height: scaleSize(226),
						alignItems: 'center',
						justifyContent: 'center',
					}}
					source={{ uri: Url.POST_IMAGE + item.video }}
				>
					<View style={{ width: "100%", height: '100%', position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.3)" }}>
					</View>
					<Image
						style={{ width: scaleSize(60), height: scaleSize(60) }}
						source={images.common.video_play} />
				</ImageBackground>
			</TouchableOpacity>
		}
	}

	renderItem(item, index) {
		if (item.deleteTime) return null;
		item.mediaPath = ApiUrl.POST_IMAGE;
		return (
			<View
				style={{
					paddingHorizontal: scaleSize(16),
					width: SCREEN_WIDTH,
					marginTop: scaleSize(20),
					backgroundColor: "#fff",
					paddingTop: scaleSize(20),
					// paddingVertical:scaleSize(50),
					// alignItems:'center',
					// justifyContent:'center'
				}}>
				<TouchableOpacity onPress={() => {
					item.isUserLike = false
					item.isUserCollect = false
					item.isUserRead = true
					item.mediaPath = ApiUrl.POST_IMAGE
					item.post = item
					RouteHelper.navigate("DynamicDetailPage", {
						loginuser: this.state.loginuser,
						item: item,
						type: "dynamic",
						refreshHomePage: () => { this.listView && this.listView.refresh() }
					})
				}}>
					<HTMLView value={(item.content && item.content !== "undefined") ? item.content : ""} />
				</TouchableOpacity>
				{/*this.renderImgs(item)*/}
				{/*this.renderVideo(item)*/}
				<MediaShow
					item={item}
					onPress={() => {
						item.isUserLike = false
						item.isUserCollect = false
						item.isUserRead = true
						item.mediaPath = ApiUrl.POST_IMAGE
						item.post = item
						RouteHelper.navigate("DynamicDetailPage", {
							loginuser: this.state.loginuser,
							item: item,
							type: "dynamic",
							refreshHomePage: () => { this.listView && this.listView.refresh() }
						})
					}}
				/>
				<View style={{ flexDirection: "row", paddingLeft: scaleSize(4), height: scaleSize(40), alignItems: 'center' }}>
					{
						this.state.user.userName === this.state.loginuser.userName ?
							<Image style={{ width: scaleSize(54), height: scaleSize(18) }}
								source={item.status === 0 ? images.mine.post_review :
									(item.status === -1 ? images.mine.post_reject : images.mine.post_pass)}
							/> : null
					}
					<Text style={{ fontSize: 14, color: "rgba(0,0,0,0.50)", fontWeight: "400", marginLeft: scaleSize(15) }}>{item.createTime}</Text>
					{this.state.user.userName === this.state.loginuser.userName ?
						<TouchableOpacity
							onPress={() => {
								UIConfirm.show("您确定要删除此动态吗？", () => {
									//confirm
									this.deletePost(item, index)
								}, () => {
									//cancel
								});
							}}
							style={{ position: 'absolute', right: scaleSize(5), width: scaleSize(20), height: scaleSize(20), alignItems: 'center', justifyContent: 'center' }}>
							<Text style={{ color: "#707070", fontSize: 18 }}>x</Text>
						</TouchableOpacity> : null
					}
				</View>
			</View>
			// return <DynamicItem 
			// onPress={(item)=>{
			// 	RouteHelper.navigate("DynamicDetailPage",{
			// 		item:item,
			// 	});
			// }}
			// item={item} 
			// index={index} 
			// activeType={this.state.activeType}
			// listData={this.listView.getRows()}
			// />
		)
	}

	renderUserRole = (role) => {
		if (role.description === "实弹射手") {
			return (
				<View style={styles.identity_item}>
					<Image source={images.mine.shidan} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</View>
			)
		}

		if (role.description === "气枪射手") {
			return (
				<View style={styles.identity_item}>
					<Image source={images.mine.qiqiang} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</View>
			)
		}

		if (role.description === "国内裁判") {
			return (
				<View style={styles.identity_item}>
					<Image source={images.mine.caipan} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</View>
			)
		}

		if (role.description === "教官") {
			return (
				<View style={styles.identity_item}>
					<Image source={images.mine.jiaoguan} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</View>
			)
		}

		if (role.description === "国际裁判") {
			return (
				<View style={styles.identity_item}>
					<Image source={images.mine.guojicaipan} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</View>
			)
		}

		if (role.description === "会长") {
			return (
				<View style={styles.identity_item}>
					<Image source={images.mine.huizhang} style={{ width: scaleSize(45), height: scaleSize(45) }} />
					<Text style={styles.role_badge}>{role.name}</Text>
				</View>
			)
		}
	}

	renderUserRole2ndRow = () => {
		var roles = []
		if (this.state.user.roles) {
			for (var i = 0; i < this.state.user.roles.length; i++) {
				if(i <= 5){
					roles.push(this.renderUserRole(this.state.user.roles[i]))
				}
			}
		}
		return roles
	}

	renderHeader() {
		return (<Fragment>
			<UINavBar
				ref={(ref) => {
					this.navbar = ref;
				}}
				backIconStyle={{ tintColor: "#fff" }}
				style={{ position: "absolute", zIndex: 999, backgroundColor: "transparent" }}
				rightView={
					this.state.user.userName === this.state.loginuser.userName ?
						<TouchableOpacity></TouchableOpacity> : (
							this.state.friendStatus === 'y' ?
								<TouchableOpacity
									onPress={() => {
										this.state.user.username = this.state.user.userName
										this.state.user.name = this.state.user.userName
										RouteHelper.navigate('ChatPage', {
											loginUser: this.state.loginuser,
											conversation: {
												user: this.state.user,
												type: 'single'
											}
										})
									}}
									style={{ flexDirection: 'row', width: scaleSize(80), alignItems: 'center', backgroundColor: '#fff', borderRadius: 4, padding: scaleSize(5), marginRight: scaleSize(8) }}>
									<Image style={{ marginRight: scaleSize(5) }} source={images.common.infor_icon} style={{ width: scaleSize(14), height: scaleSize(14) }} tintColor={PRIMARY_COLOR} />
									<Text style={{ fontSize: 12, fontWeight: '400', color: PRIMARY_COLOR }}>发送消息</Text>
								</TouchableOpacity> : (
									this.state.friendStatus === 'n' ?
										<TouchableOpacity
											onPress={() => {
												JMessage.sendInvitationRequest({
													username: this.state.user.userName,
													reason: '请求添加好友'
												}, () => {
													this.setState({ friendStatus: 'waiting' })
													AppStore.getSentFriendRequest().then(requests => {
														if (!requests) {
															let newRequestArr = [];
															newRequestArr.push(this.state.user.userName);

															AppStore.saveSentFriendRequest(newRequestArr);
														} else {
															let existingRequest = requests.find(item => item === this.state.user.userName);

															if (!existingRequest) {
																let newRequestArr = [...requests];
																newRequestArr.push(this.state.user.userName);

																AppStore.saveSentFriendRequest(newRequestArr);
															}
														}
													})

													Toast.info("请求已发送");
												}, (error) => {
													Toast.info("网络连接异常，请重试");
													console.debug("【极光错误】发送好友请求出错: ", error);
												})
											}}
											style={{ width: scaleSize(90), alignItems: 'center', backgroundColor: '#fff', borderRadius: 4, paddingVertical: scaleSize(5), marginRight: scaleSize(8) }}>
											<Text style={{ fontSize: 12, fontWeight: '400', color: PRIMARY_COLOR }}>+ 添加好友</Text>
										</TouchableOpacity> :
										<TouchableOpacity
											style={{ width: scaleSize(90), alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, paddingVertical: scaleSize(5), marginRight: scaleSize(8) }}>
											<Text style={{ fontSize: 12, fontWeight: '400', color: '#fff' }}>申请已发送</Text>
										</TouchableOpacity>
								)
						)
				}
				title="" />

			<ImageBackground
				style={{
					paddingTop: statusBarHeight,
					paddingBottom: scaleSize(25),
					height: scaleSize(140)
				}}
				source={images.mine.headerbg} >
			</ImageBackground>

			<View style={{ borderRadius: 50, alignItems: 'center', justifyContent: "center" }}>
				<Image
					source={this.state.user && this.state.user.avatar ?
						{ uri: Url.CLIENT_USER_IMAGE + this.state.user.avatar } :
						images.login.login_logo
					}
					style={{ width: 100, height: 100, borderRadius: 50, position: 'absolute', left: scaleSize(30) }}
				/>
				{/* {
					this.state.user.status === ClientStatusEnum.VERIFIED.code ?
						<Image
							style={{ width: scaleSize(30), height: scaleSize(30), position: "absolute", right: scaleSize(-8), top: scaleSize(-8) }}
							source={images.mine.vip}
						/> : null
				} */}
			</View>

			{
				this.state.user.userName === this.state.loginuser.userName ?
					<TouchableOpacity
						onPress={() => RouteHelper.navigate("EditInfoPage", { loginuser: this.state.loginuser })}
						style={{
							width: scaleSize(130),
							alignItems: 'center',
							position: 'absolute',
							top: scaleSize(160),
							right: scaleSize(10),
							borderColor: '#ff0000',
							borderWidth: 1,
							paddingVertical: scaleSize(5),
							borderRadius: 20
						}}>
						<Text style={{ fontSize: 16, fontWeight: '700' }}>设置个人资料</Text>
					</TouchableOpacity> : null
			}

			<View
				style={{
					width: scaleSize(355),
					// height: scaleSize(100),
					marginTop: scaleSize(50),
					borderTopLeftRadius: scaleSize(4),
					borderTopRightRadius: scaleSize(4),
					flexDirection: "row",
					alignItems: 'center',
					// paddingLeft: scaleSize(12),
					paddingRight: scaleSize(10),
				}}>

				<View style={{ flex: 1, marginLeft: scaleSize(16), marginTop: scaleSize(15) }}>
					<Text numberOfLines={1} style={styles.nickname}>{this.state.user?.nickname}</Text>
					{/*<Text style={styles.level}>IPSC一级射手{'   '}IPSC教官</Text>*/}
				</View>
			</View>

			{this.renderInfoDetails()}

			<View style={{ alignItems: 'center' }}>
				{
					(this.state.user.status === ClientStatusEnum.VERIFIED.code && this.state.user.roles && this.state.user.roles.length > 0) ?
						<View style={{ height: 'auto', width: scaleSize(355), backgroundColor: '#FFE872' }}>
							<View style={{ flexDirection: "row", alignItems: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: "space-around", paddingVertical: scaleSize(6) }}>
								{this.renderUserRole2ndRow()}
							</View>
						</View> : null
				}
			</View>


			<View style={{ alignItems: 'center', marginTop: scaleSize(20) }}>
				{
					(this.state.user.status === ClientStatusEnum.VERIFIED.code && this.state.user.roles && this.state.rolesData.length > 0) && 	<ImageBackground source={images.mine.rewardBack} style={{width: scaleSize(355),height: scaleSize(220)}} imageStyle={{borderRadius:5}}>
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
				}
			</View>


		</Fragment>)
	}
	renderInfoDetails() {
		// if (this.state.user.status === ClientStatusEnum.VERIFIED.code) {
		return (
			<View style={{ marginVertical: scaleSize(10) }}>
				<View style={{ flexDirection: "row" }}>
					<View style={styles.myinfo_detais_row1}>
						{/* <Image source={images.mine.name} style={{ height: scaleSize(14), width: scaleSize(12), marginTop: scaleSize(3) }} tintColor={PRIMARY_COLOR} /> */}
						<Text style={[styles.myinfo_details, { color: '#323232', fontSize: 16, fontWeight: '700' }]}>
							{this.state.user?.realName ? this.state.user.realName : "未设置"}
						</Text>
					</View>
					<View style={styles.myinfo_detais_row1}>
						{/* <Image source={images.mine.en_name} style={{ height: scaleSize(14), width: scaleSize(14), marginTop: scaleSize(3) }} tintColor={PRIMARY_COLOR} /> */}
						<Text style={[styles.myinfo_details, { color: '#323232', fontSize: 16, fontWeight: '700' }]}>{this.state.user?.englishName ? this.state.user.englishName : "未设置"}</Text>
					</View>
				</View>

				{/* <View style={styles.myinfo_detais_row}>
						<Image source={images.mine.clubs} style={{ height: scaleSize(14), width: scaleSize(14) }} />
						<Text style={styles.myinfo_details}>{this.state.myJoinClubStr}</Text>
					</View> */}

				<View style={{ flexDirection: "row", justifyContent: 'flex-start', alignItems: 'center', alignContent: 'center', marginLeft: scaleSize(16) }}>
					<View style={styles.myinfo_detais_row3}>
						{/* <Image source={images.mine.city} style={{ height: scaleSize(14), width: scaleSize(12), marginTop: scaleSize(3) }} tintColor={PRIMARY_COLOR} /> */}
						<Text style={[styles.myinfo_details, { color: '#2F9BFF' }]}>{this.state.user?.sex !== undefined ? (this.state.user?.sex == 1 ? "男" : "女") : "未设置"}</Text>
					</View>
					<View style={styles.myinfo_detais_row3}>
						{/* <Image source={images.mine.city} style={{ height: scaleSize(14), width: scaleSize(12), marginTop: scaleSize(3) }} tintColor={PRIMARY_COLOR} /> */}
						<Text style={[styles.myinfo_details, { color: '#2F9BFF' }]}>{this.state.user?.city ? this.state.user?.city : "未设置"}</Text>
					</View>
					<View style={styles.myinfo_detais_row3}>
						{/* <Image source={images.mine.vipNumber} style={{ height: scaleSize(12), width: scaleSize(15), marginTop: scaleSize(3) }} tintColor={PRIMARY_COLOR} /> */}
						<Text style={[styles.myinfo_details, { color: '#2F9BFF' }]}>{this.state.user?.memberId}</Text>
					</View>
				</View>
				{/* 
				<View style={[styles.myinfo_detais_row, { width: scaleSize(200) }]}>
					<Image source={images.mine.cert_dt} style={{ height: scaleSize(14), width: scaleSize(14), marginTop: scaleSize(3) }} tintColor={PRIMARY_COLOR} />
					<Text style={styles.myinfo_details}>
						有效期：{this.renderExpireDt(this.state.user?.certExpireDate)}
					</Text>
				</View>

				<View style={[styles.myinfo_detais_row, { width: scaleSize(200) }]}>
					<Image source={images.mine.cert_dt} style={{ height: scaleSize(14), width: scaleSize(14), marginTop: scaleSize(3) }} tintColor={PRIMARY_COLOR} />
					<Text style={styles.myinfo_details}>
						认证日期：{this.renderExpireDt(this.state.user?.graduateDate)}
					</Text>
				</View> */}
				<View style={[styles.myinfo_detais_row, { width: scaleSize(200) }]}>
					{/* <Image source={images.mine.club2} style={{ height: scaleSize(14), width: scaleSize(14), marginTop: scaleSize(3) }} tintColor={PRIMARY_COLOR} /> */}
					<Text numberOfLines={1} style={[styles.myinfo_details, { width: scaleSize(260) }]}>
						{this.state.myJoinClubStr}
					</Text>
				</View>

				<View style={{ marginLeft: scaleSize(13), marginRight: scaleSize(10), marginTop: scaleSize(10) }}>
					<Text style={{ marginBottom: scaleSize(5) }}>{this.state.user?.introduction}</Text>
				</View>
			</View>
		)
		// }
	}

	renderExpireDt(date) {
		if (date == null || date == undefined || date == "" || date.length == 0) {
			return "未设置";
		} else {
			return date.split(" ")[0];
		}
	}

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
				{this.state.fixedNavBar ? <UINavBar
					style={{}}
					rightView={
						this.state.user.userName === this.state.loginuser.userName ?
							<TouchableOpacity
								onPress={() => RouteHelper.navigate("EditInfoPage", { loginuser: this.state.loginuser })}
								style={{ width: scaleSize(60), alignItems: 'center' }}>
								<Image source={images.common.write} tintColor={"#ff0000"} style={{ height: scaleSize(18), width: scaleSize(18) }} />
								{/* <Text style={{ fontSize: 16, fontWeight: '400', color: PRIMARY_COLOR }}>编辑</Text> */}
							</TouchableOpacity> :
							this.state.user.userName === this.state.loginuser.userName ?
								<TouchableOpacity></TouchableOpacity> : (
									this.state.friendStatus === 'y' ?
										<TouchableOpacity
											onPress={() => {
												this.state.user.username = this.state.user.userName
												this.state.user.name = this.state.user.userName
												RouteHelper.navigate('ChatPage', {
													loginUser: this.state.loginuser,
													conversation: {
														user: this.state.user,
														type: 'single'
													}
												})
											}}
											style={{ flexDirection: 'row', width: scaleSize(80), alignItems: 'center', backgroundColor: '#fff', borderRadius: 4, padding: scaleSize(5), marginRight: scaleSize(8), borderColor: PRIMARY_COLOR, borderWidth: 1 }}>
											<Image style={{ marginRight: scaleSize(5) }} source={images.common.infor_icon} style={{ width: scaleSize(14), height: scaleSize(14) }} tintColor={PRIMARY_COLOR} />
											<Text style={{ fontSize: 12, fontWeight: '400', color: PRIMARY_COLOR }}>发送消息</Text>
										</TouchableOpacity> : (
											this.state.friendStatus === 'n' ?
												<TouchableOpacity
													onPress={() => {
														JMessage.sendInvitationRequest({
															username: this.state.user.userName,
															reason: '请求添加好友'
														}, () => {
															this.setState({ friendStatus: 'waiting' })
															AppStore.getSentFriendRequest().then(requests => {
																if (!requests) {
																	let newRequestArr = [];
																	newRequestArr.push(this.state.user.userName);

																	AppStore.saveSentFriendRequest(newRequestArr);
																} else {
																	let existingRequest = requests.find(item => item === this.state.user.userName);

																	if (!existingRequest) {
																		let newRequestArr = [...requests];
																		newRequestArr.push(this.state.user.userName);

																		AppStore.saveSentFriendRequest(newRequestArr);
																	}
																}
															})

															Toast.info("请求已发送");
														}, (error) => {
															Toast.info("网络连接异常，请重试");
															console.debug("【极光错误】发送好友请求出错: ", error);
														})
													}}
													style={{ width: scaleSize(90), alignItems: 'center', backgroundColor: '#fff', borderRadius: 4, paddingVertical: scaleSize(5), marginRight: scaleSize(8), borderColor: PRIMARY_COLOR, borderWidth: 1 }}>
													<Text style={{ fontSize: 12, fontWeight: '400', color: PRIMARY_COLOR }}>+ 添加好友</Text>
												</TouchableOpacity> :
												<TouchableOpacity
													style={{ width: scaleSize(90), alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, paddingVertical: scaleSize(5), marginRight: scaleSize(8), borderColor: PRIMARY_COLOR, borderWidth: 1 }}>
													<Text style={{ fontSize: 12, fontWeight: '400', color: '#fff' }}>申请已发送</Text>
												</TouchableOpacity>
										)
								)

					}
					title={"个人中心"} /> : null}

				<View style={{ flex: 1, }}>
					<UltimateListView
						style={{ flex: 1 }}
						header={() => {
							return this.renderHeader();
						}}
						onScroll={(e) => {
							var scroll_y = e.nativeEvent.contentOffset.y;
							var scroll_x = e.nativeEvent.contentOffset.x;
							if (scroll_y > 60) {
								this.setState({
									fixedNavBar: true,
								})
								// console.log('this.navbar',this.navbar.setNative);
							} else {
								// if(this.state.fixedNavBar===true){
								this.setState({
									fixedNavBar: false,
								});
								// }
							}
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
			</View>
		)
	}

}

var styles = StyleSheet.create({
	identity_item: {
		width: scaleSize(110),
		height: scaleSize(80),
		alignItems: 'center',
		// justifyContent: 'center',
		// height:scaleSize(45),
	},
	myinfo_detais_row: {
		flexDirection: "row",
		width: scaleSize(50),
		marginVertical: scaleSize(5),
		marginHorizontal: scaleSize(6)
	},
	myinfo_detais_row1: {
		flexDirection: "row",
		// width: scaleSize(50),
		marginVertical: scaleSize(5),
		marginHorizontal: scaleSize(6)
	},
	myinfo_detais_row3: {
		// flexDirection: "row",
		// width: scaleSize(50),
		// marginVertical: scaleSize(5),
		// marginHorizontal: scaleSize(18),
		borderColor: "#2F9BFF",
		borderRadius: 2,
		borderWidth: 1,
		paddingRight: scaleSize(10),
		marginRight: scaleSize(10)
	},
	myinfo_details: {
		fontSize: 13,
		fontWeight: "600",
		// color: "#fff",
		textAlignVertical: 'center',
		marginLeft: scaleSize(10)
	},
	nickname: {
		fontSize: 24,
		fontWeight: "bold",
		// color: "#fff"
	},
	role_badge: {
		color: "#FF7719",
		fontSize: 11,
		fontWeight: "400",
		paddingTop: scaleSize(5),
		width: scaleSize(110),
		textAlign: 'center',
		textAlignVertical: 'center',
	}
})
