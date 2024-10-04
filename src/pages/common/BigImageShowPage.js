import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import {
  Toast,
  TabView,
  AlbumView,
  Overlay,
  Carousel,
  TransformView,
  NavigationBar,
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import RNFS from 'react-native-fs';
// console.log("CameraRoll",CameraRoll);
import CameraRoll from "@react-native-community/cameraroll";

@inject('UserStore') //注入；
@observer
export default class BigImageShowPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      launcher_img: [],
      activeIndex: this.props.defaultIndex,
      saveimg_ing: false,
    };
    this.UserStore = this.props.UserStore;

  }
  static defaultProps = {
    imgs: [], // {url:"httpsadsfa.png"}
    defaultIndex: 0,
  }


  async componentDidMount() {


  }
  saveImage(saveImageUrl) {
    if (!saveImageUrl) {
      return Toast.message("saveImageUrl not found")
    }
    this.setState({
      saveimg_ing: true,
    })

    const storeLocation = `${RNFS.DocumentDirectoryPath}`;
    let pathName = new Date().getTime() + "文件名.png"
    let downloadDest = `${storeLocation}/${pathName}`;

    if (saveImageUrl.startsWith("file://")) {
      RNFS.copyFile(saveImageUrl, "file://" + downloadDest).then(res => {
        CameraRoll.saveToCameraRoll("file://" + downloadDest).then(result => {
          this.setState({
            saveimg_ing: false,
          })
          Toast.message("图片已保存至相册")
        }).catch((error) => {
          console.log('error', error);
          Toast.message("保存失败")
          this.setState({
            saveimg_ing: false,
          })
        })
      }).catch(err => {
        Toast.message(err.message);
        this.setState({
          saveimg_ing: false,
        })
      })
    } else {
      const ret = RNFS.downloadFile({ fromUrl: saveImageUrl, toFile: downloadDest });
      ret.promise.then(res => {

        if (res && res.statusCode === 200) {
          var promise = CameraRoll.saveToCameraRoll("file://" + downloadDest);
          promise.then((result) => {
            this.setState({
              saveimg_ing: false,
            })
            console.warn("result", result);
            // 已保存至：ph://2005E6C4-2C3D-4532-8338-1E8CF6F2A673/L0/001
            // alert("图片已保存至相册");
            // alert(Toast.message)
            Toast.message("图片已保存至相册")
          }).catch((error) => {
            console.log('error', error);
            Toast.message("保存失败")
            this.setState({
              saveimg_ing: false,
            })

          })
        }
      }).catch(err => {
        Toast.message(err.message);
        this.setState({
          saveimg_ing: false,
        })
      })
    }

  }
  render() {
    return <View style={{ flex: 1, backgroundColor: "#393939" }}>
      <UINavBar title="" style={{ backgroundColor: "#393939" }} />
      <AlbumView
        style={{ height: scaleSize(650), alignItems: 'center', justifyContent: 'center', flex: 1 }}
        control={false}
        defaultIndex={this.props.defaultIndex}
        images={this.props.imgs.map((item) => { return { uri: item.url } })}
        // thumbs={[
        //   require('../images/teaset1_s.jpg'),
        //   require('../images/teaset2_s.jpg'),
        //   require('../images/teaset3_s.jpg'),
        //   require('../images/faircup_s.jpg'),
        // ]}
        onChange={(index) => {
          this.setState({
            activeIndex: index
          })
        }}
      />


      <View style={{ alignItems: 'center', flexDirection: "row", justifyContent: 'center', paddingBottom: scaleSize(40) }}>
        <Text style={{ color: "#FFCC79", fontSize: 18 }}>{this.state.activeIndex + 1}</Text>
        <Text style={{ color: "#FFFFFF", fontSize: 18 }}>/{this.props.imgs.length}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          // alert("11");
          if (!this.state.saveimg_ing) {
            this.saveImage(this.props.imgs[this.state.activeIndex].url);
          }
        }}
        style={{ position: "absolute", bottom: scaleSize(36), right: scaleSize(16), zIndex: 9999 }}>

        {this.state.saveimg_ing ? <ActivityIndicator
          size="small"
          style={{ width: scaleSize(30), height: scaleSize(30), tintColor: "#fff" }}
          color="#fff"
        /> : <Image
            style={{ width: scaleSize(30), height: scaleSize(30), tintColor: "#fff" }}
            source={images.common.download} />}
      </TouchableOpacity>
    </View>
  }

}







