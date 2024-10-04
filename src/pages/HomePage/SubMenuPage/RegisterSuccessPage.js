import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, ImageBackground, BackHandler, TextInput } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
// import { images } from '../../res/images';
import { Toast, ModalIndicator, Checkbox } from 'teaset';
import UINavBar from '../../../components/UINavBar';
import EmptyView from '../../../components/EmptyView';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import Request from '../../../api/Request';
import { scaleSize } from '../../../global/utils';
import Moment from 'moment';
import { renderTimeDuration } from '../../../global/DateTimeUtils';
import ApiUrl from '../../../api/Url';
import { UserStore } from '../../../store/UserStore';
import { images } from '../../../res/images';

export default class RegisterSuccessPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fkTableId: props.fkTableId
        }
    }

    componentWillMount() {
		//监听返回键
		BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
	}

	componentWillUnmount() {
		//取消对返回键的监听
		BackHandler.removeEventListener('hardwareBackPress', this.onBackClicked);
	}

	//BACK物理按键监听
	onBackClicked = () => {
        RouteHelper.reset("MainPage")
		return true;
	}

    render() {
        return (
            <ScrollView style={{ backgroundColor: '#F6F6F6', position: 'relative' }}>
                <UINavBar backgroundColor={'rgba(255, 255, 255, 0.9)'} 
                leftView={
                    <TouchableOpacity
                        onPress={() => {
                            RouteHelper.reset("MainPage")
                        }}
                        style={{ flex: 1, marginLeft: scaleSize(6), alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.back}
                            resizeMode="contain"
                            style={{
                                width: scaleSize(20),
                                height: scaleSize(20),
                                tintColor: PRIMARY_COLOR
                            }} />
                    </TouchableOpacity>
                }
                />

                <View style={{ borderTopColor: 'rgba(0, 0, 0, 0.1)', borderTopWidth: 1, backgroundColor: '#fff', paddingVertical: scaleSize(30) }}>
                    <Image style={{ width: scaleSize(160), alignSelf: 'center' }} source={images.common.register_success} />
                    <Text style={{ textAlign: 'center', color: '#4FE356', fontSize: 20, fontFamily: '.PingFang SC', fontWeight: '700', marginVertical: scaleSize(15) }}>已收到报名申请</Text>
                    {
                        //审核确认后，
                        this.state.fkTableId == 1 && <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: '.PingFang SC', marginVertical: scaleSize(10) }}>可在“我的”{">"}“我的培训”中付款</Text>
                    }
                    {
                        this.state.fkTableId == 2 && <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: '.PingFang SC', marginVertical: scaleSize(10) }}>可在“我的”{">"}“我的赛事”中付款</Text>
                    }
                </View>

                <View style={{ marginTop: scaleSize(150) }}>
                    <TouchableOpacity style={{ justifyContent: 'center', backgroundColor: '#D43D3E', borderRadius: 2, marginHorizontal: scaleSize(20), paddingVertical: scaleSize(15) }}
                        onPress={() => {
                            if(this.state.fkTableId == 1){
                                RouteHelper.navigate('CommonActivityListPage',{
                                    params: {
                                        pageText: "认证/培训",
                                        fkTableId: 1,
                                        restApiUrl: ApiUrl.TRAINING_LIST,
                                        imagePath: ApiUrl.TRAINING_IMAGE,
                                        carouselOnPage: 2,
                                    },
                                })
                            }else if(this.state.fkTableId == 2){
                                RouteHelper.navigate('CommonActivityListPage',{
                                    params: {
                                        pageText: "国内/际赛事",
                                        fkTableId: 2,
                                        restApiUrl: ApiUrl.CONTEST_LIST,
                                        imagePath: ApiUrl.CONTEST_IMAGE,
                                        carouselOnPage: 3
                                    },
                                })
                            }else{
                                RouteHelper.reset('MainPage')
                            }
                        }}>
                        <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: '.PingFang SC', color: '#fff' }}>返回</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        )
    }
}