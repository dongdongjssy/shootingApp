import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	ImageBackground,
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import {images} from '../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import HTMLView from 'react-native-htmlview';
import AutoSizeImage from '../../components/AutoSizeImage';

@inject('UserStore') //注入；
@observer
export default class HtmlViewPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.UserStore = this.props.UserStore;

	}
	static defaultProps = {
	  html: '',
	  title:"",
	  contentStyle:"",
	}

	async componentDidMount() {
		
		
	}
	
	render() {
		return <View style={{ flex: 1 }}>
			<UINavBar title={this.props.title} />
			<View style={[{padding:scaleSize(15),flex:1},this.props.contentStyle]}>
				<ScrollView
				showsVerticalScrollIndicator={false}
				>
					<HTMLView
				        value={this.props.html}
				        stylesheet={{
				        	p:{
				        		fontSize:16,
				        		color:"#000",
				        		lineHeight:scaleSize(30)
				        	}
				        }}
				        renderNode={(node, index, siblings, parent, defaultRenderer)=>{
				        		var attribs  = node.attribs;
				        		if (node.name == 'img') {
								    return <AutoSizeImage 
								    source={{uri:attribs.src}}
								      />
								}
				        }} 
				      />
				</ScrollView>
			</View>
		</View>
	}

}







var styles={
	
}
