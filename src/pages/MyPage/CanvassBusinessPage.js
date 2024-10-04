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
import { images } from '../../res/images';
import {
	Toast, ModalIndicator
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import EmptyView from '../../components/EmptyView';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import store from '../../store'
import Url from '../../api/Url'
import Request from '../../api/Request'

@inject('UserStore') //注入；
@observer
export default class tmplist extends Component {

	constructor(props) {
		super(props)
		this.state = {
			dataList: []
		}
	}

	search(text) {
		// alert(3);
		this.listView.refresh();
	}

	getData = async () => {
		// ModalIndicator.show("获取数据")
		await Request.post(Url.BUSINESS_INVESTMENT_LIST, {}).then(res => {
			if (res.status === 200) {
				this.setState({ dataList: res.data.rows })
			}

			ModalIndicator.hide()
		}).catch(err => ModalIndicator.hide())
	}

	renderItem(item, index) {
		return <TouchableOpacity
			onPress={() => {
				var itemData = {
					content: "招商详情",
					htmlContent: "<p style='display: flex;align-items: center;justify-content: center; font-size: 18px; font-weight: 700;'>" + item.title + "</p>" + item.detail,
					mediaUrl: item.mediaUrl ? Url.ADS_IMAGE + item.mediaUrl : "http://static.boycodes.cn/shejiixiehui-images/zhaoshang.png",
					navTitle: "招商详情"
				}
				RouteHelper.navigate("SysytemNotificationDetailPage", { itemData: itemData, from: "zhaoshang" })
			}}
			style={{ alignItems: 'center', marginTop: scaleSize(10) }}>
			<ImageBackground
				source={{ uri: item.mediaUrl ? (Url.ADS_IMAGE + item.mediaUrl) : "http://static.boycodes.cn/shejiixiehui-images/zhaoshang.png" }}
				resizeMode="cover"
				style={{ height: scaleSize(150), width: scaleSize(345) }}
			>
			</ImageBackground>
		</TouchableOpacity>
	}


	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20

		await this.getData()

		try {
			startFetch(this.state.dataList, pageSize);
		} catch (err) {
			abortFetch();
		}
	};

	render() {
		return <View style={{ flex: 1 }}>
			<UINavBar title="招商" />
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
				displayDate
				emptyView={() => {
					return <EmptyView />
				}}
			/>
		</View>
	}
}






var styles = {

}
