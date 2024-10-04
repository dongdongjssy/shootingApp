import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import UINavBar from '../../components/UINavBar'
import Pdf from 'react-native-pdf';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';

export default class Help extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const pdfSource = _IOS_ ?
            require("./HELP.pdf") :
            { uri: "bundle-assets://HELP.pdf", cache: true }

        return (
            <SafeAreaViewPlus style={{ flex: 1 }}>
                <UINavBar title={"帮助与反馈"} titleStyle={{ color: "#2B2B2B" }} statusBarStyle={'dark-content'} />

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