import React, { Component } from 'react';
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
import { UserStore } from '../../../store/UserStore';

@inject('UserStore') //注入；
@observer
export default class CommonActivityItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			launcher_img: [],
			isMatch: props.isMatch,
			loginuser: undefined,
		};
		this.UserStore = this.props.UserStore;

		UserStore.getLoginUser().then(user => {
			this.setState({ loginuser: user })
		})
	}

	async componentDidMount() {

	}

	render() {
		var { item } = this.props;
		return (
			<View style={{ marginHorizontal: scaleSize(10), marginTop: scaleSize(15) }}>
				{/* time */}
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(10),position: 'relative' }}>
					<View style={{ width: scaleSize(15),height: scaleSize(15),backgroundColor: item.color,marginRight: scaleSize(10) }}></View>
					<Text style={{ fontSize: 14, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
						{item.startDate} - {item.endDate}
					</Text>
					{
						item.recommend == 1 && <View style={{ flexDirection: 'row', alignItems: 'center',position: 'absolute',right: scaleSize(0) }}>
						<Image
							style={{ width: scaleSize(14), height: scaleSize(13), marginRight: scaleSize(4) }}
							source={images.common.Vector} />
						<Text style={{ color: "#FF0000" }}>本月推荐</Text>
					</View>
					}
				</View>
				
				<TouchableOpacity
					// Redirect to details page
					onPress={() => {
						if(this.state.isMatch){
							RouteHelper.navigate("CommonActivityDetailPage", {
								detailData: item,
							});
						}else{
							RouteHelper.navigate("MatchRankListPage", { 
								loginuser: this.state.loginuser, 
								contestId: item.id 
							});
						}
					}}
					style={{ width: scaleSize(325),backgroundColor: "#fff",marginLeft: scaleSize(25),padding: scaleSize(10) }}>
					{/* 名称 */}
					<Text style={{ fontSize: 16, fontFamily: 'PingFang SC', fontWeight: '700', color: '#000', marginHorizontal: scaleSize(5) }}>{item.title}</Text>

					{/* address */}
					<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scaleSize(10) }}>
						<Image
							style={{ width: scaleSize(11), height: scaleSize(12), marginRight: scaleSize(4) }}
							source={images.common.location} />
						<Text style={{ lineHeight: scaleSize(24), color: "rgba(0,0,0,0.8)", fontWeight: "400" }}>{item.address}</Text>
					</View>
					
					<View style={{ flexDirection: 'row',marginTop: scaleSize(10),position: 'relative' }}>
						<View style={{ flexDirection: 'row', alignItems: 'center'  }}>
							{/* course:科目 */}
							<Image
								style={{ width: scaleSize(11), height: scaleSize(11) }}
								source={images.common.cate} />
							<Text style={{ marginLeft: scaleSize(4), color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 14 }}>{item.course}</Text>
							{/* shooting type */}
							<View style={{ height: scaleSize(13), marginHorizontal: scaleSize(13), width: 1, backgroundColor: "#707070" }}></View>
							<Text style={{ color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 14 }}>{item.shootType}</Text>
						</View>

						{/* level：级别 */}
						<View style={{ flexDirection: 'row', alignItems: 'center',position: 'absolute',right: scaleSize(0) }}>
							<Image
								style={{ width: scaleSize(11), height: scaleSize(11), marginRight: scaleSize(4) }}
								source={images.common.contest_level} />
							<Text style={{ fontSize: 14, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
								{item.contestLevelCoeff.levelName}
							</Text>
						</View>
					</View>
					
				</TouchableOpacity>
			</View>
		)
	}

}







var styles = {

}
