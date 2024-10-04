import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	FlatList
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import {images} from '../../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../../components/UINavBar';
import LoadingPage from '../../../components/LoadingPage';
import CameraRoll from "@react-native-community/cameraroll";
import enToZh from './enToZh';

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			albums:[],
			loading:true,
		};
		this.UserStore = this.props.UserStore;

	}
	static defaultProps = {
		maxSize: 1,
		autoConvertPath: false,
		assetType: 'Photos',
		groupTypes: 'All',		
	}

	async componentDidMount() {
		var albums = await CameraRoll.getAlbums({
			assetType:this.props.assetType,
		});
		albums=albums.filter((item)=>{
			return item.count>0
		})
		for(var i=0;i<albums.length;i++){
			var res2 =await CameraRoll.getPhotos({
			       first: 1,
			       assetType: this.props.assetType,
			       groupName:albums[i].title,
			});
			albums[i].image= res2.edges[0].node.image;
			// return
			// console.log("1",res2);
		}
		this.setState({albums:albums,loading:false})
		
	}
	getTitle(){
		if(this.props.assetType=='Photos'){
			return '图片'
		}else if(this.props.assetType=='Videos'){
			return '视频'
		}
	}
	render() {
		return <View style={{ flex: 1 }}>
			<UINavBar 
			title={this.getTitle()}
			leftView={<TouchableOpacity
				onPress={()=>{
					RouteHelper.pop(2);
					// RouteHelper.goBack();
				}}
				style={{width:scaleSize(70),alignItems:'center',justifyContent:'center'}}
				>
				<Text style={{fontSize:18,color:"rgba(0,0,0,0.60)"}}>取消</Text>
			</TouchableOpacity>}
			 />

			 {this.state.loading
			 ?<LoadingPage/>
			 :<ScrollView>
			 	{
			 		
			 		this.state.albums.map((item,index)=>{
			 			return <TouchableOpacity
			 			onPress={()=>{
			 				this.props.callback && this.props.callback(item.title);
			 				// delete this.props.callback;
			 				RouteHelper.goBack();

			 			}}
			 			key={index}
			 			style={{height:scaleSize(110),borderBotttomWidth:ONE_PX,borderColor:"rgba(0,0,0,0.1)",flexDirection:"row",alignItems:'center'}}
			 			>
			 				<Image 
			 				source={{uri:item.image.uri}}
			 				style={{width:scaleSize(110),height:scaleSize(110)}}
			 				resizeMode="cover"
			 				/>
			 				<Text key={index} style={{fontSize:18,color:"rgba(0,0,0,0.80)",marginLeft:scaleSize(20)}}>{enToZh[item.title]?enToZh[item.title]:item.title} （{item.count}）</Text>
			 				<Image source={images.common.arrow_right2}  
			 				style={{position:"absolute",right:scaleSize(15),width:scaleSize(10),height:scaleSize(17),tintColor:"rgba(0,0,0,0.6)"}} />
			 			</TouchableOpacity>
			 		})
			 	}
			 </ScrollView>
			 
			 }
		</View>
	}

}







var styles={
	
}
