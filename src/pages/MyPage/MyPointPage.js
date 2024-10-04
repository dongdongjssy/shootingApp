import React, { Component } from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    DeviceEventEmitter
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

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginuser: props.loginuser,
            activeIndex: 0,
            itemList: [],
            userName: "",
            enName: "",
            memberId: "",
            year: "",
            totalCount: "",
            totalScore: "",
            avgScore: "",//平均积分
            currentYear: 2021,
            showYear: 2019,
            refresh: "",
            yearGroupList: [{ title: 2022, code: 2022 },{ title: 2021, code: 2021 }, { title: 2020, code: 2020 }, { title: 2019, code: 2019 }, { title: 2018, code: 2018 }],
        };
        this.UserStore = this.props.UserStore;

    }

    componentWillUnmount() {
        // 移除通知
    }

    async onFetch(page, startFetch, abortFetch, ) {
        var pageSize = 20

        await this.getDataFromRestApi();

        try {
            startFetch(this.state.itemList, pageSize);
        } catch (err) {
            abortFetch();
        }
    };

    async getDataFromRestApi() {
        let restApiUrl = ApiUrl.MINE_RESULT_LIST;
        let result = await this.callRestApi(restApiUrl);
        this.setState({
            itemList: result.rows,
            userName: result.clientUserName,
            enName: result.englishName,
            memberId: result.memberId,
            year: result.year,
            totalCount: result.totalCount,
            totalScore: result.totalScore,
            avgScore: result.avgScore,
        });
    }

    async callRestApi(restUrl) {
        var result = [];

        await request.post(restUrl, {
            "clientUserId": this.state.loginuser.id,
            "year": this.state.currentYear,
            "typeId": this.state.activeIndex == 0 ? 2 : 1
        }).then(res => {
            if (res.status === 200) {
                result = res.data;
            }
        }).catch(err => ModalIndicator.hide());

        return result;
    }

    refreshPage() {
        this.setState(
            () => this.listView.refresh()
        )
    }

    renderItem(item) {
        if (item.rank <= 3) {
            rankStyle = {
                color: PRIMARY_COLOR
            }
        }
        return <View style={{ marginLeft: scaleSize(15), marginRight: scaleSize(15), backgroundColor: "#fff" }}>
            <TouchableOpacity
                onPress={() => {
                    RouteHelper.navigate("RankDetailPage", { resultId: item.id });
                }}
                style={styles.rankItem}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subTitle}>{item.areaName}</Text>
                <Text style={styles.date}>{item.date}</Text>
                <View>
                    <View style={{ flexDirection: 'row', height: 1, backgroundColor: "rgba(242, 246, 249, 1)", marginTop: scaleSize(5) }}></View>
                    <View style={{ flexDirection: 'row', height: 30, marginTop: scaleSize(5) }}>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start" }}>
                            <Text style={{ fontSize: 16 }}>排名：</Text>
                            <Text style={{ fontSize: 16, color: "rgba(50, 50, 50, 1)" }}>{item.cpsaRank}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start" }}>
                            <Text style={{ fontSize: 16 }}>分数：</Text>
                            <Text style={{ fontSize: 16, color: "rgba(50, 50, 50, 1)" }}>{item.score}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', height: 30, marginTop: 0 }}>
                        <View style={{ flex: 1, flexDirection: "row",justifyContent: "flex-start" }}>
                            <Text style={{ fontSize: 16 }}>积分：</Text>
                            <Text style={{ fontSize: 16, color: "rgba(50, 50, 50, 1)" }}>{item.point}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start" }}>
                            <Text style={{ fontSize: 16 }}>组别：</Text>
                            <Text style={{ fontSize: 16, color: "rgba(50, 50, 50, 1)" }}>{item.groupName}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    }
    
    myPonitContent(){
        return (
            <>
                <View style={{ height: scaleSize(65), backgroundColor: "rgba(224, 187, 98, 1)", alignItems: 'center', flexDirection: "row", marginLeft: scaleSize(15), marginRight: scaleSize(15), marginTop: scaleSize(10) }}>
                    <Text style={{ color: "rgba(255,255,255,1)", fontSize: 16, position: "absolute", top: scaleSize(10), left: scaleSize(15) }}>{this.state.userName}</Text>
                    <Text style={{ color: "rgba(255,255,255,1)", fontSize: 16, position: "absolute", top: scaleSize(30), left: scaleSize(15) }}>{this.state.enName}</Text>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "rgba(50, 50, 50, 1)", position: "absolute", right: scaleSize(15) }}>{this.state.memberId}</Text>
                </View>
                <View style={{ marginLeft: scaleSize(15), marginRight: scaleSize(15), marginBottom: scaleSize(0) }}>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center',height: scaleSize(50) }}>
                        <Text style={{ color: "rgba(212, 61, 62, 1)", fontSize: 16, fontWeight: "500"}}>{this.state.year}年</Text>
                        <TouchableOpacity
                            onPress={() => {
                                UISelect.show(this.state.yearGroupList, {
                                    onPress: (item) => {
                                        this.state.currentYear = item.code;
                                        this.refreshPage();
                                        UISelect.hide();
                                    }
                                })
                            }}
                            style={styles.filter_item}>
                            <Text style={styles.filter_label}>	{this.state.currentYear ? this.state.currentYear : "2020"}</Text>
                            <Image
                                source={images.common.arrow_down}
                                style={{ width: scaleSize(8), height: scaleSize(5) }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row', height: 40 }}>
                        <View style={{ flex: 1, flexDirection: "row", margin: 0, justifyContent: "flex-start" }}>
                            <Text style={{ fontSize: 16, margin: 2 }}>总积分：</Text>
                            <Text style={{ fontSize: 16, color: "rgba(212, 61, 62, 1)" }}>{this.state.totalScore}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: "row", margin: 0, justifyContent: "flex-end" }}>
                            <Text style={{ fontSize: 16, margin: 2 }}>总场次：</Text>
                            <Text style={{ fontSize: 16, color: "rgba(212, 61, 62, 1)" }}>{this.state.totalCount}</Text>
                        </View>
                    </View>
                </View>
                <UltimateListView
                    style={{ flex: 1 }}
                    header={() => {
                        return null;
                    }}
                    allLoadedText={"没有更多了"}
                    waitingSpinnerText={'加载中...'}
                    ref={ref => this.listView = ref}
                    onFetch={this.onFetch.bind(this)}
                    keyExtractor={(item, index) => `${index} -`}
                    item={this.renderItem.bind(this)} // this takes three params (item, index, separator)
                    displayDate
                    emptyView={() => {
                        return <EmptyView />
                    }}
                />
            </>
        )
    }

    render() {
        return <View style={{ flex: 1, backgroundColor: '#F2F6F9' }}>
            <UINavBar title="我的成绩" />
            <View style={{ flex: 1 }}>
                <UITabBar
                    onChange={(index) => {
                        this.setState({
                            activeIndex: index,
                        },()=>{
                            this.refreshPage();
                        })
                    }}
                    activeIndex={this.state.activeIndex}
                >
                    <UITabBar.Item label="气枪">
                        {this.myPonitContent()}
                    </UITabBar.Item>
                    <UITabBar.Item label="实弹">
                        {this.myPonitContent()}
                    </UITabBar.Item>
                </UITabBar>
            </View>
        </View>
    }
}

var styles = {
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemText: {
        color: "#303030",
        fontSize: 15,
    },
    rankItem: {
        height: scaleSize(160),
        padding: scaleSize(10),
        backgroundColor: '#fff',
        borderBottomWidth: 10,
        borderColor: "rgba(242, 246, 249, 1)",
        backgroundColor: "#fff",
        width: "100%",
    },
    title: {
        fontSize: 17,
        color: 'rgba(212, 61, 62, 1)',
        numberOfLines: 2,
        lineHeight: 20,
        marginBottom: scaleSize(10)
    },
    subTitle: {
        fontSize: 16,
        color: 'rgba(0,0,0,0.80)',
    },
    score: {
        fontSize: 20,
        color: PRIMARY_COLOR,
        fontWeight: 'bold',
    },
    date: {
        position: "absolute",
        right: scaleSize(10),
        fontSize: 16,
        fontWeight: "400",
        color: "rgba(0,0,0,0.60)",
    },
    filter_item: {
        position: "absolute",
        right: scaleSize(10),
        padding: scaleSize(8),
        backgroundColor: "#fff",
        borderRadius: scaleSize(2),
        width: scaleSize(110),
        height: scaleSize(35),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
    },
}





