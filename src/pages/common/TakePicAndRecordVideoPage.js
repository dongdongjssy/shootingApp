import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView,
	Dimensions
} from 'react-native'
import { RouteHelper } from 'react-navigation-easy-helper'
import { inject, observer } from 'mobx-react'
import {images} from '../../res/images';
import {
	Toast
} from 'teaset';
import UINavBar from '../../components/UINavBar';
import { RNCamera } from 'react-native-camera';
import Video from 'react-native-video';

@inject('UserStore') //注入；
@observer
export default class RecordVideoPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
            isPreview: false,
            sideType: this.props.sideType,
            flashMode: this.props.flashMode,
            isRecording: false,
		};
		this.flashModes = [
            RNCamera.Constants.FlashMode.auto,
            RNCamera.Constants.FlashMode.off,
            RNCamera.Constants.FlashMode.on,
        ];
		this.UserStore = this.props.UserStore;

	}
	static defaultProps = {
        maxSize: 1,
        sideType: RNCamera.Constants.Type.back,
        flashMode: 0,
        videoQuality: RNCamera.Constants.VideoQuality["480p"],
        pictureOptions: {},
        recordingOptions: {
        	maxDuration:120,
       		quality:_IOS_?RNCamera.Constants.VideoQuality["288p"]:RNCamera.Constants.VideoQuality["4:3"],
        },
        isVideo:false,//是否录制；
        assetsType:"Photos"
    };

	async componentDidMount() {
		
		
	}
    getFileName(url){
        var index = url.lastIndexOf("/");
        return url.slice(index+1);
    }
	 _renderCameraView = () => {
	 	console.log("_renderCameraView");
        return (
            <RNCamera
                ref={cam => this.camera = cam}
                type={this.state.sideType}
                defaultVideoQuality={this.props.videoQuality}
                flashMode={this.flashModes[this.state.flashMode]}
                style={{
			        flex: 1,
			        justifyContent: 'flex-end',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%'
			    }}
                captureAudio={true}
                playSoundOnCapture={true}
                fixOrientation={true}
            />
        );
    };
    _renderPreviewView = () => {
        const {width, height} = Dimensions.get('window');
        // const safeArea = getSafeAreaInset();
        const style = {
            flex: 1,
            width: width,
            height: height
        };
        return (
            <View style={{width, height}}>
                {this.props.isVideo ? (
                    <Video
                        source={{uri: this.state.data[0].uri}}
                        ref={(ref) => this.player = ref}
                        resizeMode={'cover'}
                        style={style}
                    />
                ) : (
                    <Image
                        resizeMode='cover'
                        style={style}
                        source={{uri: this.state.data[0].uri}}
                    />
                )}
            </View>
        );
    };
    _renderTakePhotoButton = () => {
        // const safeArea = getSafeAreaInset();
        // const left = (Dimensions.get('window').width - safeArea.left - safeArea.right - 84) / 2;
        const icon = this.state.isRecording ?
            images.common.video_recording :
            images.common.shutter;
        return (
            <TouchableOpacity
                onPress={this.props.isVideo ? this._clickRecordVideo : this._clickTakePicture}
                style={[styles.takeView]}
            >
                <Image style={styles.takeImage} source={icon} />
            </TouchableOpacity>
        );
    };
      _clickTakePicture = async () => {
        if (this.camera) {
            const item = await this.camera.takePictureAsync({
                mirrorImage: this.state.sideType === RNCamera.Constants.Type.front,
                fixOrientation: true,
                forceUpOrientation: true,
                ...this.props.pictureOptions
            });
            if (Platform.OS === 'ios') {
                if (item.uri.startsWith('file://')) {
                    item.uri = item.uri.substring(7);
                }
            }
            // if (this.props.maxSize > 1) {
            //     if (this.state.data.length >= this.props.maxSize) {
            //         Alert.alert('', this.props.maxSizeTakeAlert(this.props.maxSize));
            //     } else {
            //         this.setState({
            //             data: [...this.state.data, item],
            //         });
            //     }
            // } else {
            this.setState({
                data: [item],
                isPreview: true,
            });
            // }
        }
    };
     _clickRecordVideo = () => {
        if (this.camera) {
            if (this.state.isRecording) {
                this.camera.stopRecording();
            } else {
                this.setState({
                    isRecording: true,
                    recordTime:this.timestamp(),
                }, this._startRecording);
            }
        }
    };
    renderRecordTime(){
        if(!this.state.recordTime) return null;
        const left = (Dimensions.get('window').width - 84) / 2;
        // console.warn('this.state.recordTime',this.state.recordTime);
        return <View style={{position:"absolute",left:left,marginLeft:10,right:0,bottom:80}}>
            <Text style={{color:"#fff",fontWeight:'bold',fontSize:20}}>{'00:'+(this.props.recordingOptions.maxDuration-(this.timestamp()-this.state.recordTime))}</Text>
        </View>
    }
     _startRecording = () => {
        this.timer = setInterval(()=>{
            if(this.props.recordingOptions.maxDuration-(this.timestamp()-this.state.recordTime)<=0){
                //停止录制；
                 this.camera.stopRecording(); //停止录制；
                 clearInterval(this.timer);
            }
            this.forceUpdate();
            // console.warn('forceUpdate cameraview');
        },1000);
        var recordingOption={
            ...this.props.recordingOptions,
        }
        delete recordingOption.maxDuration;
        this.camera.recordAsync(recordingOption)
            .then((item) => {
                clearInterval(this.timer);
                if (Platform.OS === 'ios') {
                    if (item.uri.startsWith('file://')) {
                        item.uri = item.uri.substring(7);
                    }
                }
                if(!item.filename){
                    item.filename = this.getFileName(item.uri);
                }
                this.setState({
                    recordTime:0,
                    data: [item],
                    isRecording: false,
                    isPreview: true,
                });
            }).catch(err=>{
                clearInterval(this.timer);
            })
    };
    timestamp(){
        return parseInt(Date.now()/1000);
    }
	 _renderBottomView = () => {
        // const safeArea = getSafeAreaInset();
          const inPreview = this.state.isPreview;
        return <View style={{
        	position: 'absolute',
	        height: 84,
	        bottom:scaleSize(50),
	        left:0,right:0,
	        flexDirection: 'row',
	        justifyContent: 'center',
	        alignItems: 'center',
	        backgroundColor: 'transparent',
        }}>
        	 {this.state.isPreview?<TouchableOpacity 
        	 	onPress={()=>{
        	 		this.setState({
        	 			isPreview:false,
        	 			data:[],
        	 		})
        	 	}}
        	 	style={{
        	 		position:"absolute",
        	 		left:scaleSize(15),
        	 		width:scaleSize(57),
        	 		height:scaleSize(29),
        	 		backgroundColor:"rgba(232,232,232,1)",alignItems:'center',justifyContent:'center',borderRadius:scaleSize(4)}}>
        	 	<Text style={{color:"rgba(0,0,0,0.80)",fontSize:14,fontWeight:"400"}}>{this.state.isVideo?'删除':'重拍'}</Text>
        	 </TouchableOpacity>:null}
        	   {this.renderRecordTime()}
        	 {!inPreview && this._renderTakePhotoButton()}
        	 {this.state.isPreview?<TouchableOpacity 
        	 	onPress={()=>{
        	 		this.props.callback && this.props.callback(this.state.data);
        	 	}}
        	 	style={{
        	 		position:"absolute",
        	 		right:scaleSize(15),
        	 		width:scaleSize(57),
        	 		height:scaleSize(29),
        	 		backgroundColor:"#D43D3E",alignItems:'center',justifyContent:'center',borderRadius:scaleSize(4)}}>
        	 	<Text style={{color:"#fff",fontSize:14,fontWeight:"400"}}>{this.state.isVideo?'发布':'确定'}</Text>
        	 </TouchableOpacity>:null}
        </View>
        // const style = {
        //     // bottom: safeArea.bottom,
        //     // left: safeArea.left,
        //     // right: safeArea.right,
        // };
        // // const isMulti = this.props.maxSize > 1;
        // const hasPhoto = this.state.data.length > 0;
        // const inPreview = this.state.isPreview;
        // const isRecording = this.state.isRecording;
        // const buttonName = this.props.isVideo ? this.props.useVideoLabel : this.props.usePhotoLabel;
        // return (
        //     <View style={[styles.bottom, style]}>
        //         {isMulti && hasPhoto ? this._renderPreviewButton() : !isRecording && this._renderBottomButton(this.props.cancelLabel, this._clickCancel)}
        //         {this.renderRecordTime()}
        //         {!inPreview && this._renderTakePhotoButton()}
        //         {isMulti ? hasPhoto && this._renderBottomButton(this.props.okLabel, this._clickOK) : inPreview && this._renderBottomButton(buttonName, this._clickOK)}
        //     </View>
        // );
    };

	render() {
		return <>
			<UINavBar 
				style={{backgroundColor:"transparent",position:"absolute",zIndex:999}}
				leftView={<TouchableOpacity 
					onPress={()=>{
						RouteHelper.goBack();
					}}
					style={{width:scaleSize(50),alignItems:'center'}}>
					<Text style={{fontSize:18,fontWeight:'400',color:PRIMARY_COLOR}}>取消</Text>
				</TouchableOpacity>}
				rightView={
					!this.state.isPreview?<TouchableOpacity 
					onPress={()=>{
						const target = this.state.sideType === RNCamera.Constants.Type.back
				            ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back;
				        this.setState({sideType: target});
					}}
					style={{marginRight:scaleSize(10)}}>
						<Image  
						style={{width:scaleSize(32),height:scaleSize(27),tintColor:"#fff"}}
						source={images.common.switch_camera}/>
					</TouchableOpacity>:null
				}
			/>	
			<View style={{width: '100%',height: '100%'}}>
				{!this.state.isPreview ? this._renderCameraView() : this._renderPreviewView()}
				    {this._renderBottomView()}
			</View>

		</>
	}

}







var styles={
	takeView: {
        // position: 'absolute',
        // top: 0,
        // bottom: 0,
        // justifyContent: 'center',
        // alignItems: 'center',
        width: 64,
        height: 64,
    },
    takeImage: {
        width: 64,
        height: 64,
        margin: 10,
    },
}
