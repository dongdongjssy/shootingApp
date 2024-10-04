import React from 'react';
import {
    View,
} from 'react-native'
import I18n from 'react-native-i18n';
import { scaleSize } from '../global/utils';
import UIButton from './UIButton';

const OuiButton = ({title,onPress,plain}) => {
    return (<View style={{ flexDirection: "row" }}>
    <UIButton
        title={I18n.t(title)}
        containerStyle={{ flex: 1, marginRight: scaleSize(5), height: scaleSize(42) }}
        onPress={() =>  onPress()   }
        plain={plain} />
</View>
    )
}

export default OuiButton;