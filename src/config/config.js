/*
 * @Author: gityingjianglin yingjianglin123@163.com
 * @Date: 2022-06-23 09:38:56
 * @LastEditors: gityingjianglin yingjianglin123@163.com
 * @LastEditTime: 2022-06-28 15:27:35
 * @FilePath: \ruoyi-uig:\frontend-jsj\gitlab-templates\vue-admin\src\config\config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
let config = {
  namespace: 'vue-admin', // 必须设置，项目命名空间，以gitlab项目标识串为准，为解决同一个域名下面的本地存储问题，本地存储一律加上项目namespace-appId
  openUserCenter: true, // 是否开启账户中心登录
  clientCode: 'FA000802', // euaf平台客户端code，用于换取euaf平台cliengId（非集团账户中心clientId）
  devUserCenterInfo: {
    localUrl: 'http://172.18.126.108'
  }
}
module.exports = config