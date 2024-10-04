import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import UINavBar from '../../components/UINavBar'
import Pdf from 'react-native-pdf';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';

export default class ServiceAggreementPage extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const pdfSource = _IOS_ ?
            require("./SERVICE_AGGREEMENT.pdf") :
            { uri: "bundle-assets://SERVICE_AGGREEMENT.pdf", cache: true }

        return (
            <SafeAreaViewPlus style={{ flex: 1 }}>
                <UINavBar title={"服务协议"} titleStyle={{ color: "#2B2B2B" }} statusBarStyle={'dark-content'} />

                <View style={styles.pdfView}>
                    {/* <Pdf
                        source={pdfSource}
                        style={styles.pdf}
                        onError={(error) => console.debug("onError", error)}
                        onPressLink={(uri) => console.debug(`Link presse: ${uri}`)}
                    /> */}
                </View>
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