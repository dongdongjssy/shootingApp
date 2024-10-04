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
	Toast,
	Carousel
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView  from '../../components/EmptyView';
import ActivityItem from './ActivityItem';
import UISelect from  '../../components/UISelect';

@inject('UserStore') //注入；
@observer
export default class ActivityListPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			filterOptions:{

			},
			fixedFilter:false,
		};
		this.UserStore = this.props.UserStore;

	}

	async componentDidMount() {
		
		
	}
	renderItem(item,index){
		return <ActivityItem
		item={item}
		index={index} />
	}
	async onFetch(page = 1, startFetch, abortFetch) {
	  	var pageSize = 20
		var rowData = []  
		try{
			startFetch([
				{img:"http://static.boycodes.cn/shejiixiehui-images/activity_img.png",
				name:"俱乐部活动名称俱乐部活动名称",
				time:"2020/05/01 -2020/06/01 ",
				cate:"IPSC",
				cate2:"实弹",
				address:"天津南开区红旗南路228号一号院内4号库天津卫津路58号",
				},
				{img:"http://static.boycodes.cn/shejiixiehui-images/activity_img.png",
				name:"俱乐部活动名称俱乐部活动名称",
				time:"2020/05/01 -2020/06/01 ",
				cate:"IPSC",
				cate2:"实弹",
				address:"天津南开区红旗南路228号一号院内4号库天津卫津路58号",
				},
				{img:"http://static.boycodes.cn/shejiixiehui-images/activity_img.png",
				name:"俱乐部活动名称俱乐部活动名称",
				time:"2020/05/01 -2020/06/01 ",
				cate:"IPSC",
				cate2:"实弹",
				address:"天津南开区红旗南路228号一号院内4号库天津卫津路58号",
				},
				{img:"http://static.boycodes.cn/shejiixiehui-images/activity_img.png",
				name:"俱乐部活动名称俱乐部活动名称",
				time:"2020/05/01 -2020/06/01 ",
				cate:"IPSC",
				cate2:"实弹",
				address:"天津南开区红旗南路228号一号院内4号库天津卫津路58号",
				},
				{img:"http://static.boycodes.cn/shejiixiehui-images/activity_img.png",
				name:"俱乐部活动名称俱乐部活动名称",
				time:"2020/05/01 -2020/06/01 ",
				cate:"IPSC",
				cate2:"实弹",
				address:"天津南开区红旗南路228号一号院内4号库天津卫津路58号",
				},
				], pageSize);
		}catch(err){
			abortFetch();
		}
	};
	renderFilter(){
		return (
			<View style={{flexDirection:"row",marginTop:scaleSize(10),justifyContent:"space-between"}}>
			<TouchableOpacity 
			onPress={()=>{
				UISelect.show([
					{title:"地区1"},
					{title:"地区2"},
					],{
					title:"地区选择",
					onPress:(item)=>{
						this.state.filterOptions.area=item.title;
						this.forceUpdate();
						UISelect.hide();
					}
				})
			}}
			style={styles.filter_item}>
				<Text style={styles.filter_label}>地区</Text>
				<Text>{this.state.filterOptions.area}</Text>
				<Image 
				source={images.common.arrow_down} 
				style={{width:scaleSize(8),height:scaleSize(5)}} />
			</TouchableOpacity>
			<TouchableOpacity 
			onPress={()=>{
				UISelect.show([
					{title:"全部"},
					{title:"IPSC"},
					{title:"IDPA"},
					],{
					title:"科目选择",
					onPress:(item)=>{
						this.state.filterOptions.kemu=item.title;
						this.forceUpdate();
						UISelect.hide();
					}
				})
			}}
			style={styles.filter_item}>
				<Text style={styles.filter_label}>科目</Text>
				<Text>{this.state.filterOptions.kemu}</Text>
				<Image 
				source={images.common.arrow_down} 
				style={{width:scaleSize(8),height:scaleSize(5)}} />
			</TouchableOpacity>
			<TouchableOpacity 
			onPress={()=>{
				UISelect.show([
					{title:"全部"},
					{title:"一个月内"},
					{title:"三个月内"},
					{title:"半年内"},
					{title:"一年内"}
					],{
					title:"时间选择",
					onPress:(item)=>{
						this.state.filterOptions.time=item.title;
						this.forceUpdate();
						UISelect.hide();
					}
				})
			}}
			style={styles.filter_item}>
				<Text style={styles.filter_label}>时间</Text>
				<Text>{this.state.filterOptions.time}</Text>
				<Image 
				source={images.common.arrow_down} 
				style={{width:scaleSize(8),height:scaleSize(5)}} />
			</TouchableOpacity>
		</View>
			)
	}
	renderHeader(){
		var rs =[];
		rs.push(<HeaderCarousel />)
		if(this.state.fixedFilter===false){
			rs.push(this.renderFilter())
		}
		return <View style={{margin:scaleSize(10),marginBottom:0}}>
			{rs}
		</View>
	}
	render() {
		return <View style={{ flex: 1,backgroundColor:"#F2F6F9" }}>
			<UINavBar title="培训" />
			{this.state.fixedFilter?<View style={{backgroundColor:"#F2F6F9",paddingBottom:scaleSize(10),paddingHorizontal:scaleSize(15)}}>{this.renderFilter()}</View>:null}
			<UltimateListView
					onScroll={(e)=>{
						var scroll_y = e.nativeEvent.contentOffset.y;
						if(scaleSize(scroll_y)>=scaleSize(156)+scaleSize(20)){
							// console.log("e",e.nativeEvent.contentOffset.y);
							this.setState({
								fixedFilter:true,
							})
						}else{
							this.setState({
								fixedFilter:false,
							})
						}
					}}
					style={{flex:1}}
					header={()=>{
						return this.renderHeader()
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





class HeaderCarousel extends Component {
	constructor(props) {
		super(props);
		this.state = {

		};
		this.UserStore = this.props.UserStore;

	}

	async componentDidMount() {
		
		
	}
	
	render() {
		return <View style={{height:scaleSize(156)}}>
			<Carousel 
			control={
			    <Carousel.Control
			      // style={{alignItems: 'flex-end'}}
			      dot={<View style={{backgroundColor:"#ccc",marginLeft:scaleSize(9),marginBottom:scaleSize(5),borderRadius:scaleSize(4),width:scaleSize(8),height:scaleSize(8)}}></View>}
			      activeDot={<View style={{backgroundColor:"#D43D3E",marginLeft:scaleSize(9),marginBottom:scaleSize(5),borderRadius:scaleSize(4),width:scaleSize(8),height:scaleSize(8)}}></View>}
			      />
			  }
			style={{height: scaleSize(156)}}>
				<TouchableOpacity 
				onPress={()=>{

				}}
				style={{flex:1}}>
				  <Image style={{flex:1}} resizeMode='cover' source={images.home.banner} />
				</TouchableOpacity>
				  <TouchableOpacity 
				onPress={()=>{
					
				}}
				style={{flex:1}}>
				  <Image style={{flex:1}} resizeMode='cover' source={images.home.banner} />
				</TouchableOpacity>
				<TouchableOpacity 
				onPress={()=>{

				}}
				style={{flex:1}}>
				  <Image style={{flex:1}} resizeMode='cover' source={images.home.banner} />
				</TouchableOpacity>
			</Carousel>
		</View>
	}

}


var styles={
	filter_item:{
		padding:scaleSize(8),
		backgroundColor:"#fff",
		borderRadius:scaleSize(2),
		width:scaleSize(110),
		height:scaleSize(35),
		flexDirection:"row",
		justifyContent:"space-between",
		alignItems:'center',
	},
	filter_label:{

	},

}







