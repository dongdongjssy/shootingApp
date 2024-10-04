import React, { Component } from 'react'
import { Text, View, TouchableOpacity, Image, StyleSheet, Keyboard, DeviceEventEmitter } from 'react-native'
import { images } from '../../res/images'
import UINavBar from '../../components/UINavBar'
import store from '../../store'
import { scaleSize } from '../../global/utils'
import { TextInput } from 'react-native-gesture-handler';
import Textarea from '../../components/UITextarea';
import UISelect from '../../components/UISelect';
import cityData from './city.json';
import Picker from 'react-native-picker';
import Request from '../../api/Request';
import Url from '../../api/Url';
import { UserStore } from '../../store/UserStore';
import { Toast, ModalIndicator, Overlay } from 'teaset';
import { RouteHelper } from 'react-navigation-easy-helper'

export default class AddReceivingAddressPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      areaCode: '',
      value: props?.value,
      name: null,
      phone: null,
      isEdit: false,
      cityList: [],
      userCity:'',
      companyAreaArray:[],
      address: ''
    };
  }

  async componentDidMount() {
    if (this.state.value) {
      this.setState
        ({
          isEdit: true,
          name: this.state.value?.name,
          phone: this.state.value?.phone,
          address: this.state.value?.address,
          areaCode: this.state.value?.areaNumber,
          userCity: this.state.value?.province +'-'+ this.state.value?.city +'-'+ this.state.value?.area
        });
    }

  }

  _createAreaData = () => {
    let data = [];
    let len = cityData.length;
    for (let i = 0; i < len; i++) {
      let city = [];
      for (let j = 0, cityLen = cityData[i]['city'].length; j < cityLen; j++) {
        let _city = {};
        _city[cityData[i]['city'][j]['name']] = cityData[i]['city'][j]['area'];
        city.push(_city);
      }

      let _data = {};
      _data[cityData[i]['name']] = city;
      data.push(_data);
    }
    return data;
  }

  _companyAreaClickAction = () => {
    Keyboard.dismiss();
    this.setState({ isShowMengCeng: true })
    Picker.init({
      pickerData: this._createAreaData(),
      selectedValue: this.state.companyAreaArray,
      pickerConfirmBtnText: '确认',
      pickerCancelBtnText: '取消',
      pickerConfirmBtnColor: [70, 123, 237, 1],
      pickerCancelBtnColor: [144, 144, 144, 1],
      pickerTitleColor: [51, 51, 51, 1],
      pickerToolBarBg: [255, 255, 255, 1],
      pickerToolBarFontSize: 15,
      pickerBg: [245, 245, 245, 1],
      pickerFontColor: [48, 48, 48, 1],
      pickerFontSize: 17,
      pickerRowHeight: 48,
      pickerTitleText: '选择城市',
      onPickerConfirm: data => {
        this.setState({
          companyAreaArray: data,
          userCity: data.join('-'),
          isShowMengCeng: false,
        })
      },
      onPickerCancel: data => {
        this.setState({ isShowMengCeng: false })
      },
    });
    Picker.show();
  }

  addAddress = async () => {
    if(this.state.name == null){
      Toast.message("收货人不能为空");
      return;
    }
    if(this.state.phone == null){
      Toast.message("手机号不能为空");
      return;
    }
    if(this.state.areaCode == null || this.state.areaCode == ''){
      this.setState({
        areaCode:'+86'
      })
      // Toast.message("手机区号不能为空");
      // return;
    }
    if(this.state.userCity == null || this.state.userCity == ''){
      Toast.message("地区不能为空");
      return;
    }
    if(this.state.address == null || this.state.address == ''){
      Toast.message("详细地址不能为空");
      return;
    }

    var user = await UserStore.getLoginUser();
    if(this.state.value){
      await Request.post(Url.GOODS_ADDRESS_EDIT, { 
        id: this.state.value.id,
        clientUserId: user.id,
        name: this.state.name,
        phone: this.state.phone,
        areaNumber: this.state.areaCode,
        province: this.state.userCity.split("-")[0],
        city: this.state.userCity.split("-")[1],
        area: this.state.userCity.split("-")[2],
        address: this.state.address,
      }).then(res => {
        if (res.status === 200) {
          Toast.message("编辑收货地址成功");
          DeviceEventEmitter.emit("addAddress");
          RouteHelper.goBack();
        }
      }).catch(err => console.debug(err));
    }else{
      await Request.post(Url.GOODS_ADDRESS_ADD, { 
        clientUserId: user.id,
        name: this.state.name,
        phone: this.state.phone,
        areaNumber: this.state.areaCode,
        province: this.state.userCity.split("-")[0],
        city: this.state.userCity.split("-")[1],
        area: this.state.userCity.split("-")[2],
        address: this.state.address,
        defaultAddress:1,
      }).then(res => {
        if (res.status === 200) {
          Toast.message("新增收货地址成功");
          DeviceEventEmitter.emit("addAddress");
          RouteHelper.goBack();
        }
      }).catch(err => console.debug(err));
    }
    


  }

  render() {
    return <View style={{ flex: 1, backgroundColor: '#F5F6F8' }}>
      <UINavBar title={this.state.isEdit ? "修改收货地址" : "添加收货地址"} style={{ marginBottom: scaleSize(10) }} />
      <TouchableOpacity style={styles.listrow}>
        <Text style={{ color: '#323232', fontSize: scaleSize(12), fontWeight: '400' }}>收货人</Text>
        <TextInput 
        style={{ width: scaleSize(250), marginLeft: scaleSize(30) }} 
        placeholder={'名字'} 
        value={this.state.name}
        onChangeText={text => this.setState({ name: text })}></TextInput>
      </TouchableOpacity>

      <View style={styles.listrow}>
        <Text style={{ color: '#323232', fontSize: scaleSize(12), fontWeight: '400' }}>手机号</Text>
        <TextInput 
        style={{ width: scaleSize(220), marginLeft: scaleSize(30) }} 
        placeholder={'手机号'} 
        value={this.state.phone}
        onChangeText={text => this.setState({ phone: text })}></TextInput>
        <Text style={{ width: scaleSize(60), height: scaleSize(50), lineHeight: scaleSize(50) }} onPress={() => {
          UISelect.show([{ title: "中国", code: '+86' }, { title: "中国香港", code: '+852' }, { title: "中国澳门", code: '+853' }, { title: "中国台湾", code: '+886' }], {
            title: '区号', onPress: (item) => {
              this.setState({
                areaCode: item.code
              })
              UISelect.hide();
            }
          })
        }}>{this.state.areaCode || '中国'}</Text>
        <Image
          style={{
            height: scaleSize(13),
            width: scaleSize(7),
            right: scaleSize(16),
            position: 'absolute',
          }}
          source={images.common.arrow_right2}
        />
      </View>

      <TouchableOpacity
        onPress={() => {
          this._companyAreaClickAction()
        }}
        style={styles.listrow}>
        <Text style={{ color: '#323232', fontSize: scaleSize(12), fontWeight: '400' }}>选择地区</Text>
        <View
          style={{
            alignItems: 'flex-start',
            flex: 1,
            justifyContent: 'center',
          }}>
          <Text style={{ marginLeft: scaleSize(20) }}>
              {this.state.userCity}
          </Text>
          <Image
            style={{
              height: scaleSize(13),
              width: scaleSize(7),
              right: scaleSize(16),
              position: 'absolute',
            }}
            source={images.common.arrow_right2}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.listrow, { alignItems: 'flex-start', marginTop: scaleSize(7), height: scaleSize(100) }]}>
        <Text style={{ color: '#323232', fontSize: scaleSize(12), fontWeight: '400', marginTop: scaleSize(10) }}>详细地址</Text>
        <Textarea 
        style={{ width: scaleSize(270), height: scaleSize(200), marginLeft: scaleSize(18) }} 
        placeholder={'请输入详细地址'}
        value={this.state.address}
        onChangeText={text => this.setState({ address: text })}></Textarea>
      </TouchableOpacity>


      <TouchableOpacity style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: scaleSize(200) }} onPress={()=>this.addAddress()}>
        <View style={{ width: scaleSize(359), height: scaleSize(54), backgroundColor: '#DB090A' }}>
          <Text style={{ fontSize: scaleSize(15), fontWeight: '400', color: '#fff', lineHeight: scaleSize(54), textAlign: 'center' }}>
            {this.state.value ? '修改地址' : '保存地址'}  
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  }


}

var styles = StyleSheet.create({
  listrow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: scaleSize(18),
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
    height: scaleSize(50)
  },
  title: {
    fontSize: 16,
    color: '#111A34',
  },
});