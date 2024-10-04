import React, { Component } from 'react'
import { Text, View,TouchableOpacity, Image, StyleSheet, ScrollView,DeviceEventEmitter} from 'react-native'
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
import Textarea from '../../components/UITextarea'
import LinearGradinet from 'react-native-linear-gradient';


export default class AddEvaPage extends Component {

    constructor(props) {
		super(props);
		this.state = {
            starArray:[{url:images.star},{url:images.star},{url:images.star},{url:images.star},{url:images.star}],
            starNum:0,
            orderId:props?.orderId,
            content:'',
            order:{}
		};
	}

    componentDidMount(){
        this.findOrderData();
    }

    
    findOrderData(){
        Request.post(ApiUrl.GOODS_ORDER_BYID + this.state?.orderId).then(res => {
            console.log(res.data);
            this.setState({
                order:res?.data 
            })
        }).catch(err => console.log(err));
    }

    clickStar(item,index){
        let starList = this.state.starArray;
        for(let o = 0; o < starList.length; o++){
            starList[o].url = images.star
        }
        this.setState({
            starArray:starList
        })
        if(index != 0){
            for(let i=0;i<=index;i++){
                starList[i].url = images.yellowStar
            }
            this.setState({
                starArray:starList,
                starNum: index+1
            })
        }else{
            starList[index].url = images.yellowStar
            this.setState({
                starArray:starList,
                starNum: index+1
            })
        }
    }

    async addEva(){
        let content = this.state.content;
        if(content == ''){
            content = "此用户没有填写评价"
        }
        if(this.state.starNum == 0){
            Toast.message("请星级评价");
            return; 
        }
        let user = await UserStore.getLoginUser();
        let data = {
            goodsOrderId:this.state.order?.id,
            goodsId:this.state.order?.goods?.id,
            clientUserId:user?.id,
            comments:content,
            star:this.state.starNum,
            status:0
        }
        await Request.post(ApiUrl.ADD_EVA,data).then(res => {
            if(res.data.code == 0){
                let orderData = {
                    id:this.state.order?.id,
                    goodsOrderStatus:6
                }
                Request.post(ApiUrl.GOODS_ORDER_EDIT, orderData).then(res => {
                    console.log(res.data.code);
                    if(res?.data?.code == 0){
                        Toast.message("评价成功成功");
                        DeviceEventEmitter.emit("addEva");
                        RouteHelper.navigate("OrderPage",{status:0});
                    }
                }).catch(err => console.log(err));
            };
           
        }).catch(err => console.log(err));
        console.log(this.state.starNum);
    }

    render(){
        const {order} = this.state;
        return <View style={{flex:1,backgroundColor:'#F5F6F8'}}>
                    <UINavBar title="发表评价"/>
                    <View style={{width:'100%',height:scaleSize(130),backgroundColor:'#fff',padding:scaleSize(10)}}>
                        <View style={{display:'flex',flexDirection:'row'}}>
                            <Image style={{width:scaleSize(110),height:scaleSize(110),borderRadius:scaleSize(4)}} source={{uri:ApiUrl.GOODS_IMAGE + order?.goods?.pictureUrl1}}></Image>
                            <View style={{display:'flex',flexDirection:'column',justifyContent:'space-between',width:scaleSize(235),marginLeft:scaleSize(10)}}>
                                <Text style={{fontSize:scaleSize(16),fontWeight:'bold'}}>{order?.name}</Text>
                                <Text numberOfLines={3}  style={{fontSize:scaleSize(14),color:'#646464'}}>{order?.goods?.description}</Text>
                                <Text></Text>
                            </View>
                        </View>
                    </View>

                    <View style={{width:'100%',height:scaleSize(246),backgroundColor:'#fff',marginTop:scaleSize(16)}}>
                        <Textarea maxLength={50} onChangeText={(e)=>this.setState({
                            content:e 
                        })} containerStyle={{padding:scaleSize(10),borderBottomWidth:scaleSize(1),borderBottomColor:'#e0e0e0'}} placeholder={'商品满足你的期待吗？说说你的评价吧'}></Textarea>

                        <Text style={{fontSize:scaleSize(16),fontWeight:'600',marginLeft:scaleSize(11),marginTop:scaleSize(12)}}>星级评价</Text>

                        <View style={{width:'100%',display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                            {
                                this.state.starArray?.map((item,index)=>{
                                    return <TouchableOpacity onPress={()=>this.clickStar(item,index)}>
                                                <Image style={{width:scaleSize(40),height:scaleSize(40),marginRight:scaleSize(10)}} source={item?.url}></Image>
                                    </TouchableOpacity>
                                })
                            }
                        </View>

                    </View>

                    <TouchableOpacity onPress={()=>this.addEva()}>
                        <LinearGradinet start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#FD9566', '#FD6260']}
                            style={{
                                height: scaleSize(45),
                                width: scaleSize(180),
                                marginLeft:scaleSize(97.5),
                                marginTop:scaleSize(100),
                                display: 'flex',
                                flexDirection: 'row',
                                backgroundColor: PRIMARY_COLOR,
                                alignItems: 'center', borderRadius: scaleSize(49),
                                justifyContent: 'center',
                            }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                                发布评价
                            </Text>
                        </LinearGradinet>
                    </TouchableOpacity>
        </View>
    }

}