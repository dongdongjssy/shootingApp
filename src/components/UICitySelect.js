import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Toast, TabView, NavigationBar, Carousel, Overlay, Wheel } from 'teaset';

export default {
	show(area = [], onConfirm = () => { }, onCancel = () => { }, title = "地区") {
		let overlayView = (
			<Overlay.PullView side='bottom' modal={false}>
				<View style={{
					backgroundColor: '#fff', width: '100%',
					minHeight: 260,
				}}>
					<SelectContent
						area={area}
						onConfirm={onConfirm}
						onCancel={onCancel}
						onClose={() => {
							Overlay.hide(this.overlay_key);
						}}
						title={title}
					/>
				</View>
			</Overlay.PullView>
		);
		this.overlay_key = Overlay.show(overlayView);
	},
	hide() {
		Overlay.hide(this.overlay_key);
	}
}
var styles = {
	head_btn: {
		width: scaleSize(80),
		alignItems: 'center', justifyContent: 'center',
	}
}
class SelectContent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			country_index: 0,
			city_index: 0,
		};
	}
	render() {
		var { title, onCancel, onConfirm, area } = this.props
		var title = this.props.title ? this.props.title : "地区";
		// console.log("I18n",I18n.locale);
		return (
			<View style={{ flex: 1 }}>
				{title
					? <View style={{
						height: scaleSize(44),
						alignItems: 'center',
						flexDirection: "row",
						justifyContent: 'space-between',
					}}>
						<TouchableOpacity
							onPress={() => {
								this.props.onClose && this.props.onClose();
								onCancel && onCancel()
							}}
							style={styles.head_btn}
						><Text style={{ color: '#000', fontSize: 17 }}>{"取消"}</Text></TouchableOpacity>
						<Text style={{ color: "#000", fontWeight: '600', fontSize: 17 }}>{title}</Text>
						{onConfirm ? <TouchableOpacity
							onPress={() => {
								if (area[this.state.country_index]) {
									onConfirm && onConfirm(area[this.state.country_index].items[this.state.city_index])
								}
								this.props.onClose && this.props.onClose();
							}}
							style={styles.head_btn}
						><Text style={{ color: PRIMARY_COLOR, fontSize: 17 }}>{"确定"}</Text></TouchableOpacity> : <View style={styles.head_btn} />}
					</View>
					: null
				}
				<View style={{ flex: 1, flexDirection: "row" }}>
					<Wheel
						style={{ flex: 1 }}
						itemStyle={{ textAlign: 'center' }}
						index={this.state.country_index}
						defaultIndex={0}
						onChange={(index) => {
							// console.warn("country index ", index)
							this.setState({
								country_index: index,
								city_index: 0,
							})
							// console.log(area[this.state.city_index]);
						}}
						// holeLine={null}
						items={area.map((item, index) => {
							return <View key={index} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 42 }}>
								<Text style={{ fontSize: 17, color: this.state.country_index == index ? PRIMARY_COLOR : '#000000' }}>{item.country_name}</Text>
							</View>
						})}
					/>
					<Wheel
						onChange={(index) => {
							// console.warn("city index: ", index);
							this.setState({
								city_index: index,
							})
						}}
						style={{ flex: 1 }}
						defaultIndex={0}
						holeLine={null}
						index={this.state.city_index}
						itemStyle={{ textAlign: 'center' }}
						items={(area[this.state.country_index]) ? area[this.state.country_index].items.map((item, index) => {
							return <View key={index} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 42 }}>
								<Text style={{ fontSize: 17, color: this.state.city_index == index ? PRIMARY_COLOR : '#000000' }}>{item.city_name}</Text>
							</View>
						}) : []}
					/>
				</View>

			</View>
		)
	}
}


var area = [
	{
		country_name: "中国",
		id: 1,
		items: [
			{
				city_name: "广州", id: 2,
			},
			{
				city_name: "上海", id: 3,
			},
			{
				city_name: "深圳", id: 4,
			}
		]
	},
	{
		country_name: "印度",
		id: 5,
		items: [
			{
				city_name: "广州", id: 2,
				city_name: "上海", id: 3,
				city_name: "深圳", id: 4,
			}
		]
	}
]

