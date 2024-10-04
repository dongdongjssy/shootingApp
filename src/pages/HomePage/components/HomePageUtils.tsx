import {  DeviceEventEmitter  } from 'react-native'
import ApiUrl from '../../../api/Url.js';
import request from '../../../api/Request';
import { ModalIndicator } from 'teaset';
import ResponseCodeEnum from '../../../constants/ResponseCodeEnum';


export  async function callRestListApi(restUrl:string, params = {}) {

    let result = {};
    await request.post(restUrl, params).then(res => {
        if (res.status === ResponseCodeEnum.STATUS_CODE) {
            result = res.data;
        }
    }).catch(err => {
        ModalIndicator.hide()
        console.debug(err)
    });

    return result;
};

export  async function callRestListApiByAll(restUrl:string, params = {}) {

    let result = [];
    await request.post(restUrl, params).then(res => {
        if (res.status === ResponseCodeEnum.STATUS_CODE) {
            result = res;
        }
    }).catch(err => {
        ModalIndicator.hide()
        console.debug(err)
    });

    return result;
};

export  function homePageListener(_that) {
    // DeviceEventEmitter.addListener("postAdded", async () => {
    //     console.debug("【监听回调，主页】动态有更新")
    //      _that.listView?.refresh();
    // });
    DeviceEventEmitter.addListener("followUserUpdated", () => {
        console.debug("【监听回调】关注用户更新")
        _that.listView?.refresh();
    });
    DeviceEventEmitter.addListener("followClubUpdated", () => {
        console.debug("【监听回调，我的主页】关注俱乐部更新")
        _that.listView?.refresh();
    });
    DeviceEventEmitter.addListener("commentAdded", () => {
        console.debug("【监听回调，我的主页】评论更新")
        _that.listView?.refresh();
    });
    // DeviceEventEmitter.addListener("likeUpdated", (res) => {
    //     console.debug("【监听回调，我的主页】点赞更新")
    //     _that.listView?.refresh();
    //     var rows = _that.listView.getRows();
    //     var item = rows.find(item => item.id === res.id)
    //     if (item) {
    //         item.isUserLike = res.isLike
    //         _that.forceUpdate()
    //     }
    //     _that.listView && _that.listView.refresh();
    // });
    DeviceEventEmitter.addListener("likeUpdated", async () => {
        console.debug("【监听回调，点赞】动态有更新")
         _that.listView?.refresh();
    });
    DeviceEventEmitter.addListener("readUpdated", (res) => {
        console.debug("【监听回调，我的主页】阅读数更新")
        _that.listView?.refresh();
    });
  }


