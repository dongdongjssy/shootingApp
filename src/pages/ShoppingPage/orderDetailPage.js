import React, { Component } from 'react'
import { Text, View, DeviceEventEmitter,Clipboard, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
import { UltimateListView } from 'react-native-ultimate-listview';
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import UISwitch from '../../components/UISwitch'
import LinearGradient from 'react-native-linear-gradient'
import store from '../../store'
import Url from '../../api/Url'
import Request from '../../api/Request'
import { ClientStatusEnum } from '../../global/constants'
import { Toast, ModalIndicator } from 'teaset';
import { scaleSize } from '../../global/utils'
import HeaderCarousel from '../HomePage/HeaderCarousel';
import { UserStore } from '../../store/UserStore';
import ApiUrl from '../../api/Url';
import HttpBaseConfig from '../../api/HttpBaseConfig';
import UIConfirm from '../../components/UIConfirm';


export default class OrderDetailPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            orderId:props.orderId,
            status: '待收货',
            order:{},
            address:{},
        };
    }

    componentDidMount() {
        this.findOrderData();
    }

    findOrderData(){
        Request.post(ApiUrl.GOODS_ORDER_BYID + this.state?.orderId).then(res => {
            console.log("sss=" + JSON.stringify(res.data));
            this.setState({
                order:res?.data 
            },()=>{
                this.findGoodsAddress(res?.data?.goodsAddressId);
            })
        }).catch(err => console.log(err));
    }

    findGoodsAddress(goodsAddressId){
        Request.post(ApiUrl.GOODS_ADDRESS_BYID + goodsAddressId).then(res => {
            this.setState({
                address:res?.data
            })
        }).catch(err => console.log(err));
    }

    confirmReceiveGoods(id){
        UIConfirm.show('是否确定收货此订单?',()=>{
            let data = {
                id:id,
                goodsOrderStatus:5
            }
            Request.post(ApiUrl.GOODS_ORDER_EDIT, data).then(res => {
                if(res?.data?.code == 0){
                    Toast.message("收货成功");
                    DeviceEventEmitter.emit("addEva");
                    RouteHelper.navigate("OrderPage",{status:0});
                    // this.listView&&this.listView.refresh();
                }
            }).catch(err => console.log(err));
        })
    }

    render() {
        return <View style={{ flex: 1, backgroundColor: '#F5F6F8' }}>
            <UINavBar title="详情" rightView={
           <TouchableOpacity
           onPress={async() =>{
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
           <Text style={{marginRight:scaleSize(10),color:'#fff'}}>联系客服</Text>
         </TouchableOpacity>
        }/>
            <ScrollView>
                <View style={styles.redBackGround}>
                    <View style={[styles.flexBetweenCenter, { paddingHorizontal: scaleSize(20), paddingTop: scaleSize(15) }]}>
                        <Text style={{ fontSize: scaleSize(18), fontWeight: 'bold', color: '#fff' }}>
                           {this.state.order?.goodsOrderStatus == 3 &&'待发货'}
                           {this.state.order?.goodsOrderStatus == 4 &&'待收货'}
                           {this.state.order?.goodsOrderStatus == 5 &&'已收货'}
                           {this.state.order?.goodsOrderStatus == 6 &&'已完成'}
                           {this.state.order?.goodsOrderStatus == 7 &&'已取消'}
                        </Text>
                           {this.state.order?.goodsOrderStatus == 4 &&<Image style={{ width: scaleSize(73), height: scaleSize(73) }} source={images.shouhuoche}></Image>}
                           {this.state.order?.goodsOrderStatus == 6 &&<Image style={{ width: scaleSize(73), height: scaleSize(73) }} source={images.dangandai2}></Image>}
                           {this.state.order?.goodsOrderStatus == 7 &&<Image style={{ width: scaleSize(73), height: scaleSize(73) }} source={images.dangandai}></Image>}
                    </View>
                </View>

                {
                    this.state.order?.goodsOrderStatus == 4 ? <><View style={[styles.fmargin,styles.flexStartCenter,{paddingHorizontal:scaleSize(8)}]}>
                        <View style={styles.wuliuyuan}>
                            <Image style={{width:scaleSize(19),height:scaleSize(19)}} source={images.xiaoche}></Image>
                        </View>

                        <View style={[styles.wuliuMsg,{width:scaleSize(140)}]}>
                            <Text>{this.state?.order?.courierCompany}</Text>
                            <Text>{this.state?.order?.courierNumber}</Text>
                        </View>


                        <TouchableOpacity style={styles.copy} onPress={()=>{
                                Toast.message("复制成功");
                                Clipboard.setString(this.state?.order?.courierNumber);  
                        }}>
                            <Text style={{textAlign:'center',color:'#de2222',lineHeight:scaleSize(22)}}>复制</Text>
                        </TouchableOpacity>
                    </View>

                        <View style={styles.goodsMsg1}>
                            <View style={{display:'flex',flexDirection:'row'}}>
                                <Image style={{width:scaleSize(108),height:scaleSize(108)}} source={{uri:ApiUrl.GOODS_IMAGE + this.state?.order?.goods?.pictureUrl1}}></Image>
                                <View style={styles.flexColBetWeenCenter}>
                                    <Text>{this.state?.order?.name}</Text>
                                    <Text numberOfLines={1}>{this.state?.order?.goods?.description}</Text>
                                    <View style={styles.flexStartCenter}>
                                        <Text>￥{Number(this.state.order?.price).toFixed(2)}</Text>
                                        {/* <Image style={{width:scaleSize(69),height:scaleSize(14.71),marginLeft:scaleSize(6)}} source={images.vipPrice}></Image> */}
                                    </View>
                                </View>
                            </View>

                            <View style={{borderBottomColor:'#F5F6FA',borderBottomWidth:scaleSize(1),width:'100%',marginTop:scaleSize(15),marginBottom:scaleSize(6)}}></View>
                            <View style={[styles.flexBetweenCenter,{width:'100%',marginBottom:scaleSize(13)}]}>
                                <Text style={{color:'#646464'}}>颜色</Text>
                                <Text>{this.state.order?.attributes}</Text>
                            </View>
                            {/* <View style={[styles.flexBetweenCenter,{width:'100%',marginBottom:scaleSize(13)}]}>
                                <Text style={{color:'#646464'}}>尺寸</Text>
                                <Text>XXL</Text>
                            </View> */}
                            <View style={[styles.flexBetweenCenter,{width:'100%',marginBottom:scaleSize(13)}]}>
                                <Text style={{color:'#646464'}}>数量</Text>
                                <Text>{this.state.order?.num}</Text>
                            </View>
                            <View style={[styles.flexBetweenCenter,{width:'100%',marginBottom:scaleSize(13)}]}>
                                <Text style={{color:'#646464'}}>邮费</Text>
                                <Text>￥{Number(this.state.order?.postage).toFixed(2)}</Text>
                            </View>
                            <View style={[styles.flexBetweenCenter,{width:'100%',marginBottom:scaleSize(13)}]}>
                                <Text style={{color:'#646464'}}>备注</Text>
                                <Text  style={{width:scaleSize(250),textAlign:'right'}} numberOfLines={2} >{this.state.order?.remark}</Text>
                            </View>
                        </View></>
                        :
                        <>
                            <View style={styles.goodsMsg2}>
                                <View style={{display:'flex',flexDirection:'row'}}>
                                    <Image style={{width:scaleSize(108),height:scaleSize(108)}} source={{uri:ApiUrl.GOODS_IMAGE + this.state?.order?.goods?.pictureUrl1}}></Image>
                                    <View style={styles.flexColBetWeenCenter}>
                                        <Text>{this.state.order?.name}</Text>
                                        <Text numberOfLines={1}>{this.state?.order?.goods?.description}</Text>
                                        <View style={styles.flexStartCenter}>
                                            <Text>￥{Number(this.state.order?.price).toFixed(2)}</Text>
                                            {/* <Image style={{width:scaleSize(69),height:scaleSize(14.71),marginLeft:scaleSize(6)}} source={images.vipPrice}></Image> */}
                                        </View>
                                    </View>
                                </View>

                                <View style={{borderBottomColor:'#F5F6FA',borderBottomWidth:scaleSize(1),width:'100%',marginTop:scaleSize(15),marginBottom:scaleSize(6)}}></View>
                                <View style={[styles.flexBetweenCenter,{width:'100%',marginBottom:scaleSize(13)}]}>
                                <Text style={{color:'#646464'}}>类型</Text>
                                <Text>{this.state.order?.attributes}</Text>
                            </View>
                                <View style={[styles.flexBetweenCenter,{width:'100%',marginBottom:scaleSize(13)}]}>
                                    <Text style={{color:'#646464'}}>数量</Text>
                                    <Text>{this.state.order?.num}</Text>
                                </View>
                                <View style={[styles.flexBetweenCenter,{width:'100%',marginBottom:scaleSize(13)}]}>
                                    <Text style={{color:'#646464'}}>邮费</Text>
                                    <Text>￥{Number(this.state.order?.postage).toFixed(2)}</Text>
                                </View>
                                <View style={[styles.flexBetweenCenter,{width:'100%',marginBottom:scaleSize(13)}]}>
                                    <Text style={{color:'#646464'}}>备注</Text>
                                    <Text style={{width:scaleSize(250),textAlign:'right'}} numberOfLines={2}>{this.state.order?.remark}</Text>
                                </View>
                            </View>
                        </>
                }

                <View style={styles.orderMsg2}>
                    <Text style={{fontSize:scaleSize(16),fontWeight:'600'}}>订单信息</Text>
                    <View style={[styles.flexBetweenCenter,{marginTop:scaleSize(16)}]}>
                        <Text>订单编号</Text>
                        <Text>{this.state.order?.title}</Text>
                        <TouchableOpacity style={[styles.copy,{marginLeft:scaleSize(-80)}]} onPress={()=>{
                               Toast.message("复制成功");
                               Clipboard.setString(this.state.order?.title); 
                        }}>
                            <Text style={{textAlign:'center',color:'#de2222',lineHeight:scaleSize(22)}}>复制</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexBetweenCenter,{marginTop:scaleSize(16)}]}>
                        <Text>订单时间</Text>
                        <Text>{this.state.order?.createTime}</Text>
                    </View>

                    <View style={{borderBottomColor:'#F5F6FA',borderBottomWidth:scaleSize(1),width:'100%',marginTop:scaleSize(15),marginBottom:scaleSize(6)}}></View>

                    <View style={[styles.flexBetweenCenter,{marginTop:scaleSize(16)}]}>
                        <Text>收货人</Text>
                        <Text>{this.state.address?.name}</Text>
                    </View>

                    <View style={[styles.flexBetweenCenter,{marginTop:scaleSize(16)}]}>
                        <Text>收货电话</Text>
                        <Text>{this.state.address?.phone}</Text>
                    </View>

                    <View style={[styles.flexBetweenCenter,{marginTop:scaleSize(16)}]}>
                        <Text>收货地址</Text>
                        <Text  style={{width:scaleSize(250),textAlign:'right'}} numberOfLines={2}>{this.state.address?.city}{this.state.address?.area}{this.state.address?.address}</Text>
                    </View>
                </View>
                
                {
                    (this.state.order?.goodsOrderStatus == 4 || this.state.order?.goodsOrderStatus == 5 || this.state.order?.goodsOrderStatus == 6)&&<View style={styles.orderMsg3}>
                    <Text style={{fontSize:scaleSize(16),fontWeight:'600'}}>物流信息</Text>
                    <View style={[styles.flexBetweenCenter,{marginTop:scaleSize(16)}]}>
                        <Text>发货时间</Text>
                        <Text>{this.state.order?.deliveryTime}</Text>
                    </View>

                    <View style={[styles.flexBetweenCenter,{marginTop:scaleSize(16)}]}>
                        <Text>快递</Text>
                        <Text>{this.state?.order?.courierCompany}</Text>
                    </View>
                    <View style={[styles.flexBetweenCenter,{marginTop:scaleSize(16)}]}>
                        <Text>快递单号</Text>
                        <Text>{this.state?.order?.courierNumber}</Text>
                    </View>
                </View>
                }
                


                {
                    this.state.order?.goodsOrderStatus == 5&&<TouchableOpacity style={[styles.flexCenterCenter,{borderRadius:scaleSize(4),borderColor:'#db090a',borderWidth:scaleSize(1),width:scaleSize(360),height:scaleSize(56),marginLeft:scaleSize(7.5),marginBottom:scaleSize(27)}]} onPress={()=>{
                        RouteHelper.navigate("AddEvaPage",{orderId:this.state.order?.id})
                   }}>
                       <Image style={{width:scaleSize(36),height:scaleSize(36)}} source={images.redStar}></Image>
                       <Text style={{fontSize:scaleSize(16),color:'#db090a',fontWeight:'bold'}}>去评价</Text>
                   </TouchableOpacity>
                }

                {
                   this.state.order?.goodsOrderStatus == 4&&<TouchableOpacity style={[styles.flexCenterCenter,{borderRadius:scaleSize(4),borderColor:'#db090a',borderWidth:scaleSize(1),width:scaleSize(360),height:scaleSize(56),marginLeft:scaleSize(7.5),marginBottom:scaleSize(27)}]} onPress={()=>this.confirmReceiveGoods(this.state.order?.id)}>
                   <Image style={{width:scaleSize(36),height:scaleSize(36)}} source={images.querenshouhuo}></Image>
                   <Text style={{fontSize:scaleSize(16),color:'#db090a',fontWeight:'bold'}}>确认收货</Text>
               </TouchableOpacity> 
                }
                

                

            </ScrollView>

        </View>
    }

}

