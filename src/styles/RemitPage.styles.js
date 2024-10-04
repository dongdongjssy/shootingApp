import {StyleSheet} from 'react-native';

export default StyleSheet.create({
	input_row:{
		height: scaleSize(60), 
		borderColor: "#EBEBEB", 
		borderWidth: 1,
		backgroundColor: "#fff", 
		flexDirection: 'row', 
		alignItems: 'center',
		marginTop:scaleSize(10),
		marginBottom:scaleSize(10)
	},
	payment_input_row:{
		height: scaleSize(44), 
		borderColor: "#EBEBEB", 
		borderWidth: 1,
		backgroundColor: "#fff", 
		flexDirection: 'row', 
		alignItems: 'center',
		marginTop:scaleSize(10),
		marginBottom:scaleSize(10),
		flex:4
	},
	payment_input_wrap:{
		flex: 1, 
		height: scaleSize(42), 
		borderWidth:ONE_PX,
		borderColor:"#EBEBEB",
		backgroundColor: "#fff",
		paddingLeft:scaleSize(10)
	},
	input_wrap:{
		flex: 1, 
		// height: scaleSize(44),
		// borderWidth:ONE_PX,
		// borderColor:"#EBEBEB",
		backgroundColor: "#fff",
		// padding:scaleSize(10),
		paddingLeft:scaleSize(10),
	},
	// input_wraps:{
 //    	flex: 1,
 //    	height: scaleSize(100),
 //   		borderWidth:ONE_PX,
 //   		borderColor:"#EBEBEB",
 //   		backgroundColor: "#fff",
 //   		// padding:scaleSize(10),
 //   	    paddingLeft:scaleSize(10),
 //    },
    input_labels:{
       	fontSize:11,
     	fontFamily:'Arial',
     	fontWeight:'400',
      	color:'rgba(157,157,157,1)',
       	paddingBottom:scaleSize(6),
       	position:'absolute',
       	top:scaleSize(16),
       	bottom:scaleSize(3),
       	left:scaleSize(10),
    },
	input_head:{
		fontSize:18,
		fontFamily:'Arial',
		fontWeight:'bold',
		color:'rgba(50,50,50,1)'
	},
	input_label:{
		fontSize:11,
		fontFamily:'Arial',
		fontWeight:'400',
		color:'rgba(157,157,157,1)',
		paddingBottom:scaleSize(6),
		position:'absolute',
		top:scaleSize(2),
		left:scaleSize(10),
	},
	select_currency_arrow:{
		width:scaleSize(5),
		height:scaleSize(11),
		marginLeft:scaleSize(7),
	},
	currency_text:{
		paddingHorizontal: scaleSize(8), 
		fontSize:11,
		fontFamily:'Arial',
		fontWeight:'bold',
		// lineHeight: scaleSize(22), 
		color: '#323232', 
		marginLeft:scaleSize(8)
	},
	payment_mode_text:{
		flex:1,
		fontSize:14,
		fontFamily:'Arial',
		fontWeight:'bold',
		// lineHeight: scaleSize(22), 
		color: '#323232', 
		marginLeft:scaleSize(8)
	},
	homeInput:{
		padding:0,
		margin:0,
		flex:1,
		fontSize:24,
		// fontFamily:'Impact',
		height:scaleSize(40),
		marginTop:scaleSize(10),
		fontWeight:'bold',
		color:'rgba(63,194,74,1)'
	},
	two_column_view:{
		flexDirection:'row',
	},
	exchangeRate_row:{
		flexDirection:'row',
		alignItems:'center',
		// marginTop:scaleSize(15),
	},
	exchangeRate_row_icon:{
		width:scaleSize(15),
		height:scaleSize(15),
		marginRight:scaleSize(13),
	},
	exchangeRate_value_column:{
		fontSize:12,
		fontFamily:'Roboto',
		fontWeight:'bold',
		color:'rgba(63,194,74,1)',
	},
	exchangeRate_text_column:{
		fontSize:12,
		fontFamily:'Arial',
		fontWeight:'500',
		color:'rgba(50,50,50,1)',
		width:scaleSize(100),
	}
})



