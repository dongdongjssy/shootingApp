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
import UIConfirm from '../../components/UIConfirm';


export default class ReceivingAddressPage extends Component {

    constructor(props) {
		super(props);
		this.state = {
            addressList:[],
            isOrder:props?.isOrder
		};
	}

    async componentDidMount() {
        DeviceEventEmitter.addListener("addAddress",res=>{
            this.listView?.refresh()
        })
    }

    async onFetch(page = 1, startFetch, abortFetch) {
        var user = await UserStore.getLoginUser();
		var pageSize = 10
        let data = {
            pd:{
                pageNum:page,
                pageSize:pageSize
            },
            clientUserId : user.id
        }

		try {
            await Request.post(ApiUrl.GOODS_ADDRESS_LIST,data).then(res => {
                if (res.status === 200) {
                    console.log(res);
                    this.setState({ addressList: res?.data?.rows })
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


    async getList(data){

    }

    onclickList(value){
        if(this.state.isOrder){
            DeviceEventEmitter.emit("moren",{addressInfo:value});
            RouteHelper.goBack();
        }
    }

    async updateDefultAddress(value){
        var user = await UserStore.getLoginUser();
        let data = {
            id:value?.id,
            defaultAddress:0,
            clientUserId:user?.id
        }
        Request.post(ApiUrl.GOODS_ADDRESS_UPDATE,data).then(res => {
            if (res.status === 200) {
                this.listView.refresh();
            }
        }).catch(err => console.log(err));
    }

    deleteAddress(value){
        UIConfirm.show('确定删除该地址?',()=>{
            Request.post(ApiUrl.GOODS_ADDRESS_DELETE + value?.id).then(res => {
                if (res.status === 200) {
                    this.listView.refresh();
                }
            }).catch(err => console.log(err));
        })
    }

    render(){
        return <View style={{ flex: 1,backgroundColor:'#F5F6F8' }}>
                <UINavBar title="我的收货地址" style={{marginBottom:scaleSize(10)}} rightView={
                    <TouchableOpacity
                    onPress={() =>{
                            RouteHelper.navigate("AddReceivingAddressPage")
                    }}>
                        <Text style={{color:'#fff',marginRight:scaleSize(15)}}>添加</Text>
                    </TouchableOpacity>}
                />

                
            <UltimateListView 
						allLoadedText={"没有更多了"}
						waitingSpinnerText={'加载中...'}
						ref={ref => this.listView = ref}
						onFetch={this.onFetch.bind(this)}
						keyExtractor={(item, index) => `${index} -`}
						item={(item, index)=>{
                            return <TouchableOpacity style={styles.listrow} onPress={()=>this.onclickList(item)}>
                                <View style={styles.flexStart}>
                                    <Text>{item.name}</Text>
                                    <Text style={{marginLeft:scaleSize(21)}}>{item.phone}</Text>
                                </View>
                                <Text style={{marginTop:scaleSize(10.4),color:'#4F4F4F'}}>{item.address}</Text>
                                <View style={{borderBottomWidth:1,borderBottomColor:'#E5E5E5',marginTop:scaleSize(8),marginBottom:scaleSize(15)}}></View>

                                <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginBottom:scaleSize(14)}}>
                                    <View style={[styles.flexStart,{alignItems:'center'}]}>
                                        {
                                            item?.defaultAddress == 1?<TouchableOpacity onPress={()=>this.updateDefultAddress(item)}>
                                                <Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.kongquan}></Image>
                                            </TouchableOpacity> :<Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.hongduigou}></Image>
                                        }

                                        <Text style={{color:'#DB090A',marginLeft:scaleSize(10)}}>默认地址</Text>
                                    </View>
                                    <View style={[styles.flexStart,{alignItems:'center'}]}>
                                        <TouchableOpacity style={{display:'flex',flexDirection:'row',alignItems:'center'}} onPress={()=>{
                                            RouteHelper.navigate("AddReceivingAddressPage",{value:item})
                                        }}>
                                            <Image style={{width:scaleSize(13),height:scaleSize(13),marginRight:scaleSize(7.19)}} source={images.qianbi}></Image>
                                            <Text style={{marginRight:scaleSize(18.11),color:'#828282'}}>编辑</Text>
                                        </TouchableOpacity>
   

                                        <TouchableOpacity style={{display:'flex',flexDirection:'row',alignItems:'center'}} onPress={()=>this.deleteAddress(item)}>
                                            <Image style={{width:scaleSize(13),height:scaleSize(13),marginRight:scaleSize(7.78)}} source={images.lajitong}></Image>
                                            <Text style={{marginRight:scaleSize(8.9),color:'#828282'}}>删除</Text>
                                        </TouchableOpacity>
                                      
                                    </View>
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
									}}>暂无收货地址</Text>
								</View>
						}}
					/>

        </View>
    }

}


var styles = StyleSheet.create({
    listrow: {
        display:'flex',
        flexDirection:'column',
        marginHorizontal:scaleSize(9),
        height:scaleSize(135),
        backgroundColor:'#fff',
        marginTop:scaleSize(12),
        borderRadius:scaleSize(4),
        paddingTop:scaleSize(14.6),
        paddingHorizontal:scaleSize(8),
    },

    flexStart:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'flex-start'
    }
    
  });