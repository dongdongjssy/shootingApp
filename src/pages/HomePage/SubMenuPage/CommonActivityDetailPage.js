import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, BackHandler, Linking, DeviceEventEmitter } from 'react-native'
import { inject, observer } from 'mobx-react'
import { images } from '../../../res/images';
import { Toast, ModalIndicator } from 'teaset';
import UINavBar from '../../../components/UINavBar';
import SafeAreaViewPlus from '../../../components/SafeAreaViewPlus';
import HTMLView from 'react-native-htmlview';
import AutoSizeImage from '../../../components/AutoSizeImage';
import ShareBoxModal from '../../common/ShareBoxModal';
import ApiUrl from '../../../api/Url.js';
import request from '../../../api/Request';
import { UserStore } from '../../../store/UserStore';
import { RouteHelper } from 'react-navigation-easy-helper'
import UIConfirm from '../../../components/UIConfirm'
import WebViewHtmlView from '../../../components/WebViewHtmlView';
import { ClientStatusEnum, RELEASE_STATUS } from '../../../global/constants';
import Moment from 'moment';
import { stringify } from 'query-string';

export default class CommonActivityDetailPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			detailData: props.detailData,
			isBaoming: undefined,
			loginuser: undefined,
			htmlHegiht: 0,
			entrance: props.entrance,
			baomingStatus: 0
		};
		this.params = {
			"fkId": props.detailData.id,
			"fkTable": props.detailData.fkTableId,
			"clientUserId": undefined
		};
		UserStore.getLoginUser().then(user => {
			this.setState({ loginuser: user })
			this.params.clientUserId = user.id
		})
	}

	async componentDidMount() {
		ModalIndicator.show("获取数据")
		//alert(this.state.detailData.id);
		this.getMyInfo()
		var user = await UserStore.getLoginUser()
		await this.getUserCollection(user)

		DeviceEventEmitter.addListener('baomingUpdated', (result) => {
			if(result == 3){
				this.setState({
					isBaoming :true,
					baomingStatus : RELEASE_STATUS.IN_REVIEW.code
				},()=>{
					this.renderBaomingStatus();
				})
			}
			console.log("返回状态 " + result);
		})
		// check whether this use has already registered for this activity
		await request.post(ApiUrl.REGISTER_LIST, this.params).then(res => {
			if (res?.status === 200) {
				if (res?.data?.rows.length > 0) {
					this.state.detailData.myActivityId = res?.data?.rows[0]?.id;
					this.setState({ isBaoming: true,detailData:this.state.detailData });
					this.setState({ baomingStatus: res?.data?.rows[0]?.status })
					if((this.state.detailData.fkTableId == 1 || this.state.detailData.fkTableId == 2) && res?.data?.rows[0]?.status == RELEASE_STATUS.REGISTRATION_FAILED.code){
						this.setState({ isBaoming: false })
					}else if(this.state.detailData.fkTableId == 3 && res?.data?.rows[0]?.status == RELEASE_STATUS.PAYMENT_TO_BE_CONFIRMED.code){
						this.setState({ isBaoming: false })
					}
				} else {
					this.setState({ isBaoming: false })
				}
			}
		}).catch(err => {
			ModalIndicator.hide()
			console.debug(err)
		});

		// 检查资质(认证状态是否符合要求, 角色是否符合要求)
		var isRoleAllowed = false
		if ((this.state.detailData?.registerConfig?.isUnauthAllowed === 0 && this.state.loginuser?.status !== 2) || isRoleAllowed) {
			this.setState({ eligible: false })
		} else {
			this.setState({ eligible: true })
		}

		for (var i = 0; i < this.state.loginuser?.roles?.length; i++) {
			if (this.state.detailData?.registerConfig?.roleInfos.find(item => item.roleId === this.state.loginuser.roles[i].id)) {
				isRoleAllowed = true
				break
			}
		}

		DeviceEventEmitter.addListener("baomingUpdated", (res) => {
			console.debug("【监听回调，报名更新】")
			UserStore.getLoginUser().then(loginuser => {
				if (res.fkId === this.params.fkId && res.fkTable === this.params.fkTable && res.clientUserId === loginuser.id) {
					this.setState({ isBaoming: true, baomingStatus: 1 });
				}
			})
		})

		ModalIndicator.hide()
	}

	componentWillMount() {
		//监听返回键
		BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
	}

	componentWillUnmount() {
		//取消对返回键的监听
		BackHandler.removeEventListener('hardwareBackPress', this.onBackClicked);
	}

	//BACK物理按键监听
	onBackClicked = () => {
		if (this.state.entrance) {
			RouteHelper.reset("MainPage")
		} else {
			RouteHelper.goBack();
		}
		return true;
	}

	getMyInfo = async () => {
		await Request.post(Url.USER_GET_BY_ID + this.state.loginuser.id).then(async (res) => {
			if (res.status === 200) {
				// console.debug(res.data)
				res.data.token = this.state.loginuser.token
				res.data.refreshToken = this.state.loginuser.refreshToken
				this.state.loginuser = res.data
				// this.state.loginuser.certExpireDate = res.data.certExpireDate
				// console.log(this.state.loginuser);
				this.forceUpdate()
				// await store.UserStore.saveLoginUser(this.state.loginuser)
			}
		}).catch(err => ModalIndicator.hide())
	}


	getUserCollection = async (user) => {
		let loginuser = await UserStore.getLoginUser()
		await request.post(ApiUrl.USER_COLLECTION_LIST, { client_user_id: loginuser.id }).then(async (res) => {
			if (res.status === 200) {
				if (res.data.rows) {
					var findUserCollection = undefined
					if (this.params.fkTable === 1) {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.detailData.id && ul.collectionType === "training")
					} else if (this.params.fkTable === 2) {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.detailData.id && ul.collectionType === "contest")
					} else if (this.params.fkTable === 3) {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.detailData.id && ul.collectionType === "clubActivity")
					}

					if (findUserCollection) {
						this.state.detailData.isCollect = true
						this.state.detailData.collectionId = findUserCollection.id
					} else {
						this.state.detailData.isCollect = false
					}
					this.forceUpdate()
				}
			}
		}).catch(err => console.log(err))

		// ModalIndicator.hide()
	}

	saveCollect = () => {
		var collectionType = undefined
		if (this.params.fkTable === 1) collectionType = 'training'
		if (this.params.fkTable === 2) collectionType = 'contest'
		if (this.params.fkTable === 3) collectionType = 'clubActivity'

		let params = {
			"clientUserId": this.state.loginuser.id,
			"collectionId": this.state.detailData.id,
			"collectionType": collectionType
		};

		if (this.state.detailData.isCollect) {
			request.post(ApiUrl.USER_COLLECTION_ADD, params).then(res => {
				if (res.status === 200) {
					Toast.message("收藏成功")
					this.getUserCollection()
				}
			}).catch(err => console.log(err));
		} else {
			request.post(ApiUrl.USER_COLLECTION_DEL + this.state.detailData.collectionId, {}).then(res => {
				if (res.status === 200) {
					Toast.message("取消收藏成功")
				}
			}).catch(err => console.log(err));
		}

		DeviceEventEmitter.emit("collectionUpdated")
	}

	call = phone => {
		const url = 'tel:${phone}';
		Linking.canOpenURL(url)
			.then(supported => {
				if (!supported) {
					return Alert.alert('提示', '您的设备不支持该功能，请手动拨打 ${phone}', [
						{ text: '确定' }
					]);
				}
				return Linking.openURL(url);
			})
			.catch(err => Toast.info(`出错了：${err}`, 1.5));
	}

	async handleFooterItemOnPress(index) {
		switch (index) {
			case 0:
				if(this.state.loginuser == null){
					UIConfirm.show("访客不可咨询")
					return
				}else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
					UIConfirm.show("认证通过后可以咨询")
					return
				}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
					UIConfirm.show("认证已过期，请及时续费")
					return
				}else{
					var user = await UserStore.getLoginUser()
					if (this.state.detailData.pageText === "活动") {
						var club = this.state.detailData.club
						RouteHelper.navigate('ChatPage', {
							loginUser: user,
							conversation: {
								user: {
									nickname: club.title + " 俱乐部客服",
									username: club.jgUsername,
									name: club.title + " 俱乐部客服"
								},
								type: 'single'
							}
						})
					} else {
						RouteHelper.navigate('ChatPage', {
							loginUser: user,
							conversation: {
								user: {
									nickname: "CPSA客服",
									username: "CPSA",
									name: "CPSA客服"
								},
								type: 'single'
							}
						})
					}
				}
				break;
			case 1:
				if(this.state.loginuser == null){
					UIConfirm.show("访客不可收藏")
					return
				}else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
					UIConfirm.show("认证通过后可以收藏")
					return
				}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
					UIConfirm.show("认证已过期，请及时续费")
					return
				}else{
					this.state.detailData.isCollect = !this.state.detailData.isCollect
					this.forceUpdate()
					this.saveCollect()
				}
				break;
			case 2:
				if(this.state.loginuser == null){
					UIConfirm.show("访客不可分享")
					return
				}else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
					UIConfirm.show("认证通过后可以分享")
					return
				}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
					UIConfirm.show("认证已过期，请及时续费")
					return
				}else{
					var shareContent = "";
					if (this.state.detailData.content == null || this.state.detailData.content == undefined || this.state.detailData.content == "" || this.state.detailData.content.length == 0) {

					} else {
						if (this.state.detailData?.shortContent?.length > 70) {
							shareContent = this.state.detailData.shortContent.substr(0, 69);
						} else {
							shareContent = this.state.detailData.shortContent;
						}
					}
					var shareUrl = "";
					if (this.params.fkTable === 1) shareUrl = "http://zjw.tjjzshw.com/#/sign?id=" + this.state.detailData.id
					if (this.params.fkTable === 2) shareUrl = "http://zjw.tjjzshw.com/#/game?id=" + this.state.detailData.id
					if (this.params.fkTable === 3) shareUrl = "http://zjw.tjjzshw.com/#/club?id=" + this.state.detailData.id
					ShareBoxModal.show({ "title": this.state.detailData.title, "content": shareContent, "shareUrl": shareUrl })
				}
				break;
		}
	}

	register() {
		if (this.state.detailData.registerConfig) {
			// 如果后台配置了自定义的报名表
			RouteHelper.navigate("RegisterPage", { params: this.params, item: this.state.detailData, loginuser: this.state.loginuser })
		} else {
			// 如果后台没有配置报名表，直接报名
			let restApiUrl = ApiUrl.REGISTER_ADD;

			request.post(restApiUrl, this.params).then(res => {
				if (res.status === 200) {
					this.setState({ isBaoming: true, baomingStatus: 1 });
					DeviceEventEmitter.emit("baomingUpdated")
				}
			}).catch(err => console.log(err));
		}
	}

	renderBaomingStatus() {
		if (this.state.isBaoming === undefined) return null

		if (!this.state.eligible) return "不符合报名条件"

		if (this.state.isBaoming === false) {
			if (this.state.detailData.enrollDeadline && this.state.baomingStatus == 0) {
				var enrollDeadline = new Date(this.renderExpireDt(this.state.detailData.enrollDeadline))
				var now = new Date()
				if (now <= enrollDeadline) return "立即报名"
				else return "报名已截止"
			}
			
			if((this.params.fkTable === 1 || this.params.fkTable === 2) && this.state.detailData.enrollDeadline && this.state.baomingStatus == RELEASE_STATUS.REGISTRATION_FAILED.code){
				return '报名失败，再次报名'
			}else if(this.state.detailData.fkTableId === 3 && this.state.detailData.enrollDeadline && this.state.baomingStatus == RELEASE_STATUS.PAYMENT_TO_BE_CONFIRMED.code){
				return '报名失败，再次报名'
			}
			return "立即报名"
		}
		if (this.state.isBaoming === true) {
			//培训赛事
			// if (this.params.fkTable === 1 || this.params.fkTable === 2) {
				if (this.state.baomingStatus === RELEASE_STATUS.IN_REVIEW.code) {
					return '报名审核中'
				} else if (this.state.baomingStatus === RELEASE_STATUS.TB_BE_PAID.code) {
					return '待支付'
				} else if (this.state.baomingStatus === RELEASE_STATUS.PAYMENT_TO_BE_CONFIRMED.code) {
					return '支付待确认'
				} else if (this.state.baomingStatus === RELEASE_STATUS.REGISTRATION_PASSED.code) {
					return '报名通过'
				} else if (this.state.baomingStatus === RELEASE_STATUS.REGISTRATION_FAILED.code) {
					return '报名失败，再次报名'
				}
			// } else {
			// 	//俱乐部
			// 	if (this.state.baomingStatus === RELEASE_STATUS.IN_REVIEW.code) {
			// 		return '报名审核中'
			// 	} else if (this.state.baomingStatus === RELEASE_STATUS.TB_BE_PAID.code) {
			// 		return '报名通过'
			// 	} else if (this.state.baomingStatus === RELEASE_STATUS.PAYMENT_TO_BE_CONFIRMED.code) {
			// 		return '报名失败，再次报名'
			// 	}
			// }
		}
	}

	renderExpireDt(date) {
		if (date == null || date == undefined || date == "" || date.length == 0) {
			return "未设置";
		} else {
			return date.split(" ")[0];
		}
	}

	renderFooter() {
		var detailData = this.state.detailData;
		var footerItems = [
			{ 'source': images.common.consult, 'text': '咨询' },
			{ 'source': detailData.isCollect ? images.common.star_active : images.common.star, 'text': detailData.isCollect ? '已收藏' : '收藏' },
			{ 'source': images.common.share, 'text': '分享' },
		]
		return (
			<View
				style={{
					minHeight: scaleSize(60),
					backgroundColor: "rgba(245,245,245,1)",
					paddingHorizontal: scaleSize(20),
					paddingVertical: scaleSize(10),
					flexDirection: 'row'
				}}
			>
				{
					footerItems.map((footerItem, index) => {
						return (
							<FooterItem
								onPress={() => this.handleFooterItemOnPress(index) }
								source={footerItem.source}
								text={footerItem.text}
							/>
						)
					})
				}

				{
					(detailData.enrollDeadline && new Date() > new Date(this.renderExpireDt(detailData.enrollDeadline))) || !this.state.eligible ?
						<View
							style={{
								width: scaleSize(181),
								height: scaleSize(40),
								marginLeft: scaleSize(15),
								alignItems: 'center', justifyContent: 'center', backgroundColor: "#C8C8C8", borderRadius: scaleSize(4)
							}}
						>
							<Text style={{ color: "#000", fontSize: 18, fontWeight: "400" }}>
								{this.renderBaomingStatus()}
							</Text>
						</View> :
						<TouchableOpacity
							onPress={() => {
								console.log(this.state.isBaoming);
								if (this.state.isBaoming) {
									if (this.state.baomingStatus === RELEASE_STATUS.TB_BE_PAID.code) {
										//  console.log('支付》》》》》》》》》》》》》》》'+JSON.stringify(this.state.detailData))
									
										RouteHelper.navigate("PaymentPage", { detailData: this.state.detailData, loginuser: this.state.loginuser })
									}else{
										return;
									}
								}
								//访客不可报名
								if (this.state.loginuser == null) {
									UIConfirm.show("访客不可报名")
									return
								}

								// 如果后台配置了报名表，跳转到报名表，否则直接报名
								if (this.state.detailData.registerConfig) this.register()
								else {
									UIConfirm.show("确认报名吗？", () => {
										//confirm
										this.register();
										this.forceUpdate();
									}, () => {
										//cancel
									})
								}
							}}
							style={{
								width: scaleSize(181),
								height: scaleSize(40),
								marginLeft: scaleSize(15),
								alignItems: 'center', justifyContent: 'center', backgroundColor: "#D43D3E", borderRadius: scaleSize(4)
							}}
						>
							<Text style={{ color: "#fff", fontSize: 18, fontWeight: "400" }}>
								{this.renderBaomingStatus()}
							</Text>
						</TouchableOpacity>
				}

			</View>
		)
	}
	render() {
		var detailData = this.state.detailData;
		var result_enterPath = require('../../../res/images/RankResult/result_enter.png');

		return <SafeAreaViewPlus>
			<View style={{ backgroundColor: "#F2F6F9", flex: 1 }}>
				<UINavBar
					leftView={
						<TouchableOpacity
							onPress={() => {
								if (this.state.entrance) {
									RouteHelper.reset("MainPage")
								} else {
									RouteHelper.goBack();
								}
							}}
							style={{ flex: 1, marginLeft: scaleSize(6), alignItems: 'center', justifyContent: 'center' }}>
							<Image source={images.back} resizeMode="contain" style={{width: scaleSize(20), height: scaleSize(20),}}/>
						</TouchableOpacity>
					}
					rightView={
						detailData.fkTableId === 2 ?
							<View style={{ flexDirection: 'row', marginRight: scaleSize(5), width: scaleSize(100), height: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}>
								<TouchableOpacity
									onPress={() => {
										RouteHelper.navigate("MatchRankListPage", { loginuser: this.state.loginuser, contestId: this.state.detailData.id });
									}}
									style={{ flexDirection: 'row', marginRight: scaleSize(5), width: scaleSize(50), height: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}
								>
									<Image style={{ marginLeft: scaleSize(30), width: scaleSize(22), height: scaleSize(22) }} source={result_enterPath} />
									<Text style={{ marginLeft: scaleSize(7), marginTop: scaleSize(7), width: scaleSize(30), fontSize: scaleSize(14), color: "#FFFFFF", fontWeight: "bold" }}>成绩</Text>
								</TouchableOpacity>
							</View> : null
					}
					title={detailData.pageText + "详情"}
				/>
				<ScrollView>
					<View style={{padding: scaleSize(15)}}>
						<Image source={{ uri: detailData.imageUrl }} style={{ width: '100%', height: scaleSize(165),borderRadius: scaleSize(5) }} resizeMode="cover" />
					</View>
					<View style={{
						backgroundColor: "#fff",
						borderRadius: scaleSize(4),
						paddingHorizontal: scaleSize(10),
						paddingVertical: scaleSize(15),
					}}>
						<Text style={{ fontSize: 18, color: "rgba(0,0,0,0.8)", fontWeight: "bold" }}>{detailData.title}</Text>
						{/* 地址 */}
						<View style={{ flexDirection: 'row', marginTop: scaleSize(12) }}>
							<Image
								style={{ width: scaleSize(11), height: scaleSize(12), marginTop: scaleSize(6), marginRight: scaleSize(4) }}
								source={images.common.location} />
							<Text style={{ lineHeight: scaleSize(24), color: "rgba(0,0,0,0.8)", fontWeight: "400" }}>{detailData.address}</Text>
						</View>

						{
							detailData.fkTableId === 2 ?
								<View style={{ flexDirection: "row", marginTop: scaleSize(12) }}>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Image
											style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
											source={images.common.contest_level} />
										<Text style={{ color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>{detailData?.contestLevelCoeff?.levelName}</Text>
									</View>
								</View> : null
						}

						<View style={{ display: 'flex', flexDirection: 'row',justifyContent: 'space-between',marginTop: scaleSize(10) }}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Image
									style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
									source={images.common.time} />
								<Text style={{ color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>培训日期</Text>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Image
									style={{ width: scaleSize(11), height: scaleSize(11) }}
									source={images.common.cate} />
								<Text style={{ marginLeft: scaleSize(4), color: "rgba(0,0,0,0.80)", fontWeight: "400" }}>
									{typeof(detailData.course) == 'string' ? detailData.course : detailData.course?.name}
								</Text>
								<View style={{ height: scaleSize(13), marginHorizontal: scaleSize(13), width: 1, backgroundColor: "#707070" }}></View>
								<Text style={{ color: "rgba(0,0,0,0.80)", fontWeight: "400" }}>
									{detailData.shootType ? detailData.shootType : detailData.type?.name}
								</Text>
							</View>
						</View>
						

						{/* 时间 */}
						<View style={{ flexDirection: 'row', marginTop: scaleSize(10), flexWrap: 'wrap' }}>
							{
								detailData?.schedules ?
									detailData?.schedules.map(s => {
										const currentTime = Moment().format("YYYY/MM/DD");
										const endDate = Moment(s.endDate, 'YYYY/MM/DD')
										const diff = Moment(endDate).diff(Moment(currentTime), 'days')
										if(diff < 0){
											return (
												<Text style={{
													backgroundColor: '#e3e3e3',
													fontSize: 12,
													color: "rgba(0,0,0,0.8)",
													padding: scaleSize(8),
													margin: scaleSize(5)
												}}>
													{Moment(s.startDate, 'YYYY-MM-DD HH:mm:ss').format('MM')}月
													{Moment(s.startDate, 'YYYY-MM-DD HH:mm:ss').format('DD')}日
													-
													{Moment(s.endDate, 'YYYY-MM-DD HH:mm:ss').format('MM')}月
													{Moment(s.endDate, 'YYYY-MM-DD HH:mm:ss').format('DD')}日
												</Text>
											)
										}else{
											return (
												<Text style={{
													backgroundColor: '#FFFCDF',
													fontSize: 12,
													color: "rgba(0,0,0,0.8)",
													padding: scaleSize(8),
													margin: scaleSize(5)
												}}>
													{Moment(s.startDate, 'YYYY-MM-DD HH:mm:ss').format('MM')}月
													{Moment(s.startDate, 'YYYY-MM-DD HH:mm:ss').format('DD')}日
													-
													{Moment(s.endDate, 'YYYY-MM-DD HH:mm:ss').format('MM')}月
													{Moment(s.endDate, 'YYYY-MM-DD HH:mm:ss').format('DD')}日
												</Text>
											)
										}
										
									}) : null
							}
						</View>

						{/* money */}
						<View style={{ marginTop: scaleSize(10), flexDirection: 'row', alignItems: 'center' }}>
							<Image style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }} source={images.common.money} />
							<Text style={{ color: PRIMARY_COLOR, fontSize: 30, fontWeight: "bold", fontFamily: 'Roboto' }}>{detailData.price}</Text>
						</View>
					</View>

					<View style={{ flex: 1, paddingHorizontal: scaleSize(10), marginTop: scaleSize(20) }}>
						{<WebViewHtmlView
							content={detailData.content}
						/>}

						<View style={{ alignItems: 'center', marginTop: scaleSize(18) }}>
							<TouchableOpacity
								onPress={() => {
									RouteHelper.navigate("ReportPage")
								}}
								style={{ flexDirection: "row", alignItems: 'center' }}>
								<Image source={images.common.report_icon}
									style={{ marginRight: scaleSize(7), width: scaleSize(13), height: scaleSize(13) }} />
								<Text style={{ fontSize: 10, color: 'rgba(112, 112, 112, 1)' }}>内容存在争议，我要举报该内容</Text>
								<Image
									style={{ width: scaleSize(3), height: scaleSize(6), tintColor: "#323232", marginLeft: scaleSize(5) }}
									source={images.common.arrow_right3} />
							</TouchableOpacity>
						</View>
						{/*<HTMLView
							value={detailData.content.replace(/<[\/]?(p)(:?\s+(:?class|style)=(['"])[^'"]*['"])*>/g, function(m, m1) { 
								return m.replace('p', 'div'); 
							})}
							stylesheet={{
								div: {
									margin: 0, padding: 0
								},

							}}
							renderNode={(node, index, siblings, parent, defaultRenderer) => {
								var attribs = node.attribs;
								if (node.name == 'img') {
									return <AutoSizeImage
										source={{ uri: attribs.src }}
										style={{ padding: 0, margin: 0 }}
									/>
								}
							}}
						/>*/}
					</View>
				</ScrollView>
				{this.renderFooter()}
			</View>
		</SafeAreaViewPlus>
	}
}


var styles = {

}

function FooterItem(props) {
	return (
		<TouchableOpacity
			onPress={props.onPress}
			style={{ width: scaleSize(45), paddingTop: scaleSize(5), alignItems: 'center' }}
		>
			<Image
				source={props.source}
				style={{ width: scaleSize(15), height: scaleSize(15) }}
			/>
			<Text style={{ color: "#999999", fontSize: 12, fontWeight: "400", marginTop: scaleSize(4) }}>
				{props.text}
			</Text>
		</TouchableOpacity>
	)
}
