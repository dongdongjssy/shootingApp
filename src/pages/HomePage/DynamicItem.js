import React, { Component, Fragment } from 'react';
import { View, Image, Text, TouchableOpacity, ImageBackground, Alert, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images';
import { Toast } from 'teaset';
import ShareBoxModal from '../common/ShareBoxModal';
import httpBaseConfig from '../../api/HttpBaseConfig';
import ApiUrl from '../../api/Url.js';
import request from '../../api/Request';
import MediaShow from '../../components/MediaShow.js';
import Axios from 'axios';
import { UserStore } from '../../store/UserStore';
import { ClientStatusEnum } from '../../global/constants';
import { scaleSize } from '../../global/utils';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import HTMLView from 'react-native-htmlview';
import UIConfirm from '../../components/UIConfirm';
import { renderTimeDuration } from '../../global/DateTimeUtils';

export default class DynamicItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: props.loginuser,
			content: "",
			isCoachJudge: props.item.coachJudge ? true : false,
			isRecommend: props.item.recommend ? true : false,
			isClubPost: props.item.clubPost ? true : false,
			isPost: props.item.post ? true : false,
			itemMain: props.item.recommend ? props.item.recommend : (
				props.item.post ? props.item.post : (
					props.item.clubPost ? props.item.clubPost : props.item.coachJudge)
			),
			isShowClubTitle: props.isShowClubTitle === false ? false : true,
			isShowAd: props.isShowAd === false ? false : true,
			showFoot: props.showFoot === false ? false : true,
			isCoach: props.item.isCoach ? true : false,
			isInstructor: props.item.isInstructor ? true : false,
			item: props.item,
		};

		this.renderNode = this.renderNode.bind(this);
		this.content = "";

		UserStore.getLoginUser().then(user => {
			this.setState({ loginuser: user },()=>{
				this.getComments()
			})
		})

	}

	componentDidMount () {
		DeviceEventEmitter.addListener("commentAdded", (res) => {
			this.state.itemMain.commentCount = res.count
			this.forceUpdate()
			this.getComments()
		});

		DeviceEventEmitter.addListener('userUpdated', (res) => {
			if (res.user) {
				console.debug("【监听回调，动态页】更新用户信息")
				this.setState({ loginuser: res.user },()=>{
					this.getComments()
				})
			}
		})
	}

	//获取评论内容
	getComments = async () => {
		const fkTable = this.state.isRecommend ? 1 : (this.state.isClubPost ? 3 : (this.state.isInstructor ? 4 : (this.state.isCoach ? 5 : 2)))
		const params = {
			pd: {
				pageNum: 0,
				pageSize: 3
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
				this.state.itemMain.commentDetailsList = res.data.rows
				this.forceUpdate()
			}
		}).catch(err => {
			console.log(err)
		})
	}

	onShare() {
		if (this.state.isRecommend === true) {
			ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}index?id=${this.state.itemMain.id}` })
		}else if(this.state.isInstructor){
			ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}instructor?id=${this.state.itemMain.id}` })
		}else if(this.state.isCoach){
			ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}referee?id=${this.state.itemMain.id}` })
		}else {
			if(this.props.type == 'post'){
				ShareBoxModal.show({ "title": this.state.itemMain?.club?.title, "content": this.state.itemMain.contentShort,"shareUrl": `${httpBaseConfig.shareUrl}dynamic?id=${this.state.itemMain.id}`})
			}else if(this.props.type == 'dynamic'){
				ShareBoxModal.show({ "title": this.state.itemMain?.club?.title, "content": this.state.itemMain.contentShort, "shareUrl": `${httpBaseConfig.shareUrl}dynamic?id=${this.state.itemMain.id}`})
			}
			// ShareBoxModal.show({ "title": this.state.itemMain.title, "content": this.state.itemMain.contentShort, "shareUrl": "http://zjw.tjjzshw.com/#/post?id=" + this.state.itemMain.id })
		}
	}

	renderAvatar(avatarUrl) {
		return (
			<TouchableOpacity onPress={() => {
				if (this.state.itemMain?.club) {
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
							user: this.state.itemMain?.clientUser
						})
					})
				}
			}} style={{borderRadius: scaleSize(52)}}>
				<Image style={styles.avatar} source={{ uri: avatarUrl }} />
				{
					(this.state.isRecommend || this.state.itemMain?.coachJudge) ? <Image style={styles.guan} source={images.common.guan} /> : null
				}
			</TouchableOpacity>
		);
	}

	renderHeader() {
		var itemMain = this.state.itemMain;
		var index = this.props.index;
		var avatarUrl = ""
		if (itemMain?.club) {
			avatarUrl = itemMain?.club.avatar ?
				ApiUrl.CLUB_IMAGE + itemMain?.club?.avatar :
				"http://static.boycodes.cn/shejiixiehui-images/dongtai.png"
		} else {
			avatarUrl = itemMain?.clientUser.avatar ?
				ApiUrl.CLIENT_USER_IMAGE + itemMain?.clientUser.avatar :
				"http://static.boycodes.cn/shejiixiehui-images/dongtai.png";
		}
		//首页推荐
		if (this.state.isRecommend) {
			const RECOMMEND_CATES = ['公告', '资讯', '培训', '比赛'];
			return (
				<Fragment key={index}>
					{this.renderAvatar(avatarUrl)}
					<View style={[styles.nickname, { flex: 1 }]}>
						<Text>{itemMain?.clientUser && itemMain?.clientUser.nickname ? itemMain?.clientUser?.nickname : ""}</Text>
						<Text style={{color: '#646464'}}>{itemMain.createTime ? renderTimeDuration(itemMain.createTime) : ""}</Text>
					</View>
					{
						itemMain.category ?
							<TouchableOpacity style={styles.tag}>
								<Text style={[styles.tag_text, { color: "#FF9226" }]}>
									{RECOMMEND_CATES[itemMain.category - 1]}
								</Text>
							</TouchableOpacity> : null
					}
					{
						itemMain.onTop === 1 &&
						<TouchableOpacity style={[styles.tag, { marginLeft: scaleSize(5), borderColor: '#D43D3E' }]}>
							<Text style={[styles.tag_text, { color: "#D43D3E" }]}>
								置顶
							</Text>
						</TouchableOpacity>
					}
				</Fragment>
			)
		}
		//教官裁判
		if (this.state.itemMain?.coachJudge) {
			return (
				<Fragment key={index}>
					{this.renderAvatar(avatarUrl)}
					<Text style={[styles.nickname, { flex: 1 }]}>
						{itemMain?.clientUser && itemMain?.clientUser?.nickname ? itemMain?.clientUser?.nickname : ""}
					</Text>
					{
						itemMain.category === 2 ?
							<TouchableOpacity style={styles.tag}>
								<Text style={[styles.tag_text, { color: "#FF9226" }]}>
									{'培训'}
								</Text>
							</TouchableOpacity> : null
					}
					{
						itemMain.onTop === 1 &&
						<TouchableOpacity style={[styles.tag, { marginLeft: scaleSize(5), borderColor: '#D43D3E' }]}>
							<Text style={[styles.tag_text, { color: "#D43D3E" }]}>
								置顶
							</Text>
						</TouchableOpacity>
					}
				</Fragment>
			)
		}
		//会员动态、俱乐部
		if (!this.state.isRecommend) {
			var userRoleNameDescription = itemMain?.clientUser?.remark ? itemMain?.clientUser?.remark.split(':') : [];
			return (
				<Fragment key={index}>
					{this.renderAvatar(avatarUrl)}
					<TouchableOpacity style={{ flex: 1 }} onPress={() => {
						if (this.state.itemMain?.club) {
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
									user: this.state.itemMain?.clientUser
								})
							})
						}
					}}>
						{
							this.state.isClubPost ? 
							<View style={{ flexDirection: 'row', flex: 1,position: 'relative' }}>
								<View style={[styles.nickname]}>
									<Text style={{width: scaleSize(200)}} numberOfLines={1}>{(itemMain?.clientUser && itemMain?.clientUser.nickname) || (itemMain?.club && itemMain?.club?.title) || ""}</Text>
									<Text style={{color: '#646464'}}>{itemMain?.createTime ? renderTimeDuration(itemMain?.createTime) : ""}</Text>
								</View>
								{/* 已关注 */}
								{
									itemMain.remark == "已关注" && <View style={{alignItems: 'center',position: 'absolute',right: scaleSize(0),top: scaleSize(5)}}>
									<Image source={images.common.follow} style={{width: scaleSize(65),height: scaleSize(21)}} />
								</View>
								}
							</View>
							:
							<View style={{ flexDirection: 'row', flex: 1,position: 'relative' }}>
								<View style={[styles.nickname,this.state.isRecommend ? null : {flex: 1,flexDirection: 'row',justifyContent: 'space-between'}]}>
									<Text>{(itemMain?.clientUser && itemMain?.clientUser.nickname) || (itemMain?.club && itemMain?.club.title) || ""}</Text>
									<Text style={{color: '#646464'}}>{itemMain?.createTime ? renderTimeDuration(itemMain?.createTime) : ""}</Text>
								</View>
							</View>
						}
						
						<View style={{ flexDirection: 'row', flex: 1, marginLeft: scaleSize(10), marginTop: scaleSize(5) }}>
							{
								itemMain?.clientUser.roles ?
									itemMain?.clientUser.roles.slice(0, 3).map(role => {
										return (
											<View style={[styles.tag, { marginLeft: scaleSize(5), borderColor: '#FABB1B' }]}>
												<Text style={[styles.tag_text, { color: "#FABB1B" }]}>{role.name}</Text>
											</View>
										)
									}) :
									userRoleNameDescription.slice(0, 3).map(role => {
										return (
											<View style={[styles.tag, { marginLeft: scaleSize(5), borderColor: '#FF9226' }]}>
												<Text style={[styles.tag_text, { color: "#FF9226" }]}>{role}</Text>
											</View>
										)
									})
							}

							{
								itemMain?.clientUser?.roles && itemMain?.clientUser?.roles.length > 3 ?
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
					</TouchableOpacity>
				</Fragment >
			)
		}
	}

	renderNode = (node, index, sibling, parent, defaultRenderer) => {
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

			if (this.state.content.length > 40) {
				this.state.content = this.state.content.substr(0, 40)
				this.state.content += "..."
				this.forceUpdate()
				return
			}

			this.forceUpdate()
		}
	}

	async updateRenderData() {
		if (!this.state.itemMain.isUserRead) {
			await request.post(ApiUrl.USER_READ_ADD, {
				clientUserId: this.state.loginuser.id,
				readId: this.state.itemMain.id,
				readType: this.state.isRecommend ? "recommend" : (this.state.isClubPost ? "clubPost" : (this.state.isInstructor ? "recommendCoach" : (this.state.isCoach ? "recommendJudge" : "post")))
			}).then(res => {
				if (res.status === 200) {
					this.state.itemMain.readCount += 1;
					this.state.itemMain.isUserRead = true;
					this.forceUpdate()
				}
			})
		}
	}

	callRestApiToSaveData() {
		let params = {
			"id": this.state.itemMain.id,
			"readCount": this.state.itemMain.readCount // the readCount is already updated in the above method
		};
		let header = {
			headers: {
				'Content-Type': 'application/json',
			}
		};
		let restApiUrl = this.state.isRecommend ? ApiUrl.RECOMMEND_EDIT : ApiUrl.POST_EDIT;
		Axios.post(restApiUrl, params, header).then(res => {
			if (res.status === ResponseCodeEnum.STATUS_CODE) {
				this.props.refreshHomePage();
			}
		}).catch(err => console.log(err));
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
					this.state.itemMain.likeCount !== undefined ? this.state.itemMain.likeCount += 1 : 1
					this.forceUpdate()
				}else{
					message.info(res?.data?.msg)
				}
			}).catch(err => console.log(err));
		} else {
			await request.post(ApiUrl.USER_LIKE_REMOVE, params).then(res => {
				console.log('取消点赞'+JSON.stringify(res.data))
				if (res?.data?.code === 0) {
					this.state.itemMain.isUserLike = false
					this.state.itemMain.likeCount !== undefined ? this.state.itemMain.likeCount -= 1 : 0
					this.forceUpdate()
				}else{
					message.info(res?.data?.msg)
				}
			}).catch(err => console.log(err));
		}
	}

	render() {
		var index = this.props.index;
		var props = this.props;
		var result = [];
		this.imgUrl = [];
		this.state = {
			...this.state,
			isCoachJudge: props.item.coachJudge ? true : false,
			isRecommend: props.item.recommend ? true : false,
			isClubPost: props.item.clubPost ? true : false,
			itemMain: props.item.recommend ? props.item.recommend : (
				props.item.post ? props.item.post : (
					props.item.clubPost ? props.item.clubPost : props.item.coachJudge)
			),
			isShowClubTitle: props.isShowClubTitle === false ? false : true,
			isShowAd: props.isShowAd === false ? false : true,
			showFoot: props.showFoot === false ? false : true
		}

		var itemMain = this.state.itemMain;
		if (itemMain?.contentShort && itemMain?.contentShort != "undefined" && itemMain?.contentShort != "" && itemMain?.contentShort.length != 0) {

		} else if (this.state.isPost) {
			itemMain.contentShort = itemMain.content;
		}

		result.push(
			<View key={this.props.index}>
				<View style={{ 
					flex: 1, 
					padding: scaleSize(20), 
					backgroundColor: "#FFFFFF",
					borderTopWidth: scaleSize(1),
					borderBottomWidth: scaleSize(1),
					borderColor: '#EAEAEA',
				}}>
					{/* header */}
					{
						this.state.isShowClubTitle ?
							<View style={styles.user_head}>
								{this.renderHeader()}
							</View> : null
					}

					{/* content, create time */}
					{/* <View>
						<View style={{ height: scaleSize(10) }}></View>
						<Text style={styles.createTime}>{itemMain.createTime}</Text>
						<View style={{ height: 0 }}></View>
					</View> */}

					{/* media */}
					<TouchableOpacity
						onPress={async () => {
							this.props.onPress && this.props.onPress(this.props.item);
							this.updateRenderData();
							this.callRestApiToSaveData();
						}}
					>
						<View style={{marginBottom: scaleSize(10)}}>
							{
								(this.state.isRecommend || this.state.isCoachJudge) &&
								<View>
									<View style={{ height: scaleSize(10) }}></View>
									<Text style={styles.title}>{itemMain.title}</Text>
									<View style={{ height: 0 }}></View>
								</View>
							}
							{/* <HTMLView value={itemMain.content || ""} renderNode={this.renderNode} /> */}
							{
								itemMain?.contentShort ?
									<View>
										<Text style={styles.content}>
											{
												itemMain?.contentShort.length > 40 ?
													itemMain?.contentShort.substring(0, 40) + "..." :
													(itemMain?.contentShort !== "undefined" ? itemMain?.contentShort : null)
											}
										</Text>
									</View> : null
							}
						</View>

						<MediaShow
							item={itemMain}
							onPress={async () => {
								this.props.onPress && this.props.onPress(this.props.item);
								this.updateRenderData();
								this.callRestApiToSaveData();
							}}
							isCoachJudge={this.state.isCoachJudge}
							isRecommend={this.state.isRecommend}
							isClubPost={this.state.isClubPost}
						/>
						<View style={{ height: scaleSize(0) }}></View>
					</TouchableOpacity>

					{/* foot */}
					{
						this.state.showFoot ?
							<View style={styles.foot}>
								{/* {
							(this.state.loginuser && itemMain.post && this.state.loginuser.userName === itemMain.post.clientUser.userName) ?
								<Image style={{ width: scaleSize(54), height: scaleSize(18) }}
									source={itemMain.post.status === 0 ? images.mine.post_review :
										(itemMain.post.status === -1 ? images.mine.post_reject : images.mine.post_pass)}
								/> : null
						} */}
								<TouchableOpacity style={[styles.foot_item,{marginLeft: scaleSize(-10)}]} onPress={() => {
									if(this.state.loginuser == null){
										UIConfirm.show("访客不可评论")
										return
									}else if((this.state.loginuser?.status == ClientStatusEnum.NOT_VERIFIED.code || this.state.loginuser?.status == ClientStatusEnum.IN_REVIEW.code)){
										UIConfirm.show("认证通过后可以评论")
										return
									}else if((this.state.loginuser?.status == ClientStatusEnum.RENEWAL_USER.code)){
										UIConfirm.show("认证已过期，请及时续费")
										return
									}else{
										this.props.onPress && this.props.onPress(this.props.item, true)
									}
								}}>
									<Image source={images.common.comment} style={styles.icon} />
									<Text style={styles.foot_text}>{itemMain?.commentCount ? itemMain?.commentCount : 0}</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.foot_item} onPress={() => {
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
								}}>
									<Image source={itemMain.isUserLike ? images.common.zan_active : images.common.zan} style={styles.icon} />
									<Text style={styles.foot_text}>{itemMain.likeCount ? itemMain.likeCount : 0}</Text>
								</TouchableOpacity>
								<View style={styles.foot_item}>
									<Image source={images.common.eye} style={[styles.icon,{width: scaleSize(18)}]} />
									<Text style={styles.foot_text}>{itemMain.readCount ? itemMain.readCount : 0}</Text>
								</View>
								<TouchableOpacity
									onPress={() => {
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
											this.onShare();
										}
									}}
									style={[styles.foot_item,{marginRight: scaleSize(-10)}]}>
									<Image source={images.common.share} style={styles.icon} />
								</TouchableOpacity>
							</View> : null
					}

					{/* 列表展示两条评论 */}
					<TouchableOpacity onPress={()=>{
						RouteHelper.navigate("DynamicDetailPage", {
							loginuser: this.state.loginuser,
							item: this.state.item,
							type: this.state.activeType,
							refreshHomePage: () => this.refreshPage(),
							isOpenComment: false,
						});
					}}>
						<View style={{backgroundColor: '#F5F6F8',paddingLeft: scaleSize(10),paddingRight: scaleSize(10)}}>
							{
								itemMain?.commentDetailsList?.slice(0,2).map((item,index)=>{
									const comment = item.comment;
									const avatarUrl = comment.clientUser.avatar;
									return (
										<View style={{paddingBottom: scaleSize(10),paddingTop: scaleSize(10),borderBottomColor: '#E5E5E5',borderBottomWidth: index==0?scaleSize(1):0,display: 'flex',justifyContent: 'space-between',flexDirection: 'row'}}>
											<Image
												style={{ width: scaleSize(40), height: scaleSize(40), borderRadius: scaleSize(40 / 2),marginRight: scaleSize(0) }}
												source={{
													uri: avatarUrl ?
														(this.state.isClubPost ? ApiUrl.NEW_CLIENT_USER_IMAGE + avatarUrl : ApiUrl.NEW_CLIENT_USER_IMAGE + avatarUrl) :
														"http://static.boycodes.cn/shejiixiehui-images/dongtai.png"
												}}
											/>
											<View style={{display: 'flex',width: scaleSize(260)}}>
												<View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',marginTop: scaleSize(2)}}>
													<Text style={{fontSize: scaleSize(12),width: scaleSize(130)}} numberOfLines={1}>{comment.clientUser.nickname}</Text>
													<Text style={{fontSize: scaleSize(12)}}>{renderTimeDuration(comment.createTime)}</Text>
												</View>
												{/* comment content */}
												{/* <HTMLView value={"<p>" + comment.content + "</p>"} stylesheet={styles.contentMedium} /> */}
												<Text numberOfLines={2}>{comment.content}</Text>
											</View>
										</View>
									)
								})
							}
							{
								itemMain?.commentDetailsList?.length > 2 && <Text style={{lineHeight: scaleSize(30),textAlign: 'center'}}>更多评论>></Text>
							}
						</View>
					</TouchableOpacity>

				</View>
				{
					itemMain.adMediaUrl && this.state.isShowAd ?
						<TouchableOpacity style={{ height: scaleSize(110) }}
							onPress={() => {
								var itemData = {
									title: itemMain.adTitle,
									content: itemMain.adContent,
									mediaUrl: ApiUrl.ADS_IMAGE + itemMain.adMediaUrl
								}
								RouteHelper.navigate("SysytemNotificationDetailPage", { itemData: itemData })
							}}>
							<ImageBackground source={{ uri: ApiUrl.ADS_IMAGE + itemMain.adMediaUrl }} style={{ flex: 1 }}>
								<View style={[styles.tag, styles.ad_tag]}>
									<Text style={[styles.tag_text, { color: "#F2F6F9" }]}>广告</Text>
								</View>
								{
									itemMain.adTitle ?
										<Text style={styles.ad_title}>{itemMain.adTitle}</Text> : null
								}
							</ImageBackground>

							{/* <Image source={{ uri: ApiUrl.RECOMMEND_IMAGE + itemMain.adMediaUrl }} style={{ flex: 1 }} />
							<View style={[styles.tag, styles.ad_tag]}>
								<Text style={[styles.tag_text, { color: "#F2F6F9" }]}>广告</Text>
							</View>
							{
								itemMain.adTitle ?
									<Text style={styles.ad_title}>{itemMain.adTitle}</Text> : null
							} */}
						</TouchableOpacity> : (
							index + 1 != this.props.listData.length ?
								<View style={{ backgroundColor: "#F2F6F9", height: scaleSize(15) }}></View> : null
						)
				}
			</View>
		)

		return result
	}

}

var styles = {
	user_head: {
		height: scaleSize(40),
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: scaleSize(52),
		height: scaleSize(52),
		borderRadius: scaleSize(52 / 2),
	},
	guan: {
		width: scaleSize(20),
		height: scaleSize(20),
		position: "absolute",
		right: scaleSize(-10),
		top: scaleSize(-10),
	},
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
	},
	nickname: {
		fontWeight: '500',
		color: "#000000",
		fontSize: 14,
		marginLeft: scaleSize(16),
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: "rgba(0,0,0,0.80)",
		fontFamily: "PingFang SC"
	},
	createTime: {
		color: "rgba(0,0,0,0.50)",
		fontSize: 14,
		fontWeight: '400',
	},
	content: {
		color: 'rgba(0,0,0,0.80)',
		fontWeight: "400",
		fontSize: 16,
		marginTop: scaleSize(10)
	},
	icon: {
		width: scaleSize(16),
		// height:scaleSize(18),
		resizeMode: "contain",
	},
	foot: {
		flexDirection: 'row',
		alignItems: 'center',
		height: scaleSize(40),
		borderBottomWidth: 1,
		borderColor: '#E5E5E5',
		marginBottom: scaleSize(10),
		paddingTop: scaleSize(20),
		paddingBottom: scaleSize(20)
	},
	foot_item: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		flex: 1,
	},
	foot_text: {
		fontSize: 14,
		color: "rgba(0,0,0,0.80)",
		marginLeft: scaleSize(10),
	},
	ad_tag: {
		position: 'absolute',
		right: scaleSize(15),
		top: scaleSize(10),
		borderColor: '#F2F6F9',
		borderWidth: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.2)'
	},
	ad_title: {
		position: 'absolute',
		top: scaleSize(40),
		left: scaleSize(30),
		fontSize: 20,
		fontFamily: "PingFang SC",
		fontWeight: "800",
		color: "#F2F6F9",
	},
	contentMedium: {
		p: {
			marginTop: scaleSize(5),
			numberOfLines: 2,
			overflow: 'hidden'
		}
	},
}