<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="应用代码" prop="appCode">
        <el-input
          v-model="queryParams.appCode"
          placeholder="请输入应用代码"
          clearable
          @clear="handleQuery"
          size="small"
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="应用名称" prop="appName">
        <el-input
          v-model="queryParams.appName"
          placeholder="请输入应用名称"
          clearable
          @clear="handleQuery"
          size="small"
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="应用负责人" prop="appOwnerId">
        <el-select v-model="queryParams.appOwnerId" filterable clearable @clear="handleQuery" placeholder="请选择应用负责人">
          <el-option
            v-for="(item,index) in userList"
            :key="index"
            :label="item.nickName"
            :value="item.userId">
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
        >新增应用</el-button>
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
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="50" align="center" type="index" :index="indexMethod" />
      <el-table-column label="应用代码" prop="appCode"  width="120" />
      <el-table-column label="应用名称" prop="appName"  :show-overflow-tooltip="true" width="150" />
      <el-table-column label="应用描述" prop="appDesc"  :show-overflow-tooltip="true" width="120" />
      <el-table-column label="是否多端登录" prop="multiLogin" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.multiLogin | filterMultiLogin}}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用负责人" prop="appOwnerNameList" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="创建用户" prop="createBy"  width="100" />
      <el-table-column label="创建时间" prop="createTime" align="center" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="编辑用户" prop="updateBy" align="center" width="100" />
      <el-table-column label="编辑时间" prop="updateTime" align="center" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="100px" class-name="small-padding">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
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
    <!-- 对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :before-close="cancel">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="应用代码" prop="appCode">
          <el-input v-model="form.appCode" maxlength="6" clearable placeholder="FA+4位数字，不可重复，样例FA0001" />
          <!-- <span>FA+4位数字，不可重复，样例FA0001</span> -->
        </el-form-item>
        <el-form-item label="应用名称" prop="appName">
          <el-input v-model="form.appName" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="应用描述" prop="appDesc">
          <el-input v-model="form.appDesc" placeholder="请输入应用描述" />
        </el-form-item>
        <el-form-item label="是否多端登录">
          <el-radio-group v-model="form.multiLogin">
            <el-radio :label="1">允许</el-radio>
            <el-radio :label="0">不允许</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="应用负责人" prop="appOwnerIdList">
          <el-select v-model="form.appOwnerIdList" filterable multiple placeholder="请选择应用负责人" style="width:100%">
            <el-option
              v-for="(item,index) in userList"
              :key="index"
              :label="item.nickName"
              :value="item.userId">
            </el-option>
          </el-select>
          <!-- <el-button style="margin-left:10px;" type="primary" @click="gotoUser">用户管理</el-button> -->
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
  </div>
</template>

<script>
import { listApi, userlistApi, updateApp, addApp, delApp } from "@/api/app/index"
import { getInfo } from '@/api/login'

