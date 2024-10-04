import React, { Component,Fragment } from 'react';
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
import UISelect from  '../../components/UISelect';

import UICitySelect from  '../../components/UICitySelect';
import request from '../../api/Request';
import ApiUrl from '../../api/Url.js';
import store from '../../store';
import DatePicker from 'react-native-datepicker'

@inject('UserStore') //注入；
@observer
export default class RankAchievementList extends Component {
	constructor(props) {
		super(props);
		this.state = {
		    filterOptions: {
 			   time:"",
 			   area:"",
		   },
			matchName:"",
            datetime:"",
			headData:[
			],
			listData:[
			],
			startdatetime:"2020-01-01",
			locationList:[],
			areaList: [],
			levelList: [],
		};
		this.UserStore = this.props.UserStore;
		this.headEnableScroll=true;
	}

	async componentDidMount() {
	    //地区
		var areas = await store.AppStore.getAreaList()
    	this.setState({
    	    areaList: areas
    	})
    	//类别
    	var levels = await store.AppStore.getCourseList()
        this.setState({ levelList: levels })
        //alert("levels" + levels.length);

		var locationId = "-1";

		this.getLocationList();
//		for (var i = 0; i < this.state.locationList.length; i++) {
//			var findAreaName = this.state.locationList[i].name;
//			alert("findAreaName" + findAreaName);
//			if (findAreaName) {
//				if(this.state.filterOptions.area.country_name + '-' + this.state.filterOptions.area.city_name  === findAreaName){
//				    locationId = this.state.locationList[i].id;
//             		break
//				}
//			}
//		}
	}

	async getLocationList(){
	    var locations = await this.callRestApis(ApiUrl.MATCH_RANK_AREA_FILTER);
	}

	async getListData() {
		this.state.listData = [];
		var locationId = "-1";
		let locationStr = this.state.filterOptions.area.country_name + '-' + this.state.filterOptions.area.city_name;
		//alert("locationId" + this.state.locationList);
    	this.state.locationList.map(c => {
    	  if(c.name == locationStr){
    	  	    locationId = c.id;
    	  }
        })
		let restApiUrl = ApiUrl.MATCH_RANK_SCORE_LIST;
		request.post(restApiUrl, {areaId:locationId,startDate:this.state.filterOptions.time,courseId:this.state.filterOptions.level.courseId,typeId:this.state.filterOptions.level.typeId}).then(res => {
			if (res.status === 200) {
			    let groupList = ["1"];
			    console.log("res.datas" + JSON.stringify(res.data));
		        groupList = res.data["list"];
		        this.state.matchName = res.data["contestName"];
           		for(var i=0;i<groupList.length;i++){
           		    let rankItem = groupList[i];
             	    console.debug("rankItems" + rankItem.cateName);
           		    var	items = [];
           		    rankItem.items.forEach((v,k) => {//k,v位置是反的哦
                       // console.log("bestScore:" + v.bestScore + "totalCount:" + v.totalCount + "bestAvgScore:" + v.bestAvgScore);
                        items.push({
                           cpsa_mingci:v.cpsaRank,
                           zong_mingci:v.totalRank,
                           name:v.importName,
                           score:v.score,
                           precent:v.percentage,
                           avg:v.avgCoeff,
                           avg_time:v.avgTime,
                           avg_score:v.avgScore,
                           remark:v.remark,
                           id:v.id,
                        })
                    })
           		    let contestStatusList = rankItem.contestStatsList;
           			this.state.listData.push({
           			     cate_name:rankItem.cateName,
           			     items:items,
           			})
           		}
           this.forceUpdate()
			}
		}).catch(err => console.log(err));
    }

    async callRestApi(restUrl, params = {}) {
    	var result = [];
		request.post(restApiUrl, {}).then(res => {
			if (res.status === 200) {
			   // alert(res.data);
				this.setState({ groupList: res.data });
			}
		}).catch(err => console.log(err));

    	return result;
    }

     async callRestApis(restUrl, params = {}) {
     	var result = [];
 		request.post(restUrl, {}).then(res => {
 			if (res.status === 200) {
 			    result = res.data.rows;
 			     this.setState({
                         	locationList: result
                 })
 			   // alert(result);
 			}
 		}).catch(err => console.log(err));

     	return result;
     }

