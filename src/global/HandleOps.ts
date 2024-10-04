
import NamespaceEnum from "../constants/NamespaceEnum";
import { create, update, remove, removeById, exportTable } from "./CommonService";
import { ApiResponse } from "./ApiResponse";
import ResponseCodeEnum from "../constants/ResponseCodeEnum";
import OperationEnum from "../constants/OperationEnum";
import  BaseEntity  from "./BaseEntity";
import {DateTimeToString} from './DateTimeUtils';
import OrderByEnum from "../constants/OrderByEnum";

export  async function handleAdd (fields: BaseEntity,namespace:NamespaceEnum)  {
    //const hide = message.loading('正在添加');
    try {
      DateTimeToString(fields)
      let res = await create(fields, namespace);
      console.log("fields="+JSON.stringify(fields))
      //hide();
      return handleResponse(res,OperationEnum.ADD);
    } catch (error) {
     // hide();
      return errorMessage(OperationEnum.ADD)
    }
  };
  
  /**
   * 更新节点
   * @param fields
   */
  export  async function handleUpdate  (fields: BaseEntity,namespace:NamespaceEnum,){
    //const hide = message.loading('正在更新');
    DateTimeToString(fields);
    try {
      const res : ApiResponse = await update(
        {
          ...fields,
        },
        namespace,
      );
     // hide();
      return handleResponse(res,OperationEnum.UPDATE);
    } catch (error) {
     // hide();
      return errorMessage(OperationEnum.UPDATE)
    }
  };

  /**
   * 导出
   * @param fields
   */
  export  async function handleExport  (namespace:NamespaceEnum,records?: number[]){
   // const hide = message.loading('正在导出');
    try {
      let res : ApiResponse = await exportTable(
         namespace,records,
      );
      //hide();
      return handleResponse(res,OperationEnum.EXPORT);
    } catch (error) {
      //hide();
      return errorMessage(OperationEnum.EXPORT)
    }
  };

  /**
   *  删除节点
   * @param selectedRows
   */
  // export  async function handleRemove  (records: number[],actionRef:any,namespace:NamespaceEnum,okPlus?:any)  {
  //   const userNameHtml = '您确定要删除?';
  //   Modal.confirm({
  //       title: userNameHtml,
  //       content: '一旦删除，数据将无法恢复，请慎重操作',
  //       okText: '确定',
  //       okType: 'danger',
  //       cancelText: '取消',
  //       onOk: async () => {
  //         await removeRecords(records,namespace);
  //         okPlus&&okPlus();
  //         actionRef.current && actionRef.current.reload();
  //       },
  //       onCancel() {
  //       }
  //   })
    

  // };


  // export  async function cancelConfirm  (isFieldsChange:boolean,onCancel: () => void)  {
  //   if(!isFieldsChange) onCancel();
  //   else{
  //     const userNameHtml = '请确认取消';
  //     Modal.confirm({
  //         title: userNameHtml,
  //         content: '您有修改，确认要放弃',
  //         okText: '确定取消',
  //         okType: 'danger',
  //         cancelText: '不取消',
  //         onOk:  () => {
  //           onCancel()
  //         },
  //         onCancel() {
  //         }
  //     })
  //   }
    
    

  // };

  async function removeRecords  (selectedIds: number[]|undefined,namespace:NamespaceEnum)  {
    //const hide = message.loading('正在删除');
    if (!selectedIds) return true;
    try {
      let res;
      if(selectedIds.length == 1) {
         res = await removeById(
          selectedIds[0],
          namespace
        );
      }
      else {
        res = await remove(
          selectedIds,
          namespace
        );
      }
     // hide();
      return handleResponse(res,OperationEnum.REMOVE);
    } catch (error) {
      //hide();
      return errorMessage(OperationEnum.REMOVE)
    }
  };

  function handleResponse(res:ApiResponse,ops:OperationEnum){
    if(res&&res.data&&res.data.code === ResponseCodeEnum.SUCCESS ){
     // message.success(`${ops}成功，即将刷新`) 
      return true;
    } else{
      if(res&&res.data&&res.data.code === ResponseCodeEnum.ERROR500){
        return errorMessage(ops);
      }else{
        //message.error(res?.data?.msg);
        return false;
      }
      
      // return errorMessage(ops);
    }
  }

  function errorMessage(ops:OperationEnum){
    //message.error(`${ops}失败，请重试`);
    return false;
  }


  
export  function getOrderBy(orderBy: string): OrderByEnum {

    if (orderBy === 'ascend') {
        return OrderByEnum.ASC;
    }else{
      return OrderByEnum.DESC;
    }
}