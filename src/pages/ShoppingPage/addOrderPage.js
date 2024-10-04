import React, { Component } from 'react'
import { Text, View,TouchableOpacity, Image, StyleSheet, ScrollView,Clipboard,DeviceEventEmitter,BackHandler} from 'react-native'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import { RouteHelper } from 'react-navigation-easy-helper'
import Url from '../../api/Url'
import Request from '../../api/Request'
import { Toast, ModalIndicator } from 'teaset';
import { scaleSize } from '../../global/utils'
import { UserStore } from '../../store/UserStore';
import ApiUrl from '../../api/Url';
import WebViewHtmlView from '../../components/WebViewHtmlView';
import UIConfirm from '../../components/UIConfirm';
import moment from 'moment'


export default class AddOrderPage extends Component {
    constructor(props) {
		super(props);
		this.state = {
            bigOrderId:props?.bigOrderId,
            bigOrder:{},
            hour:0,
            minutes:0,
            seconds:5,
		};
	}

    componentWillMount() {
        // //监听返回键
        BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
    }
        
    //BACK物理按键监听
    onBackClicked = () => {
        DeviceEventEmitter.emit("addEva")
        RouteHelper.navigate("OrderPage",{status:0})
        return true;

    }

     // 实现在这里借小时
    get_hour() {
        var hu=this.state.hour; //获取分钟
        if (hu>0) { //分钟不为0，则直接借走1分钟
        hu--; //分钟减一
        this.setState({hour:hu}); //更改分钟状态
        return 1; //借走一分钟
        }
        else if (hu==0) { //分钟为0，从小时哪里借
        this.setState({hour:'00'}); //更改分钟状态
        return 0;
        }
    }
    // 实现在这里借分钟
    get_minutes() {
        var mt=this.state.minutes; //获取分钟
        var ct=this.state.seconds; //获取秒
        if (mt>0) { //分钟不为0，则直接借走1分钟
        mt--; //分钟减一
        this.setState({minutes:mt}); //更改分钟状态
        return 1; //借走一分钟
        }
        else if (mt==0) { //分钟为0，从小时哪里借
            return 0;
            // if(ct == 0){ //秒也等于0的话 就结束了
            //     Toast.message("结束了")
            //     this._timer&&clearInterval(this._timer);
            // }
        // var get_hu=this.get_hour();
        // if (get_hu==1) { //借到了
        //     this.setState({minutes:59}); //更改分钟状态
        //     return 1;
        // }
        // else{
        //     this.setState({minutes:'00'}); //没借到，更改分钟状态
        //     return 0;
        // }
        }
    }

    componentWillUnmount(){
        this._timer&&clearInterval(this._timer);
                //取消对返回键的监听
        BackHandler.removeEventListener('hardwareBackPress', this.onBackClicked);
    }

    // 计时函数
    countTime(){
        console.log(this.state.bigOrder?.createTime);
        let time = moment(this.state.bigOrder?.createTime).add(1,'h');

        let diffMinute = moment(time).diff(new Date(), 'minute');
        let diffSeconds = moment(time).diff(new Date(), 'seconds');

        if(diffMinute < 0 || diffSeconds < 0){
            let data = {
                id:this.state.bigOrderId,
            }
            Request.post(ApiUrl.ORDER_CANCEL, data).then(res => {
                if(res?.data?.code == 0){
                    Toast.message("订单已过期");
                    DeviceEventEmitter.emit("addEva");
                    RouteHelper.navigate("OrderPage",{status:0})
                }
            }).catch(err => console.log(err));
        }
        diffSeconds = diffSeconds%60;
        this.setState({
            minutes:diffMinute,
            seconds:diffSeconds
        })
        this._timer=setInterval(()=>{
        var ct=this.state.seconds; //获取秒
        if (ct>0) { //如果秒大于0，则执行减1
            ct--;
            this.setState({seconds:ct}); //更改秒的状态
        }
        else if (ct==0) { // 秒为0，去借分钟
            var get_mt=this.get_minutes();
            if (get_mt==1) { //借分钟成功
            ct=59;
            this.setState({seconds:ct}); //将秒设置为59
            }
            else if (get_mt==0) { //没借到分钟，说明计时结束
            Toast.message("付款时间结束，将跳回订单列表")
            this._timer&&clearInterval(this._timer);
            DeviceEventEmitter.emit("addEva");
            RouteHelper.navigate("OrderPage",{status:0})
            }
        }
        },1000);
    }

