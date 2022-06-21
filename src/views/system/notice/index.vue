<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input
          v-model="queryParams.noticeTitle"
          placeholder="请输入公告标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作人员" prop="createBy">
        <el-input
          v-model="queryParams.createBy"
          placeholder="请输入操作人员"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="公告类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.sys_notice_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
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
          v-hasPermi="['system:notice:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:notice:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:notice:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="noticeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="noticeId" width="100" />
      <el-table-column
        label="公告标题"
        align="center"
        prop="noticeTitle"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="公告类型" align="center" prop="noticeType" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_notice_type" :value="scope.row.noticeType"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_notice_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="100">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:notice:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:notice:remove']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleSend(scope.row)"
            v-hasPermi="['cms:email:send']"
          >发送邮件</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改公告对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="780px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="noticeType">
              <el-select v-model="form.noticeType" placeholder="请选择">
                <el-option
                  v-for="dict in dict.type.sys_notice_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_notice_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <editor v-model="form.noticeContent" :min-height="192"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 发送邮件 -->
    <el-dialog :title="title" :visible.sync="openSend" width="780px" append-to-body :before-close="cancelSend">
      <el-form ref="formEmail" :model="formEmail" :rules="rulesEmail" label-width="100px">
        <el-row>
          <el-col :span="16">
            <el-form-item label="发件人名称" prop="senderName">
              <el-input v-model="formEmail.senderName" placeholder="请输入发件人名称" />
            </el-form-item>
          </el-col>
          <div class="clearfix"></div>
          <div class="send-people">
            <el-col :span="16">
              <el-form-item label="发件人地址" prop="from">
                <el-input v-model="formEmail.from" placeholder="请输入发件人地址，邮箱后缀必须为@haier.net" />
              </el-form-item>
            </el-col>
            <!--<span class="email-name">@haier.net</span>-->
          </div>
          <el-col :span="16">
            <el-form-item label="收件人" :span="18">
              <el-input v-model="formEmail.tos" placeholder="请输入收件人，多个以“,”隔开，最多30个" @input="changeData('tos')" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="抄送人">
              <el-input v-model="formEmail.cc" placeholder="请输入抄送人，多个以“,”隔开，最多30个" @input="changeData('cc')"/>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="密送人">
              <el-input v-model="formEmail.bcc" placeholder="请输入密送人，多个以“,”隔开，最多30个" @input="changeData('bcc')" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="邮件标题" prop="title">
              <el-input v-model="formEmail.title" placeholder="请输入邮件标题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="邮件内容" required>
              <editor v-model="formEmail.content" :min-height="192"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitEmailForm">发 送</el-button>
        <el-button @click="cancelSend">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from "@/api/system/notice";
import { sendEmail, sendAllEmail, emailLog } from "@/api/publicFun/sendMail";

export default {
  name: "Notice",
  dicts: ['sys_notice_status', 'sys_notice_type'],
  data() {
    // 自定义校验规则
    var bargainEmail = (rule, value, callback) => {
      // rule 对应使用bargainEmail自定义验证的 对象
      // value 对应使用bargainEmail自定义验证的 数值
      // callback 回调函数
      const r = /@haier.net$/; // 正整数
      if (value == null || String(value).trim() === "") {
        callback(new Error('发件人地址不能为空'));
      } else if (!r.test(value)) {
        callback(new Error('邮箱地址结尾必须为@haier.net'));
      } else {
        callback();
      }
    }
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
      // 公告表格数据
      noticeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      openSend: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: undefined,
        createBy: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      formEmail: {
        appKey: 'APPNAME011',
        tos: '',
        cc: '',
        bcc: '',
        title: '',
        from: '',
        senderName: '',
        content: ''
      },
      senderName: '',
      senderAddr: '',
      // 表单校验
      rules: {
        noticeTitle: [
          { required: true, message: "公告标题不能为空", trigger: "blur" }
        ],
        noticeType: [
          { required: true, message: "公告类型不能为空", trigger: "change" }
        ]
      },
      rulesEmail: {
        from: [
          { required: true,
            validator: bargainEmail,
            trigger: ['blur', 'change'] }
        ],
        senderName: [
          { required: true, message: "发件人名称不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "邮件标题不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getConfigKey("cms.notice.senderName").then(response => {
      this.senderName = response.msg;
    });
    this.getConfigKey("cms.notice.senderAddr").then(response => {
      this.senderAddr = response.msg;
    });
  },
  methods: {
    /** 查询公告列表 */
    getList() {
      this.loading = true;
      listNotice(this.queryParams).then(response => {
        this.noticeList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 弹出发送邮件弹框 */
    handleSend(row) {
      this.reset();
      const noticeId = row.id;
      this.$set(this.formEmail, 'title', row.noticeTitle);
      this.$set(this.formEmail, 'content', row.noticeContent);
      this.$set(this.formEmail, 'senderName', this.senderName);
      this.$set(this.formEmail, 'from', this.senderAddr);
      this.openSend = true;
      this.title = "发送邮件";
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    cancelSend () {
      this.openSend = false;
      this.resetSend();
    },
    // 表单重置
    reset() {
      this.form = {
        noticeId: undefined,
        noticeTitle: undefined,
        noticeType: undefined,
        noticeContent: undefined,
        status: "0"
      };
      this.resetForm("form");
    },
    // 表单重置
    resetSend() {
      this.formEmail = {
        appKey: 'APPNAME011',
        tos: undefined,
        cc: undefined,
        bcc: undefined,
        title: undefined,
        from: undefined,
        senderName: undefined,
        content: undefined
      };
      this.resetForm("formEmail");
    },
    /** 搜索按钮操作 */
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
      this.ids = selection.map(item => item.noticeId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加公告";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const noticeId = row.noticeId || this.ids
      getNotice(noticeId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改公告";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.noticeId != undefined) {
            updateNotice(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addNotice(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 提交按钮 */
    submitEmailForm: function() {
      let _this = this
      this.$refs["formEmail"].validate(valid => {
        if (valid) {
          let content = _this.formEmail.content.replace(/< /g, '<')
          content = _this.formEmail.content.replace(/ >/g, '>')
          let params = {
            appKey: _this.formEmail.appKey,
            tos: _this.formEmail.tos,
            cc: _this.formEmail.cc,
            bcc: _this.formEmail.bcc,
            content: _this.formEmail.content,
            senderName: _this.formEmail.senderName,
            title: _this.formEmail.title,
            from: _this.formEmail.from
          }
          if (!_this.formEmail.tos) {
            _this.$confirm('确定全员发送该邮件吗?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              params.tos = 'all'
              sendAllEmail(params).then(response => {
                debugger
                console.log(response);
                this.getList();
                this.openSend = false;
              })
            }).catch(() => {
            });
          } else {
            sendEmail(params).then(response => {
              console.log(response);
              this.getList();
              this.openSend = false;
            })
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const noticeIds = row.noticeId || this.ids
      this.$modal.confirm('是否确认删除公告编号为"' + noticeIds + '"的数据项？').then(function() {
        return delNotice(noticeIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    // 监听输入邮箱名格式
    changeData (str) {
      if (this.formEmail[str].includes('，')) {
        let data = this.form[str].replace(/，/g, ',')
        this.$set(this.form, str, data)
      }
    }
  }
};
</script>
<style lang="scss" scoped>
  .send-people {
    .email-name {
      margin-left: 20px;
      line-height: 36px;
      font-size: 14px;
    }
  }
</style>
