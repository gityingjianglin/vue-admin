import request from '@/utils/request'

/* 获取应用管理列表接口 */
export const appList = (query) => {
  return request({
    url: '/system/app/list',
    method: 'get',
    params: query
  })
}

// 客户端列表
export const listApi = (query) => {
  return request({
    url: '/system/client/list',
    method: 'get',
    params: query
  })
}

// 新增客户端
export function addClientPort(data) {
  return request({
    url: '/system/client',
    method: 'post',
    data: data
  })
}

// 修改客户端
export function updateClientPort(data) {
  return request({
    url: '/system/client',
    method: 'put',
    data: data
  })
}

// 删除客户端
export function deleteClientPort(data) {
  return request({
    url: '/system/client/' + data,
    method: 'delete',
  })
}

// 查询字典数据列表
export function listData(query) {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  })
}