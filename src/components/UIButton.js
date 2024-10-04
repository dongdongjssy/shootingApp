import React, { PureComponent } from 'react' 
import {
    Text,
    TouchableOpacity,
    ActivityIndicator
}from 'react-native'

export default class UIButton extends PureComponent {
    
    constructor(props) {
        super(props);
        this.state={
        	plainStyle:{
				borderWidth:1,
				borderColor:this.props.primaryColor,
                backgroundColor:"transparent",
        	}
        }
    }
	static defaultProps = {
	  disabled: false,
	  title:"Submit",
	  plain:false,
      loading:false,
      textStyle:{},
      primaryColor:PRIMARY_COLOR
	}
    renderCon(){
        // 5695FF
        var colors=['#02E4FF',  '#00A8FF']
        if(this.props.disabled){
            colors=['#ccc','#ccc'];
        }
        var plainStyle={};
        var plainTextStyle={}
        if(this.props.plain){
            plainStyle=this.state.plainStyle;
            colors=['#fff','#fff'];
            plainTextStyle={color:this.props.primaryColor}
        }
        return typeof this.props.title=='string'
                    ?<>{this.props.icon}<Text numberOfLines={1} style={[styles.title,plainTextStyle,{...this.props.textStyle}]}>{this.props.title}</Text></>
                    :this.props.title
                    
    }
    render(){
    	 var colors=['#02E4FF',  '#00A8FF']
        if(this.props.disabled){
            colors=['#ccc','#ccc'];
        }
        var plainStyle={};
        var plainTextStyle={}
        if(this.props.plain){
            plainStyle=this.state.plainStyle;
            colors=['#fff','#fff'];
            plainTextStyle={color:this.props.primaryColor}
        }
        return(
        	<TouchableOpacity   
            onPress={this.props.onPress}  
            style={[{
                ...styles.containerStyle,
                backgroundColor:this.props.primaryColor
            },this.props.containerStyle,this.props.disabled?styles.disabled:null,plainStyle]}
            disabled={this.props.disabled}>
                {this.props.loading && <ActivityIndicator />}
                {this.renderCon()}
				{/*<Text style={[styles.title,plainTextStyle,this.props.textStyle]}>
                                    {this.props.title}          
                                </Text>*/}
        	</TouchableOpacity>
        )
    }
    
}

var styles={
    containerStyle:{
        height:scaleSize(44),
        width:scaleSize(310),
        backgroundColor:PRIMARY_COLOR,
        alignItems:'center',
        justifyContent:'center',
        // borderRadius:scaleSize(4),
        flexDirection:'row',
    },
	title:{
        fontSize:18,
        color:"#fff",
        fontWeight:'400',
    },
    disabled:{
        backgroundColor:PRIMARY_COLOR,
        opacity:0.7
    }
}



