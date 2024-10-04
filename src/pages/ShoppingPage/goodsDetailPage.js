import React, { Component, useState, useEffect } from 'react'
import { Text, View, DeviceEventEmitter, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
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
import WebViewHtmlView from '../../components/WebViewHtmlView';
import { renderTimeStamp, renderTimeDuration } from '../../global/DateTimeUtils';
import { backgroundColor } from '../../libs/react-native-calendars/style';
// iPhoneX
const X_WIDTH = 375;
const X_HEIGHT = 812;

// screen
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class GoodsDetailPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goods: {},
            goodsId: props?.goodsId,
            lluser:props?.lluser,
            carouselList: [],
            //当前选择
            nowSelect: null,
            //购买选择参数弹窗
            isBuy: false,
            //弹窗数量
            toastNum: 1,
            //评价总数
            evaCount: 0,
            //评价列表 2个
            evaList: [],
            //星星数组
            starArray: [images.star, images.star, images.star, images.star, images.star],
            aa:0,
            bb:0,
            dataArr:[]
        };
    }

    componentDidMount() {
        this.getGoods(this.state.goodsId);
        this.getBannerList();
        this.getEvaluationList();
        this.getGoodsAttribute();
    }

    //获取商品属性
    getGoodsAttribute(){
        let data = {
            goodsId:this.state.goodsId
        }
        Request.post(ApiUrl.GOODS_ATTRIBUTE_BYGOODSID, data).then(res => {
            //   console.log("我们要做=" + JSON.stringify(res));
            // let dataList = [];
            // for(let key in res.data){
            //     let data={
            //         name:key,
            //         item:res.data[key]
            //     }
            //     dataList.push(data);
            // }
            let dataArr=[]
          for (let index = 0; index < res.data.length; index++) {
                  dataArr.push('')
          }
            this.setState({
                attributeList:res.data,
                dataArr
            })
            // if (res?.data?.code == 0) {
            //     this.setState({
            //         evaCount: res?.data?.total,
            //         evaList: res?.data?.rows
            //     })
            // }
        }).catch(err => console.log(err));
    }
    //获取评价
    getEvaluationList() {
        let data = {
            pd: {
                pageSize: 2,
                pageNum: 1,
            },
            goodsId:this.state.goodsId
        }
        Request.post(ApiUrl.EVA_LIST, data).then(res => {
            if (res?.data?.code == 0) {
                this.setState({
                    evaCount: res?.data?.total,
                    evaList: res?.data?.rows
                })
            }
        }).catch(err => console.log(err));
    }

    //获取商品
    getGoods(id) {
        Request.post(ApiUrl.GOODS_DETAIL + id).then(res => {
            this.setState({ goods: res?.data }, () => {
                this.getBannerList();
            })
        }).catch(err => console.log(err));
    }

    //获取轮播图
    getBannerList() {
        let list = [];
        let carouselData = {};
        if (this.state.goods?.pictureUrl1) {
            carouselData.mediaUrl = this.state.goods?.pictureUrl1
            carouselData.goodsType = 2
            list.push(carouselData);
            carouselData = {};
        }
        if (this.state.goods?.pictureUrl2) {
            carouselData.mediaUrl = this.state.goods?.pictureUrl2
            carouselData.goodsType = 2
            list.push(carouselData);
            carouselData = {};
        }
        if (this.state.goods?.pictureUrl3) {
            carouselData.mediaUrl = this.state.goods?.pictureUrl3
            carouselData.goodsType = 2
            list.push(carouselData);
            carouselData = {};
        }
        if (this.state.goods?.pictureUrl4) {
            carouselData.mediaUrl = this.state.goods?.pictureUrl4
            carouselData.goodsType = 2
            list.push(carouselData);
            carouselData = {};
        }
        if (this.state.goods?.pictureUrl5) {
            carouselData.mediaUrl = this.state.goods?.pictureUrl5
            carouselData.goodsType = 2
            list.push(carouselData);
            carouselData = {};
        }
        if (this.state.goods?.pictureUrl6) {
            carouselData.mediaUrl = this.state.goods?.pictureUrl6
            carouselData.goodsType = 2
            list.push(carouselData);
            carouselData = {};
        }
        if (this.state.goods?.pictureUrl7) {
            carouselData.mediaUrl = this.state.goods?.pictureUrl7
            carouselData.goodsType = 2
            list.push(carouselData);
            carouselData = {};
        }
        if (this.state.goods?.pictureUrl8) {
            carouselData.mediaUrl = this.state.goods?.pictureUrl8
            carouselData.goodsType = 2
            list.push(carouselData);
            carouselData = {};
        }
        if (this.state.goods?.pictureUrl9) {
            carouselData.mediaUrl = this.state.goods?.pictureUrl9
            carouselData.goodsType = 2
            list.push(carouselData);
            carouselData = {};
        }

        this.setState({
            carouselList: list
        })
    }

    buy() {
        this.setState({
            isBuy: true
        })
    }

    //加数量时验证库存是否满足
    addNum(){
        let count = 0;
        let attributeData = "";
        for(let i in this.state.attributeList){
            for(let o in this.state.attributeList[i]?.item){
                if(this.state.attributeList[i]?.item[o].color == 'red'){
                    count ++;
                    if(attributeData == ""){
                        attributeData = this.state.attributeList[i]?.item[o].id
                    }else{
                        attributeData = attributeData + "/" +this.state.attributeList[i]?.item[o].id
                    }
                }
            }
        }
        if(count == this.state.attributeList.length){
            let gtData={
                goodsId:this.state.goods?.id,
            }    
            if(attributeData.toString().indexOf("/") != -1){
                for(let i = 1; i<=attributeData.split("/").length; i++){
                    gtData["attributeId" + i] = attributeData.split("/")[i-1];
                }
            }else{
                gtData.attributeId1 = attributeData;
            }

            Request.post(ApiUrl.SHOPPING_GT,gtData).then(res => {
                console.log("加数量的时候目前选中数 = " + this.state.toastNum)
                console.log("加数量的时候目前库存数 = " + res.data);
                if(res.status == 200){
                    if(Number(res?.data)<=0){
                        Toast.message("库存不足");
                        return;
                    }
                    if(this.state.toastNum == res.data){
                        Toast.message("库存不足");
                        return;
                    }else{
                        this.setState({
                            toastNum: Number(this.state.toastNum) + 1
                        })
                    }
                }
            }).catch(err => console.log(err));
        }else{
            Toast.message("请选择属性");
            return;
        }
    }

    //跳下单
    goOrder() {
        let count = 0;
        let attributeData = "";
        for(let i in this.state.attributeList){
            for(let o in this.state.attributeList[i]?.item){
                if(this.state.attributeList[i]?.item[o].color == 'red'){
                    count ++;
                    if(attributeData == ""){
                        attributeData = this.state.attributeList[i]?.item[o].id
                    }else{
                        attributeData = attributeData + "/" +this.state.attributeList[i]?.item[o].id
                    }
                }
            }
        }
        if(count == this.state.attributeList.length){
            let data = [];
            this.state.goods.attributes = attributeData;
            this.state.goods.buyNums = this.state.toastNum;
            this.setState({
                goods:this.state.goods
            })
            data.push(this.state.goods)

            if(this.state.goods.attributes == null || this.state.goods.attributes == '' || this.state.goods.attributes == undefined){
                Toast.message("该商品暂无库存,不能下单");
                return;
            }

            let gtData={
                goodsId:this.state.goods?.id,
            }    
            if(attributeData.toString().indexOf("/") != -1){
                for(let i = 1; i<=attributeData.split("/").length; i++){
                    gtData["attributeId" + i] = attributeData.split("/")[i-1];
                }
            }else{
                gtData.attributeId1 = attributeData;
            }

            Request.post(ApiUrl.SHOPPING_GT,gtData).then(res => {
                if(res.status == 200){
                    if(Number(res?.data)<=0){
                        Toast.message("库存不足");
                        return;
                    }
                    if(this.state.toastNum > res.data){
                        Toast.message("库存不足");
                        return;
                    }else{
                        RouteHelper.navigate("DownOrderPage", { goodsList: data })
                    }
                }
            }).catch(err => console.log(err));

            // RouteHelper.navigate("DownOrderPage", { goodsList: data })

        }else{
            Toast.message("请选择属性");
            return;
        }
        

    }

    //跳购物车
    async goShoppingCar() {
        let count = 0;
        let attributeData = "";
        for(let i in this.state.attributeList){
            for(let o in this.state.attributeList[i]?.item){
                if(this.state.attributeList[i]?.item[o].color == 'red'){
                    count ++;
                    if(attributeData == ""){
                        attributeData = this.state.attributeList[i]?.item[o].id
                    }else{
                        attributeData = attributeData + "/" +this.state.attributeList[i]?.item[o].id
                    }
                }
            }
        }
        if(count == this.state.attributeList.length){
            if(attributeData == null || attributeData == '' || attributeData == undefined){
                Toast.message("该商品暂无库存,不能加入购物车");
                return;
            }
            let gtData={
                goodsId:this.state.goods?.id,
            }    
            if(attributeData.toString().indexOf("/") != -1){
                for(let i = 1; i<=attributeData.split("/").length; i++){
                    gtData["attributeId" + i] = attributeData.split("/")[i-1];
                }
            }else{
                gtData.attributeId1 = attributeData;
            }

            Request.post(ApiUrl.SHOPPING_GT,gtData).then(res => {
                if(res.status == 200){
                    if(Number(res?.data)<=0){
                        Toast.message("库存不足");
                        return;
                    }
                    if(this.state.toastNum > res.data){
                        Toast.message("库存不足");
                        return;
                    }else{
                        //新增购物车
                        let data={
                            clientUserId: this.state.lluser?.id,
                            goodsId:this.state.goods?.id,
                            nums:this.state.toastNum,
                            inventory:res?.data,
                            status:0,
                            attributes:attributeData
                        }
                        Request.post(ApiUrl.SHOPPING_CAR_ADD,data).then(res => {
                            if(res.data.code == 0){
                                Toast.message("加入购物车成功");
                                this.setState({
                                    isBuy: false
                                })
                                RouteHelper.navigate("ShoppingCarPage")
                            }
                        }).catch(err => console.log(err));
                    }
                }
            }).catch(err => console.log(err));

        }else{
            Toast.message("请选择属性");
            return;
        }
    {
}
    }


    evaList(item) {
        
        return <View style={{ width: '100%', marginTop: scaleSize(15), paddingHorizontal: scaleSize(34) }}>
            <View style={styles.flexCenter}>
                <Image style={{ width: scaleSize(25), height: scaleSize(25), marginTop: scaleSize(10), borderRadius: scaleSize(25 / 2) }} 
                source={item?.clientUser?.avatar ?
                    { uri: Url.CLIENT_USER_IMAGE + item?.clientUser?.avatar } :
                    images.login.login_logo
                }></Image>

                <Text style={{ fontSize: scaleSize(12), fontWeight: '400', color: '#323232', marginTop: scaleSize(10), marginLeft: scaleSize(10) }}>{item?.clientUser?.nickname}</Text>
                <Text style={{ fontSize: scaleSize(12), fontWeight: '400', color: '#999999', marginTop: scaleSize(10), marginLeft: scaleSize(10) }}>{renderTimeDuration(item?.createTime)}</Text>
            </View>

            <View style={styles.flexCenter}>
                <Start sta={item?.star} />
            </View>

            <Text style={{ marginTop: scaleSize(8), marginBottom: scaleSize(10.5) }}>{item?.comments}</Text>
        </View>
    }

    start(sta) {
        for (let index = 0; index < 5; index++) {
            if (index <= sta) {
                return <Image style={{ width: scaleSize(14.1), height: scaleSize(13.5), marginTop: scaleSize(10) }} source={images.yellowStar}></Image>
            } else {
                return <Image style={{ width: scaleSize(14.1), height: scaleSize(13.5), marginTop: scaleSize(10) }} source={images.star}></Image>
            }
        }

    }

    render() {
        return <View style={{flex:1, backgroundColor: '#F5F6F8' }}>
            <UINavBar title="详情" rightView={
           <TouchableOpacity
           onPress={() =>{
                RouteHelper.navigate("ShoppingCarPage")
           }}>
           <Image   style={{
             height: scaleSize(24),
             width: scaleSize(24),
             marginRight:scaleSize(10)
           }} source={images.shoppingCar}></Image>
         </TouchableOpacity>
        }/>
            {
                this.state.isBuy && <View style={styles.tanchuang}>
                    <View  style={styles.ztanchuang}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                            <Image style={{ width: scaleSize(85), height: scaleSize(85) }} source={{ uri: ApiUrl.GOODS_IMAGE + this.state.goods?.pictureUrl1 }}></Image>

                            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                <Text style={{ fontSize: scaleSize(14),width:scaleSize(200), fontWeight: '400', color: '#000', marginLeft: scaleSize(12) }} numberOfLines={2}>{this.state.goods?.name}</Text>
                                <Text style={{ fontSize: scaleSize(12), fontWeight: '400', color: '#000', marginLeft: scaleSize(12), marginTop: scaleSize(25) }}>￥{Number(this.state.goods?.price).toFixed(2)}</Text>
                                {
                                    Number(this.state.goods?.memberPrice) > 0&&<View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', fontSize: scaleSize(12), fontWeight: '400', color: '#000', marginLeft: scaleSize(12), marginTop: scaleSize(3) }}>
                                    <Text style={{ color: '#DB090A' }}>￥{Number(this.state.goods?.memberPrice).toFixed(2)}</Text>
                                    <Image style={{ width: scaleSize(69), height: scaleSize(16),marginLeft:scaleSize(5)}} source={images.vipPrice}></Image>
                                </View>
                                }

                            </View>
                            <TouchableOpacity style={{ width: scaleSize(15), height: scaleSize(15), position: 'absolute', right: 0 }} onPress={() => { this.setState({ isBuy: false }) }}>
                                <Image source={images.cha} style={{ width: scaleSize(15), height: scaleSize(15), position: 'absolute', right: 0 }} />
                            </TouchableOpacity>
                        </View>

                        {/* 动态属性 */}
                        <View style={{height:scaleSize(230)}}>
                        <ScrollView  style={{marginTop: scaleSize(17), backgroundColor: '#fff', }}>
                            {
                                this.state.attributeList?.map((itm,inx)=>{
                                    return <><Text style={{ fontSize: scaleSize(14) , fontWeight: '400' }}>{itm?.name}</Text>
                                    <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: scaleSize(10) }}>
                                        {
                                            itm?.item?.map((iitm,iinx)=>{
                                               
                                                return <TouchableOpacity onPress={(()=>{
                                                    let dataArr=this.state.dataArr
                                                    if(inx==0){
                                                        for(let i in itm?.item){
                                                            itm.item[i].color = 'white';
                                                        }
                                                        iitm.color = 'red'
                                                        dataArr[inx]=iitm.name
                                                        this.setState({
                                                            attributeList:this.state.attributeList,
                                                            dataArr,
                                                            toastNum:1
                                                        })
                                                    }else{
                                                        if(dataArr[inx-1]!=''){
                                                            for(let i in itm?.item){
                                                                itm.item[i].color = 'white';
                                                            }
                                                            iitm.color = 'red'
                                                            dataArr[inx]=iitm.name
                                                            this.setState({
                                                                attributeList:this.state.attributeList,
                                                                dataArr,
                                                                toastNum:1
                                                            })
                                                        }
                                                    }
                                                  
                                                 
                                                })} style={{ height: scaleSize(29), backgroundColor: iitm.color == 'red'? '#FFDAA3':'#f6f6f6', borderRadius: scaleSize(4), marginRight: scaleSize(16), paddingHorizontal: scaleSize(26), justifyContent: 'center', marginBottom: scaleSize(14) }}>
                                                <Text>{iitm?.name}</Text>
                                            </TouchableOpacity>
                                            })
                                        }
                                    </View></>

                                })
                            }

                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: scaleSize(10), alignItems: 'center' }}>
                                <Text style={{ fontSize: scaleSize(14), fontWeight: '400' }}>数量</Text>
                                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

                                    <TouchableOpacity style={{ height: scaleSize(24), alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                        if (Number(this.state.toastNum) > 1) {
                                            this.setState({
                                                toastNum: Number(this.state.toastNum) - 1
                                            })
                                        }

                                    }}>
                                        <Image style={{ width: scaleSize(11.36), height: scaleSize(1.62) }} source={Number(this.state.toastNum) <= 1 ? images.huijianhao : images.heijianhao}></Image>
                                    </TouchableOpacity>



                                    <TextInput style={{ width: scaleSize(60), height: scaleSize(38), marginLeft: scaleSize(10), backgroundColor: '#f6f6f6', textAlign: 'center',color:'#000', fontSize: scaleSize(14) }} value={`${this.state.toastNum}`} editable={false} ></TextInput>

                                    <TouchableOpacity onPress={() => {
                                        this.addNum()
                                    }}>
                                        <Image style={{ width: scaleSize(24), height: scaleSize(24), marginLeft: scaleSize(10) }} source={images.jiahao}></Image>
                                    </TouchableOpacity>

                                </View>

                            </View>
                        </ScrollView>
                        </View>

                        <View style={{ width: scaleSize(375), height: scaleSize(75), backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',position: 'absolute',bottom: 10}}>
                            <View style={styles.flexCenter}>
                                <TouchableOpacity onPress={() => this.goShoppingCar()} style={{ width: scaleSize(170), height: scaleSize(40), backgroundColor: '#F4B75D', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: scaleSize(4),borderTopLeftRadius:scaleSize(50),borderBottomLeftRadius:scaleSize(50) }}>
                                    <Text style={{ color: '#fff' }}>加入购物车</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.goOrder()} style={{ width: scaleSize(170), height: scaleSize(40), backgroundColor: '#DB090A', justifyContent: 'center', alignItems: 'center', borderTopRightRadius: scaleSize(4),borderTopRightRadius:scaleSize(50),borderBottomRightRadius:scaleSize(50) }}>
                                    <Text style={{ color: '#fff' }}>立即购买</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            }
            <ScrollView>
                    <HeaderCarousel carouselList={this.state.carouselList} isGoodsDetail={true}/>
                <View style={{ backgroundColor: '#fff' }}>
                    {
                        this.state.goods?.price && <Text style={{ marginLeft: scaleSize(8), fontSize: scaleSize(18), fontWeight: '400', color: '#4F4F4F', marginTop: scaleSize(8) }}>￥{Number(this.state.goods?.price).toFixed(2)}</Text>
                    }

                    {
                        Number(this.state.goods?.memberPrice) > 0 && <View style={{ display: 'flex', flexDirection: 'row', width: '100%', height: scaleSize(22.69), alignItems: 'center'}}>
                            <Text style={{fontSize: scaleSize(24), marginLeft: scaleSize(8), marginTop: scaleSize(5.31), fontWeight: '600', color: '#DB090A' }}>￥{Number(this.state.goods?.memberPrice).toFixed(2)}</Text>
                            <Image style={{ width: scaleSize(69), height: scaleSize(16),marginLeft:scaleSize(10) }} source={images.vipPrice}></Image>
                        </View>
                    }


                    <Text style={{ marginLeft: scaleSize(10), fontSize: scaleSize(18), fontWeight: '600', marginTop: scaleSize(15), color: '#000' }}>{this.state.goods?.name}</Text>
                    <Text style={{ marginLeft: scaleSize(10), fontSize: scaleSize(12), fontWeight: '400', marginTop: scaleSize(9), marginBottom: scaleSize(15), color: '#646464' }}>{this.state.goods?.description}</Text>
                </View>

                <View style={{ backgroundColor: '#fff', marginTop: scaleSize(11) }}>
                    <TouchableOpacity onPress={() => {
                        this.buy()
                    }}>
                        <View style={styles.listrow2}>
                            <View style={styles.flexCenter}>
                                <Image style={styles.icon} source={images.xuanze}></Image>
                                <Text style={styles.title}>购买选择</Text>
                            </View>
                            <View style={styles.flexCenter}>
                                <Text style={[styles.title2, { width: scaleSize(150) }]} numberOfLines={1}>{this.state.nowSelect}</Text>
                                <Image style={styles.icon2} source={images.jiantou}></Image>
                            </View>

                        </View>
                    </TouchableOpacity>

                    <View style={styles.listrow2}>
                        <View style={styles.flexCenter}>
                            <Image style={styles.icon} source={images.youfei}></Image>
                            <Text style={styles.title}>邮费</Text>
                        </View>
                        <Text style={styles.title2}>{this.state.goods?.mailMethod == 1 ? '包邮' : '不包邮'}</Text>
                    </View>

                    <View style={styles.listrow2}>
                        <View style={styles.flexCenter}>
                            <Image style={styles.icon} source={images.sftgfp}></Image>
                            <Text style={styles.title}>发票</Text>
                        </View>
                        {
                           this.state.goods?.invoice == 1 && <Text style={styles.title2}>{'不提供'}</Text>
                        }
                        {
                           this.state.goods?.invoice == 2 && <Text style={styles.title2}>{'提供普票'}</Text>
                        }
                        {
                           this.state.goods?.invoice == 3 && <Text style={styles.title2}>{'提供收据'}</Text>
                        }
                        {
                           this.state.goods?.invoice == 4 && <Text style={styles.title2}>{'提供专票'}</Text>
                        }
                    </View>
                </View>

                {/* 动态评价 */}
                <View style={{ backgroundColor: '#fff', marginTop: scaleSize(11) }}>
                    <TouchableOpacity onPress={() => {
                        RouteHelper.navigate('EvaListPage',{goodsId:this.state.goodsId})
                    }}>
                        <View style={styles.listrow2}>
                            <View style={styles.flexCenter}>
                                <Image style={styles.icon} source={images.pingjia}></Image>
                                <Text style={styles.title}>评价({this.state?.evaCount})</Text>
                            </View>
                            <View style={styles.flexCenter}>
                                <Text style={styles.title2Block}>{'查看全部'}</Text>
                                <Image style={styles.icon2} source={images.jiantou}></Image>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* 动态评价内容 */}
                    {
                        this.state.evaList?.map((ii, index) => {
                            console.log("qweqe=" + JSON.stringify(ii));
                            return <>{this.evaList(ii)}</>;

                        })
                    }

                </View>
                {/* 详情 */}
                <View style={{ backgroundColor: '#fff', marginTop: scaleSize(11) }}>
                    <View style={styles.listrow3}>
                        <Image style={styles.icon} source={images.detail}></Image>
                        <Text style={styles.title}>详情</Text>
                    </View>
                </View>
                
                <View style={{ flex: 1, marginBottom: scaleSize(100), paddingHorizontal: scaleSize(20), paddingBottom: scaleSize(70) }}>
                    <WebViewHtmlView
                        content={this.state.goods?.comments}
                    />
                </View>

            </ScrollView>

            <View style={{ width: '100%', height: scaleSize(75), backgroundColor: '#fff',position: 'absolute', bottom: 0, borderTopWidth:1,borderTopColor:'#E2E4EA'}}>
                <View style={[styles.flexCenter, { justifyContent: 'space-between', paddingLeft: scaleSize(39), paddingRight: scaleSize(10), paddingTop: scaleSize(11) }]}>
                    <TouchableOpacity onPress={async()=>{
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
                    <View style={styles.flexCenter}>
                        <TouchableOpacity onPress={() => this.buy()} style={{ width: scaleSize(125), height: scaleSize(40), backgroundColor: '#F4B75D', justifyContent: 'center', alignItems: 'center',borderTopLeftRadius:scaleSize(50),borderBottomLeftRadius:scaleSize(50) }}>
                            <Text style={{ color: '#fff' }}>加入购物车</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.buy()} style={{ width: scaleSize(125), height: scaleSize(40), backgroundColor: '#DB090A', justifyContent: 'center', alignItems: 'center',borderTopRightRadius:scaleSize(50),borderBottomRightRadius:scaleSize(50) }}>
                            <Text style={{ color: '#fff' }}>立即购买</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        </View>
    }

}
const Start = ({ sta }) => {
    const arrLisy = [1,2,3,4,5]
    return arrLisy.map((item,index)=>{
        if(sta<index+1){
            return<Image style={{ width: scaleSize(14.1), height: scaleSize(13.5), marginTop: scaleSize(10) }} source={images.star}></Image>
        }else{
            return  <Image style={{ width: scaleSize(14.1), height: scaleSize(13.5), marginTop: scaleSize(10) }} source={images.yellowStar}></Image>
            
        }
    })
}
var styles = StyleSheet.create({
    listrow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderBottomWidth: 1,
        justifyContent: 'space-around',
        borderColor: '#E2E4EA',
        minHeight: scaleSize(55),
    },
    listrow2: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#E2E4EA',
        height: scaleSize(55),
        paddingHorizontal: scaleSize(15)
    },

    listrow3: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: scaleSize(15),
        minHeight: scaleSize(55),
    },
    icon: {
        width: scaleSize(17),
        height: scaleSize(17),
    },
    icon2: {
        marginLeft: scaleSize(10),
        width: scaleSize(7),
        height: scaleSize(12),
    },
    title: {
        marginLeft: scaleSize(11.33),
        fontSize: scaleSize(14),
        fontWeight: '400',
        color: '#111A34',
    },
    title2: {
        fontSize: scaleSize(14),
        fontWeight: '400',
        color: '#DB090A',
    },
    title2Block: {
        fontSize: scaleSize(14),
        fontWeight: '400',
        color: '#323232',
    },

    flexCenter: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    tanchuang: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: '100%',
        height: '100%',
        zIndex: 1000,
        display:'flex',
        justifyContent:'flex-end',
        position:'absolute',


    },
    ztanchuang: {
        width: '100%',
        height: scaleSize(423),
        borderTopLeftRadius: scaleSize(20),
        borderTopRightRadius: scaleSize(20),
        backgroundColor: '#fff',
        zIndex:1001,
        paddingHorizontal: scaleSize(15), 
        paddingTop: scaleSize(15.5),
        overflow:'scroll',
    }

});
