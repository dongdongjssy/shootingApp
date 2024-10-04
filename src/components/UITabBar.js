import React, { PureComponent } from 'react' 
import {
    Platform,
    Dimensions,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Easing,
    TextInput
}from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import { scaleSize } from '../global/utils';

export default class UITabBar extends PureComponent {
    
    constructor(props) {
        super(props);
        this.state={
        	// tabActiveIndex:this.props.activeIndex,
        	activeTabTextStyle:{
				fontSize:15,fontWeight:"500",color:PRIMARY_COLOR,
				fontFamily:"PingFang SC",
			},
        }
    }
    static defaultProps = {
    	activeIndex:0
    }
	
	onPressTab(i){
		this.props.onChange && this.props.onChange(i)
	}
    render(){
    	 const {
            children,
            tabStyle
        } = this.props;
    	return (
    		<View style={{flex:1}}>
    			<View style={[styles.tabbar,tabStyle]}>
    				{ React.Children.map(children,  (child,i) => {
    					// console.log("1",child);
    					if(this.props.renderTabItem){
							return this.props.renderTabItem(i);
    					}
    					return <TouchableOpacity 
							onPress={this.onPressTab.bind(this,i)}
								style={[styles.tabItem,this.props.activeIndex==i?{borderBottomWidth:scaleSize(2),borderBottomColor:PRIMARY_COLOR,backgroundColor:'#FFFFFF'}:null]}
							>
								<Text style={[styles.tabItemText,this.props.activeIndex==i?this.state.activeTabTextStyle:null]}>{child.props.label}</Text>
							</TouchableOpacity>
    				})}
    				{/*
					<TouchableOpacity 
					onPress={this.onPressTab.bind(this,0)}
						style={[styles.tabItem,this.props.activeIndex==0?{borderBottomWidth:scaleSize(2),borderColor:PRIMARY_COLOR}:null]}
					>
						<Text style={[styles.tabItemText,this.props.activeIndex==0?this.state.activeTabTextStyle:null]}>主页</Text>
					</TouchableOpacity>
					<TouchableOpacity 
					onPress={this.onPressTab.bind(this,1)}
					style={[styles.tabItem,this.props.activeIndex==1?{borderBottomWidth:scaleSize(2),borderColor:PRIMARY_COLOR}:null]}>
						<Text style={[styles.tabItemText,this.props.activeIndex==1?this.state.activeTabTextStyle:null]}>活动</Text>
					</TouchableOpacity>
					<TouchableOpacity 
					onPress={this.onPressTab.bind(this,2)}
					style={[styles.tabItem,this.props.activeIndex==2?{borderBottomWidth:scaleSize(2),borderColor:PRIMARY_COLOR}:null]}>
						<Text style={[styles.tabItemText,this.props.activeIndex==2?this.state.activeTabTextStyle:null]}>图片</Text>
					</TouchableOpacity>*/}
				</View>
				{children[this.props.activeIndex]}

    		</View>
    		)
    }
    
}



export  class Item extends PureComponent {
	render(){
		return this.props.children
	}
}

UITabBar.Item = Item;


var styles={
	tabbar:{
		// height:scaleSize(42),
		flexDirection:'row',
		backgroundColor:"#fff",
	},
	tabItem:{
		flex:1,
		alignItems:'center',
		justifyContent:'center',
		height: scaleSize(45),
		backgroundColor: '#E9E9E9',
		borderLeftWidth: scaleSize(1),
		borderLeftColor: '#d9d9d9',
	},
	tabItemText:{
		fontSize:15,
		color:"#303030",
		fontFamily:'PingFangSC-Regular',
	},
}