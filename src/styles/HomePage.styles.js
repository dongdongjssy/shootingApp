import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  home_logo:{ flex: 1, justifyContent: "center", alignItems: "center" },
  home_logo_img:{ width: scaleSize(114), height: scaleSize(17.75) },
  home_top_item:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  home_top_img:{
    width:scaleSize(48),
    height:scaleSize(48),
  },
  home_top_txt:{
    fontSize:18,
    fontFamily:'Arial',
    fontWeight:"400",
    color:"#fff",
    marginTop:scaleSize(16),
  },
  msg_box:{
    height:scaleSize(84),
    backgroundColor:"#fff",
    // width:"100%",
     marginTop:scaleSize(10),
     flexDirection:"row",
  },
  msg_icon:{
    width:scaleSize(54),
    height:'100%',
    alignItems:'center',
    justifyContent:'center',
  },
  msg_item:{
    flexDirection:"row",
    justifyContent:"space-between",
    height:scaleSize(42),
    alignItems:'center',
    paddingRight:scaleSize(13),
  },
  msg_txt:{
    color:"#323232",
    fontSize:14,
    fontFamily:"Arial",
    fontWeight:'400'
  },
  msg_list:{
    flex:1,
  },
  news_list:{
    marginTop:scaleSize(10),
    backgroundColor:"#fff", 
  },
  news_item:{
    height:scaleSize(112),
    flexDirection:'row',
  },
  news_icon:{
    alignItems:'center',
    justifyContent:'center',
    width:scaleSize(115),
  },
  news_img:{
    width:scaleSize(90),
    height:scaleSize(76),
    borderWidth:ONE_PX,
    borderColor:"rgba(230, 230, 230, 1)",
  },
  news_title:{
    fontSize:18,
    fontFamily:'Arial',
    fontWeight:'bold',
    color:'rgba(50,50,50,1)',
    marginTop:scaleSize(13),
  },
  news_desc:{
    fontSize:14,
    fontFamily:'Arial',
    fontWeight:'400',
    color:'rgba(100,100,100,1)',
     marginTop:scaleSize(6),
     width:scaleSize(229),
  },
});


