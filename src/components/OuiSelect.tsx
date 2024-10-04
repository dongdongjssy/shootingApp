
import UISelect from './UISelect';
import I18n from 'react-native-i18n';


const OuiSelect = (dataMap:any,title:string,onPress,onCancel?) => {

    UISelect.show(dataMap.map((item) => { return { title: item.Value, Code: item.Code } }), {
        title: I18n.t(title),
        onPress: (item) => {
            onPress(item);
            UISelect.hide();
        },
        onCancel: () => {

        }
    })


}


export default OuiSelect;


