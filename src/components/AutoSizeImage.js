import React, {PureComponent} from 'react';
import {
  Image,
  Dimensions,
  Text
} from 'react-native';
import LoadingImage from './LoadingImage';

const {width} = Dimensions.get('window');
var max_width = width-20
const baseStyle = {
  backgroundColor: 'transparent',
};
export default class AutoSizedImage extends PureComponent {
  static defaultProps = {
    style: {
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      // set width 1 is for preventing the warning
      // You must specify a width and height for the image %s
      width: this.props.style.width || width-20,
      height: this.props.style.height || 700,
      // width:250,
      // height:250,
      loadSize:false,
    };
  }

  componentDidMount() {
    //avoid repaint if width/height is given
    if (this.props.style.width || this.props.style.height) {
      return;
    }
    Image.getSize(this.props.source.uri, (w, h) => {
      this.setState({width: w, height: h});
      // this.setState({
      //   loadSize:true,
      // })
       console.warn('load image size success',w,h,this.props.source.uri)
    },(err)=>{
      console.warn('load image size error',err,this.props.source.uri)
    });
  }

  render() {
    const finalSize = {};
    if (this.state.width > width) {
      finalSize.width = max_width;
      const ratio = max_width / this.state.width;
      finalSize.height = this.state.height * ratio;
    }
    const style = Object.assign(
      baseStyle,
      this.props.style,
      this.state,
      finalSize
    );
    let source = {};
    if (!finalSize.width || !finalSize.height) {
      source = Object.assign(source, this.props.source, this.state);
    } else {
      source = Object.assign(source, this.props.source, finalSize);
    }
    // console.log("aaa",style,source);
    // if(!this.state.loadSize) return <Text>2222229999</Text>;
    return <Image 
    // style={{padding:0,margin:0,...style}}
    style={{width:200,height:200}}
    source={source} />;
  }
}
