import React, { Component } from 'react'
import { ScrollView, View, Text, Image, Dimensions } from 'react-native'
import UINavBar from '../../components/UINavBar'
import WebViewHtmlView from '../../components/WebViewHtmlView';
import { scaleSize } from '../../global/utils';
import HTMLView from 'react-native-htmlview';
import AutoSizeImage from '../../components/AutoSizeImage';
import request from '../../api/Request';
import ApiUrl from '../../api/Url.js';

export default class SysytemNotificationDetailPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			item: this.props.itemData,
			loginuser: this.props.loginuser,
			navTitle: "",
			htmlContent: this.props.itemData.htmlContent || "",
			from: this.props.from
		};
		if (this.props.loginuser == null || this.props.loginuser == undefined || this.props.loginuser == "") {
			this.state.navTitle = this.props.itemData.navTitle ? this.props.itemData.navTitle : this.props.itemData.title;
		} else {
			this.state.navTitle = "系统通知";
		}
		console.debug(this.state.item);
		//alert(this.state.item);
	}

	async componentDidMount() {
		if (this.state.from != "carousel" && this.state.from != "zhaoshang")
			this.getDataFromRestApi();
	}

	async getDataFromRestApi() {
		let restApiUrl = ApiUrl.SYSTEM_MESSAGE_CONTENT_DETAIL + '/' + this.state.item.extras.orderId;
		let result = await this.callRestApi(restApiUrl);
		this.setState({
			htmlContent: result.content,
			navTitle: result.title,
		});
	}

	async callRestApi(restUrl) {
		var result = [];
		await request.post(restUrl, {}).then(res => {
			if (res.status === 200) {
				result = res.data;
			}
		}).catch(err => ModalIndicator.hide());

		return result;
	}

	render() {
		const { width } = Dimensions.get('window');
		return (
			<View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
				<UINavBar title={this.state.item.content} />
				<ScrollView style={{ padding: scaleSize(15), marginTop: 2, backgroundColor: "#fff" }}>
					<WebViewHtmlView content={(this.state.htmlContent && this.state.htmlContent != "undefined") ? this.state.htmlContent : ""} />
				</ScrollView>
			</View>);
	}

}

var styles = {
	footer_text: {
		fontSize: 12,
		color: "#999999",
		fontWeight: "400",
		marginTop: scaleSize(3),
	},
	contentSmall: {
		p: {
			fontSize: 12,
			color: "rgba(0,0,0,0.80)",
			lineHeight: scaleSize(14),
			flex: 1
		}
	},
	contentMedium: {
		p: {
			fontSize: 16,
			color: "#000",
			marginTop: scaleSize(10),
			lineHeight: scaleSize(20)
		}
	},
	tag: {
		// width: scaleSize(45),
		height: scaleSize(15),
		borderRadius: scaleSize(2),
		borderWidth: ONE_PX,
		borderColor: "#FF9226",
		alignItems: 'center',
		justifyContent: 'center',
		padding: scaleSize(5)
	},
	tag_text: {
		fontSize: scaleSize(9),
		fontWeight: '400',
	},
}