import React, { Component } from 'react'
import { Text, View, DeviceEventEmitter, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
import UIButton from '../../components/UIButton';
import UINavBar from '../../components/UINavBar';
import UITextarea from '../../components/UITextarea';
import { scaleSize } from '../../global/utils';
import {Toast, ModalIndicator, Overlay} from 'teaset';
import Url from '../../api/Url';
import Request from '../../api/Request';
import JMessage from "jmessage-react-plugin";
import store from '../../store';
import {RouteHelper} from 'react-navigation-easy-helper';

export default class UserIntroductionPage extends Component {
    constructor(props) {
		super(props)
		this.state = {
            user: this.props.user,
            introduction:''
		}
    }

    componentDidMount() {
        this.getUserInfo();
    }
    getUserInfo = async () => {
        await Request.post(Url.USER_GET_BY_ID + this.state.user.id)
          .then(async res => {
            if (res.status === 200) {
              res.data.token = this.state.user.token;
              res.data.refreshToken = this.state.user.refreshToken;
              this.state.user = res.data;
              console.debug(this.state.user);
              this.forceUpdate();
              store.UserStore.saveLoginUser(this.state.user);
            }
          })
          .catch(err => ModalIndicator.hide());
      };

    updateUserIntroductionPage = async() =>{
        ModalIndicator.show('更新中');
        console.debug(this.state.user);
        var updateForm = {id: this.state.user.id};
        
        updateForm.introduction = this.state.introduction;
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
                if (this.state.nickname){
                    JMessage.updateMyInfo({nickname : this.state.nickname},(res)=>{
                        console.log('update success')
                    },(err)=>{
                        console.log(err)
                    })
                }
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
    
        ModalIndicator.hide();
    }
    
    render() {
        return (
               <View style={{flex: 1}}>
                        <UINavBar title="个人简介"/>
                        <UITextarea style={{marginTop:scaleSize(20),padding:scaleSize(20),borderWidth: 1,
    borderColor: '#E2E4EA',height:scaleSize(200)}} maxLength={200} onChangeText={text => this.setState({introduction: text})}>{this.state.user.introduction}</UITextarea>

<View style={{marginTop:scaleSize(50),display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>

                    <UIButton onPress={() => this.updateUserIntroductionPage()} style={{  
                    backgroundColor: PRIMARY_COLOR,
                    alignItems: 'center',
                    justifyContent: 'center' }} title="确认修改"></UIButton>

</View>
                     
               </View>
        )
    }
}
