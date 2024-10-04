import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Dimensions,
  Button,
  Platform,
  TouchableOpacity,
  Image,
  DeviceEventEmitter,
  Text,
  ScrollView, InteractionManager, Keyboard,
} from "react-native";
import ActionSheet from 'react-native-actionsheet';

import UINavBar from '../../components/UINavBar';
import JMessage from 'jmessage-react-plugin';
import {Toast, ModalIndicator, Overlay} from 'teaset';
import {scaleSize} from '../../global/utils';
import IMUI from 'aurora-imui-react-native';
import ApiUrl from '../../api/Url';
import store from '../../store';
import {images} from '../../res/images';
import {RouteHelper} from 'react-navigation-easy-helper';
import ImagePicker from 'react-native-image-crop-picker';
import ChatInfoPage from './ChatInfoPage';
import LoadingImage from '../../components/LoadingImage';
import {UserStore} from '../../store/UserStore';
// import {getVideoDurationInSeconds} from 'get-video-duration'

const AuroraIController = IMUI.AuroraIMUIController;
const window = Dimensions.get('window');

var InputView = IMUI.ChatInput;
var MessageListView = IMUI.MessageList;

var RNFS = require('react-native-fs');
var themsgid = 1;

export default class ChatPage extends Component {
  constructor(props) {
    super(props);

    let initHeight;
    if (Platform.OS === 'ios') {
      initHeight = 50;
    } else {
      initHeight = 100;
    }

    this.state = {
      inputLayoutHeight: initHeight,
      messageListLayout: {flex: 1, width: window.width, margin: 0},
      inputViewLayout: {width: window.width, height: initHeight},
      isAllowPullToRefresh: true,
      from: 0,
      limit: 10,
      groupMemberCount: undefined,
      groupMemberList: [],
      disturbState: false,
    };
    this.text = '';
    this.atGroups = [];
    this.first = true;
    this.updateLayout = this.updateLayout.bind(this);
    this.onMsgClick = this.onMsgClick.bind(this);
    this.messageListDidLoadCallback = this.messageListDidLoadCallback.bind(
      this,
    );
    this.constructNormalMessage = this.constructNormalMessage.bind(this);
    this.convertJMessageToAuroraMsg = this.convertJMessageToAuroraMsg.bind(
      this,
    );
    this.receiveMessageCallBack = this.receiveMessageCallBack.bind(this);

    this.conversation = this.props.navigation.state.params.conversation;
    this.loginUser = this.props.navigation.state.params.loginUser;

    if (this.conversation.type === 'group') {
      JMessage.getGroupMembers(
        {id: this.conversation.groupId},
        groupMemberInfoArray => {
          // 群成员数组
          // do something.
          this.setState({
            groupMemberCount: groupMemberInfoArray.length,
            groupMemberList: groupMemberInfoArray,
          });
        },
        error => {
          console.debug('【极光聊天错误】获取群用户列表失败: ', error);
          Toast.error('获取群用户列表失败');
        },
      );

      JMessage.enterConversation(
        {type: 'group', groupId: this.conversation.groupId},
        conversation => {
          console.debug('【极光聊天】开始群聊: ', this.conversation.user.name);
        },
        error => {
          console.debug('【极光聊天错误】开始群聊出错: ', error);
        },
      );
    }

    if (this.conversation.type === 'single') {
      JMessage.enterConversation(
        {type: 'single', username: this.conversation.user.username},
        conversation => {
          console.debug('【极光聊天】开始聊天: ', this.conversation.user.name);
        },
        error => {
          console.debug('【极光聊天错误】开始聊天出错: ', error);
        },
      );
    }
  }

  componentDidMount() {
    /**
     * Android only
     * Must set menu height once, the height should be equals with the soft keyboard height so that the widget won't flash.
     * 在别的界面计算一次软键盘的高度，然后初始化一次菜单栏高度，如果用户唤起了软键盘，则之后会自动计算高度。
     */
    if (Platform.OS === 'android') {
      this.ChatInput.setMenuContainerHeight(316);
    }
    if (Platform.OS === 'ios'){

    }
    this.resetMenu();
    AuroraIController.addMessageListDidLoadListener(
      this.messageListDidLoadCallback,
    );
    JMessage.addReceiveMessageListener(this.receiveMessageCallBack);
  }

