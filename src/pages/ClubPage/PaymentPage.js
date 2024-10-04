import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, ImageBackground,StyleSheet,Clipboard, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { Toast } from 'teaset';
import UINavBar from '../../components/UINavBar';
import { scaleSize } from '../../global/utils';
import { RELEASE_STATUS } from '../../global/constants';
import ApiUrl from '../../api/Url.js';
import UIConfirm from '../../components/UIConfirm';
import Url from '../../api/Url';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import Request from '../../api/Request';
import HTMLView from 'react-native-htmlview';
import WebViewHtmlView from '../../components/WebViewHtmlView';

export default class ActivityItem extends Component {
	constructor(props) {
		super(props)
		this.state = {
            statusText: '',
            detailData: this.props.detailData,
            loginuser: this.props.loginuser,
            myTraing: [], // 我的培训
			myContest: [], // 我的赛事
		}
	}
    
    paymentSubmit = () => {
        UIConfirm.show("是否确认完成付款", () => {
            //confirm
            this.editRegister();
		}, () => {
			//cancel
		})
    }
    
    
    editRegister = () => {
        const { detailData, loginuser } = this.state;
        //status 3 报名待确认
        console.log(detailData.myActivityId);
        Request.post(Url.REGISTER_EDIT, { id: detailData.myActivityId,status: 3 }).then(res => {
            console.log(res.data);
			if (res.data.code === ResponseCodeEnum.SUCCESS) {
                DeviceEventEmitter.emit('baomingUpdated',3);
                RouteHelper.goBack();
			}
		}).catch(err => {console.log(err)})
    }

    async copy(){
        const { detailData, loginuser } = this.state;
        Clipboard.setString(loginuser?.realName+","+detailData.title);
        let  str = await Clipboard.getString();
        Toast.success("复制成功")
    }

	render() {
        const { detailData, loginuser } = this.state;
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
            <UINavBar title="付款" 
            style={{ backgroundColor: '#DE2D32',color: '#FFFFFF' }} 
            backIconStyle={{ tintColor: "#fff" }}
            titleStyle={{ color: '#FFFFFF' }}/>
            <View style={{ flex: 1, paddingHorizontal: scaleSize(10) }}>
                <View style={{ backgroundColor: '#FFFFFF',height: scaleSize(130),marginTop: scaleSize(10),borderRadius: scaleSize(4),padding: scaleSize(10) }}>
                    <View style={{display:'flex',flexDirection: 'row',justifyContent: 'space-between',marginTop: scaleSize(5),alignItems: 'center'}}>
                        <Text style={{fontSize: scaleSize(18)}}>订单信息</Text>
                        <TouchableOpacity onPress={this.copy.bind(this)}>
                            <Text style={{borderColor: '#DE2D32',borderWidth: scaleSize(1),color: '#DE2D32',padding: scaleSize(5),paddingHorizontal: scaleSize(10)}}>复制</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{display:'flex',flexDirection: 'row',justifyContent: 'space-between',marginTop: scaleSize(10),marginBottom: scaleSize(10)}}>
                        <Text>{detailData.fkTableId === 1 ? "培训名称" : "赛事名称"}</Text>
                        <Text style={{width: scaleSize(220),textAlign: 'right'}} numberOfLines={1}>{detailData.title}</Text>
                    </View>
                    <View style={{display:'flex',flexDirection: 'row',justifyContent: 'space-between',marginTop: scaleSize(10)}}>
                        <Text>付款人</Text>
                        <Text>{loginuser?.realName}</Text>
                    </View>
                </View>
                <ScrollView style={{ backgroundColor: '#FFFFFF',marginTop: scaleSize(10),borderRadius: scaleSize(4),padding: scaleSize(10)}}>
                    <Text style={{fontSize: scaleSize(18),marginBottom: scaleSize(10)}}>付款步骤</Text>
                    {<WebViewHtmlView
                        content={detailData?.paymentCode?.detail}
                    />}
                    {/* <View style={styles.stepStyle}>
                        {<HTMLView
							value={detailData?.paymentCode?.detail}
						/>}
                    </View> */}

                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',marginTop: scaleSize(30),marginBottom: scaleSize(30)}}>
                        <Image
							style={{ width: scaleSize(150), height: scaleSize(150) }}
                            source={{uri: ApiUrl.PAYMENT_IMAGE + detailData?.paymentCode?.pictureUrl}}  />
                    </View>
                </ScrollView>

                <TouchableOpacity 
                onPress={()=> this.paymentSubmit() }
                style={styles.paymentBtn}>
                    <Image
                        style={{ width: scaleSize(25), height: scaleSize(25), marginRight: scaleSize(5) }}
                        source={images.common.payment} />
                    <Text>我已付款,通知客服</Text>
                </TouchableOpacity>
            </View>
		</View>
	}
}

var styles = StyleSheet.create({
    stepStyle: {
        marginTop: scaleSize(10),
    },
    numStyle: {
        width: scaleSize(20), 
        height: scaleSize(20), 
        backgroundColor: '#DE2222',
        borderRadius: scaleSize(10),
        textAlign: 'center',
        color: '#FFFFFF',
        lineHeight: scaleSize(20),
        marginRight: scaleSize(5)
    },
    step: {
        width: scaleSize(300),
        lineHeight: scaleSize(20),
    },
    paymentBtn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        height: scaleSize(50),
        backgroundColor: '#FFFFFF',
        // position: 'absolute',
        // bottom: scaleSize(10),
        // left: scaleSize(10),
        alignItems: 'center',
        marginTop: scaleSize(10),
        borderColor: '#DB090A',
        borderWidth: 1,
        borderRadius: scaleSize(4)
    }
})
