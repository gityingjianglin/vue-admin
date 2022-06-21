<template>
  <div class="app-container">
    <h4 class="form-header h4">基本信息</h4>
    <el-form ref="baseInfo" :model="baseInfo" label-width="120px" :inline="true">
      <el-form-item label="应用名称" prop="appName">
        <el-input v-model="baseInfo.appName" readonly  />
      </el-form-item>
      <el-form-item label="客户端代码" prop="clientCode">
        <el-input  v-model="baseInfo.clientCode" readonly />
      </el-form-item>
      <el-form-item label="客户端名称" prop="clientName">
        <el-input  v-model="baseInfo.clientName" readonly />
      </el-form-item>
    </el-form>
    <h4 class="form-header h4">授权管理</h4>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAddGrant"
        >新增客户端授权</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdateGrant"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDeleteGrant"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="grantList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="授权ID" prop="grantId" align="center" :show-overflow-tooltip="true" width="200" />
      <el-table-column label="授权码" prop="grantCode" align="center" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="授权码描述" prop="grantDesc" align="center" width="130" />
      <el-table-column label="是否自动注册" prop="autoRegister" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.autoRegister | filterMultiLogin}}</span>
        </template>
      </el-table-column>
      <el-table-column label="签名key" prop="signatureKey" align="center" width="130" />
      <el-table-column label="签名秘钥" prop="signatureSecret" align="center" width="130" />
      <el-table-column label="备注" prop="remark" align="center" width="130" />
      <el-table-column label="集团S码" prop="haierSyscode" align="center" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="集团客户端Id" prop="haierClientId" align="center" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="集团客户端key" prop="haierClientSecret" align="center" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="重定向地址" prop="loginRedirectUrl" align="center" :show-overflow-tooltip="true" width="130" />
      <el-table-column label="自定义登陆页面" prop="customLoginPage" align="center" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="飞书appId" prop="haierFeishuId" align="center" :show-overflow-tooltip="true" width="130" />
      <el-table-column label="飞书appSecret" prop="haierFeishuSecret" align="center" :show-overflow-tooltip="true" width="130" />
      <el-table-column label="创建用户" prop="createBy" align="center" width="100" />
      <el-table-column label="创建时间" prop="createTime" align="center" width="150" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="编辑用户" prop="updateBy" align="center" width="100" />
      <el-table-column label="编辑时间" prop="updateTime" align="center" width="150" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="160px" class-name="small-padding">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdateGrant(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDeleteGrant(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getGrantList"
    />

    <!-- 客户端授权//对话框 -->
    <el-dialog :title="title" :visible.sync="showGrantDialog" width="500px" append-to-body>
      <el-form ref="formGrant" :model="formGrant" :rules="grantRulesConfig" label-width="125px">
        <!-- <el-form-item label="认证渠道"  prop="authChannel">
          <el-select v-model="formGrant.authChannel" clearable placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="应用名称" prop="appName">
          <el-input v-model="formGrant.appName" :disabled="true" />
        </el-form-item>
        <el-form-item label="客户端名称" prop="clientName">
          <el-input v-model="formGrant.clientName" :disabled="true" />
        </el-form-item>
        <el-form-item label="授权码" prop="grantCode">
          <el-select v-model="formGrant.grantCode" placeholder="请选择客户端授权码" clearable>
            <el-option
              v-for="dict in dict.type.sys_grant_code"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="自动注册">
          <el-radio-group v-model="formGrant.autoRegister">
            <el-radio label="0">否</el-radio>
            <el-radio label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="签名key" prop="signatureKey">
          <el-input v-model="formGrant.signatureKey" clearable />
        </el-form-item>
        <el-form-item label="签名秘钥" prop="signatureSecret">
          <el-input v-model="formGrant.signatureSecret" clearable />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formGrant.remark" type="textarea" placeholder="请输入备注内容" clearable></el-input>
        </el-form-item>
        <div v-if="formGrant.grantCode === 'haier_auth'">
          <el-form-item label="集团S码" prop="haierSyscode">
            <el-input v-model="formGrant.haierSyscode" placeholder="请输入集团S码" clearable />
          </el-form-item>
          <el-form-item label="集团客户端ID" prop="haierClientId">
            <el-input v-model="formGrant.haierClientId" placeholder="请输入集团客户端ID" clearable />
          </el-form-item>
          <el-form-item label="集团客户端key" prop="haierClientSecret">
            <el-input v-model="formGrant.haierClientSecret" placeholder="请输入集团客户端key" clearable />
          </el-form-item>
          <el-form-item label="重定向地址" prop="loginRedirectUrl">
            <el-input v-model="formGrant.loginRedirectUrl" placeholder="请输入重定向地址" clearable />
          </el-form-item>
          <el-form-item label="自定义登陆页面" prop="customLoginPage">
            <el-input v-model="formGrant.customLoginPage" placeholder="请输入自定义登陆页面" clearable />
          </el-form-item>
          <el-form-item label="飞书appId" prop="haierFeishuId">
            <el-input v-model="formGrant.haierFeishuId" placeholder="请输入飞书appId" clearable />
          </el-form-item>
          <el-form-item label="飞书appSecret" prop="haierFeishuSecret">
            <el-input v-model="formGrant.haierFeishuSecret" placeholder="请输入飞书appSecret" clearable />
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitGrant">确 定</el-button>
        <el-button @click="cancelGrant">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { grantList, getClientInfoByClientId, addClientGrant, updateClientGrant, deleteClientGrant } from "@/api/app/grant"
export default {
  name: "index",
  dicts: ['sys_grant_code'],
  data() {
    return {
      // 遮罩层,true--加载中；false--加载完成
      loading: true,
      timeout: '', // 模糊搜索
      // 选中数组
      grantIds: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      /* 查询列表参数 */
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      total: 0,
      title: '',
      // 客户端id
      baseInfo: {
        appName: '',
        clientName: '',
        clientCode: ''
      },
      clientId: '',
      grantList: [],
      /* -------------------客户端授权对话框 */
      showGrantDialog: false,
      formGrant: {
        appId: '',
        clientId: '',
        grandId: '',
        appName: '',
        clientName: '',
        grantCode: '',
        grantDesc: '',
        autoRegister: '0',
        signatureKey: '',
        signatureSecret: '',
        remark: '',
        haierSyscode: '',
        haierClientId: '',
        haierClientSecret: '',
        loginRedirectUrl: '',
        customLoginPage: '',
        haierFeishuId: '',
        haierFeishuSecret: ''
      },
      grantRulesConfig: {
        grantCode: [
          { required: true, message: "授权码不能为空", trigger: "blur" }
        ],
        haierSyscode: [
          { required: true, message: "集团S码不能为空", trigger: "blur" }
        ],
        haierClientId: [
          { required: true, message: "集团客户端Id不能为空", trigger: "blur" }
        ],
        haierClientSecret: [
          { required: true, message: "集团客户端key不能为空", trigger: "blur" }
        ],
        loginRedirectUrl: [
          { required: true, message: "重定向地址不能为空", trigger: "blur" }
        ]
      }
    }
  },
  created() {
    const clientId = this.$route.params && this.$route.params.clientId;
    this.clientId = clientId
    this.getGrantList()
    this.getClientInfo()
  },
  filters: {
    filterMultiLogin (value) {
      return value === '1' ? '是' : '否'
    }
  },
  mounted() {
  },
  methods: {
    // 获取授权列表
    getGrantList () {
      this.loading = true
      let params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        clientId: this.clientId
      }
      grantList(params).then((res) => {
        console.log('res:', res)
        this.loading = false
        this.grantList = res.rows
        this.total = res.total
      })
    },
    getClientInfo () {
      getClientInfoByClientId(this.clientId).then((res) => {
        if (res.data) {
          let result = res.data
          this.baseInfo.appName = result.app.appName
          this.baseInfo.clientCode = result.clientCode
          this.baseInfo.clientName = result.clientName
          this.baseInfo.appId = result.appId
          this.baseInfo.clientId = result.clientId
          this.formGrant = Object.assign(this.formGrant, this.baseInfo)
        }
      })
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.grantIds = selection.map(item => item.grantId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    reset() {
      this.formGrant = {
        appId: '',
        clientId: '',
        grandId: '',
        appName: '',
        clientName: '',
        grantCode: '',
        grantDesc: '',
        autoRegister: '0',
        signatureKey: '',
        signatureSecret: '',
        remark: '',
        haierSyscode: '',
        haierClientId: '',
        haierClientSecret: '',
        loginRedirectUrl: '',
        customLoginPage: '',
        haierFeishuId: '',
        haierFeishuSecret: ''
      },
      this.resetForm("formGrant")
    },
    handleAddGrant () {
      this.reset()
      this.showGrantDialog = true
      this.formGrant = Object.assign(this.formGrant, this.baseInfo)
      this.title = '新增客户端授权'
    },
    /* 修改form */
    handleUpdateGrant(row) {
      this.reset()
      this.showGrantDialog = true
      this.title = '编辑客户端授权'
      if (!row.grantId) {
        this.grantList.forEach((item) => {
          if (item.grantId === this.grantIds[0]) {
            row = item
          }
        })
      }
      // console.log(row)
      this.formGrant = Object.assign({}, row)
      console.log('formGrant', this.formGrant)
      // console.log('formGrant--autoRegister', this.formGrant.autoRegister)
      // this.formGrant.autoRegister = 1
    },
    // 删除客户端授权
    handleDeleteGrant(row) {
      var grantId = ''
      if (row.grantId) {
        grantId = row.grantId
      } else {
        grantId = this.grantIds
      }
      this.$modal.confirm('是否删除授权Id为：' + grantId + ' 相关信息？').then(() => {
        return deleteClientGrant(grantId)
      }).then(() => {
        this.$modal.msgSuccess("删除成功");
        this.getGrantList();
      }).catch(() => {});
    },
    /* form-取消 */
    cancel() {
      this.open = false
    },
    // 客户端授权新增或者修改
    submitGrant() {
      this.$refs["formGrant"].validate(valid => {
        if (valid) {
          this.dict.type.sys_grant_code.forEach((item) => {
            if (item.value === this.formGrant.grantCode) {
              this.formGrant.grantDesc = item.label
            }
          })
          console.log(this.formGrant)
          if (this.formGrant.grandId !== '') {
            if (this.formGrant.grantCode !== 'haier_auth') {
              this.formGrant.haierSyscode = '',
              this.formGrant.haierClientId = '',
              this.formGrant.haierClientSecret = '',
              this.formGrant.loginRedirectUrl = '',
              this.formGrant.customLoginPage = '',
              this.formGrant.haierFeishuId = '',
              this.formGrant.haierFeishuSecret = ''
            }
            updateClientGrant(this.formGrant).then((res) => {
              console.log('res:', res)
              this.$modal.msgSuccess("修改成功")
              this.showGrantDialog = false
              this.getGrantList()
            })
          } else {
            addClientGrant(this.formGrant).then((res) => {
              console.log('res:', res)
              this.$modal.msgSuccess("新增成功")
              this.showGrantDialog = false
              this.getGrantList()
            }).catch((err) => {
              console.log(err)
            })
          }
        }
      })
    },
    /* 客户端授权formConfig---取消 */
    cancelGrant() {
      this.showGrantDialog = false
    }
  }
};
</script>
<style rel="stylesheet/scss" lang="scss">
  .inline-input {
    width: 100%;
  }
  .el-message-box__message p {
    word-break: break-all;
  }
</style>