import React, { Component } from 'react'
import { Text, View, DeviceEventEmitter, TouchableOpacity, Image,TextInput, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
import UINavBar from '../../components/UINavBar';
import { scaleSize } from '../../global/utils';
import {Toast, ModalIndicator, Overlay} from 'teaset';
import Url from '../../api/Url';
import Request from '../../api/Request';
import store from '../../store';
import {RouteHelper} from 'react-navigation-easy-helper';
import UICitySelect from '../../components/UICitySelect';
import {images} from '../../res/images';
import UISelect from '../../components/UISelect';
import ClubItem from '../ClubPage/ClubItem';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView';


export default class TrainingIntentionPage extends Component {
    constructor(props) {
		super(props)
		this.state = {
            isInput:false,
            user: undefined,
            intention:{},
            realName:'',
            idNumber:'',
            age:'',
            city: undefined,
            areaList: [],
            phone:'',
            wechat:'',
            trainingType:{},
            trainingTime:{},
            remark:'',
            clubList:[],
            type: props.type,
		}
    }

    async componentDidMount() {
        var areas = await store.AppStore.getAreaList();
        var user = await store.UserStore.getLoginUser()

        var allIndex = areas.findIndex(a => a.id === 1);
        if (allIndex >= 0) {
          areas.splice(allIndex, 1);
        }
        this.setState({areaList: areas,user:user});
        await this.getIsInput();
    }

    getIsInput = async () => {
        let data = {
            clientUserId:this.state.user?.id
        }
        await Request.post(Url.TRAININGINTENTION_LIST, data).then(async res => {
          console.debug('更新培训意向结果: ', res.data);
          if (res.status === 401) {
            ModalIndicator.hide();
            Toast.message('登录失效，请重新登录');
            RouteHelper.reset('LoginPage');
          } else if (res.status === 200 && res.data.code === 0) {
            if(res.data?.total > 0){
                this.setState({
                    isInput:true,
                },async ()=>{
                   this.findClubList();
                })
            }
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

    findClubList = async () => {
        let data = {
            areaId:null
        }
        await Request.post(Url.TRAININGINTENTION_CLUB_LIST, data).then(res => {
          console.debug('更新培训意向结果1: ', res.data);
          if (res.status === 401) {
            ModalIndicator.hide();
            Toast.message('登录失效，请重新登录2');
            RouteHelper.reset('LoginPage');
          } else if (res.status === 200 && res.data.code === 0) {
            if(res.data?.total > 0){
                let clubs = [];
                res.data.rows?.map(club => {
                    clubs.push({
						bgimg: club.image ? Url.CLUB_IMAGE + club.image : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
						avatar: club.avatar ? Url.CLUB_IMAGE + club.avatar : "http://static.boycodes.cn/shejiixiehui-images/dongtai.png",
						name: club.title,
						city: club?.area?.name,
						cate: null,
						club: club
					})
                })

                this.setState({
                    clubList:clubs,
                })
            }
          } else {
            Toast.message('信息提交出错，请重试');
          }
          ModalIndicator.hide();
        })
        .catch(err => {
          Toast.message('信息提交出错，请重试4');
          ModalIndicator.hide();
          console.debug('[ERROR] update user info error: ', err.message);
        });
    }

    renderItem = (item, index) => {
		return <ClubItem item={item} index={index} loginuser={this.state.user} type={'post'}/>
	}

    onFetch = async (page = 1, startFetch, abortFetch) => {
		var pageSize = 999999

		await this.findClubList()

		try {
			startFetch(this.state.clubList, pageSize);
		} catch (err) {
			abortFetch();
		}
	}

    getAge(identify){
        let UUserCard = identify;
		if (UUserCard != null && UUserCard != '') {
			//获取年龄
			const myDate = new Date();
			const month = myDate.getMonth() + 1;
			const day = myDate.getDate();
			let age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
			if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
				age++;
			}
			return age;	
		}
    }

    async submitId(){
        let data = {
            realName:this.state.realName,
            idNumber:this.state.idNumber,
            age:this.state.age,
            city:this.state.city,
            phone:this.state.phone,
            openId:this.state.wechat,
            trainingType:this.state.trainingType?.code,
            trainingTime:this.state.trainingTime?.code,
            remark:this.state.remark,
            clientUserId: this.state.user?.id
        }
     
        if (this.state.realName || this.state.idNumber || this.state.age || this.state.city || this.state.phone || this.state.wechat || this.state.trainingType || this.state.trainingTime) {
			await Request.post(Url.TRAININGINTENTION_ADD, data)
        .then(async res => {
          console.debug('更新培训意向结果: ', res.data);

          if (res.status === 401) {
            ModalIndicator.hide();
            Toast.message('登录失效，请重新登录');
            RouteHelper.reset('LoginPage');
          } else if (res.status === 200 && res.data.code === 0) {
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
        

    }

    btnDisabled() {
		if (!this.state.realName || !this.state.idNumber || !this.state.age || !this.state.city || !this.state.phone || !this.state.wechat || !this.state.trainingType || !this.state.trainingTime) {
			return true
		} else {
			return false
		}
	}

    render() {
        if(this.state.isInput){
            return <View style={{ flex: 1 }}>
            <UINavBar title="培训意向" style={{marginBottom:scaleSize(10)}}/>
            <View style={{ height: scaleSize(1), backgroundColor: "#F2F6F9" }}></View>
            <View style={{display:'flex',flexDirection:'row',justifyContent:'center'}}>
            <Image source={images.mine.peixunyixiang} style={{width:scaleSize(130),height:scaleSize(110),alignItems:'center'}}></Image>
            </View>
            <View style={{display:'flex',flexDirection:'row',justifyContent:'center'}}>
            <Text style={{alignItems:'center',color:'#4FE356',fontSize:scaleSize(15),fontWeight:'500'}}>已收到，后续会有专人联系</Text>
            </View>
            <View style={{marginTop:scaleSize(20), height: scaleSize(30), backgroundColor: "#F2F6F9" }}></View>

            <ScrollView style={{flex: 1, marginTop: 1, paddingHorizontal: scaleSize(10)}}>
                <Text style={{marginTop:scaleSize(23),marginLeft:scaleSize(13),color:'#D85051',fontSize:scaleSize(20),fontWeight:'500'}}>热推俱乐部</Text>

                <UltimateListView
					style={{ flex: 1 }}
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
                {/* {
                    this.state.clubList.map((item,index) =>{
                        return <View style={{width:scaleSize(350),height:scaleSize(148.43),marginTop:scaleSize(20),justifyContent:'center', alignItems:'center'}}>
                           <ClubItem item={item} index={index} loginuser={this.state.user} type={'post'}/>

                        </View>
                    })
                } */}
            </ScrollView>
        </View>
        }else{
            return (
                <View style={{flex: 1}}>
                         <UINavBar title="培训意向" style={{marginBottom:scaleSize(10)}} rightView={
                             <>
                                {
                                    this.state.type == 'training' ? <TouchableOpacity onPress={() => {
                                        RouteHelper.navigate("MyActivityPage", {
                                            type: "training",
                                            loginuser: this.state.user
                                        });
                                    }} style={{marginRight: scaleSize(20)}}>
                                        <Text style={{color: '#FFFFFF'}}>我的培训</Text>
                                    </TouchableOpacity> : <TouchableOpacity onPress={() => {
                                        RouteHelper.navigate("MyActivityPage", {
                                            type: "contest",
                                            loginuser: this.state.user
                                        });
                                    }} style={{marginRight: scaleSize(20)}}>
                                        <Text style={{color: '#FFFFFF'}}>我的赛事</Text>
                                    </TouchableOpacity>
                                }
                            </>
                         }/>
                         <View style={{ height: scaleSize(1), backgroundColor: "#F2F6F9" }}></View>
                         <ScrollView>
                         <TouchableOpacity style={styles.listrow}>
                             <Text style={styles.title}>真实姓名</Text>
                             <TextInput placeholder={'姓名'}
                                 style={styles.title}
                                 onChangeText={text => this.setState({realName: text})}>
                                 {this.state.realName}
                             </TextInput>
                         </TouchableOpacity>
                         <TouchableOpacity style={styles.listrow}>
                             <Text style={styles.title}>身份证号</Text>
                             <TextInput placeholder={'身份证号'}
                                 style={styles.title}
                                 onChangeText={text => { 
                                     this.setState({ idNumber: text })
                                     if(text.length == 18){
                                         const ageNum = this.getAge(text)
                                         console.log(ageNum)
                                         this.setState({
                                             age: ageNum
                                         })
                                     }
                                 }}>
                                 {this.state.idNumber}
                             </TextInput>
                         </TouchableOpacity>
                         <TouchableOpacity style={styles.listrow} onPress={() => {
                                 Alert.alert(
                                 '',
                                 '根据身份证号自动展示年龄',
                                 [
                                     {
                                     text: '好的',
                                     onPress: () => {},
                                     },
                                 ],
                                 {cancelable: false},
                                 );
                             }}>
                             <Text style={styles.title}>年龄</Text>
                             <Text style={styles.title}>
                                 {this.state.age}
                             </Text>
                         </TouchableOpacity>
                         <TouchableOpacity
                                 onPress={() => {
                                     UICitySelect.show(this.state.areaList, item => {
                                     this.setState({area: item, city: item.city_name});
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
                                     <Text style={[styles.title, {marginRight: scaleSize(30)}]}>
                                     {this.state.area
                                         ? this.state.area.city_name
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
                             <Text style={styles.title}>手机号</Text>
                             <TextInput placeholder={'手机号'}
                                 style={styles.title}
                                 onChangeText={text => this.setState({phone: text})}>
                                 {this.state.phone}
                             </TextInput>
                         </TouchableOpacity>
                         <TouchableOpacity style={styles.listrow}>
                             <Text style={styles.title}>微信号</Text>
                             <TextInput placeholder={'微信号'}
                                 style={styles.title}
                                 onChangeText={text => this.setState({wechat: text})}>
                                 {this.state.wechat}
                             </TextInput>
                         </TouchableOpacity>
                         <TouchableOpacity style={styles.listrow} onPress={()=>{
                             UISelect.show([{title:"气枪",code:1},{title:"实弹",code:2}],{
                                 title:'培训类型',onPress:(item)=>{
                                 this.setState({
                                     trainingType:item
                                 })
                                 UISelect.hide();
                                 }
                             })
                             }}>
                             <Text style={styles.title}>培训类型</Text>
                             <Text style={styles.title}>{this.state.trainingType?.title}</Text>
 
                         </TouchableOpacity>
                         <TouchableOpacity style={styles.listrow} onPress={()=>{
                             UISelect.show([{title:"一个月内",code:1},{title:"三个月内",code:2},{title:"半年内",code:3}],{
                                 title:'培训时间',onPress:(item)=>{
                                 this.setState({
                                     trainingTime:item
                                 })
                                 UISelect.hide();
                                 }
                             })
                             }}>
                             <Text style={styles.title}>培训时间</Text>
                             <Text style={styles.title}>{this.state.trainingTime?.title}</Text>
 
                         </TouchableOpacity>
                        
                         <TouchableOpacity style={styles.listrow}>
                             <Text style={styles.title}>备注</Text>
                             <TextInput placeholder={'备注信息'}
                                 style={styles.title}
                                 onChangeText={text => this.setState({remark: text})}>
                                 {this.state.remark}
                             </TextInput>
                         </TouchableOpacity>
                         
                         <View  style={{display:'flex',flexDirection:'row',justifyContent:'center'}}>
                         <TouchableOpacity onPress={() => this.submitId()}
                         style={[styles.submitBtn, { marginTop: scaleSize(50), backgroundColor: this.btnDisabled() ? 'rgba(212,61,62,0.5)' : 'rgba(212,61,62,1)' }]}>
                         <Text style={styles.submitBtnText}>提交培训意向</Text>
                     </TouchableOpacity>
                         </View>
              
 
 
                     <TouchableOpacity onPress={()=>{
                         RouteHelper.navigate('ChatPage', {
                             loginUser: this.state.loginUser,
                             conversation: {
                                   user: {
                                     nickname: "CPSA客服",
                                     username: "CPSA",
                                     name: "CPSA客服"
                                   },
                                   type: 'single'
                             }
                         })
                     }} style={{flex: 1, alignItems: 'center', justifyContent: 'center',marginTop: scaleSize(20),marginBottom: scaleSize(20)}}>
                         <Text style={{color: '#858B9C',fontSize: scaleSize(12),}}>遇到问题，联系CPSA客服</Text>
                     </TouchableOpacity>
                     </ScrollView>
                </View>
         )
        }
      

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
      marginLeft:scaleSize(20),
      marginRight:scaleSize(20)
    },
    title: {
      fontSize: 16,
      color: '#111A34',
    },
    submitBtn: {
		width: scaleSize(335),
		height: scaleSize(50),
		backgroundColor: "rgba(212,61,62,0.5)",
		borderRadius: scaleSize(4),
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: {
        margin:0,
		fontSize: 18,
		color: "#fff",
        opacity: 0.7,
	}
  });