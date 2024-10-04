import React, { Component } from 'react'
import { Text, View, DeviceEventEmitter, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
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


export default class ShoppingPage extends Component {
    constructor(props) {
		super(props);
		this.state = {
			carouselList: [],
            titleList:[],
            fixedFilter:false,
            shoppingList:[],
		};
	}

    async componentDidMount() {
    }

    //查类别
    findTitle(){
        Request.post(ApiUrl.SHOPPING_TITLE,{}).then(res => {
            console.log(res);
            this.setState({
                titleList:res?.data?.rows
            })
        }).catch(err => console.log(err));
    }

    //查轮播图
    findBanner(){
        let data = {
            pd:{
                pageSize:5,
                pageNum:1
            },
            status:0
        }
        Request.post(ApiUrl.SHOPPING_BANNER,data).then(res => {
            res?.data?.rows.map((item,index)=>{
                item.goodsType = 1
            })
            this.setState({
                carouselList:res?.data?.rows
            })
        }).catch(err => console.log(err));
    }

    renderFilter() {
		return (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{height:scaleSize(55),marginBottom:scaleSize(-20), width: '100%'}}>
                			<View style={{
                                    alignItems: 'center',
                                    flexDirection: "row",
                                    height: scaleSize(35),
                                    marginVertical: scaleSize(10),
                                    justifyContent: 'space-between',
                                    // flex:1
                                }}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            // width: scaleSize(170),
                                            padding: scaleSize(8),
                                            margin: "auto",
                                            height: scaleSize(35)
                                        }}
                                    >
                                        <TouchableOpacity onPress={()=>{
                                            this.setState({
                                                goodsTypeId: null
                                                },()=>{
                                                    this.listView&&this.listView.refresh();
                                                })
                                        }}>
                                                <Text style={{ color: this.state.goodsTypeId == null?"red":"#323232", fontSize: 14, fontWeight: "400" }}>
                                                {'全部'}
                                            </Text>
                                        </TouchableOpacity>
                                        {
                                            this.state.titleList.map((item,index)=>{
                                                return <TouchableOpacity style={{marginLeft:scaleSize(25)}} onPress={()=>{
                                                    this.setState({
                                                        goodsTypeId: item?.id
                                                    },()=>{
                                                        this.listView&&this.listView.refresh();
                                                    })
                                                }}>
                                                    <Text style={{ color: item.id == this.state.goodsTypeId?"red":"#323232", fontSize: 14, fontWeight: "400" }}>
                                                        {item?.name}
                                                    </Text>
                                                </TouchableOpacity>

                                            })
                                        }
                                
                                    </View>
                                </View>
            </ScrollView>

		)
	}

    async onFetch(page = 1, startFetch, abortFetch) {
        this.findBanner();
        this.findTitle();
		var pageSize = 10
		try {
            let data = {
                pd:{
                    pageNum:page,
                    pageSize:pageSize
                },
                goodsTypeId:this.state?.goodsTypeId
            }
            await Request.post(ApiUrl.SHOPPING_LIST,data).then(res => {
                if (res.status === 200) {
                    console.log(res);
                    this.setState({ shoppingList: res?.data?.rows })
                    if(Math.ceil(res.data.total / pageSize) >= page){
                        startFetch(res?.data?.rows || [], pageSize);
                    }else{
                        startFetch([], pageSize);
                    }
                }
            }).catch(err => console.log(err));

		} catch (err) {
			abortFetch();
		}
	}


    renderHeader(){
        return <View>
                {
                    this.state.carouselList.length > 0?<View style={{ paddingBottom:scaleSize(10) }}>
                    <HeaderCarousel carouselList={this.state.carouselList} />
                    {this.renderFilter()}
                    </View>:<View style={{ padding: scaleSize(10) }}>
                    {this.renderFilter()}
                    </View>
                }
        </View>
    }
    
    render(){
        return <View style={{ flex: 1 }}>
        <UINavBar title="商城"  leftView={null} rightView={
            <View style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
           <TouchableOpacity
           onPress={() =>{
                RouteHelper.navigate("ShoppingCarPage")
           }}>
           <Image   style={{
             height: scaleSize(24),
             width: scaleSize(24),
             marginRight:scaleSize(20)
           }} source={images.shoppingCar}></Image>
         </TouchableOpacity>
        <TouchableOpacity
        onPress={() =>{
            RouteHelper.navigate("OrderPage",{status:0})
        }}>
        <Image   style={{
            marginTop:scaleSize(5),
            height: scaleSize(24),
            width: scaleSize(24),
            marginRight:scaleSize(10)
        }} source={images.dingdan}></Image>
        </TouchableOpacity>
        </View>
        }/>

 
        <View style={{ backgroundColor: "#F2F6F9", flex: 1 }}>
        {this.state.fixedFilter ? <View style={{ padding: scaleSize(10) }}>
						{this.renderFilter()}
					</View> : null}	

            <UltimateListView 
            	        header={() => {
                            return this.renderHeader();
						 }}
                        numColumns ={2}
						onScroll={(e) => {
							var scroll_y = e.nativeEvent.contentOffset.y;
							var hh = 156;
							if (scaleSize(scroll_y) >= scaleSize(hh) + scaleSize(20)) {
								this.setState({
									fixedFilter: true,
								})
							} else {
								this.setState({
									fixedFilter: false,
								})
							}
						}}
						allLoadedText={"没有更多了"}
						waitingSpinnerText={'加载中...'}
						ref={ref => this.listView = ref}
						onFetch={this.onFetch.bind(this)}
						keyExtractor={(item, index) => `${index} -`}
						item={(item, index)=>{
                            return<TouchableOpacity style={{width:'46.5%',height:scaleSize(290),backgroundColor:'#fff',marginLeft:(index%2 ==0) ?scaleSize(10):scaleSize(6),marginTop:scaleSize(10)}} onPress={async()=>{
                                RouteHelper.navigate("GoodsDetailPage", {goodsId:item?.id,lluser:await UserStore.getLoginUser()})
                             }}>
                            <View>
                                <Image style={{height:scaleSize(161.46),width:scaleSize(175)}} source={{uri: ApiUrl.GOODS_IMAGE + item?.pictureUrl1}}></Image>
                                <Text style={{fontSize:scaleSize(13),marginLeft:scaleSize(10.26),marginTop:scaleSize(5.31),fontWeight:'400',color:'#000000',height:scaleSize(40)}} numberOfLines={2}>{item?.name}</Text>
                                <Text numberOfLines={1} style={{fontSize:scaleSize(12),marginLeft:scaleSize(10.26),marginTop:scaleSize(5.31),color:'#646464'}}>{item?.description}</Text>
                                <Text style={{fontSize:scaleSize(14),marginLeft:scaleSize(10.26),marginTop:scaleSize(5.31),color:'#333333'}}>￥{Number(item?.price).toFixed(2)}</Text>

                                {
                                    Number(item.memberPrice)>0&& <View style={{display:'flex',flexDirection:'row',width:'100%', flexWrap:'wrap',height:scaleSize(22.69),alignItems:'center'}}>
                                    <Text style={{width:'40%',fontSize:scaleSize(14),marginLeft:scaleSize(10.26),marginTop:scaleSize(5.31),color:'#DB090A'}}>￥{Number(item?.memberPrice).toFixed(2)}</Text>
                                    <Image style={{width:scaleSize(69),height:scaleSize(16)}} source={images.vipPrice}></Image>
                                    </View>
                                }

                               
                            </View>
                            </TouchableOpacity> 

						}} 
						displayDate
						emptyView={() => {
								return <View style={{ flex: 1, alignItems: 'center' }}>
									<Text style={{
										fontSize: 14, color: "rgba(0,0,0,0.60)",
										marginTop: scaleSize(100),
										fontWeight: "400"
									}}>暂无商品</Text>
								</View>
						}}
					/>
            </View>
  
    </View>
    }
}