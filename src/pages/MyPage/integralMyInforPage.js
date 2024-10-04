import React, { Component } from 'react';
import {
    View,
    Image,
    Text,
} from 'react-native'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { scaleSize } from '../../global/utils';
import Url from '../../api/Url';

@inject('UserStore') //注入；
@observer
export default class integralInfor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginuser: props.loginuser,
        };
        this.UserStore = this.props.UserStore;

    }

    renderExpireDt(date) {
		if (date == null || date == undefined || date == "" || date.length == 0) {
			return "未设置";
		} else {
			return date.split(" ")[0];
		}
	}


    render() {
        return  <>
                    {/* <View style={{marginTop: scaleSize(30),marginBottom: scaleSize(30)}}>
                        <Text style={{color: '#E9C990',textAlign: 'center',fontSize: scaleSize(20)}}>2021 CPSA Action Air 电子积分卡</Text>
                    </View> */}
                    <View style={{display: 'flex',alignItems: 'center',marginTop: scaleSize(30)}}>
                        <View style={{width: scaleSize(170),display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                            <Image
                                source={images.mine.jifenLeft}
                                style={{width: scaleSize(35),height: scaleSize(60),marginRight: scaleSize(10),marginTop: scaleSize(30)}} />
                            <Image
                                source={this.state.loginuser?.avatar ?
                                    { uri: Url.CLIENT_USER_IMAGE + this.state.loginuser.avatar } :
                                    images.login.login_logo
                                }
                                style={{ width: scaleSize(80), height: scaleSize(80), borderRadius: scaleSize(80 / 2) }}
                            />
                            <Image
                                source={images.mine.jifenRight}
                                style={{width: scaleSize(35),height: scaleSize(60),marginLeft: scaleSize(10),marginTop: scaleSize(30)}} />
                        </View>
                        <Text numberOfLines={1} style={{color: '#FFFFFF',fontSize: scaleSize(20),marginTop: scaleSize(30)}}>
                            {this.state.loginuser?.realName ? this.state.loginuser?.realName : this.state.loginuser?.nickname}
                        </Text>
                        <Text style={{color: '#FFFFFF',fontSize: scaleSize(15),marginTop: scaleSize(10)}}>{this.renderExpireDt(this.state.loginuser?.memberId)}</Text>
                    </View>
            </>
    }
}






