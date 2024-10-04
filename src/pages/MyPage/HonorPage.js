import React, { Component } from 'react'
import { Text, View, Image, ScrollView, Dimensions } from 'react-native'
import UINavBar from '../../components/UINavBar'
import store from '../../store'
import Url from '../../api/Url'
import Request from '../../api/Request'
import { Toast, ModalIndicator } from 'teaset';
import { scaleSize } from '../../global/utils'
import EmptyView from '../../components/EmptyView';

export default class MyRolesPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			loginuser: undefined,
			status: "",
            rolesData: []
		}
	}

    async componentDidMount() {
        var user = await store.UserStore.getLoginUser()
		this.state.loginuser = user
		this.state.status = user.status
		this.forceUpdate()

        this.renderUserRole2ndRow()
    }

    //荣誉榜
	renderUserRole2ndRow = async () => {
		await Request.post(Url.HONOR_LIST, { clientUserId: this.state.loginuser?.id }).then(res => {
			if (res.status === 200) {
				this.setState({
					rolesData: res?.data?.rows
				})
			}
		}).catch(err => ModalIndicator.hide())
	}

    render() {
		return <View style={{ flex: 1, backgroundColor: "#F2F6F9" }}>
                <UINavBar title="荣誉榜"/>
                <ScrollView style={{backgroundColor: '#FFFFFF',padding: scaleSize(20)}}>
                    {
                        this.state.rolesData?.slice(0,3).map((item,index)=>{
                            return (
                                <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',paddingTop: scaleSize(10),paddingBottom: scaleSize(10),borderBottomColor: '#EFEFEF',borderBottomWidth: scaleSize(1)}} key={index}>
                                    <Image
                                        source={{uri: Url.HONOR_IMAGE + item?.pictureUrl}}
                                        style={{width: scaleSize(40),height: scaleSize(40),marginRight: scaleSize(15)}} />
                                    <Text numberOfLines={1}>{item?.title}</Text>
                                </View>
                            )
                        })
                    }
                    {
                        this.state.rolesData.length == 0 && <EmptyView />
                    }
                </ScrollView>
            </View>
    }
}