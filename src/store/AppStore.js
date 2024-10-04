import { DeviceEventEmitter } from 'react-native';
import { observable, computed, action, autorun, runInAction, toJS } from 'mobx'
import { Toast } from 'teaset';
import DeviceInfo from 'react-native-device-info';
import simpleStore from '../libs/simpleStore';
import request from '../api/Request';
import ApiUrl from '../api/Url';

export class AppStore {

    // 存储好友请求事件
    static saveFriendRequest(request) {
        simpleStore.save('friendRequests', request);
        DeviceEventEmitter.emit('saveFriendRequest');
    }

    static getFriendRequest() {
        return simpleStore.get('friendRequests');
    }

    // 存储发送的好友请求
    static saveSentFriendRequest(request){
        simpleStore.save('sentFriendRequests', request);
    }

    static getSentFriendRequest() {
        return simpleStore.get('sentFriendRequests');
    }

    static areas = []
    static async getAreaList() {
         if (this.areas.length === 0) {
        await request.post(ApiUrl.AREA_LIST, {}).then(async (res) => {
            if (res.status === 200) {
                this.areas.push({
                    country_name: "全部",
                    id: 1,
                    items: [{ city_name: "全部", id: -1 }]
                })

                res.data.rows.map(item => {
                    var cityId = item.id
                    var countryName = undefined
                    var cityName = undefined

                    if (item.name) {
                        if (item.name.split("-").length === 2) {
                            countryName = item.name.split("-")[0]
                            cityName = item.name.split("-")[1]
                        }

                        if (item.name.split("-").length === 3) {
                            countryName = item.name.split("-")[0]
                            cityName = item.name.split("-")[1] + "(" + item.name.split("-")[2] + ")"
                        }

                        if (countryName && cityName) {
                            var findCountryIndex = this.areas.findIndex(item => item.country_name === countryName)
                            if (findCountryIndex < 0) {
                                this.areas.push({
                                    country_name: countryName,
                                    id: this.areas.length + 1,
                                    items: [{
                                        country_name: countryName,
                                        city_name: cityName,
                                        id: cityId
                                    }]
                                })
                            } else {
                                this.areas[findCountryIndex].items.push({
                                    country_name: countryName,
                                    city_name: cityName,
                                    id: cityId
                                })
                            }
                        }
                    }
                })
            }
        })
         }

        return this.areas
    }

    static courses = []
    static async getCourseList() {
         if (this.courses.length === 0) {
        let types = await request.post(ApiUrl.TYPE_LIST, {})

        await request.post(ApiUrl.COURSE_LIST, {}).then(async (res) => {
            if (res.status === 200) {
                this.courses.push({
                    country_name: "全部",
                    id: 1,
                    items: [{ city_name: "全部", id: -1 }]
                })

                res.data.rows.map(item => {
                    var courseName = item.name

                    if (courseName) {
                        if (types.data.rows) {
                            types.data.rows.map(subType => {
                                var findCourseIndex = this.courses.findIndex(item => item.country_name === courseName)
                                if (findCourseIndex < 0) {
                                    this.courses.push({
                                        country_name: courseName,
                                        id: this.courses.length + 1,
                                        items: [{
                                            country_name: courseName,
                                            city_name: subType.name,
                                            id: Number("" + item.id + subType.id),
                                            courseId: Number("" + item.id),
                                            typeId: Number("" + subType.id)
                                        }]
                                    })
                                } else {
                                    this.courses[findCourseIndex].items.push({
                                        country_name: courseName,
                                        city_name: subType.name,
                                        id: Number("" + item.id + subType.id),
                                        courseId: Number("" + item.id),
                                        typeId: Number("" + subType.id)
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })
         }

        return this.courses
    }

    static levels = []
    static getLevelList = async () => {
         if (this.levels.length === 0) {
        this.levels.push({ title: "全部", code: -1 })
        await request.post(ApiUrl.LEVEL_LIST, {}).then(res => {
            if (res.status === 200) {
                for (var i = 0; i < res.data.rows.length; i++) {
                    var item = res.data.rows[i]
                    this.levels.push({ title: item.levelName, code: item.id })
                }
            }
        })
         }

        return this.levels
    }

    static categories = []
    static getCategoryList = async () => {
        if (this.categories.length === 0) {
            await request.post(ApiUrl.CLUB_CATEGORY_LIST, {
                type: "shooting_club_category"
            }).then(res => {
                if (res.status === 200) {
                    for (var i = 0; i < res.data.categories.length; i++) {
                        var item = res.data.categories[i]
                        this.categories.push({ title: item.value, code: item.code })
                    }
                }
            })
        }

        return this.categories
    }

    static msgList = null
    static getMsgList = async () => {
        if (this.msgList != null) {
            return this.msgList
        }
        else {
            this.msgList = await simpleStore.get("msgList")
            if (this.msgList != null) {
                return this.msgList
            }
            return []
        }
    }

    static addMsgList = async (msg) => {
        if (this.msgList != null) {
            var dupliacatedIndex = this.msgList.findIndex(m => m.messageID === msg.messageID)
            if (dupliacatedIndex < 0) {
                this.msgList.unshift(msg)
                await simpleStore.save("msgList", this.msgList)
            }
        } else {
            this.msgList = []
            this.msgList.push(msg)
            simpleStore.save("msgList", this.msgList)
        }
    }

    static resetMsgList = async () => {
        this.msgList = null
        await simpleStore.delete("msgList")
    }

    static unReadMsg = false
    static isUnReadMsg = async () => {
        if (this.unReadMsg != null) {
            return this.unReadMsg
        }

        else {
            this.unReadMsg = await simpleStore.get("isUnreadMsg")
            if (this.unReadMsg != null) {
                return this.unReadMsg
            }
            return false
        }
    }

    static setUnReadMsg = async (isRead) => {
        this.unReadMsg = isRead
        await simpleStore.save("isUnreadMsg", isRead)
        DeviceEventEmitter.emit("isMsgReadUpdated", { isRead: isRead })
    }
}
