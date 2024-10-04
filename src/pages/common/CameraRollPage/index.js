import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	Platform,
	FlatList,
	// CameraRoll
} from 'react-native'
import CameraRoll from "@react-native-community/cameraroll";
// console.log("CameraRoll",CameraRoll.getPhotos);

import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../../components/UINavBar';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import enToZh from './enToZh';
import Url from '../../../api/Url'
import axios from 'axios'
import store from '../../../store'

var isIOS = Platform.OS === 'ios';

@inject('UserStore') //注入；
@observer
export default class CameraRollPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			groupName: this.props.groupName,
			listData: "",
			page: 1,
			limit: 30,
			selectedItems: [],
			loginuser: undefined
		};
		this.UserStore = this.props.UserStore;
		this.prev_page_info = {};
		store.UserStore.getLoginUser().then(user => this.setState({ loginuser: user }))
	}
	static defaultProps = {
		maxSize: 1,
		autoConvertPath: false,
		assetType: 'Photos',
		groupTypes: 'All',
		groupName: "",
		callback: () => { }
	}
	async componentDidMount() {
		this.getListData();
	}
	async getListData() {
		// alert("11");
		try {
			// CameraRoll.getPhotos({
			// 	first: 20000,
			//           groupTypes: Platform.OS === 'ios' ? this.props.groupTypes : undefined,
			//           assetType: this.props.assetType,
			// }).then((res)=>{
			// 	console.log('getPhotos',res);
			// })
			// var listData = await CameraRoll.getPhotos({
			// 	assetType:this.props.assetType,
			// 	groupTypes:this.props.groupTypes,
			// 	groupName:this.state.groupName,
			// 	first:100000,
			// 	// groupTypes: Platform.OS === 'ios' ? this.props.groupTypes : undefined,
			// });
			// listData=listData.edges;
			// listData.unshift({
			// 	type:this.props.assetType,
			// });
			// console.log("listData",listData.edges);
			// this.setState({
			// 	listData:listData,
			// });
			// this.listView.refresh();
		} catch (err) {
			console.log('11', err);

		}
		// alert(1);
		// alert(CameraRoll.getAlbums);
		// alert(1);
	}
	getTitle() {
		if (this.state.groupName) {
			return enToZh[this.state.groupName] ? enToZh[this.state.groupName] : this.state.groupName;
		}
		if (this.props.assetType == 'Photos') {
			return '全部图片'
		} else if (this.props.assetType == 'Videos') {
			return '全部视频'
		}
	}
	_clickCell = (item) => {
		var itemuri = item.node.image
		const isSelected = this.state.selectedItems.some(item => item.uri === itemuri.uri);
		if (isSelected) {
			const selectedItems = this.state.selectedItems.filter(item => item.uri !== itemuri.uri);
			this.setState({
				selectedItems: [...selectedItems]
			}, () => {
				this.listView.updateRows();
				// console.log(this.state.selectedItems,itemuri);

			});
		} else if (this.state.selectedItems.length >= this.props.maxSize) {
			// Alert.alert('', this.props.maxSizeChooseAlert(this.props.maxSize));
			Toast.stop("最多选择" + this.props.maxSize + '张');
		} else {
			this.setState({
				selectedItems: [...this.state.selectedItems, itemuri]
			}, () => {
				this.listView.updateRows();
				// console.log(this.state.selectedItems,itemuri);

			});
			// alert('1');
		}
	};
	renderItem(item, index) {
		if (item.type == 'Photos') {
			return <TouchableOpacity
				onPress={() => {
					RouteHelper.replace("TakePicAndRecordVideoPage", {
						...this.props,
					});
				}}
				style={{ alignItems: 'center', justifyContent: 'center', width: scaleSize(110), height: scaleSize(110), backgroundColor: "#fff", margin: scaleSize(6) }} >
				<Image source={require("./images/camera.png")} style={{ width: scaleSize(32), height: scaleSize(32) }} />
			</TouchableOpacity>
		} else if (item.type == 'Videos') {
			return <TouchableOpacity
				onPress={() => {
					RouteHelper.replace("TakePicAndRecordVideoPage", {
						...this.props,
						isVideo: true,
					});
				}}
				style={{ alignItems: 'center', justifyContent: 'center', width: scaleSize(110), height: scaleSize(110), backgroundColor: "#fff", margin: scaleSize(6) }} >
				<Image source={require("./images/video.png")} style={{ width: scaleSize(32), height: scaleSize(32) }} />
			</TouchableOpacity>
		} else {
			// if(item.node.type.indexOf("image")>-1){
			const isSelected = this.state.selectedItems.some(obj => obj.uri === item.node.image.uri);
			// console.log('isSelected',isSelected);
			const backgroundColor = isSelected ? '#e15151' : 'rgba(0,0,0,0.7)';
			const hasIcon = isSelected || this.state.selectedItems.length < this.props.maxSize;
			return <TouchableOpacity
				onPress={() => {
					if (item.node.type.indexOf("video") > -1) {
						const appleId = item.node.image.uri.substring(5, 41);
						console.log("item.node.image", item.node.image);
						var ext = "mp4";
						var url = `assets-library://asset/asset.${ext}?id=${appleId}&ext=${ext}`;
						if (isIOS) {
							RouteHelper.navigate("VideoShowPage", {
								url: url
							})
						} else {
							RouteHelper.navigate("VideoShowPage", {
								url: item.node.image.uri
							});
						}
					} else {
						var rows = this.listView.getRows();
						// console.log("rows",rows);
						RouteHelper.navigate("BigImageShowPage", {
							imgs: [{ url: item.node.image.uri }],
							defaultIndex: 0,
						})
					}
				}}
				style={{ width: scaleSize(110), height: scaleSize(110), margin: scaleSize(6) }}>
				<Image source={{ uri: item.node.image.uri }} style={{ width: '100%', height: "100%" }} />
				<TouchableOpacity
					onPress={this._clickCell.bind(this, item)}
					style={styles.selectView}>
					<View style={[styles.selectIcon, { backgroundColor: backgroundColor }]}>
						{isSelected && (
							<Image
								source={require('./images/check_box.png')}
								style={styles.selectedIcon}
							/>
						)}
					</View>
				</TouchableOpacity>
				{item.node.type.indexOf("video") > -1 ? <View style={styles.duration}><Text style={{ color: "#fff", fontSize: 10 }}>{this.getDuration(item)}</Text></View> : null}
			</TouchableOpacity>
			// }else{
			// return <Text>1</Text>
			// }
		}
	}
	getDuration(item) {
		var duration = item.node.image.playableDuration;
		// if()
		var munites = Math.floor(duration / 60);
		munites = munites >= 10 ? munites : "0" + munites
		munites = Math.round(munites);
		// return
		var seconds = duration % 60;
		seconds = Math.round(seconds);
		seconds = seconds >= 10 ? seconds : "0" + seconds
		return munites + ':' + seconds;
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		var rowData = []
		try {
			if (this.prev_page_info && this.prev_page_info.has_next_page === false) {
				return startFetch([], pageSize);
			}
			if (page == 1) {
				this.prev_page_info = null;
			}
			var params = {
				assetType: this.props.assetType,
				groupTypes: this.props.groupTypes,
				groupName: this.state.groupName,
				first: pageSize,

				// page_info:{
				// 	has_next_page:true,
				// 	start_cursor:String((page-1)*pageSize),
				// 	end_cursor:String((page-1)*pageSize+pageSize)
				// }
				// after:"end_cursor"
				// groupTypes: Platform.OS === 'ios' ? this.props.groupTypes : undefined,
			};
			if (this.prev_page_info) {
				params.page_info = this.prev_page_info;
				params.after = this.prev_page_info.end_cursor;
			}
			var listData = await CameraRoll.getPhotos(params);
			this.prev_page_info = listData.page_info

			// console.warn({
			// 		has_next_page:true,
			// 		start_cursor:String((page-1)*pageSize),
			// 		end_cursor:String((page-1)*pageSize+pageSize)
			// 	},listData)
			// console.warn(listData.page_info, listData.edges.length);
			listData = listData.edges;
			// if(listData.page_info.has_next_page){
			// }else{
			// 	if(page==1){
			// 		listData=listData.edges;
			// 	}else{
			// 		if(listData.edges.length<20){
			// 			alert(listData.edges.length);
			// 		}
			// 		listData=[];
			// 	}
			// }
			if (page == 1) {
				listData.unshift({
					type: this.props.assetType,
				});
				console.log('listData', listData[1]);
			}
			startFetch(listData, pageSize);
		} catch (err) {
			console.warn('err', err);
			abortFetch();
		}
	};

	render() {
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
			<UINavBar
				title={<TouchableOpacity
					onPress={() => {
						RouteHelper.navigate("AlbumsCatePage", {
							...this.props,
							callback: (groupName) => {
								console.log('a', groupName);
								this.state.groupName = groupName;
								this.forceUpdate();
								this.listView.refresh();
								// this.getListData();
							}
						})
					}}
					style={{ flexDirection: "row", alignItems: 'center' }}>
					<Text style={{ fontSize: 18, fontWeight: '600', color: PRIMARY_COLOR }}>{this.getTitle()}</Text>
					<Image source={require("./images/arrow_down.png")} style={{ width: scaleSize(12), height: scaleSize(7), marginLeft: scaleSize(5), tintColor: PRIMARY_COLOR }} />
				</TouchableOpacity>}
				rightView={<View style={{ flexDirection: "row" }}>
					{this.state.selectedItems.length ? <View style={{ marginRight: scaleSize(10), borderRadius: scaleSize(2), height: scaleSize(29), width: scaleSize(27), borderWidth: ONE_PX, borderColor: PRIMARY_COLOR, alignItems: 'center', justifyContent: 'center' }}>
						<Text style={{ fontSize: 18, color: PRIMARY_COLOR }}>{this.state.selectedItems.length}</Text>
					</View> : null}
					<TouchableOpacity
						onPress={() => {
							if (this.state.selectedItems.length) {
								// RouteHelper.goBack();
								// RouteHelper.navigate("")
								this.state.selectedItems.map((item) => {
									var appleId = item.uri.substring(5, 41);
									// console.log("item.node.image",item.node.image);
									// var ext ="mp4";
									// item.uri = `assets-library://asset/asset.${ext}?id=${appleId}&ext=${ext}`;

								})
								// let submitForm = new FormData()
								// for (var i = 0; i < this.state.selectedItems.length; i++) {
								// 	var image = this.state.selectedItems[i]
								// 	let uploadFile = {
								// 		uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
								// 		type: "application/octet-stream",
								// 		name: 'aaaaaa.jpg'
								// 	}
								// 	submitForm.append("image" + (i + 1) + "File", uploadFile)
								// }
								// console.debug('submitForm???????'+JSON.stringify(submitForm))	
								// axios({
								// 	method: 'POST',
								// 	url: Url.UPLOADPIC,
								// 	headers: {
								// 		Authorization: 'Bearer ' + this.state.loginuser.token,
								// 		'Content-Type': 'multipart/form-data',
								// 	},
								// 	data: submitForm
								// }).then(res=>{
								// 	console.log(">??>>>>>??????????"+JSON.stringify(res.data))
								// 	this.props.callback && this.props.callback(this.state.selectedItems);
								// 	RouteHelper.goBack();
								// })
								this.props.callback && this.props.callback(this.state.selectedItems);
								RouteHelper.goBack();
							} else {

							}
						}}
						style={{
							width: scaleSize(57),
							alignItems: 'center',
							justifyContent: 'center',
							height: scaleSize(29),
							borderRadius: scaleSize(4),
							backgroundColor: this.state.selectedItems.length ? 'rgba(212,61,62,1)' : 'rgba(212,61,62,0.5)', marginRight: scaleSize(13)
						}}>
						<Text style={{ fontSize: 14, color: "#fff", fontWeight: "400" }}>下一步</Text>
					</TouchableOpacity>
				</View>}
				leftView={<TouchableOpacity
					onPress={() => {
						RouteHelper.goBack();
					}}
					style={{ width: scaleSize(70), alignItems: 'center', justifyContent: 'center' }}
				>
					<Text style={{ fontSize: 18, color: "rgba(0,0,0,0.60)" }}>取消</Text>
				</TouchableOpacity>}
			/>
			<View style={{ flex: 1 }}>
				<UltimateListView
					header={() => {
						return null;
					}}
					allLoadedText={"没有更多了"}
					waitingSpinnerText={'加载中...'}
					ref={ref => this.listView = ref}
					onFetch={this.onFetch.bind(this)}
					keyExtractor={(item, index) => `${index} -`}
					item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
					numColumns={3}
					displayDate
					emptyView={() => {
						return null;
					}}
				/>
			</View>
		</View>
	}

}




class ImageVideoCell extends Component {
	render() {

	}
}


var styles = {
	selectView: {
		position: 'absolute',
		top: 4,
		right: 4,
		width: 30,
		height: 30,
		justifyContent: 'flex-start',
		alignItems: 'flex-end',
	},
	selectIcon: {
		marginTop: 2,
		marginRight: 2,
		width: 20,
		height: 20,
		borderColor: 'white',
		borderWidth: 1,
		borderRadius: 10,
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	selectedIcon: {
		width: 13,
		height: 13,
	},
	duration: {
		position: "absolute",
		left: 5,
		bottom: 5,
		// right:0

	}
}
