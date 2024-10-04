import React, { Component } from 'react';
import { View, TouchableOpacity, ImageBackground, Image, StyleSheet, Dimensions, Text } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import ApiUrl from '../api/Url.js';
import Video from 'react-native-video'
import { images } from '../res/images'
import LoadingImage from './LoadingImage';
// import RNThumbnail from 'react-native-thumbnail';
import { thumbnail } from '../global/Oss';
import { scaleSize } from '../global/utils.js';


// screen
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

@observer
export default class MediaShow extends Component {
	constructor(props) {
		super(props);


		this.state = {
			imgUrls: [],
			videoUrl: undefined,
			volume: 1,
			muted: false,
			resizeMode: 'contain',
			duration: 0.0,
			currentTime: 0.0,
			paused: true,
			propsDetail: props.propsDetail
		}

		this.buildImageUrlArray = this.buildImageUrlArray.bind(this)
		this.buildVideoUrl = this.buildVideoUrl.bind(this)
	}

	componentDidMount() {

	}

	buildImageUrlArray() {

		var imgUrls = []

		for (var i = 1; i <= 9; i++) {
			if (this.item["image" + i]) {
				imgUrls.push({ url: this.item.mediaPath + this.item["image" + i] })
			}
		}

		this.state.imgUrls = imgUrls
		// this.setState({ imgUrls: imgUrls })
	}

	buildVideoUrl() {
		if (this.item.video && this.item.video != "") {
			// console.warn("aaa",this.item);
			this.state.videoUrl = this.item.mediaPath + this.item.video
			// this.setState({
			// 	videoUrl: this.item.mediaPath + this.item.video
			// },()=>{
			// 	if(!this.item.videoCover){
			// 		// RNThumbnail.get(this.state.videoUrl).then((result) => {
			// 		// 	this.item.videoCover=result.path;
			// 		// 	this.forceUpdate();
			// 		// // this.state.video.videoCover = result.path;
			// 		//   // console.warn(result.path); // thumbnail path
			// 		// })
			// 	}
			// });
		}
	}

	onLoad = (data) => {
		this.setState({ duration: data.duration });
	};

	onProgress = (data) => {
		this.setState({ currentTime: data.currentTime });
	};

	onEnd = () => {
		this.setState({ paused: true })
		this.player.seek(0)
	};

	onAudioBecomingNoisy = () => {
		this.setState({ paused: true })
	};

	render() {
		this.item = this.props.item;
		this.buildImageUrlArray()
		this.buildVideoUrl()
		return (
			<View style={{ marginTop: scaleSize(2), flexDirection: 'row', flexWrap: "wrap" }}>
				{
					this.state.imgUrls.map((img, index) => {
						return (
							<TouchableOpacity
								style={{ margin: scaleSize(3), marginLeft: index % 3 == 0 ? 0 : scaleSize(3), }}
								key={index}
								onPress={() => {
									if (this.props.onPress) {
										return this.props.onPress(index);
									}
									RouteHelper.navigate("BigImageShowPage", {
										defaultIndex: index,
										imgs: this.state.imgUrls,
									})
								}}
							>
								<LoadingImage
									source={{ uri: this.state.propsDetail ? img.url + thumbnail(360, 180) : img.url + thumbnail(345, 180) }}
									style={(this.state.imgUrls.length === 1 && !this.item.isSmallImage) ?
										{
											height: this.state.propsDetail ? scaleSize(180) : scaleSize(170),
											width: this.state.propsDetail ? scaleSize(345) : scaleSize(335),
											maxWidth: this.state.propsDetail ? scaleSize(360) : scaleSize(345),
											minWidth: this.state.propsDetail ? scaleSize(345) : scaleSize(106),
											borderRadius: scaleSize(5),
											
										} :
										[{
											height: this.state.propsDetail ? scaleSize(109) : scaleSize(106),
											width: this.state.propsDetail ? scaleSize(109) : scaleSize(106),
										}, this.props.imageStyle]}
								/>
							</TouchableOpacity>
						)
					})
				}

				{
					this.state.videoUrl ?
						<TouchableOpacity onPress={() => {
							// this.player.presentFullscreenPlayer()
							// if (this.props.onPress) {
							// 	return this.props.onPress(0);
							// }
							// this.setState({ paused: !this.state.paused })

							if (this.props.onPress) {
								return this.props.onPress(0);
							}
							RouteHelper.navigate("VideoShowPage", {
								url: this.state.videoUrl
							})
						}}>
							<Image
								style={[styles.backgroundVideo, {
									height: this.state.propsDetail ? scaleSize(180) : scaleSize(170),
									width: '100%',
									maxWidth: this.state.propsDetail ? scaleSize(360) : scaleSize(345),
									minWidth: this.state.propsDetail ? scaleSize(345) : scaleSize(330),
								}]}
								source={{ uri: this.item.mediaPath + this.item.videoCover }}
							/>
							{/*<Video source={{ uri: this.state.videoUrl }}
															ref={(ref) => this.player = ref}
															style={styles.backgroundVideo}
															paused={this.state.paused}
															volume={this.state.volume}
															muted={this.state.muted}
															resizeMode={this.state.resizeMode}
															onLoad={this.onLoad}
															onProgress={this.onProgress}
															onEnd={this.onEnd}
															onAudioBecomingNoisy={this.onAudioBecomingNoisy}
															repeat={false}
														/>*/}
							{
								<View onPress={() => {
									// this.state.paused = !this.state.paused
									// this.forceUpdate()
								}}>
									<Image source={images.common.video_play} style={{
										height: scaleSize(80),
										width: scaleSize(80),
										position: 'absolute',
										left: '50%',
										bottom: scaleSize(48),
										marginLeft: scaleSize(-40),
									}} />
								</View>
							}
						</TouchableOpacity> : null
				}
			</View>
		)
	}
}

var styles = StyleSheet.create({
	backgroundVideo: {
		top: 0,
		left: 0,
		bottom: 0,
		right: 0
	},
});