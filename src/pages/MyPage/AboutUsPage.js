import React, { Component } from 'react'
import { View,Text,ScrollView,Image,Dimensions,TouchableOpacity } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'

import UINavBar from '../../components/UINavBar'
import UITabBar from '../../components/UITabBar'
import WebViewHtmlView from '../../components/WebViewHtmlView';
import HTMLView from 'react-native-htmlview';
import AutoSizeImage from '../../components/AutoSizeImage';
import { images } from '../../res/images';
import Request from '../../api/Request'
import ApiUrl from '../../api/Url';
import html from '../../html'


export default class AboutUsPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeIndex: 0,
            listData:[
                {
                    "searchValue": null,
                    "createBy": "admin",
                    "createTime": "2020-12-09 16:10:28",
                    "updateBy": "admin",
                    "updateTime": "2020-12-09 16:15:46",
                    "remark": null,
                    "params": {},
                    "pd": null,
                    "clubId": null,
                    "id": 1,
                    "zhType": 1,
                    "content": "<p>222222222231<img src=\"https://generator.oss-cn-beijing.aliyuncs.com/recommend/47006b93c971d834198833d2657984d4ea6.png\" style=\"width: 451px;\"></p><p><img src=\"https://generator.oss-cn-beijing.aliyuncs.com/recommend/573e6ff2d809c7c44c08c8975263f39cdb9.jpg\" style=\"width: 451px;\"><br></p>",
                    "status": 0
                },
                {
                    "searchValue": null,
                    "createBy": "admin",
                    "createTime": "2020-12-09 16:13:15",
                    "updateBy": "admin",
                    "updateTime": "2020-12-09 16:16:04",
                    "remark": null,
                    "params": {},
                    "pd": null,
                    "clubId": null,
                    "id": 2,
                    "zhType": 2,
                    "content": "<p>测试<img src=\"https://generator.oss-cn-beijing.aliyuncs.com/recommend/289c79af35fc8744295b472c9e91fac1ebe.jpg\" style=\"width: 451px;\"></p><p>3311r3r<img src=\"https://generator.oss-cn-beijing.aliyuncs.com/recommend/5888a3e413e33874270a7715c9f9e76138e.png\" style=\"width: 451px;\"></p>",
                    "status": 0
                },
                {
                    "searchValue": null,
                    "createBy": "admin",
                    "createTime": "2020-12-09 16:13:30",
                    "updateBy": "",
                    "updateTime": null,
                    "remark": null,
                    "params": {},
                    "pd": null,
                    "clubId": null,
                    "id": 3,
                    "zhType": 3,
                    "content": "<p>eee</p><p><img src=\"https://generator.oss-cn-beijing.aliyuncs.com/recommend/7822ba4b257ee5443a29df822fff1f5bd47.jpg\" style=\"width: 451px;\"><br></p>",
                    "status": 0
                }
            ]	
        };
    }

    componentDidMount() {
        let data ={
            pd:{
                pageSize:3,
                pageNum:1,
            }
        }
        Request.post(ApiUrl.FIND_ZH,data).then(res => {
			if (res.status === 200) {
                this.setState({
                    listData:res.data.rows
                })
			}
		}).catch(err => console.log(err));
    }

    renderNewRichTextMediumSize(content) {
		const { width } = Dimensions.get('window');
		return <View style={{flexDirection:"column"}}>
			<WebViewHtmlView content={(content && content != "undefined" && content != "" && content.length != 0) ? content : ""} />
			<View style={{alignItems:'center',marginTop:scaleSize(18)}}>
				<TouchableOpacity
					onPress={() => {
						RouteHelper.navigate("ReportPage")
					}}
					style={{ flexDirection: "row", alignItems: 'center' }}>
					<Image source={images.common.report_icon}
						style={{ marginRight: scaleSize(7), width: scaleSize(13), height: scaleSize(13) }} />
					<Text style={{ fontSize: 10, color: 'rgba(112, 112, 112, 1)' }}>内容存在争议，我要举报该内容</Text>
					<Image 
					style={{width:scaleSize(3),height:scaleSize(6),tintColor:"#323232",marginLeft:scaleSize(5)}}
					source={images.common.arrow_right3} />
				</TouchableOpacity>
			</View>
		</View>	
    }

    renderRichTextMediumSize(content) {
		const { width } = Dimensions.get('window');
		return <View style={{flexDirection:"column"}}>
			<WebViewHtmlView content={(content && content != "undefined" && content != "" && content.length != 0) ? content : ""} />
			<View style={{alignItems:'center',marginTop:scaleSize(18)}}>
				<TouchableOpacity
					onPress={() => {
						RouteHelper.navigate("ReportPage")
					}}
					style={{ flexDirection: "row", alignItems: 'center' }}>
					<Image source={images.common.report_icon}
						style={{ marginRight: scaleSize(7), width: scaleSize(13), height: scaleSize(13) }} />
					<Text style={{ fontSize: 10, color: 'rgba(112, 112, 112, 1)' }}>内容存在争议，我要举报该内容</Text>
					<Image 
					style={{width:scaleSize(3),height:scaleSize(6),tintColor:"#323232",marginLeft:scaleSize(5)}}
					source={images.common.arrow_right3} />
				</TouchableOpacity>
			</View>
		</View>	
		return (
			<HTMLView
				value={content}
				stylesheet={styles.contentMedium}
				renderNode={(node, index, siblings, parent, defaultRenderer) => {
					// if (node.name == 'img') {
					// 	const { src, height } = node.attribs;
					// 	const imageHeight = height || 300;
					// 	return (
					// 		<Image
					// 			key={index}
					// 			style={{ width: width * PixelRatio.get(), height: imageHeight * PixelRatio.get() }}
					// 			source={{ uri: src }} />
					// 	);
					// }
					var attribs = node.attribs;
					if (node.name == 'img') {
						//						console.debug("qqqqq" + attribs.src);
						return <AutoSizeImage
							source={{ uri: "http://47.105.158.8:9007" + attribs.src }}
							style={{ padding: 0, margin: 0 }}
						/>
					}
				}}
			/>
		)
	}

    
 

    render() {
        var imgPath = require('../../res/images/mine/contact_association.png');
  		return <View style={{ flex: 1 ,backgroundColor:"#FFF"}}>
        		<UINavBar title="关于我们" />
                <UITabBar
                    onChange={(index) => {
                        this.setState({
                            activeIndex: index,
                        })
                    }}
                    activeIndex={this.state.activeIndex}
                >
				<UITabBar.Item label="CPSA工作人员">
					<View style={{ flex: 1 }}>
                        <ScrollView style={{flex:1}}>
                            <View style={{ flex:1,marginTop: scaleSize(10) }}>
                                {this.renderRichTextMediumSize(this.state.listData[0].content)}
                                <View style={{ height: scaleSize(20) }}></View>
                            </View>
                        </ScrollView>
					</View>
				</UITabBar.Item>
				<UITabBar.Item label="CPSA章程">
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{flex:1}}>
                            <View style={{ flex:1,marginTop: scaleSize(10) }}>
                                {this.renderRichTextMediumSize(this.state.listData[1].content)}
                                <View style={{ height: scaleSize(20) }}></View>
                            </View>
                        </ScrollView>
					</View>
				</UITabBar.Item>
                <UITabBar.Item label="用户隐私政策">
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{flex:1}}>
                        <View style={{ flex:1,marginTop: scaleSize(10) }}>
                                {this.renderRichTextMediumSize(html)}
                                <View style={{ height: scaleSize(20) }}></View>
                            </View>
                        </ScrollView>
					</View>
				</UITabBar.Item>
			</UITabBar>
              </View>
   	}

}