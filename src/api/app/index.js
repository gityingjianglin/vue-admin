import request from '@/utils/request'

/* 应用管理接口 */

/* 获取应用管理列表接口 */
export function listApi(query) {
  return request({
    url: '/system/app/list',
    method: 'get',
    params: query
  })
}
/* 获取应用负责人接口 */
export function userlistApi(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}
// 新增应用信息接口
export function addApp(data) {
  return request({
    url: '/system/app',
    method: 'post',
    data: data
  })
}
// 修改应用信息接口
export function updateApp(data) {
  return request({
    url: '/system/app',
    method: 'put',
    data: data
  })
}
export function delApp(appIds) {
  return request({
    url: '/system/app/' + appIds,
    method: 'delete'
  })
}
