import React, { Component } from 'react';
import { View, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import ApiUrl from '../../api/Url'
import Request from '../../api/Request'
import UINavBar from '../../components/UINavBar';
import UITabBar from '../../components/UITabBar';
import EmptyView from '../../components/EmptyView';
import { UltimateListView } from 'react-native-ultimate-listview';
import CommonActivityItem from '../HomePage/SubMenuPage/CommonActivityItem';
import DynamicItem from '../HomePage/DynamicItem';
import { UserStore } from '../../store/UserStore';

export default class MyCollectPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: props.loginuser,
			activeIndex: 0,
			myCollection: props.myCollection,
		};
	}

	async componentDidMount() {
		DeviceEventEmitter.addListener("collectionUpdated", () => {
			console.debug("【监听回调，我的收藏页】我的收藏有更新")
			this.listView && this.listView.refresh()
		})

	}
	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20

		var activityCollections = [];
		await Request.post(ApiUrl.USER_COLLECTION_ACTIVITY + this.state.loginuser.id).then(res => {
			if (res.status === 200) {
				activityCollections = res.data.rows;
			}
		}).catch(err => console.log(err));

		try {
			startFetch(activityCollections, pageSize);
		} catch (err) {
			abortFetch();
		}
	};

	extractDate(dateTime) {
		return dateTime ? dateTime.substring(0, 10) : '';
	}

	renderActivityItem(item) {

		// in case this method repeat
		if (!item.shootType) {

			let activityType = item.remark;
			let imagePath = '';

			if ('training' === activityType) {
				imagePath = ApiUrl.TRAINING_IMAGE;
				item.pageText = '培训';
				item.fkTableId = 1;
			} else if ('contest' === activityType) {
				imagePath = ApiUrl.CONTEST_IMAGE;
				item.pageText = '赛事';
				item.fkTableId = 2;
			} else {
				imagePath = ApiUrl.CLUB_ACTIVITY_IMAGE;
				item.pageText = '俱乐部活动';
				item.fkTableId = 3;
			};

			item.imageUrl = item.imageUrl ? imagePath + item.imageUrl : '';
			item.startDate = this.extractDate(item.startDate);
			item.endDate = this.extractDate(item.endDate);
			item.area = item.area.name;
			item.course = item.course.name;
			item.shootType = item.type.name;
		}

		return <CommonActivityItem item={item} />
	}

	render() {
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
			<UINavBar title="我的收藏" />
			<UITabBar
				onChange={(index) => {
					this.setState({
						activeIndex: index,
					})
				}}
				activeIndex={this.state.activeIndex}
			>
				<UITabBar.Item label="推荐、射手/俱乐部动态">
					<View style={{ flex: 1 }}>
						<DynamicList loginuser={this.state.loginuser} />
					</View>
				</UITabBar.Item>
				<UITabBar.Item label="赛事、培训、活动">
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
							item={this.renderActivityItem.bind(this)} // this takes three params (item, index, separator)       
							displayDate
							emptyView={() => {
								return <EmptyView />
							}}
						/>
					</View>
				</UITabBar.Item>
			</UITabBar>
		</View>
	}

}




class DynamicList extends Component {
	constructor(props) {
		super(props)
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20

		var postCollections = [];
		await Request.post(ApiUrl.USER_COLLECTION_POST + this.props.loginuser.id).then(res => {
			if (res.status === 200) {
				postCollections = res.data.rows;
			}
		}).catch(err => console.log(err));

		try {
			startFetch(postCollections, pageSize);
		} catch (err) {
			abortFetch();
		}
	};

	refreshPage() {
		this.setState(
			() => this.listView.refresh()
		)
	}

	renderItem(item, index) {
		const commentCount = item.commentDetailsList.length;

		if (item.recommend) {
			item.recommend.mediaPath = ApiUrl.RECOMMEND_IMAGE;
			item.recommend.commentCount = commentCount;
		} else if (item.post) {
			item.post.mediaPath = ApiUrl.POST_IMAGE;
			item.post.commentCount = commentCount;
		} else {
			// console.debug(item)
			item.clubPost.mediaPath = ApiUrl.CLUB_POST_IMAGE;
			item.clubPost.commentCount = commentCount;
			item.clientUser = {}
			item.clientUser.roles = []
			item.clubPost.clientUser = {}
		}

		if(!item.clientUser) item.clientUser = {}
		if(!item.clientUser.roles) item.clientUser.roles = []

		return <DynamicItem
			onPress={async (itemDetails, isOpenComment) => {
				var loginuser = await UserStore.getLoginUser()
				RouteHelper.navigate("DynamicDetailPage", {
					loginuser: loginuser,
					item: itemDetails,
					refreshHomePage: () => this.refreshPage(),
					isOpenComment: isOpenComment
				});
			}}
			item={item}
			index={index}
			key={index}
			listData={this.listView.getRows()}
			isShowAd={false}
			showFoot={false}
		/>
	}

	render() {
		return <UltimateListView
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
	}
}



