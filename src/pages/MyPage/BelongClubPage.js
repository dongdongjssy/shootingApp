import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import {images} from '../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import EmptyView  from '../../components/EmptyView';

import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';

@inject('UserStore') //注入；
@observer
export default class MyFansPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			launcher_img: [],
		};
		this.UserStore = this.props.UserStore;

	}

	async componentDidMount() {
		
		
	}
	async onFetch(page = 1, startFetch, abortFetch) {
	  	var pageSize = 20
		var rowData = []  
		try{
			startFetch([
			   {avatar:"http://static.boycodes.cn/shejiixiehui-images/dongtai.png",name:"俱乐部名称",level:"实弹射手"},
				], pageSize);
		}catch(err){
			abortFetch();
		}
	};
	renderItem(item,index){
		return <TouchableOpacity
		onPress={()=>{
			RouteHelper.navigate("ClubDetailPage");
		}}
		>
				<View 
				style={{
					paddingLeft:scaleSize(16),
					height:scaleSize(72),
					width:SCREEN_WIDTH,
					flexDirection:'row',
					// paddingTop:scaleSize(16),
					// paddingVertical:scaleSize(50),
					// alignItems:'center',
					// justifyContent:'center'
				}}>
				<View style={{justifyContent:'center'}}>
					<Image  
					source={{uri:item.avatar}} 
					style={{width:scaleSize(44),height:scaleSize(44)}}
					/>
				</View>

				<View style={{
					flex:1,
					// borderBottomWidth:ONE_PX,
					// borderColor:"#E5E5E5",
					justifyContent:'center',
					marginLeft:scaleSize(16),
				}}>
					<Text style={{color:"#000",fontSize:18,fontWeight:"400"}}>{item.name}</Text>
					<View style={{height:scaleSize(1),backgroundColor:"#E5E5E5",position:"absolute",right:0,bottom:0,width:scaleSize(300)}}></View>
				</View>
			</View>
		</TouchableOpacity>
		// return <DynamicItem 
		// onPress={(item)=>{
		// 	RouteHelper.navigate("DynamicDetailPage",{
		// 		item:item,
		// 	});
		// }}
		// item={item} 
		// index={index} 
		// activeType={this.state.activeType}
		// listData={this.listView.getRows()}
		// />
	}
	
	render() {
		return <View style={{ flex: 1 }}>
			<UINavBar title="所属俱乐部" />
			<View style={{height:scaleSize(1),backgroundColor:"#F2F6F9"}}></View>
			<View style={{flex:1}}>
				<UltimateListView
				style={{flex:1}}
				header={()=>{
					return null;
				}}
				allLoadedText={"没有更多了"}
				waitingSpinnerText={'加载中...'}
				ref={ref => this.listView = ref}
				onFetch={this.onFetch.bind(this)}
				keyExtractor={(item, index) => `${index} -`}
				item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
				displayDate
				emptyView={()=>{
		              return <EmptyView />
		        }}
			/>
			</View>
		</View>
	}

}







var styles={
	
}
