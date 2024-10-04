import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { ModalIndicator, Toast } from 'teaset';
import UINavBar from '../../components/UINavBar';
import UISearchBar from '../../components/UISearchBar';
import UITabBar from '../../components/UITabBar';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView';
import ClubItem from '../ClubPage/ClubItem';
import ActivityItem from '../ClubPage/ActivityItem';
import store from '../../store';
import JMessage from 'jmessage-react-plugin';
import { JG_APP_KEY } from '../../global/constants';
import ApiUrl from '../../api/Url';
import Request from '../../api/Request';
import { scaleSize } from '../../global/utils';
import DynamicItem from './DynamicItem';
import URL from '../../api/Url';

export default class SearchPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginuser: undefined,
			isFocus: true,
			activeIndex: 0,
			tabItemList: [
				{ name: "好友", count: 0 },
				{ name: "俱乐部", count: 0 },
				{ name: "赛事", count: 0 },
				{ name: "培训", count: 0 },
				{ name: "推荐", count: 0 },
				{ name: "教官", count: 0 },
				{ name: "裁判", count: 0 },
				{ name: "动态", count: 0 },
			],
			clubs: [],
			contests: [],
			trainings: [],
			friends: [],
			recommends: [],
			coaches: [],
			judges: [],
			posts: [],
		}
	}

	async componentDidMount() {
		store.UserStore.getLoginUser().then(user => {
			this.setState({ loginuser: user })
		})
	}

	async startSearch(text) {
		ModalIndicator.show("搜索中")

		JMessage.getFriends(async (friendArr) => {
			var res = []
			for (var i = 0; i < friendArr.length; i++) {
				if (friendArr[i].username.includes(text) || friendArr[i].nickname.includes(text)) {
					let user = await Request.post(ApiUrl.USER_LIST, { jgUsername: friendArr[i].username })
					if (user.data.code === 0 && user.data.rows[0]) {
						res.push(user.data.rows[0])
					}
				}
			}

			this.state.friends = res
			this.state.tabItemList[0].count = res.length
			if (res.length > 0) this.state.activeIndex = 0
			this.forceUpdate()
			if (this.state.activeIndex === 0) {
				this.refs.friend_list.search(res)
			}
			// this.props.onSearchFinish && this.props.onSearchFinish(res.length)
		}, error => {
			ModalIndicator.hide()
			console.debug("【极光好友】搜索好友异常: ", error);
		});

		let response = await Request.post(ApiUrl.SEARCH, text)
		// console.debug(response.data.judges)
		if (response.data.code === 0) {
			this.state.tabItemList[1].count = response.data.clubs.length
			this.state.tabItemList[2].count = response.data.contests.length
			this.state.tabItemList[3].count = response.data.trainings.length
			this.state.tabItemList[4].count = response.data.recommends.length
			this.state.tabItemList[5].count = response.data.coachs.length
			this.state.tabItemList[6].count = response.data.judges.length
			this.state.tabItemList[7].count = response.data.posts.length

			// process club data
			if (response.data.clubs.length > 0) {
				this.state.activeIndex = 1
				let categories = await store.AppStore.getCategoryList()
				var clubList = []
				for (var i = 0; i < response.data.clubs.length; i++) {
					var club = response.data.clubs[i]

					var area = ""
					if (club.area?.name) {
						if (club.area.name.split("-").length === 2)
							area = club.area.name.split("-")[1]
					}

					clubList.push({
						bgimg: club.image ? ApiUrl.CLUB_IMAGE + club.image : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
						avatar: club.avatar ? ApiUrl.CLUB_IMAGE + club.avatar : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
						name: club.title,
						city: area,
						cate: categories.find(c => c.code === club.category)?.title,
						club: club,
						loginuser: this.state.loginuser
					})
				}

				this.state.clubs = clubList
			}

			// process contests data
			if (response.data.contests.length > 0) {
				this.state.activeIndex = 2
				for (var i = 0; i < response.data.contests.length; i++) {
					response.data.contests[i].imageUrl = ApiUrl.CONTEST_IMAGE + response.data.contests[i].imageUrl
					response.data.contests[i].loginuser = this.state.loginuser
				}

				this.state.contests = response.data.contests
			}

			// process training data
			if (response.data.trainings.length > 0) {
				this.state.activeIndex = 3
				for (var i = 0; i < response.data.trainings.length; i++) {
					response.data.trainings[i].imageUrl = ApiUrl.TRAINING_IMAGE + response.data.trainings[i].imageUrl
					response.data.trainings[i].loginuser = this.state.loginuser
				}

				this.state.trainings = response.data.trainings
			}

			// process recommend data
			if (response.data.recommends.length > 0) {
				this.state.activeIndex = 4
				for (var i = 0; i < response.data.recommends.length; i++) {
					response.data.recommends[i].recommend = response.data.recommends[i]
					response.data.recommends[i].recommend.mediaPath = URL.RECOMMEND_IMAGE
					response.data.recommends[i].loginuser = this.state.loginuser
				}

				this.state.recommends = response.data.recommends
			}

			// process recommend coach data
			if (response.data.coachs.length > 0) {
				this.state.activeIndex = 5
				for (var i = 0; i < response.data.coachs.length; i++) {
					response.data.coachs[i].coachJudge = response.data.coachs[i]
					response.data.coachs[i].coachJudge.mediaPath = URL.RECOMMEND_IMAGE
					response.data.coachs[i].loginuser = this.state.loginuser
				}

				this.state.coaches = response.data.coachs
			}

			// process recommend judge data
			if (response.data.judges.length > 0) {
				this.state.activeIndex = 6
				for (var i = 0; i < response.data.judges.length; i++) {
					response.data.judges[i].coachJudge = response.data.judges[i]
					response.data.judges[i].coachJudge.mediaPath = URL.RECOMMEND_IMAGE
					response.data.judges[i].loginuser = this.state.loginuser
				}

				this.state.judges = response.data.judges
			}

			// process recommend data
			if (response.data.posts.length > 0) {
				this.state.activeIndex = 7
				for (var i = 0; i < response.data.posts.length; i++) {
					response.data.posts[i].post = response.data.posts[i]
					response.data.posts[i].post.mediaPath = URL.POST_IMAGE
					response.data.posts[i].loginuser = this.state.loginuser
				}

				this.state.posts = response.data.posts
			}

			this.forceUpdate()
		}

		// console.debug(this.statem.friends)
		// if (this.state.activeIndex === 0) this.refs.friend_list.search(this.state.friends)
		if (this.state.activeIndex === 1) this.refs.club_list.search(this.state.clubs)
		if (this.state.activeIndex === 2) this.refs.saishi_list.search(this.state.contests)
		if (this.state.activeIndex === 3) this.refs.peixun_list.search(this.state.trainings)
		if (this.state.activeIndex === 4) this.refs.recommend_list.search(this.state.recommends)
		if (this.state.activeIndex === 5) this.refs.coach_list.search(this.state.coaches)
		if (this.state.activeIndex === 6) this.refs.judge_list.search(this.state.judges)
		if (this.state.activeIndex === 7) this.refs.post_list.search(this.state.posts)

		ModalIndicator.hide()
	}

	render() {
		//#FFCC79
		return <View style={{ flex: 1 }}>
			{/* <Text>launcher...</Text> */}
			<View style={{ height: statusBarHeight }}></View>
			<UISearchBar
				autoFocus={true}
				placeholder="请输入搜索关键词"
				onBlur={() => this.setState({ isFocus: false })}
				onFocus={() => this.setState({ isFocus: true })}
				onCancel={() => RouteHelper.goBack()}
				onSearch={text => this.startSearch(text)}
			/>
			<View style={{ flex: 1, }}>
				<UITabBar
					tabStyle={{ marginHorizontal: scaleSize(10), marginTop: scaleSize(15), flexWrap: "wrap" }}
					onChange={(index) => {
						this.setState({ activeIndex: index })
					}}
					activeIndex={this.state.activeIndex}
					renderTabItem={(index) => {
						return <TouchableOpacity
							onPress={() => {
								// console.debug(index)
								this.setState({ activeIndex: index }, () => {
									if (this.state.activeIndex === 0) this.refs.friend_list.search(this.state.friends)
									if (this.state.activeIndex === 1) this.refs.club_list.search(this.state.clubs)
									if (this.state.activeIndex === 2) this.refs.saishi_list.search(this.state.contests)
									if (this.state.activeIndex === 3) this.refs.peixun_list.search(this.state.trainings)
									if (this.state.activeIndex === 4) this.refs.recommend_list.search(this.state.recommends)
									if (this.state.activeIndex === 5) this.refs.coach_list.search(this.state.coaches)
									if (this.state.activeIndex === 6) this.refs.judge_list.search(this.state.judges)
									if (this.state.activeIndex === 7) this.refs.post_list.search(this.state.posts)
								})
							}}
							style={{ backgroundColor: index == this.state.activeIndex ? "#FFCC79" : "#F2F6F9", width: scaleSize(80), height: scaleSize(40), alignItems: "center", justifyContent: 'center', borderRadius: scaleSize(4), marginRight: scaleSize(5), marginBottom: scaleSize(10) }}>
							<Text style={{ fontSize: 12, color: "rgba(0,0,0,0.8)" }}>{this.state.tabItemList[index].name}({this.state.tabItemList[index].count})</Text>
						</TouchableOpacity>
					}}
				>
					<UITabBar.Item label="好友">
						<View style={{ flex: 1, marginTop: scaleSize(20) }}>
							<FriendList ref="friend_list" />
						</View>
					</UITabBar.Item>
					<UITabBar.Item label="俱乐部">
						<View style={{ flex: 1, marginTop: scaleSize(20) }}>
							<ClubList ref="club_list" />
						</View>
					</UITabBar.Item>
					<UITabBar.Item label="赛事">
						<View style={{ flex: 1, marginTop: scaleSize(20) }}>
							<ActivityList ref="saishi_list" />
						</View>
					</UITabBar.Item>
					<UITabBar.Item label="培训">
						<View style={{ flex: 1, marginTop: scaleSize(20) }}>
							<ActivityList ref="peixun_list" />
						</View>
					</UITabBar.Item>
					<UITabBar.Item label="推荐">
						<View style={{ flex: 1, marginTop: scaleSize(20) }}>
							<RecommendList ref="recommend_list" />
						</View>
					</UITabBar.Item>
					<UITabBar.Item label="教官">
						<View style={{ flex: 1, marginTop: scaleSize(20) }}>
							<CoachList ref="coach_list" type="coachJudge" />
						</View>
					</UITabBar.Item>
					<UITabBar.Item label="裁判">
						<View style={{ flex: 1, marginTop: scaleSize(20) }}>
							<JudgeList ref="judge_list" type="coachJudge" />
						</View>
					</UITabBar.Item>
					<UITabBar.Item label="动态">
						<View style={{ flex: 1, marginTop: scaleSize(20) }}>
							<PostList ref="post_list" type="post" />
						</View>
					</UITabBar.Item>
				</UITabBar>
			</View>
		</View>
	}
}

