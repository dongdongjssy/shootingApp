import React, { Component } from 'react'
import { Text, View, DeviceEventEmitter,TextInput,TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions,BackHandler } from 'react-native'
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
import UISelect from '../../components/UISelect';
import UIConfirm from '../../components/UIConfirm';

export default class DownOrderPage extends Component {
    constructor(props) {
		super(props);
		this.state = {
			goodsList:props?.goodsList,
            shoppingCarIds:props?.shoppingCarIds,
            loginuser:null,
            addressInfo:null,
            isInvoice:false,
            invoiceList:[],
            invoice:null,
            totalPrice:0,
            remark:''
		};
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
        DeviceEventEmitter.emit("likeUpdated")
        return;
    }


    componentDidMount(){
        UserStore.getLoginUser().then(user => {
			this.setState({ loginuser: user },()=>{
                if(this.state.addressInfo == null){
                    this.jisuan();
                    this.findUserAddress();
                }
			})
		})
        DeviceEventEmitter.addListener("moren",res=>{
            this.setState({
                addressInfo:res?.addressInfo
            })
            console.log("默认监听返回数据" + JSON.stringify(res));
        })
    }

    //提交订单
    addOrder(){
        if(this.state.addressInfo == null || this.state.addressInfo == '' || this.state.addressInfo== undefined){
            Toast.message("请填写收货地址");
            return;
        }
        ModalIndicator.show("正在提交...");
        this.state.goodsList.map((item,index)=>{
            item.clientUserId = this.state.loginuser?.id
            item.goodsAddressId = this.state.addressInfo?.id
            item.goodsId = item?.id 
            item.invoiceId = this.state.invoice?.id
            item.invoiceType = item?.invoice
            item.num = item?.buyNums
            item.postage = item?.mailMethod == 1?null:item?.mailPrice,
            item.remark = this.state.remark
            //已认证
            if(this.state.loginuser?.status == ClientStatusEnum.VERIFIED.code){
                if(Number(item?.memberPrice) != 0){
                    item.price = item?.memberPrice
                }else{
                    item.price = item?.price
                }
            }else{
                item.price = item?.price
            }
        })
        this.setState({
            goodsList:this.state.goodsList
        })
        let data ={
            clientUserId:this.state.loginuser?.id,
            price:this.state.totalPrice,
            goodsOrderList:this.state.goodsList,
        }
        Request.post(ApiUrl.ORDER_ADD, data).then(res => {
            console.log(res.data);
            if (res?.data?.code == 0) {
                if(this.state.shoppingCarIds){
                    for(let i=0; i<this.state.shoppingCarIds.length; i++){
                        Request.post(ApiUrl.SHOPPING_CAR_DELETE + this.state.shoppingCarIds[i]).then(res => {
                            console.log(res);
                        }).catch(err => console.log(err));
                    }
                }
                Toast.message("提交成功");
                ModalIndicator.hide();
                RouteHelper.navigate("AddOrderPage",{bigOrderId:res?.data?.orderId})
            }
        }).catch(err => console.log(err)); 
    }

    //查用户抬头
    findUserInvoice(){
        let data ={
            pd:{
                pageSize:999,
                pageNum:1,
            },
            clientUserId:this.state.loginuser?.id
        }
        Request.post(ApiUrl.GOODS_INVOICE_LIST, data).then(res => {
            console.log(res.data);
            if (res?.data?.code == 0) {
                this.setState({
                    invoiceList: res?.data?.rows
                })
            }
        }).catch(err => console.log(err)); 
    }

    //选择某一个发票
    selectInvoice(value){
        this.setState({
            isInvoice:false ,
            invoice:value
        })
    }
 
    //查用户收货地址
    findUserAddress(){
        let data ={
            pd:{
                pageSize:1,
                pageNum:1,
            },
            clientUserId:this.state.loginuser?.id
        }
        Request.post(ApiUrl.GOODS_ADDRESS_LIST, data).then(res => {
            if (res?.data?.code == 0) {
                this.setState({
                    addressInfo: res?.data?.rows?.length>0?res.data.rows[0]:null
                })
            }
        }).catch(err => console.log(err)); 
    }

