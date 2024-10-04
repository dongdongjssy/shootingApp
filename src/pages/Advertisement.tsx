import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, ImageBackground, Alert, Linking  } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../res/images';
import JMessage from 'jmessage-react-plugin';
import { UserStore } from '../store/UserStore'
import { scaleSize } from '../global/utils';
import ApiUrl from '../api/Url.js';
import request from '../api/Request';
import Axios from "axios";
import ResponseCodeEnum from '../constants/ResponseCodeEnum';
import { NavigationBar, ModalIndicator } from 'teaset';
import { Toast } from 'teaset';

// screen
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class Advertisement extends Component<any,any> {
	constructor(props) {
		super(props)
		this.state = {
			time: 5,
			advertisement: props.advertisement,
			loginuser: undefined,
			isOpen:true
		}
	}

	async componentDidMount() {
		let loginuser = await UserStore.getLoginUser()
		this.setState({
			loginuser: loginuser
		})
		this.startTimer()
	}

	startTimer() {
		let timeChange;
        let time = this.state.time;
        const clock = () => {
            if (time > 0) {
                //当time>0时执行更新方法
                time = time - 1;
                this.setState({
                    time: time,
                });
            } else {
                //当time=0时执行终止循环方法
                clearInterval(timeChange);
				if(this.state.isOpen){
				//当倒计时时间=0时，进入项目
				this.openApp();
				}

            }
        };
        //每隔一秒执行一次clock方法
        timeChange = setInterval(clock,1000);
	}

	async openApp() {
		this.setState({
			isOpen:false
		})
		const loginuser = await UserStore.getLoginUser()
		if (loginuser && loginuser.token) {
			UserStore.validateToken(loginuser.token).then(res => {
				console.log("validate token: ", res)
				if (res.code !== 200) {
					Alert.alert('', "登录已过期",
						[{ text: "去登陆", onPress: () => RouteHelper.reset("LoginPage") }],
						{ cancelable: false }
					)
				} else {
					// 登录极光IMs
					JMessage.login({
						username: loginuser.jgUsername,
						password: loginuser.jgUsername
					}, () => {
						console.debug("【极光】登录成功: ", loginuser.jgUsername)
					}, (error) => console.debug(error))

					RouteHelper.reset("MainPage")
				}
			}).catch(() => {
				RouteHelper.reset("LoginPage")
			})
		} else {
			RouteHelper.reset("LoginPage")
		}
	}

	imgLink(){
		const {advertisement,loginuser} = this.state;
		
		if (loginuser && loginuser.token) {
			UserStore.validateToken(loginuser.token).then(async res => {
				if (res.code !== 200) {
					Alert.alert('', "登录已过期",
						[{ text: "去登陆", onPress: () => RouteHelper.reset("LoginPage") }],
						{ cancelable: false }
					)
				} else {
					// 登录极光IMs
					JMessage.login({
						username: loginuser.jgUsername,
						password: loginuser.jgUsername
					}, () => {
						console.debug("【极光】登录成功: ", loginuser.jgUsername)
					}, (error) => console.debug(error))

					if(advertisement.contestId != -1){
						//关联赛事
						this.getDetailData(ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL, advertisement.contestId);
					}else if(advertisement.trainingId != -1){
						//关联培训
						this.getDetailData(ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL, advertisement.trainingId);
					}else if(advertisement.coachId != -1){
						//关联教官
						this.getDetailData(ApiUrl.SYSTEM_MESSAGE_COACH_DETAIL, advertisement.coachId);
					}else if(advertisement.judgeId != -1){
						//关联裁判
						this.getDetailData(ApiUrl.SYSTEM_MESSAGE_JUDGE_DETAIL, advertisement.judgeId);
					}else if(advertisement.recommendId != -1){
						//关联总会推荐
						this.getDetailData(ApiUrl.RECOMMEND_GET_DETAIL_BY_ID, advertisement.recommendId);
					}else if(advertisement.clubPostId != -1){
						//关联俱乐部动态
						this.getDetailData(ApiUrl.CLUB_POST_DETAIL_BY_ID, advertisement.clubPostId);
					}else if(advertisement.clubActivityId != -1){
						//关联俱乐部赛事
						this.getDetailData(ApiUrl.CLUB_ACTIVITY_BY_ID, advertisement.clubActivityId);
					}else if(advertisement.mediaUrl != ""){
						//外部链接
						Linking.openURL(advertisement.mediaUrl)
					}
				}
			}).catch(() => {
				RouteHelper.reset("LoginPage")
			})
		} else {
			RouteHelper.reset("LoginPage")
		}
	}

	async getDetailData(apiUrl, orderId) {
		ModalIndicator.show("获取数据")
		let result:any = {};
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
					RouteHelper.navigate("CommonActivityDetailPage", { detailData: result,entrance: 'boot' });
				} else {
					result.coachJudge = result
					result.mediaPath = ApiUrl.RECOMMEND_IMAGE
					// if (apiUrl === ApiUrl.SYSTEM_MESSAGE_COACH_DETAIL) result.pageText = "教官"
					// if (apiUrl === ApiUrl.SYSTEM_MESSAGE_JUDGE_DETAIL) result.pageText = "裁判"
					// else result.imageUrl = result.imageUrl ? ApiUrl.RECOMMEND_IMAGE + result.imageUrl : '';
					ModalIndicator.hide()
					RouteHelper.navigate("DynamicDetailPage", {
						item: result,
						type: "coachJudge",
						entrance: 'boot'
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
		const {advertisement} = this.state;
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center",position: 'relative' }}>
				<TouchableOpacity onPress={()=>this.imgLink()} style={{
					flex: 1,width: "100%", height: "100%"
				}}>
					<Image
					resizeMode='cover'
					source={{uri: ApiUrl.ADVETTISEMENT_IMAGE + advertisement?.pictureUrl}} 
					style={{ flex: 1,width: "100%", height: "100%" }} />
				</TouchableOpacity>
				
				<TouchableOpacity onPress={() => this.openApp()} style={styles.skip_btn}>
					<Text style={styles.skip_btn_text}>跳过</Text>
					<Text style={styles.skip_btn_text}>{this.state.time}</Text>
				</TouchableOpacity>
			</View>
		)
	}
}

var styles = {
	skip_btn: {
		width: scaleSize(80),
		height: scaleSize(35),
		borderRadius: scaleSize(20),
        alignItems: 'center',
        justifyContent: 'center',
		flexDirection: "row",
		borderColor: '#FFFFFF',
		borderWidth: scaleSize(1),
		position: 'absolute',
		top: scaleSize(40),
		right: scaleSize(20),
		cursor: 'pointer',
		backgroundColor: 'rgba(0,0,0,0.5)'
	},
	skip_btn_text: {
		color: '#FFFFFF',
		margin: scaleSize(10),
		fontSize: scaleSize(16)
	}
}