import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	ImageBackground,
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import {images} from '../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import EmptyView from '../../components/EmptyView';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';

@inject('UserStore') //注入；
@observer
export default  class tmplist extends Component{
	search(text){
		// alert(3);
		this.listView.refresh();
	}
	renderItem(item,index){
		return  <Text>1</Text>
	}
	async onFetch(page = 1, startFetch, abortFetch) {
	  	var pageSize = 20
		var rowData = []  
		try{
			var res=[]
			startFetch(res, pageSize);
		}catch(err){
			abortFetch();
		}
	};
	
	render(){
		return <View style={{flex:1}}>
			<UINavBar title="招商" />
			<UltimateListView 
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
	}
}






var styles={
	
}