    jisuan(){
       //判断已认证
        if(this.state.loginuser?.status == ClientStatusEnum.VERIFIED.code){
            this.state.goodsList.map((item,index)=>{
                let postage = item?.mailMethod == 1?0:item?.mailPrice

                console.log("移库= " + item?.mailPrice);
                if(Number(item?.memberPrice) != 0){
                    item.goodsTotalPrice = Number(item?.memberPrice) * Number(item?.buyNums) + Number(postage);
                    this.state.totalPrice += Number(item?.memberPrice) * Number(item?.buyNums)+ Number(postage);
                    this.setState({
                        totalPrice : this.state.totalPrice
                    })
                }else{
                    item.goodsTotalPrice = Number(item?.price) * Number(item?.buyNums)+ Number(postage)
                    this.state.totalPrice += Number(item?.price) * Number(item?.buyNums)+ Number(postage);
                    this.setState({
                        totalPrice : this.state.totalPrice
                    })
                }
            })

        }else{
            this.state.goodsList.map((item,index)=>{
                let postage = item?.mailMethod == 1?0:item?.mailPrice
                item.goodsTotalPrice = Number(item?.price) * Number(item?.buyNums)+ Number(postage)
                this.state.totalPrice += Number(item?.price) * Number(item?.buyNums)+ Number(postage);
                this.setState({
                    totalPrice : this.state.totalPrice
                })
            })
        }
        this.setState({
            goodsList:this.state.goodsList
        })
    }