export default {
  name: "index",
  data() {
    const validateReapet = (rule, value, callback) => {
      // console.log(value)
      // console.log(this.tempForm.appCode)
      const appCodeList = this.appAllList.map(item => item.appCode);
      if (this.tempForm.appCode) { //修改
        if (this.tempForm.appCode===value) { //没有改动
          callback()
        } else {
          if (appCodeList.includes(value)) {
            return callback(new Error('当前应用代码重复'))
          } else {
            callback()
          }
        }
      } else { //新建
        if (appCodeList.includes(value)) {
          // console.log('----',appCodeList)
          return callback(new Error('当前应用代码重复'))
        } else {
          callback()
        }
      }
    }
    const validateNumber = (rule, value, callback) => {
      const age = /^[F]{1}[A]{1}[0-9]{4}$/;
      if (!age.test(value)) {
        callback(new Error('格式不正确，应为：FA+4位数字，例:“FA0001”'))
      }else{
        callback()
      }
    }
    return {
      tempForm: [],
      // 遮罩层,true--加载中；false--加载完成
      loading: false,
      /* 查询列表参数 */
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appCode: undefined,
        appName: undefined,
        appOwnerId: undefined
      },
      /* 表格数据 */
      appList: [],
      /* 多选行删除获取应用名称 */
      names: '',
      ids: '',
      total: 0,
      /* Dialog表单数据 */
      form: {
        appCode: '',
        appName: '',
        appDesc: '',
        multiLogin: 1,
        appOwnerIdList: [],
        remark: ''
      },
      /* 应用负责人id */
      // appOwnerIdList: [],
      userList: [],
      // 是否显示弹出层
      open: false,
      title: '',
      // 表单校验
      rules: {
        appCode: [
          { required: true, message: "应用代码不能为空", trigger: "change" },
          { validator: validateNumber, trigger: "change" },
          { validator: validateReapet, trigger: "change" }
        ],
        appName: [
          { required: true, message: "应用名称不能为空", trigger: "blur" }
        ],
        appDesc: [
          { required: true, message: "应用描述不能为空", trigger: "blur" }
        ],
        appOwnerIdList: [
          { required: true, message: "应用负责人必选", trigger: "blur" }
        ]
      },
      clientId: '',
      multiple: true,
      appAllList: []
    }
  },
  filters: {
    filterMultiLogin (value) {
      return value === 0 ? '否' : '是'
    }
  },
  created() {
    this.getList()
    this.getInfor()
    this.getUser()
  },
  methods: {
    getInfor() {
      getInfo().then(data => {
        this.clientId = data.user.clientId
      })
    },
    /* 获取全部应用代码 */
    getAllLists() {
      listApi({}).then(data => {
        this.appAllList = data.rows
      })
    },
    // 获取列表信息
    getList() {
      this.loading = true
      listApi(this.queryParams).then(data => {
        this.appList = data.rows
        this.total = data.total
        for(let i = 0; i < this.appList.length; i++) {
          for(let j = 0;j < this.appList[i].appOwnerNameList.length-1;j++){
            this.appList[i].appOwnerNameList[j] = this.appList[i].appOwnerNameList[j] + ','
          }
        }
        this.loading = false;
      });
    },
    /* 序号处理 */
    indexMethod(index) {
      return index + ((this.queryParams.pageNum - 1) * 10) + 1
    },
    /* 获取应用负责人 */
    getUser() {
      const params = {
        status: '0',
        clientId: '60777a36a71d4fcaaa758d04bb4e9616'
      }
      userlistApi(params).then(data => {
        this.userList = data.rows
      })
    },
    // gotoUser () {
    //   this.$router.push('/system/user')
    // },
    /** 查询按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.names = selection.map(item => '《'+item.appName+'》')
      this.ids = selection.map(item => item.appId)
      this.multiple = !selection.length
    },
    reset() {
      this.form = {
        appCode: '',
        appName: '',
        appDesc: '',
        multiLogin: 1,
        appOwnerIdList: [],
        remark: ''
      }
      this.resetForm("form")
    },
    /* 新建应用 */
    handleAdd() {
      this.reset()
      this.getAllLists()
      this.tempForm = []
      this.title = '新增应用'
      this.open = true
    },
    /* 修改 */
    handleUpdate(row) {
      this.reset()
      this.getAllLists()
      this.tempForm = []
      this.title = '修改应用'
      this.open = true
      // this.form = row
      this.form = Object.assign({}, row)
      this.tempForm = Object.assign({}, row)
    },
    /* 删除 */
    handleDelete(row) {
      var appName = ''
      if (row.appName) {
        appName = '《' + row.appName + '》'
      } else {
        appName = this.names
      }
      const appIds = row.appId || this.ids
      this.$modal.confirm('是否确认删除' + appName + '相关信息？').then(function() {
        return delApp(appIds); // 调用删除接口
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /* Dialog-确定 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.appId != undefined) {
            updateApp(this.form).then(data => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addApp(this.form).then(data => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /* Dialog-取消 */
    cancel() {
      this.open = false
    }
  }
};
</script>