    async componentDidMount(){
        this.findBigOrderData();
    }

    async findBigOrderData(){
        Request.post(ApiUrl.ORDER_BYID + this.state.bigOrderId).then(res => {
            console.log("dudu =" + JSON.stringify(res.data.name));
            this.setState({
                bigOrder:res?.data
            },()=>{
                this.countTime();
            })
        }).catch(err => console.log(err));
    }

    endPayment(){

        UIConfirm.show('确认是否完成付款\n确认后将不再展示付款码',()=>{
            let data={
                id:this.state.bigOrderId,
                payTime: moment().format('YYYY-MM-DD HH:mm:ss')
            }
            Request.post(ApiUrl.ORDER_EDIT, data).then(res => {
                console.log(res);
                if(res?.data?.code == 0){
                    // Toast.message("等待确认")
                    // DeviceEventEmitter.emit("addEva");
                    RouteHelper.navigate("PaymentEndPage",{bigOrderId:this.state.bigOrderId})
                    // RouteHelper.navigate("OrderPage",{status:0})
                }
            }).catch(err => console.log(err));

            // RouteHelper.navigate("PaymentEndPage")

        })
    }

    cancelOrder(orderId){
        console.log(orderId);
        UIConfirm.show('如果您此次下单包含多个商品，将合并取消',()=>{
            let data = {
                id:orderId,
            }
            Request.post(ApiUrl.ORDER_CANCEL, data).then(res => {
                console.log(res.data.code);
                if(res?.data?.code == 0){
                    Toast.message("取消订单成功");
                    DeviceEventEmitter.emit("addEva");
                    RouteHelper.navigate("OrderPage",{status:0})
                }
            }).catch(err => console.log(err));
        })
    }


