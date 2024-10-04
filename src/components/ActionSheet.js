import React, {Component} from 'react';
import {Animated, Text, StyleSheet, TouchableOpacity, View} from 'react-native';

export default class ActionSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.pannelAnimatValue = new Animated.Value(0);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.openActionSheet !== nextProps.openActionSheet) {
      this.showPlayerFuncPannelAnimat();
    }
    return true;
  }

  showPlayerFuncPannelAnimat = () => {
    const {hideHeight} = this.props;
    Animated.timing(this.pannelAnimatValue, {
      toValue: !this.props.openActionSheet ? -hideHeight : hideHeight,
      duration: 300,
      // useNativeDriver: true, // 启用原生动画
    }).start();
  };

  renderFuncPanalItem = () => {
    const funcPanalItemView = [];
    const {ActionSheetList} = this.props;
    ActionSheetList.map((item, index) => {
      funcPanalItemView.push(
        <TouchableOpacity
          onPress={() => item.callBack()}
          style={styles.funcPanalItem}
          key={index}>
          <Text style={{fontSize: 11, color: '#333'}}>{item.Text}</Text>
        </TouchableOpacity>,
      );
    });
    return funcPanalItemView;
  };

  render() {
    const {callBack} = this.props;
    return (
      <Animated.View
        style={[
          styles.playerFuncPannel,
          {transform: [{translateY: this.pannelAnimatValue}]},
        ]}>
        <View style={styles.funcPannelHeader}>
          <TouchableOpacity
            onPress={() => {
              this.showPlayerFuncPannelAnimat();
              if (callBack) {
                callBack();
              }
            }}
          />
        </View>
        <View style={styles.funcPanelCont}>{this.renderFuncPanalItem()}</View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  playerFuncPannel: {
    width: '100%',
    // height: scaleSize(200),
    paddingBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowRadius: 12,
    alignItems: 'center',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.3,
    position: 'absolute',
    bottom: -240,
    left: 0,
    zIndex: 100,
  },
  funcPannelHeader: {
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
  },
  funcPanelCont: {
    width: '90%',
    height: '100%',
    paddingTop: 5,
    borderTopColor: '#eee',
    borderTopWidth: 0.5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  funcPanalItem: {
    width: '24.5%',
    height: 70,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
