import React, { Component } from 'react'
import { Text, View,TextInput,TouchableOpacity,DeviceEventEmitter,Image, StyleSheet, ToastAndroid } from 'react-native'
import { UltimateListView } from 'react-native-ultimate-listview';
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import UIConfirm from '../../components/UIConfirm'
import Request from '../../api/Request'
import { ClientStatusEnum } from '../../global/constants'
import { scaleSize } from '../../global/utils'
import { UserStore } from '../../store/UserStore';
import ApiUrl from '../../api/Url';
import { Toast, ModalIndicator } from 'teaset';


export default class ShoppingCarPage extends Component {
    constructor(props) {
		super(props);
		this.state = {
            isDelete:false,
            jianhao:false,
            num:1,
            shoppingCarList:[],
            user:{},
            isAll:false,
            totalPrice:0,
            totalCount:0,
		};
	}

    async componentDidMount(){
        this.setState({
            user:await UserStore.getLoginUser()
        },()=>{
            console.log(this.state.user?.status);
        })

        DeviceEventEmitter.addListener("likeUpdated",res=>{
            this.listView&&this.listView.refresh();
        })
        
    }

    async onFetch(page = 1, startFetch, abortFetch) {
        let user = await UserStore.getLoginUser()
        this.setState({
            totalCount:0,
            totalPrice:0,
            isAll:false
        })
		var pageSize = 10
		try {
            let data = {
                pd:{
                    pageNum:page,
                    pageSize:pageSize
                },
                clientUserId:user?.id
            }
            await Request.post(ApiUrl.SHOPPING_CAR_LIST,data).then(res => {
                console.log(res);
                if (res.status === 200) {
                    this.setState({ shoppingCarList: res?.data?.rows })
                    if(Math.ceil(res.data.total / pageSize) >= page){
                        startFetch(this.state.shoppingCarList || [], pageSize);
                    }else{
                        startFetch([], pageSize);
                    }
                }
            }).catch(err => console.log(err));

		} catch (err) {
			abortFetch();
		}
	}

    addNum(item){
        if(item.attributes == ''){
            Toast.message("该商品没有库存");
            return;
        }
        let gtData = {
            goodsId:item?.goodsId
        }
        if(item.attributesIds.toString().indexOf("/") != -1){
            for(let i = 1; i<=item.attributesIds.split("/").length; i++){
                gtData["attributeId" + i] = item.attributesIds.split("/")[i-1];
            }
        }else{
            gtData.attributeId1 = item.attributesIds;
        }
        Request.post(ApiUrl.SHOPPING_GT,gtData).then(res => {
            if(res.status == 200){
                if(item?.nums == res.data){
                    Toast.message("库存不足");
                }else{
                    item.nums ++;
                    this.listView.updateDataSource(this.state.shoppingCarList);
                }
            }
        }).catch(err => console.log(err));
    }

    jisuan(type,item){
        //计算价格  1为增加 2为减少
        console.log(item);
        if(type == 1){
            //判断已认证
            if(this.state.user?.status == ClientStatusEnum.VERIFIED.code){
                if(Number(item?.goods?.memberPrice) != 0){
                    this.state.totalPrice += (Number(item?.goods?.memberPrice) * Number(item?.nums))
                    this.setState({
                        totalPrice: this.state.totalPrice
                    })
                }else{
                    this.state.totalPrice += (Number(item?.goods?.price) * Number(item?.nums))
                    this.setState({
                        totalPrice:this.state.totalPrice
                    })
                }
            }else{
                this.state.totalPrice += (Number(item?.goods?.price) * Number(item?.nums))
                this.setState({
                    totalPrice:this.state.totalPrice
                })
            }
        }else{
            //判断已认证
            if(this.state.user?.status == ClientStatusEnum.VERIFIED.code){
                if(Number(item?.goods?.memberPrice) != 0){
                    this.state.totalPrice -= (Number(item?.goods?.memberPrice) * Number(item?.nums))
                    this.setState({
                        totalPrice: this.state.totalPrice
                    })
                }else{
                    this.state.totalPrice -= (Number(item?.goods?.price) * Number(item?.nums))
                    this.setState({
                        totalPrice: this.state.totalPrice
                    })
                }
            }else{
                this.state.totalPrice -= (Number(item?.goods?.price) * Number(item?.nums))
                this.setState({
                    totalPrice: this.state.totalPrice
                })
            }
        }

    }

