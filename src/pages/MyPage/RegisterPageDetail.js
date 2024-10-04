import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, ImageBackground, StyleSheet, TextInput, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { Toast, ModalIndicator, Checkbox } from 'teaset';
import UINavBar from '../../components/UINavBar';
import Request from '../../api/Request';
import { scaleSize } from '../../global/utils';
import Moment from 'moment';
import ApiUrl from '../../api/Url';
import { UserStore } from '../../store/UserStore';
import { images } from '../../res/images';

export default class RegisterPageDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            registerParams: props.params,
            item: props.item,
            registerFormConfig: {
                personalInfos: props.item?.registerConfig?.personalInfos,
                customizedInfos: props.item?.registerConfig?.customizedInfos
            },
            schedules: props.item.schedules,
            source: '',
            loginuser: props.loginuser,
            registerFormPersonalInfos: [],
            registerFormCustomizeInfos: [],
            readAndAgreed: false,
            registerForm: {
                fkId: props.params.fkId,
                fkTable: props.params.fkTable,
                clientUserId: props.params.clientUserId,
                source: "",
                schedules: "",
                registerFormItems: []
            },
            personalInfoMissing: false,
            registerDates: [],
            registerComplete: false,
            registerDetail: props.registerDetail
        }


    }

    renderPersonalInfo(pInfo) {
        let label = ""
        if (pInfo.infoName === "realName") label = "真实姓名"
        if (pInfo.infoName === "nickname") label = "昵称"
        if (pInfo.infoName === "sex") label = "性别"
        if (pInfo.infoName === "email") label = "电子邮件"
        if (pInfo.infoName === "phone") label = "联系电话"
        if (pInfo.infoName === "city") label = "所在城市"
        if (pInfo.infoName === "address") label = "地址"
        if (pInfo.infoName === "memberId") label = "射手编号"
        if (pInfo.infoName === "englishName") label = "英文名"
        if (pInfo.infoName === "certExpireDate") label = "认证有效期"
        if (pInfo.infoName === "graduateDate") label = "结业日期"
        // if (pInfo.infoName === "passportNo") label = "护照号码"
        if (pInfo.infoName === "idNumber") label = "身份证号"

        if (this.state.loginuser[pInfo.infoName])
            return (
                <View style={{ flexDirection: 'row', flex: 1, marginVertical: scaleSize(2) }}>
                    <Text style={[styles.personalInfo, { color: '#fff', flex: 1 }]}>{label}</Text>
                    <Text style={[styles.personalInfo, { color: '#ffd6a1', flex: 4 }]}>{this.state.loginuser[pInfo.infoName]}</Text>
                </View>
            )
        else {
            if (!this.state.personalInfoMissing) {
                this.setState({ personalInfoMissing: true })
            }

            return (
                <View style={{ flexDirection: 'row', flex: 1, marginVertical: scaleSize(2) }}>
                    <Text style={[styles.personalInfo, { color: '#fff', flex: 1 }]}>{label}</Text>
                    <Text style={[styles.personalInfo, { color: '#fe7347', flex: 4 }]}>暂无录入</Text>
                </View>
            )
        }
    }

    render() {
        const { registerDetail } = this.props;
        return (
            <>
                <UINavBar backgroundColor={'#feebcb'} />
                <ScrollView style={{ flex: 1, backgroundColor: '#feebcb' }}>
                    <View style={{ paddingHorizontal: scaleSize(15), marginBottom: scaleSize(70) }}>
                        {/*标题和头像*/}
                        <View style={{ flexDirection: 'row', flex: 1, marginTop: scaleSize(10) }}>
                            <View style={{ flexDirection: 'column', flex: 2 }}>
                                <Text style={{ fontSize: 26, color: '#D48722', fontWeight: '600', fontFamily: '.PingFang SC' }}>确认报名表</Text>
                                <Text style={{ fontSize: 22, color: '#DDAE6B', fontFamily: 'Arial' }}>Registration Form</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Image style={{ width: scaleSize(60), height: scaleSize(60), borderRadius: scaleSize(60 / 2), marginRight: scaleSize(15) }}
                                    source={this.state.loginuser && this.state.loginuser.avatar ?
                                        { uri: ApiUrl.CLIENT_USER_IMAGE + this.state.loginuser.avatar } :
                                        images.login.login_logo
                                    }
                                />
                            </View>
                        </View>

                        {/*个人信息*/}
                        <View style={[styles.sectionView, { backgroundColor: '#323232', position: 'relative', minHeight: scaleSize(120) }]}>
                            <Image style={styles.personalInfoBackImg} source={images.common.register_form} />
                            <View>
                                {this.state.registerFormConfig?.personalInfos?.map(pInfo => this.renderPersonalInfo(pInfo))}
                            </View>

                            {this.state.personalInfoMissing ?
                                <View style={{ alignItems: 'center', marginTop: scaleSize(15) }}>
                                    <TouchableOpacity onPress={() => RouteHelper.navigate("UserCenterPage", { loginuser: this.state.loginuser, user: this.state.loginuser })}>
                                        <Text style={{ fontSize: 14, backgroundColor: '#ffdaa3', borderRadius: 27, width: scaleSize(200), textAlign: 'center', paddingVertical: scaleSize(5) }}>基本信息不全，去完善</Text>
                                    </TouchableOpacity>
                                </View> : null
                            }
                        </View>

                        {/*参赛日期选择*/}
                        <View style={styles.sectionView}>
                            <Text style={styles.sectionTitle}>参赛日期</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                <TouchableOpacity style={{ backgroundColor: '#f6f6f6', borderRadius: 4, marginRight: scaleSize(8), marginTop: scaleSize(10), width: scaleSize(150) }}>
                                    <View style={{ position: 'relative' }}>
                                        <Text style={{ paddingVertical: scaleSize(12), paddingHorizontal: scaleSize(8) }}>
                                            {Moment((registerDetail?.schedules)?.split('_')[0], 'YYYY-MM-DD').format('M')}月
                                        {Moment((registerDetail?.schedules)?.split('_')[0], 'YYYY-MM-DD').format('D')}日-
                                        {Moment((registerDetail?.schedules)?.split('_')[1], 'YYYY-MM-DD').format('M')}月
                                        {Moment((registerDetail?.schedules)?.split('_')[1], 'YYYY-MM-DD').format('D')}日
                                    </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/*备注信息*/}
                        <View>
                            <Text style={styles.sectionTitle}>培训备注信息</Text>
                            <View style={styles.sectionView}>
                                {
                                    registerDetail?.registerFormItems?.map((item, index) => {
                                        return (
                                            <>
                                                {
                                                    item?.type === "radio" ?
                                                        <View style={{ marginTop: scaleSize(5),marginBottom: scaleSize(5) }} key={index}>
                                                            <Text style={styles.sectionTitle}>{item?.name}</Text>
                                                            <View>
                                                                <View style={{ flexDirection: 'row', flex: 1, marginBottom: scaleSize(5), position: 'relative' }}>
                                                                    <View style={{ flex: 1 }}><Text>是否需要</Text></View>
                                                                    <View style={{ flex: 1, flexDirection: 'row', position: 'absolute', right: 0 }}>
                                                                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                            {
                                                                                item.value === '需要' ?
                                                                                    <View style={[styles.radioBtns, styles.radioBtnsChecked]}>
                                                                                        <Image source={images.common.check} style={styles.radioBtnsImg}></Image>
                                                                                    </View> :
                                                                                    <View style={styles.radioBtns}></View>
                                                                            }
                                                                            <Text>需要</Text>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                            {
                                                                                item.value === '需要' ?
                                                                                    <View style={styles.radioBtns}></View> :
                                                                                    <View style={[styles.radioBtns, styles.radioBtnsChecked]}>
                                                                                        <Image source={images.common.check} style={styles.radioBtnsImg}></Image>
                                                                                    </View>
                                                                            }
                                                                            <Text>不需要</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                                {
                                                                    item.remark ?
                                                                        <TextInput
                                                                            style={[styles.sectionRemark, { textAlignVertical: 'top' }]}
                                                                            multiline={true}
                                                                            numberOfLines={4}
                                                                            value={item.remark}
                                                                        /> : null
                                                                }
                                                            </View>
                                                        </View> : (
                                                            item?.type === '' ? null : <View style={{ marginTop: scaleSize(5),marginBottom: scaleSize(5) }} key={index}>
                                                                <Text style={styles.sectionTitle}>{item?.name}</Text>
                                                                <TextInput
                                                                    style={[styles.sectionRemark, { textAlignVertical: 'top' }]}
                                                                    multiline={true}
                                                                    numberOfLines={4}
                                                                    value={item.value}
                                                                />
                                                            </View>
                                                        )
                                                }
                                            </>
                                        )
                                    })
                                }
                            </View>
                        </View>

                        {/*录入渠道号*/}
                        <View style={styles.sectionView}>
                            <Text style={styles.sectionTitle}>推荐编号（如有）</Text>
                            <TextInput
                                defaultValue={registerDetail.source}
                                style={{ borderBottomWidth: 1, borderBottomColor: '#c4c4c4' }}>
                            </TextInput>
                        </View>
                    </View>
                </ScrollView>
                {/*底部按钮*/}
                <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                    <TouchableOpacity style={{ flex: 1.5, backgroundColor: '#db090a' }} onPress={() => {
                        RouteHelper.navigate("CommonActivityDetailPage", { detailData: this.state.item })
                        // {
                        //     this.state.registerForm.fkTable === 1 ? RouteHelper.navigate("CommonActivityDetailPage", { detailData: this.state.item })
                        //     : RouteHelper.navigate("ActivityDetailPage", { detailData: this.state.item, loginuser: this.state.loginuser })
                        // }
                    }}>
                        <Text style={[styles.bottomBtn, { color: '#fff' }]}>{this.state.registerForm.fkTable === 1 ? "查看培训详情" : "查看赛事详情"}</Text>
                    </TouchableOpacity>
                </View>

            </>
        )
    }
}

