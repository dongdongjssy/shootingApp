import React, { Component, Fragment } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	Keyboard,
	TextInput,
	DeviceEventEmitter,
	Share,
	Dimensions, BackHandler
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { ModalIndicator, Toast } from 'teaset';
import UINavBar from '../../components/UINavBar';
import AutoSizeImage from '../../components/AutoSizeImage';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import HTMLView from 'react-native-htmlview';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView';
import ShareBoxModal from '../common/ShareBoxModal';
import request from '../../api/Request'
import ApiUrl from '../../api/Url.js';
import MediaShow from '../../components/MediaShow.js';
import Axios from "axios";
import WebViewHtmlView from '../../components/WebViewHtmlView';
import { ClientStatusEnum } from '../../global/constants';
import { UserStore } from '../../store/UserStore';
import { scaleSize } from '../../global/utils';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import FeebackBoxModal from '../common/FeebackBoxModal';
import UIConfirm from '../../components/UIConfirm';
import httpBaseConfig from '../../api/HttpBaseConfig';

const _scrollView = ScrollView | null | undefined;

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			type: props.type || "recommend",
			isRecommend: props.item.recommend ? true : false,
			isClubPost: props.item.clubPost ? true : false,
			isCoachJudge: props.item.coachJudge ? true : false,
			item: props.item,
			itemMain: props.item.recommend ? props.item.recommend : (
				props.item.post ? props.item.post : (
					props.item.clubPost ? props.item.clubPost : props.item.coachJudge)
			),
			inputText: "",
			isKeyboardShow: false,
			isCommentCompose: true,
			activeCommentDetails: null,
			loginuser: this.props.loginuser,
			result: '',
			isOpenComment: this.props.isOpenComment,
			isCoach: props.item.isCoach ? true : false,
			isInstructor: props.item.isInstructor ? true : false,
			entrance: props.entrance
		};
		this.layoutY = ''
	}

	componentWillMount(){
		setTimeout(() => {
			this._scrollView.scrollTo({x: 0, y: this.layoutY, animated: true})
		}, 1000)
	}

	async componentDidMount() {
		if (this.state.isOpenComment) {
			this.setState({ isKeyboardShow: true })
		}

		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

		await this.getUserLike()
		await this.getUserCollection()

		DeviceEventEmitter.addListener('userUpdated', (res) => {
			if (res.user) {
				console.debug("【监听回调，动态详情页】更新用户信息")
				this.setState({ loginuser: res.user },()=>{
					this.getComments()
				})
			}
		})
	}

	componentWillMount() {
		// //监听返回键
		BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();

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
		DeviceEventEmitter.emit("likeUpdated")
		return true;
	}

	_keyboardDidShow = (() => {
		this.setState({
			isKeyboardShow: true,
		})
	})

	_keyboardDidHide = (() => {
		this.setState({
			isKeyboardShow: false,
		})
	})

	getComments = async () => {
		ModalIndicator.show("获取评论")
		const fkTable = this.state.isRecommend ? 1 : (this.state.isClubPost ? 3 : (this.state.isInstructor ? 4 : (this.state.isCoach ? 5 : 2)))
		var params = {
			pd: {
				pageNum: 0,
				pageSize: 10
			},
			fkTable: fkTable
		}

		await Axios.post(ApiUrl.COMMENTS_LIST_ALL, params, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + this.state.loginuser.token,
				"id": this.state.itemMain.id
			}
		}).then(res => {
			if (res.data.code === ResponseCodeEnum.SUCCESS) {
				console.debug("一共" + res.data.rows.length + "条评论")
				this.state.itemMain.commentDetailsList = res.data.rows
				this.forceUpdate()
			}
			ModalIndicator.hide()
		}).catch(err => {
			ModalIndicator.hide()
			console.log(err)
		})
	}
	getRecommendDetails = async () => {
		ModalIndicator.show("获取详情内容")
		await request.post(ApiUrl.RECOMMEND_GET_DETAIL_BY_ID + this.state.itemMain.id).then(async (res) => {
			if (res.status === 200 && res.data && res.data.content) {
				this.state.itemMain.content = res.data.content
			}
			ModalIndicator.hide()
		}).catch(err => {
			ModalIndicator.hide()
			console.log(err)
		})
	}

	getUserLike = async () => {
		await request.post(ApiUrl.USER_LIKE_LIST, { clientUserId: this.state.loginuser.id }).then(async (res) => {
			if (res.status === 200) {
				if (res.data.rows) {
					var findUserLike = undefined
					if (this.state.isRecommend) {
						findUserLike = res.data.rows.find(ul => ul.likeId === this.state.itemMain.id && ul.likeType === "recommend")
					} else if (this.state.isClubPost) {
						findUserLike = res.data.rows.find(ul => ul.likeId === this.state.itemMain.id && ul.likeType === "clubPost")
					} else {
						findUserLike = res.data.rows.find(ul => ul.likeId === this.state.itemMain.id && ul.likeType === "post")
					}

					if (findUserLike) {
						this.state.itemMain.isUserLike = true
						this.state.itemMain.likeId = findUserLike.id
					} else {
						this.state.itemMain.isUserLike = false
					}
					this.forceUpdate()
				}
			}
		}).catch(err => {
			ModalIndicator.hide()
			console.log(err)
		})
	}

	getUserCollection = async () => {
		await request.post(ApiUrl.USER_COLLECTION_LIST, { client_user_id: this.state.loginuser.id }).then(async (res) => {
			if (res.status === 200) {
				if (res.data.rows) {
					var findUserCollection = undefined
					if (this.state.isRecommend) {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.itemMain.id && ul.collectionType === "recommend")
					} else if (this.state.isClubPost) {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.itemMain.id && ul.collectionType === "clubPost")
					} else if (this.state.isCoachJudge) {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.itemMain.id && ul.collectionType === "recommendCoach")
					} else if (!this.state.isCoachJudge) {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.itemMain.id && ul.collectionType === "recommendJudge")
					} else {
						findUserCollection = res.data.rows.find(ul => ul.collectionId === this.state.itemMain.id && ul.collectionType === "post")
					}

					if (findUserCollection) {
						this.state.itemMain.isCollect = true
						this.state.itemMain.collectionId = findUserCollection.id
					} else {
						this.state.itemMain.isCollect = false
					}
					this.forceUpdate()
				}
			}
		}).catch(err => {
			ModalIndicator.hide()
			console.log(err)
		})
	}

	renderRichTextSmallSize(content) {
		return (
			<HTMLView
				value={content}
				stylesheet={styles.contentSmall}
				renderNode={(node, index, siblings, parent, defaultRenderer) => {
					var attribs = node.attribs;
					if (node.name == 'img') {
						return <AutoSizeImage
							source={{ uri: "http://47.105.158.8:9007" + attribs.src }}
							style={{ padding: 0, margin: 0 }}
						/>
					}
				}}
			/>
		)
	}

	// 内容存在争议，我要举报该内容
	renderRichTextMediumSize(content) {
		const { width } = Dimensions.get('window');
		return <View style={{flexDirection:"column"}}>
			<WebViewHtmlView content={(content && content != "undefined" && content != "" && content.length != 0) ? content : ""} />
			{/* <View style={{alignItems:'center',marginTop:scaleSize(18),marginBottom:scaleSize(18)}}>
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
			</View> */}
		</View>	
	}

	renderAvatar(avatarUrl, isShowGuan) {
		return (
			<View style={{ width: scaleSize(36), height: scaleSize(36) }}>
				<Image
					style={{ width: scaleSize(36), height: scaleSize(36), borderRadius: scaleSize(36 / 2) }}
					source={{
						uri: avatarUrl ?
							(this.state.isClubPost ? ApiUrl.CLUB_IMAGE + avatarUrl : ApiUrl.CLIENT_USER_IMAGE + avatarUrl) :
							"http://static.boycodes.cn/shejiixiehui-images/dongtai.png"
					}}
				/>
				{isShowGuan &&
					<Image
						style={{
							position: "absolute",
							width: scaleSize(20),
							height: scaleSize(20),
							top: scaleSize(-10),
							right: scaleSize(-10)
						}}
						source={images.common.guan}
					/>
				}
			</View>
		);
	}

	renderNickname(nickname) {
		return (
			<Text style={{ fontSize: 14, color: "#000", fontWeight: "700" }}>
				{nickname}
			</Text>
		)
	}

	renderItemMainContent(itemMain, style, isShowCreateDate) {
		return (
			<View style={[style, { marginTop: scaleSize(10) }]}>
				{this.renderRichTextMediumSize(itemMain.content)}
				{/* {this.state.isRecommend || this.state.isCoachJudge ? null : this.renderVideoPlayerMediaShow(itemMain, isShowCreateDate)} */}
				{this.renderVideoPlayerMediaShow(itemMain, isShowCreateDate)}
				<View style={{ height: scaleSize(20) }}></View>
			</View>
		)
	}

	renderVideoPlayerMediaShow(itemMain, isShowCreateDate) {
		if (itemMain.video && itemMain.video != "undefined" && itemMain.video != "" && itemMain.video.length != 0) {
			return (
				<View>
					<MediaShow item={itemMain} propsDetail={true}/>
					{
						isShowCreateDate ? <Text style={{ color: "rgba(0,0,0,0.50)", fontWeight: '400', fontSize: 14 }}>{itemMain.createDate}</Text> : <Text></Text>
					}
				</View>
			);
		} else {
			return <View><MediaShow item={itemMain} propsDetail={true}/></View>;
		}
	}

	renderHeader() {
		var itemMain = this.state.itemMain;
		var rs = [];
		var avatarUrl = this.state.isClubPost ? itemMain.club.avatar : itemMain.clientUser.avatar;
		// render recommend header   推荐或者教官、裁判
		if (this.state.isRecommend || this.state.isCoachJudge) {
			// title
			if (itemMain.title) {
				rs.push(
					<View style={{ alignItems: 'center' }}>
						<Text style={{ fontSize: 22, lineHeight: scaleSize(34), fontWeight: "bold", color: "rgba(0,0,0,0.80)" }}>
							{itemMain.title}
						</Text>
					</View>
				)
			}

			if (!this.state.isCoachJudge) {
				// avatar, nichname, create time
				rs.push(
					<View style={{ flex: 1, flexDirection: 'row', marginTop: scaleSize(20) }}>
						{this.renderAvatar(avatarUrl, true)}
						<View style={{ flex: 1, marginLeft: scaleSize(16) }}>
							{itemMain.clientUser && itemMain.clientUser.nickname ? this.renderNickname(itemMain.clientUser.nickname) : ""}
							<Text style={{ fontSize: 14, fontWeight: '400', color: "rgba(0,0,0,0.50)", marginTop: scaleSize(2) }}>
								{itemMain.createTime}
							</Text>
						</View>
					</View>
				)
			}
			// content
			rs.push(this.renderItemMainContent(itemMain, { flex: 1 }, false))

			// render post header
		} else {
			// 俱乐部、动态

			var userRoleNameDescription = (itemMain.clientUser && itemMain.clientUser.remark) ? itemMain.clientUser.remark.split(':') : [];
			// avatar, nichname, role description
			rs.push(
				<TouchableOpacity style={{ flex: 1 }} onPress={() => {
					if (this.state.itemMain.club) {
						let item = this.state.itemMain
						item.club.clientUser = {}
						item.club.clientUser.avatar = item.club.avatar
						item.club.clientUser.nickname = item.club.title
						item.bgimg = ApiUrl.CLUB_IMAGE + item.club.image
						item.avatar = ApiUrl.CLUB_IMAGE + item.club.avatar

						RouteHelper.navigate("ClubDetailPage", {
							item: item,
							loginuser: this.state.loginuser
						});
					} else {
						UserStore.getLoginUser().then(user => {
							RouteHelper.navigate("UserCenterPage", {
								loginuser: user,
								user: this.state.itemMain.clientUser
							})
						})
					}

				}}>
					<View style={{ flex: 1, flexDirection: 'row', marginTop: scaleSize(20) }}>
						{this.renderAvatar(avatarUrl, false)}
						<View style={{ flex: 1, marginLeft: scaleSize(16) }}>
							<View style={{ flexDirection: "row" }}>
								{(itemMain.clientUser && itemMain.clientUser.nickname) ? this.renderNickname(itemMain.clientUser.nickname) : null}
							</View>
							<View style={{ flexDirection: 'row', flex: 1, marginLeft: scaleSize(0), marginTop: scaleSize(5) }}>
								{
									itemMain.clientUser && itemMain.clientUser.roles ?
										itemMain.clientUser.roles.slice(0, 3).map(role => {
											return (
												<View style={[styles.tag, { marginLeft: scaleSize(5), borderColor: '#FF9226' }]}>
													<Text style={[styles.tag_text, { color: "#FF9226" },]}>
														{role.name}
													</Text>
												</View>
											)
										}) :
										userRoleNameDescription.slice(0, 3).map(role => {
											return (
												<View style={[styles.tag, { marginLeft: scaleSize(5), borderColor: '#FF9226' }]}>
													<Text style={[styles.tag_text, { color: "#FF9226" }]}>
														{role}
													</Text>
												</View>
											)
										})
								}
								{
									itemMain.clientUser.roles && itemMain.clientUser.roles.length > 3 ?
									<View style={[styles.tag, { marginLeft: scaleSize(5), borderColor: '#FF9226' }]}>
										<Text style={[styles.tag_text, { color: "#FF9226" }]}>更多...</Text>
									</View> : (
										userRoleNameDescription && userRoleNameDescription.length > 3 ?
											<View style={[styles.tag, { marginLeft: scaleSize(5), borderColor: '#FF9226' }]}>
												<Text style={[styles.tag_text, { color: "#FF9226" }]}>更多...</Text>
											</View> : null
									)
								}
							</View>
							{/* <Text style={{ fontSize: 14, color: "rgba(0,0,0,0.50)", fontWeight: "400" }}>
								{userRoleNameDescription[1] ? userRoleNameDescription[1] : ''}
							</Text> */}
						</View>
					</View>
				</TouchableOpacity>
			)
			// content
			rs.push(this.renderItemMainContent(itemMain, { flex: 1, marginTop: scaleSize(12) }, true))
			rs.push(<Text style={{ fontSize: 14, color: "rgba(0,0,0,0.50)" }}>{itemMain.createTime}</Text>)
		}
		return (
			<ScrollView ref={(view) => { this._scrollView = view; }}>
				<Fragment>
					{/* header */}
					<View style={{ padding: scaleSize(15), backgroundColor: "#fff" }}>
						{rs}
					</View>
					{/* {this.state.isCoachJudge ? null : */}
					<View onLayout={event=>{this.layoutY = event.nativeEvent.layout.y}}>
						{/* separate grey line */}
						<View style={{ height: scaleSize(10), backgroundColor: "#F2F6F9" }}></View>

						{/* comment */}
						<View style={{ height: scaleSize(60), backgroundColor: '#fff', padding: scaleSize(15) }}>
							<Text style={{ fontSize: 18, color: "#000", fontWeight: "600" }}>评论（{this.state.item.commentDetailsList ? this.state.item.commentDetailsList.length : 0}）</Text>
						</View>
					</View>
					{/* } */}
				</Fragment>
			</ScrollView>
		)
	}

	renderCoachJudgeContent() {
		var itemMain = this.state.itemMain;

		return (
			<ScrollView style={{ padding: scaleSize(15), backgroundColor: "#fff" }}>
				<View style={{ alignItems: 'center' }}>
					<Text style={{ fontSize: 22, lineHeight: scaleSize(34), fontWeight: "bold", color: "rgba(0,0,0,0.80)" }}>
						{itemMain.title}
					</Text>
				</View>
				{this.renderItemMainContent(itemMain, {}, true)}
			</ScrollView>
		)
	}

	renderFeedback(feedbackList, commentDetails) {
		// if (this.state.isKeyboardShow) {
		// 	return this.renderComposeAndPublish();
		// }
		return (
			<View style={{ flex: 1 }}>

				{/* feedback image and text	*/}
				<TouchableOpacity
					onPress={() => {
						this.setState({
							isKeyboardShow: true,
							isCommentCompose: false,
							activeCommentDetails: commentDetails,
						})
					}}
					style={{
						flexDirection: 'row',
						marginTop: scaleSize(10)
					}}
				>
					<Image style={{ width: scaleSize(15), height: scaleSize(14), marginRight: scaleSize(10) }}
						source={images.common.write}
					/>
					<Text style={{ color: "#999999", fontSize: 12, fontWeight: "400" }}>回复 ({feedbackList.length})</Text>
					<TouchableOpacity 
					onPress={()=>{
							RouteHelper.navigate("ReportPage")
					}}
					style={{flexDirection:"row",alignItems:'center',position:'absolute',right:0}}>
						{/* <Image source={images.common.report_icon} 
						style={{ marginRight: scaleSize(7), width: scaleSize(13), height: scaleSize(13)}}/> */}
						<Text style={{ fontSize: 10, color:'rgba(112, 112, 112, 1)'}}>举报</Text>
					</TouchableOpacity>
				</TouchableOpacity>

				{/* feeback content */}
				{feedbackList.length ? <View style={{ backgroundColor: "#F2F6F9", padding: scaleSize(10), marginTop: scaleSize(10) }}>
					{
						feedbackList.length
							? feedbackList.map((commentFeedback, feedbackIndex) => {
								return (
									<TouchableOpacity
										key={feedbackIndex}
										style={{ marginTop: feedbackIndex > 0 ? scaleSize(10) : 0 }}
									>
										<Text style={{ color: '#D43D3E', fontSize: 12, fontWeight: "400" }}>
											{commentFeedback.clientUser.nickname}：{' '}
										</Text>
										{this.renderRichTextSmallSize(commentFeedback.content)}
										<TouchableOpacity
											onPress={() => {
												RouteHelper.navigate("ReportPage")
											}}
											style={{ flexDirection: "row", alignItems: 'center', position: 'absolute', right: 0 }}>
											{/* <Image source={images.common.report_icon}
												style={{ marginRight: scaleSize(7), width: scaleSize(13), height: scaleSize(13) }} /> */}
											<Text style={{ fontSize: 10, color: 'rgba(112, 112, 112, 1)' }}>举报</Text>
										</TouchableOpacity>
									</TouchableOpacity>
								)
							}) : null
					}
				</View> : null}
			</View>
		)
	}

	renderComment(commentDetails) {
		// if (!this.state.isCoachJudge) {

			const comment = commentDetails.comment;
			const avatarUrl = comment.clientUser.avatar;
			const feedbackList = commentDetails.commentFeedbackList;

			return (
				<View style={{ flexDirection: "row", paddingHorizontal: scaleSize(15), marginTop: scaleSize(10) }}>
					{/* avatar */}
					{this.renderCommentAvatar(avatarUrl)}
					<View style={{ flex: 1, marginLeft: scaleSize(16) }}>
						{/* nickname, create time */}
						<View style={{ height: scaleSize(37) }}>
							<Text style={{ color: "rgba(212,61,62,1)", fontSize: 12 }}>
								{comment.clientUser.nickname}
							</Text>
							<Text style={{ color: "rgba(0,0,0,0.50)", fontSize: 12, fontWeight: "400", marginTop: scaleSize(5) }}>
								{comment.createTime}
							</Text>
						</View>
						{/* comment content */}
						<HTMLView value={"<p>" + comment.content + "</p>"} stylesheet={styles.contentMedium} />
						{/* feedback				 */}
						{this.renderFeedback(feedbackList, commentDetails)}
					</View>
				</View>
			)
		// } else {
		// 	return <View></View>
		// }
	}

	renderCommentAvatar(avatarUrl) {
		return (
			<View style={{ width: scaleSize(36), height: scaleSize(36) }}>
				<Image
					style={{ width: scaleSize(36), height: scaleSize(36), borderRadius: scaleSize(36 / 2) }}
					source={{
						uri: avatarUrl ?
							(this.state.isClubPost ? ApiUrl.NEW_CLIENT_USER_IMAGE + avatarUrl : ApiUrl.NEW_CLIENT_USER_IMAGE + avatarUrl) :
							"http://static.boycodes.cn/shejiixiehui-images/dongtai.png"
					}}
				/>
			</View>
		);
	}


	updateRenderDataForCommentOrFeedback() {
		let nowDate = new Date();
		let timeString = nowDate.getHours() + ":" + nowDate.getMinutes() + ":" + nowDate.getSeconds();

		let inputJson = {
			"content": this.state.inputText,
			"clientUser": {
				"nickname": this.state.loginuser.nickname,
				"avatar": this.state.loginuser.avatar
			},
			"createTime": nowDate.toISOString().slice(0, 10) + ' ' + timeString
		}

		if (this.state.isCommentCompose) {
			let newItem = this.state.item;
			newItem.commentDetailsList.unshift({
				'comment': inputJson,
				'commentFeedbackList': []
			});

			let newItemMain = this.state.itemMain;
			newItemMain.commentCount += 1;
			this.setState({
				item: newItem,
				itemMain: newItemMain,
			});
		} else {
			let newactiveCommentDetails = this.state.activeCommentDetails;
			newactiveCommentDetails.commentFeedbackList.unshift(inputJson);
			this.setState({
				activeCommentDetails: newactiveCommentDetails,
			});
		}
	}

	callRestApiToSaveCommentOrFeedback() {
		let params = {
			"clientUserId": this.state.loginuser.id,
			"content": this.state.inputText,
		};
		if (this.state.isCommentCompose) {
			params['fkId'] = this.state.itemMain.id;
			params['fkTable'] = this.state.isRecommend ? 1 : (this.state.isClubPost ? 3 : (this.state.isInstructor ? 4 : (this.state.isCoach ? 5 : 2)))
		}
		else {
			params['commentId'] = this.state.activeCommentDetails.comment.id;
		}
		let restApiUrl = this.state.isCommentCompose ? ApiUrl.COMMENT_ADD : ApiUrl.FEEDBACK_ADD;
		request.post(restApiUrl, params).then(res => {
			if (res.status === 200) {
				DeviceEventEmitter.emit("commentAdded", { count: this.state.itemMain.commentCount })
			}
		}).catch(err => console.log(err));
	}

	// 发布评论内容
	renderComposeAndPublish() {
		return (<View
			style={{ flexDirection: "row" }}
		>
			<TextInput
				style={{ textAlignVertical: 'top', width: scaleSize(300), backgroundColor: "#fff", padding: scaleSize(10) }}
				// placeholder="说点什么"
				// value={this.state.inputText}
				multiline={true}
				autoFocus={true}
				onChangeText={(text) => {
					this.setState({
						inputText: text,
					})
				}}
			/>
			<TouchableOpacity
				onPress={() => {
					this.setState({
						isKeyboardShow: false,
					});
					this.updateRenderDataForCommentOrFeedback();
					this.callRestApiToSaveCommentOrFeedback();
				}}
				style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}
			>
				<Text style={{ color: '#D43D3E', fontSize: 12, fontWeight: "400" }}>发布</Text>
			</TouchableOpacity>
		</View>
		)
	}

	updateRenderDataForLikeCount() {
		let newItemMain = this.state.itemMain;
		newItemMain.likeCount += newItemMain.isZan ? 1 : -1;
		this.setState({
			itemMain: newItemMain,
		});
	}

	async updateLike() {
		const params = {
			clientUserId: this.state.loginuser.id,
			likeId: this.state.itemMain.id,
			likeType: this.state.isRecommend ? "recommend" : (this.state.isClubPost ? "clubPost" : (this.state.isInstructor ? "recommendCoach" : (this.state.isCoach ? "recommendJudge" : "post"))) // the likeCount is already updated by the above method
		}
		if (!this.state.itemMain.isUserLike) {
			await request.post(ApiUrl.USER_LIKE_ADD, params).then(res => {
				console.log('点赞'+JSON.stringify(res.data))
				if (res?.data?.code === 0) {
					this.state.itemMain.isUserLike = true
					this.state.itemMain.likeCount !== undefined ? this.state.itemMain.likeCount += 1 : null
					this.forceUpdate()
					this.getUserLike()
					DeviceEventEmitter.emit("likeUpdated", { id: this.state.itemMain.id, isLike: true })
				}else{
					message.info(res?.data?.msg)
				}
			}).catch(err => console.log(err));
		} else {
			await request.post(ApiUrl.USER_LIKE_REMOVE, params).then(res => {
				console.log('取消点赞'+JSON.stringify(res.data))
				if (res?.data?.code === 0) {
					this.state.itemMain.isUserLike = false
					this.state.itemMain.likeCount !== undefined ? this.state.itemMain.likeCount -= 1 : null
					this.forceUpdate()
					DeviceEventEmitter.emit("likeUpdated", { id: this.state.itemMain.id, isLike: false })
				}
			}).catch(err => console.log(err));
		}
	}

	//收藏
	addCollection() {
		let params = {
			"clientUserId": this.state.loginuser.id,
			"collectionId": this.state.itemMain.id,
			"collectionType": this.state.isRecommend ? "recommend" : (this.state.isClubPost ? "clubPost" : (this.state.isCoach ? "recommendCoach" : (!this.state.isCoach ? "recommendJudge" : "post"))) // the likeCount is already updated by the above method
		};

		if (this.state.itemMain.isCollect) {
			request.post(ApiUrl.USER_COLLECTION_ADD, params).then(res => {
				if (res.status === 200) {
					Toast.message("收藏成功")
					this.getUserCollection()
					this.props.refreshHomePage();
				}
			}).catch(err => console.log(err));
		} else {
			request.post(ApiUrl.USER_COLLECTION_DEL + this.state.itemMain.collectionId, {}).then(res => {
				if (res.status === 200) {
					Toast.message("取消收藏成功")
					this.props.refreshHomePage();
				}
			}).catch(err => console.log(err));
		}

		DeviceEventEmitter.emit("collectionUpdated")
	}

	renderFooterBar() {
		// if (!this.state.isCoachJudge && this.state.loginuser && this.state.loginuser.status === ClientStatusEnum.VERIFIED.code) {
			var itemMain = this.state.itemMain;

			if (this.state.isKeyboardShow) {
				return this.renderComposeAndPublish(null);
			}

			return (
				<View style={{ flexDirection: "row" }}>
					{/* 说点什么吧 */}
					<TouchableOpacity
						onPress={() => {
							if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
								UIConfirm.show("认证通过后可以评论")
								return
							}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
								UIConfirm.show("认证已过期，请及时续费")
								return
							}
							this.setState({
								isKeyboardShow: true,
								isCommentCompose: true,
							})
						}}
						style={{ height: scaleSize(40), width: scaleSize(140), backgroundColor: "#fff", borderRadius: scaleSize(4), flexDirection: "row", alignItems: 'center', paddingLeft: scaleSize(10) }}>
						<Image
							source={images.common.write}
							style={{ tintColor: "#999999", width: scaleSize(16), height: scaleSize(16), marginRight: scaleSize(10) }}
						/>
						<Text style={{ fontSize: 12, color: "#999" }}>说点什么吧</Text>
					</TouchableOpacity>

					{/* like */}
					<View style={{ width: scaleSize(20) }}></View>
					<TouchableOpacity
						onPress={() => {
							if(this.state.loginuser == null){
								UIConfirm.show("访客不可点赞")
								return
							}else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
								UIConfirm.show("认证通过后可以点赞")
								return
							}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
								UIConfirm.show("认证已过期，请及时续费")
								return
							}else{
								this.updateLike()
							}
						}}
						style={{ width: scaleSize(43), alignItems: 'center' }}>
						<Image
							resizeMode="contain"
							source={itemMain.isUserLike ? images.common.zan_active : images.common.zan}
							style={{ width: scaleSize(16), height: scaleSize(16) }}
						/>
						<Text style={styles.footer_text}>{itemMain.likeCount ? itemMain.likeCount : 0}</Text>
					</TouchableOpacity>

					{/* comment count */}
					<View style={{ width: scaleSize(10) }}></View>
					<TouchableOpacity
						onPress={() => {
							setTimeout(() => {
								this._scrollView.scrollTo({x: 0, y: this.layoutY, animated: true})
							}, 1000)
							if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
								UIConfirm.show("认证通过后可以评论")
								return
							}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
								UIConfirm.show("认证已过期，请及时续费")
								return
							}
							this.setState({
								isKeyboardShow: true,
								isCommentCompose: true,
							})
						}}
						style={{ width: scaleSize(43), alignItems: 'center' }}>
						<Image
							resizeMode="contain"
							source={images.common.comment} style={{ width: scaleSize(16), height: scaleSize(16) }}
						/>
						<Text style={styles.footer_text}>{itemMain.commentDetailsList?.length ? itemMain.commentDetailsList.length : 0}</Text>
					</TouchableOpacity>

					{/* 收藏 */}
					<View style={{ width: scaleSize(10) }}></View>
					<TouchableOpacity
						onPress={() => {
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
								itemMain.isCollect = !itemMain.isCollect;
								this.forceUpdate();
								this.addCollection();
							}
						}}
						style={{ width: scaleSize(43), alignItems: 'center' }}>
						<Image
							resizeMode="contain"
							source={itemMain.isCollect ? images.common.star_active : images.common.star} style={{ width: scaleSize(16), height: scaleSize(16) }}
						/>
						<Text style={styles.footer_text}>{itemMain.isCollect ? '已收藏' : "收藏"}</Text>
					</TouchableOpacity>

					{/* 分享 */}
					<View style={{ width: scaleSize(10) }}></View>
					<TouchableOpacity
						onPress={() => {
							//this.shareText();
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
								if (this.state.isRecommend === true) {
									ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain?.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}index?id=${this.state.itemMain.id}` })
								}else if(this.state.isInstructor){
									ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}instructor?id=${this.state.itemMain.id}` })
								}else if(this.state.isCoach){
									ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}referee?id=${this.state.itemMain.id}` })
								}else {
									if(this.props.type == 'post'){
										ShareBoxModal.show({ "title": this.state.itemMain.club?.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}dynamic?id=${this.state.itemMain.id}` })
									}else if(this.props.type == 'dynamic'){
										ShareBoxModal.show({ "title": this.state.itemMain.club?.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}post?id=${this.state.itemMain.id}` })
									}
									// ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": "http://zjw.tjjzshw.com/#/dynamic?id=" + this.state.itemMain.id })
								}
							}
						}}
						style={{ width: scaleSize(43), alignItems: 'center' }}>
						<Image
							resizeMode="contain"
							source={images.common.share} style={{ width: scaleSize(16), height: scaleSize(16) }}
						/>
						<Text style={styles.footer_text}>分享</Text>
					</TouchableOpacity>
				</View>
			)
		// }
	}

	shareText = () => {
		var shareLink;
		if (this.state.itemMain.video && this.state.itemMain.video != "") {
			shareLink = this.state.itemMain.mediaPath + this.state.itemMain.video;
		} else {
			shareLink = this.state.itemMain.content;
			//this.state.itemMain.mediaPath + this.state.itemMain["image" + 0];
		}
		Share.share({
			message: shareLink,
			url: this.state.itemMain.content,
			title: '动态',
		}, {
			dialogTitle: '分享动态到',
		})
			.then(this.showResult)
			.catch((error) => this.setState({ result: '错误提示: ' + error.message }));
	};

	//判断是否分享成功
	showResult = (result) => {
		if (result.action === Share.sharedAction) {
			if (result.activityType) {
				this.setState({ result: 'shared with an activityType: ' + result.activityType });
			} else {
				this.setState({ result: '分享成功' });
			}
		} else if (result.action === Share.dismissedAction) {
			this.setState({ result: '分享拒绝' });
		}
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20;

		// if (!this.state.isCoachJudge) {
			// if (this.state.isRecommends) await this.getRecommendDetails()
			await this.getComments()

			try {
				startFetch(this.state.itemMain.commentDetailsList, pageSize);
			} catch (err) {
				abortFetch();
			}
		// }
	};

	render() {
		var item = this.state.item;
		return <SafeAreaViewPlus style={{ flex: 1 }}>
			<UINavBar title={this.state.isRecommend ? "推荐" : (
				this.state.isClubPost ? "俱乐部动态" : (
					this.state.type === "coachJudge" ? "详情" : "射手动态")
			)} 
			leftView={
				<TouchableOpacity
					onPress={() => {
						if(this.state.entrance){
							RouteHelper.reset("MainPage")
						}else{
							RouteHelper.goBack();
						}
					}}
					style={{ flex: 1, marginLeft: scaleSize(6), alignItems: 'center', justifyContent: 'center' }}>
					<Image source={images.back}
						resizeMode="contain"
						style={{
							width: scaleSize(20),
							height: scaleSize(20),
							tintColor: '#FFFFFF'
						}} />
				</TouchableOpacity>
			}
			rightView={
				<TouchableOpacity onPress={() => {
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
						if (this.state.isRecommend === true) {
							FeebackBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}index?id=${this.state.itemMain.id}` })
						}else if(this.state.isInstructor){
							ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}instructor?id=${this.state.itemMain.id}` })
						}else if(this.state.isCoach){
							ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}referee?id=${this.state.itemMain.id}` })
						}else {
							if(this.props.type == 'post'){
								FeebackBoxModal.show({ "title": this.state.itemMain.club?.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}dynamic?id=${this.state.itemMain.id}` })
							}else if(this.props.type == 'dynamic'){
								FeebackBoxModal.show({ "title": this.state.itemMain.club?.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}dynamic?id=${this.state.itemMain.id}` })
							}
						}
					}
				}}>
					<Image style={{ width: scaleSize(22), height: scaleSize(22), marginRight: scaleSize(5) }} source={images.common.navi} />
				</TouchableOpacity>
			}/>
			<View style={{ height: scaleSize(1), backgroundColor: "#F2F6F9" }}></View>
			<View style={{ flex: 1 }}>

				{/* {!this.state.isCoachJudge ? */}
					<UltimateListView
						header={this.renderHeader.bind(this)}
						allLoadedText={"没有更多了"}
						waitingSpinnerText={'加载中...'}
						ref={ref => this.listView = ref}
						onFetch={this.onFetch.bind(this)}
						keyExtractor={(item, index) => `${index} -`}
						item={this.renderComment.bind(this)} // this takes three params (item, index, separator)       
						displayDate
						emptyView={() => {
							return <EmptyView />
						}}
					/>
					{/* : this.renderCoachJudgeContent()
				} */}

				{/* {(this.state.isCoachJudge || !this.state.loginuser || this.state.loginuser.status !== ClientStatusEnum.VERIFIED.code) ? null : */}
					<View style={{ flexDirection: "row", minHeight: scaleSize(60), alignItems: 'center', backgroundColor: "#F5F5F5", padding: scaleSize(10) }}>
						{this.renderFooterBar()}
					</View>
				{/* } */}
			</View>
			<KeyboardSpacer />
		</SafeAreaViewPlus>
	}

}



