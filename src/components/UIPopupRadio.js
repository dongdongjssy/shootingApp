import React, {Component} from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Image
} from 'react-native';

import {
	Toast,
	TabView,
	NavigationBar,
	Carousel,
	Overlay,
} from 'teaset';
export default {
	show(items=[],options={}){
		let overlayView = (
		  <Overlay.PullView side='bottom' modal={false}>
		    <View style={{backgroundColor: '#fff', width:'100%', 
		    minHeight: scaleSize(150)}}>
		     	<SelectContent 
		     	items={items} 
		     	{...options}
		     	onClose={()=>{
					Overlay.hide(this.overlay_key);
		     	}}
		     	 />
		    </View>
		  </Overlay.PullView>
		);
		this.overlay_key = Overlay.show(overlayView);
	},
	hide(){
		Overlay.hide(this.overlay_key);
	}
}
var styles={
	head_btn:{
		width:scaleSize(50),
		alignItems:'center',justifyContent:'center',
	}
}
var checkIcon="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAoCAMAAABthZI6AAABAlBMVEUAAAAAAAD/AAD/AAD/AAD/AADbJCTfICDRLi7VKirSPDzVOTnVNUDWMz3XODjYNjbSPDzSOTnTODjWPT3XPDzXOj/VOz/WOj7TPDzVODjVOzvWOzvVOzvVOz7WOz7UPT3SPT3UPT3VOz3UOzvTOz7VOz7TOz3UPD7TPD7UPDzVPD7UPD7UPT3VPD7UPD3TPT3TPT3TPD3TPT7TPT7TPT3TPT3TPD7TPD3UPT7UPT7TPT7TPT7UPT3UPT3UPT7UPD3UPD3UPT7UPD3UPT7UPD3UPT3UPD3TPD3TPT7UPT7TPD3TPT7TPT7TPD7TPT7VPD7UPD3TOz3UPT7VPT7UPD3UPT7srRHwAAAAVHRSTlMAAQECAwQHCAsMERIYGSAhIigpMjM5PT5ASUlKVlZXZGVlbHF0eHl8gIOHiJOZmqeotLS1wMHLzNXW3d7l5uzt8vLz8/T09fb29/r6+/z8/P3+/v5PZ2utAAABPklEQVRIx53VaVPCMBCA4a3igTdWq1axnljF+74vUKk32Pz/vyLKBpKQpN3ux+w8M0ybvgAQxymvQZYpsUaQgS0xxj7pcPGb/cEikS2w1jQ8Ept/R3c6SGEzEWdDFDZVQXZOYpN3yC5HSOwG2fUYhY1zdlugsNErzlzxeDaBDV8ge5BYyEIry58hq3kyY1aYP0H25qvMBgc4k69liKcm2HfEWaBjJti7z++y/PV0nBY6u7j8WVc2VuiU+W6ra2eD7d2O5reYYYmf7/WAHW6qMWmxnP5Zb3TgthqT5hzmTO92RQN9XoXjfvNd6oZ+lComKvSilFWQoduOSWIVRFigxESAT6SYCDAmxUSBchXSwrhG+BcQ4NccpXirMXf3ExQ3/Yrw0QXS+B//sEpkAMV6Ez6TGUBQj18yMIDlg0T2C+3npjXNqDV7AAAAAElFTkSuQmCC";
class SelectContent extends Component{
	constructor(props) {
	  super(props);
	
	  this.state = {
	  	selectedColor:"#ccc",
	  	selectIndex:this.props.selectIndex,
	  };
	}
	render(){
		var {items,onPress}=this.props
		return (
			<View style={{flex:1}}>
		     <ScrollView>
		     	{
		     	items.map((item,index)=>{
					return (
						<TouchableOpacity 
						key={index} 
						style={{color:'#fff',
						height:scaleSize(45),
						borderColor:"#ccc",
						borderTopWidth:ONE_PX,
						backgroundColor:this.state.selectIndex!==index?"#F7F7F7":'#fff',
						justifyContent:'center',
						flexDirection:"row",
						alignItems:'center',
						}}
						onPress={()=>{
							onPress && onPress(item);
							if(title){
								this.setState({
									selectIndex:index, //选择中的索引；
								});
							}else{
								this.props.onClose && this.props.onClose()
							}
						}}>
							<Text stylle={{fontSize:16,fontWeight:'400',color:this.state.selectIndex===index?"rgba(212,61,62,1)":"#000000"}}>{item.title}</Text>
							{this.state.selectIndex==index && <Image 
							style={{width:scaleSize(14),height:scaleSize(10),position:"absolute",right:scaleSize(40),top:scaleSize(20)}} 
							source={{uri:checkIcon}} />}
						</TouchableOpacity>
						)
		     	})
		     }
		     </ScrollView>
			</View>
			)
	}
}




