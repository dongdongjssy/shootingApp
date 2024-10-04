import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    InteractionManager,ActivityIndicator
} from 'react-native';



export default class LoadingPage extends Component {
	static  defaultProps = {
        loadingText:"正在加载页面..."
    };
    render() {
        const fadeOut = {
			from: {
			  opacity: 1,
			},
			to: {
			  opacity: 0.1,
			},
        };
        return (
            <View  duration={50} animation={fadeOut}  style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <ActivityIndicator size= 'large' />
                {this.props.loadingText?<Text>{this.props.loadingText}</Text>:null}
            </View>
            // <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            //     <Spinkit size={70} type={'Circle'}/>
            //     <Text>正在加载页面...</Text>
            // </View>
        );
    }
}


const styles = StyleSheet.create({
});