class RecommendList extends Component {
	search(data) {
		this.listView.updateDataSource(data)
	}
	renderItem(item, index) {
		return <DynamicItem
			onPress={(dynamicItem, isOpenComment = false) => {
				RouteHelper.navigate("DynamicDetailPage", {
					loginuser: item.loginuser,
					item: dynamicItem,
					type: this.props.type ? this.props.type : "recommend",
					refreshHomePage: () => this.refreshPage(),
					isOpenComment: isOpenComment
				});
			}}
			item={item}
			index={index}
			loginuser={item.loginuser}
			listData={this.listView.getRows()}
			showFoot={false} />
	}
	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		try {
			startFetch([], pageSize);
			this.props.onSearchFinish && this.props.onSearchFinish(res)
		} catch (err) {
			abortFetch();
		}
	};

	render() {
		return <UltimateListView
			header={() => { return null }}
			allLoadedText={"没有更多了"}
			waitingSpinnerText={'加载中...'}
			ref={ref => this.listView = ref}
			onFetch={this.onFetch.bind(this)}
			keyExtractor={(item, index) => `${index} -`}
			item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
			displayDate
			emptyView={() => { return <EmptyView /> }}
		/>
	}
}

class PostList extends Component {
	search(data) {
		this.listView.updateDataSource(data)
	}
	renderItem(item, index) {
		return <DynamicItem
			onPress={(dynamicItem, isOpenComment = false) => {
				RouteHelper.navigate("DynamicDetailPage", {
					loginuser: item.loginuser,
					item: dynamicItem,
					type: this.props.type ? this.props.type : "recommend",
					refreshHomePage: () => this.refreshPage(),
					isOpenComment: isOpenComment,
				});
			}}
			item={item}
			index={index}
			loginuser={item.loginuser}
			listData={this.listView.getRows()}
			showFoot={false} />
	}
	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		try {
			startFetch([], pageSize);
			this.props.onSearchFinish && this.props.onSearchFinish(res)
		} catch (err) {
			abortFetch();
		}
	};

	render() {
		return <UltimateListView
			header={() => { return null }}
			allLoadedText={"没有更多了"}
			waitingSpinnerText={'加载中...'}
			ref={ref => this.listView = ref}
			onFetch={this.onFetch.bind(this)}
			keyExtractor={(item, index) => `${index} -`}
			item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
			displayDate
			emptyView={() => { return <EmptyView /> }}
		/>
	}
}

