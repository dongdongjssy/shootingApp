import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast } from 'teaset';
import UINavBar from '../../components/UINavBar';
import { scaleSize } from '../../global/utils';
import { RELEASE_STATUS } from '../../global/constants';

export default class ActivityItem extends Component {
	constructor(props) {
		super(props)
		this.state = {
			statusText: ''
		}
	}

	render() {
		var { item, index, loginuser } = this.props;
		return <View style={{ marginHorizontal: scaleSize(10), marginTop: scaleSize(10), backgroundColor: "#fff" }}>
			<TouchableOpacity
				onPress={() => {
					RouteHelper.navigate("ActivityDetailPage", { detailData: item, loginuser: loginuser })
				}}
				style={{ width: scaleSize(355) }}
			>
				<ImageBackground
					source={{ uri: item.imageUrl }}
					style={{ height: scaleSize(150), padding: scaleSize(16), alignItems: 'center', justifyContent: "center" }}
					resizeMode="cover"
				>
				</ImageBackground>
				<Text style={{ fontSize: 16, fontFamily: 'PingFang SC', fontWeight: "700", color: '#000', marginTop:scaleSize(10), marginLeft:scaleSize(10)}}>{item.title}</Text>
			</TouchableOpacity>
			<View style={{ justifyContent: 'flex-start', marginTop: scaleSize(5), marginHorizontal: scaleSize(14) }}>
				{/* time */}
				{item.fkTableId === 2 ?
					<View style={{ flexDirection: 'row', marginTop: scaleSize(10), width: scaleSize(221) }}>
						<Image
							style={{ width: scaleSize(10), height: scaleSize(10), marginRight: scaleSize(4), marginTop: scaleSize(5) }}
							source={images.common.time} />
						<Text style={{ fontSize: 12, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
							{item.startDate.split(" ")[0]}
						</Text>
					</View> : null
				}

				<View style={{ flexDirection: "row", marginTop: scaleSize(10) }}>
					{
						item.fkTableId === 2 ?
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Image
									style={{ width: scaleSize(10), height: scaleSize(10), marginRight: scaleSize(4) }}
									source={images.common.contest_level} />
								<Text style={{ fontSize: 12, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
									{item.contestLevelCoeff.levelName}
								</Text>
							</View> :
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Image
									style={{ width: scaleSize(10), height: scaleSize(10), marginRight: scaleSize(4) }}
									source={images.common.time} />
								<Text style={{ fontSize: 12, color: "rgba(0,0,0,0.8)", fontWeight: '400' }}>
									{item.startDate.split(" ")[0]}
								</Text>
							</View>
					}
					<View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: scaleSize(40), position: 'absolute', right: scaleSize(20) }}>
						<Image
							style={{ width: scaleSize(10), height: scaleSize(10) }}
							source={images.common.cate} />
						<Text style={{ marginLeft: scaleSize(4), color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 12 }}>{item.course?.name}</Text>
						<View style={{ height: scaleSize(13), marginHorizontal: scaleSize(13), width: 1, backgroundColor: "#707070" }}></View>
						<Text style={{ color: "rgba(0,0,0,0.80)", fontWeight: "400", fontSize: 12 }}>{item.type?.name}</Text>
					</View>
				</View>
				<View style={{ flexDirection: 'row', marginVertical: scaleSize(10), width: scaleSize(221) }}>
					<Image
						style={{ width: scaleSize(11), height: scaleSize(11), marginTop: scaleSize(6), marginRight: scaleSize(4) }}
						source={images.common.location} />
					<Text style={{ lineHeight: scaleSize(24), color: "rgba(0,0,0,0.8)", fontWeight: "400" }}>{item.address}</Text>
				</View>
			</View>
		</View>
	}

}
