import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, ImageBackground, StyleSheet, TextInput, DeviceEventEmitter } from 'react-native'
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

export default class RegisterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            registerParams: props.params,
            item: props.item,
            registerFormConfig: props.item.registerConfig,
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
        }

        UserStore.getLoginUser().then(user => {
            this.setState({ loginuser: user })
            if (props.item.registerConfig?.personalInfos) {
                for (var i = 0; i < props.item.registerConfig.personalInfos.length; i++) {
                    let pInfo = props.item.registerConfig.personalInfos[i]
                    this.state.registerFormPersonalInfos.push({
                        name: pInfo.infoName,
                        category: 'personal',
                        type: '',
                        value: user[pInfo.infoName],
                        remark: ''
                    })
                }
            }
        })

        // console.debug("params: ", this.state.registerParams)
        // console.debug("schedules: ", this.state.schedules)
        // console.debug("configs: ", this.state.registerFormConfig.customizedInfos)

        if (props.item.registerConfig?.customizedInfos) {
            for (var i = 0; i < props.item.registerConfig.customizedInfos.length; i++) {
                let cInfo = props.item.registerConfig.customizedInfos[i]
                this.state.registerFormCustomizeInfos.push({
                    name: cInfo.itemName,
                    category: 'customize',
                    type: cInfo.itemType,
                    value: null,
                    remark: '',
                })
            }
        }

        this.forceUpdate()

        DeviceEventEmitter.addListener('userUpdated', (res) => {
            if (res.user) {
                console.debug("【监听回调，报名页】更新用户信息")
                this.setState({ loginuser: res.user })
            }
        })
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
                    <Text style={[styles.personalInfo, { color: '#ffd6a1', flex: 4 }]}>{
                        pInfo.infoName != "sex" ? (
                            pInfo.infoName == "certExpireDate" || pInfo.infoName == "graduateDate" ?
                                Moment(this.state.loginuser[pInfo.infoName], 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') :
                                this.state.loginuser[pInfo.infoName]
                        ) : (
                                this.state.loginuser[pInfo.infoName] == 1 ? '男' : '女'
                            )
                    }</Text>
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

    updateCustomizeValue(index, value) {
        this.state.registerFormCustomizeInfos[index].value = value
        this.forceUpdate()
    }

    updateCustomizeRemark(index, value) {
        this.state.registerFormCustomizeInfos[index].remark = value
        this.forceUpdate()
    }

    updateDates(s) {
        let date = Moment(s.startDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') + "_" + Moment(s.endDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')
        // 报名日期不能多选
        // let findDateIndex = this.state.registerDates.indexOf(date)
        // if (findDateIndex >= 0) {
        //     this.state.registerDates.splice(findDateIndex, 1)
        // } else {
        //     this.state.registerDates.push(date)
        // }
        this.state.registerDates = []
        this.state.registerDates.push(date)
        this.forceUpdate()
    }

    validate() {
        if (this.state.personalInfoMissing) {
            Toast.info("请完善个人信息。")
            return false
        }

        if (this.state.registerDates.length === 0) {
            Toast.info("请选择参赛日期。")
            return false
        }

        if (this.state.registerFormConfig?.customizedInfos) {
            for (var i = 0; i < this.state.registerFormConfig.customizedInfos.length; i++) {
                let cInfo = this.state.registerFormConfig.customizedInfos[i]
                if (cInfo.isRequired && this.state.registerFormCustomizeInfos[i].value === null) {
                    Toast.info("请填写[" + cInfo.itemName + "]信息。")
                    return false
                }
            }
        }

        if (!this.state.readAndAgreed) {
            Toast.info("请阅读并同意免责声明。")
            return false
        }

        return true
    }

    submit() {
        this.state.registerForm.registerFormItems = []
        this.setState({ registerComplete: true })
        this.state.registerForm.registerFormItems.push(...this.state.registerFormPersonalInfos)
        this.state.registerForm.registerFormItems.push(...this.state.registerFormCustomizeInfos)
        this.state.registerForm.schedules = this.state.registerDates.join(",")
        this.forceUpdate()

        if (!this.validate()){
            this.setState({ registerComplete: false })
            return
        } 

        ModalIndicator.show("提交中")
        console.debug("submit form:", this.state.registerForm)
        Request.post(ApiUrl.REGISTER_ADD, this.state.registerForm).then(res => {
            this.setState({ registerComplete: false })
            if (res.status === 200) {
                DeviceEventEmitter.emit("baomingUpdated", {
                    fkId: this.state.registerForm.fkId,
                    fkTable: this.state.registerForm.fkTable,
                    clientUserId: this.state.registerForm.clientUserId
                })

                this.setState({ registerComplete: true })
                RouteHelper.navigate("RegisterSuccessPage",{
                    fkTableId: this.state.item.fkTableId
                })
            }

            ModalIndicator.hide()
        }).catch(err => {
            ModalIndicator.hide()
            Toast.info("提交失败")
            console.debug(err)
        })
    }

    render() {
        return (
            <>
                <UINavBar backgroundColor={'#feebcb'} />
                <ScrollView style={{ flex: 1, backgroundColor: '#feebcb' }}>
                    <View style={{ paddingHorizontal: scaleSize(15), marginBottom: scaleSize(100) }}>
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
                                {this.state.registerFormConfig.personalInfos.map(pInfo => this.renderPersonalInfo(pInfo))}
                            </View>

                            {this.state.personalInfoMissing ?
                                <View style={{ alignItems: 'center', marginTop: scaleSize(15) }}>
                                    <TouchableOpacity onPress={() => RouteHelper.navigate("EditInfoPage", { loginuser: this.state.loginuser })}>
                                        <Text style={{ fontSize: 14, backgroundColor: '#ffdaa3', borderRadius: 27, width: scaleSize(200), textAlign: 'center', paddingVertical: scaleSize(5) }}>基本信息不全，去完善</Text>
                                    </TouchableOpacity>
                                </View> : null
                            }
                        </View>

                        {/*参赛日期选择*/}
                        <View style={styles.sectionView}>
                            <Text style={styles.sectionTitle}>{this.state.registerForm.fkTable == 1 ? '培训日期' : '参赛日期'}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {
                                    this.state.schedules.map((s, index) => {
                                        return (
                                            <TouchableOpacity style={{ backgroundColor: '#f6f6f6', borderRadius: 4, marginRight: scaleSize(8), marginTop: scaleSize(10), width: scaleSize(150) }}
                                                onPress={() => this.updateDates(s)}>
                                                <View style={{ position: 'relative' }}>
                                                    {
                                                        this.state.registerDates.indexOf(Moment(s.startDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') + "_" + Moment(s.endDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')) >= 0 ?
                                                            <View style={styles.pickDateImg}>
                                                                <Image source={images.common.check} style={[styles.radioBtnsImg, { tintColor: '#fff' }]}></Image>
                                                            </View> : null
                                                    }
                                                    <Text style={{ paddingVertical: scaleSize(12), paddingHorizontal: scaleSize(8) }}>
                                                        {Moment(s.startDate, 'YYYY-MM-DD HH:mm:ss').format('M')}月
                                                    {Moment(s.startDate, 'YYYY-MM-DD HH:mm:ss').format('DD')}日 -
                                                    {Moment(s.endDate, 'YYYY-MM-DD HH:mm:ss').format('M')}月
                                                    {Moment(s.endDate, 'YYYY-MM-DD HH:mm:ss').format('DD')}日
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        </View>

                        {/*备注信息*/}
                        <View>
                            <Text style={styles.sectionTitle}>备注信息</Text>
                            <View style={styles.sectionView}>
                                {
                                    this.state.registerFormConfig?.customizedInfos?.map((config, index) => {
                                        return (
                                            <View style={{ marginBottom: scaleSize(5) }}>
                                                <Text style={styles.sectionTitle}>{config.itemName}</Text>
                                                {
                                                    config.itemType === "radio" ?
                                                        <View>
                                                            <View style={{ flexDirection: 'row', flex: 1, marginBottom: scaleSize(10), position: 'relative' }}>
                                                                <View style={{ flex: 1 }}><Text>是否需要</Text></View>
                                                                <View style={{ flex: 1, flexDirection: 'row', position: 'absolute', right: 0 }}>
                                                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
                                                                        onPress={() => {
                                                                            this.updateCustomizeValue(index, '需要')
                                                                            config.isRemarkDisplay = true
                                                                        }}>
                                                                        {
                                                                            this.state.registerFormCustomizeInfos[index].value === '需要' ?
                                                                                <View style={[styles.radioBtns, styles.radioBtnsChecked]}>
                                                                                    <Image source={images.common.check} style={styles.radioBtnsImg}></Image>
                                                                                </View> :
                                                                                <View style={styles.radioBtns}></View>
                                                                        }
                                                                        <Text>需要</Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
                                                                        onPress={() => {
                                                                            this.updateCustomizeValue(index, '不需要')
                                                                            config.isRemarkDisplay = false
                                                                        }}>
                                                                        {
                                                                            this.state.registerFormCustomizeInfos[index].value !== '不需要' ?
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
                                                                config.isRemarkDisplay ?
                                                                    <TextInput
                                                                        style={[styles.sectionRemark, { textAlignVertical: 'top' }]}
                                                                        multiline={true}
                                                                        numberOfLines={4}
                                                                        placeholder={config.itemRemark ? config.itemRemark : ""}
                                                                        onChangeText={(text) => this.updateCustomizeRemark(index, text)}
                                                                        value={this.state.registerFormCustomizeInfos[index].remark}
                                                                    /> : null
                                                            }
                                                        </View> :
                                                        <TextInput
                                                            style={[styles.sectionRemark, { textAlignVertical: 'top' }]}
                                                            multiline={true}
                                                            numberOfLines={4}
                                                            placeholder={config.itemRemark ? config.itemRemark : ""}
                                                            onChangeText={(text) => this.updateCustomizeValue(index, text)}
                                                            value={this.state.registerFormCustomizeInfos[index].value}
                                                        />
                                                }
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        </View>

                        {/*录入渠道号*/}
                        <View style={styles.sectionView}>
                            <Text style={styles.sectionTitle}>推荐编号（如有）</Text>
                            <TextInput
                                onChangeText={(text) => {
                                    this.state.registerForm.source = text
                                    this.forceUpdate()
                                }}
                                style={{ borderBottomWidth: 1, borderBottomColor: '#c4c4c4' }}>
                            </TextInput>
                        </View>
                    </View>
                </ScrollView>
                {/*底部按钮*/}
                <View style={{ width: '100%', position: 'absolute', bottom: scaleSize(0) }}>
                    <View style={{ flexDirection: 'row', backgroundColor: '#fff', paddingVertical: scaleSize(10), paddingLeft: scaleSize(15), justifyContent: 'center' }}>
                        <Checkbox
                            title='我已阅读并同意'
                            titleStyle={{ color: '#646464', paddingLeft: 4 }}
                            // checkedIcon={<Image style={{ width: 15, height: 15, tintColor: '#323232' }} source={images.checked} />}
                            checked={this.state.readAndAgreed}
                            onChange={checked => this.setState({ readAndAgreed: checked })}
                        />
                        <TouchableOpacity style={{ marginLeft: scaleSize(4) }} onPress={() => {
                            RouteHelper.navigate('Disclaimers')
                        }}>
                            <Text style={{ textAlign: 'center', textDecorationLine: 'underline', textDecorationStyle: 'solid', color: '#db090a' }}>《免责声明》</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <TouchableOpacity style={{ flex: 1, backgroundColor: '#feebcb' }} onPress={() => {
                            let user = this.state.loginuser;
                            if (this.state.item.pageText === "活动") {
                                const club = this.state.item.club
                                RouteHelper.navigate('ChatPage', {
                                    loginUser: user,
                                    conversation: {
                                        user: {
                                            nickname: club.title + " 俱乐部客服",
                                            username: club.jgUsername,
                                            name: club.title + " 俱乐部客服"
                                        },
                                        type: 'single'
                                    }
                                })
                            } else {
                                RouteHelper.navigate('ChatPage', {
                                    loginUser: user,
                                    conversation: {
                                        user: {
                                            nickname: "CPSA客服",
                                            username: "CPSA",
                                            name: "CPSA客服"
                                        },
                                        type: 'single'
                                    }
                                })
                            }
                        }}>
                            <Text style={[styles.bottomBtn]}>联系客服</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1.5, backgroundColor: this.state.registerComplete ? '#FFA0A0' : '#db090a' }} onPress={() => this.submit()} disabled={this.state.registerComplete}>
                            <Text style={[styles.bottomBtn, { color: '#fff' }]}>{!this.state.registerComplete ? "确认报名" : "已报名"}</Text>
                        </TouchableOpacity>
                    </View>
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