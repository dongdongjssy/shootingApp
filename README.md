

_onScroll(event) {
      let y = event.nativeEvent.contentOffset.y;
      if (y < 100) {
          if (this.state.sIndex === 9) {
              this.setState({
                  sIndex : 1,   // 开始被隐藏的标签栏
                  hIndex : 9,   // 开始时显示标签栏
              });
          }
      } else {
          if (this.state.sIndex === 1) {
              this.setState({
                  sIndex : 9,
                  hIndex : 1,
              });
          }
      }
  }



解决打包还是旧的apk的问题：
1.Delete (index.android.bundle) files inside directory android/app/src/main/assets.

2.run react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

3.Delete folders (drawable,drawable-hdpi,drawable-mdpi,drawable-xhdpi,drawable-xxhdpi,drawable-xxxhdpi,raw) inside android/app/src/main/res

4. cd android   5. ./gradlew assembleRelease