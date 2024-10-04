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

export default class UIButton extends PureComponent {
    
    constructor(props) {
        super(props);
        this.state={
        	
        }
    }
	// static defaultProps = {
	//   disabled: false,
	//   title:"Submit",
	//   plain:false,
 //      textStyle:{}
	// }
    render(){
    	var {containerStyle,inputStyle,...ret} =this.props;
    	return (
    		<View style={{width:scaleSize(480),
    			flexDirection:'row' ,
    			height:scaleSize(80),
    			borderBottomWidth:ONE_PX,
    			borderBottomColor:'#aaa',
    			justifyContent:"center",alignItems:'center'}}>
    			<TextInput 
    			{...this.props}
				style={[inputStyle]}
    			/>
    			{this.props.appendIcon}
    		</View>
    		)
    }
    
}

var styles={
	
}