var styles = {
	footer_text: {
		fontSize: 12,
		color: "#999999",
		fontWeight: "400",
		marginTop: scaleSize(3),
	},
	contentSmall: {
		p: {
			fontSize: 12,
			color: "rgba(0,0,0,0.80)",
			lineHeight: scaleSize(14),
			flex: 1
		}
	},
	contentMedium: {
		p: {
			fontSize: 16,
			color: "#000",
			marginTop: scaleSize(5),
			lineHeight: scaleSize(20)
		}
	},
	// tag: {
	// 	// width: scaleSize(45),
	// 	height: scaleSize(15),
	// 	borderRadius: scaleSize(2),
	// 	borderWidth: ONE_PX,
	// 	borderColor: "#FF9226",
	// 	alignItems: 'center',
	// 	justifyContent: 'center',
	// 	padding: scaleSize(5)
	// },
	// tag_text: {
	// 	fontSize: scaleSize(9),
	// 	fontWeight: '400',
	// },
	tag: {
		// width: scaleSize(45),
		height: scaleSize(18),
		borderRadius: scaleSize(2),
		borderWidth: ONE_PX,
		borderColor: "#FF9226",
		alignItems: 'center',
		justifyContent: 'center',
		// padding: scaleSize(5),
		paddingHorizontal: scaleSize(5),
	},
	tag_text: {
		fontSize: scaleSize(9),
		fontWeight: '400',
		lineHeight:18
	},
}

