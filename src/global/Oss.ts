export function thumbnail(width:number,height:number){
    return "?x-oss-process=image/resize,m_fill,h_" + height + ",w_" + width;
};