import React, { Component } from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    BackHandler
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import UINavBar from '../../components/UINavBar';
import { UltimateListView, UltimateRefreshView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView';
import ShadowCard from '../../components/ShadowCard';
import UITabBar from '../../components/UITabBar';
import UISelect from '../../components/UISelect';
import request from '../../api/Request';
import ApiUrl from '../../api/Url.js';
import { scanFile } from 'react-native-fs';
import { scaleSize } from '../../global/utils';
import Url from '../../api/Url';
import { ClientStatusEnum } from '../../global/constants';
import IntegralInfor from './integralMyInforPage';

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginuser: props.loginuser,
            userIntegralList: props.userIntegralList,
            userIntegralDetail: []
        };
        this.UserStore = this.props.UserStore;

    }


    async getUserIntegralDetail(page,pageSize){
        let result = await request.post(Url.USERINTEGRAL_DETAIL,{ //分页随意传多少
            pd: {
                pageSize: pageSize,
                pageNum: page
            },
			member: this.state.loginuser?.memberId
        })

        console.log(JSON.stringify(result.data))

        return result?.data;
    }

    renderExpireDt(date) {
		if (date == null || date == undefined || date == "" || date.length == 0) {
			return "未设置";
		} else {
			return date.split(" ")[0];
		}
	}

    renderTableHead() {
		var result = [];
		result.push(<View style={{ backgroundColor: "#E9C990", width: scaleSize(350),height: scaleSize(47), flexDirection: "row", borderTopLeftRadius: scaleSize(4),borderTopRightRadius: scaleSize(4),marginHorizontal: scaleSize(12.5) }}>
			<View style={[styles.titleView, { width: scaleSize(150) }]}>
				<Text style={styles.titleText}>赛事</Text>
			</View>
			<View style={[styles.titleView, { width: scaleSize(100) }]}>
				<Text style={styles.titleText}>名次</Text>
			</View>
			<View style={[styles.titleView, { width: scaleSize(100) }]}>
				<Text style={styles.titleText}>积分</Text>
			</View>
		</View>)
		return result;
	}

    renderItem(item, index) {
        return <View style={{ backgroundColor: index%2 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)', width: scaleSize(350),minHeight: scaleSize(47), flexDirection: "row", paddingTop: scaleSize(5),paddingBottom: scaleSize(5),marginHorizontal: scaleSize(12.5) }}>
            <View style={[styles.contentView,{ width: scaleSize(150) }]}>
                <Text style={styles.contentText}>{item.contest}</Text>
            </View>
            <View style={[styles.contentView,{ width: scaleSize(100) }]}>
                <Text style={styles.contentText}>{item.ranking}</Text>
            </View>
            <View style={[styles.contentView,{ width: scaleSize(100) }]}>
                <Text style={styles.contentText}>{item.score}</Text>
            </View>
        </View>
	}

    componentWillMount() {
        // //监听返回键
        BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
    }

    componentWillUnmount() {
        //取消对返回键的监听
        BackHandler.removeEventListener('hardwareBackPress', this.onBackClicked);
    }

    //BACK物理按键监听
    onBackClicked = () => {
        RouteHelper.navigate("MainPage")
        return true;
    }

    async onFetch(page = 1, startFetch, abortFetch) {
        var pageSize = 10;
        const rows = await this.getUserIntegralDetail(page,pageSize);

        try {
            if(Math.ceil(rows?.total / pageSize) >= page){
				startFetch(rows?.rows || [], pageSize);
			}else{
				startFetch([], pageSize);
			}
            
        } catch (err) {
            abortFetch();
        }
    };


    render() {
        return <View style={{ flex: 1, backgroundColor: '#271B3F' }}>
            <UINavBar leftView={
                <TouchableOpacity
                    onPress={() => {
                        RouteHelper.navigate("MainPage")
                    }}
                    style={{ flex: 1, marginLeft: scaleSize(6), alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.back}
                        resizeMode="contain"
                        style={{
                            width: scaleSize(20),
                            height: scaleSize(20),
                            tintColor: '#FFFFFF',
                            ...this.props.backIconStyle
                        }} />
                </TouchableOpacity>
            } title="2021 CPSA Action Air 电子积分卡" titleStyle={{fontSize: scaleSize(14)}} style={{backgroundColor: '#1D142F'}}/>
            <View style={{paddingBottom: scaleSize(50)}}>
                {/* {this.renderTableHead()}
                {this.state.userIntegralDetail?.map((item, index) => {
                    return this.renderItem(item, index)
                })} */}

                <UltimateListView
                    header={() => {
                        return <>
                            <ImageBackground source={images.mine.integralBack} style={{width: scaleSize(375),height: scaleSize(280),alignItems: 'center'}}>
                                <IntegralInfor loginuser={this.state.loginuser}/>
                            </ImageBackground>
                            <View style={{display: 'flex',alignItems: 'center',marginTop: scaleSize(-40)}}>
                                <ImageBackground source={images.mine.jifenDetails} style={{
                                    width: scaleSize(350),
                                    height: scaleSize(130),
                                    marginTop: scaleSize(50),
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                    alignItems: 'center'
                                }}>
                                    <View style={{display: 'flex',alignItems: 'center'}}>
                                        <Text style={styles.jifenText1}>{this.state.userIntegralList?.totalScore == null ? 0 : this.state.userIntegralList?.totalScore}</Text>
                                        <Text style={styles.jifenText2}>总积分</Text>
                                        <Image
                                            source={images.mine.zongjifen}
                                            style={{width: scaleSize(19),height: scaleSize(17)}} />
                                    </View>
                                    <View style={{width: scaleSize(2),height: scaleSize(50),borderLeftWidth: scaleSize(1),borderLeftColor: 'rgba(255,255,255,0.2)',}}></View>
                                    <View style={{display: 'flex',alignItems: 'center'}}>
                                        <Text style={styles.jifenText1}>{this.state.userIntegralList?.gunGroup}</Text>
                                        <Text style={styles.jifenText2}>枪组</Text>
                                        <Image
                                            source={images.mine.qiangzu}
                                            style={{width: scaleSize(24),height: scaleSize(17)}} />
                                    </View>
                                    <View style={{width: scaleSize(2),height: scaleSize(50),borderRightWidth: scaleSize(1),borderRightColor: 'rgba(255,255,255,0.2)'}}></View>
                                    <View style={{display: 'flex',alignItems: 'center'}}>
                                        <Text style={styles.jifenText1}>{this.state.userIntegralList?.ageGroup}</Text>
                                        <Text style={styles.jifenText2}>年龄组</Text>
                                        <Image
                                            source={images.mine.laonianzu}
                                            style={{width: scaleSize(18),height: scaleSize(17)}} />
                                    </View>
                                </ImageBackground>

                                <Text style={{color: '#FFFFFF',fontSize: scaleSize(14),marginTop: scaleSize(20),marginBottom: scaleSize(20)}}> 赛事积分明细 </Text>

                                <View style={{width: scaleSize(350),display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',marginBottom: scaleSize(20)}}>
                                    <View style={{display: 'flex',flexDirection: 'row'}}>
                                        <Image
                                            source={images.mine.rule}
                                            style={{width: scaleSize(14),height: scaleSize(14),marginRight: scaleSize(5)}} />
                                        <TouchableOpacity onPress={()=>{
                                            RouteHelper.navigate("IntegralRulePage")
                                        }}>
                                            <Text style={{color: '#E9C990',fontSize: scaleSize(12),}}>积分累计规则说明</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={()=>{
                                        RouteHelper.navigate("MyPointPage", { loginuser: this.state.loginuser });
                                    }} style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{color: '#E9C990',fontSize: scaleSize(12)}}> 赛事明细成绩 </Text>
                                        <Image
                                            source={images.mine.contestRight}
                                            style={{width: scaleSize(12),height: scaleSize(10),marginLeft: scaleSize(2)}} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {this.renderTableHead()}
                        </>
                    }}
                    numColumns={1}
                    allLoadedText={""}
                    waitingSpinnerText={'加载中...'}
                    ref={ref => this.listView = ref}
                    onFetch={this.onFetch.bind(this)}
                    keyExtractor={(item, index) => `${item.id + "" + index}`}
                    item={this.renderItem.bind(this)} // this takes three params (item, index, separator)       
                    displayDate
                    emptyView={() => {
                        return <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: scaleSize(350),minHeight: scaleSize(47), flexDirection: "row", paddingTop: scaleSize(5),paddingBottom: scaleSize(5),marginHorizontal: scaleSize(12.5) }}>
                            <View style={[styles.contentView,{ width: scaleSize(150) }]}>
                                <Text style={styles.contentText}>-</Text>
                            </View>
                            <View style={[styles.contentView,{ width: scaleSize(100) }]}>
                                <Text style={styles.contentText}>-</Text>
                            </View>
                            <View style={[styles.contentView,{ width: scaleSize(100) }]}>
                                <Text style={styles.contentText}>-</Text>
                            </View>
                        </View>
                    }}
                />
            </View>
        </View>
    }
}



var styles = {
    jifenText1: {
        color: '#E9C990',
        fontSize: scaleSize(18),
        marginBottom: scaleSize(20)
    },
    jifenText2: {
        color: '#FFFFFF',
        fontSize: scaleSize(12),
        marginBottom: scaleSize(15)
    },
    titleText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#E60012",
        fontFamily: "PingFang SC",
    },
    titleView: {
        alignItems: 'center', 
        height: scaleSize(47), 
        justifyContent: 'center'
    },
    contentView: {
        alignItems: 'center', 
        justifyContent: 'center'
    },
    contentText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFFFFF",
        fontFamily: "PingFang SC",
        paddingLeft: scaleSize(10),
        paddingRight: scaleSize(10),
        lineHeight: scaleSize(15)
    }
}





