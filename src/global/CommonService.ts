import request from '../api/request';
import NamespaceEnum from '../constants/NamespaceEnum';
import ResponseCodeEnum from '../constants/ResponseCodeEnum';
import httpBaseConfig from '../api/HttpBaseConfig';
import  BaseEntity  from './BaseEntity';
import StatusEnum from '../constants/StatusEnum';
import { getOrderBy } from './HandleOps';
import { getUserIdFromStorage } from './CommonUtils';

export async function retrievePageListCommon(params:any,namespace:NamespaceEnum,path:string) {
  const pageNum:number = params.current || 1;
  const pageSize:number =params.pageSize || 20;
  const orderByColumn:string = params.field || "create_time";
  const isAsc:string = getOrderBy(params.order) || 'desc';
  const pd={pd:{pageNum,pageSize,orderByColumn,isAsc}};
  
  return request.post(`${namespace}/${path}`, {...params,...pd,status:StatusEnum.ACTIVE} ) .then(function({ data }) {
    const totalNum: number = data.total
    const limit: number = pageSize ;

    if(data&& data.code === ResponseCodeEnum.SUCCESS){
      const calculatedPage = totalNum > 0 ? ((totalNum < limit) ? 1 : ((totalNum % limit) ? (Number(totalNum / limit) + 1) : (totalNum / limit))) : 0;
      if(pageNum  > calculatedPage){
        return {data:{lastPage:true,code:data.code,rows:[],total:data.total}};
      }
      return {
        data:{
          rows: data.rows,
          total: data.total,
          code:data.code,
          ...params,
        }
      }
    }else{
      return {data:{rows:[]}}
    }
  })
}


export async function retrievePageList(params:any,namespace:NamespaceEnum) {
  return retrievePageListCommon(params,namespace,'list/page');
}

export async function pageList(params:any,namespace:NamespaceEnum) {
  return request.post(`${namespace}/list`,params);
}

export async function getById(id:number,namespace:NamespaceEnum) {
  return request.post(`${namespace}/getById/${id}`);
}

export async function create(entity:BaseEntity,namespace:NamespaceEnum) {
  if(!entity.createBy) entity.createBy = await getUserIdFromStorage(); 
  if(!entity.clientUserId) entity.clientUserId =await getUserIdFromStorage(); 
  
  return request.post(`${namespace}/add`,entity);
}

export async function createBatch(entity:BaseEntity[],namespace:NamespaceEnum) {
  return request.post(`${namespace}/add`,entity);
}

export async function update(entity:BaseEntity,namespace:NamespaceEnum) {
  if(!entity.updateBy) entity.updateBy = await getUserIdFromStorage(); 
  return request.post(`${namespace}/edit`,entity);
}


export async function remove(ids:number[],namespace:NamespaceEnum) {
  let entity : BaseEntity ={ids};
  return request.post(`${namespace}/remove`,entity);
}

export async function removeById(id:number,namespace:NamespaceEnum) {
  let entity : BaseEntity ={};
  return request.post(`${namespace}/remove/`+id,entity);
}


export async function checkNameUnique(entity:BaseEntity,nameToBeChecked:string,namespace:NamespaceEnum) {
  return request.post(`${namespace}/check${nameToBeChecked}Unique`,entity);
}


export async function exportTable(namespace:NamespaceEnum,ids?:number[]) {
  let entity : BaseEntity ={ids,status:StatusEnum.ACTIVE};
  return request.post(`${namespace}/export`,entity);
}

export  function getImportUrl(namespace:NamespaceEnum) {
  let url =   `${httpBaseConfig.baseUrl}${httpBaseConfig.port}${httpBaseConfig.prefix}${namespace}/import`
  return url;
}

export async function retrieveToBeAllocatedPageList(params:any,namespace:NamespaceEnum) {

  return retrievePageListCommon(params,namespace,'/toAllocateList');
}

// export async function retrieveDictDataByType(dictType:string) {
//   return request.get(`${NamespaceEnum.DictData}/getType/${dictType}`);
// }
