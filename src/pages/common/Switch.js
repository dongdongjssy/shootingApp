import React, {Component} from 'react';
import {TouchableOpacity, Animated, StyleSheet} from 'react-native';
import {scaleSize} from '../../global/utils';
import {images} from '../../res/images';

export default class Switch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchState: this.props.switchState || false,
    };
    this.SwitchAnimateValue = new Animated.Value(scaleSize(2));
    if (this.props.switchState) {
      this.SwitchAnimateValue.setValue(scaleSize(22));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {switchState} = this.props;
    if (switchState !== nextProps.switchState) {
      this.setState({switchState: nextProps.switchState}, () => {
        this._StartAnimate();
      });
    }
    return true;
  }

  _StartAnimate = () => {
    const {SwitchAnimateValue} = this;
    const {switchState} = this.state;
    Animated.timing(SwitchAnimateValue, {
      toValue: switchState ? scaleSize(22) : scaleSize(2),
      duration: 150,
      useNativeDriver: true, // 启用原生动画
    }).start();
  };

  render() {
    const {SwitchAnimateValue} = this;
    const {switchState} = this.state;
    const backgroundColor = switchState ? 'rgb(17,188,1)' : 'rgb(122,122,122)';
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={this.props.onPressHandle}
        style={[styles.switchBtn, {backgroundColor}]}>
        <Animated.Image
          style={[
            styles.switchCenter,
            {transform: [{translateX: SwitchAnimateValue}]},
          ]}
          source={images.common.btn_switch_point}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  switchBtn: {
    width: scaleSize(35),
    height: scaleSize(16),
    position: 'relative',
    borderRadius: scaleSize(45),
  },
  switchCenter: {
    position: 'absolute',
    top: scaleSize(2),
    width: scaleSize(12),
    height: scaleSize(12),
    borderRadius: scaleSize(35),
    backgroundColor: '#ccc39d',
  },
});
