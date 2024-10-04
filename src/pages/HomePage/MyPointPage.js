import React, { Component } from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    ImageBackground
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
            year: "",
            totalCount: "",
            totalScore: "",
            avgScore: "",//平均积分
            currentYear: 2021,
            showYear: 2019,
            refresh: "",
            yearGroupList: [{ title: 2021, code: 2021 }, { title: 2020, code: 2020 }, { title: 2019, code: 2019 }, { title: 2018, code: 2018 }],
            typeGroupList: [{ title: '气枪',code: 2},{ title: '实弹',code: 1}],
            currentType: '气枪',
            typeNum: 2,
        };
        this.UserStore = this.props.UserStore;

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
            "typeId": this.state.typeNum
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
                <ImageBackground source={images.home.back} style={{height: scaleSize(50),margin: scaleSize(-10),marginBottom: scaleSize(10) }}>
                    <Text style={styles.title}>{item.title}</Text>
                </ImageBackground>
                <View style={{flexDirection: 'row',justifyContent: 'space-between'}}>
                    <Text style={styles.subTitle}>{item.areaName}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                <View>
                    <View style={{ flexDirection: 'row', height: 1, backgroundColor: "rgba(242, 246, 249, 1)", marginTop: scaleSize(10) }}></View>
                    <View style={{ flexDirection: 'row', height: 30, marginTop: scaleSize(5) }}>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start" }}>
                            <Text style={{ fontSize: 16, color: "#646464" }}>排名：</Text>
                            <Text style={{ fontSize: 16, color: "#323232" }}>{item.cpsaRank}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start" }}>
                            <Text style={{ fontSize: 16,color: "#646464" }}>分数：</Text>
                            <Text style={{ fontSize: 16, color: "#323232" }}>{item.score}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', height: 30, marginTop: 0 }}>
                        <View style={{ flex: 1, flexDirection: "row",justifyContent: "flex-start" }}>
                            <Text style={{ fontSize: 16, color: "#646464" }}>积分：</Text>
                            <Text style={{ fontSize: 16, color: "#323232" }}>{item.point}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start" }}>
                            <Text style={{ fontSize: 16, color: "#646464" }}>组别：</Text>
                            <Text style={{ fontSize: 16, color: "#323232" }}>{item.groupName}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    }

    render() {
        return <View style={{ flex: 1, backgroundColor: '#F2F6F9' }}>
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ marginLeft: scaleSize(15), marginRight: scaleSize(15), marginBottom: scaleSize(0) }}>
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center',height: scaleSize(50) }}>
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
                            <TouchableOpacity
                                onPress={() => {
                                    UISelect.show(this.state.typeGroupList, {
                                        onPress: (item) => {
                                            this.state.currentType = item.title;
                                            this.setState({
                                                typeNum: item.code,
                                            },()=>{
                                                this.refreshPage();
                                            })
                                            UISelect.hide();
                                        }
                                    })
                                }}
                                style={styles.filter_item}>
                                <Text style={styles.filter_label}>	{this.state.currentType ? this.state.currentType : "气枪"}</Text>
                                <Image
                                    source={images.common.arrow_down}
                                    style={{ width: scaleSize(8), height: scaleSize(5) }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', height: scaleSize(40),justifyContent: 'space-between',alignItems: 'center' }}>
                            <View style={{ flex: 1, flexDirection: "row",marginLeft: scaleSize(50) }}>
                                <Text>总积分：</Text>
                                <Text style={{ color: "rgba(212, 61, 62, 1)" }}>{this.state.totalScore}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: "row",marginLeft: scaleSize(50) }}>
                                <Text>总场次：</Text>
                                <Text style={{ color: "rgba(212, 61, 62, 1)" }}>{this.state.totalCount}</Text>
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
                </View>
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
        color: '#323232',
        numberOfLines: 2,
        lineHeight: 20,
        margin: scaleSize(10),
        fontWeight: 'bold'
    },
    subTitle: {
        fontSize: 16,
        color: '#323232',
    },
    score: {
        fontSize: 20,
        color: PRIMARY_COLOR,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 16,
        fontWeight: "400",
        color: "#323232",
    },
    filter_item: {
        padding: scaleSize(8),
        backgroundColor: "#fff",
        borderRadius: scaleSize(2),
        width: scaleSize(150),
        height: scaleSize(35),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        marginRight: scaleSize(10),
        marginLeft: scaleSize(10)
    },
    filter_label: {
        color: 'DF2223'
    }
}





