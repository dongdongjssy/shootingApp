import React, { Component } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput, Dimensions, ActivityIndicator } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images';
import { Toast, NavigationBar } from 'teaset';
import UICountDown from '../../components/UICountDown';
import store from '../../store';
import JMessage from 'jmessage-react-plugin';
import { scaleSize } from '../../global/utils';
import Axios from "axios";
import Url from '../../api/Url';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';
import simpleStore from '../../libs/simpleStore';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';



// screen
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
export default class LoginPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phone: "",//用户登录手机号
            phone2: "",//境外用户已有账号
            verifyCode: "",
            password: "",//境外用户已有账号密码
            login_ing: false,
            activeTabIndex: 0,
            abroadTabIndex: 1,//境外用户tab
            email: "",//境外用户普通访客邮箱
            emailCode: "",//境外用户普通访客邮箱验证码
            isCheck: false,
            selectedIndex:null,
        };
        this.onSelect = this.onSelect.bind(this)
    }

    onSelect(index, value) {
        console.log(index,value);
        this.setState({
            isCheck: !this.state.isCheck
        },()=>{
            if(this.state.isCheck){
                this.setState({
                    selectedIndex:index
                })
            }else{
                this.setState({
                    selectedIndex:null
                })  
            }
        })
    }

    login() {
        if(this.state.selectedIndex === null){
            Toast.message("请勾选同意用户隐私协议")
            return
        }
        if (this.state.activeTabIndex === 0 && (!this.state.phone || this.state.phone === "")) {
            Toast.message("请输入手机号")
            return
        }

        if (this.state.activeTabIndex === 0 && (!this.state.verifyCode || this.state.verifyCode === "")) {
            Toast.message("请输入验证码")
            return
        }

        if (this.state.activeTabIndex === 1 && this.state.abroadTabIndex === 1 && (!this.state.phone2 || this.state.phone2 === "")) {
            Toast.message("请输入账号")
            return
        }

        if (this.state.activeTabIndex === 1 && this.state.abroadTabIndex === 1 && (!this.state.password || this.state.password === "")) {
            Toast.message("请输入密码")
            return
        }

        if (this.state.activeTabIndex === 1 && this.state.abroadTabIndex === 0 && (!this.state.email || this.state.email === "")) {
            Toast.message("请输入邮箱")
            return
        }

        if (this.state.activeTabIndex === 1 && this.state.abroadTabIndex === 0 && (!this.state.emailCode || this.state.emailCode === "")) {
            Toast.message("请输入邮箱验证码")
            return
        }


        this.setState({
            login_ing: true,
        })

        let params = {};
        if (this.state.activeTabIndex === 0) {
            params.phone = this.state.phone,
                params.smsCode = this.state.verifyCode,
                params.userType = "mainland"
        } else if (this.state.activeTabIndex === 1 && this.state.abroadTabIndex === 0) {
            params.email = this.state.email,
                params.captcha = this.state.emailCode
        } else if (this.state.activeTabIndex === 1 && this.state.abroadTabIndex === 1) {
            params.phone = this.state.phone2,
                params.password = this.state.password
        }

        if (this.state.activeTabIndex === 1 && this.state.abroadTabIndex === 0 && this.state.email && this.state.emailCode) {
            Axios.post(Url.LOGIN_BY_EMAIL, params).then(async (res) => {
                this.setState({
                    login_ing: false,
                })
                if (res.data.code === ResponseCodeEnum.SUCCESS) {
                    console.debug("登录成功", JSON.stringify(res.data))
                    await simpleStore.save("loginUser", null)
                    Toast.message("登录成功")
                    RouteHelper.reset("MainPage")
                } else {
                    Toast.message(res.data.msg)
                }
            }).catch(err => {
                console.debug(err)
                this.setState({
                    login_ing: false,
                })
            })
        } else {
            store.UserStore.login(params).then(res => {
                this.setState({
                    login_ing: false,
                })
                if (res.code === ResponseCodeEnum.STATUS_CODE) {
                    console.debug("登录成功", JSON.stringify(res.data))
                    if (res.data.user.jgUsername) {
                        // 登录极光IMs
                        JMessage.login({
                            username: res.data.user.jgUsername,
                            password: res.data.user.jgUsername
                        }, () => {
                            console.debug("【极光】登录成功: ", res.data.user.jgUsername)
                        }, (error) => console.debug(error))
                    }

                    Toast.message("登录成功")
                    RouteHelper.reset("MainPage")
                }
            }).catch(err => {
                console.debug(err)
                this.setState({
                    login_ing: false,
                })
            })
        }


    }

    //发送手机验证码
    async sendSmsCode() {
        if (!this.state.phone || this.state.phone === "") {
            Toast.message("请输入手机号")
        } else if (!(/^[1][3,4,5,7,8,9][0-9]{9}$/.test(this.state.phone))) {
            Toast.message("手机号码有误，请重填");
            return false;
        } else {
            await store.UserStore.sendSmsCode(this.state.phone)
            this.refs.count_down.startCountDown()
        }
    }

    //发送邮箱验证码
    async sendEmailCode() {
        if (!this.state.email || this.state.email === "") {
            Toast.message("请输入邮箱")
        } else if (!(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(this.state.email))) {
            Toast.message("邮箱有误，请重填");
            return false;
        } else {
            let formdata = new FormData()
            formdata.append('email', this.state.email);
            await store.UserStore.sendEmailCode(formdata)
            this.refs.count_email.startCountDown()
        }
    }





    render() {


        var slognPath = require('../../res/images/login/slogon.png');
        var hongkongPhonePath = require('../../res/images/login/hongkong_phone.png');
        return (
            <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
                <NavigationBar
                    statusBarStyle="dark-content"
                    style={{ backgroundColor: "transparent" }} />
                <ScrollView keyboardShouldPersistTaps={'handled'}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: scaleSize(80) }}>
                        <View style={styles.loginLogoContainer}>
                            <Image source={images.login.login_logo} resizeMode="cover" style={styles.loginLogo} />
                        </View>
                        {/* <Text style={{ fontSize: scaleSize(18), fontFamily: 'PingFang SC', color: "#646464", marginTop: scaleSize(15), fontWeight: "700" }}>国际实用射击中国总会</Text> */}
                    </View>

                    <View style={{ height: scaleSize(30) }}></View>
                    <View style={{ marginHorizontal: scaleSize(15), borderTopLeftRadius: scaleSize(8), borderTopRightRadius: scaleSize(8) }}>
                        {/** tabs */}
                        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: "#EFEDF1", borderTopLeftRadius: scaleSize(8), borderTopRightRadius: scaleSize(8) }}>
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderTopLeftRadius: scaleSize(8),
                                    borderTopRightRadius: scaleSize(8),
                                    backgroundColor: this.state.activeTabIndex === 0 ? "#fff" : "#EFEDF1",
                                    width: SCREEN_WIDTH / 9 * 5
                                }}
                                onPress={() => this.setState({ activeTabIndex: 0 })}>
                                <Text style={[styles.tabText, { color: this.state.activeTabIndex === 0 ? "#E60012" : "#646464" }]}>手机验证码登录</Text>
                                <Image source={images.home.tab_decor} style={{ width: 22, height: 9, marginBottom: scaleSize(5) }} tintColor={this.state.activeTabIndex === 1 ? "#EFEDF1" : "#D43D3E"} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderTopLeftRadius: scaleSize(8),
                                    borderTopRightRadius: scaleSize(8),
                                    backgroundColor: this.state.activeTabIndex === 1 ? "#fff" : "#EFEDF1",
                                    width: SCREEN_WIDTH / 9 * 4
                                }}
                                onPress={() => this.setState({ activeTabIndex: 1 })}>
                                <Text style={[styles.tabText, { color: this.state.activeTabIndex === 1 ? "#E60012" : "#646464" }]}>用户名密码登录</Text>
                                <Image source={images.home.tab_decor} style={{ width: 22, height: 9, marginBottom: scaleSize(5) }} tintColor={this.state.activeTabIndex === 0 ? "#EFEDF1" : "#D43D3E"} />
                            </TouchableOpacity>
                        </View>

                        <View source={images.login.formbg} resizeMode="cover" style={{
                            // width: '100%',
                            alignItems: 'center',
                            backgroundColor: "#fff",
                            paddingBottom: scaleSize(25)
                        }}>

                            <View style={{ height: scaleSize(20) }}></View>
                            {
                                this.state.activeTabIndex === 0 ?
                                    <View style={styles.field_row}>
                                        <Image source={images.login.phone} style={styles.icon} />
                                        <TextInput
                                            required={true}
                                            placeholder={'请输入国内手机号'}
                                            defaultValue={this.state.activeTabIndex === 0 ? this.state.phone : this.state.phone2}
                                            value={this.state.activeTabIndex === 0 ? this.state.phone : this.state.phone2}
                                            style={styles.input}
                                            onChangeText={text => {
                                                if (this.state.activeTabIndex === 0)
                                                    this.setState({ phone: text })
                                                else
                                                    this.setState({ phone2: text })
                                            }}
                                            keyboardType={'number-pad'}
                                            maxLength={11}
                                        />
                                    </View> :
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'row'
                                            }}
                                            onPress={() => this.setState({ abroadTabIndex: 1 })}>
                                            <View style={[styles.point, { backgroundColor: this.state.abroadTabIndex === 1 ? PRIMARY_COLOR : "#646464" }]}></View>
                                            <Text style={[styles.tabText2, { color: this.state.abroadTabIndex === 1 ? PRIMARY_COLOR : "#646464" }]}>我有账号</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'row'
                                            }}
                                            onPress={() => this.setState({ abroadTabIndex: 0 })}>
                                            <View style={[styles.point, { backgroundColor: this.state.abroadTabIndex === 0 ? PRIMARY_COLOR : "#646464" }]}></View>
                                            <Text style={[styles.tabText2, { color: this.state.abroadTabIndex === 0 ? PRIMARY_COLOR : "#646464" }]}>我是访客</Text>
                                        </TouchableOpacity>
                                    </View>
                            }
                            <View style={{ height: scaleSize(15) }}></View>
                            {
                                this.state.activeTabIndex === 0 &&
                                <View style={styles.field_row}>
                                    <Image source={images.login.verify_code} style={styles.icon} />
                                    <TextInput
                                        required={true}
                                        placeholder={'请输入验证码'}
                                        defaultValue={this.state.verifyCode}
                                        value={this.state.verifyCode}
                                        style={styles.input}
                                        onChangeText={text => { this.setState({ verifyCode: text }) }}
                                        keyboardType={'number-pad'}
                                        maxLength={6}
                                    />
                                    <UICountDown
                                        beginText={'发送验证码'}
                                        endText={'重新发送'}
                                        activeButtonStyle={{ width: scaleSize(125), height: scaleSize(44) }}
                                        count={60}
                                        ref='count_down'
                                        pressAction={() => this.sendSmsCode()}
                                        changeWithCount={(count) => count + 's 后发送'}
                                        end={() => { }} />
                                </View>
                            }
                            {/* 境外普通访客 */}
                            {
                                this.state.abroadTabIndex === 0 && this.state.activeTabIndex === 1 && <>
                                    <View style={styles.field_row}>
                                        <Image source={images.login.email} style={styles.icon} />
                                        <TextInput
                                            required={true}
                                            placeholder={'请输入邮箱'}
                                            defaultValue={this.state.email}
                                            value={this.state.email}
                                            style={styles.input}
                                            onChangeText={text => { this.setState({ email: text }) }}
                                        />
                                    </View>
                                    <View style={styles.field_row}>
                                        <Image source={images.login.verify_code} style={styles.icon} />
                                        <TextInput
                                            required={true}
                                            placeholder={'请输入验证码'}
                                            defaultValue={this.state.emailCode}
                                            value={this.state.emailCode}
                                            style={styles.input}
                                            onChangeText={text => { this.setState({ emailCode: text }) }}
                                            secureTextEntry={true}
                                            maxLength={6}
                                        />
                                        <UICountDown
                                            beginText={'发送验证码'}
                                            endText={'重新发送'}
                                            activeButtonStyle={{ width: scaleSize(125), height: scaleSize(44) }}
                                            count={60}
                                            ref='count_email'
                                            pressAction={() => this.sendEmailCode()}
                                            changeWithCount={(count) => count + 's 后发送'}
                                            end={() => { }} />
                                    </View>
                                </>
                            }
                            {/* 境外已有账号用户 */}
                            {
                                this.state.abroadTabIndex === 1 && this.state.activeTabIndex === 1 && <>
                                    <View style={styles.field_row}>
                                        <Image source={images.login.user} style={styles.icon} />
                                        <TextInput
                                            required={true}
                                            placeholder={'请输入用户名'}
                                            defaultValue={this.state.phone2}
                                            value={this.state.phone2}
                                            style={styles.input}
                                            onChangeText={text => { this.setState({ phone2: text }) }}
                                        />
                                    </View>
                                    <View style={styles.field_row}>
                                        <Image source={images.login.verify_code} style={styles.icon} />
                                        <TextInput
                                            required={true}
                                            placeholder={'请输入密码'}
                                            defaultValue={this.state.password}
                                            value={this.state.password}
                                            style={styles.input}
                                            onChangeText={text => { this.setState({ password: text }) }}
                                            secureTextEntry={true}
                                        />
                                    </View>
                                </>
                            }
                            <View style={{ marginTop: scaleSize(10),height: scaleSize(20) }}>
                                <RadioGroup color='#D43D3E' selectedIndex={this.state.selectedIndex} onSelect = {(index, value) => this.onSelect(index,value)}>
                                
                                        <RadioButton color='#D43D3E' value='item1'>
                                        <View style={{display:'flex',flexDirection:'row'}}>
                                        <Text>我已阅读并同意</Text>
                                        <TouchableOpacity
                                            onPress={() => this.showPrivateRule()}>
                                            <Text style={{color:'#00c'}}>用户隐私协议</Text>
                                        </TouchableOpacity>
                                        </View>

                                    </RadioButton>
                                </RadioGroup>
                            </View>
                            <View style={{ height: scaleSize(35) }}></View>



                            <TouchableOpacity
                                disabled={this.state.login_ing}
                                onPress={() => this.login()}
                                style={[styles.submit_btn, { opacity: this.state.login_ing ? 0.7 : 1 }]}>
                                {this.state.login_ing ? <ActivityIndicator
                                    size="small"
                                    color={'#fff'}
                                    style={{ marginRight: scaleSize(10) }}
                                /> : null}<Text style={styles.submit_btn_text}>登录/注册</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.showPrivateRule()}
                                style={[styles.private_rule]}>
                                <Text style={[styles.private_rule_text, { color: "#646464" }]}>登录/注册即表示同意用户协议</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: scaleSize(56), justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                            <Image source={slognPath} style={styles.slogon} />
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }

    showPrivateRule() {
        RouteHelper.navigate("PrivacyPolicy");
    }
};