var styles = StyleSheet.create({

    fmargin: {
        width: scaleSize(360),
        marginLeft: scaleSize(7.5),
        height: scaleSize(89),
        backgroundColor: '#fff',
        borderRadius: scaleSize(4),
        marginTop: scaleSize(-35)
    },
    redBackGround: {
        width: '100%',
        height: scaleSize(131),
        backgroundColor: PRIMARY_COLOR
    },

    flexStartCenter: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },

    flexBetweenCenter: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    flexCenterCenter: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },

    flexColBetWeenCenter: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width:scaleSize(220),
        marginLeft:scaleSize(8)
    },

    orderMsg: {
        width: scaleSize(360),
        height: scaleSize(158),
        backgroundColor: '#fff',
        marginLeft: scaleSize(7.5),
        borderRadius: scaleSize(4),
        marginTop: scaleSize(-35)
    },

    woyifukuan: {
        width: scaleSize(360),
        height: scaleSize(56),
        borderColor: '#db090a',
        borderRadius: scaleSize(4),
        borderWidth: scaleSize(1),
        marginLeft: scaleSize(7.5),
        marginTop: scaleSize(15)
    },

    wuliuyuan:{
        width:scaleSize(30),
        height:scaleSize(30),
        borderRadius:scaleSize(30/2),
        backgroundColor:'#DB090A',
        alignItems:'center',
        justifyContent:'center'
    },

    wuliuMsg:{
        display:'flex',
        flexDirection:'column',
        alignItems:'flex-start',
        justifyContent:'space-around',
        marginLeft:scaleSize(22)
    },

    copy:{
        width:scaleSize(44),
        height:scaleSize(23),
        borderWidth:scaleSize(1),
        borderColor:'#de2222',
        marginLeft:scaleSize(100)
    },

    goodsMsg1:{
        width: scaleSize(360),
        marginLeft: scaleSize(7.5),
        height: scaleSize(309),
        backgroundColor: '#fff',
        borderRadius: scaleSize(4),
        marginTop: scaleSize(15),
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        padding:scaleSize(10)
    },

    goodsMsg2:{
        width: scaleSize(360),
        marginLeft: scaleSize(7.5),
        height: scaleSize(309),
        backgroundColor: '#fff',
        borderRadius: scaleSize(4),
        marginTop: scaleSize(-35),
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-around',
        alignItems:'center',
        padding:scaleSize(10)

    },

    orderMsg2:{
        width:scaleSize(360),
        height:scaleSize(261),
        backgroundColor:'#fff',
        marginLeft:scaleSize(7.5),
        marginTop:scaleSize(15),
        borderRadius:scaleSize(4),
        padding:scaleSize(10)
    },

    orderMsg3:{
        width:scaleSize(360),
        height:scaleSize(146),
        backgroundColor:'#fff',
        marginLeft:scaleSize(7.5),
        marginTop:scaleSize(15),
        borderRadius:scaleSize(4),
        padding:scaleSize(10),
        marginBottom:scaleSize(35)
    }


})