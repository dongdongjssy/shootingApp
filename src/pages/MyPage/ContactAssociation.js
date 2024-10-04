import React, { Component } from 'react'
import { View, StyleSheet,Image,ScrollView } from 'react-native'
import UINavBar from '../../components/UINavBar'
import Pdf from 'react-native-pdf';
import SafeAreaViewPlus from '../../components/SafeAreaViewPlus';

export default class ContactAssociation extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        var imgPath = require('../../res/images/mine/contact_association.png');
  		return <View style={{ flex: 1 ,backgroundColor:"#FFF"}}>
        		 <UINavBar title="总会官员" />
        	    	<ScrollView style={{flex:1}}>
                        <Image source={imgPath} style={{  width: scaleSize(375), height: scaleSize(946) }} />
        			</ScrollView>
              </View>
   	}

}







var styles={
	
}