class CoachList extends Component {
	search(data) {
		this.listView.updateDataSource(data)
	}
	renderItem(item, index) {
		return <DynamicItem
			onPress={(dynamicItem, isOpenComment = false) => {
				RouteHelper.navigate("DynamicDetailPage", {
					loginuser: item.loginuser,
					item: dynamicItem,
					type: this.props.type ? this.props.type : "recommend",
					refreshHomePage: () => this.refreshPage(),
					isOpenComment: isOpenComment
				});
			}}
			item={item}
			index={index}
			loginuser={item.loginuser}
			listData={this.listView.getRows()} />
	}
	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		try {
			startFetch([], pageSize);
			this.props.onSearchFinish && this.props.onSearchFinish(res)
		} catch (err) {
			abortFetch();
		}
	};

	render() {
		return <UltimateListView
			header={() => { return null }}
			allLoadedText={"没有更多了"}
			waitingSpinnerText={'加载中...'}
			ref={ref => this.listView = ref}
			onFetch={this.onFetch.bind(this)}
			keyExtractor={(item, index) => `${index} -`}
			item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
			displayDate
			emptyView={() => { return <EmptyView /> }}
		/>
	}
}

class JudgeList extends Component {
	search(data) {
		this.listView.updateDataSource(data)
	}
	renderItem(item, index) {
		return <DynamicItem
			onPress={(dynamicItem, isOpenComment = false) => {
				RouteHelper.navigate("DynamicDetailPage", {
					loginuser: item.loginuser,
					item: dynamicItem,
					type: this.props.type ? this.props.type : "recommend",
					refreshHomePage: () => this.refreshPage(),
					isOpenComment: isOpenComment
				});
			}}
			item={item}
			index={index}
			loginuser={item.loginuser}
			listData={this.listView.getRows()} />
	}
	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		try {
			startFetch([], pageSize);
			this.props.onSearchFinish && this.props.onSearchFinish(res)
		} catch (err) {
			abortFetch();
		}
	};

	render() {
		return <UltimateListView
			header={() => { return null }}
			allLoadedText={"没有更多了"}
			waitingSpinnerText={'加载中...'}
			ref={ref => this.listView = ref}
			onFetch={this.onFetch.bind(this)}
			keyExtractor={(item, index) => `${index} -`}
			item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
			displayDate
			emptyView={() => { return <EmptyView /> }}
		/>
	}
}

