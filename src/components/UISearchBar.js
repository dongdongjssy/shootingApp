import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, Image, TouchableWithoutFeedback } from 'react-native'
import { images } from '../res/images';

export default class UISearchBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load_status: 0, //0等待加载
            keywords: "",
            isFocus: this.props.autoFocus,
        }
    }
    static defaultProps = {
        placeholder: "搜索关键词",
        onSearch: () => { },
        onCancel: () => { },
        onClear: () => { },
        autoFocus: true,
    }
    clearKeyword() {
        this.setState({
            keywords: "",
        })
    }
    setKeyword(text) {
        this.setState({ keywords: text })
    }
    render() {
        return (
            <View style={styles.searchBox}>
                <TouchableWithoutFeedback
                    onPress={() => {
                        if (!this.state.isFocus) {
                            this.setState({
                                isFocus: true,
                            })
                        }
                    }}
                >


                    <View style={[styles.inputcontent, { justifyContent: this.state.isFocus ? "flex-start" : "center" }]}>
                        <Image
                            source={images.common.search2}
                            style={styles.searchIcon}>
                        </Image>
                        {(this.state.isFocus || this.state.keywords) ? null : <Text style={styles.placeholder}>
                            {this.props.placeholder}
                        </Text>}
                        {(this.state.isFocus || this.state.keywords) ? <TextInput
                            style={[styles.inputText, { textAlign: "left" }]}
                            autoCapitalize='none'  //设置首字母不自动大写
                            value={this.state.keywords}
                            underlineColorAndroid={"transparent"}  //下划线颜色设置为透明
                            placeholderTextColor={'#aaa'}  //设置占位符颜色
                            autoFocus={true}
                            placeholder={this.props.placeholder}
                            keyboardType="web-search"
                            onSubmitEditing={() => {
                                this.props.onSearch(this.state.keywords)
                            }}
                            returnKeyType={'search'}
                            onFocus={() => {
                                this.setState({
                                    isFocus: true,
                                })
                                this.props.onFocus && this.props.onFocus();
                            }}
                            onBlur={() => {
                                this.setState({
                                    isFocus: false,
                                })
                                this.props.onBlur && this.props.onBlur();
                            }}
                            onChangeText={(text) => this.setState({ keywords: text })}
                        /> : null}
                        {this.state.keywords ? <TouchableOpacity
                            onPress={() => {
                                this.props.onClear && this.props.onClear()
                                this.setState({
                                    keywords: "",
                                })
                            }}
                            style={{ marginHorizontal: 10 }}>
                            <Image
                                source={{ uri: "http://static.boycodes.cn/laimei-images/delete3.png" }}
                                style={{ width: 15, height: 15 }}
                            />
                        </TouchableOpacity> : null}
                    </View>
                </TouchableWithoutFeedback>
                {(this.state.isFocus || this.state.keywords) ? <TouchableOpacity style={styles.searchBtn} onPress={() => { this.props.onCancel(this.state.keywords) }}>
                    <Text style={{
                        color: PRIMARY_COLOR,
                        fontSize: 16,
                    }}>取消</Text>
                </TouchableOpacity> : null}
            </View>
        )
    }

}

var styles = {
    searchBox: {
        flexDirection: 'row',
        backgroundColor: "#F2F6F9",
        marginHorizontal: scaleSize(10),
        height: scaleSize(35),
    },
    searchIcon: {
        alignSelf: 'center',
        marginLeft: scaleSize(7),
        marginRight: scaleSize(7),
        width: scaleSize(15),
        height: scaleSize(15),
    },
    inputcontent: {
        flex: 1,
        borderRadius: scaleSize(3),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",

    },
    inputText: {
        marginTop: 0,
        padding: 0,
        height: scaleSize(35),
        marginLeft: 5,
        marginRight: 5,
        fontSize: 15,
        flex: 1,
    },
    searchBtn: {
        width: scaleSize(50),
        height: scaleSize(35),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    placeholder: {
        fontSize: 15,
        color: "#BBBBBB",
        textAlign: 'center',
    }
}