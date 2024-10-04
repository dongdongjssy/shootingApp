import {
	Toast,
} from 'teaset';
import I18n from 'react-native-i18n';
import { safeTrim } from './CurrencyUtils';

export function validateRuleForm(ruleForm:any,formRules:any) {
    trimRuleForm(ruleForm);
    for (let key in formRules) {
        if (formRules[key] && formRules[key].required && !ruleForm[key]) {
            Toast.message(I18n.locale === 'en' ? formRules[key].err_msg_en : formRules[key].err_msg_cn)
            return false;
        }
    }
    return true;
}


export function trimRuleForm(ruleForm:any) {
    
    for (let key in ruleForm) {
        let value = ruleForm[key] ;
        if(value&&typeof(value)=='string'){
            if(key === "accountNo"){
                ruleForm ={...ruleForm,key:safeTrim(value,true)};
            }else{
                ruleForm ={...ruleForm,key:safeTrim(value)};
            }
        }
            
    }
}