  componentWillUnmount() {
    AuroraIController.removeMessageListDidLoadListener(
      this.messageListDidLoadCallback,
    );
    JMessage.removeReceiveMessageListener(this.receiveMessageCallBack);
  }

  constructNormalMessage = () => {
    var msg = {};

    if (this.conversation.type === 'single') {
      msg.username = this.conversation.user.username;
    } else if (this.conversation.type === 'group') {
      msg.groupId = this.conversation.groupId;
    } else {
      msg.roomId = this.conversation.roomId;
    }
    msg.type = this.conversation.type;

    return msg;
  };

  setMessageTarget = msg => {
    if (this.conversation.type === 'single') {
      msg.username = this.conversation.user.username;
    } else if (this.conversation.type === 'group') {
      msg.groupId = this.conversation.groupId;
    } else {
      msg.roomId = this.conversation.roomId;
    }
    msg.type = this.conversation.type;
  };

  getOriginFileHttpRequest = (jmessage, SCB, ECB) => {
    const params = {};
    const {groupId, type, user} = this.conversation;
    const IMAGE = 'image',
      VOICE = 'voice',
      FILE = 'file';
    params.messageId = jmessage.id;
    params.type = type;
    params.groupId = type === 'group' ? groupId : '';
    params.username = user.username;
    params.appKey = user.appKey;
    if (jmessage.type === IMAGE) {
      JMessage.downloadOriginalImage(params, SCB, ECB);
    } else if (jmessage.type === VOICE) {
      JMessage.downloadVoiceFile(params, SCB, ECB);
    } else if (jmessage.type === FILE) {
      JMessage.downloadFile(params, SCB, ECB);
    } else {
      return false;
    }
  };

  // 极光IM消息格式转化为极光UI消息格式
  convertJMessageToAuroraMsg = jmessage => {
    console.log('convertJMessageToAuroraMsg' + JSON.stringify(jmessage));
    var auroraMsg = {};
    auroraMsg.msgType = jmessage.type;
    auroraMsg.msgId = jmessage.id;
    auroraMsg.atMe = jmessage.atMe;
    auroraMsg.atAll = jmessage.atAll;
    auroraMsg.selfName = this.loginUser.jgUsername;
    auroraMsg.selfNikeName = this.loginUser.nickname;
    if (jmessage.type === 'text') {
      auroraMsg.text = jmessage.text;
    }

    if (jmessage.type === 'image') {
      auroraMsg.mediaPath = jmessage.thumbPath;
    }

    if (jmessage.type === 'voice') {
      auroraMsg.mediaPath = jmessage.path;
      auroraMsg.duration = jmessage.duration;
    }

    if (jmessage.type === 'file') {
      // if (jmessage.extras.fileType === 'video') {
      auroraMsg.mediaPath = jmessage.path;
      auroraMsg.duration = 10;
      auroraMsg.msgType = 'video';
      // } else {
      // console.log("cann't parse this file type ignore")
      // return {}
      // }
    }

    if (jmessage.type === 'event') {
      // Alert.alert('event', jmessage.eventType)
      if (jmessage.eventType === 'group_info_updated') {
        auroraMsg.text = '群名称更新为:' + jmessage.target.name;
      }
    }

    if (jmessage.type === 'prompt') {
      auroraMsg.msgType = 'event';
      auroraMsg.text = jmessage.promptText;
    }

    var user = {
      userId: '',
      displayName: '',
      avatarPath: '',
    };

    user.userId = jmessage.from.username;
    user.displayName = jmessage.from.nickname;
    user.avatarPath = jmessage.from.extras?.avatar
      ? ApiUrl.CLIENT_USER_IMAGE + jmessage.from.extras.avatar
      : 'https://static.boycodes.cn/shejiixiehui-images/dongtai.png';
    if (user.displayName === '') {
      user.displayName = jmessage.from.username;
    }
    if (user.avatarPath === '') {
      user.avatarPath = 'ironman';
    }
    auroraMsg.fromUser = user;
    auroraMsg.status = 'send_succeed';

    auroraMsg.isOutgoing = true;

    // TBD - test purpose
    if (this.loginUser.jgUsername === jmessage.from.username) {
      auroraMsg.isOutgoing = true;
    } else {
      auroraMsg.isOutgoing = false;
    }

    if (
      jmessage.type === 'image' ||
      jmessage.type === 'file' ||
      jmessage.type === 'voice'
    ) {
      this.getOriginFileHttpRequest(
        jmessage,
        ({filePath}) => {
          let aMsg = JSON.parse(JSON.stringify(auroraMsg));
          aMsg.mediaPath = filePath;
          AuroraIController.updateMessage(aMsg);
        },
        err => console.debug(err),
      );
    }

    return auroraMsg;
  };

