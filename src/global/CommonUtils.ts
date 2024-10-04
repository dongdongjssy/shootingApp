import NamespaceEnum from "../constants/NamespaceEnum";
import httpBaseConfig from '../api/HttpBaseConfig';
import { USER_ID, TOKEN, DEV_ID, LOGIN_INFO, PERM_INFO, DEPT_Name } from "./constants";
import simpleStore from '../libs/simpleStore';



export function composeBaseUrl(){
    const baseUrl = httpBaseConfig.baseUrl;
    const port= httpBaseConfig.port;
    const prefix =httpBaseConfig.prefix;
    //const microService = httpBaseConfig.microService;

    return `${baseUrl}${port}${prefix}`;
}
export async function constructImportUrl(namespace:NamespaceEnum) {  
    const baseUrl = composeBaseUrl();
    return `${baseUrl}${namespace}/import`;
}

export  function imgUploadUrl() {
    const baseUrl = composeBaseUrl();
    return `${baseUrl}minio/upload`;
}

export async function fileUploadUrl() {
    const baseUrl = composeBaseUrl();
    console.log("baseUrl"+baseUrl);
    return `${baseUrl}minio/upload`;
}

export  function minioUrl() {
  const baseUrl = httpBaseConfig.minioUrl;
  return `${baseUrl}/`;
}

export  function webUrl() {
  const baseUrl = httpBaseConfig.webUrl;
  return `${baseUrl}/`;
}


export async function fileDownloadUrl() {
  const baseUrl = composeBaseUrl();
  return `${baseUrl}minio/download`;
}

export async function FilterToMap(fields:any) {
    let map = new Map();
    let timeMap = new Map();
    for (let key in fields){
        if(fields[key] && Array.isArray(fields[key])){
            
            //数据库设计时时间字段都规定了必须以Time结尾
            if(key.endsWith("Time")){  
                map = new Map();
                let [startTime,endTime] =fields[key];
                timeMap[`${key}StartTime`] = startTime;
                timeMap[`${key}EndTime`] = endTime;
                delete fields[key]; 
                fields["params"] = timeMap;
            }else{
                timeMap = new Map();
                map[key] = fields[key]
                delete fields[key]; 
                fields["params"] = map;
            }
            
            
        }
        
      }
      
}



export function uploadFile(info:any){
  const { status } = info.file;
  if (status !== 'uploading') {
    console.log(info.file, info.fileList);
  }
//   if (status === 'done') {
//     message.success(`${info.file.name} 上传成功`);
//   } else if (status === 'error') {
//     message.error(`${info.file.name} 上传失败`);
//   }
  return info && info.fileList;
}





export function getUserIdFromStorage(){
    return simpleStore.get(USER_ID) ;
}



export function getTokenFromStorage(){
    return simpleStore.get(TOKEN) ;
}




export function saveLoginUserToStorage(user:any, token:string) {
  simpleStore.save(LOGIN_INFO, user)
  simpleStore.save(USER_ID, user.userId)		
  simpleStore.save(TOKEN, token)
}

export function deleteLoginUserFromStorage() {
  simpleStore.delete(LOGIN_INFO)
  simpleStore.delete(USER_ID)		
  simpleStore.delete(TOKEN)
  simpleStore.delete(DEPT_Name)
  simpleStore.delete(PERM_INFO)
  simpleStore.delete(DEV_ID)
  
}

export function getLoginUserFromStorage() {
  return simpleStore.get(LOGIN_INFO) ;

}

export function saveLoginUserPermsToStorage(perm:any) {
  simpleStore.save(PERM_INFO, perm)
}

// export function hasPerm(perm:String) {
//   //console.log(JSON.stringify(simpleStore.get(PERM_INFO)))
//   return getUserIdFromStorage() == 1 || (simpleStore.get(PERM_INFO) && simpleStore.get(PERM_INFO).indexOf(perm) > -1)
// }


// export function hasRole(role:string[]) {
//   //console.log(JSON.stringify(simpleStore.get(PERM_INFO)))
//   for (let r of role) {
//     if(getAuthority().includes(r)) return true;
// }
//   return false;
// }






