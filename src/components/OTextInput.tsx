import React from 'react';
import {
	Text,
	View,
	TextInput,
} from 'react-native'
import I18n from 'react-native-i18n';
import styles from '../styles/TextInput.styles'

const OTextInput = ({editable,value,title,onChangeText}) => {
    return (<View style={styles.list_row} >
        <Text style={styles.list_row_title}>{I18n.t(title)}</Text>
        <View style={styles.input_view}>
            <TextInput
                editable={editable}
                value={value}
                style={{ textAlign: 'right', width: '100%', color: "#2b2b2b" }}
                onChangeText={(text) => {
                    onChangeText(text)
                }} />
        </View>
        <View style={styles.blank_space} />
    </View>
    )
}

export default OTextInput;