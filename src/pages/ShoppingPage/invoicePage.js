import React, { Component } from 'react'
import { Text, View, DeviceEventEmitter,TextInput,TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native'
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

export default class InvoicePage extends Component {
    constructor(props) {
		super(props);
		this.state = {
            invoiceList:[]
		};
	}

    componentDidMount(){
        DeviceEventEmitter.addListener("addInvoice",res=>{
            this.listView?.refresh()
        })
        
    }

    removeInvoice(value){
        UIConfirm.show('确定删除该发票?',()=>{
            Request.post(ApiUrl.GOODS_INVOICE_DELETE + value?.id).then(res => {
                if (res.status === 200) {
                    this.listView.refresh();
                }
            }).catch(err => console.log(err));
        })
    }

    async editInvoice(value){
        var user = await UserStore.getLoginUser();
        let data = {
            id:value?.id,
            defaultInvoice:0,
            clientUserId:user?.id
        }
        Request.post(ApiUrl.GOODS_INVOICE_EDIT,data).then(res => {
            if (res.status === 200) {
                this.listView.refresh();
            }
        }).catch(err => console.log(err));
    }

    async onFetch(page = 1, startFetch, abortFetch) {
        let user = await UserStore.getLoginUser();
		var pageSize = 5
        let data = {
            pd:{
                pageNum:page,
                pageSize:pageSize
            },
            clientUserId : user?.id
        }

		try {
            await Request.post(ApiUrl.GOODS_INVOICE_LIST,data).then(res => {
                if (res.status === 200) {
                    this.setState({ invoiceList: res?.data?.rows })
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

    render(){
        return <View style={{ flex: 1, backgroundColor: '#F5F6F8' }}>
                  <UINavBar title="我的发票" style={{marginBottom:scaleSize(10)}} rightView={
                    <TouchableOpacity
                    onPress={() =>{
                            RouteHelper.navigate("AddInvoicePage")
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
                            console.log(item);
                            return <View style={styles.listrow}>
                                <View style={styles.flexStart}>
                                    <Text>发票抬头</Text>
                                    <Text style={{marginLeft:scaleSize(21)}}>{item.head}</Text>
                                </View>
                                <View style={styles.flexStart}>
                                <Text>税号</Text>
                                    <Text style={{marginLeft:scaleSize(21)}}>{item.code}</Text>
                                </View>
                                <View style={{borderBottomWidth:1,borderBottomColor:'#E5E5E5',marginTop:scaleSize(8),marginBottom:scaleSize(15)}}></View>

                                <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginBottom:scaleSize(14)}}>
                                    <View style={[styles.flexStart,{alignItems:'center'}]}>
                                        {
                                            item?.defaultInvoice == 1?<TouchableOpacity onPress={()=>this.editInvoice(item)} >
                                                <Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.kongquan}></Image>
                                            </TouchableOpacity> :<Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.hongduigou}></Image>
                                        }

                                        <Text style={{color:'#DB090A',marginLeft:scaleSize(10)}}>默认抬头</Text>
                                    </View>
                                    <View style={[styles.flexStart,{alignItems:'center'}]}>
                                        <TouchableOpacity style={{display:'flex',flexDirection:'row',alignItems:'center'}} onPress={()=>{
                                                                        RouteHelper.navigate("AddInvoicePage",{value:item})
                                        }}>
                                            <Image style={{width:scaleSize(13),height:scaleSize(11.6),marginRight:scaleSize(7.19)}} source={images.qianbi}></Image>
                                            <Text style={{marginRight:scaleSize(18.11),color:'#828282'}}>编辑</Text>
                                        </TouchableOpacity>
   

                                        <TouchableOpacity style={{display:'flex',flexDirection:'row',alignItems:'center'}} onPress={()=>this.removeInvoice(item)}>
                                            <Image style={{width:scaleSize(13),height:scaleSize(13),marginRight:scaleSize(7.78)}} source={images.lajitong}></Image>
                                            <Text style={{marginRight:scaleSize(8.9),color:'#828282'}}>删除</Text>
                                        </TouchableOpacity>
                                      
                                    </View>
                                </View>
                    
                            </View>
						}} 
						displayDate
						emptyView={() => {
								return <View style={{ flex: 1, alignItems: 'center' }}>
                                    <Image style={{width:scaleSize(100),height:scaleSize(100),marginTop:scaleSize(140)}} source={images.meifapiao}></Image>
									<Text style={{
										fontSize: 14, color: "rgba(0,0,0,0.60)",
										marginTop: scaleSize(20),
										fontWeight: "400"
									}}>暂无发票抬头</Text>
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
        height:scaleSize(121),
        backgroundColor:'#fff',
        marginTop:scaleSize(12),
        borderRadius:scaleSize(4),
        paddingTop:scaleSize(14.6),
        paddingHorizontal:scaleSize(8)
    },

    flexStart:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'flex-start',
        marginBottom:scaleSize(10)
    }
    
  });