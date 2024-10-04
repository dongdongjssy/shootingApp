import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    DeviceEventEmitter,
} from 'react-native'
import {inject, observer} from 'mobx-react'
import {images} from '../../res/images';


@inject('UserStore','AppStore') //注入；
@observer
export default class BalanceBox extends Component {
	constructor(props) {
	    super(props);
	    this.UserStore= this.props.UserStore;
      this.AppStore=this.props.AppStore;
	    this.canGoBack=false;
  }
  
  onLangChange(lang){
		this.forceUpdate();
    }
    

	async componentDidMount(){
    // this.listener = DeviceEventEmitter.addListener("lang_change", this.onLangChange.bind(this));
	}
	componentWillUnmount() {
    //移除监听
    if (this.listener) {
      this.listener.remove();
    }
    }
    
	render(){
		return (
			<View style={styles.balance_box}>
        <Text style={{position:"absolute",right:-1000000}}>{this.AppStore.app_lang}</Text>
				<View style={styles.balance_box_top}>
					<View style={styles.balance_box_top_left}>
						<Image source={images.balance_icon}  style={{marginLeft:scaleSize(34),width:scaleSize(32),height:scaleSize(32)}}/>
						<Text style={styles.balance_box_top_label}>{I18n.t("Total_balance")}<Text style={styles.balance_box_top_label_small}>(KES)</Text></Text>
					</View>
					<View style={styles.balance_box_top_right}>
						<Text style={styles.balance_box_top_right_txt}>0.78</Text>
					</View>
					<Image source={images.right_arrow} style={{width:scaleSize(20),height:scaleSize(20)}}/>
				</View>
				<View style={styles.balance_box_bottom}>
					<View style={{flex:1,paddingHorizontal:scaleSize(15),flexDirection:"row",alignItems:'center',justifyContent:"space-between"}}>
						<Text style={styles.balance_box_bottom_label}>{I18n.t("Total_credit")}</Text>
						<Text style={styles.balance_box_bottom_val}>0.78</Text>
					</View>
					<View style={{flex:1,paddingHorizontal:scaleSize(15),flexDirection:"row",alignItems:'center',justifyContent:"space-between"}}>
						<Text style={styles.balance_box_bottom_label}>{I18n.t("Wallet")}</Text>
						<Text style={styles.balance_box_bottom_val}>0.00</Text>
					</View>
				</View>
			</View>
			)
	}

}
var styles={
	balance_box:{
    // width:scaleSize(375),
    height:scaleSize(127),
    backgroundColor:'#fff',
  },
  balance_box_top:{
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal:scaleSize(15),
    justifyContent:'center',
  },
  balance_box_top_label:{
    fontSize:15,
    fontFamily:'Arial',
    fontWeight:'bold',
    color:'rgba(63,194,74,1)',
    marginTop:scaleSize(10),
  },
   balance_box_top_label_small:{
    fontSize:10,
    fontFamily:'Arial',
    fontWeight:'400',
    color:'rgba(100,100,100,1)',
    opacity:0.8
  },
  balance_box_top_left:{
    flex:1,
    // alignItems:'center',
    justifyContent:'center',
    width:scaleSize(150),
  },
  balance_box_top_right:{
    flex:1,
    flexDirection:"row",
    justifyContent:"flex-end"
  },
  balance_box_top_right_txt:{
      fontSize:30,
      fontWeight:'bold',
      color:'rgba(50,50,50,1)',
      marginRight:scaleSize(10),
      fontFamily:'Roboto'
  },
  balance_box_bottom:{
    height:scaleSize(45),
    flexDirection:"row",
    alignItems:'center',
    borderTopWidth:ONE_PX,
    borderTopColor:"#F2F2F2"
    // paddingHorizontal:scaleSize(15),
  },
  balance_box_bottom_label:{
    fontSize:12,
    fontFamily:'Arial',
    fontWeight:'bold',
    color:'rgba(63,194,74,1)',
  },
  balance_box_bottom_val:{
    fontSize:12,
    fontFamily:'Roboto',
    color:'#323232',
  },
}
