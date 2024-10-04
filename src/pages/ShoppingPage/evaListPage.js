import React, { Component, useState, useEffect } from 'react'
import { Text, View, DeviceEventEmitter, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
import { UltimateListView } from 'react-native-ultimate-listview';
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import UISwitch from '../../components/UISwitch'
import LinearGradient from 'react-native-linear-gradient'
import store from '../../store'
import Url from '../../api/Url'
import Request from '../../api/Request'
import { ClientStatusEnum } from '../../global/constants'
import { Toast, ModalIndicator } from 'teaset';
import { scaleSize } from '../../global/utils'
import HeaderCarousel from '../HomePage/HeaderCarousel';
import { UserStore } from '../../store/UserStore';
import ApiUrl from '../../api/Url';
import HttpBaseConfig from '../../api/HttpBaseConfig';
import UISelect from '../../components/UISelect';
import WebViewHtmlView from '../../components/WebViewHtmlView';
import { renderTimeStamp, renderTimeDuration } from '../../global/DateTimeUtils';

export default class EvaListPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            goodsId:props?.goodsId
        };
    }

    async onFetch(page = 1, startFetch, abortFetch) {
		var pageSize = 5
		try {
            let data = {
                pd:{
                    pageNum:page,
                    pageSize:pageSize
                },
                goodsId:this.state.goodsId
            }
            await Request.post(ApiUrl.EVA_LIST,data).then(res => {
                if (res.status === 200) {
                    console.log(res);
                    if(Math.ceil(res.data.total / pageSize) >= page){
                        startFetch(res?.data?.rows || [], pageSize);
                    }else{
                        startFetch([], pageSize);
                    }
                }
            }).catch(err => console.log(err));

		} catch (err) {
			abortFetch();
		}
	}
    

    render(){
        return <View style={{flex:1}}>
                    <UINavBar title="商品评价" style={{marginBottom:scaleSize(10)}}></UINavBar>
                    <View style={{ backgroundColor: "#F2F6F9", flex: 1 }}>
                    <UltimateListView 
						allLoadedText={"没有更多了"}
						waitingSpinnerText={'加载中...'}
						ref={ref => this.listView = ref}
						onFetch={this.onFetch.bind(this)}
						keyExtractor={(item, index) => `${index} -`}
						item={(item, index)=>{
                            return <View style={{backgroundColor:'#fff',width: '100%',marginTop: scaleSize(15), paddingHorizontal: scaleSize(34)}}>
                                <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                                    <Image style={{ width: scaleSize(25), height: scaleSize(25), marginTop: scaleSize(10), borderRadius: scaleSize(25 / 2) }} source={{ uri: ApiUrl.CLIENT_USER_IMAGE + item?.clientUser?.avatar }}></Image>

                                    <Text style={{ fontSize: scaleSize(12), fontWeight: '400', color: '#323232', marginTop: scaleSize(10), marginLeft: scaleSize(10) }}>{item?.clientUser?.nickname}</Text>
                                    <Text style={{ fontSize: scaleSize(12), fontWeight: '400', color: '#999999', marginTop: scaleSize(10), marginLeft: scaleSize(10) }}>{renderTimeDuration(item?.createTime)}</Text>
                                </View>

                                <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                                    <Start sta={item?.star} />
                                </View>

                                <Text style={{ marginTop: scaleSize(8), marginBottom: scaleSize(10.5) }}>{item?.comments}</Text>
                            </View>
						}} 
						displayDate
						emptyView={() => {
								return <View style={{ flex: 1, alignItems: 'center' }}>
									<Text style={{
										fontSize: 14, color: "rgba(0,0,0,0.60)",
										marginTop: scaleSize(100),
										fontWeight: "400"
									}}>暂无评价</Text>
								</View>
						}}
					/>

                    </View>

        </View>

    }
}
const Start = ({ sta }) => {
    const arrLisy = [1,2,3,4,5]
    return arrLisy.map((item,index)=>{
        if(sta<=index+1){
            return<Image style={{ width: scaleSize(14.1), height: scaleSize(13.5), marginTop: scaleSize(10) }} source={images.star}></Image>
        }else{
            return  <Image style={{ width: scaleSize(14.1), height: scaleSize(13.5), marginTop: scaleSize(10) }} source={images.yellowStar}></Image>
            
        }
    })
}