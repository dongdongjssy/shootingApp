import React, { Component, Fragment } from 'react';
import { View, Image, Text, ScrollView, TextInput, TouchableOpacity, ImageBackground, Alert, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast, ModalIndicator } from 'teaset';
import UINavBar from '../../components/UINavBar';
import store from '../../store'
import Url from '../../api/Url'
import axios from 'axios'
import RNFS from 'react-native-fs';
import RNVideoHelper from 'react-native-video-helper';
import RNThumbnail from 'react-native-thumbnail';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export default class DynamicAddPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			imgs: this.props.imgs,
			video: this.props.video,
			content: '',
			loginuser: undefined
		};

		store.UserStore.getLoginUser().then(user => this.setState({ loginuser: user }))
	}

	getTitle() {
		if (this.props.assetType == 'Photos') {
			return '发布图文'
		} else {
			return '发布视频'
		}
	}

	delImg(index) {
		this.state.imgs.splice(index, 1);
		this.forceUpdate();
	}

	renderImgs() {
		if (this.props.assetType == 'Photos') {
			return this.state.imgs.map((item, index) => {
				return <View style={styles.imgItem} key={index}>
					<Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%" }} />
					<TouchableOpacity
						onPress={this.delImg.bind(this, index)}
						style={{
							position: "absolute",
							right: scaleSize(-20),
							top: scaleSize(-20),
							zIndex: 999,
							alignItems: "center",
							justifyContent: 'center',
							width: scaleSize(50),
							height: scaleSize(50),
						}}
					>
						<Image
							source={images.common.close}
							style={{
								width: scaleSize(20),
								height: scaleSize(20),
							}}
						/>
					</TouchableOpacity>
				</View>
			})
		}
	}

	pushDynamic() {// 发布动态;
		if (!this.state.content) {
			Alert.alert("", "不说点什么吗？",
				[
					{ text: "再想想", onPress: () => { } },
					{ text: "发布", onPress: () => this.submitPost() },
				],
				{ cancelable: false }
			)
		} else {
			this.submitPost()
		}
	}

	submitPost() {
		if(this.posting){
			return;
		}
		this.posting=true;
		console.debug("发布...")
		var submitForm = new FormData()

		submitForm.append("userId", this.state.loginuser.id)
		submitForm.append("content", this.state.content);
		if (this.state.imgs) {
			ModalIndicator.show("发布中")
			let next = false;
			for (var i = 0; i < this.state.imgs.length; i++) {
				var image = this.state.imgs[i]
				console.log('image>>>>>>>>>>>>>>'+JSON.stringify(image))
				let uploadFile = {
					uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
					type: "application/octet-stream",
					name: 'aaaaaa.jpg'
				}
				// if(image.fileSize > 400000){
				// 	Toast.info("您选择得图片过大")
				// 	ModalIndicator.hide()
				// 	return false;
				// }else{
					submitForm.append("image" + (i + 1) + "File", uploadFile)
					// next = true
				// }
			}
			// if(next == true){
				return this.submitPostHandler(submitForm);
			// }
		}

		if (this.state.video) {
			ModalIndicator.show("视频上传中，请不要关闭页面")
			// return this.submitPostHandler(submitForm);
				RNVideoHelper.compress(this.state.video.uri, {
					quality: 'high', // default low, can be medium or high
				})
				// .progress(value => {
				// 	console.log('progress', value); // Int with progress value from 0 to 1
				// 	Toast.message("视频压缩:"+(value*100).toFixed(0)+'%')
				// })
				.then(async (compressedUri) => {
					// this.posting=false;
					// Toast.message("视频压缩:100%")
					
					// var fileInfo = await RNFS.stat('file://'+compressedUri);
					console.log('compressedUri', compressedUri); // String with path to temporary compressed video
					// this.state.video.uri= compressedUri;
					
					// this.state.video.compressedUri='file://'+compressedUri;
					this.state.video.uri ='file://'+compressedUri;
					// this.forceUpdate();
					// var videoType = this.state.video.filename?.split(".")[1]
					let uploadFile = {
						uri: Platform.OS === 'android' ? this.state.video.uri : this.state.video.uri.replace('file://', ''),
						type: "video/"+(getExtName(this.state.video.filename)||"mp4"),
						name: this.state.video.filename,
					}
					let uploadCoverFile = {
						uri: Platform.OS === 'android' ? this.state.video.videoCover : this.state.video.videoCover.replace('file://', ''),
						// type: "application/octet-stream",
						type: "application/octet-stream",
						name: "videoCover.png",
					}
					submitForm.append("videoFile", uploadFile);
					// submitForm.append("videoCoverFile", uploadCoverFile);
					return this.submitPostHandler(submitForm);

				}).catch(err=>{
					this.posting=false;
				});
		}

		// console.debug("submit form: ", submitForm)
	}
	submitPostHandler(submitForm){
		console.debug(submitForm)
		axios({
			method: 'POST',
			url: Url.POST_ADD,
			headers: {
				Authorization: 'Bearer ' + this.state.loginuser.token,
				'Content-Type': 'multipart/form-data',
			},
			data: submitForm
		}).then(res=>{
			console.log(res.data);	
			this.posting=false;
			if (res.data.code === 0) {
				DeviceEventEmitter.emit("postAdded")
				ModalIndicator.hide()
				Toast.success("发布成功")
				RouteHelper.goBack()
			} else {
				ModalIndicator.hide()
				Toast.info("发布出错，请重试")
			}
		}).catch(err=>{
			this.posting=false;
			Toast.error("发布出错，请重试")
			console.debug(err)
			ModalIndicator.hide()
		})
		// fetch(Url.POST_ADD, {
		// 	method: 'POST',
		// 	headers: {
		// 		Authorization: 'Bearer ' + this.state.loginuser.token,
		// 		'Content-Type': 'multipart/form-data',
		// 	},
		// 	body: submitForm
		// }).then(res => {
		// 	return res.json()
		// }).then(res => {
		// 	this.posting=false;
		// 	console.debug('>>>>>>>'+JSON.stringify(res))
		// 	if (res.code === 0) {
		// 		DeviceEventEmitter.emit("postAdded")
		// 		ModalIndicator.hide()
		// 		Toast.success("发布成功")
		// 		RouteHelper.goBack()
		// 	} else {
		// 		ModalIndicator.hide()
		// 		Toast.info("发布出错，请重试")
		// 	}
		// }).catch(err => {
		// 	this.posting=false;
		// 	console.debug("发布出错")
		// 	console.debug(err)
		// 	ModalIndicator.hide()
		// })
	}


	renderVideo() {
		if (!this.state.video) return null;
		return <View style={{ width: '100%', alignItems: 'center' }}>
			<TouchableOpacity
				onPress={() => {
					RouteHelper.navigate("VideoShowPage", {
						url: this.state.video.uri,
						rightView: (
							<TouchableOpacity
								onPress={() => {
									RouteHelper.goBack();
									this.state.video = null;
									this.forceUpdate()
								}}
								style={{ width: scaleSize(50) }}>
								<Text style={{ color: PRIMARY_COLOR, fontSize: 18 }}>删除</Text>
							</TouchableOpacity>
						)
					})
				}}
				style={{
					height: scaleSize(226),
					width: scaleSize(345),
				}}>
				<ImageBackground
					style={{
						width: scaleSize(345),
						height: scaleSize(226),
						alignItems: 'center',
						justifyContent: 'center',
					}}
					source={{ uri: this.state.video.uri }}
				>
					<View style={{ width: "100%", height: '100%', position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.3)" }}>
					</View>
					<Image
						style={{ width: scaleSize(60), height: scaleSize(60) }}
						source={images.common.video_play} />
				</ImageBackground>
			</TouchableOpacity>
		</View>
	}

	render() {
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
			<UINavBar
				leftView={<TouchableOpacity
					onPress={() => {
						RouteHelper.goBack();
					}}
					style={{ width: scaleSize(57), height: scaleSize(29), borderRadius: scaleSize(4), marginRight: scaleSize(8), alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ fontSize: 18, color: "rgba(0,0,0,0.60)" }}>取消</Text>
				</TouchableOpacity>}
				rightView={<TouchableOpacity
					onPress={this.pushDynamic.bind(this)}
					style={{ width: scaleSize(57), height: scaleSize(29), backgroundColor: PRIMARY_COLOR, borderRadius: scaleSize(4), marginRight: scaleSize(8), alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: "#fff", fontSize: 14, fontWeight: '400' }}>发布</Text>
				</TouchableOpacity>}
				title={this.getTitle()} />
			<View style={{ flex: 1 }}>
				<View style={{ padding: scaleSize(11) }}>
					<TextInput
						multiline={true}
						placeholder="请输入"
						style={{ minHeight: scaleSize(138), textAlignVertical: 'top', color: "rgba(0,0,0,0.80)", fontSize: 18 }}
						onChangeText={(text) => this.setState({ content: text })}
					/>
				</View>
				<ScrollView>
					<View style={{ flexDirection: 'row', flexWrap: "wrap" }}>
						{(this.props.assetType == 'Photos' && this.state.imgs.length < 9) ? <TouchableOpacity
							onPress={() => {
								RouteHelper.navigate("CameraRollPage", {
									assetType: "Photos",
									maxSize: 9 - this.state.imgs.length,
									callback: (imgs) => {
										RouteHelper.goBack();
										// console.log('a', imgs);
										this.state.imgs = this.state.imgs.concat(imgs);
										this.forceUpdate();
									}
								})
							}}
							style={styles.imgItem} >
							<Image source={images.common.camera} style={{ width: scaleSize(32), height: scaleSize(32) }} />
						</TouchableOpacity> : null}
						{(this.props.assetType == 'Videos' && !this.state.video) ? <TouchableOpacity
							onPress={() => {
								RouteHelper.navigate("CameraRollPage", {
									assetType: "Videos",
									maxSize: 1,
									callback: async (videos) => {
										RouteHelper.goBack();
										// alert("11");s
										// console.log('a',imgs);
// <<<<<<< HEAD
										
										// var fileInfo = await RNFS.stat(this.state.video.uri);
										// setTimeout(()=>{
											
											// console.log("this.state.video",this.state.video);
											this.state.video = videos[0];
											this.forceUpdate();
											RNThumbnail.get(videos[0].uri).then((result) => {
												this.state.video.videoCover = result.path;
												  console.warn(result.path); // thumbnail path
												  
												})



										// file:///data/user/0/com.cpsa/cache/Camera/99f1e7f2-a925-4f40-980a-1952f309a900.mp4
										// {"deviceOrientation": 1, "isRecordingInterrupted": false, "uri": "file:///data/user/0/com.cpsa/cache/Camera/c8a0da8e-6ffd-4d33-aac2-bc57ac1f4e8c.mp4", "videoOrientation": 1}
										// file:///data/user/0/com.cpsa/cache/Camera/c8a0da8e-6ffd-4d33-aac2-bc57ac1f4e8c.mp4
										// {"ctime": 2020-05-30T16:44:02.000Z, "isDirectory": [Function isDirectory], "isFile": [Function isFile], "mode": undefined, "mtime": 2020-05-30T16:44:02.000Z, "originalFilepath": "/data/user/0/com.cpsa/cache/Camera/129e0bbc-3113-4d6c-84d9-01f55851a417.mp4", "path": "file:///data/user/0/com.cpsa/cache/Camera/129e0bbc-3113-4d6c-84d9-01f55851a417.mp4", "size": 12478394}
										
									}
								})
							}}
							style={styles.imgItem} >
							<Image source={images.common.video} style={{ width: scaleSize(32), height: scaleSize(32) }} />
						</TouchableOpacity> : null}
						{this.renderImgs()}
						{this.props.assetType == 'Videos' ? this.renderVideo() : null}
					</View>
				</ScrollView>
			</View>
		</View>
	}

}

var styles = {
	imgItem: {
		alignItems: 'center',
		justifyContent: 'center',
		width: scaleSize(110),
		height: scaleSize(110),
		backgroundColor: "#fff",
		margin: scaleSize(6)
	}
}