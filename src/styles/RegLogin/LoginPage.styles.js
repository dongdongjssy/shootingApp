
import { StyleSheet } from 'react-native';

export default styles = StyleSheet.create({
    login_box:{
        width:scaleSize(340),
        height:scaleSize(225),
        padding:scaleSize(15),
        backgroundColor:"#fff",
        alignItems:'center',
    },

    nav_align: { position: 'relative', backgroundColor: '#fff' },

    btn_lang: {
        width: scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: scaleSize(10),
        height: scaleSize(40)
    },

    btn_lang_text: { color: "#333", fontSize: 14, color: "#333333" },
    
    btn_lang_img_up: {
        marginLeft: scaleSize(4),
        width: scaleSize(10), height: scaleSize(10),
        tintColor: "#333",
        transform: [{ rotate:  "180deg" }]
    } ,

    btn_lang_img_down: {
        marginLeft: scaleSize(4),
        width: scaleSize(10), height: scaleSize(10),
        tintColor: "#333",
        transform: [{ rotate:  "0deg" }]
    },

    content_align: {alignItems:'center',justifyContent:'center',flex:1},

	logo: {
		width: scaleSize(208),
		height: scaleSize(33),
	},
    
    button: { 
        alignItems: 'center', 
        marginTop: scaleSize(40) 
    },

    reg_font: { fontSize: 20,marginTop:scaleSize(0),fontWeight:'bold', color: "#000000" },

    gap_large: { height: scaleSize(80) },

    gap_small: { height: scaleSize(20) },

    center_align: { alignItems: 'center', marginTop: scaleSize(45) },



});
    
