import React, { Component } from 'react'
import { View, Image, Text, TouchableOpacity, ScrollView, TextInput, ImageBackground, DeviceEventEmitter } from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { images } from '../../res/images'
import { Toast, ModalIndicator } from 'teaset'
import UINavBar from '../../components/UINavBar'
import ImagePicker from 'react-native-image-picker'
import store from '../../store'
import Url from '../../api/Url'
import { ClientStatusEnum } from '../../global/constants'
import { scaleSize } from '../../global/utils'
import UICitySelect from '../../components/UICitySelect';

export default class DynamicDetailPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			realName: "",
			idNumber: "",
			idFront: "",
			idBack: "",
			status: "",
			isFrontUploading: false,
			isBackUploading: false,
			submitForm: new FormData(),
			age: "",
			city: {
				id: null,
				title: ""
			},
			cspaNumber: "",
			loginUser: undefined,
			areaList: []
		}

		this.user = this.props.navigation.state.params.user

		this.pickId = this.pickId.bind(this)
		this.submitId = this.submitId.bind(this)
	}

	async componentDidMount() {
		this.state.loginUser = await store.UserStore.getLoginUser()

		this.state.submitForm.append("userId", this.user.id)
		this.state.status = this.user.status
		this.forceUpdate()

		// 获取地区列表
		const areas = await store.AppStore.getAreaList();
		this.state.areaList = [];
		this.setState({ areaList: areas });
	}

	btnDisabled() {
		if (!this.state.realName || !this.state.idNumber || !this.state.idFront || !this.state.idBack || !this.state.city || !this.state.city.title || !this.state.cspaNumber) {
			return true
		} else {
			return false
		}
	}

	pickId(key) {
		const options = {
			title: '选择图片',
			cancelButtonTitle: '取消',
			takePhotoButtonTitle: '拍照',
			chooseFromLibraryButtonTitle: '选择照片',
			cameraType: 'back',
			mediaType: 'camera',
			videoQuality: 'high',
			durationLimit: 10,
			maxWidth: 1000,
			maxHeight: 1000,
			quality: 0.8,
			angle: 0,
			cropping: true,
			allowsEditing: false,
			noData: false,
			storageOptions: {
				skipBackup: true
			}
		}

		ImagePicker.showImagePicker(options, async (response) => {
			if (response.didCancel) {
				console.debug('User cancelled photo picker')
			} else if (response.error) {
				Toast.message("选择照片出错，请重试")
			} else if (response.customButton) {
				console.debug('User tapped custom button: ', response.customButton)
			} else {

				if (key === "idFront") {
					this.setState({ isFrontUploading: true })
				} else {
					this.setState({ isBackUploading: true })
				}

				let uploadFile = {
					uri: Platform.OS === 'android' ? response.uri : response.uri.replace('file://', ''),
					type: 'application/octet-stream',
					name: 'aaaaa.jpg'
				}
				// console.log('uploadFile',uploadFile);
				let formData = this.state.submitForm;

				if (key === "idFront") {
					formData.append("idFront", uploadFile);
					this.setState({ idFront: response.uri, isFrontUploading: false, submitForm: formData })
				} else {
					formData.append('idBack', uploadFile);
					this.setState({ idBack: response.uri, isBackUploading: false, submitForm: formData })
				}
			}
		})
	}

	submitId = () => {
		this.state.submitForm.append("idNumber", this.state.idNumber)
		this.state.submitForm.append("realName", this.state.realName)
		this.state.submitForm.append("age", this.state.age)
		this.state.submitForm.append("city", this.state.city.title)
		this.state.submitForm.append("memberId", this.state.cspaNumber)

		this.forceUpdate()

		ModalIndicator.show("信息提交中")

		fetch(Url.USER_UPLOAD_ID, {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + this.user.token,
				 'Content-Type': 'multipart/form-data',
			},
			body: this.state.submitForm
		}).then(res => {
			return res.json()
		}).then((res) => {
			console.debug("提交结果: ", res)
			if(res.error) {
				this.state.submitForm = new FormData()
				this.forceUpdate()
				ModalIndicator.hide()
				Toast.message("信息提交出错，请重试")
			} else if (res.code === 0) {
				// 更新一下内存中保存的用户信息，将id front和id back随便附个值，只是标明id已经存在了
				let loginuserCopy = { ...this.user }
				loginuserCopy.status = ClientStatusEnum.IN_REVIEW.code
				loginuserCopy.IdFront = "uploaded"
				loginuserCopy.IdBack = "uploaded"
				store.UserStore.saveLoginUser(loginuserCopy)
				this.user.status = ClientStatusEnum.IN_REVIEW.code
				this.state.status = ClientStatusEnum.IN_REVIEW.code
				this.forceUpdate()
				DeviceEventEmitter.emit("statusUpdated", { status: ClientStatusEnum.IN_REVIEW.code })
				ModalIndicator.hide()
			} else {
				this.state.submitForm = new FormData()
				this.forceUpdate()
				ModalIndicator.hide()
				Toast.message("信息提交出错，请重试")
			}
		}).catch((error) => {
			this.state.submitForm = new FormData()
			this.forceUpdate()
			console.debug("提交身份证出错: ", JSON.stringify(error));
			Toast.message("信息提交出错，请重试");
			ModalIndicator.hide()
		})
	}

	//根据身份证号计算年龄
	getAge(identify) {
		let UUserCard = identify;
		if (UUserCard != null && UUserCard != '') {
			//获取年龄
			const myDate = new Date();
			const month = myDate.getMonth() + 1;
			const day = myDate.getDate();
			let age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
			if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
				age++;
			}
			return age;	
		}
	}

	render() {
		if (this.state.status === ClientStatusEnum.IN_REVIEW.code) {
			return <View style={{ flex: 1 }}>
				<UINavBar title="认证信息" />
				<View style={{ height: scaleSize(1), backgroundColor: "#F2F6F9" }}></View>
				<View style={{ flex: 1, alignItems: 'center' }}>
					<Image source={images.mine.auditing}
						style={{ width: scaleSize(130), height: scaleSize(149), marginTop: scaleSize(69) }} />
					<Text style={{ fontSize: 18, color: "rgba(0,0,0,0.50)", fontWeight: "bold", marginTop: scaleSize(32) }}>审核中</Text>
				</View>
			</View>
		}
		return <View style={{ flex: 1 }}>
			<UINavBar title="认证信息" />
			<View style={{ height: scaleSize(1), backgroundColor: "#F2F6F9" }}></View>
			<ScrollView>
				<View style={{ flex: 1, paddingHorizontal: scaleSize(20) }}>
					{
						this.state.status === ClientStatusEnum.NOT_VERIFIED.code && <View style={styles.input_wrap}>
						<Text style={styles.label}>真实姓名</Text>
						<TextInput
							required={true}
							placeholder={'申请人姓名'}
							placeholderTextColor={'#C5CAD5'}
							defaultValue={this.state.realName}
							value={this.state.realName}
							style={styles.input}
							onChangeText={text => { this.setState({ realName: text }) }}
						/>
					</View>
					}
					<View style={styles.input_wrap}>
						<Text style={styles.label}>身份证号</Text>
						<TextInput
							required={true}
							placeholder={'申请人身份证'}
							placeholderTextColor={'#C5CAD5'}
							defaultValue={this.state.idNumber}
							value={this.state.idNumber}
							style={styles.input}
							maxLength={18}
							onChangeText={text => { 
								this.setState({ idNumber: text })
								if(text.length == 18){
									const ageNum = this.getAge(text)
									console.log(ageNum)
									this.setState({
										age: ageNum
									})
								}
							}}
							keyboardType={'default'}
						/>
					</View>
					{
						this.state.status === ClientStatusEnum.NOT_VERIFIED.code && <>
							<View style={styles.input_wrap}>
								<Text style={styles.label}>年龄</Text>
								<Text style={[styles.input,{color:this.state.age=='' ? '#C5CAD5' : '#000000'}]}
								>{this.state.age=='' ? '根据身份证号自动展示年龄' : this.state.age}</Text>
							</View>
							<View style={styles.input_wrap}>
								<Text style={styles.label}>城市</Text>
								<Text 
								style={[styles.input,{color:this.state.city.title=='' ? '#C5CAD5' : '#000000'}]}
								onPress={() => {
									UICitySelect.show(this.state.areaList, (item) => {
										this.state.city.title = item.city_name;
										if (item.id == -1) {
											this.state.city.id = null;
										} else {
											this.state.city.id = item.id;
										}
										this.setState({
											city: this.state.city
										})
									})
								}}>{this.state.city.title=='' ? '请选择常驻的城市' : this.state.city.title}</Text>
								<Image style={{ width: scaleSize(10), height: scaleSize(17) }} source={images.common.arrow_right3} />
							</View>
						</>
					}
					
					<View style={{ height: scaleSize(56), justifyContent: 'center',marginBottom:scaleSize(15) }}>
						<Text style={[styles.label,{width: '100%'}]}>身份证照片（或军警证照片）</Text>
					</View>
					<View>
						<TouchableOpacity onPress={() => this.pickId('idFront')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}						>
							<Image source={this.state.idFront ? { uri: this.state.idFront } : images.mine.auth_bg_1} style={{ height: scaleSize(170), width: scaleSize(260) }} />
							<Text style={{ color: "#858B9C", fontSize: scaleSize(12), marginTop: scaleSize(15),marginBottom: scaleSize(15) }}>拍摄身份证人像面</Text>
						</TouchableOpacity>
					</View>

					{
						this.state.status === ClientStatusEnum.NOT_VERIFIED.code && <View style={styles.input_wrap}>
							<Text style={styles.label}>射手卡编号</Text>
							<TextInput
								required={true}
								placeholder={'请输入CPSA安全射手卡编号'}
								placeholderTextColor={'#C5CAD5'}
								defaultValue={this.state.cspaNumber}
								value={this.state.cspaNumber}
								style={styles.input}
								onChangeText={text => { this.setState({ cspaNumber: text }) }}
								keyboardType={'default'}
							/>
						</View>
					}



					<View style={{ height: scaleSize(56), justifyContent: 'center',marginTop:scaleSize(15), marginBottom:scaleSize(15) }}>
						<Text style={[styles.label,{width: '100%',textAlign:'center'}]}>射手卡正面照片</Text>
						<Text style={[styles.label,{width: '100%',textAlign:'center'}]}>（CPSA气枪安全射手卡或实弹安全射手卡）</Text>
					</View>
					<View>
						<TouchableOpacity onPress={() => this.pickId('idBack')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}						>
							<Image source={this.state.idBack ? { uri: this.state.idBack } : images.mine.auth_bg_2} style={{ height: scaleSize(170), width: scaleSize(260) }} />
							<Text style={{ color: "#858B9C", fontSize: scaleSize(12), marginTop: scaleSize(15),marginBottom: scaleSize(15) }}>拍摄射手卡人像面</Text>
						</TouchableOpacity>
					</View>
					
					<TouchableOpacity onPress={() => this.submitId()}
						style={[styles.submitBtn, { marginTop: scaleSize(50), backgroundColor: 'rgba(212,61,62,1)' }]}>
						<Text style={styles.submitBtnText}>提交认证</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={()=>{
						RouteHelper.navigate('ChatPage', {
							loginUser: this.state.loginUser,
							conversation: {
							  	user: {
									nickname: "CPSA客服",
									username: "CPSA",
									name: "CPSA客服"
							  	},
							  	type: 'single'
							}
						})
					}} style={{flex: 1, alignItems: 'center', justifyContent: 'center',marginTop: scaleSize(20),marginBottom: scaleSize(20)}}>
						<Text style={{color: '#858B9C',fontSize: scaleSize(12),}}>遇到问题，联系CPSA客服</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	}

}



var styles = {
	input_wrap: {
		flexDirection: 'row',
		height: scaleSize(56),
		alignItems: 'center',
		borderBottomWidth: ONE_PX,
		borderColor: "#E2E4EA",
	},
	label: {
		fontSize: scaleSize(15),
		color: "#111A34",
		fontFamily: "PingFangSC-Regular",
		width: scaleSize(80)
	},
	input: {
		padding: 0,
		margin: 0,
		flex: 1,
		fontSize: scaleSize(16),
		paddingLeft: scaleSize(20)
	},
	submitBtn: {
		width: scaleSize(335),
		height: scaleSize(50),
		backgroundColor: "rgba(212,61,62,0.5)",
		borderRadius: scaleSize(4),
		alignItems: 'center',
		justifyContent: 'center',
	},
	submitBtnText: {
		fontSize: 18,
		color: "#fff",
	}
}
