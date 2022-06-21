import { login, logout, getInfo, refreshToken, getGroupParam, lodeLogin } from '@/api/login'
import { getToken, setToken, setExpiresIn, removeToken } from '@/utils/auth'
import { getRedirectUrl } from '@/utils/userCenter'
// import {configUserCenter} from "@haier/fe-stub-usercenter"

const user = {
  state: {
    token: getToken(),
    name: '',
    userId: '',
    avatar: '',
    userType: '',
    roles: [],
    permissions: [],
    clientId: '60777a36a71d4fcaaa758d04bb4e9616',
    grantCode: 'password', // 标注登录方式
    userData:{},
    appClientId:'', //集团申请的clientId
    loginType: 'haier_auth' // 集团授权码方式
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_EXPIRES_IN: (state, time) => {
      state.expires_in = time
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_USERID: (state, userId) => {
      state.userId = userId
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    SET_USERTYPE: (state, userType) => {
      state.userType = userType
    },
    SET_USERDATA:(state, userData) => {
      state.userData = userData
    },
    SET_APPCLIENTID:(state, appClientId) => {
      state.appClientId = appClientId
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      const clientId = user.state.clientId
      const grantCode = user.state.grantCode
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid, clientId, grantCode).then(res => {
          let data = res.data
          setToken(data.access_token)
          commit('SET_TOKEN', data.access_token)
          setExpiresIn(data.expires_in)
          commit('SET_EXPIRES_IN', data.expires_in)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          const user = res.user
          const avatar = user.avatar == "" ? require("@/assets/images/userimg.svg") : user.avatar;
          if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', res.roles)
            commit('SET_PERMISSIONS', res.permissions)
          } else {
            commit('SET_ROLES', ['ROLE_DEFAULT'])
            commit('SET_PERMISSIONS', res.permissions)
          }
          commit('SET_NAME', user.userName)
          commit('SET_USERID', user.userId)
          commit('SET_AVATAR', avatar)
          commit('SET_USERTYPE', user.userType)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 刷新token
    RefreshToken({commit, state}) {
      return new Promise((resolve, reject) => {
        refreshToken(state.token).then(res => {
          setExpiresIn(res.data)
          commit('SET_EXPIRES_IN', res.data)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          // window.__USERCENTER__.logout().then(res => {})
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 配置集团统一登录,调用后端接口获取，cliendtId，tokenUrl是获取当前域名拼接
    /**
     * configUserCenter
     * @param {string} clientId  //账号中心使用S码和系统名称获取cliendtId
     * @param {string} ssoUrl  //账号中心统一登录页域名
     * @param {string} appId   //开放平台创建应用获取（open.feishu.cn）
     * @param {string} clientId  //账号中心使用S码和系统名称获取cliendtId
     * @param {string} tokenUrl  //集成了账号中心提供的后端服务的地址
     * login
     *
     */
    userCenter({commit,state}) {
      // 调用后端接口（clientId+grantCode(写死 haier_auth)）接口调用成功之后配置集团统一账号中心
      return new Promise((resolve, reject) => {
         // TODO
        getGroupParam(state.clientId, 'haier_auth').then(res => {
          if (res.data) {
            let redirectUri = getRedirectUrl(res)
            commit('SET_APPCLIENTID', res.data.clientId)
            localStorage.setItem('appClientId', res.data.clientId)
            localStorage.setItem('redirectUri', redirectUri)
            localStorage.setItem('hostName', res.data.ssoUrl)
            resolve(res)
          }else {
            reject('/nullParams')
          }
        })
      })

    },
    codeLogin({ commit,state }, data) {
      return new Promise((resolve, reject) => {
        lodeLogin(state.clientId, data.code, state.loginType).then(res => {
          let data = res.data
          setToken(data.access_token)
          commit('SET_TOKEN', data.access_token)
          setExpiresIn(data.expires_in)
          commit('SET_EXPIRES_IN', data.expires_in)
          resolve()
        }).catch(error => {
          reject(error)
          console.log(error,error.toString());
          let errorMessage = error.toString().slice(7)
          localStorage.setItem('errorMessage',errorMessage)
        })
      })
    },
  }
}

export default user