	renderFilter(){
		return (
	        <View style={{flexDirection:"row",marginTop:scaleSize(10),justifyContent:"space-between",padding:scaleSize(10)}}>
			<TouchableOpacity
    		   onPress={() => {
				   UICitySelect.show(this.state.levelList, (item) => {
    								this.state.filterOptions.level = item;
    						        this.getListData();
                            	    this.forceUpdate();
                           			UISelect.hide();
    			   }, () => { }, "类别")
    		   }}
    		   style={styles.filter_item}>
					<Text style={styles.filter_label}>
    							{this.state.filterOptions.level ?
    								(this.state.filterOptions.level.id >= 0 ?
    									this.state.filterOptions.level.country_name + "|" + this.state.filterOptions.level.city_name :
    									this.state.filterOptions.level.city_name
    								) : "类别"}
    				</Text>
    			<Image source={images.common.arrow_down} style={{ width: scaleSize(8), height: scaleSize(5) }} />
    		</TouchableOpacity>
 			<TouchableOpacity
 			onPress={()=>{
 				UICitySelect.show(this.state.areaList, (item) => {
     				this.state.filterOptions.area = item;
     				this.getListData();
     				this.forceUpdate();
     		    })
 			}}
 			style={styles.filter_item}>
 				<Text style={styles.filter_label}>地点</Text>
 				<Text style={styles.filter_label}>
                    {this.state.filterOptions.area.city_name}
                 </Text>

 				<Image
 				source={images.common.arrow_down}
 				style={{width:scaleSize(8),height:scaleSize(5)}} />
 			</TouchableOpacity>

		    <DatePicker
		        date={this.state.filterOptions.time}
		        placeholder="时间"
                format="YYYY-MM"
                customStyles={{
                      placeholderText:{
                        color:"rgba(0,0,0,1)",
                      },
                      dateInput: {
                        backgroundColor:"rgba(255,255,255,1)",
                        marginLeft: 3,
                        marginTop:-6,
                        borderRightWidth:ONE_PX,
                        borderColor:"rgba(0,0,0,0)",
                        height:scaleSize(30)
                      }
                      // ... You can check the source to find the other keys.
                }}
                mode="date"
                duration={400}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                iconSource={{}}
                disabled={false}
                showIcon={false}
                onDateChange={(date) => {
                   this.state.filterOptions.time = date;
                   this.getListData();
                   this.forceUpdate();

                }}
             />


		</View>
			)
	}

