import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, ImageBackground, Linking } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast, ModalIndicator } from 'teaset';
import UINavBar from '../../components/UINavBar';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';
import HTMLView from 'react-native-htmlview';
import AutoSizeImage from '../../components/AutoSizeImage';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import ShareBoxModal from '../common/ShareBoxModal';
import Request from '../../api/Request';
import ApiUrl from '../../api/Url';
import WebViewHtmlView from '../../components/WebViewHtmlView';
import { ClientStatusEnum,RELEASE_STATUS } from '../../global/constants';

export default class ActivityDetailPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			detailData: this.props.detailData,
			loginuser: this.props.loginuser,
		}

		this.params = {
			fkId: this.state.detailData.id,
			fkTable: this.state.detailData.fkTableId,
			clientUserId: this.state.loginuser.id
		};

	}

	async componentDidMount() {
		ModalIndicator.show("获取数据")

		this.getMyInfo()
		var user = await UserStore.getLoginUser()
		await this.getUserCollection(user)

		// check whether this use has already registered for this activity
		await Request.post(ApiUrl.REGISTER_LIST, this.params).then(res => {
			if (res.status === 200) {
				if (res.data?.rows.length > 0) {
					this.state.detailData.isBaoming = res.data.rows.length > 0
					if (res.data.rows.length > 0) {
						this.state.detailData.baomingStatus = res.data.rows[0].status
					}
					this.forceUpdate()
				}
			}
		}).catch(err => ModalIndicator.hide());

		ModalIndicator.hide()
	}

	getUserCollection = async () => {
		await Request.post(ApiUrl.USER_COLLECTION_LIST, { client_user_id: this.state.loginuser.id }).then(async (res) => {
			if (res.status === 200) {
				if (res.data.rows) {
					var findUserCollection = undefined
					if (this.params.fkTable === 1) {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.detailData.id && ul.collectionType === "training")
					} else if (this.params.fkTable === 2) {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.detailData.id && ul.collectionType === "contest")
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
		}).catch(err => ModalIndicator.hide())
	}

	call = phone => {
		const url = `tel:${phone}`
		Linking.canOpenURL(url)
			.then(supported => {
				if (!supported) {
					return Alert.alert('提示', `您的设备不支持该功能，请手动拨打 ${phone}`, [
						{ text: '确定' }
					]);
				}
				return Linking.openURL(url);
			})
			.catch(err => Toast.info(`出错了：${err}`, 1.5))
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
		var detailData = this.state.detailData
		if (detailData === undefined) return null
		if (detailData.isBaoming === false) {
			if (detailData.enrollDeadline) {
				var enrollDeadline = new Date(this.renderExpireDt(detailData.enrollDeadline))
				var now = new Date()
				if (now <= enrollDeadline) return "立即报名"
				else return "报名已截止"
			}

			return "立即报名"
		}
		if (detailData.isBaoming === true) {
			if(this.params.fkTable === 1 || this.params.fkTable === 2){
				if (detailData.baomingStatus === RELEASE_STATUS.IN_REVIEW.code){
					return '报名审核中'
				}else if(detailData.baomingStatus === RELEASE_STATUS.TB_BE_PAID.code){
					return '待支付'
				}else if(detailData.baomingStatus === RELEASE_STATUS.PAYMENT_TO_BE_CONFIRMED.code){
					return '支付待确认'
				}else if(detailData.baomingStatus === RELEASE_STATUS.REGISTRATION_PASSED.code){
					return '报名通过'
				}else if(detailData.baomingStatus === RELEASE_STATUS.REGISTRATION_FAILED.code){
					return '报名失败'
				}
			}else{
				if (this.state.baomingStatus === RELEASE_STATUS.IN_REVIEW.code){
					return '报名审核中'
				}else if(this.state.baomingStatus === RELEASE_STATUS.TB_BE_PAID.code){
					return '报名通过'
				}else if(this.state.baomingStatus === RELEASE_STATUS.PAYMENT_TO_BE_CONFIRMED.code){
					return '报名失败'
				}
			}
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
		return (
			<View
				style={{
					minHeight: scaleSize(60),
					backgroundColor: "rgba(245,245,245,1)",
					paddingHorizontal: scaleSize(20),
					paddingVertical: scaleSize(10),
					flexDirection: 'row',
				}}>
				<TouchableOpacity
					onPress={() => {
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
					}}
					style={{ width: scaleSize(45), paddingTop: scaleSize(5), alignItems: 'center' }}>
					<Image
						source={images.common.consult}
						style={{ width: scaleSize(15), height: scaleSize(15) }} />
					<Text style={{ color: "#999999", fontSize: 12, fontWeight: "400", marginTop: scaleSize(4) }}>
						咨询
						</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						detailData.isCollect = !detailData.isCollect
						this.forceUpdate();
					}}
					style={{ width: scaleSize(45), paddingTop: scaleSize(5), alignItems: 'center' }}>
					<Image
						source={detailData.isCollect ? images.common.star_active : images.common.star}
						style={{ width: scaleSize(15), height: scaleSize(15) }} />
					<Text style={{ color: "#999999", fontSize: 12, fontWeight: "400", marginTop: scaleSize(4) }}>
						{detailData.isCollect ? '已收藏' : '收藏'}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						ShareBoxModal.show({ "title": detailData.title, "content": detailData.content, "shareUrl": "http://zjw.tjjzshw.com/#/index?id=" + detailData.id })
					}}
					style={{ width: scaleSize(45), paddingTop: scaleSize(5), alignItems: 'center' }}>
					<Image
						source={images.common.share}
						style={{ width: scaleSize(15), height: scaleSize(15) }} />
					<Text style={{ color: "#999999", fontSize: 12, fontWeight: "400", marginTop: scaleSize(4) }}>
						分享
						</Text>
				</TouchableOpacity>
				{
					(detailData.enrollDeadline && new Date() > new Date(this.renderExpireDt(detailData.enrollDeadline))) ?
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
								if (this.state.isBaoming) {
									return;
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
				{/* <TouchableOpacity
					onPress={() => {
						if (this.renderBaomingStatus() == '报名成功' || this.renderBaomingStatus() == '报名审核中') {
							//不可点击状态
						} else {
							detailData.isBaoming = !detailData.isBaoming
							this.forceUpdate();
						}
					}}
					style={{
						width: scaleSize(181),
						height: scaleSize(40),
						marginLeft: scaleSize(15),
						alignItems: 'center', justifyContent: 'center', backgroundColor: "#C8C8C8", borderRadius: scaleSize(4)
					}}>
					<Text style={{ color: "#fff", fontSize: 18, fontWeight: "400" }}>
						{this.renderBaomingStatus()}
					</Text>
				</TouchableOpacity> */}
			</View>
		)
	}
	render() {
		var detailData = this.state.detailData;
		var result_enterPath = require('../../res/images/RankResult/result_enter.png');

		return <SafeAreaViewPlus style={{ flex: 1 }}>
			<View style={{ backgroundColor: "#F2F6F9", flex: 1 }}>
				<UINavBar title={detailData.fkTableId === 1 ? "培训详情" : "赛事详情"}
					rightView={
						detailData.fkTableId === 2 ?
							<View style={{ flexDirection: 'row', marginRight: scaleSize(5), width: scaleSize(100), height: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}>
								<TouchableOpacity
									onPress={() => {
										RouteHelper.navigate("MatchRankListPage", { loginuser: this.state.loginuser, contestId: detailData.id });
									}}
									style={{ flexDirection: 'row', marginRight: scaleSize(5), width: scaleSize(50), height: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}
								>
									<Image style={{ marginLeft: scaleSize(30), width: scaleSize(22), height: scaleSize(22) }} source={result_enterPath} />
									<Text style={{ marginLeft: scaleSize(7), marginTop: scaleSize(7), width: scaleSize(30), fontSize: scaleSize(14), color: "rgba(212, 61, 62, 1)", fontWeight: "bold" }}>成绩</Text>
								</TouchableOpacity>
							</View> : null
					}
				/>
				<ScrollView>
					<ImageBackground
						source={{ uri: detailData.imageUrl }}
						style={{ width: '100%', height: scaleSize(220), alignItems: 'center' }}
					>
					</ImageBackground>
					<View style={{ alignItems: 'center' }}>
						<View
							style={{
								width: scaleSize(355),
								height: scaleSize(185),
								backgroundColor: "#fff",
								borderRadius: scaleSize(4),
								marginTop: scaleSize(-50),
								paddingHorizontal: scaleSize(10),
								paddingVertical: scaleSize(15),
							}}>
							<Text style={{ fontSize: 18, color: "rgba(0,0,0,0.8)", fontWeight: "bold" }}>{detailData.title}</Text>
							<View style={{ flexDirection: "row", marginTop: scaleSize(12) }}>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<Image
										style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
										source={images.common.time} />
									<Text style={{ fontSize: 12, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
										{detailData.startDate.split(" ")[0]} — {detailData.endDate.split(" ")[0]}
									</Text>
								</View>
							</View>
							{
								detailData.fkTableId === 2 ?
									<View style={{ flexDirection: "row", marginTop: scaleSize(12) }}>
										<View style={{ flexDirection: 'row', alignItems: 'center' }}>
											<Image
												style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
												source={images.common.contest_level} />
											<Text style={{ fontSize: 12, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
												{detailData.contestLevelCoeff.levelName}
											</Text>
										</View>
									</View> : null
							}
							<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaleSize(12) }}>
								<Image
									style={{ width: scaleSize(10), height: scaleSize(10) }}
									source={images.common.cate} />
								<Text style={{ marginLeft: scaleSize(4), color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 12 }}>{detailData?.course?.name}</Text>
								<View style={{ height: scaleSize(13), marginHorizontal: scaleSize(13), width: 1, backgroundColor: "#707070" }}></View>
								<Text style={{ color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 12 }}>{detailData?.type?.name}</Text>
							</View>
							<View style={{ flexDirection: 'row', marginTop: scaleSize(12), width: scaleSize(221) }}>
								<Image
									style={{ width: scaleSize(11), height: scaleSize(12), marginTop: scaleSize(6), marginRight: scaleSize(4) }}
									source={images.common.location} />
								<Text style={{ lineHeight: scaleSize(24), color: "rgba(0,0,0,0.8)", fontWeight: "400" }}>{detailData?.address}</Text>
							</View>
							<View style={{ position: "absolute", right: scaleSize(10), top: scaleSize(50) }}>
								<Text>
									<Text style={{ color: PRIMARY_COLOR, fontSize: 20, fontFamily: 'Roboto', fontWeight: "400" }}>￥</Text>
									<Text style={{ color: PRIMARY_COLOR, fontSize: 30, fontWeight: "bold", fontFamily: 'Roboto' }}>{detailData?.price}</Text>
								</Text>
							</View>
						</View>
					</View>
					<View style={{ flex: 1, paddingHorizontal: scaleSize(10), marginTop: scaleSize(20) }}>
						{
							<WebViewHtmlView content={detailData.content} />
						}
						<View style={{alignItems:'center',marginTop:scaleSize(18)}}>
							<TouchableOpacity
								onPress={() => {
									RouteHelper.navigate("ReportPage")
								}}
								style={{ flexDirection: "row", alignItems: 'center' }}>
								<Image source={images.common.report_icon}
									style={{ marginRight: scaleSize(7), width: scaleSize(13), height: scaleSize(13) }} />
								<Text style={{ fontSize: 10, color: 'rgba(112, 112, 112, 1)' }}>内容存在争议，我要举报该内容</Text>
								<Image 
								style={{width:scaleSize(3),height:scaleSize(6),tintColor:"#323232",marginLeft:scaleSize(5)}}
								source={images.common.arrow_right3} />
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
				{this.renderFooter()}
			</View>
		</SafeAreaViewPlus>
	}

}







var styles = {

}
