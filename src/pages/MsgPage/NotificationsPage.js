import React, { Component } from 'react'
import { View, Text, DeviceEventEmitter, TouchableOpacity } from 'react-native'
import UINavBar from '../../components/UINavBar'
import { AppStore } from '../../store/AppStore';
import { UltimateListView } from 'react-native-ultimate-listview';
import EmptyView from '../../components/EmptyView'
import { scaleSize } from '../../global/utils';
import { UserStore } from '../../store/UserStore';
import { RouteHelper } from 'react-navigation-easy-helper'
import request from '../../api/Request';
import ApiUrl from '../../api/Url.js';
import HTMLView from 'react-native-htmlview';

export default class NotificationsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginuser: this.props.loginuser,
            itemList: [],
            menus: [
                {
                    routePath: "CommonActivityListPage",
                    params: {
                        pageText: "培训",
                        fkTableId: 1,
                        restApiUrl: ApiUrl.TRAINING_LIST,
                        imagePath: ApiUrl.TRAINING_IMAGE,
                        carouselOnPage: 2,
                    },
                    title: "培训",
                },
                {
                    routePath: "CommonActivityListPage",
                    params: {
                        pageText: "赛事",
                        fkTableId: 2,
                        restApiUrl: ApiUrl.CONTEST_LIST,
                        imagePath: ApiUrl.CONTEST_IMAGE,
                        carouselOnPage: 3
                    },
                    title: "赛事",
                },
                {
                    routePath: "RankPage",
                    params: {},
                    title: "成绩",
                }
            ],
        };
    }

    async componentDidMount() {
        await AppStore.setUnReadMsg(false)
        DeviceEventEmitter.addListener("notifyArrived", async () => {
            console.debug("来了新消息，刷新列表")
            var msgList = await AppStore.getMsgList()
            this.listView && this.listView.updateDataSource(msgList)
        })
        // this.getMessgeList();
    }

    async getMessgeList() {
        var result = [];
        await request.post(ApiUrl.SYSTEM_MESSAGE_LIST, {
            pd: {
                pageNum: 1,
                pageSize: 10
            },
            clientUserId: 2610,
        }).then(res => {
            if (res.status === 200) {
                result = res.data.rows;
            }
        }).catch(err => {
            // ModalIndicator.hide()
            console.log(err)
        });

        return result;
    }

    async onFetch(page = 1, startFetch, abortFetch) {
        var pageSize = 20

        let messageList = [];
        messageList = await AppStore.getMsgList()
        var sortedList = messageList.sort((a, b) => new Date(b.extras.timestamp) - new Date(a.extras.timestamp))
        console.debug(messageList)
        // messageList = await this.getMessgeList();

        try {
            startFetch(sortedList, pageSize);
        } catch (err) {
            abortFetch();
        }
    };

    renderTime(timestamp) {
        var time = new Date()

        if (timestamp) {
            time = new Date(Number(timestamp))
        }

        return time.getFullYear() + "/" +
            ((time.getMonth() + 1) > 9 ? (time.getMonth() + 1) : ("0" + (time.getMonth() + 1))) + "/" +
            (time.getDate() > 9 ? time.getDate() : ("0" + time.getDate())) + " " +
            (time.getHours() > 9 ? time.getHours() : ("0" + time.getHours())) + ":" +
            (time.getMinutes() > 9 ? time.getMinutes() : ("0" + time.getMinutes()))
    }

    renderItem(item, index) {
        return (
            <View style={{ marginHorizontal: scaleSize(15), marginVertical: scaleSize(20) }}>
                {/** 消息时间戳 */}
                <Text style={{ textAlign: "center", color: "#646464", marginBottom: scaleSize(5) }}>
                    {this.renderTime(item.extras?.timestamp)}
                </Text>

                {/** 消息内容 */}
                <View style={{ backgroundColor: "#fff", padding: scaleSize(12), borderRadius: 4 }}>
                    <View style={{ width: '100%', height: scaleSize(25) }}>
                        <Text style={{ color: "#323232", fontSize: 18, fontWeight: "700" }}>{item.title}</Text>
                    </View>
                    <View style={{ width: '100%', height: scaleSize(26) }}>
                        <HTMLView
                            value={(item.content && item.content !== "undefined") ? "<div>" + item.content + "</div>" : ""}
                            stylesheet={{
                                div: {
                                    color: "#646464",
                                    fontSize: 14,
                                    fontWeight: "500"
                                }
                            }} />
                    </View>
                    {
                        //系统消息只显示内容，不显示查看按钮
                        //                        (item.extras.type !== "3") ?
                        <TouchableOpacity onPress={async () => {
                            const user = await UserStore.getLoginUser()
                            if (item.extras.type == "1") {
                                if (item.extras.subType == "1") {
                                    RouteHelper.navigate(this.state.menus[0].routePath, this.state.menus[0].params);
                                } else if (item.extras.subType == "2") {
                                    //alert("培训详情")
                                    this.getDetailData(true, item.extras.orderId);
                                }
                            } else if (item.extras.type == "2") {
                                if (item.extras.subType == "1") {
                                    RouteHelper.navigate(this.state.menus[1].routePath, this.state.menus[1].params);
                                } else if (item.extras.subType == "2") {
                                    //alert("赛事详情")
                                    this.getDetailData(false, item.extras.orderId);
                                }
                            } else if (item.extras.type == "3") {
                                RouteHelper.navigate("SysytemNotificationDetailPage", { itemData: item, loginuser: user });
                            } else if (item.extras.type == "5" || item.extras.type == "6" || item.extras.type === "4") {
                                RouteHelper.navigate("UserCenterPage", { loginuser: user, user: user })
                            } else if(item.extras.type == "7"){
                                RouteHelper.navigate("MyActivityPage", {
                                    type: "training",
                                    loginuser: user
                                });
                            } else if(item.extras.type == "8"){
                                RouteHelper.navigate("MyActivityPage", {
                                    type: "contest",
                                    loginuser: user
                                });
                            } else if(item.extras.type == "9"){
                                RouteHelper.navigate("OrderPage",{status:0})
                            }
                        }}>
                            <Text style={{ color: "#D43D3E", fontSize: 14, textAlign: "center", textAlignVertical: "center", marginTop: 15 }}>立即查看</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
        )
    }

    async getDetailData(isTrain, orderId) {
        let apiUrl;
        if (isTrain) {
            apiUrl = ApiUrl.SYSTEM_MESSAGE_TRAIN_DETAIL;
        } else {
            apiUrl = ApiUrl.SYSTEM_MESSAGE__MATCH_DETAIL;
        }
        var result = {};
        await request.post(apiUrl + '/' + orderId, {}).then(res => {
            if (res.status === 200) {
                result = res.data;
                //alert(result.course.name);
            }
        }).catch(err => {
            // ModalIndicator.hide()
            console.log(err)
        });
        var user = await UserStore.getLoginUser();
        RouteHelper.navigate("ActivityDetailPage", { detailData: result, loginuser: user });

        return result;
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
                <UINavBar title="系统消息" />

                <UltimateListView
                    style={{ flex: 1 }}
                    header={() => { return null; }}
                    allLoadedText={"没有更多了"}
                    waitingSpinnerText={'加载中...'}
                    ref={ref => this.listView = ref}
                    onFetch={this.onFetch.bind(this)}
                    keyExtractor={(item, index) => `${index} -`}
                    item={this.renderItem.bind(this)} // this takes three params (item, index, separator)
                    displayDate
                    emptyView={() => { return <EmptyView /> }}
                />
            </View>
        )
    }
}