  // 收到新消息时的回调
  receiveMessageCallBack = message => {
    console.debug(
      '【极光收消息】收到新消息，显示到聊天窗口，来自: ',
      message.from.nickname,
    );
    const readParams = {
      type: 'single',
      username: message.from.username,
      appKey: message.from.appKey,
      id: message.id,
    };

    JMessage.setMsgHaveRead(readParams, result => {}, error => {});

    if (this.conversation.type === 'single') {
      if (message.target.type === 'user') {
        if (message.from.username === this.conversation.user.username) {
          var msg = this.convertJMessageToAuroraMsg(message);
          AuroraIController.appendMessages([msg]);
          // console.debug("【极光收消息】显示新消息到聊天窗口");
        }
      }
    } else if (this.conversation.type === 'group') {
      if (message.target.type === 'group') {
        if (message.target.id === this.conversation.groupId) {
          var msg = this.convertJMessageToAuroraMsg(message);
          AuroraIController.appendMessages([msg]);
        }
      }
    } else {
      if (message.target.type === 'chatroom') {
        if (message.target.roomId === this.conversation.roomId) {
          var msg = this.convertJMessageToAuroraMsg(message);
          AuroraIController.appendMessages([msg]);
        }
      }
    }
  };

  // 聊天窗口初始化后的回调
  messageListDidLoadCallback = () => {
    ModalIndicator.show('获取聊天记录');
    var parames = {
      from: this.state.from, // 开始的消息下标。
      limit: this.state.limit, // 要获取的消息数。比如当 from = 0, limit = 10 时，是获取第 0 - 9 条历史消息。
      type: this.conversation.type,
    };

    if (this.conversation.type === 'single') {
      parames.username = this.conversation.user.username;
    }
    if (this.conversation.type === 'group') {
      parames.groupId = this.conversation.groupId;
    }

    JMessage.getHistoryMessages(
      parames,
      messages => {

        // console.log(JSON.stringify(messages));
        // messages = messages.filter(
        //   m => m.from.username && m.from.username !== '系统消息',
        // );

        console.debug(
          '【极光聊天记录】搜索到的聊天记录' + messages.length + '条',
        );
        this.setState({from: this.state.from + 10});

        var auroraMessages = messages.map(message => {
          var auroraMessage = this.convertJMessageToAuroraMsg(message);
          if (auroraMessage.msgType === 'unknow') {
            return;
          }
          return auroraMessage;
        });

        AuroraIController.insertMessagesToTop(auroraMessages);
        ModalIndicator.hide();
      },
      error => {
        ModalIndicator.hide();
        Toast.info('网络连接出错，请刷新重试');
        console.debug(
          '【极光聊天记录错误】搜索聊天记录出错: ',
          JSON.stringify(error),
        );
      },
    );

    AuroraIController.scrollToBottom(true);
  };

