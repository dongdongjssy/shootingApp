import React, { Component } from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    ImageBackground,
    DeviceEventEmitter
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import UINavBar from '../../components/UINavBar';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView';
import ShadowCard from '../../components/ShadowCard';
import UITabBar from '../../components/UITabBar';
import UISelect from '../../components/UISelect';
import request from '../../api/Request';
import ApiUrl from '../../api/Url.js';
import { scanFile } from 'react-native-fs';
import { scaleSize } from '../../global/utils';
import Url from '../../api/Url';
import { ClientStatusEnum } from '../../global/constants';
import IntegralInfor from './integralMyInforPage';

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginuser: props.loginuser,
            typeGroupList: [{ title: '气枪原厂组',code: 1},{ title: '气枪标准组',code: 2}],
            ageGroupList: [{ title: '少年组',code: 1},{ title: '青年组',code: 2},{ title: '成人组',code: 3},{ title: '长青组',code: 4},{ title: '女子组',code: 5},{ title: '耆英组',code: 6}],
            typeTitle: '',
            ageTitle: '',
            showIntegral: false,
            userIntegralList: []
        };
        this.UserStore = this.props.UserStore;

    }

    componentDidMount(){
        
    }

    
    receiveIntegral(){
        let params = {
            name: this.state.loginuser?.realName,
			member: this.state.loginuser?.memberId,
            ageGroup: this.state.ageTitle,
            gunGroup: this.state.typeTitle
        }
        request.post(Url.USERINTEGRAL_ADD,params).then((res) => {
			if (res?.data?.code === 0) {
                DeviceEventEmitter.emit("intrgralAdd")
                this.receiveintegral_if()
			}
		}).catch(err => ModalIndicator.hide())
    }

    //判断是否领取过积分卡
	receiveintegral_if(){
        request.post(Url.USERINTEGRAL_LIST,{ //分页随意传多少
            pd: {
                pageSize: 10,
                pageNum: 1
            },
			member: this.state.loginuser?.memberId
        }).then((res) => {
			if (res?.data?.code === 0) {
                if(res?.data?.total > 0){
                    RouteHelper.navigate("MyIntegralListPage", {
                        loginuser: this.state.loginuser,
                        userIntegralList: res?.data?.rows[0]
                    })
                }
			}
		}).catch(err => ModalIndicator.hide())
    }


    render() {
        return <View style={{ flex: 1, backgroundColor: '#271B3F' }}>
            <UINavBar title="2021 CPSA Action Air 电子积分卡"  titleStyle={{fontSize: scaleSize(16)}} style={{backgroundColor: '#1D142F'}}/>
            <ImageBackground source={images.mine.integralBack} style={{ height: scaleSize(280) }}>
                <IntegralInfor loginuser={this.state.loginuser}/>
            </ImageBackground>
            {
                this.state.showIntegral ? <View style={{marginTop: scaleSize(100),display: 'flex',alignItems: 'center',position: 'absolute',bottom: scaleSize(50),left: scaleSize(12.5)}}>
                    <TouchableOpacity
                        onPress={() => {
                            UISelect.show(this.state.typeGroupList, {
                                onPress: (item) => {
                                    this.setState({
                                        typeTitle: item.title,
                                    })
                                    UISelect.hide();
                                }
                            })
                        }}
                        style={styles.filter_item}>
                        <View style={styles.filter_View}>
                            <Image
                            source={images.mine.qiangzu}
                            style={{width: scaleSize(22),height: scaleSize(16)}} />   
                            <Text style={styles.filter_label}>请选择参赛的枪组</Text>
                        </View>
                        <View style={styles.filter_View}>
                            <Text style={styles.filter_label}>{this.state.typeTitle ? this.state.typeTitle : "请选择"}</Text>
                            <Image
                                source={images.common.arrow_down}
                                style={{ width: scaleSize(8), height: scaleSize(5) }} />                                
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            UISelect.show(this.state.ageGroupList, {
                                onPress: (item) => {
                                    this.setState({
                                        ageTitle: item.title,
                                    })
                                    UISelect.hide();
                                }
                            })
                        }}
                        style={styles.filter_item}>
                        <View style={styles.filter_View}>
                            <Image
                            source={images.mine.laonianzu}
                            style={{width: scaleSize(18),height: scaleSize(18),marginLeft: scaleSize(2),marginRight: scaleSize(2)}} />   
                            <Text style={styles.filter_label}>请选择参赛的年龄组</Text>
                        </View>
                        <View style={styles.filter_View}>
                            <Text style={styles.filter_label}>{this.state.ageTitle ? this.state.ageTitle : "请选择"}</Text>
                            <Image
                                source={images.common.arrow_down}
                                style={{ width: scaleSize(8), height: scaleSize(5) }} />                                
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { this.receiveIntegral() }}
                        style={{
                            width: scaleSize(350),
                            height: scaleSize(57),
                            borderRadius: scaleSize(4),
                            backgroundColor: "#E9C990",
                            marginTop: scaleSize(80)
                        }}>
                        <Text style={{color: '#000000',lineHeight: scaleSize(57),fontSize: scaleSize(18),textAlign: 'center'}}>领取我的电子积分卡</Text>
                    </TouchableOpacity>
                </View> : <>
                    {
                        this.state.loginuser?.status == ClientStatusEnum.VERIFIED.code ? <View style={{display: 'flex',alignItems: 'center',position: 'absolute',bottom: scaleSize(50),left: scaleSize(12.5)}}>
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({
                                    showIntegral: true
                                })
                            }}
                            style={{
                                width: scaleSize(350),
                                height: scaleSize(57),
                                borderRadius: scaleSize(4),
                                backgroundColor: "#E9C990",
                                position: 'relative'
                            }}>
                            <Text style={{color: '#000000',lineHeight: scaleSize(57),fontSize: scaleSize(18),textAlign: 'center'}}>您的电子积分卡尚未领取</Text>
                            <Image
                                source={images.mine.rightArrow}
                                style={{width: scaleSize(17),height: scaleSize(16),position: 'absolute',top: scaleSize(20),right: scaleSize(30)}} />
                        </TouchableOpacity></View>
                        : 
                        <View style={{display: 'flex',alignItems: 'center',position: 'absolute',bottom: scaleSize(50),left: scaleSize(12.5)}}>
                            <TouchableOpacity
                                onPress={() => {
                                    RouteHelper.navigate("AuthenticationPage", {
                                        user: this.state.loginuser
                                    })
                                }}
                                style={{
                                    width: scaleSize(350),
                                    height: scaleSize(57),
                                    borderRadius: scaleSize(4),
                                    backgroundColor: "#E9C990",
                                    position: 'relative'
                                }}>
                                <Text style={{color: '#000000',lineHeight: scaleSize(57),fontSize: scaleSize(18),textAlign: 'center'}}>您尚未认证，请认证后领取</Text>
                                <Image
                                    source={images.mine.rightArrow}
                                    style={{width: scaleSize(17),height: scaleSize(16),position: 'absolute',top: scaleSize(20),right: scaleSize(30)}} />
                            </TouchableOpacity>
                        </View>
                    }
                </>
            }    
        </View>
    }
}

var styles = {
    filter_item: {
        padding: scaleSize(8),
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: scaleSize(4),
        width: scaleSize(350),
        height: scaleSize(50),
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: scaleSize(20)
    },
    filter_View: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    filter_label: {
        color: '#FFFFFF',
        marginLeft: scaleSize(5),
        marginRight: scaleSize(10)
    }
}





