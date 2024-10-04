import React, { Component } from 'react'
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView, BackHandler,DeviceEventEmitter } from 'react-native'
import UINavBar from '../../components/UINavBar'
import Url from '../../api/Url'
import Request from '../../api/Request'
import { Toast, ModalIndicator } from 'teaset';
import { scaleSize } from '../../global/utils'
import { UserStore } from '../../store/UserStore';
import ApiUrl from '../../api/Url';
import { UltimateListView } from 'react-native-ultimate-listview';
import UIConfirm from '../../components/UIConfirm';
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images'
import DatePicker from 'react-native-datepicker'

export default class OrderPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            status: props?.status,
            goodsList: [],
            isDataPick:false,
            startDate:null,
            endDate:null,
            statusArray: [{ name: '全部', type: 0 }, { name: '待付款', type: 1 }, { name: '待发货', type: 2 }, { name: '待收货', type: 3 }, { name: '待评价', type: 4 },{name:"已完成",type:5}],
        };
    }

    componentDidMount(){
        DeviceEventEmitter.addListener("addEva",res=>{
            this.listView?.refresh()
        })
    }

    async onFetch(page = 1, startFetch, abortFetch) {
        let status = this.state.status;
        let user = await UserStore.getLoginUser();
        var pageSize = 5

        switch (status) {
            case 0:
                status = null;
                break;
            case 2:
                status = 3;
                break;
            case 3:
                status = 4;
                break;
            case 4:
                status = 5;
                break;
            case 5:
                status = 6;
                break;
            default:
                break;
        }

        try {
            let data = {
                pd: {
                    pageNum: page,
                    pageSize: pageSize
                },
                clientUserId: user?.id,
                goodsOrderStatus: status,
                startDate:this.state.startDate,
                endDate:this.state.endDate
            }
            await Request.post(ApiUrl.GOODS_ORDER_LIST, data).then(res => {
                if (res.status === 200) {
                    this.setState({ goodsList: res?.data?.rows })
                    if (Math.ceil(res.data.total / pageSize) >= page) {
                        startFetch(res?.data?.rows || [], pageSize);
                    } else {
                        startFetch([], pageSize);
                    }
                }
            }).catch(err => console.log(err));

        } catch (err) {
            abortFetch();
        }
    }

    findStatusName(status) {
        switch (status) {
            case 1:
                return "待付款"
            case 2:
                return "支付待确认"
            case 3:
                return "待发货"
            case 4:
                return "待收货"
            case 5:
                return "待评价"
            case 6:
                return "评价完成"
            case 7:
                return "订单关闭"
            default:
                break;
        }
    }

    cancelOrder(id,orderId){
        UIConfirm.show('如果您此次下单包含多个商品，将合并取消',()=>{
            let data = {
                id:orderId,
            }
            Request.post(ApiUrl.ORDER_CANCEL, data).then(res => {
                console.log(res.data.code);
                if(res?.data?.code == 0){
                    Toast.message("取消订单成功");
                    this.listView&&this.listView.refresh();
                }
            }).catch(err => console.log(err));
        })
    }

    logisticsMsg(id){
        Toast.message("暂无物流信息");
    }

    confirmReceiveGoods(id){
        UIConfirm.show('是否确定收货此订单?',()=>{
            let data = {
                id:id,
                goodsOrderStatus:5
            }
            Request.post(ApiUrl.GOODS_ORDER_EDIT, data).then(res => {
                console.log(res.data.code);
                if(res?.data?.code == 0){
                    Toast.message("收货成功");
                    this.listView&&this.listView.refresh();
                }
            }).catch(err => console.log(err));
        })
    }

    findButton(status,id,orderId){
        switch (status) {
            case 1:
                return <View style={{display:'flex',flexDirection:'row',justifyContent:'flex-end', alignItems:'flex-end',paddingTop:scaleSize(15)}}>
                        {/* <View style={{alignItems:'center'}}>
                            <Text style={{fontSize:scaleSize(12),color:'#db090a'}}>59分15秒</Text>
                            <Text>剩余付款时间</Text>
                        </View> */}
                        <TouchableOpacity onPress={()=>this.cancelOrder(id,orderId)} style={[styles.buttonstyle,{width:scaleSize(80),marginRight:scaleSize(10)}]}>
                        <Text style={{color:'#828282'}}>取消订单</Text>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={()=>{
                                            RouteHelper.navigate("AddOrderPage",{bigOrderId:orderId})
                        }} style={[styles.buttonstyle,{borderColor:'#db090a',width:scaleSize(70)}]}>
                            <Text style={{color:'#db090a'}}>去付款</Text>
                        </TouchableOpacity> 
                    </View>
            // case 3:
            //     return <View style={{paddingTop:scaleSize(15),alignItems:'flex-end'}}>
            //     {/* <View style={{alignItems:'center'}}>
            //         <Text style={{fontSize:scaleSize(12),color:'#db090a'}}>59分15秒</Text>
            //         <Text>剩余付款时间</Text>
            //     </View> */}
            //     <TouchableOpacity style={[styles.buttonstyle,{borderColor:'#db090a',width:scaleSize(70)}]} onPress={()=>{
            //         Toast.message("提醒成功");
            //     }}>
            //         <Text style={{color:'#db090a'}}>提醒发货</Text>
            //     </TouchableOpacity> 
            // </View>
            case 4:
                return <View style={{display:'flex',flexDirection:'row',justifyContent:'flex-end', alignItems:'flex-end',paddingTop:scaleSize(15)}}>
                {/* <View style={{alignItems:'center'}}>
                    <Text style={{fontSize:scaleSize(12),color:'#db090a'}}>59分15秒</Text>
                    <Text>剩余付款时间</Text>
                </View> */}
                {/* <TouchableOpacity onPress={()=>this.logisticsMsg(id)} style={[styles.buttonstyle,{width:scaleSize(80),marginRight:scaleSize(10)}]}>
                <Text style={{color:'#828282'}}>物流信息</Text>
                </TouchableOpacity>  */}
                <TouchableOpacity onPress={()=>this.confirmReceiveGoods(id)} style={[styles.buttonstyle,{borderColor:'#db090a',width:scaleSize(70)}]}>
                    <Text style={{color:'#db090a'}}>确认收货</Text>
                </TouchableOpacity> 
            </View>
            case 5:
                return <View style={{paddingTop:scaleSize(15),alignItems:'flex-end'}}>
                {/* <View style={{alignItems:'center'}}>
                    <Text style={{fontSize:scaleSize(12),color:'#db090a'}}>59分15秒</Text>
                    <Text>剩余付款时间</Text>
                </View> */}
                <TouchableOpacity style={[styles.buttonstyle,{borderColor:'#db090a',width:scaleSize(70)}]} onPress={()=>{
                    RouteHelper.navigate("AddEvaPage",{orderId:id})
                }}>
                    <Text style={{color:'#db090a'}}>去评价</Text>
                </TouchableOpacity> 
            </View>
            // case 6:
            //     return <Text>59分15秒</Text>
            // case 7:
            //     return <Text>59分15秒</Text>
            default:
                break;
        }
    }

    componentWillMount() {
		// //监听返回键
		BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
	}

	componentWillUnmount() {
		//取消对返回键的监听
		BackHandler.removeEventListener('hardwareBackPress', this.onBackClicked);
	}

	//BACK物理按键监听
	onBackClicked = () => {
		RouteHelper.navigate("MainPage")
		DeviceEventEmitter.emit("orderEmit")
		return true;
	}

    render() {
        let { status, statusArray } = this.state;
        return <View style={{ flex: 1, backgroundColor: '#F5F6F8' }} >
            <UINavBar title="订单" leftView={
                <TouchableOpacity  onPress={()=>{
                    DeviceEventEmitter.emit("orderEmit")
                    RouteHelper.navigate("MainPage")
                }}><Image style={{marginLeft:scaleSize(7), width:scaleSize(15),height:scaleSize(15)}} source={images.back}/></TouchableOpacity>
            } rightView={
                <TouchableOpacity
                onPress={() =>{
                    this.setState({
                        isDataPick:true
                    })
                }}>
                <Text style={{marginRight:scaleSize(10),color:'#fff'}}>日期筛选</Text>
              </TouchableOpacity>
             }/>


            {
                this.state.isDataPick&&<View style={{ flex: 1,backgroundColor: 'rgba(0,0,0,0.5)',position: 'absolute',width: '100%',height: '100%',zIndex: 998}}>
                    <View style={{width:'100%',height:scaleSize(200),backgroundColor:'#fff',position:'absolute',bottom:0,zIndex:999,borderTopWidth:1,borderTopColor:'#E2E4EA',borderTopLeftRadius:5,borderTopRightRadius:5}}>
                        <TouchableOpacity style={{position:'absolute',right:10,top:10}} onPress={()=>{
                            this.setState({
                                isDataPick:false,
                                startDate:null,
                                endDate:null
                            })
                        }}>
                            <Image style={{width:scaleSize(20),height:scaleSize(20)}} source={images.cha} />
                        </TouchableOpacity>

                        <View style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center',paddingTop:scaleSize(45),paddingHorizontal:scaleSize(20)}}>
                            <DatePicker
                                    style={{width: 150}}
                                    date={this.state.startDate}
                                    mode="date"
                                    placeholder="起始时间"
                                    format="YYYY-MM-DD"
                                    minDate="2020-05-01"
                                    maxDate="2099-06-01"
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    showIcon={false}
                                    onDateChange={(date) => {this.setState({startDate: date})}}
                                />
                            <Text>-</Text>
                            <DatePicker
                                    style={{width: 150}}
                                    date={this.state.endDate}
                                    mode="date"
                                    placeholder="截至时间"
                                    format="YYYY-MM-DD"
                                    minDate="2020-05-01"
                                    maxDate="2099-06-01"
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    showIcon={false}
                                    onDateChange={(date) => {this.setState({endDate: date})}}
                                />
                        </View>
                        <View style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center',marginTop:scaleSize(40)}}>
                            <TouchableOpacity onPress={()=>{
                                this.setState({
                                    isDataPick:false,
                                    startDate:null,
                                    endDate:null
                                },()=>{
                                    this.listView && this.listView.refresh();
                                })
                            }} style={{width:scaleSize(130),height:scaleSize(40),backgroundColor:'#e3e3e3',borderRadius:4}}>
                                <Text style={{textAlign:'center',color:'#1a1a1a',lineHeight:scaleSize(40)}}>重置</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{
                                this.setState({
                                    isDataPick:false,
                                },()=>{
                                    this.listView && this.listView.refresh();
                                })
                            }} style={{width:scaleSize(130),height:scaleSize(40),backgroundColor:PRIMARY_COLOR,borderRadius:4}}>
                                <Text style={{textAlign:'center',color:'#fff',lineHeight:scaleSize(40)}}>提交</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
               
            }

            <View style={{ width: '100%', height: scaleSize(45), backgroundColor: '#fff', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                {
                    statusArray.map((item, index) => {
                        return <TouchableOpacity style={{ width: scaleSize(62), height: '100%', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: status == index ? '#df2223' : '#fff' }} onPress={() => {
                            this.setState({
                                status: item?.type
                            }, () => {
                                this.listView && this.listView.refresh();
                            })
                        }}>
                            <Text style={{ textAlign: 'center', color: status == index ? '#df2223' : '#000' }}>{item?.name}</Text>
                        </TouchableOpacity>
                    })
                }
            </View>

            <UltimateListView
                allLoadedText={"没有更多了"}
                waitingSpinnerText={'加载中...'}
                ref={ref => this.listView = ref}
                onFetch={this.onFetch.bind(this)}
                keyExtractor={(item, index) => `${index} -`}
                item={(item, index) => {
                    // console.log(item);
                    return <View style={styles.listRows}>
                        <TouchableOpacity onPress={()=>{
                            this.setState({
                                isDataPick:false
                            })
                            if(item.goodsOrderStatus == 1){
                                RouteHelper.navigate("AddOrderPage",{bigOrderId:item?.orderId})
                            }else if(item.goodsOrderStatus == 2){
                                Toast.message("等待管理员确认");
                            }else{
                                RouteHelper.navigate("OrderDetailPage",{orderId:item?.id})
                            }
                        }}>
                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <Image style={styles.pic} source={{ uri: ApiUrl.GOODS_IMAGE + item?.goods?.pictureUrl1}}></Image>
                                <View style={styles.goodsMsg}>
                                    <View style={styles.rowBetweenCenter}>
                                        <Text numberOfLines={1} style={{ fontSize: scaleSize(16), fontWeight: '900',width:scaleSize(153) }}>{item?.goods?.name}</Text>
                                        <Text style={{ fontSize: scaleSize(14), color: '#db090a', fontWeight: '900' }}>{this.findStatusName(item?.goodsOrderStatus)}</Text>
                                    </View>

                                    <Text numberOfLines={2} style={{ fontSize: scaleSize(14), color: '#646464' }}>{item?.goods?.description}</Text>
                                    <View style={styles.rowBetweenCenter}>
                                        <Text style={{ fontSize: scaleSize(16), fontWeight: '900' }}>￥{Number(item?.price).toFixed(2)}</Text>
                                        <Text>x{item?.num}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={{width:'100%',borderBottomColor:'#e5e5e5',borderBottomWidth:1,marginTop:scaleSize(11)}}>
                            </View>

                            <View style={styles.price}>
                                <Text>{this.state.timer}</Text>
                                <Text style={{fontSize:scaleSize(14),color:'#828282',marginRight:scaleSize(10)}}>总价:{Number(item?.price * item?.num).toFixed(2)}</Text>
                                <Text style={{fontSize:scaleSize(14),color:'#828282',marginRight:scaleSize(10)}}>邮费:{Number(item?.postage).toFixed(2)}</Text>
                                <Text style={{fontSize:scaleSize(14),color:'#000'}}>实付:{(Number(item?.price * item?.num) + Number(item?.postage)).toFixed(2)}</Text>
                            </View>
                        </TouchableOpacity>


                        {this.findButton(item?.goodsOrderStatus,item?.id,item?.orderId)}
                    </View>

                }}
                displayDate
                emptyView={() => {
                    return <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{
                            fontSize: 14, color: "rgba(0,0,0,0.60)",
                            marginTop: scaleSize(100),
                            fontWeight: "400"
                        }}>暂无订单</Text>
                    </View>
                }}
            />

        </View>
    }

}

var styles = StyleSheet.create({

    listRows: {
        width: scaleSize(360),
        backgroundColor: '#fff',
        borderRadius: scaleSize(4),
        marginLeft: scaleSize(7.5),
        marginTop: scaleSize(15),
        padding: scaleSize(10)
    },

    pic: {
        width: scaleSize(110),
        height: scaleSize(110),
        borderRadius: scaleSize(4)
    },

    goodsMsg: {
        width: scaleSize(220),
        marginLeft: scaleSize(8),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },

    rowBetweenCenter: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    price:{
        width:'100%',
        display:'flex',
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
        paddingTop:scaleSize(10)
    },

    buttonstyle:{
        height:scaleSize(29),
        borderColor:'#bdbdbd',
        borderWidth:scaleSize(1), 
        borderRadius:scaleSize(40),
        justifyContent:'center',
        alignItems:'center'
    }

});