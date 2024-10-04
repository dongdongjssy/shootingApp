import React, { Component } from 'react'
import { Text, View, TouchableOpacity, Image, StyleSheet, Keyboard, DeviceEventEmitter } from 'react-native'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import { scaleSize } from '../../global/utils'
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import Request from '../../api/Request';
import Url from '../../api/Url';
import { UserStore } from '../../store/UserStore';
import { Toast, ModalIndicator, Overlay } from 'teaset';
import { RouteHelper } from 'react-navigation-easy-helper'


export default class AddInvoicePage extends Component {
    constructor(props) {
		super(props);
		this.state = {
            isEdit:false,
            value:props?.value,
            invoiceType:null,
            head:null,
            code:null,
            bank:null,
            bankAccount:null,
            address:null,
            phone:null,
            defaultInvoice:null
		};
	}

    componentDidMount(){
        if (this.state.value) {
            this.setState
              ({
                isEdit: true,
                invoiceType: this.state.value?.invoiceType,
                head: this.state.value?.head,
                code: this.state.value?.code,
                bank: this.state.value?.bank,
                bankAccount: this.state.value?.bankAccount,
                address: this.state.value?.address,
                phone: this.state.value?.phone,
                defaultInvoice: this.state.value?.defaultInvoice,
              });
          }
    }

    addInvoice = async() => {
        let user = await UserStore.getLoginUser();
        if(this.state.invoiceType == null){
            Toast.message("请选择发票类型");
            return;
        }
        if(this.state.head == null){
            Toast.message("发票抬头不能为空");
            return;
        }
        if(this.state.code == null){
            Toast.message("税号不能为空");
            return;
        }
        //编辑
        if(this.state.isEdit){
            await Request.post(Url.GOODS_INVOICE_EDIT, { 
                id: this.state.value?.id,
                invoiceType:this.state.invoiceType,
                clientUserId: user?.id,
                head: this.state.head,
                code: this.state.code,
                bank: this.state.bank,
                bankAccount: this.state.bankAccount,
                address: this.state.address,
                phone: this.state.phone,
                defaultInvoice: this.state.defaultInvoice,
              }).then(res => {
                if (res.status === 200) {
                  Toast.message("修改发票抬头成功");
                  DeviceEventEmitter.emit("addInvoice");
                  RouteHelper.goBack();
                }
              }).catch(err => console.debug(err));
        }else{ //新增
            await Request.post(Url.GOODS_INVOICE_ADD, { 
                clientUserId: user?.id,
                invoiceType:this.state.invoiceType,
                head: this.state.head,
                code: this.state.code,
                bank: this.state.bank,
                bankAccount: this.state.bankAccount,
                address: this.state.address,
                phone: this.state.phone,
                defaultInvoice: this.state.defaultInvoice,
              }).then(res => {
                  console.log(res);
                if (res.status === 200) {
                  Toast.message("添加发票抬头成功");
                  DeviceEventEmitter.emit("addInvoice");
                  RouteHelper.goBack();
                }
              }).catch(err => console.debug(err));
        }
    }

