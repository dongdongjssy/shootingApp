import React, { Component } from 'react';
import {
    View,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Dimensions,
    Platform
} from 'react-native'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import { scaleSize } from '../../global/utils';
import Url from '../../api/Url';
import UINavBar from '../../components/UINavBar';
import Pdf from 'react-native-pdf';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';

// screen
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

@inject('UserStore') //注入；
@observer
export default class IntegralRulePage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    render() {
        const pdfSource = Platform.OS === 'android' ? require("./RULE.pdf") : { uri: "bundle-assets://RULE.pdf", cache: true }

        return  <SafeAreaViewPlus style={{ flex: 1 }}>
            <UINavBar title="积分累计规则" style={{backgroundColor: '#1D142F'}}/>
            <ScrollView style={styles.pdfView}>
                <Pdf
                    source={{uri: Url.RULE_PDF + 'RULE(1).pdf?versionId=CAEQExiBgIDomY_FxBciIGQ5NzRkOGVmNTZhMzQxOTViMGEwYjEyNzc2ZWMxYzQ5'}}
                    style={styles.pdf}
                    onError={(error) => console.debug("onError", error)}
                    onPressLink={(uri) => console.debug(`Link presse: ${uri}`)}
                />
            </ScrollView>
        </SafeAreaViewPlus>
    }
}


const styles = StyleSheet.create({
    pdf: {
        width: scaleSize(375),
        height: scaleSize(2500),
    },
    pdfView: {
        backgroundColor: '#F6F5FA',
    }
});





