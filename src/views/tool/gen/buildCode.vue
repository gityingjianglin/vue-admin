<template>
  <!-- 导入表 -->
  <el-dialog title="创建表结构" :visible.sync="visible" width="800px" top="5vh" append-to-body @close="colseBuildCode">
    <el-form  :inline="true">
      <div class="label">创建表语句(支持多个建表语句)：</div>
      <el-input
        type="textarea"
        :rows="12"
        autocomplete="off"
        placeholder="请输入内容"
        v-model="textarea">
      </el-input>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleBuildCode">确 定</el-button>
      <el-button @click="colseBuildCode">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createTable } from "@/api/tool/gen";
export default {
  name: "buildCode",
  data() {
    return {
      // 遮罩层
      visible: false,
      textarea: '',
    };
  },
  methods: {
    // 显示弹框
    show() {
      this.visible = true;
    },
    //驼峰式转下划线
    toLowerLine(str) {
      var temp = str.replace(/[A-Z]/g, function (match) {	
        return "_" + match.toLowerCase();
      })
      if(temp.slice(0,1) === '_'){ //如果首字母是大写，执行replace时会多一个_，这里需要去掉
        temp = temp.slice(1);
      }
      return temp;
    },
    handleBuildCode() {
      let beginStr = this.textarea.slice(0, 12)
      if (beginStr !== 'create table' && beginStr !== 'CREATE TABLE') {
        this.$modal.msgError('格式错误')
      } else {
        let reg = new RegExp('^(create table|CREATE TABLE)\s*(.*)\s*[(]')
        let matchStr = this.textarea.match(reg)[2]
        let replaceStr = this.toLowerLine(matchStr)
        this.textarea = this.textarea.replace(matchStr,replaceStr)
        let params = {
          sql:this.textarea
        }
        createTable(params).then(data => {
          this.visible = false
          this.textarea =  ''
        })
      }
    },
    colseBuildCode() {
      this.visible = false
      // if (this.textarea) {
      //   this.$confirm('表语句未提交, 是否继续?', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     this.visible = false
      //   })
      // } else {
      //   this.visible = false
      // }
    }
  }
};
</script>
<style scoped>
.label {
  margin-bottom: 10px;
}
</style>
