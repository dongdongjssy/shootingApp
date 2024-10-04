import React from 'react';
import {
	Text,
	View,
} from 'react-native'
import I18n from 'react-native-i18n';
import styles from '../styles/TextInput.styles'

const OTextDisplay = ({value,title}) => {
    return (<View style={styles.list_row} >
        <Text style={styles.list_row_title}>{I18n.t(title)}</Text>
        <View style={styles.input_view}>
            <Text>{value}</Text>
        </View>
        <View style={styles.blank_space} />
    </View>
    )
}

export default OTextDisplay;