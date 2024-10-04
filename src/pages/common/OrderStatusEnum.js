const OrderStatus = {
    RemitOrder: {
        value: 0,
        name: "RemitOrder",
    },    
    Waiting4Remit: {
        value: 1,
        name: "Waiting4Remit",
    },

    PaymentChecking: {
        value: 2,
        name: "PaymentChecking",
    }, 
    PaymentReceived: {
        value: 3,
        name: "PaymentReceived",
    },
    PaymentError: {
        value: 4,
        name: "PaymentError",
    },
    //RefundMade: {
    //    value: 5,
    //    name: "RefundMade",
    //},
    //RefundSuccess: {
    //    value: 6,
    //    name: "RefundSuccess",
    //},
    TransferInProgress: {
        value: 7,
        name: "TransferInProgress",
    },
    TransferSuccess: {
        value: 8,
        name: "TransferSuccess",
    },
    OrderCancelled: {
        value: 9,
        name: "OrderCancelled",
    }, 
    TransferError: {
        value: 10,
        name: "TransferError",
    },        
    OTHER: {        
        value: -1,
        name: "OTHER",
    }
};

function getI18NTitle(orderStatus) {
    return I18n.t(orderStatus.name+"_title")
}

function getI18NDescription(orderStatus) {
    return I18n.t(orderStatus.name+"_descr")
}	

function getOrderStatus(value) {
    for(let k in OrderStatus) {
        if(OrderStatus[k].value == value)
            return OrderStatus[k]
    }
    return OrderStatus.OTHER
}

function getI18NTitleByStatusValue(value){
    return getI18NTitle(getOrderStatus(value))
}

function statusIn(status, ...orderStatus) {
    return orderStatus.filter(s=>status == s.value).length;
}

function isErrorStatus(status) {
    return status == 4 || status == 10
}
   
 export  {OrderStatus , getI18NTitle, getI18NDescription, getOrderStatus, getI18NTitleByStatusValue, statusIn, isErrorStatus} ;