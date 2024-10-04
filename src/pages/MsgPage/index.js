import React, {Component} from 'react';
import {DeviceEventEmitter, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {RouteHelper} from 'react-navigation-easy-helper';
import {images} from '../../res/images';
import UINavBar from '../../components/UINavBar';
import {Toast} from 'teaset';
import JMessage from 'jmessage-react-plugin';
import store from '../../store';
import ApiUrl from '../../api/Url';
import Request from '../../api/Request';
import {ClientStatusEnum} from '../../global/constants';
import UIConfirm from '../../components/UIConfirm';
import {UserStore} from '../../store/UserStore';
import {scaleSize} from '../../global/utils';

export default class MsgPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loginUser: undefined,
      hasFriendRequest: false,
      friendReqs: [],
      serviceList: [
        {
          icon: images.common.service,
          name: 'CPSA客服',
          updateTime: '2020/05/01',
        },
        {icon: images.common.inbox, name: '系统消息', updateTime: '2020/05/01'},

      ],
      msgList: [],
      //{"atMsgId": -1, "conversationType": "single", "latestMessage": {"atAll": false, "atMe": false, "createTime": 1627538541781, "extras": [Object], "from": [Object], "id": "1", "serverMessageId": "12182392897", "target": [Object], "text": "112", "type": "text", "unreceiptCount": 0}, "target": {"address": "天津市西青区", "appKey": "d27e90395d0fc5adac3b3c65", "avatarThumbPath": "", "birthday": 0, "extras": [Object], "gender": "unknown", "isFriend": true, "isInBlackList": false, "isNoDisturb": false, "nickname": "18834388787", "noteName": "", "noteText": "", "region": "", "signature": "", "type": "user", "username": "17602633004"}, "text": "112", "title": "18834388787", "unreadCount": 0},
      isUnreadMsg: false,
      systemMsgUpdTime: null,
      srvMsgUpdTime: null,
    };

    this.getFriendRequestList = this.getFriendRequestList.bind(this);
    this.receiveMessageCallback = this.receiveMessageCallback.bind(this);
    this.resetUnreadMsgCount = this.resetUnreadMsgCount.bind(this);
    this.closeChatCallback = this.closeChatCallback.bind(this);
    this._renderInternalService = this._renderInternalService.bind(this);
    this._renderConversationList = this._renderConversationList.bind(this);
  }

  async componentDidMount() {
    this.state.loginUser = await store.UserStore.getLoginUser();
    this.state.isUnreadMsg = await store.AppStore.isUnReadMsg();
    this.forceUpdate();

    this.getFriendRequestList();
    this.getConversations();

    DeviceEventEmitter.addListener('isMsgReadUpdated', res => {
      this.state.isUnreadMsg = res.isRead;
      this.forceUpdate();
    });

    DeviceEventEmitter.addListener('notifyArrived', res => {
      var time = new Date();
      this.state.systemMsgUpdTime = this.renderTime(time);
      this.forceUpdate();
    });

    DeviceEventEmitter.addListener('saveFriendRequest', res =>
      this.getFriendRequestList(),
    );
    DeviceEventEmitter.addListener('chatClosed', res =>
      this.closeChatCallback(res),
    );
    DeviceEventEmitter.addListener('userUpdated', res => {
      console.debug('【监听回调，消息主页】更新本地内存用户信息');
      if (res.user) {
        this.setState({loginuser: res.user});
      }

      JMessage.getMyInfo(UserInf => {
        if (UserInf.username) {
          JMessage.logout();
        }

        JMessage.login(
          {
            username: res.user.jgUsername,
            password: res.user.jgUsername,
          },
          () => {
            /*登录成功回调*/
          },
          error => {
            /*登录失败回调*/
          },
        );
      });
    });
    JMessage.addReceiveMessageListener(this.receiveMessageCallback);
  }

  componentWillUnmount() {
    JMessage.removeReceiveMessageListener(this.receiveMessageCallback);
  }

  getDisplayText = message => {
    var displayContent = '';

    if (message && message.type) {
      if (message.type === 'image') {
        displayContent = '[图片]';
      }

      if (message.type === 'video') {
        displayContent = '[视频]';
      }

      if (message.type === 'voice') {
        displayContent = '[语音]';
      }

      if (message.type === 'file') {
        displayContent = '[文件]';
      }

      if (message.type === 'text') {
        displayContent = message.text;
      }

      if (message.type === 'event') {
        if (message.eventType === 'group_info_updated') {
          displayContent = '群名称更新了';
        }
      }
    }

    return displayContent;
  };

  getConversations = async () => {
    var user = await UserStore.getLoginUser();
    JMessage.getConversations(
      async conArr => {
        console.log(JSON.stringify(conArr));
        console.debug('【极光会话列表】获取列表，会话数目: ', conArr.length);

        var findServiceMsgIndex = conArr.findIndex(msg => msg.title === 'CPSA');
        if (findServiceMsgIndex >= 0) {
          console.debug('CPSA消息');
          if (conArr[findServiceMsgIndex].latestMessage) {
            var updTime = null;
            if (conArr[findServiceMsgIndex].latestMessage.createTime) {
              updTime = this.renderTime(
                new Date(conArr[findServiceMsgIndex].latestMessage.createTime),
              );
            } else {
              updTime = this.renderTime(new Date());
            }

            this.setState({srvMsgUpdTime: updTime});
          }
          conArr.splice(findServiceMsgIndex, 1);
          this.setState({serviceMsg: false});
        }

        var convs = conArr.filter(
          c =>
            c.latestMessage &&
            c.latestMessage.from &&
            c.latestMessage.from.username &&
            c.latestMessage.from.username !== '系统消息',
        );

        var convs = [];
        for (var i = 0; i < conArr.length; i++) {
          var c = conArr[i];
          if (c.conversationType && c.conversationType === 'group') {
            let clubResult = await Request.post(ApiUrl.CLUB_LIST, {
              jgGroupId: c.target.id,
            });
            let club;
            if (clubResult.data.rows) {
              club = clubResult.data.rows.find(
                cr => cr.jgGroupId === c.target.id,
              );
            }
            // console.debug(club)

            if (!club) {
              continue;
            }

            c.target.avatar = club?.avatar;
            c.target.extras = {};
            c.target.extras.avatar = club?.avatar;

            if (c.latestMessage) {
              var displayContent = this.getDisplayText(c.latestMessage);
              c.text = displayContent;
            }
          }

          convs.push(c);
        }
        
        this.setState({msgList: convs});
        console.debug('msg list: ', convs);
      },
      error => {
        Toast.info('获取会话列表出错，请重试');
        console.debug('【极光错误】获取会话列表出错: ', error);
      },
    );
  };

  receiveMessageCallback = async message => {
    if (
      message.from &&
      message.from.username &&
      message.from.username === 'CPSA' &&
      message.target &&
      message.target.type &&
      message.target.type === 'user'
    ) {
      console.debug('【极光收消息】收到客服消息: ' + JSON.stringify(message));
      this.setState({serviceMsg: true});
      if (message.createTime) {
        var updTime = this.renderTime(new Date(message.createTime));
        this.setState({srvMsgUpdTime: updTime});
      } else {
        var updTime = this.renderTime(new Date());
        this.setState({srvMsgUpdTime: updTime});
      }
      return;
    }

    if (message.target && message.target.type === 'group') {
      // console.debug(message)
      if (
        message.from &&
        message.from.username &&
        message.from.username == '系统消息'
      ) {
        return;
      }
      console.debug(
        '【极光收消息】收到新消息，更新到消息主页，来自群: ' +
        (message.target && message.target.name),
      );
      console.log(message);
      let clubResult = await Request.post(ApiUrl.CLUB_LIST, {
        jgGroupId: message.target.id,
      });
      message.target.avatar = clubResult.data.rows[0]?.avatar;

      var displayContent = this.getDisplayText(message);

      var conList = [...this.state.msgList];
      var findConIndex = conList.findIndex(
        item => item.title === message.target.name,
      );

      let atMsgId = -1;
      if (message.atAll === true || message.atMe === true) {
        atMsgId = message.id;
      }
      if (findConIndex >= 0) {
        var findCon = conList[findConIndex];
        findCon.unreadCount = findCon.unreadCount ? findCon.unreadCount + 1 : 1;
        findCon.latestMessage.text = displayContent;
        if (findCon.atMsgId === -1 || findCon.atMsgId === '-1') {
          findCon.atMsgId = atMsgId;
        }
      } else {
        message.username = message.name;
        conList.push({
          title: message.target.name,
          target: message.target,
          latestMessage: {createTime: message.createTime, text: displayContent},
          unreadCount: 1,
          atMsgId: atMsgId,
        });
      }

      this.setState({msgList: conList});
    } else {
      console.debug(
        '【极光收消息】收到新消息，更新到消息主页，来自好友: ' +
        (message.from && message.from.username),
      );
      var displayContent = this.getDisplayText(message);

      var conList = [...this.state.msgList];
      var findConIndex = conList.findIndex(
        item => item.target.username === message.from.username,
      );

      if (findConIndex >= 0) {
        var findCon = conList[findConIndex];
        findCon.unreadCount = findCon.unreadCount ? findCon.unreadCount + 1 : 1;
        findCon.latestMessage.text = displayContent;
      } else {
        conList.push({
          target: message.from,
          latestMessage: {createTime: message.createTime, text: displayContent},
          unreadCount: 1,
        });
      }

      this.setState({msgList: conList});
    }
  };

  closeChatCallback = res => {
    // var username = res.user?.username

    // if (username) {
    // 	if (username === "cpsa_customer_service") this.setState({ serviceMsg: false })

    // 	var conList = [...this.state.msgList]
    // 	var findConIndex = conList.findIndex(item => item.target.username === username)

    // 	if (findConIndex >= 0) {
    // 		var findCon = conList[findConIndex]
    // 		findCon.unreadCount = 0
    // 	}

    // 	this.setState({ msgList: conList })
    // }
    this.getConversations();
  };

  getFriendRequestList = () => {
    store.AppStore.getFriendRequest().then(requests => {
      if (requests && requests.length > 0) {
        this.setState({hasFriendRequest: true, friendReqs: requests});
      } else {
        this.setState({hasFriendRequest: false, friendReqs: []});
      }
    });
  };

  resetUnreadMsgCount = (msg, index) => {
    if (msg.target && msg.target.type === 'group') {
      JMessage.resetUnreadMessageCount(
        {type: 'group', groupId: msg.target.id},
        conversation => {
          var conList = [...this.state.msgList];
          conList[index].unreadCount = 0;
          conList[index].atMsgId = -1;
          this.setState({msgList: conList});

          console.debug('【极光会话列表】标记消息已读: ', msg.title);
        },
        error => {
          Toast.info('获取会话列表出错，请重试');
          console.debug('【极光错误】标记消息已读出错: ', error);
        },
      );
    } else {
      JMessage.resetUnreadMessageCount(
        {type: 'single', username: msg.target.username},
        conversation => {
          var conList = [...this.state.msgList];
          conList[index].unreadCount = 0;
          this.setState({msgList: conList});

          console.debug('【极光会话列表】标记消息已读: ', msg.title);
        },
        error => {
          Toast.info('获取会话列表出错，请重试');
          console.debug('【极光错误】标记消息已读出错: ', error);
        },
      );
    }
  };

  _renderInternalService = () => {
    if (
      this.state.loginUser &&
      this.state.loginUser.jgUsername === 'CPSA'
    ) {
      return (
        <View>
          <TouchableOpacity
            style={styles.msgItem}
            onPress={() => RouteHelper.navigate('NotificationsPage')}>
            <View style={styles.avatarCon}>
              <Image source={images.common.inbox} style={styles.msgAvatar}/>
              {this.state.isUnreadMsg ? <View style={styles.dot}/> : null}
            </View>
            <View style={styles.msgCon}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.name}>{'系统消息'}</Text>
                <Text style={styles.updateTime}>
                  {this.state.systemMsgUpdTime}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View>
          <TouchableOpacity
            style={styles.msgItem}
            onPress={() => {
              //未认证权限可以联系CPSA客服
              // if (
              //   this.state.loginUser &&
              //   this.state.loginUser.status === ClientStatusEnum.VERIFIED.code
              // ) {
              this.setState({serviceMsg: false});
              RouteHelper.navigate('ChatPage', {
                loginUser: this.state.loginUser,
                conversation: {
                  user: {
                    nickname: 'CPSA客服',
                    username: 'CPSA',
                    name: 'CPSA客服',
                  },
                  type: 'single',
                },
              });
              // } else {
              //   UIConfirm.show('您尚未完成认证，无法添加好友');
              // }
            }}>
            <View style={styles.avatarCon}>
              <Image source={images.common.service} style={styles.msgAvatar}/>
              {this.state.serviceMsg ? <View style={styles.dot}/> : null}
            </View>
            <View style={styles.msgCon}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.name}>{'CPSA客服'}</Text>
                <Text style={styles.updateTime}>
                  {this.state.srvMsgUpdTime}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.msgItem}
            onPress={() => {
              console.log(JSON.stringify(this.state.loginUser))
              if (this.state.loginUser == null) {
                UIConfirm.show("访客不可查看")
                return
              } else {
                RouteHelper.navigate('NotificationsPage')
              }
            }}>
            <View style={styles.avatarCon}>
              <Image source={images.common.inbox} style={styles.msgAvatar}/>
              {this.state.isUnreadMsg ? <View style={styles.dot}/> : null}
            </View>
            <View style={styles.msgCon}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.name}>{'系统消息'}</Text>
                <Text style={styles.updateTime}>
                  {this.state.systemMsgUpdTime}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  _renderConversationList = () => {
    console.log(this.state.msgList[0], '==========msgList')
    return this.state.msgList.map((item, index) => {
      var isRead = item.unreadCount === 0;

      var createTime;
      if (item.latestMessage) {
        createTime = new Date(item.latestMessage.createTime);
        item.text = this.getDisplayText(item.latestMessage);
      } else {
        createTime = new Date();
      }

      if (
        item.latestMessage &&
        item.latestMessage.from &&
        item.latestMessage.from.username === 'CPSA'
      ) {
        return;
      }

      // console.debug(items)

      return (
        <TouchableOpacity
          style={styles.msgItem}
          key={index}
          onPress={() => {
            this.resetUnreadMsgCount(item, index);
            if (!item.target.name) {
              item.target.name = item.target.nickname;
            }

            if (item.target && item.target.type === 'group') {
              item.target.groupId = item.target.id;
              RouteHelper.navigate('ChatPage', {
                loginUser: this.state.loginUser,
                conversation: {
                  user: item.target,
                  groupId: item.target.id,
                  type: 'group',
                },
              });
            } else {
              RouteHelper.navigate('ChatPage', {
                loginUser: this.state.loginUser,
                conversation: {
                  user: item.target,
                  type: 'single',
                },
              });
            }
          }}>
          <View style={styles.avatarCon}>
            <Image
              source={{
                uri: item?.target?.extras?.avatar
                  ? (item.conversationType === 'group'
                  ? ApiUrl.CLUB_IMAGE
                  : ApiUrl.CLIENT_USER_IMAGE) + item?.target?.extras?.avatar
                  : 'http://static.boycodes.cn/shejiixiehui-images/dongtai.png',
              }}
              style={styles.msgAvatar}
            />
            {isRead ? null : <View style={styles.dot}/>}
          </View>
          {item.text ? (
            <View style={styles.msgCon}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.name}>{item.title}</Text>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text style={styles.text} numberOfLines={1}>
                  <Text
                    style={{color: (item.atMsgId !== -1 && item.atMsgId !== '-1') ? 'red' : '#8F8F8F'}}>
                    {!isRead
                      ? (item.atMsgId !== -1 && item.atMsgId !== '-1')
                        ? '[有人@你]'
                        : '[' + item.unreadCount + '条]'
                      : ''}
                  </Text>
                  {item.text}
                </Text>
                <Text style={styles.updateTime}>
                  {this.renderTime(createTime)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.msgCon}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.name}>{item.title}</Text>
                {/* <Text style={styles.updateTime}>{this.renderTime(createTime)}</Text> */}
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    });
  };

  renderTime(time) {
    return (
      time.getFullYear() +
      '/' +
      (time.getMonth() + 1 > 9
        ? time.getMonth() + 1
        : '0' + (time.getMonth() + 1)) +
      '/' +
      (time.getDate() > 9 ? time.getDate() : '0' + time.getDate()) +
      ' ' +
      (time.getHours() > 9 ? time.getHours() : '0' + time.getHours()) +
      ':' +
      (time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes())
    );
  }

  render() {
    return (
      <View>
        <UINavBar
          // leftView={null}
          rightView={
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={[styles.navIconContainer, {marginRight: scaleSize(15)}]}
                onPress={() => {
                  if (this.state.loginUser == null) {
                    UIConfirm.show("访客无法添加好友")
                    return
                  } else if (this.state.loginUser && this.state.loginUser.status === ClientStatusEnum.VERIFIED.code) {
                    RouteHelper.navigate('ContactsPage');
                  } else {
                    UIConfirm.show('您尚未完成认证，无法添加好友');
                  }
                }}>
                <Image style={styles.navIcon} source={images.common.contactWhite}/>
                {this.state.hasFriendRequest && <View style={styles.dot}/>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navIconContainer, {marginRight: scaleSize(20)}]}
                onPress={() => {
                  if (this.state.loginUser == null) {
                    UIConfirm.show("访客无法添加好友")
                    return
                  } else if (this.state.loginUser && this.state.loginUser.status === ClientStatusEnum.VERIFIED.code) {
                    RouteHelper.navigate('SearchFriendPage');
                  } else {
                    UIConfirm.show('您尚未完成认证，无法添加好友');
                  }
                }}>
                <Image
                  style={{width: scaleSize(20), height: scaleSize(20)}}
                  source={images.common.plus_white}
                />
              </TouchableOpacity>
            </View>
          }
          title="消息"
        />

        <ScrollView>
          {this._renderInternalService()}
          {this._renderConversationList()}
        </ScrollView>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  navIconContainer: {
    marginHorizontal: scaleSize(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: scaleSize(22),
    height: scaleSize(22),
  },
  msgAvatar: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: 50,
  },
  msgItem: {
    flexDirection: 'row',
    marginHorizontal: scaleSize(20),
    // marginVertical: scaleSize(10),
    alignItems: 'center',
    // marginTop:scaleSize(10),
    height: scaleSize(72),
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8F8F8F',
    width: '60%',
  },
  msgCon: {
    marginLeft: scaleSize(10),
    borderBottomWidth: ONE_PX,
    borderColor: '#ccc',
    flex: 1,
  },
  updateTime: {
    fontSize: 12,
    color: '#AEAEAE',
    fontWeight: '400',
    width: '40%',
  },
  name: {
    fontWeight: '400',
    color: '#000000',
    fontSize: 18,
    marginTop: scaleSize(3),
  },
  dot: {
    width: scaleSize(9),
    height: scaleSize(9),
    borderRadius: scaleSize(9 / 2),
    backgroundColor: PRIMARY_COLOR,
    position: 'absolute',
    right: scaleSize(-5),
    top: scaleSize(-5),
  },
});
