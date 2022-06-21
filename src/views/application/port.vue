<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="客户端代码" prop="clientCode">
        <el-input
          v-model="queryParams.clientCode"
          placeholder="请输入客户端代码"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户端名称" prop="clientName">
        <el-input
          v-model="queryParams.clientName"
          placeholder="请输入客户端名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属应用名称" prop="appName">
        <!-- <el-autocomplete
          class="inline-input"
          v-model="queryParams.appName"
          :fetch-suggestions="querySearch"
          placeholder="请输入内容"
          clearable
          :trigger-on-focus="false"
          @select="handleSelect"
        ></el-autocomplete> -->
        <el-select v-model="queryParams.appId" filterable placeholder="请选择" @change="selectSearchChange" class="inline-input">
          <el-option
            v-for="item in appListAllOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增客户端</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="appList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="45" align="center" />
      <el-table-column label="序号" width="50" align="center" type="index" :index="indexMethod" />
      <el-table-column label="客户端id" prop="clientId" align="center" width="280">
        <template slot-scope="scope">
          <el-button type="text" v-clipboard:copy="scope.row.clientId" v-clipboard:success="clipboardSuccess">{{ scope.row.clientId}}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="客户端秘钥" prop="clientSecret" align="center" width="280">
        <template slot-scope="scope">
          <el-button type="text" v-clipboard:copy="scope.row.clientSecret" v-clipboard:success="clipboardSuccess">{{ scope.row.clientSecret}}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="客户端代码" prop="clientCode"  width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="客户端名称" prop="clientName"  :show-overflow-tooltip="true" width="120" />
      <el-table-column label="客户端描述" prop="clientDesc"  :show-overflow-tooltip="true" width="150" />
      <el-table-column label="允许多点登录" prop="multiLogin" align="center" width="100" >
        <template slot-scope="scope">
          <span>{{ scope.row.multiLogin | filterMultiLogin}}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用代码" prop="appCode" width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="所属应用名称" prop="appName"  :show-overflow-tooltip="true" width="160" />
      <el-table-column label="备注" prop="remark" align="center" :show-overflow-tooltip="true" width="80" />
      <el-table-column label="创建用户" prop="createBy" align="center" width="100" />
      <el-table-column label="创建时间" prop="createTime" align="center" width="110" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="编辑用户" prop="updateBy" align="center" width="100" />
      <el-table-column label="编辑时间" prop="updateTime" align="center" width="110" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="200px" class-name="small-padding" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleConfig(scope.row)"
          >授权配置</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 新建-修改//对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="550px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="124px" label-position="left">
        <el-form-item label="所属应用名称" prop="appName">
          <!-- <el-autocomplete
            class="inline-input"
            v-model="form.appName"
            :fetch-suggestions="querySearch"
            placeholder="请输入内容"
            :trigger-on-focus="false"
            @select="handleSelect"
          ></el-autocomplete> -->
          <el-select v-model="form.appId" :disabled="!!form.clientId" filterable placeholder="请选择" @change="selectChange" class="inline-input">
            <el-option
              v-for="item in appListAllOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户端代码" prop="clientCode" class="clientCode">
          <span class="appCode_span">{{form.appCode}}</span>
          <!-- <el-input v-model="form.appCode" style="min-width:60px" disabled/> -->
          <el-input v-model="form.clientCode" maxlength="2" @input="changeData()" placeholder="请输入客户端类型，样例00~10两位数字" clearable />
        </el-form-item>
        <el-form-item label="客户端名称" prop="clientName">
          <el-input v-model="form.clientName" placeholder="请输入客户端名称" clearable />
        </el-form-item>
        <el-form-item label="客户端描述" prop="clientDesc">
          <el-input v-model="form.clientDesc" placeholder="请输入客户端描述" clearable />
        </el-form-item>
        <el-form-item label="是否生成秘钥">
          <el-radio-group v-model="form.generateKeyFlag">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="令牌失效时间" prop="tokenInvalidTime">
          <el-input v-model="form.accessTokenExpiration" type="number" placeholder="请输入令牌失效时间(单位分钟)" clearable />
        </el-form-item>
        <el-form-item label="令牌刷新时间" prop="tokenRefreshTime">
          <el-input v-model="form.refreshTokenExpiration" type="number" placeholder="请输入令牌刷新时间(单位分钟)" clearable />
        </el-form-item>
        <el-form-item label="是否允许多点登录">
          <el-radio-group v-model="form.multiLogin">
            <el-radio :label="1">允许</el-radio>
            <el-radio :label="0">不允许</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 客户端授权//对话框 -->
    <el-dialog title="客户端授权" :visible.sync="openConfig" width="500px" append-to-body>
      <el-form ref="formConfig" :model="formConfig" :rules="rulesConfig" label-width="120px">
        <el-form-item label="所属应用名称" prop="appName">
          <el-input v-model="formConfig.appName" :disabled="true" />
        </el-form-item>
        <el-form-item label="所属客户端名称" prop="clientName">
          <el-input v-model="formConfig.clientName" :disabled="true" />
        </el-form-item>
        <el-form-item label="授权码" prop="grantCode">
          <el-select v-model="formConfig.grantCode" placeholder="请选择客户端授权码" clearable>
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formConfig.remark" type="textarea" placeholder="请输入备注内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormconfig">确 定</el-button>
        <el-button @click="cancelFormconfig">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listApi, addClientPort, updateClientPort, appList, deleteClientPort} from "@/api/app/port"
