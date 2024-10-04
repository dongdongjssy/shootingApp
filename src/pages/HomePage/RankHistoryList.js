import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    SectionList,
    Image,
    TouchableOpacity,
} from 'react-native';

import {images} from '../../res/images';
import ResultIntroPopView from '../common/ResultIntroPopView';
// import ImageZoomView from '../common/ImageZoomView';
import { RouteHelper } from 'react-navigation-easy-helper'

var originalData = [
    {data: ['积分是公司虚拟货币，用户可以通过完成指定任务或参与活动等方式获得积分，积分可用于获取福利，如兑换商品和抽奖等。']},
    {data: [{row1: {title: '1、下述资料为2018及2019年每年均达到参赛3场两年合计6场的射手积分情况。'},
             row2: {
                 title: '2、2018及2019两年每年均需至少参加3场积分赛，每年选取3场最好成绩计算排名，共计6场。',
             },
             row3: {
                 title: '3、2020年世界杯资格根据CPSA最终分配的名额数量按序择优分配。',
             }
    }]},
    {data: [{row1: {title: '1、下述资料为2018或2019年未达到参赛3场的射手情况。'},
                        row2: {
                            title: '2. 按两年参与的全部场次的平均积分进行排名，相同积分的按参赛次数最近参赛时间及姓氏拼音排序。',
                        },
                        row3: {
                            title: '3. 由于射手的参赛场次、赛事级别、参赛组别以及参赛人员等情况的不同，故以下排名不具可比性，仅供参考。',
                        }
               }]},
    {data: [{title: '完成投资，积分即刻派发至个人积分账户。',
        content : '选择续期，积分将在续期完成后，即刻派发至个人积分账户'}]},
    {data: [{title: '每个积分有效期为一年', line1: '用户通过任何作弊行为获取积分，一经发现扣除该用户全部积分',
        line2: '积分所有内容解释权归公司所有'}]}
];

class CircleRow extends Component {
    render() {
        return (
            <View style = {{flexDirection:'row',marginLeft: 15, marginRight: 15, marginBottom: 15}}>
                <View style = {[styles.circle]}></View>
                <Text style={[{lineHeight: 20,marginLeft: 10, marginTop: -5, fontSize: 13},this.props.style]}>{this.props.name}</Text>
            </View>
        );
    }
}