var styles = {
    sectionView: {
        backgroundColor: '#fff',
        marginVertical: scaleSize(8),
        paddingVertical: scaleSize(15),
        paddingHorizontal: scaleSize(10),
        borderRadius: 4
    },
    sectionTitle: {
        color: '#323232',
        fontFamily: '.PingFang SC',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: scaleSize(8)
    },
    sectionRemark: {
        backgroundColor: '#f6f6f6',
        borderRadius: 2
    },
    bottomBtn: {
        fontSize: 15,
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingVertical: scaleSize(12)
    },
    radioBtns: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#646464',
        borderRadius: 8,
        marginLeft: scaleSize(30),
        marginRight: scaleSize(5)
    },
    radioBtnsChecked: {
        backgroundColor: '#ffdaa3',
        borderColor: '#ffdaa3',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center'
    },
    radioBtnsImg: {
        width: 10,
        height: 10,
    },
    pickDateImg: {
        position: 'absolute',
        top: 0,
        right: 0,
        borderColor: '#323232',
        backgroundColor: '#323232',
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 4,
        paddingHorizontal: scaleSize(5),
        paddingVertical: scaleSize(1)
    },
    personalInfo: {
        fontSize: 13,
        fontWeight: '500',
        fontFamily: '.PingFang SC'
    },
    personalInfoBackImg: {
        width: scaleSize(120),
        height: scaleSize(120),
        position: 'absolute',
        top: 0,
        right: 0
    }
}