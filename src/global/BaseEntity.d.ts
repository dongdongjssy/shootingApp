import StatusEnum from '../constants/StatusEnum';
import PageDomain from './PageDomain'

export default interface BaseEntity extends PageDomain{
    id?: number
    ids?: number[]
    createBy?: number;
    clientUserId?: number;
    createTime?: string;
    updateBy?: number;
    updateTime?: string;
    delFlg?: string;
    remark?: string;
    searchValue?: string;
    status?:StatusEnum
    params?:any;
    deptId?:number;
    timestamps?:boolean
  }



