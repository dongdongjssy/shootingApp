import { Toast, ModalIndicator } from 'teaset';
import simpleStore from '../libs/simpleStore';
import Url from '../api/Url'
import Axios from "axios";
import { DeviceEventEmitter } from 'react-native'
import Request from '../api/Request'
import ResponseCodeEnum from '../constants/ResponseCodeEnum';

export class UserStore {
	static loginUser = null;
	static async saveLoginUser(user) {
		this.loginUser = user
		await simpleStore.save('loginUser', user)
		DeviceEventEmitter.emit('userUpdated', { user: user })
	}

	static async getLoginUser() {
		if (this.loginUser != null) {
			return this.loginUser
		} else {
			var user = await simpleStore.get('loginUser')
			this.loginuser = user
			return user
		}
	}

	static cleanLoginUser() {
	    //alert("退出清除用户信息");
	    this.loginuser = null;
		simpleStore.delete('loginUser')
	}

	// Login call
	static login = async (userInfo) => {
		return new Promise((resolve, reject) => {
			Axios.post(Url.LOGIN_BY_PHONE, userInfo).then(async (res) => {
				if (res.data.code === 200) {
					let user = res.data.data.user
					if (user) {
						user.token = res.data.data.token
						user.refreshToken = res.data.data.refreshToken

						let myClubsRes = await Axios.post(Url.MY_CLUB_LIST, { clientUserId: user.id }, {
							headers: {
								Authorization: "Bearer " + user.token,
								userId: user.id
							}
						})

						if (myClubsRes.status === 200 && myClubsRes.data?.rows?.length > 0) {
							user.clubId = myClubsRes.data.rows[0].clubId
						}
		                this.loginUser = user
						await simpleStore.save("loginUser", user)
					}
				} else {
					let errorMsg = res.data.msg
					if (errorMsg) {
						Toast.message(errorMsg)
					}
					reject(new Error(errorMsg));
				}

				resolve(res.data);
			}).catch((err) => {
				reject(err);
				Toast.message("登录失败，用户不存在或输入信息错误")
			})
		})
	}

	// validate token
	static validateToken = async (token) => {
		return new Promise((resolve, reject) => {
			Axios.post(Url.VALIDAATE_TOKEN, token).then(async (res) => {
				resolve(res.data)
			}).catch((err) => {
				reject(err);
				// console.debug("[ERROR] validate token error: ", err.message)
			})
		})
	}

	// validate user password
	static validatePassword = async (user) => {
		return new Promise((resolve, reject) => {
			Axios.post(Url.VALIDATE_PASSWORD, user).then(async (res) => {
				resolve(res.data)
			}).catch((err) => {
				reject(err);
				// console.debug("[ERROR] validate token error: ", err.message)
			})
		})
	}

	// send sms code
	static sendSmsCode = (phone) => {
		return new Promise((resolve, reje) => {
			Axios.post(Url.SEND_SMS, phone, {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(async (res) => {
				if (res.data.code === 0) {
					Toast.message("短信验证码已发送，请查收")
					resolve(res.data);
				} else {
					reje(new Error(res.data.msg))
					Toast.message("短信发送失败，请稍后重试")
				}
			}).catch((err) => {
				Toast.message("短信发送失败，请稍后重试")
				console.debug("[ERROR] send sms error: ", err.message)
			})
		})
	}

	//send email code
	static sendEmailCode = (email) => {
		return new Promise((resolve, reje) => {
			Axios.post(Url.SEND_EMAIL, email, {
				headers: {
					'Content-Type': 'multipart/form-data',
				}
			}).then(async (res) => {
				if (res.data.code === ResponseCodeEnum.SUCCESS) {
					Toast.message("邮箱验证码已发送，请查收")
					resolve(res.data);
				} else {
					reje(new Error(res.data.msg))
					Toast.message("邮箱验证码发送失败，请稍后重试")
				}
			}).catch((err) => {
				Toast.message("邮箱验证码发送失败，请稍后重试")
				console.debug("[ERROR] send email error: ", err.message)
			})
		})
	}
}

