import React, { Component } from 'react'
import { Text, View, DeviceEventEmitter, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import UISwitch from '../../components/UISwitch'
import LinearGradient from 'react-native-linear-gradient'
import store from '../../store'
import Url from '../../api/Url'
import request from '../../api/Request';
import ApiUrl from '../../api/Url.js';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import { scaleSize } from '../../global/utils'
import { UserStore } from '../../store/UserStore';

export default class MyRolesPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			loginuser: props.user,
			status: props.user?.status,
            roles: [],
            roleList: []
		}
	}

    async componentDidMount() {
        let roles = []
        let user = await UserStore.getLoginUser()
		request.post(ApiUrl.USER_ROLE_LIST, { userId: user.id }).then((res) => {
			if (res.status === ResponseCodeEnum.STATUS_CODE) {
				res?.data?.rows?.map((item,index)=>{
                    if(item.description == '国内裁判' || item.description == '国际裁判'){
                        item.description = '裁判'
                    }
                    roles.push({descriptionName: item.description})

                    var obj = {};
                    roles = roles.reduce(function(item, next) {
                        obj[next.descriptionName] ? '' : obj[next.descriptionName] = true && item.push(next);
                        return item;
                    }, []);

                    this.setState({
                        roles: roles,
                        roleList: res?.data?.rows
                    })
                })
			}
		}).catch(err => console.log(err))

        
    }

    render() {
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
			<UINavBar  title={null}/>
			<ScrollView style={{backgroundColor: '#FFFFFF',paddingBottom: scaleSize(20)}}>
				{/* <ImageBackground style={{ height: scaleSize(210), paddingTop: statusBarHeight, paddingBottom: scaleSize(10) }} source={images.mine.roleBack} >
                    <View style={{ borderRadius: scaleSize(98 / 2), alignItems: 'center', justifyContent: "center" }}>
                        <Image
                            source={this.state.loginuser && this.state.loginuser.avatar ?
                                { uri: Url.CLIENT_USER_IMAGE + this.state.loginuser.avatar } :
                                images.login.login_logo
                            }
                            style={{ width: scaleSize(98), height: scaleSize(98), borderRadius: scaleSize(98 / 2) }}
                        />
                        {
                            this.state.status === ClientStatusEnum.VERIFIED.code ?
                                <Image
                                    style={{ width: scaleSize(120), height: scaleSize(35), position: "absolute", bottom: scaleSize(-5),  }}
                                    source={images.mine.vip}
                                /> : null
                        }
                    </View>
                </ImageBackground> */}
                {
                    this.state.roles?.map((item,index)=>{
                        let descriptionName = '';
                        if(item.descriptionName == '实弹射手'){
                            descriptionName = '实弹'
                        }if(item.descriptionName == '气枪射手'){
                            descriptionName = '气枪'
                        }if(item.descriptionName == '会长'){
                            descriptionName = '官员'
                        }if(item.descriptionName == '教官'){
                            descriptionName = '教官'
                        }if(item.descriptionName == '裁判'){
                            descriptionName = '裁判'
                        }
                            return ( <>
                             <View>
                                <ImageBackground
                                    style={{ width: '100%', height: scaleSize(50) }}
                                    source={images.mine.roleHeader}
                                >
                                    <Text style={{textAlign: 'center',marginTop: scaleSize(10),fontWeight: 'bold',fontSize: scaleSize(18),fontStyle: 'italic'}}>{item?.descriptionName}</Text>
                                </ImageBackground>
                                <View style={{
                                    backgroundColor: '#FFF4E4',
                                    width: scaleSize(355),
                                    marginLeft: scaleSize(10),
                                    marginRight: scaleSize(10),
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                    borderBottomLeftRadius: scaleSize(10),
                                    borderBottomRightRadius: scaleSize(10),
                                }}>
                                    {
                                        this.state.roleList?.map((item1,index1)=>{
                                            if(item1.description == item.descriptionName){
                                                return (
                                                    <View key={index1} style={{width: '50%',display: 'flex',alignItems: 'center',paddingBottom: scaleSize(10)}}>
                                                        <Image
                                                            style={{ width: scaleSize(70), height: scaleSize(70)  }}
                                                            source={{uri: Url.ROLE_IMAGE + item1?.pictureUrl}}
                                                        />
                                                        <Text>{item1?.name}</Text>
                                                    </View>
                                                )
                                            }
                                        })
                                    }
                                </View>
                            </View>

                            {/* <View>
                                <ImageBackground
                                    style={{ width: '100%', height: scaleSize(50) }}
                                    source={images.mine.roleHeader}
                                >
                                    <Text style={{textAlign: 'center',marginTop: scaleSize(10),fontWeight: 'bold',fontSize: scaleSize(18),fontStyle: 'italic'}}>实弹</Text>
                                </ImageBackground>
                                <View style={{
                                    backgroundColor: '#FFF4E4',
                                    width: scaleSize(355),
                                    marginLeft: scaleSize(10),
                                    marginRight: scaleSize(10),
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                    borderBottomLeftRadius: scaleSize(10),
                                    borderBottomRightRadius: scaleSize(10),
                                }}>
                                    {
                                        this.state.loginuser?.roles?.map((item,index1)=>{
                                            if(item.description == '实弹射手'){
                                                return (
                                                    <View key={index1} style={{width: '50%',display: 'flex',alignItems: 'center',paddingBottom: scaleSize(10)}}>
                                                        <Image
                                                            style={{ width: scaleSize(70), height: scaleSize(70)  }}
                                                            source={{uri: Url.ROLE_IMAGE + item?.pictureUrl}}
                                                        />
                                                        <Text>{item?.name}</Text>
                                                    </View>
                                                )
                                            }
                                        })
                                    }
                                </View>
                            </View>

                            <View>
                                <ImageBackground
                                    style={{ width: '100%', height: scaleSize(50) }}
                                    source={images.mine.roleHeader}
                                >
                                    <Text style={{textAlign: 'center',marginTop: scaleSize(10),fontWeight: 'bold',fontSize: scaleSize(18),fontStyle: 'italic'}}>气枪</Text>
                                </ImageBackground>
                                <View style={{
                                    backgroundColor: '#FFF4E4',
                                    width: scaleSize(355),
                                    marginLeft: scaleSize(10),
                                    marginRight: scaleSize(10),
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                    borderBottomLeftRadius: scaleSize(10),
                                    borderBottomRightRadius: scaleSize(10),
                                }}>
                                    {
                                        this.state.loginuser?.roles?.map((item,index1)=>{
                                            if(item.description == '气枪射手'){
                                                return (
                                                    <View key={index1} style={{width: '50%',display: 'flex',alignItems: 'center',paddingBottom: scaleSize(10)}}>
                                                        <Image
                                                            style={{ width: scaleSize(70), height: scaleSize(70)  }}
                                                            source={{uri: Url.ROLE_IMAGE + item?.pictureUrl}}
                                                        />
                                                        <Text>{item?.name}</Text>
                                                    </View>
                                                )
                                            }
                                        })
                                    }
                                </View>
                            </View>

                            <View>
                                <ImageBackground
                                    style={{ width: '100%', height: scaleSize(50) }}
                                    source={images.mine.roleHeader}
                                >
                                    <Text style={{textAlign: 'center',marginTop: scaleSize(10),fontWeight: 'bold',fontSize: scaleSize(18),fontStyle: 'italic'}}>教官</Text>
                                </ImageBackground>
                                <View style={{
                                    backgroundColor: '#FFF4E4',
                                    width: scaleSize(355),
                                    marginLeft: scaleSize(10),
                                    marginRight: scaleSize(10),
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                    borderBottomLeftRadius: scaleSize(10),
                                    borderBottomRightRadius: scaleSize(10),
                                }}>
                                    {
                                        this.state.loginuser?.roles?.map((item,index1)=>{
                                            if(item.description == '教官'){
                                                return (
                                                    <View key={index1} style={{width: '50%',display: 'flex',alignItems: 'center',paddingBottom: scaleSize(10)}}>
                                                        <Image
                                                            style={{ width: scaleSize(70), height: scaleSize(70)  }}
                                                            source={{uri: Url.ROLE_IMAGE + item?.pictureUrl}}
                                                        />
                                                        <Text>{item?.name}</Text>
                                                    </View>
                                                )
                                            }
                                        })
                                    }
                                </View>
                            </View>

                            <View>
                                <ImageBackground
                                    style={{ width: '100%', height: scaleSize(50) }}
                                    source={images.mine.roleHeader}
                                >
                                    <Text style={{textAlign: 'center',marginTop: scaleSize(10),fontWeight: 'bold',fontSize: scaleSize(18),fontStyle: 'italic'}}>裁判</Text>
                                </ImageBackground>
                                <View style={{
                                    backgroundColor: '#FFF4E4',
                                    width: scaleSize(355),
                                    marginLeft: scaleSize(10),
                                    marginRight: scaleSize(10),
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                    borderBottomLeftRadius: scaleSize(10),
                                    borderBottomRightRadius: scaleSize(10),
                                }}>
                                    {
                                        this.state.loginuser?.roles?.map((item,index1)=>{
                                            if(item.description == '国内裁判' || item.description == '国际裁判'){
                                                return (
                                                    <View key={index1} style={{width: '50%',display: 'flex',alignItems: 'center',paddingBottom: scaleSize(10)}}>
                                                        <Image
                                                            style={{ width: scaleSize(70), height: scaleSize(70)  }}
                                                            source={{uri: Url.ROLE_IMAGE + item?.pictureUrl}}
                                                        />
                                                        <Text>{item?.name}</Text>
                                                    </View>
                                                )
                                            }
                                        })
                                    }
                                </View>
                            </View>

                            <View>
                                <ImageBackground
                                    style={{ width: '100%', height: scaleSize(50) }}
                                    source={images.mine.roleHeader}
                                >
                                    <Text style={{textAlign: 'center',marginTop: scaleSize(10),fontWeight: 'bold',fontSize: scaleSize(18),fontStyle: 'italic'}}>官员</Text>
                                </ImageBackground>
                                <View style={{
                                    backgroundColor: '#FFF4E4',
                                    width: scaleSize(355),
                                    marginLeft: scaleSize(10),
                                    marginRight: scaleSize(10),
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                    borderBottomLeftRadius: scaleSize(10),
                                    borderBottomRightRadius: scaleSize(10),
                                }}>
                                    {
                                        this.state.loginuser?.roles?.map((item,index1)=>{
                                            if(item.description == '会长'){
                                                return (
                                                    <View key={index1} style={{width: '50%',display: 'flex',alignItems: 'center',paddingBottom: scaleSize(10)}}>
                                                        <Image
                                                            style={{ width: scaleSize(70), height: scaleSize(70)  }}
                                                            source={{uri: Url.ROLE_IMAGE + item?.pictureUrl}}
                                                        />
                                                        <Text>{item?.name}</Text>
                                                    </View>
                                                )
                                            }
                                        })
                                    }
                                </View>
                            </View> */}
                            </>
                        )
                    })
                }
            </ScrollView>
            </View>
    }
}