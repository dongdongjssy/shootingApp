import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  Alert,
  Button
} from 'react-native';
import { RouteHelper } from 'react-navigation-easy-helper';
import { images } from '../../res/images';
import { Toast, ModalIndicator, Overlay } from 'teaset';
import UINavBar from '../../components/UINavBar';
import UICitySelect from '../../components/UICitySelect';
import UISelect from '../../components/UISelect';
import ImagePicker from 'react-native-image-picker';
import Url from '../../api/Url';
import { PRIMARY_COLOR } from '../../global/constants';
import store from '../../store';
import Request from '../../api/Request';
import { UserStore } from '../../store/UserStore';
import JMessage from "jmessage-react-plugin";
import { scaleSize } from '../../global/utils';
import LinearGradinet from 'react-native-linear-gradient';
import { ClientStatusEnum } from '../../global/constants'

export default class EditInfoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatar: this.props.loginuser.avatar
        ? Url.CLIENT_USER_IMAGE + this.props.loginuser.avatar
        : 'http://static.boycodes.cn/shejiixiehui-images/dongtai.png',
      user: this.props.loginuser,
      loginuser: this.props.loginuser,
      myJoinClubStr: this.props.myJoinClubStr,
      formData: undefined,
      isUploading: false,
      nickname: undefined,
      englishName: undefined,
      email: undefined,
      city: undefined,
      areaList: [],
      myClubs: [],
      oldPwd: undefined,
      newPwd: undefined,
      confirmNewPwd: undefined,
      bloodType: { title: '', code: 0 }

    };
  }

  async componentDidMount() {
    var areas = await store.AppStore.getAreaList();
    var allIndex = areas.findIndex(a => a.id === 1);
    if (allIndex >= 0) {
      areas.splice(allIndex, 1);
    }
    this.setState({ areaList: areas });


    if (this.state?.user?.bloodType) {
      let blood = {}
      blood.code = this.state?.user?.bloodType
      blood.title = this.state?.user?.bloodType == 1 && 'A' || this.state?.user?.bloodType == 2 && 'B' || this.state?.user?.bloodType == 3 && 'AB' || this.state?.user?.bloodType == 4 && 'O'
      this.setState({
        bloodType: blood
      })
    }

    console.debug(this.state?.user);
  }

  // 获取我的所属俱乐部
  getMyClub = async () => {
    var user = await UserStore.getLoginUser();
    if (user) {
      await Request.post(Url.MY_CLUB_LIST, { clientUserId: user.id })
        .then(res => {
          if (res.status === 200) {
            console.debug(res.data);
            this.setState({ myClubs: res.data.rows });
          }
        })
        .catch(err => console.debug(err));
    }
  };

  updateAvatar = () => {
    const options = {
      title: '选择图片',
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍照',
      chooseFromLibraryButtonTitle: '选择照片',
      cameraType: 'back',
      mediaType: 'camera',
      videoQuality: 'high',
      durationLimit: 10,
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.8,
      angle: 0,
      cropping: true,
      allowsEditing: false,
      noData: false,
      storageOptions: { skipBackup: true },
    };

    ImagePicker.showImagePicker(options, response => {
      console.debug('选择新头像: ', response.uri);

      if (response.didCancel) {
        console.warn('User cancelled photo picker');
      } else if (response.error) {
        console.warn('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.warn('User tapped custom button: ', response.customButton);
      } else {
        this.setState({ isUploading: true });

        let uploadFile = {
          uri:
            Platform.OS === 'android'
              ? response.uri
              : response.uri.replace('file://', ''),
          type: 'application/octet-stream',
          name: 'aaaaa.jpg',
        };

        let formData = new FormData();
        formData.append('avatar', uploadFile);
        formData.append('userId', this.state.user.id);
        this.setState({
          avatar: response.uri,
          isUploading: false,
          formData: formData,
        });
      }
    });
  };


  renderExpireDt(date) {
    if (date == null || date == undefined || date == "" || date.length == 0) {
      return "未设置";
    } else {
      return date.split(" ")[0];
    }
  }

  submitForm = async () => {
    ModalIndicator.show('更新中');
    // console.debug(this.state.user);
    // upload avatar first
    if (this.state.formData) {
      await fetch(Url.USER_UPLOAD_AVATAR, {
        method: 'POST',
        headers: new Headers({
          Authorization: 'Bearer ' + this.state.user.token,
        }),
        body: this.state.formData,
      })
        .then(res => {
          return res.json();
        })
        .then(res => {
          console.debug('提交头像结果: ', res);
          if (res.code === 0) {
            // 更新一下内存中保存的用户信息
            let loginuserCopy = { ...this.state.user };
            loginuserCopy.avatar = res.avatar;
            store.UserStore.saveLoginUser(loginuserCopy);
            RouteHelper.goBack();
          } else {
            Toast.message('头像更新出错，请重试');
            ModalIndicator.hide();
          }
        })
        .catch(error => {
          console.debug('上传头像出错: ', JSON.stringify(error));
          Toast.message('上传头像出错，请重试');
          ModalIndicator.hide();
        });
    }
    var updateForm = { id: this.state.user.id };
    if (this.state.nickname) {
      updateForm.nickname = this.state.nickname;
    }

    if (this.state.englishName) {
      updateForm.englishName = this.state.englishName;
    }

    if (this.state.city) {
      updateForm.city = this.state.city;
    }

    if (this.state.address) {
      updateForm.address = this.state.address;
    }

    if (this.state.email) {
      updateForm.email = this.state.email;
    }

    if (this.state.bloodType) {
      updateForm.bloodType = this.state.bloodType.code;
    }

    if (updateForm.nickname || updateForm.englishName || updateForm.city || updateForm.email || updateForm.address || updateForm.bloodType) {
      await Request.post(Url.USER_EDIT, updateForm)
        .then(async res => {
          console.debug('更新用户信息结果: ', res.data);

          if (res.status === 401) {
            ModalIndicator.hide();
            Toast.message('登录失效，请重新登录');
            RouteHelper.reset('LoginPage');
          } else if (res.status === 200 && res.data.code === 0) {
            // 更新一下内存中保存的用户信息
            await this.getUserInfo();
            if (this.state.nickname) {
              JMessage.updateMyInfo({ nickname: this.state.nickname }, (res) => {
                console.log('update success')
              }, (err) => {
                console.log(err)
              })
            }
            // if (this.state.nickname) this.state.user.nickname = this.state.nickname
            // if (this.state.englishName) this.state.user.englishName = this.state.englishName
            // if (this.state.city) this.state.user.city = this.state.city
            // if(this.state.email) this.state.user.email = this.state.email
            Toast.message('信息更新成功');
            RouteHelper.goBack();
          } else {
            Toast.message('信息提交出错，请重试');
          }

          ModalIndicator.hide();
        })
        .catch(err => {
          Toast.message('信息提交出错，请重试');
          ModalIndicator.hide();
          console.debug('[ERROR] update user info error: ', err.message);
        });
    }

    ModalIndicator.hide();
  };

  getUserInfo = async () => {
    await Request.post(Url.USER_GET_BY_ID + this.state.user.id)
      .then(async res => {
        if (res.status === 200) {
          res.data.token = this.state.user.token;
          res.data.refreshToken = this.state.user.refreshToken;
          this.state.user = res.data;
          this.forceUpdate();
          store.UserStore.saveLoginUser(this.state.user);
        }
      })
      .catch(err => ModalIndicator.hide());
  };

  goDetail = async () => {
    RouteHelper.navigate("UserCenterPage", { loginuser: this.state.loginuser, user: this.state.loginuser, myJoinClubStr: this.state.myJoinClubStr })
  }


  render() {
    return (
      <View style={{ flex: 1 }}>
        <UINavBar title="个人资料" rightView={
          <TouchableOpacity
            onPress={() => this.submitForm()}
            style={{
              height: scaleSize(30),
              width: scaleSize(73),
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: scaleSize(4),
            }}>
            <Text style={{ color: '#FF0F30', fontSize: 12, fontWeight: '600' }}>
              确认修改
           </Text>
          </TouchableOpacity>
        } />
        <ScrollView>
          <View style={{ paddingHorizontal: scaleSize(20) }}>
            <TouchableOpacity
              onPress={() => this.updateAvatar()}
              style={styles.listrow}>
              <Text style={styles.title}>头像(请上传射手卡照片)</Text>
              <Image
                style={{
                  width: scaleSize(44),
                  height: scaleSize(44),
                  marginRight: scaleSize(35),
                }}
                source={
                  this.state.avatar
                    ? { uri: this.state.avatar }
                    : { uri: 'https://zjw.tjjzshw.com/logo.jpg' }
                }
              />
              <Image
                style={{
                  height: scaleSize(13),
                  width: scaleSize(7),
                  right: scaleSize(16),
                  position: 'absolute',
                }}
                source={images.common.arrow_right2}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>昵称</Text>
              <TextInput
                style={styles.title}
                onChangeText={text => this.setState({ nickname: text })}>
                {this.state.user?.nickname}
              </TextInput>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>英文名</Text>
              <TextInput
                style={styles.title}
                onChangeText={text => this.setState({ englishName: text })}>
                {this.state.user?.englishName}
              </TextInput>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                // alert("1");
                // console.debug(JSON.stringify(this.state.areaList))
                UICitySelect.show(this.state.areaList, item => {
                  this.setState({ area: item, city: item.city_name });
                });
              }}
              style={styles.listrow}>
              <Text style={styles.title}>地区</Text>
              <View
                style={{
                  alignItems: 'flex-end',
                  flex: 1,
                  justifyContent: 'center',
                }}>
                <Text style={[styles.title, { marginRight: scaleSize(30) }]}>
                  {this.state.area
                    ? this.state.area.city_name
                    : this.state.user.city
                      ? this.state.user.city
                      : null}
                </Text>
                <Image
                  style={{
                    height: scaleSize(13),
                    width: scaleSize(7),
                    right: scaleSize(16),
                    position: 'absolute',
                  }}
                  source={images.common.arrow_right2}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>地址</Text>
              <TextInput
                style={styles.title}
                onChangeText={text => this.setState({ address: text })}>
                {this.state.user?.address}
              </TextInput>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>邮箱</Text>
              <TextInput
                style={styles.title}
                onChangeText={text => this.setState({ email: text })}>
                {this.state.user?.email}
              </TextInput>
            </TouchableOpacity>

            <TouchableOpacity style={styles.listrow} onPress={() => {
              UISelect.show([{ title: "A", code: 1 }, { title: "B", code: 2 }, { title: "AB", code: 3 }, { title: "O", code: 4 }], {
                title: '血型', onPress: (item) => {
                  this.setState({
                    bloodType: item
                  })
                  UISelect.hide();
                }
              })
            }}>
              <Text style={styles.title}>血型</Text>
              <Text style={styles.title}>{this.state.bloodType?.title}</Text>

            </TouchableOpacity>


            {/* <Text style={styles.title}>血型</Text>
               <TextInput
                style={styles.title}
                onChangeText={text => this.setState({bloodType: text})}>
                {this.state.user?.bloodType}
              </TextInput> */}


            <TouchableOpacity style={styles.listrow}
              onPress={() =>
                RouteHelper.navigate('UserIntroductionPage', {
                  user: this.state.loginuser
                })
              }>
              <Text style={styles.title}>个人简介</Text>
              <Text style={styles.title}>
                点击查看详情
              </Text>
            </TouchableOpacity>


             <TouchableOpacity style={styles.listrow}
              onPress={() =>
                RouteHelper.navigate('ReceivingAddressPage', {
                  user: this.state.loginuser
                })
              }>
              <Text style={styles.title}>我的收货地址</Text>
              <Text style={styles.title}>
                去查看
              </Text>
              
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.listrow}
              onPress={() =>
                RouteHelper.navigate('InvoicePage', {
                  user: this.state.loginuser
                })
              }>
              <Text style={styles.title}>我的发票管理</Text>
              <Text style={styles.title}>
                去查看
              </Text>
            </TouchableOpacity> 
          </View>
          <View style={{ backgroundColor: '#F6F6F6', height: scaleSize(60), lineHeight: scaleSize(60), paddingHorizontal: scaleSize(20), display: 'flex', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '600', color: '#646464' }}>不可编辑项，如需要修改可联系客服</Text>
          </View>
          <View style={{ paddingHorizontal: scaleSize(20) }}>
            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>真实姓名</Text>
              <Text style={styles.title}>{this.state.user?.realName}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>身份证号</Text>
              {
                this.state.user?.idNumber && this.state.user?.idNumber !== "undefined" && this.state.user?.idNumber != "" ? 
                <Text style={styles.title}>{this.state.user?.idNumber}</Text> 
                : 
                <View style={{display: 'flex',flexDirection: 'row'}}>
                <Image style={{ width: scaleSize(18), height: scaleSize(19) }} source={images.mine.shangchuan}></Image>
                <Text style={{ fontSize: scaleSize(16), color: '#FF0606',marginLeft: scaleSize(5) }} onPress={() =>
                  RouteHelper.navigate('AuthenticationPage', {
                    user: this.state.loginuser
                  })
                } >去上传</Text></View>
              }

            </TouchableOpacity>

            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>年龄</Text>
              <Text style={styles.title}>{this.state.user?.age}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>性别</Text>
              {
                this.state.user?.sex === 0 && <Text style={styles.title}>不确定</Text>
              }
              {
                this.state.user?.sex === 1 && <Text style={styles.title}>男</Text>
              }
              {
                this.state.user?.sex === 2 && <Text style={styles.title}>女</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>{
                  RouteHelper.navigate('MyClubPage', {
                    clubs: this.state.myClubs,
                    isMyJoinClub: true,
                    title: '所属俱乐部',
                  })
                }
              }
              style={styles.listrow}>
              <Text style={styles.title}>所属俱乐部</Text>
              <View
                style={{
                  alignItems: 'flex-end',
                  flex: 1,
                  justifyContent: 'center',
                }}>
                <Text style={[styles.title, { marginRight: scaleSize(30) }]} />
                <Image
                  style={{
                    height: scaleSize(13),
                    width: scaleSize(7),
                    right: scaleSize(16),
                    position: 'absolute',
                  }}
                  source={images.common.arrow_right2}
                />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.listrow}
              onPress={() => {
                Alert.alert(
                  '',
                  '射手号不能更改',
                  [
                    {
                      text: '好的',
                      onPress: () => { },
                    },
                  ],
                  { cancelable: false },
                );
              }}>
              <Text style={styles.title}>射手卡号</Text>
              <Text style={styles.title}>{this.state.user?.memberId}</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>认证有效期</Text>
              <Text style={styles.title}>{this.renderExpireDt(this.state.user?.certExpireDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.listrow}>
              <Text style={styles.title}>结业日期</Text>
              <Text style={styles.title}>{this.renderExpireDt(this.state.user?.graduateDate)}</Text>
            </TouchableOpacity>

            {this.props.loginuser.password && this.props.loginuser.password !== "undefined" && this.props.loginuser.password != "" ?
              <TouchableOpacity
                onPress={() => RouteHelper.navigate("UpdatePassword", { loginuser: this.props.loginuser })}
                style={styles.listrow}>
                <Text style={styles.title}>更新密码</Text>
                <View style={{ alignItems: "flex-end", flex: 1, justifyContent: 'center' }}>
                  <Text style={[styles.title, { marginRight: scaleSize(30) }]}></Text>
                  <Image
                    style={{
                      height: scaleSize(13),
                      width: scaleSize(7),
                      right: scaleSize(16),
                      position: "absolute"
                    }}
                    source={images.common.arrow_right2} />
                </View>
              </TouchableOpacity> : null
            }
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center'
            }}>
              <TouchableOpacity
                onPress={() => this.goDetail()}
                style={{
                  marginTop: scaleSize(17.5),
                  marginBottom: scaleSize(22),
                  backgroundColor: PRIMARY_COLOR,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: scaleSize(45),
                  width: scaleSize(180),
                  borderRadius: scaleSize(49),
                }}>
                <LinearGradinet start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#EF1F44', '#FF9958']}
                  style={{
                    height: scaleSize(45),
                    width: scaleSize(180),
                    display: 'flex',
                    flexDirection: 'row',
                    backgroundColor: PRIMARY_COLOR,
                    alignItems: 'center', borderRadius: scaleSize(49),
                    justifyContent: 'center',
                  }}>
                  <Image source={images.mine.shanyaodeyanzhuzi} style={{ width: scaleSize(24), height: scaleSize(24), marginRight: scaleSize(11) }}></Image>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                    查看个人主页
                  </Text>
                </LinearGradinet>

              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  listrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E2E4EA',
    minHeight: scaleSize(55),
  },
  title: {
    fontSize: 16,
    color: '#111A34',
  },
});
