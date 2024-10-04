import React, {Component} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    ImageBackground,
    Image,
    DeviceInfo,
} from 'react-native'
import {RouteHelper} from 'react-navigation-easy-helper'
import {inject, observer} from 'mobx-react'
import {images} from '../../res/images';
import {
	Toast,
	TabView,
	Carousel,
	Overlay,
	NavigationBar
} from 'teaset';
import UIButton from '../../components/UIButton';
import LangSelect from '../common/LangSelect';
import simpleStore from '../../libs/simpleStore';
@inject('UserStore','AppStore') //注入；
@observer
export default class GuidePage extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
			guid_pages:[
				{
					guid_img:images.guid1_img,
				},
				{
					guid_img:images.guid2_img,
				},
				{guid_img:images.guid3_img},
			],
			curPageIndex:0,
			lang_arrow_dir:'down',
	    };	
	    this.UserStore= this.props.UserStore;
	    this.AppStore = this.props.AppStore;

	}
	async componentDidMount(){
		// alert("11");
		// StatusBar.setHidden(true);
	}
	componentWillUnmount(){
		// StatusBar.setHidden(false);
	}

	renderContent(item,index){
		if(index==0){
			return (
				<View style={{alignItems:'center',flex:1}}>
					<Image 
						source={images.guid1_img}
						style={{
							width:scaleSize(375),
							height:scaleSize(297),
							marginTop:scaleSize(150)
						}}
					/>
					<Text style={{fontSize:36,
						marginTop:scaleSize(34),
						fontWeight:"bold",
						fontFamily:'Arial',
						color:"#323232",
						textAlign:'center'}}>
						{I18n.t('guid1')}
					</Text>
					<Text style={{fontSize:20,
                    	marginTop:scaleSize(4),
                    	fontWeight:"bold",
                    	fontFamily:'Arial',
                    	color:"#323232",
                   		textAlign:'center'}}>
                    	{I18n.t('guid1_subTitle')}
                    </Text>
				</View>
			)	
		}else if(index==1){
			return (
				<View style={{alignItems:'center',flex:1}}>
					<Image 
						source={images.guid2_img}
						style={{
							width:scaleSize(375),
							height:scaleSize(297),
							marginTop:scaleSize(150)
						}}
					/>
					<Text style={{fontSize:36,
						marginTop:scaleSize(34),
						fontWeight:"bold",
						fontFamily:'Arial',
						color:"#323232",
						textAlign:'center'}}>
						{I18n.t('guid2_title')}
					</Text>
					<Text style={{fontSize:19,
                    	marginTop:scaleSize(4),
                    	fontWeight:"bold",
                    	fontFamily:'Arial',
                    	color:"#323232",
                   		textAlign:'center'}}>
                    	{I18n.t('guid2_subTitle')}
                    </Text>
				</View>
			)
		}else if(index==2){
			return (
				<View style={{alignItems:'center',flex:1}}>
					<Image 
						source={images.guid3_img}
						style={{
							width:scaleSize(375),
							height:scaleSize(297),
							marginTop:scaleSize(150)
						}}
					/>
					<Text style={{fontSize:36,
						marginTop:scaleSize(34),
						fontWeight:"bold",
						fontFamily:'Arial',
						color:"#323232",
						textAlign:'center'}}>
						{I18n.t('guid3_title')}
					</Text>
					<Text style={{fontSize:18,
                       	marginTop:scaleSize(4),
                    	fontWeight:"bold",
                    	fontFamily:'Arial',
                    	color:"#323232",
                   		textAlign:'center'}}>
                    	{I18n.t('guid3_subTitle')}
                    </Text>
				</View>
			)
		}
	}
	renderDot(active){
		return <View style={{
			width:scaleSize(10),
			marginLeft:scaleSize(6),
			borderRadius:scaleSize(5),
			height:scaleSize(10),
			backgroundColor:active?'#00B549':'#fff',
			borderWidth:scaleSize(1),
			borderColor:"#00B549"
			}} />				
	}
	onPressChangeLang(){
		this.refs.change_view.measureInWindow((x, y, width, height) => {
			 let fromBounds = {x:x, y:y-5, width, height};	
			 this.setState({
			 	lang_arrow_dir:'up',
			 })
			LangSelect.show(fromBounds,(item)=>{
				this.AppStore.setLocaleLang(item)
				this.forceUpdate();
				// alert(I18n.locale);
				this.setState({
				 	lang_arrow_dir:'down',
				 })
			},()=>{
				this.setState({
				 	lang_arrow_dir:'down',
				 })
			},'#D6E8F5');
		});
	}
	renderLangSelect(index){
		if(index!==0) return null;
		return (<TouchableOpacity 
			ref="change_view"
			onPress={this.onPressChangeLang.bind(this)}
			style={{width:scaleSize(80),
				flexDirection:'row',
				alignItems:'center',
				zIndex:999,
				height:scaleSize(40),position:'absolute',top:scaleSize(60),right:scaleSize(15)}}>
				<Text style={{color:"#333",fontSize:14,color:"#fff"}}>{
					lang_map[I18n.locale]
				}</Text>
				<Image source={images.arrow_down2} style={{
					marginLeft:scaleSize(10),
					width:scaleSize(12),height:scaleSize(7),
					transform:[
						{rotate:this.state.lang_arrow_dir=='down'?"0deg":"180deg"}
					]
					}}/>
			</TouchableOpacity>)
	}
	async gotoLogin(){
		simpleStore.save("isFirst","1");
		RouteHelper.reset("LoginPage");
	}
	render(){

		return (
			<View style={{flex:1}}>
			<NavigationBar
				statusBarStyle="dark-content"
				style={{backgroundColor:"rgba(0,0,0,0)"}}
			/>
			<Carousel 
				style={{flex:1}}
				onChange={(index,total)=>{
					this.setState({curPageIndex:index})
				}}
				control={
			    <Carousel.Control
			      style={{marginBottom:DeviceInfo.isIPhoneX_deprecated?34+70:110}}
			      dot={this.renderDot()}
				  activeDot={this.renderDot(true)}
			      />
			  }
				dot={this.renderDot()}
				activeDot={this.renderDot(this.state.curPageIndex)}
				carousel={false}
				cycle={false}
			>
			
				{
					this.state.guid_pages.map((item,index)=>{
						return <View 
						key={index} style={{
							flex:1,
							backgroundColor:'#fff',
						}}>
							{this.renderContent(item,index)}
							{ index==2 ? (
									<View style={{justifyContent:'center',alignItems:"center"}}>
                            								<UIButton
                            								textStyle={{fontFamily: 'Roboto'}}
                            								onPress={()=>{
                            									this.gotoLogin();
                            									//
                            								}}
                            								containerStyle={{
                            								borderWidth:ONE_PX,
                            								borderColor:"#fff",
                            								bottom:DeviceInfo.isIPhoneX_deprecated?34+15:55,
                            								width:scaleSize(125),
                            								height:scaleSize(44),
                            								alignItems:"center",
                            								justifyContent:'center'}}
                            								title={I18n.t('get_started')}/>
                            		</View>
							  ):(
							      <View style={{justifyContent:'center',alignItems:"center"}}>
                                  </View>
							  )}
						</View>
					})
				}
			</Carousel>
			</View>
			)
		
	}

}







