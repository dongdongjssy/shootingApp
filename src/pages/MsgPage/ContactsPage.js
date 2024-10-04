/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-string-refs */
import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	SectionList,
	FlatList,
	DeviceEventEmitter,
} from 'react-native';
import { RouteHelper } from 'react-navigation-easy-helper';
import { images } from '../../res/images';
import { Toast, ModalIndicator } from 'teaset';
import UINavBar from '../../components/UINavBar';
import pinyin from 'pinyin';
import store from '../../store';
import JMessage from 'jmessage-react-plugin';
import { JG_APP_KEY } from '../../global/constants';
import ApiUrl from '../../api/Url';
import Request from '../../api/Request';
import { UserStore } from '../../store/UserStore';

export default class ContactsPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			sections: [],
			letterArr: [],
			list: [],
			groupSections: [],
			groupLetterArr: [],
			groupList: [],
			tabActiveIndex: 0,
			friendReqs: [],
			loginUser: undefined,
		};

		// JMessage.removeFromFriendList({ username: 'libin', appKey: JG_APP_KEY },
		// 	() => {
		// 		// do something.

		// 	}, (error) => {
		// 		var code = error.code
		// 		var desc = error.description
		// 	});

		this.getFriendRequestList = this.getFriendRequestList.bind(this);
		this.getFriendList = this.getFriendList.bind(this);
		this.getFriends = this.getFriends.bind(this);
	}

	async componentDidMount() {
		ModalIndicator.show("获取数据");

		store.UserStore.getLoginUser().then(loginUser => {
			this.setState({ loginUser: loginUser })
		})

		await this.getFriendList();
		await this.getFriendRequestList();
		await this.getGroupList();

		DeviceEventEmitter.addListener('saveFriendRequest', res => {
			this.getFriendRequestList();
		});

		DeviceEventEmitter.addListener('friendRequestAccepted', res => {
			this.getFriends();
		});

		DeviceEventEmitter.addListener('userUpdated', (res) => {
			if (res.user) {
				this.setState({ loginuser: res.user })
			}
		})

		ModalIndicator.hide()
	}

	async getFriendRequestList() {
		await store.AppStore.getFriendRequest().then(requests => {
			if (requests && requests.length > 0) {
				this.setState({ friendReqs: requests });
			} else {
				this.setState({ friendReqs: [] });
			}
		});
	}

	async getFriendList() {
		await this.getFriends();
	}

	async getGroupList() {
		var loginuser = await UserStore.getLoginUser()

		let myJoinClubs = await Request.post(ApiUrl.JOIN_CLUB_APPLICATION_LIST, {
			clientUserId: loginuser.id,
			status: 1,
		})

		// console.debug("my join club: ", myJoinClubs.data.rows.length)

		let clubResult = []
		if (myJoinClubs && myJoinClubs.data.rows.length > 0) {
			for (var i = 0; i < myJoinClubs.data.rows.length; i++) {
				let myJoinClub = myJoinClubs.data.rows[i]
				let club = await Request.post(ApiUrl.CLUB_GET_BY_ID + myJoinClub.clubId)
				console.debug("club data:, ", club.data)
				if (club && club.data) {
					club.data.club = club.data
					clubResult.push(club.data)
				}
			}
		}

		if (clubResult.length > 0) {
			var groupArr = clubResult
			var letterArr = [];
			var sections = [];

			clubResult.map((item, index) => {
				item.club.nickname = item.club.title
				item.club.avatar = item.club.avatar ?
					ApiUrl.CLUB_IMAGE + item.club.avatar :
					"http://static.boycodes.cn/shejiixiehui-images/dongtai.png"

				if (item.club.title) {
					letterArr.push(
						pinyin(item.club.title.substring(0, 1), {
							style: pinyin.STYLE_FIRST_LETTER,
						})[0][0].toUpperCase(),
					);
				}

				letterArr = [...new Set(letterArr)].sort();
			});

			letterArr.map((item, index) => {
				sections.push({
					title: item,
					data: [],
				});
			});

			groupArr.map(item => {
				let listItem = item.club;
				sections.map(item => {
					let first = listItem.nickname.substring(0, 1);
					let test = pinyin(first, {
						style: pinyin.STYLE_FIRST_LETTER,
					})[0][0].toUpperCase();

					if (item.title == test) {
						item.data.push({
							name: listItem.title,
							mobile: '',
							username: listItem.title,
							avatar: listItem.avatar,
							type: "group",
							groupId: listItem.jgGroupId
						});
					}
				});
			});

			this.setState({
				groupList: groupArr,
				groupSections: sections,
				groupLetterArr: letterArr,
			}, () => ModalIndicator.hide())
		}
	}

	async getFriends() {
		JMessage.getFriends(friendArr => {
			console.debug("【极光好友列表】获取我的好友，总数: ", friendArr.length);

			var letterArr = [];
			var sections = [];
			var list = friendArr;

			friendArr.map((item, index) => {
				letterArr.push(
					pinyin(item.nickname.substring(0, 1), {
						style: pinyin.STYLE_FIRST_LETTER,
					})[0][0].toUpperCase(),
				);

				letterArr = [...new Set(letterArr)].sort();
			});

			letterArr.map((item, index) => {
				sections.push({
					title: item,
					data: [],
				});
			});

			list.map(item => {
				let listItem = item;
				sections.map(item => {
					let first = listItem.nickname.substring(0, 1);
					let test = pinyin(first, {
						style: pinyin.STYLE_FIRST_LETTER,
					})[0][0].toUpperCase();

					if (item.title == test) {
						item.data.push({
							name: listItem.nickname,
							mobile: listItem.extras ? listItem.extras.phone : listItem.username,
							username: listItem.username,
							avatar: listItem.extras && listItem.extras.avatar ?
								ApiUrl.CLIENT_USER_IMAGE + listItem.extras.avatar :
								"http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
						});
					}
				});
			});

			this.setState({
				list: friendArr,
				sections: sections,
				letterArr: letterArr,
			}, () => ModalIndicator.hide())
		},
			error => {
				ModalIndicator.hide();
				Toast.info("获取好友列表失败，请刷新重试");
				console.debug("【极光好友列表错误】获取好友列表异常: ", error);
			},
		);
	}

	_renderItem(item, index) {
		// console.debug(item)
		return (
			<TouchableOpacity
				style={{ flexDirection: 'row', paddingHorizontal: scaleSize(16), marginTop: scaleSize(index == 0 ? 0 : 15), }}
				activeOpacity={0.75}
				onPress={() => {
					item.type && item.type === "group" ?
						RouteHelper.navigate('ChatPage', {
							loginUser: this.state.loginUser,
							conversation: {
								user: item,
								type: 'group',
								groupId: item.groupId
							}
						}) :
						RouteHelper.navigate('ChatPage', {
							loginUser: this.state.loginUser,
							conversation: {
								user: item,
								type: 'single'
							}
						})
				}}>
				<Image source={{ uri: item.avatar }} style={{ width: scaleSize(44), height: scaleSize(44) }} />
				<View style={{ marginLeft: scaleSize(16) }}>
					<Text style={styles.name}>{item.name}</Text>
					{
						(item.type && item.type === "group") ?
							<Text style={styles.mobile}>俱乐部名: {item.username}</Text> :
							<View>
								<Text style={styles.mobile}>
									手机号: {item.mobile}
								</Text>
								<Text style={styles.mobile}>
									用户名: {item.username}
								</Text>
							</View>
					}
				</View>
			</TouchableOpacity>
		);
	}

	_renderSectionHeader(sectionItem) {
		const { section } = sectionItem;
		return (
			<View style={styles.sectionHeader}>
				<Text style={{}}>{section.title.toUpperCase()}</Text>
			</View>
		);
	}

	_onFriendSelect = key => {
		this.refs._sectionList.scrollToLocation({
			itemIndex: 0,
			sectionIndex: key,
			viewOffset: 20,
		});
	}

	_onGroupSelect = key => {
		this.refs._groupList.scrollToLocation({
			itemIndex: 0,
			sectionIndex: key,
			viewOffset: 20,
		});
	}

	render() {
		var activeTab = {
			borderBottomWidth: 2,
			borderColor: PRIMARY_COLOR,
		};
		var activeTabText = {
			fontWeight: 'bold',
			fontSize: 18,
			color: PRIMARY_COLOR,
		};

		return (
			<View style={{ flex: 1 }}>
				<UINavBar title="通讯录" />
				<View style={styles.tabbar}>
					<TouchableOpacity style={[styles.tabItem, this.state.tabActiveIndex == 0 ? activeTab : null]}
						onPress={() => this.setState({ tabActiveIndex: 0, })}>
						<Text style={[styles.tabText, this.state.tabActiveIndex == 0 ? activeTabText : null]}>好友</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.tabItem, this.state.tabActiveIndex == 1 ? activeTab : null]}
						onPress={() => this.setState({ tabActiveIndex: 1 })}>
						<Text style={[styles.tabText, this.state.tabActiveIndex == 1 ? activeTabText : null]}>群</Text>
					</TouchableOpacity>
				</View>
				<View style={{ height: scaleSize(25) }} />
				<TouchableOpacity
					onPress={() => RouteHelper.navigate('FriendRequestPage')}
					style={{ height: scaleSize(55), flexDirection: 'row', alignItems: 'center', paddingHorizontal: scaleSize(15), }}>
					<Image source={images.common.add_friend} style={{ width: scaleSize(30), height: scaleSize(30), tintColor: PRIMARY_COLOR, }} />
					<Text style={{ marginLeft: scaleSize(16), color: '#000', fontSize: 18, fontWeight: '400', }}>好友请求</Text>
					<View style={{ position: 'absolute', right: 45, width: scaleSize(25), height: scaleSize(25), borderRadius: 25, backgroundColor: '#D43D3E', borderColor: '#D43D3E', borderWidth: 1, }}>
						<Text style={{ color: '#fff', textAlign: 'center', textAlignVertical: 'center', height: scaleSize(23) }}>
							{this.state.friendReqs.length}
						</Text>
					</View>
					<Image source={images.common.arrow_right2} style={{ width: scaleSize(10), height: scaleSize(17), position: 'absolute', right: scaleSize(17), }} />
					<View style={{ height: 1, width: scaleSize(300), backgroundColor: '#E5E5E5', position: 'absolute', right: 0, bottom: 0, }} />
				</TouchableOpacity>

				<View style={{ height: scaleSize(20) }} />

				{
					this.state.tabActiveIndex === 0 ?
						<View style={{ flex: 1 }}>
							<SectionList
								ref="_sectionList"
								renderItem={({ item, index }) => this._renderItem(item, index)}
								renderSectionHeader={this._renderSectionHeader}
								sections={this.state.sections}
								keyExtractor={(item, index) => item + index}
								ItemSeparatorComponent={() => <View style={{}} />}
							/>

							{/*右侧字母栏*/}
							<View style={{ position: 'absolute', right: scaleSize(13) }}>
								<FlatList
									data={this.state.letterArr}
									keyExtractor={(item, index) => index.toString()}
									renderItem={({ item, index }) => (
										<TouchableOpacity
											style={styles.letterStyle}
											onPress={() => {
												this._onFriendSelect(index);
											}}>
											<Text style={{}}>{item.toUpperCase()}</Text>
										</TouchableOpacity>
									)}
								/>
							</View>
						</View> :
						<View style={{ flex: 1 }}>
							<SectionList
								ref="_groupList"
								renderItem={({ item, index }) => this._renderItem(item, index)}
								renderSectionHeader={this._renderSectionHeader}
								sections={this.state.groupSections}
								keyExtractor={(item, index) => item + index}
								ItemSeparatorComponent={() => <View style={{}} />}
							/>

							{/*右侧字母栏*/}
							<View style={{ position: 'absolute', right: scaleSize(13) }}>
								<FlatList
									data={this.state.groupLetterArr}
									keyExtractor={(item, index) => index.toString()}
									renderItem={({ item, index }) => (
										<TouchableOpacity
											style={styles.letterStyle}
											onPress={() => {
												this._onGroupSelect(index);
											}}>
											<Text style={{}}>{item.toUpperCase()}</Text>
										</TouchableOpacity>
									)}
								/>
							</View>
						</View>
				}
			</View>
		);
	}
}

var styles = {
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
		fontWeight: '800',
		color: '#303030',
	},
	sectionHeader: {
		height: scaleSize(50),
		justifyContent: 'center',
		paddingLeft: scaleSize(15),
	},
	name: {
		color: '#000',
		fontSize: 18,
		fontWeight: '400',
	},
	mobile: {
		color: '#8F8F8F',
		fontSize: 14,
		fontWeight: '400',
		marginTop: scaleSize(5),
	},
};
