import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import {images} from '../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView';
import ShadowCard from '../../components/ShadowCard';

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeIndex:0,
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
				{rank:1,
				avatar:"http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
				username:"昵称昵称昵称昵称昵…",
				score:3232
				},
				{rank:2,
				avatar:"http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
				username:"昵称昵称昵称昵称昵…",
				score:3232
				},
				{rank:3,
				avatar:"http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
				username:"昵称昵称昵称昵称昵…",
				score:3232
				},
				{rank:4,
				avatar:"http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
				username:"昵称昵称昵称昵称昵…",
				score:3232
				}
				], pageSize);
		}catch(err){
			abortFetch();
		}
	};
	renderItem(item){
		var rankStyle={

		}
		if(item.rank<=3){
			rankStyle={
				color:PRIMARY_COLOR
			}
		}
		return <View style={{alignItems:'center'}}>
			<TouchableOpacity 
			onPress={()=>{
				RouteHelper.navigate("RankDetailPage");
			}}
			style={[styles.rankItem,{width:scaleSize(345)}]}>
				 <Text style={[styles.rank,rankStyle]}>{item.rank}</Text>
				 <Image 
				 style={styles.avatar}
				 source={{uri:item.avatar}}
				 />
				 <Text style={styles.username}>{item.username}</Text>
				 <Text style={styles.score}>{item.score}</Text>
			</TouchableOpacity>
		</View>
	}	
	render() {
		var activeText={
			fontWeight:"500",
			fontSize:18,
			color:"#D43D3E"
		}
		var activeTabItem={
			borderBottomWidth:scaleSize(2),
			borderColor:"#D43D3E"
		}
		return <View style={{ flex: 1 ,backgroundColor:'#F2F6F9'}}>
			<UINavBar title="成绩" />
			<View style={{flex:1}}>

				<View style={{flexDirection:'row',height:scaleSize(42),backgroundColor:"#fff",marginTop:scaleSize(1)}}>
					<TouchableOpacity 
					onPress={()=>{
						this.setState({
							activeIndex:0
						})
					}}
					style={[styles.tabItem,this.state.activeIndex===0?activeTabItem:null]}>
						<Text style={[styles.tabItemText,this.state.activeIndex===0?activeText:null]}>实弹</Text>
					</TouchableOpacity>
					<TouchableOpacity 
					onPress={()=>{
						this.setState({
							activeIndex:1
						})
					}}
					style={[styles.tabItem,this.state.activeIndex===1?activeTabItem:null]}>
						<Text style={[styles.tabItemText,this.state.activeIndex===1?activeText:null]}>气枪</Text>
					</TouchableOpacity>
				</View>
				<View style={{alignItems:'center',marginVertical:scaleSize(10)}}>
					<TouchableOpacity
					style={{flexDirection:'row',
					alignItems:'center',
					justifyContent:'space-between',
					width:scaleSize(345),
					margin:"auto",
					padding:scaleSize(8),
					backgroundColor:"#fff",
					height:scaleSize(35)}}
					>
						<Text style={{color:"#323232",fontSize:14,fontWeight:"400"}}>分类</Text>
						<Image 
							source={images.common.arrow_down}
							style={{width:scaleSize(8),height:scaleSize(5)}}
						/>
					</TouchableOpacity>
				</View>

			<UltimateListView
					header={()=>{
						return null;						
					}}
					style={{flex:1}}
					allLoadedText={"没有更多了"}
					waitingSpinnerText={'加载中...'}
					ref={ref => this.listView = ref}
					onFetch={this.onFetch.bind(this)}
					keyExtractor={(item, index) => `${index} -`}
					item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
					displayDate
					emptyView={()=>{
			              return <EmptyView onRefresh={()=>{
			                  this.listView.refresh();
			              }} />
			        }}
				/>
				<ShadowCard 

				style={{width:'100%'}}>
					<TouchableOpacity 
					style={[styles.rankItem]}>
					 <Text style={[styles.rank]}>4</Text>
					 <Image 
					 style={styles.avatar}
					 source={{uri:"http://static.boycodes.cn/shejiixiehui-images/dongtai.png"}}
					 />
					 <Text style={styles.username}>弄成阿斯顿发</Text>
					 <Text style={styles.score}>32342</Text>
				</TouchableOpacity>
				</ShadowCard>
			</View>
		</View>
	}

}

var styles={
	tabItem:{
		flex:1,
		alignItems:'center',
		justifyContent:'center',
	},
	tabItemText:{
		color:"#303030",
		fontSize:15,
	},
	rankItem:{
		height:scaleSize(55),
		flexDirection:'row',
		alignItems:'center',
		paddingHorizontal:scaleSize(22),
		paddingVertical:scaleSize(11),
		backgroundColor:'#fff',
	},
	rank:{
		fontWeight:'bold',
		fontFamily:"Roboto",
		fontSize:15,
	},
	avatar:{
		width:scaleSize(30),
		height:scaleSize(30),
		borderRadius:scaleSize(15),
		marginLeft:scaleSize(20),
	},
	username:{
		flex:1,
		fontSize:14,
		color:'rgba(0,0,0,0.60)',
		fontWeight:"400",
		marginLeft:scaleSize(15),
	},
	score:{
		fontSize:20,
		color:PRIMARY_COLOR,
		fontWeight:'bold',
	}
}