    render(){
        return <View style={{flex:1,backgroundColor:'#F5F6F8'}}>
                    <UINavBar title="填写订单" leftView={
                        <TouchableOpacity  onPress={()=>{
                                DeviceEventEmitter.emit("likeUpdated")
                                 RouteHelper.goBack();
                        }}><Image style={{marginLeft:scaleSize(7), width:scaleSize(15),height:scaleSize(15)}} source={images.back}/></TouchableOpacity>
                    }/>
                    {
                        this.state.isInvoice&&<View style={styles.fapiao}>
                            <View style={styles.fapiaoContent}>
                                <View style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                    <Text style={{fontSize:scaleSize(14)}}>抬头选择</Text>
                                    <TouchableOpacity onPress={()=>{
                                        this.setState({
                                            isInvoice:false
                                        })
                                    }} style={{width:scaleSize(17),height:scaleSize(17),position:'absolute',right:20}}>
                                        <Image  source={images.cha} style={{width:scaleSize(17),height:scaleSize(17)}}></Image>
                                    </TouchableOpacity>

                                </View>
                                <ScrollView style={{display:'flex',flexDirection:'column'}}>
                                    {
                                        this.state.invoiceList.length>0?<>{this.state.invoiceList?.map((intem,idx)=>{
                                            return <TouchableOpacity onPress={()=>this.selectInvoice(intem)} style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',marginTop:scaleSize(15)}}>
                                                {
                                                    intem.defaultInvoice==0&&<Image style={{width:scaleSize(16),height:scaleSize(16),marginRight:scaleSize(7)}} source={images.hongduigou}></Image>
                                                }
                                                {
                                                    intem.defaultInvoice==1&&<TouchableOpacity>
                                                    <Image style={{width:scaleSize(16),height:scaleSize(16),marginRight:scaleSize(7)}} source={images.kongquan}></Image>
                                                </TouchableOpacity>
                                                }
 
     
                                             <View style={{width:scaleSize(327),height:scaleSize(70),borderRadius:scaleSize(8),borderWidth:scaleSize(1),borderColor:'#e5e5e5'}}>
                                                 <View style={styles.taitouContent}>
                                                     <Text style={{fontSize:scaleSize(12)}}>发票抬头</Text>
                                                     <Text style={{fontSize:scaleSize(12)}}>{intem.head}</Text>
                                                 </View>
                                                 <View style={styles.taitouContent}>
                                                     <Text style={{fontSize:scaleSize(12)}}>税号</Text>
                                                     <Text style={{fontSize:scaleSize(12)}}>{intem.code}</Text>
                                                 </View>
                                             </View>
                                         </TouchableOpacity>
                                         })}</>:<View style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',paddingTop:scaleSize(60)}}>
                                             <Image style={{width:scaleSize(58),height:scaleSize(58)}} source={images.meifapiao}></Image>
                                             <Text>暂无发票抬头</Text>
                                         </View>
   
                                    }

                                </ScrollView>
                            </View>
                               <TouchableOpacity style={{width:scaleSize(355),height:scaleSize(54),marginLeft:scaleSize(10), justifyContent:'center', backgroundColor:'#DB090A',borderRadius:scaleSize(2),position:'absolute',bottom:80}} onPress={()=>{
                                   this.setState({
                                       isInvoice:false,
                                   })
                                   RouteHelper.navigate('InvoicePage')
                               }}>
                                <Text style={{fontSize:scaleSize(15),color:'#fff',textAlign:'center'}}>去新增</Text>
                            </TouchableOpacity> 
                            
                        </View>
                    }
                    <View style={styles.address}>
                        <TouchableOpacity onPress={()=>{
                                         RouteHelper.navigate('ReceivingAddressPage', {
                                            user: this.state.loginuser,
                                            isOrder:true,
                                          })
                            }} style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                            {
                                this.state.addressInfo?<>
                                <Image style={styles.addressIcon} source={images.giao}></Image>
                                <View style={styles.addressContent}>
                                <View style={{display:'flex',flexDirection:'row',marginBottom:scaleSize(5)}}>
                                    <Text>{this.state.addressInfo?.name}</Text>
                                    <Text style={{marginLeft:scaleSize(10)}}>{this.state.addressInfo?.phone}</Text>
                                </View>
                                <Text style={{width:scaleSize(250)}} numberOfLines={2}>{this.state.addressInfo?.city+this.state.addressInfo?.area+ this.state.addressInfo?.address}</Text>
                            </View><Image style={styles.jiantou} source={images.jiantou}></Image></>:<View style={{marginLeft:scaleSize(30),marginTop:scaleSize(10)}}><Text style={{marginLeft:scaleSize(20),marginTop:scaleSize(20)}}>暂无收货地址,点击去添加</Text></View>
                            }
   
                        </TouchableOpacity>
                        <Image style={{width:scaleSize(350),height:scaleSize(3)}} source={images.dahengtiao}></Image>
                    </View>

                    <ScrollView>
                    {
                        this.state.goodsList?.map((item,index)=>{
                            return <View style={styles.listRow}>
                                        <View style={styles.goodsContent}>
                                            <Image style={{width:scaleSize(108),height:scaleSize(108),borderRadius:scaleSize(4)}} source={{uri: ApiUrl.GOODS_IMAGE + item?.pictureUrl1}}></Image>

                                            <View style={{height:scaleSize(108), display:'flex',flexDirection:'column',marginLeft:scaleSize(8)}}>
                                                <Text style={{fontSize:scaleSize(16),fontWeight:'500',color:'#000'}}>{item?.name}</Text>
                                                <Text style={{fontSize:scaleSize(14),fontWeight:'500',color:'#646464',marginTop:scaleSize(10)}}>{item?.description}</Text>

                                                <Text style={{fontWeight:'400',fontSize:scaleSize(14),color:'#000',marginTop:scaleSize(20)}}>￥{Number(item?.price).toFixed(2)}</Text>
                                                
                                                {
                                                    Number(item?.memberPrice)>0&&<View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                                                    <Text style={{fontWeight:'400',fontSize:scaleSize(14),color:'#DB090A'}}>￥{Number(item?.memberPrice).toFixed(2)}</Text>
                                                    <Image style={{width:scaleSize(69),height:scaleSize(16),marginLeft:scaleSize(10)}} source={images.vipPrice}></Image>
                                                </View>
                                                }
                                                

                                            </View>
                                        </View> 

                                        <View style={{width:scaleSize(360),height:scaleSize(236),backgroundColor:'#fff',paddingHorizontal:scaleSize(10),paddingTop:scaleSize(10)}}>
                                            {/* <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginBottom:scaleSize(13)}}>
                                                <Text style={{fontSize:scaleSize(14),color:'#646464'}}>颜色</Text>
                                                <Text style={{fontSize:scaleSize(14),color:'#323232'}}>蓝色</Text>
                                            </View>
                                            <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginBottom:scaleSize(13)}}>
                                                <Text style={{fontSize:scaleSize(14),color:'#646464'}}>尺寸</Text>
                                                <Text style={{fontSize:scaleSize(14),color:'#323232'}}>XXL</Text>
                                            </View> */}
                                            <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginBottom:scaleSize(13)}}>
                                                <Text style={{fontSize:scaleSize(14),color:'#646464'}}>数量</Text>
                                                <Text style={{fontSize:scaleSize(14),color:'#323232'}}>{item?.buyNums}</Text>
                                            </View>
                                            <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                                                <Text style={{fontSize:scaleSize(14),color:'#646464'}}>邮费</Text>
                                                <Text style={{fontSize:scaleSize(14),color:'#323232'}}>
                                                    {
                                                        item?.mailMethod == 1?'包邮':'￥'+ Number(item?.mailPrice).toFixed(2)
                                                    }
                                                </Text>
                                            </View>
                                            <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                                <Text style={{fontSize:scaleSize(14),color:'#646464'}}>备注</Text>
                                                <TextInput onChangeText={(e)=>{
                                                    this.setState({
                                                        remark:e
                                                    })
                                                }} style={{fontSize:scaleSize(14),color:'#323232'}} placeholder={'选填，请先与商家客服沟通一致'}></TextInput>
                                            </View>
                                            <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                                                <Text style={{fontSize:scaleSize(14),color:'#646464'}}>发票</Text>
                                                <TouchableOpacity style={{display:'flex',flexDirection:'row',alignItems:'center'}} onPress={()=>{
                                                    if(item?.invoice == 2 || item?.invoice == 3){  //可开发票
                                                        this.setState({
                                                            isInvoice:true,
                                                            invoiceList:[]
                                                        },()=>{
                                                            this.findUserInvoice();
                                                        })
                                                    }else{
                                                        Toast.message("该商品暂不支持开发票");

                                                    }
                                                }}>
                                                    {
                                                        this.state.invoice?<Text style={{fontSize:scaleSize(14),color:'#323232'}}>{this.state.invoice?.head}</Text>:<Text style={{fontSize:scaleSize(14),color:'#323232'}}>{this.state.invoice == 1 ?'不提供':'请输入发票信息'}</Text>

                                                    }
                                                    <Image style={{marginLeft:scaleSize(14),width:scaleSize(4),height:scaleSize(6.81)}} source={images.jiantou}></Image>
                                                </TouchableOpacity>
                                            </View>
                                            <Text style={{fontSize:scaleSize(14),color:'#DB090A',position:'absolute',right:10,bottom:70}}>小计: {Number(item?.goodsTotalPrice).toFixed(2)}</Text>
                                        </View>
                                  </View>
                                  
                        })
                    }
                    </ScrollView>

                    <View style={styles.confirmOrder}> 
                            <Text style={{fontSize:scaleSize(13),color:'#000',marginRight:scaleSize(5)}}>合计:</Text>
                            <Text style={{marginRight:scaleSize(19),fontSize:scaleSize(14),color:'#DB090A'}}>￥{Number(this.state.totalPrice).toFixed(2)}</Text>
                            <TouchableOpacity style={styles.confirmOrderButton} onPress={()=>this.addOrder()}>
                                <Text style={{fontSize:scaleSize(15),color:'#fff'}}>提交订单</Text>
                            </TouchableOpacity>
                    </View>
                </View>
    }

}


