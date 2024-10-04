import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {Overlay, Toast} from 'teaset';
import {scaleSize} from '../../global/utils';
import {images} from '../../res/images';
import Switch from '../common/Switch';
import ApiUrl from '../../api/Url';
import JMessage from 'jmessage-react-plugin';
import {RouteHelper} from 'react-navigation-easy-helper';

const TITLETEXT = '聊天信息';
const GROUPNAMELABLE = '群聊名称';
const ADDMEMBERTEXT = '添加成员';
const DELETEMEMBERTEXT = '移除成员';
const SETDISTURBTEXT = '消息免打扰';
const SETBLOCKGROUPTEXT = '屏蔽群消息';
const LOGOUTFORGROUP = '退出';
const DELETEGROUP = '解散';

export default class ChatInfoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disturbState: false,
      blockedState: false,
      inputValue: this.props.chatTitle || '',
      friendList: [],
    };
  }

  componentDidMount() {
    this.getIsBlockedState();
    this.getFriendsList();
  }

  getIsBlockedState = () => {
    /**
     * 获取当前消息屏蔽状态
     * @param groupId<String>
     */
    const {groupId} = this.props;
    JMessage.isGroupBlocked(
      {groupId},
      ({isBlocked}) => this.setState({blockedState: isBlocked}),
      err => {
        console.debug(err);
      },
    );
  };

  /**
   * 获取好友列表
   */
  getFriendsList = () => {
    JMessage.getFriends(
      data => {
        this.setState({friendList: data});
      },
      err => console.debug(err),
    );
  };

  /**
   * 获取免打扰用户和群组名单
   */
  getNoDisturbList = () => {
    JMessage.getNoDisturbList(() => {}, () => {});
  };

  addGroupMembers = ({username, appKey}) => {
    /**
     * 添加成员到群聊
     * @param id <groupId:String>
     * @param usernameArray <username:Array>
     * @param appKey <String>
     */
    const {groupId} = this.props;
    JMessage.addGroupMembers(
      {id: groupId, usernameArray: [username], appKey},
      () => Toast.info('成员添加成功'),
      ({code, description}) => {
        Toast.info(`${code}:${description}`);
      },
    );
  };

  deleteConversation = () => {
    /**
     * 删除聊天会话，同时会删除本地聊天记录。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group' / 'chatRoom'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     *  'roomId': String,          // 聊天室 id.
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    const {type, groupId} = this.props.conversation;
    JMessage.deleteConversation(
      {type, groupId},
      () => console.debug('成功移除当前会话'),
      ({code, description}) => {
        Toast.info(`${code}:${description}`);
      },
    );
  };

  exitGroup = () => {
    /**
     * 退出群聊
     * @param id <groupId>
     */
    const {groupId} = this.props;
    JMessage.exitGroup(
      {id: groupId},
      () => {
        Toast.info('您已退出俱乐部！');
        this.deleteConversation();
        RouteHelper.goBack();
      },
      ({code, description}) => {
        Toast.info(`${code}:${description}`);
      },
    );
  };

  dissolveGroup = () => {
    /**
     * 解散群聊
     * @param {object} param = { groupId: string }
     */
    const {groupId} = this.props;
    JMessage.dissolveGroup(
      {groupId},
      () => {
        Toast.info('俱乐部聊天已经解散！');
        this.deleteConversation();
        RouteHelper.goBack();
      },
      ({code, description}) => {
        Toast.info(`${code}:${description}`);
      },
    );
  };

  _renderGroupMerbersHead = () => {
    const DEFAULTERS =
      'http://static.boycodes.cn/shejiixiehui-images/dongtai.png';
    let members = this.props.groupMemberList;
    let membersListDOM = [];
    if (members && members.length) {
      members.forEach((item, index) => {
        if (index < 8) {
          membersListDOM.push(
            <View
              style={{
                width: scaleSize(28),
                height: scaleSize(28),
                borderWidth: 1,
                marginRight: scaleSize(8),
                backgroundColor: '#c5c5c5',
                borderColor: '#ccad27',
                borderRadius: 25,
                overflow: 'hidden',
              }}>
              <Image
                style={{flex: 1}}
                source={{
                  uri:
                    item.user && item.user.extras && item.user.extras.avatar
                      ? ApiUrl.NEW_CLIENT_USER_IMAGE + item.user.extras.avatar
                      : DEFAULTERS,
                }}
              />
            </View>,
          );
        }
      });
    }
    return membersListDOM;
  };

  render() {
    let isAdminUser = false;
    const showViewerContron = false; // todo 暂时隐藏群管理功能
    const {disturbState, blockedState, friendList} = this.state;
    const {groupMemberList, loginUser, groupId} = this.props;
    let members = JSON.parse(JSON.stringify(groupMemberList));
    const ownerIndex = members.findIndex(item => item.memberType === 'owner');

    if (loginUser && groupMemberList[ownerIndex]) {
      isAdminUser =
        loginUser.userName === groupMemberList[ownerIndex].user.username;
    }
    return (
      <>
        <View style={styles.chatInfoContainer}>
          <Text style={styles.chatInfoTitel}>{TITLETEXT}</Text>
          <View style={styles.chatInfoContent}>
            <View style={styles.groupItemView}>
              <Text style={{fontSize: 14}}>{GROUPNAMELABLE}</Text>
              <View style={styles.groupNameView}>
                {isAdminUser ? (
                  <TextInput
                    ref={res => (this.textInput = res)}
                    disableFullscreenUI={true}
                    onChangeText={text => {
                      this.setState({inputValue: text});
                    }}
                    value={this.state.inputValue}
                    style={styles.groupNameInput}
                  />
                ) : (
                  <Text style={{fontSize: 14}}>{this.state.inputValue}</Text>
                )}
                <TouchableOpacity
                  onPress={() => {
                    if (isAdminUser) {
                      JMessage.updateGroupInfo(
                        {id: groupId, newName: this.state.inputValue},
                        () => {},
                        ({description}) => Toast.info(description),
                      );
                    } else {
                      Toast.info('不是管理员，无法修改群名称');
                    }
                  }}>
                  <Image
                    style={{width: 15, height: 15, marginLeft: 5}}
                    source={images.common.write}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <View style={{...styles.groupItemView, paddingLeft: 0}}>
                <View style={styles.groupMenberHead}>
                  {this._renderGroupMerbersHead()}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    this.props.hideOverlay();
                    RouteHelper.navigate('GroupMemberList', {
                      groupMemberList,
                      openChatInfoCB: () =>
                        this.props.showOverlay && this.props.showOverlay(),
                    });
                  }}>
                  <Image
                    style={{width: 15, height: 15, marginLeft: 5}}
                    source={images.common.contact}
                  />
                </TouchableOpacity>
              </View>
              {isAdminUser && (
                <TouchableOpacity
                  onPress={() => {
                    this.props.hideOverlay();
                    RouteHelper.navigate('GroupMemberList', {
                      friendList,
                      groupMemberList,
                      isAddMemberPage: true,
                      addMemberCB: info => {
                        const {username, appKey} = info;
                        this.addGroupMembers({username, appKey});
                      },
                      openChatInfoCB: () =>
                        this.props.showOverlay && this.props.showOverlay(),
                    });
                  }}
                  style={{
                    ...styles.groupItemView,
                    marginTop: 0,
                    paddingLeft: 0,
                  }}>
                  <View style={styles.groupMenberHead}>
                    <Text style={{fontSize: 14}}>{ADDMEMBERTEXT}</Text>
                  </View>
                  <Image
                    style={{width: 15, height: 15, marginLeft: 5}}
                    source={images.common.plus_black}
                  />
                </TouchableOpacity>
              )}
              {isAdminUser && (
                <TouchableOpacity
                  onPress={() => {
                    this.props.hideOverlay();
                    RouteHelper.navigate('GroupMemberList', {
                      groupMemberList,
                      isDeleteMemberPage: true,
                      deleteMemberCB: info => {
                        const {username, appKey} = info;
                        JMessage.removeGroupMembers(
                          {
                            id: groupId,
                            usernameArray: [username],
                            appKey,
                          },
                          () => {},
                          () => {},
                        );
                      },
                      openChatInfoCB: () =>
                        this.props.showOverlay && this.props.showOverlay(),
                    });
                  }}
                  style={{...styles.groupItemView, marginTop: 0}}>
                  <Text style={{fontSize: 14}}>{DELETEMEMBERTEXT}</Text>
                  <Image
                    style={{width: 15, height: 15, marginLeft: 5}}
                    source={images.common.delete}
                  />
                </TouchableOpacity>
              )}
            </View>

            {showViewerContron && (
              <>
                <View style={styles.groupItemView}>
                  <Text style={{fontSize: 14}}>{SETBLOCKGROUPTEXT}</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Switch
                      switchState={blockedState}
                      onPressHandle={() => {
                        JMessage.blockGroupMessage(
                          {
                            id: groupId,
                            isBlocked: blockedState,
                          },
                          () => {},
                          () => this.setState({blockedState: false}),
                        );
                        this.setState({blockedState: !this.state.blockedState});
                      }}
                    />
                  </View>
                </View>
                <View style={styles.groupItemView}>
                  <Text style={{fontSize: 14}}>{SETDISTURBTEXT}</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Switch
                      switchState={disturbState}
                      onPressHandle={() => {
                        this.setState(
                          {disturbState: !this.state.disturbState},
                          () => {
                            JMessage.setNoDisturb(
                              {
                                id: groupId,
                                isNoDisturb: disturbState,
                                type: 'group',
                              },
                              () => {},
                              () => this.setState({disturbState: false}),
                            );
                          },
                        );
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    ...styles.groupItemView,
                    justifyContent: 'center',
                    backgroundColor: '',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      let overlayView = (
                        <Overlay.PopView
                          type="zoomOut"
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          modal={true}>
                          {this._renderWaringModal(isAdminUser)}
                        </Overlay.PopView>
                      );
                      this.OverlayKey = Overlay.show(overlayView);
                    }}
                    style={styles.logoutGroupBtn}>
                    <Text style={{fontSize: 14, color: '#fff'}}>
                      {isAdminUser ? DELETEGROUP : LOGOUTFORGROUP}群聊
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </>
    );
  }

  _renderWaringModal = isAdminUser => {
    const DECTEXT = isAdminUser ? DELETEGROUP : LOGOUTFORGROUP;
    return (
      <View style={styles.waringModal}>
        <Image
          style={{width: 30, height: 30, marginBottom: scaleSize(10)}}
          source={images.common.warning}
        />
        <Text style={{fontSize: 13, color: '#676767', textAlign: 'center'}}>
          {` 是否确定${DECTEXT}俱乐部，${DECTEXT}后将不会收到群消息！`}
        </Text>
        <View style={styles.waringBtnView}>
          <TouchableOpacity
            onPress={() => Overlay.hide(this.OverlayKey)}
            style={{...styles.warningbtn, backgroundColor: '#3ba6cc'}}>
            <Text style={{fontSize: 12, color: '#fff'}}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (isAdminUser) {
                this.dissolveGroup();
              } else {
                this.exitGroup();
              }
              Overlay.hide(this.OverlayKey);
            }}
            style={{...styles.warningbtn, backgroundColor: '#ff484d'}}>
            <Text style={{fontSize: 12, color: '#fff'}}>确定</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  chatInfoContainer: {
    backgroundColor: '#eee',
    paddingBottom: scaleSize(50),
  },
  chatInfoTitel: {
    fontSize: 16,
    color: '#333',
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
  logoutGroupBtn: {
    width: '50%',
    height: scaleSize(25),
    backgroundColor: '#ee3e46',
    borderRadius: scaleSize(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupNameView: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  groupNameInput: {
    maxWidth: '50%',
    fontSize: 14,
    padding: 0,
    color: '#333',
    height: scaleSize(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  waringModal: {
    width: scaleSize(253),
    paddingVertical: scaleSize(15),
    paddingHorizontal: scaleSize(20),
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  waringBtnView: {
    width: '100%',
    marginTop: scaleSize(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  warningbtn: {
    paddingHorizontal: scaleSize(15),
    paddingVertical: scaleSize(3),
    backgroundColor: '#ccc',
    borderRadius: 4,
  },
});
