import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	ImageBackground
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast } from 'teaset';
import UINavBar from '../../components/UINavBar';

export default class ClubItem extends Component {
	constructor(props) {
		super(props);
	}


	render() {
		var { item, index } = this.props;
		// console.debug(item.club.isUserFollow)
		return (
			<TouchableOpacity
				onPress={() => {
					item.club.clientUser = {}
					item.club.clientUser.avatar = item.club.avatar
					item.club.clientUser.nickname = item.club.title
					RouteHelper.navigate("ClubDetailPage", {
						item: item,
						loginuser: this.props.loginuser
					});
				}}
				style={{
					flex: 1,
					height: scaleSize(150),
					flexDirection: 'row',
					alignItems: 'center',
					marginBottom: scaleSize(15)
				}}>
				<ImageBackground
					source={{ uri: item.bgimg }}
					style={{ flex: 1, height: scaleSize(150), resizeMode: "cover", padding: scaleSize(16) }}
					resizeMode="cover"
				>
					{item.club.isUserFollow ?
						<View style={{
							borderWidth: 1,
							borderRadius: scaleSize(2),
							minWidth: scaleSize(53),
							height: scaleSize(25),
							position: "absolute",
							right: scaleSize(16), top: scaleSize(16),
							borderColor: "#D43D3E", alignItems: 'center', justifyContent: "center"
						}}>
							<Text style={{ fontSize: 14, fontWeight: "400", color: "#D43D3E", textAlign: 'center' }}>{"已关注"}</Text>
						</View> : null
					}

					<View style={{ height: scaleSize(44), flexDirection: "row", }}>
						<Image
							style={{ width: scaleSize(44), height: scaleSize(44), borderRadius: scaleSize(44 / 2) }}
							source={{ uri: item.avatar }} />
						<View style={{
							flex: 1,
							marginLeft: scaleSize(16)
						}}>
							<Text style={{ color: "#fff", fontWeight: 'bold', fontSize: 16, fontFamily: "PingFang SC" }}>{item.name}</Text>
							<Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "400" }}>{item.city}</Text>
						</View>
					</View>
					{
						item?.cate && <View style={{
						borderWidth: 1,
						borderRadius: scaleSize(2),
						minWidth: scaleSize(53),
						height: scaleSize(25),
						position: "absolute",
						left: scaleSize(16), bottom: scaleSize(16),
						borderColor: "#fff", alignItems: 'center', justifyContent: "center"
					}}>
						<Text style={{ fontSize: 14, fontWeight: "400", color: "#fff" }}>{item?.cate}</Text>
					</View>
					}
					
				</ImageBackground>
			</TouchableOpacity>
		)
	}

}







var styles = {

}