var styles = StyleSheet.create({

    address:{
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        borderRadius:scaleSize(4),
        width:scaleSize(359),
        height:scaleSize(89),
        backgroundColor:'#fff',
        marginTop:scaleSize(13),
        marginHorizontal:scaleSize(8),
    },

    addressIcon:{
        width:scaleSize(30),
        height:scaleSize(30),
        marginLeft:scaleSize(8),
        marginTop:scaleSize(10)
    },

    addressContent:{
        display:'flex',
        flexDirection:'column',
        marginTop:scaleSize(20),
        marginLeft:scaleSize(22)
    },

    jiantou:{
        width:scaleSize(6),
        height:scaleSize(10.23),
        position:'absolute',
        right:15,
        bottom:30
    },

    listRow:{
        width:scaleSize(360),
        height:scaleSize(350),
        backgroundColor:'#fff',
        paddingTop:scaleSize(11),
        marginHorizontal:scaleSize(8),
        marginTop:scaleSize(12),
        borderRadius:scaleSize(4),
        marginBottom:scaleSize(20)
    },

    goodsContent:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:scaleSize(10),
        paddingBottom:scaleSize(10),
        borderBottomWidth:2,
        borderBottomColor:'#F5F6FA'
    },

    fapiao:{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        top: scaleSize(64.5),
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 998
    },

    fapiaoContent:{
        width:'100%',
        height:scaleSize(465),
        backgroundColor:'#fff',
        position:'absolute',
        bottom:0,
        borderTopLeftRadius:scaleSize(20),
        borderTopRightRadius:scaleSize(20),
        paddingTop:scaleSize(12)
    },

    taitouContent:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        height:scaleSize(35),
        paddingHorizontal:scaleSize(13)
    },

    confirmOrder:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'flex-end',
        width:'100%',
        height:scaleSize(60),
        backgroundColor:'#fff',
        alignItems:'center',
        paddingHorizontal:scaleSize(10),
        position:'absolute',
        bottom:0
    },

    confirmOrderButton:{
        width:scaleSize(125),
        height:scaleSize(40),
        backgroundColor:'#DB090A',
        borderRadius:scaleSize(2), 
        alignItems:'center',
        justifyContent:'center'
    }


})