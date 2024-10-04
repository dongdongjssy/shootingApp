import React, { Component } from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet, FlatList } from "react-native";
import { Overlay } from 'teaset';
import { countries } from './countries';

export default class UIPhoneInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            countries: countries.filter(item => item.display),
            pickedCountry: countries.filter(item => item.code === (props.code?props.code:"cn"))[0]
        }
    };

    getDialCode() {
        return this.state.pickedCountry.dialCode
    }

    openCountryOptions() {
        let overlayView = (
            <Overlay.PullView side='bottom' modal={true} ref={v => this.overlayView = v} >
                <View style={styles.popup_window}>
                    <View style={styles.popup_btn_row}>
                        <TouchableOpacity onPress={() => this.overlayView && this.overlayView.close()}                        >
                            <Text style={styles.popup_btn_text}>{I18n.t('Cancel')}</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList 
                        keyExtractor={item => item.code}
                        data={this.state.countries}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.countryRow} onPress={() => {
                                this.setState({ pickedCountry: item });
                                this.overlayView && this.overlayView.close();
                            }}>
                                <Image style={[{ width: '15%' }, styles.flagImg]} source={item.flag} />
                                <Text style={{ width: '70%' }}>{item.name}</Text>
                                <Text style={{ width: '15%' }}>{"+".concat(item.dialCode)}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Overlay.PullView >
        );
        Overlay.show(overlayView);
    };

    render() {
        return (
            <View style={[{ flexDirection: 'row', flex: 1 }, this.props.containerStyle]}>
                <TouchableOpacity disabled={this.props.disabled} style={styles.flagTouch} onPress={() => this.openCountryOptions()}>
                    <Image style={styles.flagImg} source={this.state.pickedCountry ? this.state.pickedCountry.flag : this.state.countries[0].flag} />
                    <Text style={styles.dialCode}>{"+".concat(this.state.pickedCountry ? this.state.pickedCountry.dialCode : this.state.countries[0].dialCode)}</Text>
                </TouchableOpacity>
            </View>
        )
    }
};

var styles = StyleSheet.create({
    flagTouch: {
        flex: 1,
        flexDirection: 'row',
        height: scaleSize(50),
        justifyContent: 'center',
        alignItems: 'center'
    },
    flagImg: {
        width: scaleSize(30),
        height: scaleSize(20),
    },
    dialCode: {
        marginHorizontal: scaleSize(3)
    },
    popup_window: {
        backgroundColor: '#fff',
        maxHeight: scaleSize(500),
        height:'100%'
    },
    popup_btn_row: {
        borderBottomColor: '#ededed',
        borderBottomWidth: 1,
        justifyContent: 'flex-start'
    },
    popup_btn_text: {
        textAlign: 'right',
        textAlignVertical: 'center',
        fontSize: 16,
        padding: scaleSize(10),
        paddingRight: scaleSize(20)
    },
    countryRow: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: scaleSize(12),
        paddingHorizontal: scaleSize(10),
        backgroundColor:'#f9f9f9',
        borderBottomColor:'#fff',
        borderBottomWidth:1
    }
})