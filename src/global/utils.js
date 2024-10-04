import {PixelRatio,Dimensions,ToastAndroid,PermissionsAndroid,Platform,ImageEditor} from 'react-native';
import {
    ModalIndicator,
    Toast
} from 'teaset';
import {RouteHelper} from 'react-navigation-easy-helper'
import {UserStore} from '../store/UserStore';



let fontScale = PixelRatio.getFontScale();
let pixelRatio = PixelRatio.get();
const defaultPixel = pixelRatio; 
const defaultWidth = 375;
const defaultHeight = 667;
const w2 = defaultWidth / defaultPixel;
const h2 = defaultHeight / defaultPixel;
const _scaleHeight = SCREEN_HEIGHT / defaultHeight;

const scale = Math.min(SCREEN_HEIGHT / h2, SCREEN_WIDTH / w2);   //获取缩放比例

global.setSpText = function(size: number) {
	var scale = Math.min(SCREEN_HEIGHT / h2, SCREEN_WIDTH / w2);   //获取缩放比例
    size = Math.round((size * scale + 0.5) * pixelRatio / fontScale);
    return size / defaultPixel;
}

export const scaleSize = function(size: number) {
	const {width, height} = Dimensions.get('window');
	// var scale = Math.min(height / h2, width / w2); 
    size = Math.round(size * scale + 0.5);
    // console.info(size);
    return size / defaultPixel;
}

global.scaleSize = scaleSize;
global.getFileName=function(url){
    var index = url.lastIndexOf("/");
    return url.slice(index+1);
}
global.getExtName=function(url){
    var index = url.lastIndexOf(".");
    return url.slice(index+1);
}
var loading_key=""
global.http_get=async function(url,query={},loading_txt,header={}){
    // alert(url);
    if(loading_txt){
        ModalIndicator.hide();
        ModalIndicator.show(loading_txt)
    }
    // console.log(EmployeeStore.logined_emp);
    let localToken = await UserStore.localToken()
    let userId = await UserStore.localUseId()

    return new Promise((resolve,reject)=>{
        if (query) {
            let paramsArray = [];
            Object.keys(query).forEach(key => paramsArray.push(key + '=' + encodeURIComponent(query[key])));
            if (url.indexOf('?') === -1) {
                url += '?' + paramsArray.join('&')
            } else {
                url += '&' + paramsArray.join('&')
            }
        }

        if(!url.startsWith('http')){
            url=url_prefix+url
        }

        //token = "Bearer "+localToken
        if(localToken){
            header['Authorization'] = "Bearer "+localToken;
        }
        if(userId) {
            header['userId'] = userId
        }        
        fetch(url, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',                    
                    ...header
                },
         }).then(response => {
                // console.log(response);
                if (response.ok) {
                    return response.json()
                } else {
                    reject({code: response.status, msg: `服务器返回信息错误:${response._bodyText}`})
                }
            }).then(async (responseJson)=>{
                if(responseJson.error==403){
                //跳到；登录页面；
                    await remove_logined_emp();
                    RouteHelper.reset('LoginPage')
                    Toast.fail(responseJson.message);
                }else{
                    resolve({
                        body:responseJson
                    })
                }
            }).catch(e => {
                // console.log(e);
                reject({code: -1, msg: `fetch进入catch:${JSON.stringify(e)}`})
            }).finally(() => {
                 ModalIndicator.hide()
            })
       
    })
}

global.http_post=async function(url,body={},loading_txt,header={}){
    // alert(url);
    try{
        if(loading_txt){
            ModalIndicator.hide();
            var loading_key  = ModalIndicator.show(loading_txt)
        }
    }catch(err){
        alert(err.message);
    }
    // console.log("url",url)
    // alert(11);

    //temp code
    if(url.indexOf("?") < 0 ) {
        url = url+"?lang="+I18n.locale
    }
    else  {
        url = url+"&lang="+I18n.locale
    }
    let localToken = await UserStore.localToken()
    let userId = await UserStore.localUseId()

    return new Promise((resolve,reject)=>{
         
      
        if(localToken){
            header['Authorization'] = "Bearer "+localToken;
        }
        if(userId) {
            header['userId'] = userId
        }
        // console.warn(body,url);
        alert(url);
         fetch(url, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',                    
                    ...header
                },
                body:JSON.stringify(body)
         }).then(response => {
                // console.log(response);
                return response.json()
                if (response.ok) {
                    return response.json()
                } else {
                    reject({code: response.status, msg: `服务器返回信息错误:${response._bodyText}`})
                }
            }).then(async (responseJson)=>{
                //console.log('responseJson',responseJson);
                return resolve({
                        body:responseJson
                    })
                // if(responseJson.error==403){
                // //跳到；登录页面；
                //     await remove_logined_emp();
                //     RouteHelper.reset('LoginPage')
                //     Toast.fail(responseJson.message);
                // }else{
                //     resolve({
                //         body:responseJson
                //     })
                // }
            }).catch(e => {
                console.log(e);
                reject({code: -1, msg: `fetch进入catch:${JSON.stringify(e)}`})
            }).finally(() => {
                 ModalIndicator.hide()
            })
    })
}

global.compressImage=function(imgObj,maxWidth,maxHeight){
    return new Promise((resolve,reject)=>{
        if(imgObj.width<maxWidth){
            resolve(imgObj.uri);
            return;
        }
         ImageEditor.cropImage(imgObj.uri,{
             offset: {x: 0, y: 0},
             size: {width:imgObj.width, height: imgObj.height},
             displaySize: {width: maxWidth, height: maxHeight},
             resizeMode:'contain',
        },(res)=>{
            resolve(res);
        },(err)=>{
            // console.warn(err);
            // alert(err);
            reject(err);
        })
    })
}

global.lang_map = {
    zh: '简体中文',
    en: 'English'
}
