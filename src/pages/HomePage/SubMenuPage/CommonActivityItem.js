import React, { Component, Fragment } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ImageBackground
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../../res/images';
import { scaleSize } from '../../../global/utils';
import Moment from 'moment';
import { renderTimeDuration } from '../../../global/DateTimeUtils';
import ApiUrl from '../../../api/Url';

@inject('UserStore') //注入；
@observer
export default class CommonActivityItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			launcher_img: [],
			isShowClubTitle: props.isShowClubTitle === false ? false : true,
			itemMain: props.item.recommend ? props.item.recommend : (
				props.item.post ? props.item.post : (
					props.item.clubPost ? props.item.clubPost : props.item.coachJudge)
			),
		};
		this.UserStore = this.props.UserStore;
	}

	async componentDidMount() {
	}

	renderHeader() {
		var itemMain = this.state.itemMain;
		var index = this.props.index;
		var avatarUrl = (itemMain && itemMain.club && itemMain.club.avatar) ?
			ApiUrl.CLUB_IMAGE + itemMain.club.avatar : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png"
		return (
			<Fragment key={index}>
				<TouchableOpacity onPress={() => {
					let item = this.state.itemMain ? this.state.itemMain : {}
					item.club.clientUser = {}
					item.club.clientUser.avatar = item.club.avatar
					item.club.clientUser.nickname = item.club.title
					item.bgimg = ApiUrl.CLUB_IMAGE + item.club.image
					item.avatar = ApiUrl.CLUB_IMAGE + item.club.avatar

					RouteHelper.navigate("ClubDetailPage", {
						item: item,
						loginuser: this.state.loginuser
					});

				}}>
					<Image style={styles.avatar} source={{ uri: avatarUrl }} />
				</TouchableOpacity>
				<TouchableOpacity style={{ display: 'flex',justifyContent: 'space-around',width: scaleSize(280) }} onPress={() => {
					let item = this.state.itemMain ? this.state.itemMain : {}
					item.club.clientUser = {}
					item.club.clientUser.avatar = item.club.avatar
					item.club.clientUser.nickname = item.club.title
					item.bgimg = ApiUrl.CLUB_IMAGE + item.club.image
					item.avatar = ApiUrl.CLUB_IMAGE + item.club.avatar

					RouteHelper.navigate("ClubDetailPage", {
						item: item,
						loginuser: this.state.loginuser
					});
				}}>
					<View style={{ display: 'flex',flexDirection: 'row',alignItems: 'center' }}>
						<View style={[styles.nickname]}>
							<Text style={{ width: scaleSize(200) }} numberOfLines={1}>{(itemMain && itemMain.clientUser && itemMain.clientUser.nickname) || (itemMain && itemMain.club && itemMain.club.title) || ""}</Text>
							<Text style={{ color: '#646464' }}>{itemMain && itemMain.createTime ? renderTimeDuration(itemMain.createTime) : ""}</Text>
						</View>
						{/* 已关注 */}
						{
							itemMain && itemMain.remark == "已关注" && <Image source={images.common.follow} style={{ width: scaleSize(65), height: scaleSize(21) }} />
						}
					</View>
				</TouchableOpacity>
			</Fragment>
		)
	}

	render() {
		var { item } = this.props;
		return (
			<View style={{ backgroundColor: "#fff", marginBottom: scaleSize(15), padding: scaleSize(20) }}>
				{/* header */}
				{
					this.state.isShowClubTitle ?
						<View style={styles.user_head}>
							{this.renderHeader()}
						</View> : null
				}
				<TouchableOpacity
					// Redirect to details page
					onPress={() => {
						RouteHelper.navigate("CommonActivityDetailPage", {
							detailData: item,
						});
					}}
					style={{ width: scaleSize(335),position: 'relative' }}>
					{/* 名称 */}
					
					<ImageBackground
						source={{ uri: item.imageUrl }}
						style={{ height: scaleSize(158), padding: scaleSize(16), alignItems: 'center', justifyContent: "center" }}
						resizeMode="cover"
						imageStyle={{borderRadius: scaleSize(5)}}>
						{/* item.recommend   1是0否 */}
						{
							item.fkTableId === 1 && item.recommend == 1 && <Image style={{ width: scaleSize(50),height: scaleSize(30), position: 'absolute',top: scaleSize(-3),left: scaleSize(10) }}
							source={images.common.recommend} />
						}
					</ImageBackground>
					<Text style={{ fontSize: 16, fontFamily: 'PingFang SC', fontWeight: '700', color: '#000', marginTop: scaleSize(10) }}>{item.title}</Text>
				</TouchableOpacity>

				<View style={{ marginTop: scaleSize(10), paddingBottom: scaleSize(10) }}>
					{/* address */}
					<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaleSize(0) }}>
						<Image
							style={{ width: scaleSize(11), height: scaleSize(12), marginRight: scaleSize(4) }}
							source={images.common.location} />
						<Text style={{ lineHeight: scaleSize(24), color: "rgba(0,0,0,0.8)", fontWeight: "400" }}>{item.address}</Text>
					</View>

					<View style={{ display: 'flex', flexDirection: 'row',justifyContent: 'space-between',marginTop: scaleSize(3) }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaleSize(5), marginBottom: scaleSize(5) }}>
							<Image
								style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
								source={images.common.time} />
							<Text style={{ fontSize: 14, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>培训日期</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							{/* course:科目 */}
							<Image
								style={{ width: scaleSize(11), height: scaleSize(11) }}
								source={images.common.cate} />
							<Text style={{ marginLeft: scaleSize(4), color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 14 }}>{item.course}</Text>
							{/* shooting type */}
							<View style={{ height: scaleSize(13), marginHorizontal: scaleSize(13), width: 1, backgroundColor: "#707070" }}></View>
							<Text style={{ color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 14 }}>{item.shootType}</Text>
						</View>
					</View>

					{/* time */}
					{/* fkTableId=1 认证/培训，fkTableId=2 国内/际赛事 */}
					{item.fkTableId === 2 ?
						<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaleSize(5) }}>
							<Image
								style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
								source={images.common.time} />
							<Text style={{ fontSize: 14, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
								{item.startDate} - {item.endDate}
							</Text>
						</View> : null
					}

					{item.fkTableId === 2 ?
						<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaleSize(5) }}>
							<Image
								style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
								source={images.common.contest_level} />
							<Text style={{ fontSize: 14, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
								{item.contestLevelCoeff.levelName}
							</Text>
						</View> :
						<>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
								{
									item.schedules ?
										item.schedules.slice(0, 3).map(s => {
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

								{
									item.schedules && item.schedules.length > 3 ?
										<Text style={{
											backgroundColor: '#FFFCDF',
											fontSize: 12,
											color: "rgba(0,0,0,0.8)",
											padding: scaleSize(8),
											margin: scaleSize(5)
										}}>更多</Text> : null
								}
							</View>

						</>
					}

				</View>
			</View>
		)
	}

}







var styles = {
	user_head: {
		height: scaleSize(40),
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: scaleSize(10)
	},
	avatar: {
		width: scaleSize(52),
		height: scaleSize(52),
		borderRadius: scaleSize(52 / 2),
	},
	nickname: {
		fontWeight: '500',
		color: "#000000",
		fontSize: 14,
		marginLeft: scaleSize(16),
	},
}