  // 发送文本消息
  onSendText = text => {
    var message = this.constructNormalMessage();
    message.messageType = 'text';
    message.text = text;
    let isAtMsg = false;
    if (
      this.conversation.type === 'group' &&
      (this.atGroups.length > 0 || this.atGroups === -1)
    ) {

      let ats = [];
      if (this.atGroups === -1) {
        // @all
        if (text.indexOf("@所有人")!== -1){
          message.groupAt = {};
          isAtMsg = true;
        }
      } else {
        for (let i = 0; i < this.atGroups.length; i++) {
          let user = this.atGroups[i];
          if (text.indexOf('@' + user.name) !== -1) {
            ats.push(user.userId);
          }
        }
        if (ats.length > 0){
          message.usernames = ats;
          message.groupAt = {};
          isAtMsg = true;
        }
      }
      this.atGroups = [];

    }


    JMessage.createSendMessage(message, msg => {
      console.debug('【极光发消息】创建消息准备发送: ' + JSON.stringify(msg));
      var auroraMsg = this.convertJMessageToAuroraMsg(msg);
      if (auroraMsg.msgType === undefined) {
        return;
      }

      auroraMsg.status = 'send_going';
      // auroraMsg.timeString = msg.createTime + ''
      AuroraIController.appendMessages([auroraMsg]);
      AuroraIController.scrollToBottom(true);
      this.setMessageTarget(msg);
      console.debug('【极光发消息】发送文本消息给：', msg.target);

      msg.messageSendingOptions = {
        needReadReceipt: false,
        isShowNotification: false,
        isRetainOffline: true,
        isCustomNotificationEnabled: false,
        notificationTitle: '',
        notificationText: '收到一条新消息',
      };

      if (isAtMsg && Platform.OS === 'ios'){
        msg.messageType = 'text';
        if (message['usernames']){
          msg.usernames = message.usernames;
        }
        JMessage.sendGroupAtMessage(
          msg,
          jmessage => {
            console.debug('【极光发消息】消息发送成功');

            var aMsg = this.convertJMessageToAuroraMsg(jmessage);
            aMsg.msgId = auroraMsg.msgId;
            AuroraIController.updateMessage(aMsg);
            AuroraIController.scrollToBottom(true);
          },
          error => {
            Toast.info('消息发送失败');
            console.debug(
              '【极光发消息错误】消息发送出错' + JSON.stringify(error),
            );
          },
        );
      }else {

        JMessage.sendMessage(
          msg,
          jmessage => {
            console.debug('【极光发消息】消息发送成功');

            var auroraMsg = this.convertJMessageToAuroraMsg(jmessage);
            AuroraIController.updateMessage(auroraMsg);
            AuroraIController.scrollToBottom(true);
          },
          error => {
            Toast.info('消息发送失败');
            console.debug(
              '【极光发消息错误】消息发送出错' + JSON.stringify(error),
            );
          },
        );
      }


    });
  };

  onTextChange = event => {
    console.log('onTextChange', event);
    if (this.conversation.type === 'single') {
      return;
    }
    let text = '';
    if (Platform.OS === 'ios'){
      const lastText = this.text;
      const allText = event.text;
      this.text = allText;
      if (allText.length > 0 && allText.length >= lastText.length){
        text = allText.substr(-1,1)
      }
      console.log('lastStr->',text)
    }else {
      text = event;
    }

    if (text === '@') {
      if (Platform.OS === 'android'){
        this.ChatInput.keyboardDismiss();
      }else {
        Keyboard.dismiss();
      }
      const memberList = this.state.groupMemberList.filter(
        item => item.user.username !== this.loginUser.jgUsername,
      );
      RouteHelper.navigate('GroupMemberList', {
        groupMemberList: memberList,
        isAtPage: true,
        atAllCB: () => {
          this.atGroups = -1;
          if (Platform.OS === 'android'){
            this.ChatInput.addText('所有人' + ' ');
          }else {
            AuroraIController.addText('所有人' + ' ')
          }

          RouteHelper.goBack(null);
        },
        callback: user => {
          RouteHelper.goBack(null);
          if (Platform.OS === 'android'){
            this.ChatInput.addText(user.user.nickname + ' ');
          }else {
            AuroraIController.addText(user.user.nickname + ' ')
          }

          this.atGroups.push({
            name: user.user.nickname,
            userId: user.user.username,
          });
        },
      });
    }
  };