class ActivityList extends Component {
	search(data) {
		this.listView.updateDataSource(data)
	}
	renderItem(item, index) {
		return <ActivityItem item={item} index={index} loginuser={item.loginuser} />
	}
	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		try {
			startFetch([], pageSize);
			this.props.onSearchFinish && this.props.onSearchFinish(res)
		} catch (err) {
			abortFetch();
		}
	};

	render() {
		return <UltimateListView
			header={() => { return null }}
			allLoadedText={"没有更多了"}
			waitingSpinnerText={'加载中...'}
			ref={ref => this.listView = ref}
			onFetch={this.onFetch.bind(this)}
			keyExtractor={(item, index) => `${index} -`}
			item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
			displayDate
			emptyView={() => { return <EmptyView /> }}
		/>
	}
}

class ClubList extends Component {
	async search(clubs) {
		this.listView.updateDataSource(clubs)
	}

	renderItem(item, index) {
		return <ClubItem item={item} index={index} loginuser={item.loginuser} />
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		try {
			startFetch([], pageSize);
		} catch (err) {
			abortFetch();
		}
	}

	render() {
		return <UltimateListView
			header={() => { return null }}
			allLoadedText={"没有更多了"}
			waitingSpinnerText={'加载中...'}
			ref={ref => this.listView = ref}
			onFetch={this.onFetch.bind(this)}
			keyExtractor={(item, index) => `${index} -`}
			item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
			displayDate
			emptyView={() => { return <EmptyView /> }}
		/>
	}
}

