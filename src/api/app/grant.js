import request from '@/utils/request'

// 获取客户端信息
export const getClientInfoByClientId = (query) => {
  return request({
    url: '/system/client/getAppInfoByClientId/' + query,
    method: 'get'
  })
}

// 获取客户端授权列表接口
export const grantList = (query) => {
  return request({
    url: '/system/client/grant/list',
    method: 'get',
    params: query
  })
}

// 新增客户端授权
export function addClientGrant(data) {
  return request({
    url: '/system/client/grant',
    method: 'post',
    data: data
  })
}

// 修改客户端授权
export function updateClientGrant(data) {
  return request({
    url: '/system/client/grant',
    method: 'put',
    data: data
  })
}

// 删除客户端授权(单一，或者批量)
export function deleteClientGrant(data) {
  return request({
    url: '/system/client/grant/' + data,
    method: 'delete',
  })
}
