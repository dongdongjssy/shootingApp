import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Overlay } from 'teaset';
import { scaleSize } from '../global/utils';

export default {
	show(text = "", onConfirm = () => { }, onCancel = () => { }) {
		let overlayView = (
			<Overlay.PopView
				style={{ alignItems: 'center', justifyContent: 'center' }}
				modal={false}>
				<View style={{
					backgroundColor: '#fff', width: '100%',
					minHeight: 135, width: scaleSize(270),
					borderRadius: scaleSize(7),
				}}>
					<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
						<Text style={{ fontSize: 18, color: "#000", textAlign: 'center', marginHorizontal: scaleSize(5) }}>{text}</Text>
					</View>
					<View style={{ height: scaleSize(50), borderTopWidth: ONE_PX, borderColor: "#DDDDDD", flexDirection: "row" }}>
						<TouchableOpacity
							onPress={() => {
								onCancel && onCancel();
								this.hide();
							}}
							style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
							<Text style={{ fontSize: 18, color: "#000" }}>取消</Text>
						</TouchableOpacity>
						<View style={{ width: ONE_PX, height: '100%', backgroundColor: "#DDDDDD" }}></View>
						<TouchableOpacity
							onPress={() => {
								onConfirm && onConfirm();
								this.hide();
							}}
							style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
							<Text style={{ color: PRIMARY_COLOR, fontSize: 18 }}>确定</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Overlay.PopView>
		);
		this.overlay_key = Overlay.show(overlayView);
	},
	hide() {
		Overlay.hide(this.overlay_key);
	}
}




