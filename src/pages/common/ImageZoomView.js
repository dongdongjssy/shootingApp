import React, {Component} from 'react';
import {
    Text,
    View,
    DeviceEventEmitter,
} from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer';

export default class ImageZoomView extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
             imageUrls:props.imageUrls,
        };
    }

	async componentDidMount(){
	}

	componentWillUnmount() {
    }
    
    render() {
    return (
            <ImageViewer
                imageUrls={this.state.imageUrls}
                index={0} // 榛樿閫変腑绗嚑寮犲浘
                onClick={()=>{ // 鐐瑰嚮
                    console.log('234');
                }}
            />

    );
  }

}
var styles={

}
