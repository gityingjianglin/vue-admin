<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <!-- <el-form-item label="登录地址" prop="ipaddr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="请输入登录地址"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
       <el-form-item label="应用名称" prop="appId">
        <el-select
        v-model="queryParams.appId"
        placeholder="应用名称"
        clearable
        filterable
        size="small"
        style="width: 240px"
        @change="appChangeEvent"
      >
        <el-option
          v-for="item in AppList"
          :key="item.appId"
          :label="item.appName"
          :value="item.appId"
        />
      </el-select>
      </el-form-item>
      <el-form-item label="客户端名称" prop="clientId" label-width="88px">
        <el-select
          v-model="queryParams.clientId"
          placeholder="客户端名称"
          clearable
          filterable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in clientList"
            :key="item.clientId"
            :label="item.clientName"
            :value="item.clientId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入登录名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>

    </el-form>
    <el-table
      v-loading="loading"
      :data="list.slice((pageNum-1)*pageSize,pageNum*pageSize)"
      style="width: 100%;"
    >
      <el-table-column label="序号" type="index" align="center">
        <template slot-scope="scope">
          <span>{{(pageNum - 1) * pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
       <el-table-column label="应用名称"  prop="appName" :show-overflow-tooltip="true" width="160">
      </el-table-column>
       <el-table-column label="客户端名称"  key="clientName" prop="clientName" :show-overflow-tooltip="true" width="120"  >
      </el-table-column>
      <el-table-column label="会话编号" align="center" prop="tokenId" :show-overflow-tooltip="true"/>
      <el-table-column label="用户账号"  prop="userName" :show-overflow-tooltip="true" width="100" />
      <el-table-column label="用户名称"  prop="nickName" :show-overflow-tooltip="true" width="100" />
      <el-table-column label="主机" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="登录时间" align="center" prop="loginTime" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleForceLogout(scope.row)"
            v-hasPermi="['monitor:online:forceLogout']"
          >强退</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />
  </div>
</template>

<script>
import { list, forceLogout, getAppInfo } from "@/api/monitor/online";

export default {
  name: "Online",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      pageNum: 1,
      pageSize: 10,
      // 查询参数
      queryParams: {
        ipaddr: undefined,
        userName: undefined,
        appId: undefined,
        clientId: undefined
      },
       // 应用信息
      AppList: [],
      // 端信息
      clientList: []
    };
  },
  created() {
    this.getAppList()
    this.getList();
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true;
      list(this.queryParams).then(response => {
        this.list = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.clientList = []
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 强退按钮操作 */
    handleForceLogout(row) {
      this.$modal.confirm('是否确认强退名称为"' + row.userName + '"的用户？').then(function() {
        return forceLogout(row.tokenId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("强退成功");
      }).catch(() => {});
    },
    /** 查询所有应用 */
    getAppList () {
      getAppInfo({dataLevel:2}).then(res => {
        console.log('获取所有应用信息', res);
        this.AppList = res.data
      })
    },
    /** 应用变化更换对应的端 */
    appChangeEvent (val) {
      console.log(val, 'val');
      this.queryParams.clientId = ''
      if (val) {
        this.clientList = this.AppList.filter(x => x.appId === val)[0].clientList
      } else {
        this.clientList = []
      }
      console.log(this.queryParams.clientId);
    },
  }
};
</script>