  // 发送图片视频消息
  onSendGalleryFiles = (mediaFiles, type) => {
    console.log('fas', mediaFiles);
    /***
     * media定义： [{mediaPath,size,height,width,mediaType}]
     */
    mediaFiles.map(mediaFile => {
      var message = this.constructNormalMessage();
      // message.path = mediaFile.mediaPath;
      // message.messageType = 'image';
      if (Platform.OS === 'android'){
        message.path = mediaFile.uri.substr(8, 10000);
      }else {
        message.path = mediaFile.uri;
      }
      message.fileName = mediaFile.filename;
      if (type === 'Photos') {
        message.messageType = 'image';
      } else {
        message.messageType = 'file';
        message.customObject = {
          duration: mediaFile.playableDuration,
          timeString: new Date().getTime(),
        };
        message.text = mediaFile.playableDuration;
      }
      JMessage.createSendMessage(message, msg => {
        console.log(msg, '创建发送消息');
        console.debug(
          '【极光发消息】创建消息准备发送给: ' + JSON.stringify(msg),
        );
        if (message.messageType === 'file') {
          msg.extras.fileType = 'video';
          msg.duration = mediaFile.playableDuration;
        }
        var auroraMsg = this.convertJMessageToAuroraMsg(msg);
        if (auroraMsg.msgType === undefined) {
          return;
        }

        auroraMsg.status = 'send_going';
        // auroraMsg.timeString = msg.createTime + ''
        AuroraIController.appendMessages([auroraMsg]);
        AuroraIController.scrollToBottom(true);
        this.setMessageTarget(msg);
        console.debug('【极光发消息】发送图片/视频消息给：', msg.target);

        msg.messageSendingOptions = {
          needReadReceipt: false,
          isShowNotification: false,
          isRetainOffline: true,
          isCustomNotificationEnabled: false,
          notificationTitle: '',
          notificationText: '收到一条图片/视频消息',
        };

        JMessage.sendMessage(
          msg,
          jmessage => {
            console.debug('【极光发消息】消息发送成功', jmessage);
            var auroraMsg = this.convertJMessageToAuroraMsg(jmessage);
            AuroraIController.updateMessage(auroraMsg);
            AuroraIController.scrollToBottom(true);
          },
          error => {
            Toast.info('消息发送失败');
            console.debug(
              '【极光发消息错误】消息发送出错' + JSON.stringify(error),
            );
          },
        );
      });

      // AuroraIController.appendMessages([message])
      // AuroraIController.scrollToBottom(true)

      // console.log(message)
    });
    //
    // this.resetMenu();
  };

  onPullToRefresh = () => {
    console.debug('【极光聊天】下拉刷新消息');
    var parames = {
      from: this.state.from, // 开始的消息下标。
      limit: this.state.limit, // 要获取的消息数。比如当 from = 0, limit = 10 时，是获取第 0 - 9 条历史消息。
      type: this.conversation.type,
      username: this.conversation.user.username,
      groupId: this.conversation.groupId,
      roomId: this.conversation.roomId,
    };

    JMessage.getHistoryMessages(
      parames,
      messages => {
        messages = messages.filter(
          m => m.from.username && m.from.username !== '系统消息',
        );

        if (Platform.OS == 'android') {
          this.refs.MessageList.refreshComplete();
        }

        this.setState({
          from: this.state.from + 10,
        });

        var auroraMessages = messages.map(message => {
          var normalMessage = this.convertJMessageToAuroraMsg(message);
          if (normalMessage.msgType === 'unknow') {
            return;
          }
          return normalMessage;
        });
        AuroraIController.insertMessagesToTop(auroraMessages);

        console.debug(
          '【极光聊天】下拉刷新消息完成，获取额外',
          messages.length,
          '条消息',
        );
      },
      error => {
        Toast.info('消息刷新失败，请重试');
        console.debug('【极光聊天错误】消息刷新出错' + JSON.stringify(error));
      },
    );
  };

  onInputViewSizeChange = size => {
    // console.log("onInputViewSizeChange height: " + size.height + " width: " + size.width)
    if (this.state.inputLayoutHeight !== size.height) {
      this.setState({
        inputLayoutHeight: size.height,
        inputViewLayout: {width: window.width, height: size.height},
        messageListLayout: {flex: 1, width: window.width, margin: 0},
      });
    }
  };

  resetMenu() {
    if (Platform.OS === 'android') {
      this.ChatInput.showMenu(false);
      this.setState({
        messageListLayout: {flex: 1, width: window.width, margin: 0},
      });
      this.forceUpdate();
    } else {
      AuroraIController.hidenFeatureView(true);
    }
  }

  /**
   * Android need this event to invoke onSizeChanged
   */
  onTouchEditText = () => {
    this.ChatInput.showMenu(false);
  };

  onFullScreen = () => {
    console.log('on full screen');
    this.setState({
      messageListLayout: {flex: 0, width: 0, height: 0},
      inputViewLayout: {flex: 1, width: window.width, height: window.height},
    });
  };

  onRecoverScreen = () => {
    // this.setState({
    //   inputLayoutHeight: 100,
    //   messageListLayout: { flex: 1, width: window.width, margin: 0 },
    //   inputViewLayout: { flex: 0, width: window.width, height: 100 },
    //   navigationBar: { height: 64, justifyContent: 'center' }
    // })
  };

  onAvatarClick = message => {
    console.log('======asdf=a=sdf=adf=as=d');
    // AuroraIController.removeMessage(message.msgId)
  };

