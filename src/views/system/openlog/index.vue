<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
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
      <el-form-item label="调用方" prop="clientId" label-width="88px">
        <el-select
          v-model="queryParams.clientId"
          placeholder="调用方"
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
      <el-form-item label="接口名称" prop="title">
        <el-input
          v-model.trim="queryParams.title"
          placeholder="请输入接口名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择操作状态"
          clearable
        >
          <el-option
            v-for="dict in dict.type.sys_common_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间" prop="operTime">
        <el-date-picker
          v-model="daterangeOperTime"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:openlog:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
          v-hasPermi="['system:openlog:remove']"
        >清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:openlog:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="openlogList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日志编号" align="center" prop="operId" />
      <el-table-column label="应用名称" align="center" prop="appName" :show-overflow-tooltip="true"/>
      <el-table-column label="接口名称" align="center" prop="title" :show-overflow-tooltip="true"/>
      <el-table-column label="请求方式" align="center" prop="requestMethod" />
      <el-table-column label="调用方" align="center" prop="clientName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="主机地址" align="center" prop="operIp" :show-overflow-tooltip="true" />
      <el-table-column label="操作状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.sys_common_status"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作时间"
        align="center"
        prop="operTime"
        width="180"
        sortable="custom" 
        :sort-orders="['descending', 'ascending']" 
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.operTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['system:openlog:query']"
            >详细</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改操作日志记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="接口说明：">{{ form.title }}</el-form-item>
            <el-form-item
              label="调用方信息："
              label-width="113px"
            >{{ form.clientName }} / {{ form.operIp }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作状态：">
              <div v-if="form.status === 0">成功</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间：">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listOpenlog,
  getOpenlog,
  delOpenlog,
  getAppInfo,
  cleanOpenlog,
} from "@/api/system/openlog";

export default {
  name: "Openlog",
  dicts: ['sys_oper_type', "sys_common_status"],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 操作日志记录表格数据
      openlogList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        appId: null,
        clientId: null,
        pageNum: 1,
        pageSize: 10,
        title: null,
        status: null,
        operTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      // 应用信息
      AppList: [],
      // 端信息
      clientList: [],
      // 默认排序
      defaultSort: {prop: 'operTime', order: 'descending'},
      // 调用方id时间范围
      daterangeOperTime: [],
    };
  },
  created() {
    this.getList();
    this.getAppList()
  },
  methods: {
    /** 查询操作日志记录列表 */
    getList() {
      this.loading = true;
      this.queryParams.params = {};
      if (null != this.daterangeOperTime && '' != this.daterangeOperTime) {
        this.queryParams.params["beginOperTime"] = this.daterangeOperTime[0];
        this.queryParams.params["endOperTime"] = this.daterangeOperTime[1];
      }
      listOpenlog(this.queryParams).then(response => {
        this.openlogList = response.data.rows;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        operId: null,
        title: null,
        method: null,
        requestMethod: null,
        operUrl: null,
        operIp: null,
        operParam: null,
        jsonResult: null,
        status: null,
        errorMsg: null,
        operTime: null,
        appId: null,
        clientId: null,
      };
      this.dateRange = [];
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.daterangeOperTime = [];
      this.clientList = []
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.operId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const operIds = row.operId || this.ids;
      this.$modal.confirm('是否确认删除日志编号为"' + operIds + '"的数据项？').then(function() {
        return delOpenlog(operIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 详细按钮操作 */
    handleView(row) {
      this.reset();
      const operId = row.operId || this.ids;
      getOpenlog(operId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "操作日志详细";
      });
    },
     /** 清空按钮操作 */
    handleClean() {
      this.$modal.confirm('是否确认清空所有操作日志数据项？').then(function() {
        return cleanOpenlog();
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("清空成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "system/openlog/export",
        {
          ...this.queryParams,
        },
        `openlog_${new Date().getTime()}.xlsx`
      );
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
  },
};
</script>
