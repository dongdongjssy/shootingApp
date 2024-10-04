import React, {Component} from 'react';
import {
    ScrollView,
    AsyncStorage,
    NativeModules,
    Text,
    View,
    ActivityIndicator,
    Animated,
    PushNotificationIOS,
    Platform,
    DeviceEventEmitter,
    InteractionManager,
    TouchableOpacity,
    ImageBackground,
     Image,
    StyleSheet,
} from 'react-native'
import {RouteHelper} from 'react-navigation-easy-helper'
import {inject, observer} from 'mobx-react'
import {
	Toast,
	TabView,
	Overlay
} from 'teaset';
import {Calendar} from '../libs/react-native-calendars';
import moment from 'moment';
export default {
	show(start_date=moment().format("YYYY-MM-DD"),end_date=moment().add(3,'days').format("YYYY-MM-DD"),onConfirm){
		if(start_date && end_date){
			if(end_date<start_date){
				return Toast.message("结束日期不能小于开始日期")
			}
		}
		let overlayView = (
		  <Overlay.PullView side='bottom' modal={false}>
		    <View style={{backgroundColor: '#fff', width:'100%', 
		    minHeight: 400,}}>
		     	<CalendarContent 
		     	onClose={()=>{
		     		this.hide();
		     	}}
		     	start_date={start_date} end_date={end_date} onConfirm={onConfirm}/>
		    </View>
		  </Overlay.PullView>
		);
		this.overlay_key = Overlay.show(overlayView);
	},
	hide(){
		Overlay.hide(this.overlay_key);
	}
}


class CalendarContent extends Component {
	constructor(props) {
	    super(props);
	    var result={};
	    // if(this.props.start_date==end_date)
	    // moment(this.props.start_date);
	    this.state = {
			start_date:this.props.start_date,
			end_date:this.props.end_date,
			markedDates:{
				// '2020-03-17': {startingDay: true,color: PRIMARY_COLOR,textColor:'#fff'},
	   //          '2020-03-18': {color: PRIMARY_COLOR,textColor:'#fff'},
	   //          '2020-03-19': {color: PRIMARY_COLOR,textColor:'#fff'},
	   //          '2020-03-20': {endingDay: true,color: PRIMARY_COLOR,textColor:'#fff'},
			}
	    };	
	    this.UserStore= this.props.UserStore;
	    this.press_count=0;
	}
	static defaultProps = {
	 
	}
	async componentDidMount(){
		
	}
	genMarkedDates(){
		var start_date=this.state.start_date;
		var end_date = this.state.end_date;
		var markedDates={};
		if(start_date==end_date){
			markedDates[start_date]={color: PRIMARY_COLOR,textColor:'#fff'}
			this.setState({
				markedDates:markedDates,
			});
			return;
		}
		
		// {color: PRIMARY_COLOR,textColor:'#fff'}
		var result=[start_date];
		var add_date = start_date;
		for(var i=0;i<100000;i++){
			add_date = moment(add_date).add(1,'days').format("YYYY-MM-DD");
			if(add_date==end_date){
				result.push(end_date)
				break;
			}else{
				result.push(add_date)
			}
		}
		for(var i=0;i<result.length;i++){
			markedDates[result[i]]={color: PRIMARY_COLOR,textColor:'#fff'}
		}
		console.log("result",result);
		this.setState({
			markedDates:markedDates,
		})

	}
	render(){
		var onConfirm= this.props.onConfirm;
		return <View style={{flex:1}}>
			<View style={{height:scaleSize(44),
				paddingHorizontal:scaleSize(20),
			 	alignItems:'center',
			 	flexDirection:"row",
			 	justifyContent:'space-between',
			 	backgroundColor:'#f2f2f2'}}>
			 	<TouchableOpacity
			 	onPress={()=>{
			 		this.props.onClose && this.props.onClose();
					// onCancel && onCancel()
			 	}}
			 	style={styles.head_btn}
			 	>
			 	<Text style={{color:PRIMARY_COLOR}}>{I18n.t('Cancel')}</Text>
			 	</TouchableOpacity>
			 	<Text style={{color:"#2B2B2B",fontWeight:'600',fontSize:14}}>{'Date select'}</Text>
			 	{onConfirm ? <TouchableOpacity
			     	onPress={()=>{
		     			onConfirm && onConfirm(this.state.start_date,this.state.end_date);
		     			this.props.onClose && this.props.onClose();
			     	}}
			     	style={styles.head_btn}
			     	><Text style={{color:PRIMARY_COLOR}}>{I18n.t('Confirm')}</Text></TouchableOpacity>:<View style={styles.head_btn}/>}
			</View>
	        <Calendar
	          // style={styles.calendar}
	          current={this.props.start_date}
	          displayLoadingIndicator={false}
	          markingType={'period'}
	          onDayPress={(day)=>{
	           	this.press_count++
	           	console.log('day pressed',day)
	           	if(this.press_count%2==0){
					var markedDates={}; 
					markedDates[day.dateString]={color: PRIMARY_COLOR,textColor:'#fff'}
					var end_date=day.dateString;
					if(day.dateString<this.state.start_date){
						var start_date =  day.dateString;
						end_date=this.state.start_date;
						this.setState({
							start_date:start_date,
							end_date:end_date,
							markedDates:markedDates
						},()=>{
							this.genMarkedDates();
						})
						return;
					}
					this.setState({
						end_date:day.dateString,
						// markedDates:markedDates
					},()=>{this.genMarkedDates();})
	           	}else{
	           		var markedDates={}; 
	           		markedDates[day.dateString]={color: PRIMARY_COLOR,textColor:'#fff'}
	           		this.setState({
	           			start_date:day.dateString,
	           			end_date:"",
	           			markedDates:markedDates
	           		})
	           	}
	          }}
	          theme={{
	            calendarBackground: '#fff',
	            // textSectionTitleColor: 'white',
	            // dayTextColor: 'red',
	            // todayTextColor: 'white',
	            selectedDayTextColor: '#fff',
	            monthTextColor: '#323232',
	            // indicatorColor: 'white',
	            selectedDayBackgroundColor: PRIMARY_COLOR,
	            arrowColor: '#323232',
	            // textDisabledColor: 'red',
	            'stylesheet.calendar.header': {
	              week: {
	                marginTop: 5,
	                flexDirection: 'row',
	                justifyContent: 'space-between'
	              }
	            }
	          }}
	          markedDates={this.state.markedDates}
	        />
		</View>
	}

}


const styles=StyleSheet.create({
   arrow:{
       width:0,
       height:0,
       borderStyle:'solid',
   }
})