    goOrder(){
        if(this.state.totalCount == 0){
            Toast.message("请选择商品");
            return;
        }
        let goodsList = [];
        let shoppingCarIds = [];
        let xiajia = false;
        let wuhuo = false;
        this.state.shoppingCarList.map((item,index)=>{
            if(item?.isOnclick){
                // console.log(item);
                if(item?.goods?.status == 1){
                    xiajia = true;
                }
                if(item?.inventory == 0){
                    wuhuo = true;
                }
                 item.goods.attributes = item?.attributesIds
                 item.goods.buyNums = item?.nums
                 goodsList.push(item?.goods);
                 shoppingCarIds.push(item?.id);
                //  Request.post(ApiUrl.SHOPPING_CAR_DELETE + item?.id).then(res => {
                //     console.log(res);
                // }).catch(err => console.log(err));
            }
        })
        if(xiajia){
            Toast.message("选中的商品中有的已经下架,不能结算");
            return;
        }
        if(wuhuo){
            Toast.message("选中的商品中有的已无货,不能结算");
            return;
        }
         RouteHelper.navigate("DownOrderPage", { goodsList: goodsList,shoppingCarIds:shoppingCarIds})
    }

    deleteGoods(){
        UIConfirm.show("是否确认删除",()=>{
            let ids = [];
            this.state.shoppingCarList.map((item,i)=>{
                if(item.isOnclick){
                    ids.push(item.id);
                }
            })
            if(ids.length == 0){
                Toast.message("请选中要删除的商品");
                return;
            }else{
                let params = {
                    ids:ids.toString()
                }
                console.log(ApiUrl.SHOPPING_CAR_DELETE_IDS);
                 Request.post(ApiUrl.SHOPPING_CAR_DELETE_IDS,params).then(res => {
                     console.log(JSON.stringify(res.data));
                     if(res?.data?.code == 0){
                        Toast.message("删除成功");
                        this.listView&&this.listView.refresh();
                     }else{
                        Toast.message(res?.data?.msg);
                     }
                     return;
                }).catch(err => console.log(err));
                // Toast.message("删除成功");
                // return;
            }

        })
    }

