import request from '@/utils/request'

// 查询在线用户列表
export function list(query) {
  return request({
    url: '/system/online/list',
    method: 'get',
    params: query
  })
}

// 强退用户
export function forceLogout(tokenId) {
  return request({
    url: '/system/online/' + tokenId,
    method: 'delete'
  })
}

// 查询应用和对应的端
export function getAppInfo(data) {
  return request({
    url: '/system/app/getAppInfoByLocalUser',
    method: 'post',
    data: data
  })
}
