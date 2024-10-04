import React, { Component } from "react";
import { Modal, Image, Text, TouchableHighlight,ScrollView,View, Dimensions } from "react-native";
import {images} from '../../res/images';

export default class ResultIntroPopView extends Component {

  _setModalVisible(visible) {
    this.props.callback(visible)
  }

  render() {
    var alert_iconPath = require('../../res/images/RankResult/result_title.png');
    var closed_iconPath = require('../../res/images/RankResult/result_close_btn.png');
    return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.props.modalVisible}
          onRequestClose={() => {
            alert("Modal has been closed.");
          }}
        >
          <View style={{height:Dimensions.get('window').height, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
            <View style={{height:scaleSize(450),  width:scaleSize(345), margin:0, backgroundColor:'white'}}>
              <View style={{flex:1, justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#eee'}}>
                 <View style={{flexDirection: 'column',top:0}}>
                 <View><Image source={alert_iconPath} style={{ width: scaleSize(165), height: scaleSize(50),top: scaleSize(-10) ,left: scaleSize(90)}} /></View>
                 <ScrollView style={{top: scaleSize(-10) }}>
                    <Text style={[{color: '#303030', lineHeight: 20, fontSize: scaleSize(12),textAlign: 'left', width: scaleSize(345),padding:12}]}
                                        numberOfLines={50}>
                    ★ 2018-2019赛年，竞技射击运动在中国大陆的影响力逐渐增大，使IPSC CHINA的队伍迅速壮大，注册会员在总 会的组织下积极参加海外各项赛事，促进了IPSC在中国大陆的发展以及国际知名度。虽然我们离世界高水平射手还 有很大差距，但这几年来我们在逐步缩小这个差距，由开始的初级水平慢慢提高到能在国际赛场取得较好的成绩。 在这两年的赛事中，中国射手打破了三级赛无奖牌的状况，并分别在两场三级赛上获得男子及女子原厂组冠军创造 了历史。目前，CPSA有很多射手可以位居各大赛事的”Page1”，个别射手已经达到亚洲较高的水平。{"\n"}{"\n"}

                    ★ 2018-2019赛年，以射击俱乐部为代表的职业竞技射击俱乐部制度以惊人的速度向前推进，拓宽了IPSC在中国大 陆的发展道路，提升了赛事组织能力，取得了令人瞩目的成效。2019年，中国人第一个自己的集考证、训练、赛事 服务为一体的“实体”俱乐部落户泰国曼谷，并成为CPSA授权的海外实体射击训练基地，为华人射手提供了更好的 训练及比赛的体验，并成功协助IPSC中国总会举办了首届IPSC全球华人手枪邀请赛。{"\n"}{"\n"}

                    ★ 2018-2019赛年，CPSA共参与组织公开报名赛事19场（会员10人以上参加的各级赛事），参赛组别包括：原厂 组（Production/PRD）、标准组（Standard/STD）、公开组（Open/OPN）、光学组（Production Optics/PDO）、经典组（Classic/CLA）、手枪规格卡宾组（Pistol Caliber Carbine/PCC），参赛射手共计181 人，参赛人次共计558人次（不含港澳台），其中Disqualifications为39人次，完赛率为93.01%。{"\n"}
                    </Text>
                 </ScrollView>
                 </View>
              </View>
            </View>
            <TouchableHighlight
               onPress={() => {
                  this._setModalVisible(!this.props.modalVisible);
               }}
               style={{height:50, top:scaleSize(20),justifyContent:'center', alignItems:'center'}}
             >
                <Image source = { closed_iconPath } style = { {width: 40, height: 40} }/>
            </TouchableHighlight>
          </View>
        </Modal>
    );
  }
}