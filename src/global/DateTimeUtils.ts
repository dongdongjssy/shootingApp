import moment from "moment";
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_TIME_FORMAT } from "./constants";

export  function DateTimeToString(fields:any) {
    let deepCopiedFields ={...fields};
    let dateFromat:string= DEFAULT_DATE_FORMAT;
    if (fields.timestamps) dateFromat = DEFAULT_DATE_TIME_FORMAT;
    for (let key in deepCopiedFields){
        //数据库设计时时间字段都规定了必须以Time结尾
        if(key.endsWith("Time")){
          deepCopiedFields[key] = moment(deepCopiedFields[key]).format(dateFromat);
        }
      }
    return deepCopiedFields;
}

export  function StringToDateTime(fields:any) {
    let deepCopiedFields ={...fields};
    for (let key in fields){
        //数据库设计时时间字段都规定了必须以Time结尾
        if(key.endsWith("Time") && deepCopiedFields[key]){
          deepCopiedFields[key] = moment(deepCopiedFields[key]);
        }
      }
      return deepCopiedFields;
}


export  function displayFormattedDate(dateTime:any) {
  return moment(dateTime).format(DEFAULT_DATE_FORMAT)
}


export  function removeTFromDateTime(dateTime:string) {
  return dateTime?dateTime.replace("T"," "):"-"
}

//时间戳转换成日期格式
export function renderTimeStamp(timestamp: string){
  let time = timestamp ? new Date(+timestamp) : new Date()            
  return moment( time ).format('YYYY/MM/DD HH:mm')
}

// 获取指定月的开始结束时间
export function getCurrMonthDays(timestamp: string){
  let date:any = []
  const start = moment(timestamp).startOf('month').format('YYYY-MM-DD')
  const end = moment(timestamp).endOf('month').format('YYYY-MM-DD')
  date.push(start)
  date.push(end)
  return date
}

//计算时间规则
export function renderTimeDuration(time:string){
  const currentTime = moment().format("YYYY/MM/DD HH:mm");
  const propsTime = time.indexOf('-')==-1 ? moment(new Date(+time)).format("YYYY/MM/DD HH:mm") : moment(time).format("YYYY/MM/DD HH:mm");
  let diffTime = moment(currentTime).diff(propsTime, 'minute');
  //一分钟内展示为刚刚
  //大于一分钟，小于1小时展示为XX分钟前
  //大于等于1小时，小于24小时，展示为XX小时前
  //大于等于24小时，小于等于7天，展示为XX天前
  //大于7天，展示为XX月XX日 XX时XX分
  if(diffTime < 1){
    return "刚刚";
  }else if(diffTime > 1 && diffTime < 60 ){
    return diffTime + "分钟前";
  }else if(diffTime >= 60 && diffTime < 1440){  
    diffTime = moment(currentTime).diff(propsTime, 'hours');
    return diffTime + "小时前";
  }else if(diffTime >= 1440 && diffTime < 10080){
    diffTime = moment(currentTime).diff(propsTime, 'days');
    return diffTime + "天前";
  }else{
    return propsTime;
  }  
}