    render(){
        return<View style={{ flex: 1, backgroundColor: '#F5F6F8' }}>
                  <UINavBar title={this.state.isEdit ? "修改发票抬头" : "添加发票抬头"} style={{ marginBottom: scaleSize(10) }} />
                  <ScrollView>
                  <View style={styles.one}>
                      <View style={styles.content}>
                          <Text>发票类型</Text>
                          <View style={styles.flexCenter}>
                              <TouchableOpacity style={styles.flexCenter} onPress={()=>{this.setState({invoiceType:0})}}>
                                  {
                                      this.state.invoiceType == 0?<Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.hongduigou}></Image>:<Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.kongquan}></Image>
                                  }
                                <Text style={{marginRight:scaleSize(34),marginLeft:scaleSize(10)}}>个人</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.flexCenter} onPress={()=>{this.setState({invoiceType:1})}}>
                                 {
                                      this.state.invoiceType == 1?<Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.hongduigou}></Image>:<Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.kongquan}></Image>
                                  }
                                <Text style={{marginLeft:scaleSize(10)}}>企业</Text>
                              </TouchableOpacity>
                          </View>
                      </View>
                      <TouchableOpacity style={[styles.content,{alignItems:'center'}]}>
                          <Text>发票抬头</Text>
                          <TextInput style={{width:scaleSize(205),height:scaleSize(60),textAlign:'right'}} placeholder={'开票抬头名称'} onChangeText={(e)=>{this.setState({
                              head:e
                          })}} value={this.state?.head}></TextInput>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.content,{alignItems:'center',marginTop:0}]} >
                          <Text>税号</Text>
                          <TextInput style={{width:scaleSize(205),height:scaleSize(60),textAlign:'right'}} placeholder={'专票请输入税号,其他请填0'} onChangeText={(e)=>{this.setState({
                              code:e
                          })}} value={this.state?.code}></TextInput>
                      </TouchableOpacity>
                  </View>

                  <View style={styles.two}>
                      <TouchableOpacity style={[styles.content,{alignItems:'center'}]}>
                          <Text>开户银行</Text>
                          <TextInput style={{width:scaleSize(185),textAlign:'right'}} placeholder={'选填'} onChangeText={(e)=>{this.setState({
                              bank:e
                          })}} value={this.state?.bank}></TextInput>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.content,{alignItems:'center'}]}>
                          <Text>银行账号</Text>
                          <TextInput style={{width:scaleSize(185),textAlign:'right'}} placeholder={'选填'} onChangeText={(e)=>{this.setState({
                              bankAccount:e
                          })}} value={this.state?.bankAccount}></TextInput>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.content,{alignItems:'center'}]}>
                          <Text>企业地址</Text>
                          <TextInput style={{width:scaleSize(185),textAlign:'right'}} placeholder={'选填'} onChangeText={(e)=>{this.setState({
                              address:e
                          })}} value={this.state?.address}></TextInput>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.content,{alignItems:'center'}]}>
                          <Text>企业电话</Text>
                          <TextInput style={{width:scaleSize(185),textAlign:'right'}} placeholder={'选填'} onChangeText={(e)=>{this.setState({
                              phone:e
                          })}} value={this.state?.phone}></TextInput>
                      </TouchableOpacity>
                  </View>

                  <View style={styles.two}>
                      <TouchableOpacity style={[styles.content,{alignItems:'center'}]}>
                          <Text>设为默认抬头</Text>
                          <View style={styles.flexCenter}>
                              <TouchableOpacity style={styles.flexCenter} onPress={()=>{
                                  if(this.state.defaultInvoice == null){
                                        this.setState({
                                            defaultInvoice:0
                                        })
                                  }else{
                                      if(this.state.defaultInvoice == 1){
                                        this.setState({
                                            defaultInvoice:0
                                        })
                                      }else{
                                        this.setState({
                                            defaultInvoice:1
                                        })
                                      }
                                  }
                              }}>
                                  {
                                      this.state?.defaultInvoice==0?<Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.hongduigou}></Image>:<Image style={{width:scaleSize(16),height:scaleSize(16)}} source={images.kongquan}></Image>

                                  }
                                <Text style={{marginLeft:scaleSize(10)}}>是</Text>
                              </TouchableOpacity>
                          </View>
                      </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.buttonStyle} onPress={()=>this.addInvoice()} >
                      <Text style={{fontSize:scaleSize(15), color:'#fff',textAlign:'center'}}>{this.state.isEdit?'保存修改':'确认添加'}</Text>
                  </TouchableOpacity>
                  </ScrollView>
        </View>
    }
}

var styles = StyleSheet.create({
    one: {
        width:scaleSize(360),
        marginLeft:scaleSize(7.5),
        backgroundColor:'#fff',
        borderRadius:scaleSize(4),
        paddingBottom:scaleSize(10)
    },
    two: {
        width:scaleSize(360),
        marginLeft:scaleSize(7.5),
        backgroundColor:'#fff',
        borderRadius:scaleSize(4),
        paddingBottom:scaleSize(10),
        marginTop:scaleSize(15)
    },
    content: {
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        marginTop:scaleSize(15),
        paddingHorizontal:scaleSize(11)
    },

    flexCenter:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    buttonStyle:{
        width:scaleSize(360),
        marginLeft:scaleSize(7.5),
        height:scaleSize(54),
        backgroundColor:'#DB090A',
        borderRadius:scaleSize(2),
        justifyContent:'center',
        display: 'flex',
        alignItems: 'center', 
        marginTop: scaleSize(50)
    }
  });