import {StyleSheet} from 'react-native';
import { scaleSize } from '../global/utils';


export default StyleSheet.create({
	list_row: {
		height: scaleSize(50),
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: "#fff",
		paddingHorizontal: scaleSize(15),
	},
	list_row_title: {
		color: "#646464",
		fontSize: 16,
		fontWeight:"400",
		fontFamily:'Arial',
		width: 'auto'
	},
	list_row_val: {
		color: "#323232",
		fontSize: 16,
		fontFamily:'Arial',
		fontWeight:"400",
	},
	val_txt: {
		fontSize: 14,
		fontWeight: '400',
	},
	input_view: {
		flex: 1,
		height: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: "flex-end"
	},
	blank_space: {
		height: 1,
		backgroundColor: "#E6E6E6",
		// width:'100%',
		right: 0,
		left: scaleSize(15),
		bottom: 0,
		position: 'absolute'
	}
})



