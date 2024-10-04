import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, DeviceEventEmitter, BackHandler } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { Toast, ModalIndicator } from 'teaset';
import UINavBar from '../../components/UINavBar';
import EmptyView from '../../components/EmptyView';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import MyActivityItem from './MyActivityItem';
import Url from '../../api/Url';
import Request from '../../api/Request';
import store from '../../store'

export default class MyActivityPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: this.props.navigation.state.params.loginuser,
			type: this.props.navigation.state.params.type,
			dataList: [],
			myTraing: [], // 我的培训
			myContest: [], // 我的赛事
		}

	}

	componentDidMount(){
		DeviceEventEmitter.addListener("baomingUpdated", () => {
			console.debug("【监听回调，我的主页】我的赛事，培训有更新")
			store.UserStore.getLoginUser().then(loginuser => {
				this.setState({ loginuser: loginuser, status: loginuser.status }, async () => {
					await this.getMyTrainingAndContest()
				})
			})
		})
	}

	componentWillMount() {
		// //监听返回键
		BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
	}

	componentWillUnmount() {
		//取消对返回键的监听
		BackHandler.removeEventListener('hardwareBackPress', this.onBackClicked);
	}

	//BACK物理按键监听
	onBackClicked = () => {
		RouteHelper.goBack();
		DeviceEventEmitter.emit("baomingUpdated")
		return true;
	}

	async getDataList () {
		var dataList = []
		if (this.state.type === "training") {
			for (var i = 0; i < this.state.myTraing.length; i++) {
				let res = await Request.post(Url.TRAINING_BY_ID + this.state.myTraing[i].fkId)
				if (res.data.imageUrl)
					res.data.imageUrl = Url.TRAINING_IMAGE + res.data.imageUrl
					res.data.fkTableId = this.state.myTraing[i].fkTable
					res.data.myActivityId = this.state.myTraing[i].id
					res.data.releaseStatus = this.state.myTraing[i].status
				if (res.status === 200) {
					dataList.push(res.data)
				}
			}
		}

		if (this.state.type === "contest") {
			for (var i = 0; i < this.state.myContest.length; i++) {
				if(this.state.myContest[i].fkTable == 2){
					let res = await Request.post(Url.CONTEST_BY_ID + this.state.myContest[i].fkId)
					res.data.imageUrl = Url.CONTEST_IMAGE + res.data.imageUrl
					res.data.fkTableId = this.state.myContest[i].fkTable
					res.data.myActivityId = this.state.myContest[i].id
					res.data.releaseStatus = this.state.myContest[i].status
					if (res.status === 200) {
						dataList.push(res.data)
					}
				}else if(this.state.myContest[i].fkTable == 3){
					let res = await Request.post(Url.CLUB_ACTIVITY_BY_ID + this.state.myContest[i].fkId)
					res.data.imageUrl = Url.CLUB_ACTIVITY_IMAGE + res.data.imageUrl
					res.data.fkTableId = this.state.myContest[i].fkTable
					res.data.myActivityId = this.state.myContest[i].id
					res.data.releaseStatus = this.state.myContest[i].status
					if (res.status === 200) {
						dataList.push(res.data)
					}
				}
			}
		}

		this.setState({ dataList: dataList })
		this.listView.updateDataSource(dataList);
	}
	

	async onFetch(page = 1, startFetch, abortFetch) {
		let pageSize = 20
		await this.getMyTrainingAndContest()
		try {
			startFetch(this.state.dataList, pageSize);
		} catch (err) {
			abortFetch();
		}
	}

	// 获取我的培训和赛事
	getMyTrainingAndContest = async () => {
		await Request.post(Url.REGISTER_LIST, { clientUserId: this.state.loginuser.id }).then(res => {
			if (res.status === 200) {
				var trainings = res.data.rows.filter(t => t.fkTable === 1)
				// console.debug("我的培训", JSON.stringify(trainings))
				var contests = res.data.rows.filter(c => c.fkTable === 2 || c.fkTable === 3)
				// console.debug("我的赛事", JSON.stringify(contests))

				this.setState({ myTraing: trainings, myContest: contests },async ()=>{
					await this.getDataList()
				})
			}
		}).catch(err => ModalIndicator.hide())
	} 

	renderItem(item, index) {
		return <MyActivityItem item={item} index={index} loginuser={this.state.loginuser} releaseStatus={item.releaseStatus}/>
	}

	render() {
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
			<UINavBar title={this.state.type === "training" ? "我的培训" : "我的赛事"} />
			<View style={{ flex: 1 }}>

				<UltimateListView
					style={{ flex: 1 }}
					header={() => {
						return null;
					}}
					allLoadedText={"没有更多了"}
					waitingSpinnerText={'加载中...'}
					ref={ref => this.listView = ref}
					onFetch={this.onFetch.bind(this)}
					keyExtractor={(item, index) => `${index} -`}
					item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
					displayDate
					emptyView={() => {
						return <EmptyView />
					}}
				/>
			</View>
		</View>
	}

}