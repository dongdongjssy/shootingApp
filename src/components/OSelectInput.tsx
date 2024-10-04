import React from 'react';
import {
	Text,
	View,
	TouchableOpacity,
} from 'react-native'
import I18n from 'react-native-i18n';
import styles from '../styles/TextInput.styles'
import { scaleSize } from '../global/utils';
import UIArrow from './UIArrow';

const OSelectInput = ({disabled,value,title,onPress}) => {
    return (<View style={styles.list_row} >
        <Text style={styles.list_row_title}>{I18n.t(title)}</Text>
        <View style={styles.input_view}>
            <TouchableOpacity
                disabled={disabled}
                onPress={() =>  onPress() }
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "flex-end", height: '100%', width: scaleSize(300) }}>
                <Text style={[styles.val_txt, { marginRight: scaleSize(5), color: "#2b2b2b" }]}>{/* color: jumpValue == 'add' ? "#2b2b2b" : "#8C9091" */}
                    {value}
                </Text>
                <UIArrow width={scaleSize(5)} style={{ marginTop: scaleSize(8) }} dir="bottom" />
            </TouchableOpacity>
        </View>
        <View style={styles.blank_space} />
    </View>
    )
}

export default OSelectInput;