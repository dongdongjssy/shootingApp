import React, { Component } from 'react';
import {
	StyleSheet,
	ScrollView,
	Alert,
	View,
	Platform,
	Text,
	ActivityIndicator,
	ProgressBarAndroid,
	ActivityIndicatorIOS,
	Image,
	RefreshControl,
	TouchableOpacity
} from 'react-native';
import {
	ListRow,
	Toast,
	Badge,
	Input,
	Button,
	SearchInput,
	NavigationBar,
	Checkbox,
	Overlay
} from 'teaset'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx';
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images';

export default {
	show(options = {}) {
		// console.log("show Overlay")
		var overlay_key = null;
		let overlayView = (
			<Overlay.PullView
				// type={'zoomIn'}
				side="bottom"
				style={{ alignItems: 'center', justifyContent: 'center' }}
			>
				<View style={{ backgroundColor: '#fff', width: SCREEN_WIDTH, padding: scaleSize(8), height: scaleSize(220) }}>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
						<TouchableOpacity onPress={() => {
							Overlay.hide(overlay_key);
							RouteHelper.navigate("CameraRollPage", {
								assetType: "Photos",
								maxSize: 9,
								callback: (imgs) => {
									// console.log('a', imgs);
									RouteHelper.replace("DynamicAddPage", {
										imgs: imgs,
										assetType: "Photos",
									})
								}
							})
						}} style={styles.share_item}>
							<Image style={styles.share_icon} source={images.dynamic.photo} />
							<Text style={styles.share_text}>图文</Text>
						</TouchableOpacity>

						<TouchableOpacity onPress={() => {
							Overlay.hide(overlay_key);
							RouteHelper.navigate("CameraRollPage", {
								assetType: "Videos",
								maxSize: 1,
								callback: (videos) => {
									// console.log('videos', videos);
									RouteHelper.replace("DynamicAddPage", {
										video: videos[0],
										assetType: "Videos",
									})
								}
							});
						}} style={styles.share_item}>
							<Image style={styles.share_icon} source={images.dynamic.video} />
							<Text style={styles.share_text}>视频</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						onPress={() => {
							Overlay.hide(overlay_key);
						}}
						style={styles.foot_btn}>
						<Text style={{ fontSize: 16, fontWeight: "400", color: '#D43D3E' }}>取消</Text>
					</TouchableOpacity>
				</View>
			</Overlay.PullView>
		);
		overlay_key = Overlay.show(overlayView);
	}
}

var styles = StyleSheet.create({
	title: {
		fontSize: setSpText(15),
		fontWeight: 'bold',
		lineHeight: 30
	},
	foot_btn: {
		height: scaleSize(70),
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	head_img: {
		width: scaleSize(397),
		height: scaleSize(191),
		position: "absolute",
		top: scaleSize(-191),
		left: scaleSize(60),
	},
	share_icon: {
		width: scaleSize(50),
		height: scaleSize(50)
	},
	share_item: {
		flex: 1,
		alignItems: 'center',
		justifyContent: "center",
	},
	share_text: {
		color: 'rgba(0,0,0,0.80)',
		fontSize: 16,
		fontWeight: '400',
		marginTop: scaleSize(6),
	}
})