class FriendList extends Component {
	async search(friends) {
		this.listView.updateDataSource(friends)
	}

	renderItem(item, index) {
		return <TouchableOpacity
			style={{ flexDirection: "row", paddingHorizontal: scaleSize(16), marginTop: scaleSize(index == 0 ? 0 : 15) }}
			activeOpacity={.75}
			onPress={() => {
				store.UserStore.getLoginUser().then(user => {
					RouteHelper.navigate("UserCenterPage", {
						loginuser: user,
						user: item
					});
				})
			}}
		>
			<Image source={{ uri: ApiUrl.CLIENT_USER_IMAGE + item.avatar }} style={{ width: scaleSize(44), height: scaleSize(44) }} />
			<View style={{ marginLeft: scaleSize(16) }}>
				<Text style={styles.name}>{item.nickname}</Text>
				<Text style={styles.mobile}>手机号：{item.phone}{'     '}用户名：{item.userName}</Text>
			</View>
		</TouchableOpacity>
	}

	async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 20
		try {
			startFetch([], pageSize);
		} catch (err) {
			abortFetch();
		}
	}

	render() {
		return <UltimateListView
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

var styles = {
	tip: {
		color: 'rgba(0,0,0,0.60)',
	},
	search_bar: {
		backgroundColor: "rgba(242,246,249,1)",
		borderRadius: scaleSize(3),
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		width: scaleSize(355),
		height: scaleSize(35),
	},
	search_bar_text: {
		color: "#BBBBBB",
		fontSize: 15,
		fontFamily: "PingFangSC-Regular",
	},
	search_icon: {
		marginRight: scaleSize(6),
		width: scaleSize(15),
		height: scaleSize(15),
	},
	row: {
		alignItems: 'center',
		justifyContent: 'center',
		height: scaleSize(50),
		flexDirection: 'row',
	},
	item: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabbar: {
		flexDirection: 'row',
		height: scaleSize(42),
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabItem: {
		width: scaleSize(125),
		height: scaleSize(42),
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabText: {
		fontSize: 15,
		fontWeight: "800",
		color: "#303030",
	},
	sectionHeader: {
		height: scaleSize(50),
		justifyContent: 'center',
		paddingLeft: scaleSize(15),
	},
	name: {
		color: "#000",
		fontSize: 18,
		fontWeight: "400",
	},
	mobile: {
		color: "#8F8F8F",
		fontSize: 14,
		fontWeight: "400",
		marginTop: scaleSize(5),
	}
}