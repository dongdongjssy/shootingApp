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
import request from '../../api/Request';
import ApiUrl from '../../api/Url.js';

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
		    resultId: props.resultId,
            userName:"",
            areaName:"",
            cpsaRank:"",
            totalRank:"",
            score:"",
            enName:"",
            memberId:"",
            matchName:"",
            matchType:"",
            startDate:"",
            totalCount:"",
            totalScore:"",
            avgCoeff:"",
            avgTime:"",
            avgScore:"",
            remark:"",
			listData:[],
			days:[
			]
		};
		this.UserStore = this.props.UserStore;

	}

	async componentDidMount() {
		this.getDataFromRestApi();
		
	}

	async getDataFromRestApi() {
		let restApiUrl = ApiUrl.MINE_RESULT_DETAIL + '/' + this.state.resultId;

		let result = await this.callRestApi(restApiUrl);
        let startDateStr;
        if(result.contest.startDate==null || result.contest.startDate == undefined || result.contest.startDate == "" || result.contest.startDate.length == 0){
            startDateStr = "";
        }else{
            startDateStr = result.contest.startDate.substring(5,10);
            startDateStr.replace('-','/');
        }
        let endDateStr;
        if(result.contest.endDate==null || result.contest.endDate == undefined || result.contest.endDate == "" || result.contest.endDate.length == 0){
           endDateStr = "";
        }else{
           endDateStr = result.contest.endDate.substring(5,10);
           endDateStr.replace('-','/');
		}
		// let percentageNew = result.percentage * 100;
		// percentageNew = percentageNew.toFixed(1);
		this.setState({
		   userName:result.importName,
		   matchType:result.contestGroup.name,
		   matchName:result.contest.title,
		   areaName:result.contest.areaName,
		   startDate:startDateStr,
		   endDate:endDateStr,
		   cpsaRank:result.cpsaRank,
		   totalRank:result.totalRank,
		   score:result.score,
		   percentage:result.percentage == 1 ? (result.percentage*100).toFixed(2) : result.percentage.toFixed(2),
		   avgCoeff:result.avgCoeff,
		   avgTime:result.avgTime,
		   avgScore:result.avgScore,
		   remark:result.note == 'undefined' ? '' : result.note,
		   days:result.item
		});
	}

	async callRestApi(restUrl) {
		var result = [];
		await request.post(restUrl, {}).then(res => {
			if (res.status === 200) {
				result = res.data;
			}
		}).catch(err => ModalIndicator.hide());

		return result;
	}

	async onFetch(page = 1, startFetch, abortFetch) {
	  	var pageSize = 20
		var rowData = []  
		try{
			startFetch([
				{
				title:"昵称昵称昵称昵称昵…",
				score:30,
				date:'2020-03-03'
				},
				], pageSize);
		}catch(err){
			abortFetch();
		}
	};
	renderItem(item){

		return <View style={{alignItems:'center'}}>
			<TouchableOpacity 
			onPress={()=>{
				RouteHelper.navigate("RankDetailPage");
			}}
			style={[styles.rankItem,{width:scaleSize(345)}]}>
				 <View style={{flex:1}}>
				 	<Text style={[styles.title]}>{item.title}</Text>
				 	<Text style={styles.date}>{item.date}</Text>
				 </View>
				 <Text style={styles.score}>+{item.score}</Text>
			</TouchableOpacity>
		</View>
	}	

	render() {
		return <View style={{ flex: 1,backgroundColor:"#F2F6F9" }}>
			<UINavBar title="成绩详情" />
			<View style={{minHeight:scaleSize(100),backgroundColor:"#fff",marginHorizontal:scaleSize(15),marginTop:scaleSize(10)}}>
				<View style={{
					minHeight:scaleSize(80),
					padding:scaleSize(10),
					borderColor:"rgba(0,0,0,0.2)",
					borderBottomWidth:ONE_PX,
				}}>
				    <View style={{flexDirection:"row",alignItems:"center"}}>
             			<Text style={{color:PRIMARY_COLOR,fontSize:18,fontWeight:"500"}}>{this.state.matchName}</Text>
          			</View>
					<View style={{flexDirection:"row",alignItems:"center"}}>
						<Text style={{fontSize:18,fontWeight:"600",color:"#323232"}}>{this.state.userName}</Text>
					</View>
					<View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
						<Text style={{fontWeight:"400",color:"#323232",fontSize:12,fontWeight:"400"}}>{this.state.areaName}{this.state.type}</Text>
						<Text style={{fontSize:12,color:"#646464",fontWeight:"400"}}>{this.state.startDate}~{this.state.endDate}</Text>
					</View>
				</View>
				<View style={{
						borderColor:"rgba(0,0,0,0.2)",
					borderBottomWidth:ONE_PX,padding:scaleSize(10)}}>
					<View style={{height:scaleSize(30),flexDirection:"row",alignItems:'center'}}>
						<View style={{flex:1,flexDirection:"row"}}>
							<Text style={{fontSize:14,color:"#646464",width:scaleSize(85),textAlign:'right'}}>CPSA名次：</Text>
							<Text style={{fontSize:14,color:"rgba(50,50,50,1)",fontWeight:'500'}}>{this.state.cpsaRank}</Text>
						</View>
						<View style={{flex:1,flexDirection:"row"}}>
							<Text style={{fontSize:14,color:"#646464",width:scaleSize(95),textAlign:'right'}}>赛事总名次：</Text>
							<Text style={{fontSize:14,color:"rgba(50,50,50,1)",fontWeight:'500'}}>{this.state.totalRank}</Text>
						</View>
					</View>
					<View style={{height:scaleSize(30),flexDirection:"row",alignItems:'center'}}>
						<View style={{flex:1,flexDirection:"row"}}>
							<Text style={{fontSize:14,color:"#646464",width:scaleSize(85),textAlign:'right'}}>分数：</Text>
							<Text style={{fontSize:14,color:"rgba(50,50,50,1)",fontWeight:'500'}}>{this.state.score}</Text>
						</View>
						<View style={{flex:1,flexDirection:"row"}}>
							<Text style={{fontSize:14,color:"#646464",width:scaleSize(95),textAlign:'right'}}>百分比：</Text>
							<Text style={{fontSize:14,color:"rgba(50,50,50,1)",fontWeight:'500'}}>{this.state.percentage} %</Text>
						</View>
					</View>
					<View style={{height:scaleSize(30),flexDirection:"row",alignItems:'center'}}>
						<View style={{flex:1,flexDirection:"row"}}>
							<Text style={{fontSize:14,color:"#646464",width:scaleSize(85),textAlign:'right'}}>平均系数：</Text>
							<Text style={{fontSize:14,color:"rgba(50,50,50,1)",fontWeight:'500'}}>{this.state.avgCoeff}</Text>
						</View>
						{/* <View style={{flex:1,flexDirection:"row"}}>
							<Text style={{fontSize:14,color:"#646464",width:scaleSize(95),textAlign:'right'}}>平均时间：</Text>
							<Text style={{fontSize:14,color:"rgba(50,50,50,1)",fontWeight:'500'}}>{this.state.avgTime}</Text>
						</View> */}
					</View>
					{/* <View style={{height:scaleSize(30),flexDirection:"row",alignItems:'center'}}>
						<View style={{flex:1,flexDirection:"row"}}>
							<Text style={{fontSize:14,color:"#646464",width:scaleSize(85),textAlign:'right'}}>平均得分：</Text>
							<Text style={{fontSize:14,color:"rgba(50,50,50,1)",fontWeight:'500'}}>{this.state.avgScore}</Text>
						</View>
					</View> */}
					<View style={{height:scaleSize(30),flexDirection:"row",alignItems:'center'}}>
						<View style={{flex:1,flexDirection:"row"}}>
							<Text style={{fontSize:14,color:"#646464",width:scaleSize(85),textAlign:'right'}}>备注：</Text>
							<Text style={{fontSize:14,color:"rgba(50,50,50,1)",fontWeight:'500'}}>{this.state.remark}</Text>
						</View>
					</View>
				</View>
				<View style={{flexDirection:"row",flexWrap:"wrap",padding:scaleSize(10),paddingBottom:scaleSize(16)}}>
					{this.state.days.map((item,index)=>{
						return <View 
						style={{width:scaleSize(55),
							marginLeft:scaleSize(index%4>0?30:0),
							flexDirection:"row",marginTop:scaleSize(index>3?10:0)}} 
						key={index}>
							<Text style={{color:"#646464",fontSize:12,fontWeight:"400"}}>{index + 1}：{' '}</Text>
							<Text style={{color:"#323232",fontSize:12,fontWeight:"500"}}>{item}</Text>
						</View>
					})}
				</View>
			</View>

		</View>
	}

}

var styles={
	
}





