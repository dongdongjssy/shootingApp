import React, { Component } from 'react'
import { Text, View, DeviceEventEmitter,TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
import UINavBar from '../../components/UINavBar'
import { scaleSize } from '../../global/utils'
import WebViewHtmlView from '../../components/WebViewHtmlView';


export default class GoodsBannerDetailPage extends Component {
    constructor(props) {
		super(props);
		this.state = {
            carousel:props?.carousel,
		};
	}


    render(){
        return <View style={{flex:1,backgroundColor:'#F5F6F8'}}>
            <UINavBar title="商品详情" style={{marginBottom:scaleSize(10)}}/>
            <Text style={{fontSize:scaleSize(20),fontWeight:'600',textAlign:'center'}}>{this.state.carousel?.title}</Text>

            <View style={{flex:1,paddingHorizontal:scaleSize(20),marginTop:scaleSize(20)}}>
            <WebViewHtmlView content={this.state.carousel?.subTitle} />

            </View>

      
        </View>
    }

}