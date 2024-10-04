/**
 * @Author: Ghan 
 * @Date: 2019-12-19 10:44:41 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-19 13:47:31
 */

import React from 'react';
import {
  View, 
  Image,
  ImageStyle,
  ImageSourcePropType
} from 'react-native';
import ImageDefault from '../res/images/common/perloadingimg.png';

type Props = {
  source: ImageSourcePropType;
  style?: ImageStyle;
  defaultSource?: ImageSourcePropType;
  onLoad?: () => void;
  onError?: () => void;
};
type State = {
  loadStatus: 'pending' | 'error' | 'success';
};

export default class LoadImage extends React.Component<Props, State> {

	static defaultProps = {
		onLoad: () => {},
		onError: () => {}
	};

	constructor(props) {
    	super(props);
    	this.state = {
    		loadStatus: 'pending'
    	};
  }
  
  /**
   * @todo 开始加载
   */
  public onLoadStart = () => {
    
  }
  
	/**
   * @todo 加载结束
   */
	public onLoadEnd = () => {
    
	}

	/**
   * @todo 加载成功
   */
	public handleImageLoaded = () => {
    this.setState({ loadStatus: 'success' }, () => {
			this.props.onLoad();
		});
	}

	/**
   * @todo 加载失败
   * @param {*} error
   */
	public handleImageErrored = (error) => {
    this.setState({ loadStatus: 'error' }, () => {
			this.props.onError();
		});
	}

	/**
   * @todo 渲染加载中界面
   */
	renderPending() {
		const { style } = this.props;
    return (
      <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
        <Image 
          style={{ width: '100%', height: '100%' }} 
          source={ImageDefault} 
        />
      </View>
    );
	}

	/**
   * @todo 渲染加载失败界面
   */
	renderError() {
    const { style, defaultSource } = this.props;
    return (
      defaultSource
        ? (<Image source={defaultSource} style={[{ position: 'absolute' }, style]} />)
        : (
          <View 
            style={[
              {
                justifyContent: 'center', backgroundColor: '#eceff4', position: 'absolute', alignItems: 'center',
              }, 
              style
            ]}
          />
        )
    );
	}

	render() {
		const { style, source } = this.props;
		const { loadStatus } = this.state;
    return (
      <View style={[style, { overflow: 'hidden' }]}>
        <Image
          source={source}
          style={style}
          onLoadStart={this.onLoadStart.bind(this)}
          onLoadEnd={this.onLoadEnd.bind(this)}
          onLoad={this.handleImageLoaded.bind(this)}
          onError={this.handleImageErrored.bind(this)}
        />
        {loadStatus === 'pending' && this.renderPending()}
        {loadStatus === 'error' && this.renderError()}
      </View>
    );
	}
}