import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native'
import { Carousel, Toast, ModalIndicator } from 'teaset';
import ApiUrl from '../../api/Url.js';
import LoadingImage from '../../components/LoadingImage';
import { RouteHelper } from 'react-navigation-easy-helper';
import request from '../../api/Request'
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import { scaleSize } from '../../global/utils.js';

export default class HeaderCarsousel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			launcher_img: [],
			//carouselList: props.carouselList,
		};
	}


	render() {
		let { carouselList,isGoodsDetail } = this.props;
		// console.debug("carousel list: ", carouselList)

		return (
			<View style={{ height: isGoodsDetail?scaleSize(375):scaleSize(156), width: "100%" }}>
				{carouselList?.length> 0 ? <Carousel
					control={true}
					style={{ height:isGoodsDetail?scaleSize(375):scaleSize(156) }}
				>
					{
						carouselList.map((carousel, carouselIndex) => {
							// console.warn("ApiUrl.CAROUSEL_IMAGE + carousel.mediaUrl",ApiUrl.CAROUSEL_IMAGE + carousel.mediaUrl);
							return (
								<TouchableOpacity
									key={carouselIndex}
									onPress={async () => {
										console.log("mediaType = " , carousel.mediaType);
										if (carousel.mediaType == 1) {
											// var user = await UserStore.getLoginUser();
											let item = { "content": carousel.title, "htmlContent": carousel.subTitle }
											RouteHelper.navigate("SysytemNotificationDetailPage", { itemData: item, from: "carousel" });
										} else if (carousel.mediaType == 2) {
											this.getDetailData(ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL, carousel.contestId);
										} else if (carousel.mediaType == 3) {
											this.getDetailData(ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL, carousel.trainingId);
										} else if (carousel.mediaType == 4) {
											this.getDetailData(ApiUrl.SYSTEM_MESSAGE_COACH_DETAIL, carousel.coachId);
										} else if (carousel.mediaType == 5) {
											this.getDetailData(ApiUrl.SYSTEM_MESSAGE_JUDGE_DETAIL, carousel.judgeId);
										}else if (carousel.mediaType == 6) {
											this.getDetailData(ApiUrl.SYSTEM_RECOMMEND_GET_DETAIL_BY_ID, carousel.recommendId);
										}
									}}
									style={{ flex: 1 }}
								>
									{
										//商城banner图
										carousel?.goodsType ==1&&<TouchableOpacity onPress={()=>{
											if(carousel?.goodsId){
												RouteHelper.navigate("GoodsDetailPage", {goodsId:carousel?.goodsId})
											}else{
												RouteHelper.navigate("GoodsBannerDetailPage", {carousel:carousel})
											}
										}}>
												<LoadingImage
												style={{ height: scaleSize(156), width: "100%" }} resizeMode='cover'
												source={{ uri: ApiUrl.GOODSBANNER_IMAGE + carousel.mediaUrl }} />
										</TouchableOpacity>
									}
									{
										//商品图
										carousel?.goodsType ==2&&<LoadingImage
										style={{ height: scaleSize(375), width: "100%" }} resizeMode='cover'
										source={{ uri: ApiUrl.GOODS_IMAGE + carousel.mediaUrl }} />
									}
									{
										//不是商城的
										carousel?.goodsType?null:<LoadingImage
										style={{ height: scaleSize(156), width: "100%" }} resizeMode='cover'
										source={{ uri: ApiUrl.CAROUSEL_IMAGE + carousel.mediaUrl }} />
									}

								</TouchableOpacity>
							)
						})
					}
				</Carousel> : null}
			</View>
		)
	}

	async getDetailData(apiUrl, orderId) {
		ModalIndicator.show("获取数据")
		var result = {};
		let res = await request.post(apiUrl + '/' + orderId, {})
		if (res.status === ResponseCodeEnum.STATUS_CODE) {
			result = res.data;
			if (result) {
				// var user = await UserStore.getLoginUser();
				if (apiUrl === ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL || apiUrl === ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL) {
					if (apiUrl === ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL) result.imageUrl = result.imageUrl ? ApiUrl.TRAINING_IMAGE + result.imageUrl : '';
					if (apiUrl === ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL) result.imageUrl = result.imageUrl ? ApiUrl.CONTEST_IMAGE + result.imageUrl : '';

					result.startDate = this.extractDate(result.startDate);
					result.endDate = this.extractDate(result.endDate);
					result.enrollDeadline = this.extractDate(result.enrollDeadline);
					result.area = result.area.name;
					result.course = result.course.name;
					result.shootType = result.type.name;
					// result.pageText = this.state.pageText;
					// result.fkTableId = props.fkTableId;
					if (apiUrl === ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL) {result.pageText = "培训"; result.fkTableId = 1}
					if (apiUrl === ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL) {result.pageText = "赛事"; result.fkTableId = 2}
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

}


/*
<Image
style={{ height: scaleSize(156), width: "100%" }} resizeMode='cover'
	source={{ uri: ApiUrl.CAROUSEL_IMAGE + carousel.mediaUrl }}
/>
*/