  onAvatarLongClick = message => {
    console.log(message)
    if (this.conversation.type === 'single' || message.isOutgoing) {
      return;
    }
    console.log('onAvatarLongClick', message);
    const fromUser = message.fromUser;
    if (Platform.OS === 'android'){
      this.ChatInput.addText('@' + fromUser.displayName + ' ');
    }else {
      AuroraIController.addText('@' + fromUser.diaplayName + ' ')
    }

    this.atGroups.push({name: Platform.OS === 'android' ? fromUser.displayName : fromUser.diaplayName, userId: fromUser.userId});
  };

  onMsgClick(message) {
    console.debug('【极光聊天】点击消息: ', message);

    if (message.msgType === 'image') {
      RouteHelper.navigate('BigImageShowPage', {
        defaultIndex: 0,
        imgs: [{url: 'file://' + message.mediaPath}],
      });
    }

    if (message.msgType === 'video') {
      RouteHelper.navigate('VideoShowPage', {
        url: message.mediaPath,
      });
    }
  }

  onMsgLongClick = message => {
    // Alert.alert('message bubble on long press', 'message bubble on long press')
  };

  onStatusViewClick = message => {
    message.status = 'send_succeed';
    AuroraIController.updateMessage(message);
  };

  onBeginDragMessageList = () => {
    this.resetMenu();
    AuroraIController.hidenFeatureView(true);
  };

  onTouchMsgList = () => {
    AuroraIController.hidenFeatureView(true);
  };

  onTakePicture = media => {
    console.log('media ' + JSON.stringify(media));
    // var message = this.constructNormalMessage();
    // message.msgType = 'image';
    // message.mediaPath = media.mediaPath;
    // AuroraIController.appendMessages([message]);
    // this.resetMenu();
    // AuroraIController.scrollToBottom(true);
  };

  onStartRecordVoice = voice => {
    console.log('on start record voice');
  };

  onFinishRecordVoice = (mediaPath, duration) => {
    var message = this.constructNormalMessage();
    message.messageType = 'voice';
    message.path = mediaPath;
    message.customObject = {
      timeString: new Date().getTime(),
      duration: duration,
    };
    JMessage.createSendMessage(message, msg => {
      var auroraMsg = this.convertJMessageToAuroraMsg(msg);
      if (auroraMsg.msgType === undefined) {
        return;
      }
      auroraMsg.status = 'send_going';
      auroraMsg.timeString = msg.createTime + '';
      AuroraIController.appendMessages([auroraMsg]);
      AuroraIController.scrollToBottom(true);
      this.setMessageTarget(msg);
      msg.messageSendingOptions = {
        needReadReceipt: false,
        isShowNotification: false,
        isRetainOffline: true,
        isCustomNotificationEnabled: false,
        notificationTitle: '',
        notificationText: '收到一条新消息',
      };
      JMessage.sendMessage(
        msg,
        jmessage => {
          console.debug('【极光发消息】消息发送成功');
          var auroraMsg = this.convertJMessageToAuroraMsg(jmessage);
          AuroraIController.updateMessage(auroraMsg);
          AuroraIController.scrollToBottom(true);
        },
        error => {
          Toast.info('消息发送失败');
          console.debug(
            '【极光发消息错误】消息发送出错' + JSON.stringify(error),
          );
        },
      );
    });
  };

  onCancelRecordVoice = () => {
    console.log('on cancel record voice');
  };

  onStartRecordVideo = () => {
    console.log('on start record video');
  };

  onFinishRecordVideo = video => {
    // var message = constructNormalMessage()
    // message.msgType = "video"
    // message.mediaPath = video.mediaPath
    // message.duration = video.duration
    // AuroraIController.appendMessages([message])
  };

  onSwitchToMicrophoneMode = () => {
    AuroraIController.scrollToBottom(true);
  };

  onSwitchToEmojiMode = () => {
    AuroraIController.scrollToBottom(true);
  };

  openGalleryPage = () => {
    this.openCameraRollPage('Photos');
  };

  openCramerPage = () => {
    this.openCameraRollPage('Videos');
  };

