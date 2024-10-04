import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, TextInput, Alert } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images';
import { Toast, ModalIndicator, Overlay } from 'teaset';
import UINavBar from '../../components/UINavBar';
import UICitySelect from '../../components/UICitySelect';
import ImagePicker from 'react-native-image-picker';
import Url from '../../api/Url';
import { PRIMARY_COLOR } from '../../global/constants';
import store from '../../store';
import Request from '../../api/Request';
import { UserStore } from '../../store/UserStore';
import { scaleSize } from '../../global/utils';

export default class UpdatePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            oldPwd: undefined,
            newPwd: undefined,
            confirmNewPwd: undefined
        };
    }

    updatePassword() {
        ModalIndicator.show("更新密码");
        let params = {
            id: this.props.loginuser.id,
            password: this.state.oldPwd,
            smsCode: this.state.newPwd
        }
        UserStore.validatePassword(params).then(res => {
            console.debug("validate password: ", res)

            if (res.code !== 200) {
                ModalIndicator.hide()
                Toast.message("失败，请确认旧密码是否正确")
            } else {
                Toast.message("密码更新成功")
                RouteHelper.goBack()
            }

            ModalIndicator.hide()
        }).catch((err) => {
            Toast.message("信息提交出错，请重试")
            ModalIndicator.hide()
            console.debug("[ERROR] update user info error: ", err.message)
        })
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <UINavBar title="更新密码" />
                <ScrollView>
                    <View style={{ paddingHorizontal: scaleSize(25), paddingVertical: scaleSize(20) }}>
                        <TouchableOpacity style={styles.listrow}>
                            <Text style={styles.title}>旧密码</Text>
                            <TextInput
                                style={styles.title}
                                value={this.state.oldPwd}
                                onChangeText={text => this.setState({ oldPwd: text })}
                                secureTextEntry={true} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.listrow}>
                            <Text style={styles.title}>新密码</Text>
                            <TextInput
                                style={styles.title}
                                value={this.state.newPwd}
                                onChangeText={text => this.setState({ newPwd: text })}
                                secureTextEntry={true} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.listrow}>
                            <Text style={styles.title}>确认新密码</Text>
                            <TextInput
                                style={styles.title}
                                value={this.state.confirmNewPwd}
                                onChangeText={text => this.setState({ confirmNewPwd: text })}
                                secureTextEntry={true} />
                        </TouchableOpacity>
                        {
                            (this.state.confirmNewPwd && (this.state.newPwd !== this.state.confirmNewPwd)) ?
                                <Text style={{ color: PRIMARY_COLOR, marginTop: scaleSize(5) }}>两次输入密码不相同！</Text> :
                                <Text style={{ marginTop: scaleSize(5) }}></Text>
                        }
                    </View>

                    <View style={{ paddingHorizontal: scaleSize(25), flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        <TouchableOpacity
                            disabled={!(this.state.oldPwd && this.state.newPwd && this.state.confirmNewPwd && (this.state.newPwd === this.state.confirmNewPwd))}
                            onPress={() => this.updatePassword()}
                            style={{
                                marginTop: scaleSize(20),
                                height: scaleSize(40),
                                width: scaleSize(150),
                                backgroundColor: !(this.state.oldPwd && this.state.newPwd && this.state.confirmNewPwd && (this.state.newPwd === this.state.confirmNewPwd)) ? "rgba(212, 61, 62, 0.1)" : PRIMARY_COLOR,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>确定</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        )
    }

}

var styles = StyleSheet.create({
    listrow: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: "#E2E4EA",
        minHeight: scaleSize(55),
    },
    title: {
        fontSize: 16,
        color: "#111A34",
    }
})