	renderTableHead(){
		var result=[];
		 result.push(<View style={{backgroundColor:"#F7F8FA",height:scaleSize(68),flexDirection:"row"}}>
			<ScrollView
			horizontal={true}
			showsHorizontalScrollIndicator={false}
			ref={(ref)=>{
				this.head_scroll=ref;
			}}
			onScroll={(e)=>{
				var scroll_y = e.nativeEvent.contentOffset.y;
				var scroll_x = e.nativeEvent.contentOffset.x;
				if(this.headEnableScroll){
					this.contentEnableScroll=false;
					this.myRankEnableScroll=false;
					this.content_scroll && this.content_scroll.scrollTo({x: scroll_x, y: 0, animated: false})
					this.my_rank_scroll && this.my_rank_scroll.scrollTo({x: scroll_x, y: 0, animated: false})
				}
			}}
			onMomentumScrollEnd={()=>{
				this.contentEnableScroll=true;
				this.myRankEnableScroll=true;
			}}
			>
				<View style={[styles.border_right,{width:scaleSize(50),alignItems:'center',height:scaleSize(68),justifyContent:'center'}]}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>组名</Text>
				</View>
				<View style={[styles.border_right,{width:scaleSize(72),alignItems:'center',height:scaleSize(68),justifyContent:'center'}]}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>CPSA名次</Text>
				</View>
				<View style={{...styles.border_right,width:scaleSize(72),alignItems:'center',height:scaleSize(68),justifyContent:'center'}}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>赛事总名次</Text>
				</View>
				<View style={{...styles.border_right,width:scaleSize(72),alignItems:'center',height:scaleSize(68),justifyContent:'center'}}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>姓名</Text>
				</View>
				<View style={{...styles.border_right,width:scaleSize(72),alignItems:'center',height:scaleSize(68),justifyContent:'center'}}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>分数</Text>
				</View>
				<View style={{...styles.border_right,width:scaleSize(72),alignItems:'center',height:scaleSize(68),justifyContent:'center'}}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>百分比</Text>
				</View>
				<View style={{...styles.border_right,width:scaleSize(72),alignItems:'center',height:scaleSize(68),justifyContent:'center'}}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>平均系数</Text>
				</View>
				<View style={{...styles.border_right,width:scaleSize(72),alignItems:'center',height:scaleSize(68),justifyContent:'center'}}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>平均时间</Text>
				</View>
				<View style={{...styles.border_right,width:scaleSize(72),alignItems:'center',height:scaleSize(68),justifyContent:'center'}}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>平均得分</Text>
				</View>
				<View style={{...styles.border_right,width:scaleSize(72),alignItems:'center',height:scaleSize(68),justifyContent:'center'}}>
					<Text style={{fontSize:12,
						fontWeight:"bold",
						color:"#323232",
						fontFamily:"PingFang SC",
					}}>备注</Text>
				</View>


				<View style={{width:ONE_PX,
				backgroundColor:"rgba(0,0,0,0.10196078431372549)",
				height:scaleSize(68),
					}}></View>
				{this.state.headData.map((item,index)=>{
					var rs =[];
					 rs.push(
						<View 
						style={{flex:1,width:scaleSize(50),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:12,fontWeight:"500"}}>{item.day}</Text>
						</View>)
					 rs.push(<View style={{
					 	width:ONE_PX,
						backgroundColor:"rgba(0,0,0,0.10196078431372549)",
						height:scaleSize(68),
					}}></View>)
					return <Fragment key={index}>
						{rs}
					</Fragment>
				})}
				
			</ScrollView>
		</View>)


		 // result.push(
		 	// )
		 return result;
	}
	renderItem(item,index){
		return <View 
		key={index}
		style={{flexDirection:"row",backgroundColor:index%2==0?"#fff":'#FBFBFB'}}>
			<View style={[styles.border_right,{width:scaleSize(50),alignItems:'center',justifyContent:'center'}]}>
				<Text>{item.cate_name}</Text>
			</View>
			<View style={{flex:1}}>
				{item.items.map((item2,index2)=>{
					// if(index>0){
					// 	var mod_num = index%2;
					// }else{
					// 	var mod_num=2;
					// }
					// console.warn("index2+index",(index2+index)%2);
					return <TouchableOpacity 
					onPress={()=>{
					     RouteHelper.navigate("RankDetailPage",{resultId:item2.id});
					}}
					key={index2}
					style={[styles.border_right,{flexDirection:"row",alignItems:'center',height:scaleSize(45),backgroundColor:((index2+index)%2==0)?"#fff":'#FBFBFB'}]}>
						<View style={{...styles.border_right,width:scaleSize(73),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:13,fontWeight:"bold",color:"#323232"}}>{item2.cpsa_mingci}</Text>
						</View>
						<View style={{...styles.border_right,width:scaleSize(73),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:13,fontWeight:"bold",color:"#323232"}}>{item2.zong_mingci}</Text>
						</View>
						<View style={{...styles.border_right,width:scaleSize(73),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:13,fontWeight:"bold",color:"#323232"}}>{item2.name}</Text>
						</View>
						<View style={{...styles.border_right,width:scaleSize(73),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:13,fontWeight:"bold",color:"#323232"}}>{item2.score}</Text>
						</View>
						<View style={{...styles.border_right,width:scaleSize(73),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:13,fontWeight:"bold",color:"#323232"}}>{item2.precent}</Text>
						</View>
						<View style={{...styles.border_right,width:scaleSize(73),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:13,fontWeight:"bold",color:"#323232"}}>{item2.avg}</Text>
						</View>
						<View style={{...styles.border_right,width:scaleSize(73),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:13,fontWeight:"bold",color:"#323232"}}>{item2.avg_time}</Text>
						</View>
						<View style={{...styles.border_right,width:scaleSize(73),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:13,fontWeight:"bold",color:"#323232"}}>{item2.avg_score}</Text>
						</View>
						<View style={{...styles.border_right,width:scaleSize(73),alignItems:'center',justifyContent:'center'}}>
							<Text style={{fontSize:13,fontWeight:"bold",color:"#323232"}}>{item2.remark}</Text>
						</View>
						
					</TouchableOpacity>
				})}
			</View>
		</View>
	}
	render() {
		return <View style={{ flex: 1 }}>
			{this.renderFilter()}
			<View style={{backgroundColor:"#FFF",height:scaleSize(40),flexDirection:"row"}}>
			   <Text style={{fontSize:16,color:"#323232",left:15,top:12}}>{this.state.matchName}</Text>
			</View>
			{this.renderTableHead()}
			<ScrollView
			nestedScrollEnabled={true}
			>
				<ScrollView
				nestedScrollEnabled={true}
				ref={(ref)=>{
					this.content_scroll=ref;
				}}
				showsVerticalScrollIndicator={false}
				showsHorizontalScrollIndicator={false}
				horizontal={true}
				removeClippedSubviews={true}
				onMomentumScrollEnd={()=>{
					this.headEnableScroll=true;
				}}
				onScroll={(e)=>{
					var scroll_y = e.nativeEvent.contentOffset.y;
					var scroll_x = e.nativeEvent.contentOffset.x;
					if(this.contentEnableScroll){
						this.headEnableScroll=false;
						this.head_scroll && this.head_scroll.scrollTo({x: scroll_x, y: 0, animated: false})
					}
						

					// setTimeout(()=>{
					// },30)
					// if()
					// console.log("this.",this.mapScrolls)
					// for(var key in this.mapScrolls){
					// 	if(key!=index){
					// 		this.mapScrolls[key].scrollTo({x: scroll_x, y: 0, animated: false})
					// 		// this.mapScrolls[key].scrollWithoutAnimationTo(0,scroll_x)
							
					// 	}
					// }
				}}
				>
				<View style={{flex:1}}>
					{this.state.listData.map((item,index)=>{
						return this.renderItem(item,index)
					})}	
				</View>
				</ScrollView>
			</ScrollView>

		</View>
	}

}

var styles={
	filter_item:{
		padding:scaleSize(8),
		backgroundColor:"#fff",
		borderRadius:scaleSize(2),
	    width:scaleSize(105),
		height:scaleSize(30),
		flexDirection:"row",
		justifyContent:"space-between",
		alignItems:'center',
	},
	border_right:{
		borderRightWidth:ONE_PX,
		borderColor:"rgba(0,0,0,0.10196078431372549)",
	}
}