var styles = {
    loginLogo: {
        width: '100%',
        height: scaleSize(141),
        width: scaleSize(141),
        //        backgroundColor: "#fff",
        //        borderColor: "#fff"
    },
    loginLogoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: scaleSize(141),
        height: scaleSize(141),
        //        backgroundColor: "#fff",
        //        borderRadius: scaleSize(12),
        //        elevation: 10,
        //        shadowColor: "#f9f9f9",
        //        shadowOpacity: 0.36,
        //        shadowRadius: 12,
        //        shadowOffset: {
        //            width: 0,
        //            height: 5
        //        }
    },
    slogon: {
        justifyContent: 'center',
        alignItems: 'center',
        width: scaleSize(132),
        height: scaleSize(56),
    },
    tabText: {
        paddingTop: scaleSize(12),
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 16,
        fontWeight: "500",
        fontFamily: 'PingFang SC',
        color: "#646464"
    },
    tabText2: {

    },
    title: {
        fontSize: 24,
        fontFamily: 'PingFang SC',
        fontWeight: '600',
        color: PRIMARY_COLOR,
        opacity: 1,
        marginTop: scaleSize(40),
    },
    icon: {
        width: scaleSize(25),
        height: scaleSize(25),
    },
    hongkong_phone_icon: {
        width: scaleSize(18),
        height: scaleSize(19),
        marginLeft: 4,
    },
    field_row: {
        flexDirection: "row",
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: "#C4C4C4",
        // borderRadius: scaleSize(2),
        padding: scaleSize(12),
        height: scaleSize(50),
        width: scaleSize(280),
        // backgroundColor: 'rgba(212,61,62,0.1)',
    },
    input: {
        padding: 0,
        margin: 0,
        paddingLeft: scaleSize(6),
        flex: 1,
        fontSize: 18,
        color: '#D43D3E',
    },
    submit_btn: {
        width: scaleSize(280),
        height: scaleSize(50),
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: "row"
    },
    submit_btn_text: {
        color: "#fff",
        fontWeight: '600',
        fontSize: 18,
    },
    private_rule: {
        marginTop: 10,
        width: scaleSize(280),
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: "row"
    },
    private_rule_text: {
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 10,
        fontWeight: "500",
        fontFamily: 'PingFang SC',
    },
    point: {
        width: scaleSize(8),
        height: scaleSize(8),
        borderRadius: scaleSize(8),
        marginRight: scaleSize(8),
    }
}









