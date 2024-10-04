import React, { Component } from 'react'
import { View, Image, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native'
import { scanFile } from 'react-native-fs';
import UINavBar from '../../components/UINavBar'
import { scaleSize } from '../../global/utils';
import { images } from '../../res/images';
import Url from '../../api/Url';
import Request from '../../api/Request';
import { Toast } from 'teaset';
import store from '../../store';
import { RouteHelper } from 'react-navigation-easy-helper';
import ResponseCodeEnum from '../../constants/ResponseCodeEnum';

export default class AboutPage extends Component {
	constructor(props) {
        super(props);
        this.state = {
            password: '',
            newPassword: '',
            confirmPassword: ''
        }
    }
    
    editPas = async () => {
        const user = await store.UserStore.getLoginUser()
        const reg = /(?!.*\s)(?!^[\u4e00-\u9fa5]+$)(?!^[0-9]+$)(?!^[A-z]+$)(?!^[^A-z0-9]+$)^.{8,16}$/;
        if(!(reg.test(this.state.newPassword))){
            Toast.message("8-16个字符,不包含空格,必须包含数字,字母或字符至少两种")
            return
        }else if(this.state.newPassword != this.state.confirmPassword){
            Toast.message("两次新密码输入不一致")
            return
        }else{
            Request.post(Url.EDIT_PASSWORD, { 
                id: user.id,
                password: this.state.password,
                newPassword: this.state.newPassword
            }).then(res => {
                if(res?.data?.code === ResponseCodeEnum.SUCCESS){
                    Toast.message(res?.data?.msg)
                    store.UserStore.cleanLoginUser()
			        RouteHelper.reset("LoginPage")
                }else{
                    Toast.message(res?.data?.msg)
                }
            })
        }
        
    }


	render() {
		return (
			<View style={{ flex: 1 }}>
				<UINavBar title="修改密码" />
                <ScrollView contentContainerStyle={{ flex: 1 }}	style={{padding: scaleSize(15)}}>
                    <View style={styles.field_row}>
                        <Image source={images.login.verify_code} style={styles.icon} />
                        <TextInput
                            required={true}
                            placeholder={'输入旧密码'}
                            defaultValue={this.state.password}
                            value={this.state.password}
                            style={styles.input}
                            onChangeText={text => { this.setState({ password: text }) }}
                            secureTextEntry={true}
                        />
                    </View>
                    <View style={styles.field_row}>
                        <Image source={images.login.verify_code} style={styles.icon} />
                        <TextInput
                            required={true}
                            placeholder={'输入新密码'}
                            defaultValue={this.state.newPassword}
                            value={this.state.newPassword}
                            style={styles.input}
                            onChangeText={text => { this.setState({ newPassword: text }) }}
                            secureTextEntry={true}
                            maxLength={16}
                        />
                    </View>
                    <View style={styles.field_row}>
                        <Image source={images.login.verify_code} style={styles.icon} />
                        <TextInput
                            required={true}
                            placeholder={'确认新密码'}
                            defaultValue={this.state.confirmPassword}
                            value={this.state.confirmPassword}
                            style={styles.input}
                            onChangeText={text => { this.setState({ confirmPassword: text }) }}
                            secureTextEntry={true}
                            maxLength={16}
                        />
                    </View>
                    <Text style={{ fontSize: 16, color: PRIMARY_COLOR,margin: scaleSize(20) }}>注意：8-16个字符,不包含空格,必须包含数字,字母或字符至少两种</Text>

                    <View style={{ alignItems: 'center', position: 'absolute', bottom: 30, justifyContent: 'center', right: 40, left: 40 }}>
                        <TouchableOpacity
                            onPress={this.editPas}
                            style={{
                                marginTop: scaleSize(126),
                                width: scaleSize(330),
                                height: scaleSize(50),
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderRadius: scaleSize(4),
                                borderColor: "#D43D3E",
                                backgroundColor: "rgba(212,61,62,0.1)",
                            }}>
                            <Text style={{ fontSize: 18, color: PRIMARY_COLOR, fontWeight: 'bold' }}>确认修改</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
			</View>
		)
	}
}

var styles = {
    icon: {
        width: scaleSize(25),
        height: scaleSize(25),
    },
    field_row: {
        flexDirection: "row",
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: "#C4C4C4",
        padding: scaleSize(12),
        height: scaleSize(50),
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
    private_rule:{
       marginTop:10,
       width: scaleSize(280),
       height: 20,
       alignItems: 'center',
       justifyContent: 'center',
       flexDirection: "row"
    },
    private_rule_text:{
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