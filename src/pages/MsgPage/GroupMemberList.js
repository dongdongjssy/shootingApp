import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
  Image,
} from 'react-native';
import { RouteHelper } from 'react-navigation-easy-helper';
import { scaleSize } from '../../global/utils';
import UINavBar from '../../components/UINavBar';
import { images } from '../../res/images';
import ApiUrl from '../../api/Url';
import Toast from 'teaset/components/Toast/Toast';
import Request from '../../api/Request';
import { UserStore } from '../../store/UserStore';

const ADDFRIENDTOGROUP = '从好友添加成员';
const GROUPMEMBER = '群聊天成员';

export default class GroupMemberList extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    /**
     * 需要参数：
     * @param groupMemberList <Array> 成员列表 Require
     * @param isDeleteMemberPage <boole>  是否进入移除成员 页面选择模式 noRequire defaultValue:false
     * @param isAddMemberPage <bool> 是否进入添加成员 页面选择模式 noRequire defaultValue:false
     * @param friendList <Array> 好友列表 isAddMemberPage<true:require>
     * @param deleteMemberCB <function> 移除成员回调 noRequire
     * @param openChatInfoCB? <function> 返回调用打开聊天信息界面 noRequire
     * @param isAtPage <boole>  是否进入@ 页面选择模式 noRequire defaultValue:false
     * @param atAllCB <function> @所有人的方法  noRequire
     * @param callback <function> 点击成员默认反馈回调 noRequire callParam memberInfo
     */
  }

  componentDidMount() { }

  computedFrienInTheGroup = friendItem => {
    let friendInGroup = false;
    const { groupMemberList } = this.props;
    friendInGroup = groupMemberList.findIndex(
      item => item.user.username === friendItem.username,
    );
    return friendInGroup;
  };

  _renderMemberList = () => {
    const {
      groupMemberList,
      callback,
      isDeleteMemberPage,
      isAddMemberPage,
      friendList,
    } = this.props;
    const GroupMemberListDom = [];
    const DEFAULTERS =
      'http://static.boycodes.cn/shejiixiehui-images/dongtai.png';
    let members = JSON.parse(
      JSON.stringify(!isAddMemberPage ? groupMemberList : friendList),
    );
    const ownerIndex = members.findIndex(item => item.memberType === 'owner');
    members.forEach((item, index) => {
      const inGroup = this.computedFrienInTheGroup(item);
      GroupMemberListDom.push(
        <TouchableOpacity
          onPress={() => {
            Request.get(
              ApiUrl.FIND_USER_BY_PHONE_OR_USERNAME + item.user?.extras?.phone
            ).then(res => {
              if (res.data.code === 0 && res.data.data) {
                UserStore.getLoginUser().then(loginuser => {
                  RouteHelper.navigate("UserCenterPage", {
                    loginuser: loginuser,
                    user: res.data.data
                  })
                })
              }
            }).catch(err => {
              console.error(err);
            });
          }}
          style={styles.membersItem}>
          <View
            style={{
              width: scaleSize(35),
              height: scaleSize(35),
              borderWidth: 1,
              marginRight: scaleSize(8),
              backgroundColor: '#c5c5c5',
              borderColor: '#ccad27',
              borderRadius: 45,
              overflow: 'hidden',
            }}>
            <Image
              style={{ flex: 1 }}
              source={{
                uri:
                  item.user && item.user.extras && item.user.extras.avatar
                    ? ApiUrl.NEW_CLIENT_USER_IMAGE + item.user.extras.avatar
                    : DEFAULTERS,
              }}
            />
          </View>
          <View style={styles.membersName}>
            <Text style={{ color: '#333' }}>
              {item.nickname || item.user.nickname || item.user.username}
            </Text>
            {ownerIndex === index && (
              <View style={styles.adminTag}>
                <Text style={{ fontSize: 10, color: '#7b7b7b' }}>管理员</Text>
              </View>
            )}
            {isDeleteMemberPage && ownerIndex !== index && (
              <TouchableOpacity
                onPress={() =>
                  this.props.deleteMemberCB &&
                  this.props.deleteMemberCB(item.user)
                }
                style={{ ...styles.adminTag, backgroundColor: '#ff484d' }}>
                <Text style={{ fontSize: 10, color: '#fff' }}>移除</Text>
              </TouchableOpacity>
            )}
            {isAddMemberPage && ownerIndex !== index && (
              <TouchableOpacity
                onPress={() => {
                  if (!inGroup) {
                    this.props.addMemberCB && this.props.addMemberCB(item);
                  } else {
                    Toast.info('成员已在群聊列表中');
                  }
                }}
                style={{
                  ...styles.adminTag,
                  backgroundColor: inGroup ? '#9f9f9f' : '#3388cc',
                }}>
                <Text style={{ fontSize: 10, color: '#fff' }}>添加</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>,
      );
    });
    return GroupMemberListDom;
  };

  render() {
    const { isAddMemberPage } = this.props;
    const titleText = isAddMemberPage ? ADDFRIENDTOGROUP : GROUPMEMBER;
    const isAtPage = this.props.isAtPage;
    return (
      <View style={styles.container}>
        <UINavBar
          title={titleText}
          style={{ zIndex: 1000, backgroundColor: '#F2F6F9' }}
          leftView={
            <TouchableOpacity
              onPress={() => {
                RouteHelper.goBack();
                this.props.openChatInfoCB && this.props.openChatInfoCB();
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
        />
        <View style={{ flex: 1 }}>
          {isAtPage && (
            <TouchableOpacity
              onPress={this.props.atAllCB && this.props.atAllCB}
              style={{
                ...styles.membersItem,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                height: scaleSize(40),
              }}>
              <Text style={{ color: '#575757' }}>@所有人</Text>
            </TouchableOpacity>
          )}
          {this._renderMemberList()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: scaleSize(10),
  },
  membersItem: {
    width: '100%',
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(10),
    // marginTop: scaleSize(10),
    height: scaleSize(55),
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersName: {
    flex: 1,
    flexDirection: 'row',
    height: scaleSize(55),
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  adminTag: {
    // width: scaleSize(40),
    // height: scaleSize(20),
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(2),
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F6F9',
  },
});