    render(){
        const {bigOrder,hour,minutes,seconds} = this.state;

        // console.log("烦烦烦" + JSON.stringify(bigOrder));
        return <View style={{flex:1,backgroundColor:'#F5F6F8'}}>
                    <UINavBar title="付款" leftView={
                        <TouchableOpacity  onPress={()=>{
                            DeviceEventEmitter.emit("addEva");
                            RouteHelper.navigate("OrderPage",{status:0})
                        }}><Image style={{marginLeft:scaleSize(7), width:scaleSize(15),height:scaleSize(15)}} source={images.back}/></TouchableOpacity>
                    }/>
                    <ScrollView>
                        <View style={styles.redBackGround}>
                            <View style={[styles.flexBetweenCenter,{paddingHorizontal:scaleSize(20)}]}>
                                <View style={{marginTop:scaleSize(31)}}>
                                    <Text style={{fontSize:scaleSize(18),fontWeight:'bold',color:'#fff'}}>待付款</Text>
                                    <Text style={{fontSize:scaleSize(14),fontWeight:'bold',color:'#fff',marginTop:scaleSize(5)}}>剩余时间: {`${minutes}`+ '分' + `${seconds}` + '秒'  }</Text>
                                </View>
                                <Image style={{width:scaleSize(73),height:scaleSize(73)}} source={images.dangandai}></Image>
                            </View>
                        </View>

                        <View style={styles.orderMsg}>
                            <View style={[styles.flexBetweenCenter,{paddingHorizontal:scaleSize(10),marginTop:scaleSize(9)}]}>
                                <Text style={{fontSize:scaleSize(14),fontWeight:'bold'}}>订单信息</Text>
                                <TouchableOpacity style={{width:scaleSize(44),height:scaleSize(23),borderColor:'#de2222',borderWidth:scaleSize(1)}} onPress={()=>{
                                        Toast.message("复制成功");
                                        Clipboard.setString(bigOrder?.title); 
                                }}>
                                    <Text style={{color:'#de2222',textAlign:'center'}}>复制</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.flexBetweenCenter,{paddingHorizontal:scaleSize(10),marginTop:scaleSize(16)}]}>
                                <Text style={{fontSize:scaleSize(12),fontWeight:'500'}}>订单号:</Text>
                                <Text style={{fontSize:scaleSize(12),fontWeight:'500'}} numberOfLines={1}>{bigOrder?.title}</Text>
                            </View>
                            <View style={[styles.flexBetweenCenter,{paddingHorizontal:scaleSize(10),marginTop:scaleSize(16)}]}>
                                <Text style={{fontSize:scaleSize(12),fontWeight:'400'}}>收货人:</Text>
                                <Text style={{fontSize:scaleSize(12),fontWeight:'400'}}>{bigOrder?.name}</Text>
                            </View>
                            <View style={[styles.flexBetweenCenter,{paddingHorizontal:scaleSize(10),marginTop:scaleSize(16)}]}>
                                <Text style={{fontSize:scaleSize(12),fontWeight:'400'}}>总金额:</Text>
                                <Text style={{fontSize:scaleSize(18),fontWeight:'400',color:'#de2d32'}}>￥{Number(bigOrder?.price).toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={{width:scaleSize(360),backgroundColor:'#fff',marginLeft:scaleSize(7.5),borderRadius:scaleSize(4),marginTop:scaleSize(15),paddingHorizontal:scaleSize(10)}}>
                            <Text style={{fontSize:scaleSize(14),fontWeight:'500',marginTop:scaleSize(23)}}>付款步骤</Text>
                            <View style={{ flex: 1,  paddingHorizontal: scaleSize(14),marginTop:scaleSize(13) }}>
                                <WebViewHtmlView
                                    content={bigOrder?.comment}
                                />

                            </View>
                            <Image style={{width:scaleSize(188),height:scaleSize(188),marginLeft:scaleSize(73.5),marginTop:scaleSize(20), marginBottom:scaleSize(23.18)}} source={{uri:ApiUrl.PAYMENT_IMAGE + bigOrder?.pictureUrl}}></Image>
                        </View>

                        <View style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center',marginBottom:scaleSize(20)}}>
                            <TouchableOpacity style={{marginTop:scaleSize(15)}} onPress={async()=>{
                                let user = await UserStore.getLoginUser();
                                RouteHelper.navigate('ChatPage', {
                                    loginUser: user,
                                    conversation: {
                                        user: {
                                            nickname: "CPSA客服",
                                            username: "CPSA",
                                            name: "CPSA客服"
                                        },
                                        type: 'single'
                                    }
                                })
                            }}>
                                <View style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                    <Image style={{ width: scaleSize(20), height: scaleSize(20) }} source={images.kefu}></Image>
                                    <Text style={{fontSize:scaleSize(11),marginTop:scaleSize(3)}}>客服</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.flexCenterCenter,styles.quxiaodingdan]} onPress={()=>this.cancelOrder(bigOrder?.id)}>
                                <Text style={{fontSize:scaleSize(14),color:'#4f4f4f',fontWeight:'300',textAlign:'center'}}>取消订单</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.flexCenterCenter,styles.woyifukuan]} onPress={()=>this.endPayment()}>
                                <Image style={{width:scaleSize(26),height:scaleSize(30)}} source={images.shouliqian}></Image>
                                <Text style={{fontSize:scaleSize(14),color:'#db090a',fontWeight:'400',marginLeft:scaleSize(10.14)}}>我已付款</Text>
                            </TouchableOpacity>

                        </View>

                    </ScrollView>
                    
            </View>
    }
}

var styles = StyleSheet.create({

    redBackGround:{
        width:'100%',
        height:scaleSize(131),
        backgroundColor:PRIMARY_COLOR
    },

    flexBetweenCenter:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },

    flexCenterCenter:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },

    orderMsg:{
        width:scaleSize(360),
        height:scaleSize(158),
        backgroundColor:'#fff',
        marginLeft:scaleSize(7.5),
        borderRadius:scaleSize(4),
        marginTop:scaleSize(-35)
    },

    quxiaodingdan:{
        width:scaleSize(100),
        height:scaleSize(45),
        // borderColor:'#db090a',
        borderRadius:scaleSize(4),
        borderWidth:scaleSize(1),
        marginLeft:scaleSize(17.5),
        marginTop:scaleSize(15)
    },

    woyifukuan:{
        width:scaleSize(140),
        height:scaleSize(45),
        borderColor:'#db090a',
        borderRadius:scaleSize(4),
        borderWidth:scaleSize(1),
        marginLeft:scaleSize(17.5),
        marginTop:scaleSize(15)
    }


})