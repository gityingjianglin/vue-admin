import store from '@/store'
import config from '@/config/config'
import { getQueryString } from '@/utils/index'

/**
   * getRedirectUrl
   * @param {resRedirectUrl} resRedirectUrl  // EUAF平台
   * login
   *
  */
// 获取对接账户中心开发/生产redirectUrl
export const getRedirectUrl = (res) => {
  let redirectUrl = ''
  if (process.env.NODE_ENV === 'development') {
    // 开发环境配置本地redirectUrl
    redirectUrl =  encodeURIComponent(`${config.devUserCenterInfo.localUrl}`)
    localStorage.setItem('redirectUrl', redirectUrl)
  } else {
    // 生产环境获取接口获取redirectUrl, 
    redirectUrl =  encodeURIComponent(res.data.redirectUri + 'index.html')
    localStorage.setItem('redirectUrl', redirectUrl)
  }
  return redirectUrl
}

// 集团登录跳转
export const checkUserCenterLogin = (next) => {
  if (config.openUserCenter) {
    let code = getQueryString('code')
    if (!code) {
      store.dispatch('userCenter').then(res => {
        debugger
        console.log(res, 'userCenter');
        let redirect_url = getRedirectUrl(res)
        let hostName = res.data.ssoUrl
        let client_id = res.data.clientId
        window.location.href = `${hostName}/?response_type=code&client_id=${client_id}&redirect_uri=${redirect_url}&state=#login`
      })
    } else {
      // 登录成功获取到code;
      console.log(code);
      store.dispatch('codeLogin', {code:code}).then(res => {
        next({ path: "/" })
      }).catch (err => {
        console.log(err, 'err');
        next({ path: "/401" })
      })
    }
  } else {
    next()
  }
}

// 集团登出跳转
export const outLogin = () => {
  store.dispatch('LogOut').then(() => {
    let appClientId = localStorage.getItem('appClientId')
    let redirectUri =  localStorage.getItem('redirectUri')
    let hostName = localStorage.getItem('hostName')
    if (redirectUri && appClientId && hostName) {
      window.location.href = `${hostName}/?client_id=${appClientId}&redirect_uri=${redirectUri}#exit`
    } else {
      store.dispatch('userCenter').then(res => {
        let redirectUrl = getRedirectUrl(res)
        let hostName = res.data.ssoUrl
        let appClientId = res.data.clientId
        console.log(appClientId,localStorage.getItem('appClientId'));
        store.dispatch('LogOut').then(() => {
          window.location.href = `${hostName}/?client_id=${appClientId}&redirect_uri=${redirectUrl}#exit`
        })
      })
    }

  })
  
}