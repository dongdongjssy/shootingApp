import React, { Component } from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import {
    Toast
} from 'teaset';
import UINavBar from '../../components/UINavBar';

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.UserStore = this.props.UserStore;

    }

    async componentDidMount() {


    }
    render() {
        var list = this.state.list;
        return (<View style={{ flex: 1 }}>
            <UINavBar title="提交成功" />
            <View style={{ flex: 1 ,alignItems:'center',justifyContent:'center'}}>
                <Image 
                source={images.common.submit_success}
                style={{
                    width:scaleSize(105),
                    height:scaleSize(105),
                }}
                />
                <Text style={{ fontSize: 16, color:"rgba(50, 50, 50, 1)",marginTop:scaleSize(35)}}>已收到您的投诉，我们会尽快处理</Text>
                <TouchableOpacity
                    onPress={() => {
                        RouteHelper.goBack();
                    }}
                    style={styles.btn}>
                    <Text style={styles.btn_text}>返回</Text>
                </TouchableOpacity>
            </View>
        </View>)
    }

}







var styles = {
    btn: {
        backgroundColor: '#F5F5F5',
        height: scaleSize(49),
        width: scaleSize(345),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scaleSize(25),
        marginTop: scaleSize(161),
    },
    btn_text: {
        color: '#323232',
        fontSize: 14,
        fontWeight: "400",
       
    }
}
