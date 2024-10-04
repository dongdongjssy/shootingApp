import I18n from 'react-native-i18n';
import en from './en';
import zh from './zh';
import DeviceInfo from 'react-native-device-info'
//DeviceInfo.getDeviceLocale();
I18n.locale = 'en'
// alert(DeviceInfo.getDeviceLocale());
// I18n.fallbacks = true;
I18n.defaultLocale = 'en';

I18n.translations = {
  en,
  zh
};
global.I18n=I18n;