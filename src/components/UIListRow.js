import React, { PureComponent } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { images } from '../res/images';

export default class UIListRow extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {}
    }
    static defaultProps = {
        disabled: false,
        title: "Submit",
        plain: false,
        textStyle: {}
    }
    renderBottomSeparator() {
        if (this.props.bottomSeparator == 'indent') {
            // console.warn("11");
            return <View style={[{ height: ONE_PX * 2, backgroundColor: "#aaa", position: 'absolute', left: 15, right: 0, bottom: 0 }, this.props.bottomSeparatorStyle]} />
        } else if (this.props.bottomSeparator == 'full') {
            return <View style={[{ height: ONE_PX * 2, backgroundColor: "#aaa", position: 'absolute', left: 0, right: 0, bottom: 0 }, this.props.bottomSeparatorStyle]} />
        }
    }
    render() {
        var ContainerView = View
        if (this.props.onPress) {
            ContainerView = TouchableOpacity;
        }
        return (
            <ContainerView
                {...this.props}
                style={[{ height: scaleSize(50), flexDirection: 'row', backgroundColor: "#fff", alignItems: "center", padding: scaleSize(5 / 2), paddingHorizontal: scaleSize(20) }, this.props.containerStyle]}>
                {this.props.required ? <Text style={{ marginRight: 5, color: "#f00" }}>*</Text> : null}
                {this.props.icon
                    ? <Image style={styles.icon} resizeMode="contain" source={this.props.icon} />
                    : null
                }
                <View style={{ flex: 1, justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
                    {typeof this.props.title === 'string'
                        ? <Text style={[styles.title, this.props.titleStyle]}>{this.props.title}</Text>
                        : null
                    }
                    {this.props.detail && typeof (this.props.detail) != 'object'
                        ? <View style={styles.detail}><Text style={[{ color: "#323232", fontSize: 14 }, this.props.detailStyle]}>{this.props.detail}</Text></View>
                        : <View style={styles.detail}>{this.props.detail}</View>
                    }
                </View>
                {this.props.onPress
                    ? <Image style={styles.arrow_right} source={this.props.rightArrow ? this.props.rightArrow : images.arrow_right} />
                    : null
                }
                {this.renderBottomSeparator()}
            </ContainerView>
        )
    }

}

var styles = {
    title: {
        fontSize: 16,
        color: "#323232",
        fontWeight: "400",
        fontFamily: 'Arial',
        // width:scaleSize(150/2),
    },
    icon: {
        height: scaleSize(32 / 2),
        width: scaleSize(32 / 2),
        marginRight: scaleSize(14 / 2),
        marginLeft: scaleSize(12 / 2),
    },
    arrow_right: {
        tintColor: "#00B549",
        marginLeft: scaleSize(10),
        // marginRight: scaleSize(0),
        width: scaleSize(17),
        height: scaleSize(25),
    },
    detail: {
        flex: 6,
        alignItems: 'flex-end',
        color: "#323232",
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: '400'

    }
}