  openCameraRollPage = type => {
    RouteHelper.navigate('CameraRollPage', {
      assetType: type,
      maxSize: 9,
      callback: mediaFiles => {
        RouteHelper.goBack();
        if (Platform.OS === 'ios' && type === 'Videos') {
          let files = [];
          for (let i=0;i<mediaFiles.length;i++){

            let file = mediaFiles[i];
            if (file.filename.indexOf('.mov') !== -1){
              AuroraIController.convertMovToMp4({filename : file.uri,outputPath : file.filename.replace('.mov','')},(result)=>{
                file.uri = result.path;
                file.filename = file.filename.replace('.mov','.mp4')
                files.push(file);
                if (files.length === mediaFiles.length){
                  this.onSendGalleryFiles(files, type);
                }
              })
            }else {
              files.push(file);
              if (files.length === mediaFiles.length){
                this.onSendGalleryFiles(files, type);
              }
            }
          }
        }else {
          this.onSendGalleryFiles(mediaFiles, type);
        }
      },
    });
  };

  onSwitchToGalleryMode = () => {
    if (Platform.OS === 'ios'){
      this.openCameraRollPage('Photos');
    }
  };

  onSwitchToCameraMode = () => {
    if (Platform.OS === 'ios'){
      this.openCameraRollPage('Videos');
    }
  };

  onShowKeyboard = keyboard_height => {};

  updateLayout(layout) {
    this.setState({inputViewLayout: layout});
  }

  onInitPress() {
    console.log('on click init push ');
    this.updateAction();
  }

  onClickSelectAlbum = () => {};

  onCloseCamera = () => {
    console.log('On close camera event');
    this.setState({
      inputLayoutHeight: 100,
      messageListLayout: {flex: 1, width: window.width, margin: 0},
      inputViewLayout: {flex: 0, width: window.width, height: 100},
    });
  };

  /**
   * Switch to record video mode or not
   */
  switchCameraMode = isRecordVideoMode => {
    console.log(
      'Switching camera mode: isRecordVideoMode: ' + isRecordVideoMode,
    );
    // If record video mode, then set to full screen.
    if (isRecordVideoMode) {
      this.setState({
        messageListLayout: {flex: 0, width: 0, height: 0},
        inputViewLayout: {flex: 1, width: window.width, height: window.height},
      });
    }
  };

  renderInputView(){
    return(
      <InputView
        style={this.state.inputViewLayout}
        ref={res => {
          this.ChatInput = res;
        }}
        onLayout={()=>{
          if (this.first && Platform.OS === 'ios'){
            this.first = false;
            this.inputLayoutTimer = setTimeout(()=>{
              AuroraIController.layoutInputView()
              this.inputLayoutTimer && clearTimeout(this.inputLayoutTimer)
            },200)

          }
        }}
        onSendText={this.onSendText}
        onTextChange={this.onTextChange}
        onTakePicture={this.onTakePicture}
        onStartRecordVoice={this.onStartRecordVoice}
        onFinishRecordVoice={this.onFinishRecordVoice}
        onCancelRecordVoice={this.onCancelRecordVoice}
        onStartRecordVideo={this.onStartRecordVideo}
        onFinishRecordVideo={this.onFinishRecordVideo}
        onSendGalleryFiles={this.onSendGalleryFiles}
        onSwitchToEmojiMode={this.onSwitchToEmojiMode}
        onSwitchToMicrophoneMode={this.onSwitchToMicrophoneMode}
        onSwitchToGalleryMode={this.onSwitchToGalleryMode}
        onSwitchToCameraMode={this.onSwitchToCameraMode}
        onShowKeyboard={this.onShowKeyboard}
        onTouchEditText={this.onTouchEditText}
        onFullScreen={this.onFullScreen}
        onRecoverScreen={this.onRecoverScreen}
        onSizeChange={this.onInputViewSizeChange}
        closeCamera={this.onCloseCamera}
        switchCameraMode={this.switchCameraMode}
        showSelectAlbumBtn={true}
        showRecordVideoBtn={false}
        onClickSelectAlbum={this.onClickSelectAlbum}
        inputPadding={{left: 10, top: 5, right: 10, bottom: 5}}
        galleryScale={0.3} //default = 0.5
        compressionQuality={0.6}
        cameraQuality={0.7} //default = 0.5
        customLayoutItems={{
          // left: ['gallery'],
          right: ['send'],
          bottom: ['voice', 'gallery', 'emoji', 'camera'],
        }}
      />
    )
  }

