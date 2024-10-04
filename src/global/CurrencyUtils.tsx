
 export function   decideReceiveType (instCurrency:string,paymentMode:string,sendingCurrency?:string):number|undefined{
    if(instCurrency===CurrencyEnum.CNY.value && paymentMode ===PaymentModeEnum.Mpesa2wechat.description) {
      return ReceiveTypeEnum.Wechat.value;
    }else if(instCurrency===CurrencyEnum.KES.value && paymentMode ===PaymentModeEnum.Wechat2mpesa.description) {
      return ReceiveTypeEnum.Mpesa.value;
    }else if(paymentMode ===PaymentModeEnum.BankTransfer.description) {
      return ReceiveTypeEnum.LocalBank.value;
    }else{
      return ReceiveTypeEnum.LocalBank.value;
      //to de decided
    }
    

  }


  export function   decideRealBankTransferPaymentMode (transaction_form:any):string{
    if(transaction_form.paymentMode === PaymentModeEnum.BankTransfer.description){
      if(transaction_form.sendingCurrency ===CurrencyEnum.KES.value && transaction_form.instCurrency === CurrencyEnum.CNY.value){
        return PaymentModeBankTransferEnum.kebank2cnbank.description;
      }
      else if(transaction_form.sendingCurrency ===CurrencyEnum.CNY.value && transaction_form.instCurrency === CurrencyEnum.KES.value){
        return PaymentModeBankTransferEnum.cnbank2kebank.description;
      }

    }
    return "";
  }


  export function   formatAmount (amount:number,num:number=0){
    return amount?Number(Number(amount).toFixed(num)):0;
  }

  export function  formatNoBy4 (no:string){
    if(no){
      return no.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim()
    }
    return no;
    
  }

export function safeTrim(str: string, is_global: boolean = false) {
  let result:string;
  result = str.replace(/(^\s+)|(\s+$)/g, "");
  if (is_global) {
    result = result.replace(/\s/g, "");
  }
  return result;
}


  export const ReceiveTypeEnum = {
    Wechat: {
        value: 1,
        description: 'wechat'
    },
    Mpesa: {
        value: 2,
        description: 'Mpesa'
    },
    LocalBank: {
        value: 3,
        description: 'LocalBank'
    },

}


export const PaymentModeEnum = {
  Mpesa2wechat: {
      value: 1,
      description: 'mpesa2wechat',
      icon:"mpasa",
      displayName:"M-Pesa",
      instCurrency:"CNY"
  },
  Wechat2mpesa: {
      value: 2,
      description: 'wechat2mpesa',
      icon:"wechat_pay",
      displayName:"Wechat Pay",
      instCurrency:"KES"
  },
  
  BankTransfer:{
      value: 3,
      description: 'bankTransfer',
      icon:"bankpay",
      displayName:"Bank Transfer"
  }
}



export const DeliverMethodEnum = {
  Mpesa: {
    value:1,
    icon:"mpasa",
    displayName:"M-Pesa",
  },
  Wechat: {
    value: 2,
    icon:"wechat_pay",
    displayName:"Wechat Pay",
  },  
  Bank: {
    value: 3,
    icon:"bankpay",
    displayName:"Bank Transfer",
  },    
}



export const PaymentModeBankTransferEnum = {
  cnbank2kebank:{
    value: 3,
      description: 'cnbank2kebank',
      icon:"bankpay",
      displayName:"China to Kenya Bank Transfer"
  },

  kebank2cnbank:{
    value: 4,
      description: 'kebank2cnbank',
      icon:"bankpay",
      displayName:"Kenya to China Bank Transfer"
  },

  unknowBankTransferPaymenmode:{
    value: -1,
      description: 'unknowpaymentmode',
      icon:"bankpay",
      displayName:"unknown"
  },

}


export const CurrencyEnum = {
  CNY: {
      value: 'CNY',
      desc_en: 'Chinese Yuan',
      desc_ch: '人民币',
      country_code:1,
  },
  KES: {
      value: 'KES',
      desc_en: 'Kenya Shilling',
      desc_zh: '肯尼亚先令',
      country_code:2,
  },
  USD: {
      value: 'USD',
      desc_en: 'United States Dollar',
      desc_zh: '美元',
  },

}

  