/**
 * Textarea
 * Created by xinlc on 20/03/2018.
 * @flow
 */
import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ViewPropTypes,
} from 'react-native';


export default class ToggleIcon extends PureComponent<Props, State> {
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }

 
  render() {
    
    return (
     	<Image style={this.props.style} />
    );
  }
}