  render() {
    let members = this.state.groupMemberList;
    let groupMemberNum = '';
    let groupId = '';
    const chatTitle = this.conversation.user.name;

    if (this.state.groupMemberCount) {
      groupMemberNum = `（${Number(this.state.groupMemberCount) - 1}）`;
      groupId = this.conversation.groupId;
    }

    let overlayView = (
      <Overlay.PullView side="bottom" modal={false}>
        <ChatInfoPage
          groupMemberList={members}
          loginUser={this.loginUser}
          chatTitle={chatTitle}
          groupId={groupId}
          conversation={this.conversation}
          showOverlay={() => (this.OverlayKey = Overlay.show(overlayView))}
          hideOverlay={() => Overlay.hide(this.OverlayKey)}
        />
      </Overlay.PullView>
    );
    return (
      <View style={styles.container}>
        <UINavBar
          title={`${chatTitle}${groupMemberNum}`}
          style={{zIndex: 1000}}
          leftView={
            <TouchableOpacity
              onPress={() => {
                console.debug(
                  '【极光聊天】结束聊天: ',
                  this.conversation.user.name,
                );
                JMessage.exitConversation();
                DeviceEventEmitter.emit('chatClosed', {
                  user: this.conversation.user,
                });
                RouteHelper.goBack();
              }}
              style={{
                flex: 1,
                marginLeft: scaleSize(6),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={images.back}
                resizeMode="contain"
                style={{
                  width: scaleSize(20),
                  height: scaleSize(20),
                }}
              />
            </TouchableOpacity>
          }
          rightView={
            this.conversation.type === 'group' ? (
              <TouchableOpacity
                onPress={() => (this.OverlayKey = Overlay.show(overlayView))}
                style={{
                  flex: 1,
                  marginRight: scaleSize(6),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{fontSize: 18, color: '#D43D3E', fontWeight: '700'}}>
                  . . .
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
        <MessageListView
          style={this.state.messageListLayout}
          ref="MessageList"
          isAllowPullToRefresh={true}
          isShowIncomingDisplayName={true}
          displayNameTextColor={'#3c3c3c'}
          displayNamePadding={{left: 5, top: 0, right: 0, bottom: 5}}
          onAvatarClick={this.onAvatarClick}
          onMsgClick={this.onMsgClick}
          onAvatarLongClick={this.onAvatarLongClick}
          onStatusViewClick={this.onStatusViewClick}
          onTouchMsgList={this.onTouchMsgList}
          onTapMessageCell={this.onTapMessageCell}
          onBeginDragMessageList={this.onBeginDragMessageList}
          onPullToRefresh={this.onPullToRefresh}
          avatarSize={{width: scaleSize(45), height: scaleSize(45)}}
          avatarCornerRadius={5}
          messageListBackgroundColor={'#F2F6F9'}
          sendBubbleTextColor={'#000000'}
          sendBubblePadding={{left: 10, top: 10, right: 15, bottom: 10}}
          datePadding={{left: 5, top: 5, right: 5, bottom: 5}}
          dateBackgroundColor={'#F3F3F3'}
          photoMessageRadius={5}
          maxBubbleWidth={0.7}
          videoDurationTextColor={'#ffffff'}
        />

        {Platform.OS === 'android' ?  <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={this.openGalleryPage}
          />
          <TouchableOpacity
            style={styles.cramerBtn}
            onPress={this.openCramerPage}
          />
          {this.renderInputView()}
        </View> : this.renderInputView()}


      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F6F9',
    paddingBottom: scaleSize(10),
  },
  inputContainer: {
    position: 'relative',
  },
  chatInfoContainer: {
    backgroundColor: '#eee',
    minHeight: '60%',
    // minWidth: 300,
    // minHeight: 260,
    // // justifyContent: 'center',
    // // alignItems: 'center',
    // maxHeight: 500,
  },
  chatInfoTitel: {
    fontSize: 14,
    color: '#4d4d4d',
    height: scaleSize(35),
    backgroundColor: '#F2F6F9',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: scaleSize(35),
  },
  groupItemView: {
    marginTop: scaleSize(10),
    paddingHorizontal: scaleSize(20),
    height: scaleSize(40),
    backgroundColor: '#F2F6F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupMenberHead: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: scaleSize(20),
    height: '100%',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  photoBtn: {
    position: 'absolute',
    top: 60,
    left: '25%',
    zIndex: 100,
    width: '25%',
    height: 40,
  },
  cramerBtn: {
    position: 'absolute',
    top: 60,
    right: 0,
    zIndex: 100,
    width: '25%',
    height: 40,
  },
});
