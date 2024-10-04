import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, DeviceEventEmitter, ImageBackground } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast } from 'teaset';
import UINavBar from '../../components/UINavBar';
import { scaleSize } from '../../global/utils';
import { RELEASE_STATUS } from '../../global/constants';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import Request from '../../api/Request';
import ApiUrl from '../../api/Url';

export default class ActivityItem extends Component {
	constructor(props) {
		super(props)
		this.state = {
			statusText: '',
			registerDetail: {}
		}

	}

	componentWillReceiveProps(props) {
		console.debug("receive update: ", props.releaseStatus)
		this.getStatusText(props.releaseStatus)
	}

	componentDidMount() {
		const { item, index, loginuser } = this.props;

		DeviceEventEmitter.addListener('baomingUpdated', (result) => {
			this.getStatusText(result)
		})

		this.getStatusText(item.releaseStatus)
	}

	getStatusText = (status) => {
		if (status == RELEASE_STATUS.IN_REVIEW.code) {
			this.setState({
				statusText: '审核中'
			})
		} else if (status == RELEASE_STATUS.TB_BE_PAID.code) {
			this.setState({
				statusText: '待支付'
			})
		} else if (status == RELEASE_STATUS.PAYMENT_TO_BE_CONFIRMED.code) {
			this.setState({
				statusText: '支付待确认'
			})
		} else if (status == RELEASE_STATUS.REGISTRATION_PASSED.code) {
			this.setState({
				statusText: '报名通过'
			})
		} else if (status == RELEASE_STATUS.REGISTRATION_FAILED.code) {
			this.setState({
				statusText: '报名失败'
			})
		}
	}

	getRegisterDetail = async () => {
		var { item, loginuser } = this.props;
		if (item.fkTableId == 1) {
			item.pageText = '认证/培训'
		} else if (item.fkTableId == 2) {
			item.pageText = '国内/际赛事'
		} else if (item.fkTableId == 3) {
			item.pageText = '俱乐部'
		}
		await Request.post(ApiUrl.REGISTER_GET_BY_ID + item.myActivityId).then(async (res) => {
			if (res.status == ResponseCodeEnum.STATUS_CODE) {
				this.setState({
					registerDetail: res.data
				}, () => {
					RouteHelper.navigate("RegisterPageDetail", {
						params: {
							fkId: item.myActivityId,
							fkTable: item.fkTableId,
							clientUserId: loginuser.id
						}, item: item, loginuser: loginuser, registerDetail: this.state.registerDetail
					})
				})
			}
		})
	}

	render() {
		var { item, loginuser } = this.props;
		return <View style={{ marginHorizontal: scaleSize(10), marginTop: scaleSize(10), backgroundColor: "#fff" }}>
			<TouchableOpacity
				onPress={() => {
					this.getRegisterDetail()
					// RouteHelper.navigate("RegisterPageDetail", { params: {
					// 	fkId: item.myActivityId,
					// 	fkTable: item.fkTableId,
					// 	clientUserId: loginuser.id
					// }, item: item, loginuser: loginuser,registerDetail: this.state.registerDetail })
				}}
				style={{ width: scaleSize(355) }}
			>
				<ImageBackground
					source={{ uri: item.imageUrl }}
					style={{ height: scaleSize(150), padding: scaleSize(16), alignItems: 'center', justifyContent: "center" }}
					resizeMode="cover"
				>
				</ImageBackground>
				<Text style={{ fontSize: 16, fontFamily: 'PingFang SC', fontWeight: "700", color: '#000', marginTop: scaleSize(10), marginLeft: scaleSize(10) }}>{item.title}</Text>

				<View style={{ justifyContent: 'flex-start', marginTop: scaleSize(5), marginHorizontal: scaleSize(14) }}>
					{/* time */}
					{item.fkTableId === 2 ?
						<View style={{ flexDirection: 'row', marginTop: scaleSize(10), width: scaleSize(221) }}>
							<Image
								style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4), marginTop: scaleSize(2) }}
								source={images.common.time} />
							<Text style={{ fontSize: 12, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
								{item.startDate?.split(" ")[0]}
							</Text>
						</View> : null
					}

					<View style={{ flexDirection: "row", marginTop: scaleSize(10) }}>
						{
							item.fkTableId === 2 ?
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<Image
										style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
										source={images.common.contest_level} />
									<Text style={{ fontSize: 12, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
										{item?.contestLevelCoeff?.levelName}
									</Text>
								</View> :
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<Image
										style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
										source={images.common.time} />
									<Text style={{ fontSize: 12, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
										{item.startDate?.split(" ")[0]}
									</Text>
								</View>
						}
						<View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: scaleSize(40), position: 'absolute', right: scaleSize(20) }}>
							<Image
								style={{ width: scaleSize(11), height: scaleSize(11) }}
								source={images.common.cate} />
							<Text style={{ marginLeft: scaleSize(4), color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 12 }}>{item.course?.name}</Text>
							<View style={{ height: scaleSize(13), marginHorizontal: scaleSize(13), width: 1, backgroundColor: "#707070" }}></View>
							<Text style={{ color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 12 }}>{item.type?.name}</Text>
						</View>
					</View>
					<View style={{ flexDirection: 'row', marginVertical: scaleSize(10), width: scaleSize(221) }}>
						<Image
							style={{ width: scaleSize(11), height: scaleSize(12), marginTop: scaleSize(6), marginRight: scaleSize(4) }}
							source={images.common.location} />
						<Text style={{ lineHeight: scaleSize(24), color: "rgba(0,0,0,0.8)", fontWeight: "400" }}>{item.address}</Text>
					</View>
					<View style={{ borderTopColor: '#e3e3e3', borderTopWidth: scaleSize(1), display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: scaleSize(10), paddingBottom: scaleSize(10), alignItems: 'center' }}>
						<Text style={{ fontSize: scaleSize(16), color: '#DB090A' }}> {this.state.statusText} </Text>
						{
							this.state.statusText == '待支付' && <TouchableOpacity
								onPress={() => {
									console.log('支付》》》》》》》》》》》》》》》'+JSON.stringify(item))
									RouteHelper.navigate("PaymentPage", { detailData: item, loginuser: loginuser })
								}}
								style={{
									width: scaleSize(80),
									height: scaleSize(30),
									marginLeft: scaleSize(15),
									alignItems: 'center', justifyContent: 'center', backgroundColor: "#D43D3E", borderRadius: scaleSize(4)
								}}>
								<Text style={{ color: "#fff", fontSize: scaleSize(16), fontWeight: "400" }}>去支付</Text>
							</TouchableOpacity>
						}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	}

}