    render(){
        return <View style={{flex:1, backgroundColor:'#F5F6F8'}}>
                    <UINavBar title="购物车" style={{marginBottom:scaleSize(10)}} 
                    rightView={
                        this.state.isDelete?<TouchableOpacity onPress={()=>{
                            this.setState({
                                isDelete:false
                            })
                        }}><Text style={{paddingRight:scaleSize(15),color:'#fff'}}>完成</Text></TouchableOpacity>:<TouchableOpacity
                            onPress={() =>{
                                this.setState({
                                    isDelete:true
                                })
                                // RouteHelper.navigate("ShoppingCarPage")
                            }}>
                            <Image   style={{
                                height: scaleSize(24),
                                width: scaleSize(24),
                                marginRight:scaleSize(10)
                            }} source={images.bchilun}></Image>
                            </TouchableOpacity>
                    }
                    />
                    <UltimateListView
                    allLoadedText={"没有更多了-上提进入下一分类"}
                    waitingSpinnerText={'加载中...'}
                    ref={ref => this.listView = ref}
                    onFetch={this.onFetch.bind(this)}
                    keyExtractor={(item, index) => `${index} -`}
                    item={(item, index)=>{
                        return <><View style={styles.listrow}>
                            <TouchableOpacity onPress={()=>{
                                if(item.isOnclick){
                                    item.isOnclick = false
                                    this.jisuan(2,item);
                                    this.state.totalCount--;
                                }else{
                                    item.isOnclick = true;
                                    this.state.totalCount++;
                                    //计算价格  1为增加 2为减少
                                    this.jisuan(1,item);
                                }
                                this.state.shoppingCarList.map((item1,index1)=>{
                                    if(index == index1){
                                        item1= item
                                    }
                                })
                                this.listView.updateDataSource(this.state.shoppingCarList);
                            }}>
                            {
                                item.isOnclick ? <Image style={styles.icon} source={images.hongduigou} />:<Image style={styles.icon} source={images.kongquan} />
                            }
                            </TouchableOpacity>
                            <Image style={styles.avatar} source={{uri:ApiUrl.GOODS_IMAGE + item?.goods?.pictureUrl1}}></Image>
                            <View style={styles.content}>
                                <Text numberOfLines={1} style={{fontSize:scaleSize(14),width:scaleSize(220)}}>{item?.goods?.name}</Text>
                                <TouchableOpacity style={[styles.flexCenter,{justifyContent:'space-between',width:scaleSize(212),backgroundColor:'#F5F6F8'}]}>
                                    <Text style={{width:scaleSize(200)}}>{item.attributes}</Text>
                                    {/* <Image style={{width:scaleSize(8),height:scaleSize(6.81)}} source={images.xiajiantou}></Image> */}
                                </TouchableOpacity>

                                <View style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                                    {
                                        this.state.user?.status == ClientStatusEnum.VERIFIED.code?<>
                                        {
                                          Number(item?.goods?.memberPrice) == 0?<Text style={{fontSize:14,color:'#DB090A',width:scaleSize(75),}}>￥{Number(item?.goods?.price).toFixed(2)}</Text>:<><Text style={{fontSize:14,color:'#DB090A',width:scaleSize(75)}}>￥{Number(item?.goods?.memberPrice).toFixed(2)}</Text>
                                          </>
                                        }
                                        </>:<><Text style={{width:scaleSize(75), fontSize:14,color:'#DB090A'}}>￥{Number(item?.goods?.price).toFixed(2)}</Text><Image style={{width:scaleSize(69),height:scaleSize(16)}} ></Image></>
                                    }

                                    {
                                        item?.nums==1?<Image style={{marginLeft:scaleSize(15),width:scaleSize(8.52),height:scaleSize(1.22)}} source={images.huijianhao}></Image>:<TouchableOpacity onPress={()=>{
                                            if(item.isOnclick){
                                                Toast.message("请先取消选中在增减数量");
                                                return;
                                            }
                                            item.nums --;
                                            this.listView.updateDataSource(this.state.shoppingCarList);

                                            // this.jisuan(2,item);
                                        }} style={{width:scaleSize(10),marginLeft:scaleSize(15),height:scaleSize(10),display:'flex',justifyContent:'center'}}><Image style={{width:scaleSize(8.52),height:scaleSize(1.22)}} source={images.heijianhao}></Image>
                                            </TouchableOpacity>
                                    }
                                     <TextInput
                                        style={styles.title}
                                        editable={false}
                                        onChangeText={text => this.setState({num: text})}>
                                        {item?.nums}
                                    </TextInput>
                                    <TouchableOpacity onPress={()=>{
                                        if(item.isOnclick){
                                            Toast.message("请先取消选中在增减数量");
                                            return;
                                        }
                                        this.addNum(item);
                                    
                                        // this.jisuan(1,item);
                                    }}>
                                         <Image style={{width:scaleSize(18),height:scaleSize(18)}} source={images.jiahao}></Image>
                                    </TouchableOpacity>
                                </View>


                                { 
                                this.state.user?.status == ClientStatusEnum.VERIFIED.code&&<>
                                        {
                                          Number(item?.goods?.memberPrice) == 0?null:<Image style={{marginLeft:scaleSize(10),
                                            width:scaleSize(69),height:scaleSize(16)}} source={images.vipPrice}></Image>
                                        }
                                        </>
                                }
                            </View>
                            
                            {   
                                item?.goods?.status == 1 ? <Image style={{width:scaleSize(70),height:scaleSize(70),position: 'absolute',left: 300,right: 45,top: '15%',bottom: '0.33%'}} source={images.yixiajia}></Image>:item?.inventory == 0 && <Image style={{width:scaleSize(70),height:scaleSize(70),position: 'absolute',left: 300,right: 45,top: '15%',bottom: '0.33%'}} source={images.wuhuo}></Image>
                            }
                        </View>
                                    </>
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
                    }} />




            <View style={{width:'100%',height:scaleSize(55),backgroundColor:'#fff', position:'absolute',bottom:0}}>
                <View style={[styles.flexCenter,{justifyContent:'space-between',paddingLeft:scaleSize(39),paddingRight:scaleSize(10), paddingTop:scaleSize(11)}]}>
                    <TouchableOpacity style={styles.flexCenter} onPress={()=>{
                        let asd = this.state.isAll;
                        // if(this.state.isAll){
                        //     this.setState({
                        //         isAll:false
                        //     })
                        // }else{
                        //     this.setState({
                        //         isAll:true
                        //     })
                        // }
                        this.state.shoppingCarList.map((item,index)=>{

                            if(asd == false){
                                item.isOnclick = true
                                this.setState({
                                    totalPrice:0,
                                    totalCount:this.state.shoppingCarList.length,
                                    goodsList:[]
                                },()=>{
                                    this.jisuan(1,item);
                                })
                            }else{
                                item.isOnclick = false
                                this.setState({
                                    totalPrice:0,
                                    totalCount:0,
                                    goodsList:[]
                                })
                                // this.jisuan(2,item);

                            }
                        })
                        if(asd == false){
                            this.setState({
                                isAll:true
                            })
                        }else{
                            this.setState({
                                isAll:false
                            }) 
                        }
                        this.setState({
                            shoppingCarList:this.state.shoppingCarList
                        })
                        this.listView.updateDataSource(this.state.shoppingCarList);

                    }}>
                        {
                            this.state.isAll?<Image style={{width:scaleSize(17),height:scaleSize(17)}} source={images.hongduigou} />:<Image style={{width:scaleSize(17),height:scaleSize(17)}} source={images.kongquan} />

                        }
                        <Text style={{marginLeft:scaleSize(10)}}>全选</Text>
                    </TouchableOpacity>


                     {
                         this.state.isDelete?<>
                            <View style={styles.flexCloumn}></View>
                            <TouchableOpacity style={{width:scaleSize(92),height:scaleSize(35),borderRadius:scaleSize(22),  backgroundColor:'#DB090A',justifyContent:'center',alignItems:'center'}} onPress={()=>this.deleteGoods()}>
                                <Text style={{color:'#fff'}}>删除</Text>
                            </TouchableOpacity>
                         </>:<>
                            <View style={styles.flexCloumn}>
                                <Text style={{color:'#DB090A',fontSize:12,fontWeight:'400'}}>合计 : {Number(this.state.totalPrice).toFixed(2)}</Text>
                                <Text style={{color:'#828282',fontSize:10,fontWeight:'400'}}>不含邮费</Text>
                            </View>
                            
                            <TouchableOpacity style={{width:scaleSize(92),height:scaleSize(35),borderRadius:scaleSize(22),backgroundColor:'#DB090A',justifyContent:'center',alignItems:'center'}} onPress={()=>this.goOrder()}>
                                <Text style={{color:'#fff'}}>结算({this.state.totalCount})</Text>
                            </TouchableOpacity>
                         </>
                     }   

                    
                </View>
                
            </View>

        </View>
    }

}

var styles = StyleSheet.create({

    listrow: {
        display:'flex',
        flexDirection: 'row',
        alignItems:'center',
        backgroundColor:'#fff',
        height: scaleSize(126),
        marginBottom:scaleSize(15),
        paddingHorizontal: scaleSize(15),
        position:'relative'
    },
    icon:{
        width:scaleSize(16),
        height:scaleSize(16),
    },
    avatar:{
        width:scaleSize(95),
        height:scaleSize(95),
        marginLeft:scaleSize(10),
    },
    content:{
        marginLeft:scaleSize(10),
        display:'flex',
        flexDirection:'column',
        height:scaleSize(95),
        justifyContent:'space-between'
    },  
    title: {
      marginLeft:scaleSize(11.33),
      fontSize: scaleSize(14),
      fontWeight:'400',
      color: '#111A34',
    },
    flexCenter:{
        display:'flex',
        flexDirection: 'row',
        alignItems:'center',
    },
    flexCloumn:{
        display:'flex',
        flexDirection: 'column',
        alignItems:'center',
    },
  });
  