export default class RankHistoryList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            displayData: [
                {title: '积分赛事主要组别最好成绩Overall排名'},
                {title: '每年均参加3场或以上赛事的射手排名'},
                {title: '不满足每年参加3场赛事的射手参赛情况'},
            ],
            modalVisible: false,
            content:'I come from Parent component'
        };

        for (var i = 0; i < this.state.displayData.length; i++) {
            this.state.displayData[i]['data'] = [];
            this.state.displayData[i]['key'] = i;
            this.state.displayData[i]['isExpanded'] = '0';
            this.state.displayData[i]['icon'] = '../../res/images/RankResult/chapter_1.png';
//            if(i == 0){
//               this.state.displayData[i]['isExpanded'] = '1';
//            }else{
//               this.state.displayData[i]['isExpanded'] = '0';
//            }
        }
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    _sectionHeader = (data) => {
        console.log('========'+data.section.key);
           var cupImgPath;
               switch (data.section.key) {
                    case 0 :
                         cupImgPath  = require('../../res/images/RankResult/chapter_0.png');
                         break;
                    case 1 :
                         cupImgPath  = require('../../res/images/RankResult/chapter_1.png');
                                break;
                    case 2 :
                         cupImgPath  = require('../../res/images/RankResult/chapter_2.png');
                                break;
                    default :
                         cupImgPath  = require('../../res/images/RankResult/chapter_0.png');
                }
         var imgPath = data.section.isExpanded == '0' ?  require('../../res/images/RankResult/unfold_arrow.png') : require('../../res/images/RankResult/unfold_arrow_down.png');
         return <TouchableOpacity style = {styles.sectionHeader} fontSize = {15} onPress={()=>{ this.toggle(data); }}>
                <View style = { styles.sectionContainer }>
                    <Image source = { cupImgPath } style = { {width: 21, height: 30} }/>
                    <Text style = { styles.sectionHeaderText } numberOfLines = { 1 } >{data.section.title}</Text>
                    <TouchableOpacity
                  	    onPress={() => {

                    	}}
                  		style={[styles.sectionImage]}>
                        <Image source = { imgPath } style = { {width: 12, height: 12} }/>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
    };

    _sectionItem = (data) => {
        console.log('当前的item:'+JSON.stringify(data));
        var section1ImgPath = require('../../res/images/RankResult/chapter_section1.png');
        var section2ImgPath = require('../../res/images/RankResult/chapter_section2.png');
        var section3OneImgPath = require('../../res/images/RankResult/chapter_section3One.png');
        var section3TwoImgPath = require('../../res/images/RankResult/chapter_section3Two.png');
        var section3ThreeImgPath = require('../../res/images/RankResult/chapter_section3Three.png');
        var section3FourImgPath = require('../../res/images/RankResult/chapter_section3Four.png');
        var preCornerPath = require('../../res/images/RankResult/chapter_corner_right.png');
        var lastCornerPath = require('../../res/images/RankResult/chapter_corner_left.png');
        if(data.section.key == 0) {
            return <View style={styles.sectionContent}>
                       <TouchableOpacity
                              	    onPress={() => {
                              	         var imageUrls = [];
                              	         imageUrls.push({url: 'http://47.105.158.8:9007/shooting/contest/chapter_section1.png'});
                                         //RouteHelper.navigate("ImageZoomView",{"imageUrls":imageUrls});
                                         RouteHelper.navigate("BigImageShowPage", {
                                         										defaultIndex: 0,
                                         										imgs: imageUrls,
                                         									})
                                	}}
                              		style={ styles.sectionRowContent }>
                                    <Image source={section1ImgPath} style={{ width: scaleSize(360), height: scaleSize(316) }} />
                       </TouchableOpacity>
                   </View>
        } else if(data.section.key == 1) {
            return <View style={styles.sectionContent}>
                <Text style={[styles.item, {lineHeight: 20}]}>{data.item.row1.title}</Text>
                <Text style={[styles.item, {lineHeight: 20}]}>{data.item.row2.title}</Text>
                <Text style={[styles.item, {lineHeight: 20}]}>{data.item.row3.title}</Text>
                <TouchableOpacity
                     onPress={() => {
                          var imageUrls = [];
                          imageUrls.push({url: 'http://47.105.158.8:9007/shooting/contest/chapter_section2.png'});
                                        RouteHelper.navigate("BigImageShowPage", {
                                                                   										defaultIndex: 0,
                                                                   										imgs: imageUrls,
                                                                   									})
                          //RouteHelper.navigate("ImageZoomView",{"imageUrls":imageUrls});
                     }}
                     style={ styles.sectionRowContent }>
                     <Image source={section2ImgPath} style={{  width: scaleSize(360), height: scaleSize(195) }} />
                </TouchableOpacity>
                <View style = {{marginLeft: 15, marginRight: 15, marginBottom: 20}}>
                </View>
            </View>
        } else if(data.section.key == 2) {
             return <View style={styles.sectionContent}>

                            <Text style={[styles.item, {lineHeight: 20}]}>{data.item.row1.title}</Text>
                            <Text style={[styles.item, {lineHeight: 20}]}>{data.item.row2.title}</Text>
                            <Text style={[styles.item, {lineHeight: 20}]}>{data.item.row3.title}</Text>
                            <TouchableOpacity
                             onPress={() => {
                                  var imageUrls = [];
                                  imageUrls.push({url: 'http://47.105.158.8:9007/shooting/contest/chapter_section3One.png'});
                                  imageUrls.push({url: 'http://47.105.158.8:9007/shooting/contest/chapter_section3Two.png'});
                                  imageUrls.push({url: 'http://47.105.158.8:9007/shooting/contest/chapter_section3Three.png'});
                                  imageUrls.push({url: 'http://47.105.158.8:9007/shooting/contest/chapter_section3Four.png'});
                                  RouteHelper.navigate("BigImageShowPage", {
                                                                           										defaultIndex: 0,
                                                                           										imgs: imageUrls,
                                                                           									})
                                //  RouteHelper.navigate("ImageZoomView",{"imageUrls":imageUrls});
                             }}
                             style={ styles.sectionRowContent }>
                                 <Image source={section3OneImgPath} style={{ width: scaleSize(360), height: scaleSize(410) }} />
                                 <Image source={section3TwoImgPath} style={{ width: scaleSize(360), height: scaleSize(431) }} />
                                 <Image source={section3ThreeImgPath} style={{ width: scaleSize(360), height: scaleSize(420) }} />
                                 <Image source={section3FourImgPath} style={{ width: scaleSize(360), height: scaleSize(555) }} />
                            </TouchableOpacity>
                            <View style = {{marginLeft: 15, marginRight: 15, marginBottom: 20}}>
                            </View>
                        </View>
        } else if(data.section.key == 3) {
            return <View>
                     <Text style={[styles.item, {lineHeight: 20}]}>{data.item.title}</Text>
                     <CircleRow name = {data.item.content}/>
                   </View>
        } else if(data.section.key == 4){
            return <View>
                <Text style={[styles.item, {lineHeight: 20}]}>{data.item.title}</Text>
                <CircleRow name = {data.item.line1}/>
                <CircleRow name = {data.item.line2} style={{marginTop: -8}}/>
            </View>
        } else {
            return <Text style={[styles.item, {lineHeight: 20}]}>{data.item}</Text>
        }
    };

    async componentWillMount() {

      // this.toggle(this.state.displayData[0]);
    }

    async componentDidMount() {

   	}

    toggle(data) {
        var key = data.section.key;
        if (data.section.isExpanded == '0') {
            this.state.displayData[key].data = originalData[key].data;
            this.state.displayData[key].isExpanded = '1';
        } else {
            this.state.displayData[key].data = [];
            this.state.displayData[key].isExpanded = '0';
        }
        this.setState({
            displayData: this.state.displayData
        });
    }

    extraUniqueKey(item, index) {
        return index + item;
    }

    render() {
        var alert_iconPath = require('../../res/images/RankResult/chapter_head.png');
        var imgPath = require('../../res/images/RankResult/unfold_arrow.png');
        return (
            <View style={styles.container}>
                <TouchableOpacity  onPress={() => {
                                      this.setModalVisible(true);
                                   }}
                              style = { styles.alertView }>

                    <Image source={alert_iconPath} style={{marginLeft:9, width: scaleSize(15), height: scaleSize(15),marginTop:3 }} />
                    <View style = { styles.alertTitle }>
                       <Text style = { styles.sectionText } numberOfLines = { 1 } >2018-2019赛季CPSA参与的积分赛事说明</Text>
                    </View>
                    <View style = {{flex: 2,justifyContent: 'flex-end',alignItems: 'flex-end',marginRight:17,marginBottom:13}}>
                       <Image source = { imgPath } style = { {width: 12, height: 12} }/>
                    </View>
                </TouchableOpacity>
                <SectionList
                 	ref={ref => this.listView = ref}
                    sections = { this.state.displayData }
                    renderItem = { this._sectionItem.bind(this) }
                    renderSectionHeader = { this._sectionHeader.bind(this) }
                    keyExtractor = { this.extraUniqueKey }//去除警告
                    eatraData={this.state}
                />
        <ResultIntroPopView
         modalVisible={this.state.modalVisible}
         content={this.state.content}
         callback={this.setModalVisible.bind(this)}
        >
        </ResultIntroPopView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10
    },
    alertView:{
       padding:5,
       height: 45,
       backgroundColor: "rgba(248, 248, 248, 1)",
       flexDirection: 'row',
       justifyContent: 'flex-start',
    },
    alertViewIcon:{
      marginTop: 2,
      marginLeft: 5
    },
    alertTitle:{

    },
    titleView:{
       padding:5,
       height: 35,
       justifyContent: 'center',
       alignItems: 'center',
       color: "#303030",
       backgroundColor: "#FFF",
    },
    titleText:{
       fontSize: 15,
       fontWeight: "400",
    },
    sectionHeader: {
        paddingTop:15,
        paddingBottom:15,
        paddingLeft:7.5,
        paddingRight:7.5,
        height: 75,
        backgroundColor: "#FFF",
        justifyContent: 'center'
    },
    sectionHeaderText:{
       paddingTop:27,
       paddingLeft:5,
       paddingRight:7.5,
       marginLeft:-5,
       height: 75,
       backgroundColor: "#FFF",
       justifyContent: 'center',
       fontSize: scaleSize(13)
    },
    sectionContainer: {
        height: 75,
        paddingTop:15,
        paddingLeft:0,
        paddingRight:15,
        paddingBottom:15,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionText: {
        flex: 22,
        paddingLeft: 15,
        marginTop:2,
        color:'rgba(48, 48, 48, 1)',
        fontSize:15,
        textAlign:'center',
    },
    sectionImage: {
        flex: 3,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    sectionContent:{
        flexDirection: 'column',
        backgroundColor: "#FFF",
    },
    sectionRowHead:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'#FFF'
    },
    sectionRowContent:{
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionRowHeadTitle:{
        color:'#323232',
        fontSize:15,
    },
    item: {
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 5,
        marginBottom: 0,
        fontSize: 11,
        backgroundColor:'#FFF'
    },
    circle: {
        width: 8,
        height: 8,
        backgroundColor:'#f76260',
        borderRadius: 4
    },
    tableHeader: {
        flex: 1,
        flexDirection: 'row',
        height: 45,
        backgroundColor: '#EFF3F9',
        alignItems: 'center'
    },
    tableHeaderText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 45
    },
    tableBorder: {
        borderWidth: 0.5,
        borderColor: '#E0E8F2'
    }
});

