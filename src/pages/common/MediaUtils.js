import React from 'react';
import {
	View,
	Image,
	TouchableOpacity,
	ImageBackground
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import {images} from '../../res/images';
import ApiUrl from '../../api/Url.js';

export default {
	renderImgs(item) {

		// To test this renderImgs() function, just hard code and replace item.image as
		// xxxxx.jpg. xxxxx is the file name. e.g. 28aff2d4d4965ecdacf44440406c6047.jpg
		// Remember to create that jpg file first under C:\shooting\recommend\.
		// e.g. C:\shooting\recommend\28aff2d4d4965ecdacf44440406c6047.jpg.
		// Similarly, if you like to test video file. Remember to have a mp4 file there.
		// e.g. C:\shooting\recommend\82d541b5635411135b9999c3b7da51dd.mp4
	
		let imgUrls = [];
	
		// Include all media column names for all tables, so this function can be shareable.
		buildImageUrlArray(item.image, imgUrls); 
		buildImageUrlArray(item.image1, imgUrls);
		buildImageUrlArray(item.image2, imgUrls);
		buildImageUrlArray(item.image3, imgUrls);
		buildImageUrlArray(item.image4, imgUrls);
		buildImageUrlArray(item.image5, imgUrls);
		buildImageUrlArray(item.image6, imgUrls);
		buildImageUrlArray(item.image7, imgUrls);
		buildImageUrlArray(item.image8, imgUrls);
		buildImageUrlArray(item.image9, imgUrls);
		buildImageUrlArray(item.mediaUrl, imgUrls);
		// this.buildImageUrlArray('82d541b5635411135b9999c3b7da51dd.mp4');
	
		if (!imgUrls.length) { 
			return;
		}
	
		if (imgUrls.length == 1) {
			return (
				<TouchableOpacity 
					style={{height:scaleSize(150), width:scaleSize(345), marginTop:scaleSize(16)}}
					onPress={()=>{
						RouteHelper.navigate("BigImageShowPage",{
							defaultIndex:0,
							imgs:imgUrls,
						})
					}}>
					<Image 
						source={{uri:imgUrls[0].url}}
						style={{height:scaleSize(150),width:scaleSize(345)}}
						resizeMode="cover"
					/>
				</TouchableOpacity>
			)
		} 
		
		return (
			<View style={{marginTop:scaleSize(16), flexDirection:'row', flexWrap:"wrap"}}>
				{
					imgUrls.map( (img,index) => {
						return (
							<TouchableOpacity
								key={index}
								onPress={this.onPrevImage.bind(this,imgUrls,index)}
								style={{
									width:scaleSize(100),
									height:scaleSize(100),
									margin:scaleSize(4),
								}}
							>
								<Image 
									source={{uri:img.url}}
									style={{height:scaleSize(100),width:scaleSize(100)}}
									resizeMode="cover"
								/>
							</TouchableOpacity>
						)
					})
				}
			</View>
		)
	}
}

function buildImageUrlArray(mediaFileName, imgUrls) {

	if (!mediaFileName) {
		return;
	}

	let mediaUrl = ApiUrl.RECOMMEND_IMAGE + mediaFileName;

	// if the file name is not jpg, it must be video (backend sets all images as jpg)
	if (mediaFileName.split('.')[1].toUpperCase() != 'JPG') {
		renderVideo(mediaUrl);
		return;
	}

	imgUrls.push({url: mediaUrl});
}

function renderVideo(videoUrl) {
	return (
		<TouchableOpacity
			style={{
				width:scaleSize(345), 
				height:scaleSize(226), 
				marginTop:scaleSize(16)
			}}
			onPress={()=>{
				RouteHelper.navigate("VideoShowPage",{
					url:videoUrl
				})
			}}
		>
			<ImageBackground
				style={{
					width:scaleSize(345),
					height:scaleSize(226),
					alignItems:'center',
					justifyContent:'center',
				}}
				source={{uri:videoUrl}}
			>
				<View 
					style={{
						width:"100%", height:'100%',
						position:"absolute",
						top:0, right:0, bottom:0, left:0,
						backgroundColor:"rgba(0,0,0,0.3)"
					}}
				></View>
				<Image 
					style={{width:scaleSize(60),height:scaleSize(60)}}
					source={images.common.video_play}
				/>				
			</ImageBackground>
		</TouchableOpacity>
	)
}





