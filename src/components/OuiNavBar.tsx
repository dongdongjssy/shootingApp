import React from 'react';
import {
    TouchableOpacity,
    Image,
} from 'react-native'
import UINavBar from './UINavBar';
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../res/images';
import { scaleSize } from '../global/utils';

const OuiNavBar = ({title}) => {
    return (<UINavBar
        title={title}
        titleStyle={{ fontSize: 18, fontWeight: '400', color: "#2B2B2B" }}
        leftView={
            <TouchableOpacity
                onPress={() => {
                    RouteHelper.goBack();
                }}
                style={{ width: scaleSize(50), height: scaleSize(50), alignItems: 'center', justifyContent: 'center' }}>
                <Image source={images.back_icon}
                    style={{ width: scaleSize(18), height: scaleSize(18) }}
                />
            </TouchableOpacity>
        }
        statusBarStyle={'dark-content'}
    />
    )
}

export default OuiNavBar;
