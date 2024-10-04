import React, { Component } from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import { images } from '../../res/images';
import UINavBar from '../../components/UINavBar';
import FeebackBoxModal from '../common/FeebackBoxModal';

@inject('UserStore') //注入；
@observer
export default class DynamicDetailPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            launcher_img: [],
            list:[
                ["垃圾营销","涉黄信息"],
                ["不实信息", "人身攻击"],
                ["有害信息", "内容抄袭"],
                ["违法信息", "诈骗信息"],
            ],
            selectedText:[],
        };
        this.UserStore = this.props.UserStore;

    }

    async componentDidMount() {

    }
    renderRow(item,index){
        var selectedText = this.state.selectedText;
        return (<View style={styles.row} key={index}>
            { item.map((itt,i)=>{
                return <TouchableOpacity 
                onPress={()=>{
                    var isE = selectedText.indexOf(itt);
                    if (isE===-1){
                        selectedText.push(itt);
                    }else{
                        selectedText.splice(isE,1);
                    }
                    this.setState({
                        selectedText: selectedText,  
                    })
                }}
                style={{
                    width: scaleSize(160),
                    height: (49),
                    alignItems:'center',
                    justifyContent:"center",
                    backgroundColor: selectedText.indexOf(itt) === -1 ? "#f5f5f5" :"rgba(211, 61, 62, 1)",
                }}
                key={i} >
                    <Text style={{ fontSize: 14, color: selectedText.indexOf(itt) === -1 ? '#323232' :"#fff"}}>{itt}</Text>
                </TouchableOpacity>
            })
            }
        </View>)
    }
    render() {
        var list = this.state.list;
        var selectedText = this.state.selectedText;
        return (<View style={{ flex: 1 }}>
            <UINavBar title="举报" />
            <View style={{flex:1}}>
                <ScrollView>
                    <View >
                        <Text style={styles.title}>请选择您要投诉的类型</Text>
                    </View>
                    {list.map((item, index)=>{
                        return this.renderRow(item,index)
                    })}
                    <View style={{ height: scaleSize(20)}}></View>
                    <View style={{alignItems:'center'}}>
                        <TouchableOpacity 
                        onPress={()=>{
                            if (this.state.selectedText.length){
                                RouteHelper.replace("ReportSuccessPage");
                            }
                        }}
                        style={[styles.btn, { backgroundColor:`rgba(211, 61, 62, ${selectedText.length?1:0.5})`}]}>
                            <Text style={[styles.btn_text,{color:"#fff"}]}>提交举报</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                        onPress={()=>{
                            RouteHelper.goBack();
                        }}
                        style={styles.btn}>
                            <Text style={styles.btn_text}>返回</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>)
    }

}







var styles = {
    title:{
        fontSize: 24,
        color: '#323232',
        paddingLeft:scaleSize(15),
        marginTop:scaleSize(20),
        marginBottom: scaleSize(25),
        // fontWeight:"bold",
    },
    row:{
        flex:1,
        flexDirection:"row",
        justifyContent:"space-around",
        marginTop:scaleSize(15)
    },
    btn:{
        backgroundColor: '#F5F5F5',
        height:scaleSize(49),
        width: scaleSize(345),
        alignItems:'center',
        justifyContent:'center',
        marginTop: scaleSize(25),
    },
    btn_text:{
        color: '#323232',
        fontSize:14,
        fontWeight:"400",
    }
}