export default {
  name: "index",
  dicts: ['sys_grant_code'],
  data() {
    const validateNumber = (rule, value, callback) => {
      // const age = /^[0-9]{2}$/;
      // console.log(Number(value),Number(11))
      if (Number(value)>Number(10)) {
        callback(new Error('请输入00~10两位数字'))
      }else{
        callback()
      }
      // const age = /^[0-9]{2}$/;
      // if (!age.test(value)) {
      //   callback(new Error('请输入00~10两位数字'))
      // }else{
      //   callback()
      // }
    }
    return {
      appCode: '',
      // 遮罩层,true--加载中；false--加载完成
      loading: false,
      timeout: '', // 模糊搜索
      // 选中数组
      clientIds: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      /* 查询列表参数 */
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appCode: '',
        clientCode: '', // 客户端代码
        clientName: '', // 客户端名称
        appName: ''
      },
      /* 表格数据 */
      appList: [],
      /* 多选行删除获取应用Code */
      clientCodes: '',
      total: 0,
      /* 新建-修改Dialog表单数据 */
      form: {
        appId: '',
        clientCode: '',
        appCode: '',
        clientName: '',
        clientDesc: '',
        accessTokenExpiration: '',
        tokenRefreshTime: '',
        appName: '',
        multiLogin: 1,
        generateKeyFlag: 0,
        remark: ''
      },
      selectAppInfo: '',
      // 是否显示弹出层
      open: false,
      title: '',
      // 表单校验
      rules: {
        clientCode: [
          { required: true, message: "客户端代码不能为空", trigger: "change" },
          { validator: validateNumber, trigger: "change" }
        ],
        clientName: [
          { required: true, message: "客户端名称不能为空", trigger: "blur" }
        ],
        clientDesc: [
          { required: true, message: "客户端描述不能为空", trigger: "blur" }
        ],
        appName: [
          { required: true, message: "所属应用不能为空", trigger: "blur" }
        ]
      },
      /* -------------------客户端授权对话框 */
      openConfig: false,
      formConfig: {
        appName: undefined,
        clientName: undefined,
        grantCode: undefined,
        remark: undefined
      },
      rulesConfig: {
        grantCode: [
          { required: true, message: "授权码不能为空", trigger: "blur" }
        ]
      },
      // 远程搜索
      appListAll: [],
      appListAllOptions: [],
      state: ''
    }
  },
  filters: {
    filterMultiLogin (value) {
      return value === 0 ? '否' : '是'
    }
  },
  created() {
    this.getList()
    this.getAllAppList()
  },
  // mounted() {
  //   console.log(this.dicts)

  // },
  methods: {
    changeData() {
      if (this.form.clientCode) {
        const num = this.form.clientCode.replace(/^\.+|[^\d.]/g,'')
        this.$set(this.form, 'clientCode', num)
      }
    },
    clipboardSuccess () {
      this.$modal.msgSuccess("复制成功");
    },
    // 获取当前用户所属全部应用列表
    /* getAllAppList () {
      appList({}).then((res) => {
        if (res && res.rows) {
          res.rows.forEach((item) => {
            item.value = item.appName + `（code：${item.appCode}）`
          })
          this.appListAll = res.rows
        }
      })
    }, */
    getAllAppList () {
      appList({}).then((res) => {
        if (res && res.rows) {
          res.rows.forEach((item) => {
            item.value = item.appId
            item.label = item.appName
          })
          this.appListAllOptions = res.rows
        }
      })
    },
    selectChange (appId) {
      this.appListAllOptions.forEach((item) => {
        if (item.appId === appId) {
          this.form.appName = item.appName
          this.form.appCode = item.appCode
        }
      })
      console.log('this.form:', this.form)
    },
    selectSearchChange (appId) {
      this.appListAllOptions.forEach((item) => {
        if (item.appId === appId) {
          this.queryParams.appName = item.appName
        }
      })
    },
    // 获取列表信息
    getList() {
      let params = ''
      params = this.queryParams
      this.loading = true
      listApi(params).then(response => {
        this.appList = response.rows
        this.appList.forEach((item) => {
          if (item.app && item.app.appName) {
            item.appName = item.app.appName
          }
          if (item.app && item.app.appCode) {
            item.appCode = item.app.appCode
          }
        })
        this.total = response.total
        this.loading = false
      })
    },
    /* 序号处理 */
    indexMethod(index) {
      return index + ((this.queryParams.pageNum - 1) * 10) + 1
    },
    /* 输入建议相关方法------------- */
    querySearch(queryString, cb) {
      var appListAll = this.appListAll
      var results = queryString ? appListAll.filter(this.createStateFilter(queryString)) : appListAll
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 300)
    },
    createStateFilter (queryString) {
      return (state) => {
        return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1)
      }
    },
    handleSelect(item) {
      this.selectAppInfo = item
      this.form.appId = item.appId
      this.form.appName = item.appName
      console.log(item);
    },
    /** -----------------查询按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.appName = ''
      this.queryParams.appId = ''
      this.queryParams.appCode = ''
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.clientIds = selection.map(item => item.clientId);
      this.clientCodes = selection.map(item => item.clientCode);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    reset() {
      this.form = {
        appId: '',
        clientId: '',
        appCode: '',
        clientCode: '',
        clientName: '',
        clientDesc: '',
        accessTokenExpiration: '',
        tokenRefreshTime: '',
        appName: '',
        multiLogin: 1,
        generateKeyFlag: 0,
        remark: ''
      }
      this.resetForm("form")
    },
    /* 新建客户端form */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增客户端'
    },
    /* 修改form */
    handleUpdate(row) {
      this.reset()
      this.open = true
      this.title = '编辑客户端'
      if (!row.clientId) {
        this.appList.forEach((item) => {
          if (item.clientId === this.clientIds[0]) {
            row = item
          }
        })
      }
      this.form = Object.assign({}, row)
      // console.log(row)
      let code = row.clientCode //客户端代码
      let appCode = row.appCode //应用代码
      if (code.substring(0,appCode.length) === appCode) {
        this.form.clientCode = code.substring(appCode.length, code.length)
      } else {
        this.form.clientCode = code
      }
      
    },
    // 客户端新增/修改
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let params = {}
          params = Object.assign({}, this.form)
          let code = this.form.appCode+this.form.clientCode
          // console.log(code)
          params.clientCode = code
          if (this.form.clientId !== '') {
            updateClientPort(params).then((res) => {
              // console.log('修改',this.form)
              // console.log(res)
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.handleQuery()
            })
          } else {
            addClientPort(params).then((res) => {
              // console.log('新增',this.form)
              // console.log(res)
              this.$modal.msgSuccess("新增成功");
              this.open = false
              this.handleQuery()
            })
          }
        }
      })
    },
    // 删除客户端
    handleDelete(row) {
      var clientCode = ''
      if (row.clientCode) {
        clientCode = row.clientCode
      } else {
        clientCode = this.clientCodes
      }
      this.$modal.confirm('是否删除客户端代码为：' + clientCode + ' 相关信息？').then(() => {
        let clientIds = row.clientId || this.clientIds
        return deleteClientPort(clientIds)
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /* form-取消 */
    cancel() {
      this.open = false
    },
    /* ----------------------- */
    resetFormconfig() {
      this.formConfig = {
        appName: undefined,
        clientName: undefined,
        grantCode: undefined,
        remark: undefined
      }
      this.resetForm("formConfig")
    },
    /* 授权配置formConfig */
    handleConfig(row) {
      const clientId = row.clientId
      console.log('clientId:', clientId)
      this.$router.push("/application/grant-auth/grant/" + clientId);
    },
    /* 客户端授权formConfig---确定 */
    submitFormconfig() {
      this.openConfig = false
    },
    /* 客户端授权formConfig---取消 */
    cancelFormconfig() {
      this.openConfig = false
    }
  }
};
</script>
<style rel="stylesheet/scss" lang="scss">
  .inline-input {
    width: 100%;
  }
  .clientCode .el-form-item__content{
    display:flex;
    flex-direction: row;
    justify-content: space-around;
  }
  .appCode_span{
    padding:0 10px;
    height:36px;
    min-width:75px;
    margin-right:10px;
    border:1px solid #DCDFE6;
    border-radius:4px
  }
</style>
