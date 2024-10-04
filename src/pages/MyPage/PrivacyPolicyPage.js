import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import UINavBar from '../../components/UINavBar'
import Pdf from 'react-native-pdf';
import Url from '../../api/Url';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';

export default class PrivacyPolicyPage extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <SafeAreaViewPlus style={{ flex: 1 }}>
                <UINavBar title={"隐私协议"} titleStyle={{ color: "#2B2B2B" }} statusBarStyle={'dark-content'} />

                    <Pdf
                        source={{uri: Url.RULE_PDF + 'w3ihb-rpmaf.pdf?versionId=CAEQHBiBgMCowYC92RciIGNjYTg4YmI0NjVhNTQ3YWZiZTViYTMxYmQzM2NjZjVj'}}
                        style={styles.pdf}
                        onError={(error) => console.debug("onError", error)}
                        onPressLink={(uri) => console.debug(`Link presse: ${uri}`)}
                    />
            </SafeAreaViewPlus>
        )
    }
}

const styles = StyleSheet.create({
    pdf: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    pdfView: {
        flex: 1,
        backgroundColor: '#F6F5FA',
        position: 'relative',
        justifyContent: 'flex-start',
        alignItems: 'center',
    }
});