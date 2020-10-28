<template>
  <container>
    <template #header>
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="行政村选择">
          <el-select v-model="belongedStreet" placeholder="请选择行政村" clearable @change="getUserPower">
            <el-option label="测试值" value="测试" />
            <el-option
              v-for="item in sectionOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公议人选择">
          <el-select v-model="userSelect" placeholder="请选择公议人" clearable>
            <el-option
              v-for="item in peopleOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="generateDetailCollect">生成评价明细表</el-button>
          <el-button type="primary" @click="generateCreditDetail">生成授信明细表</el-button>
          <el-button type="primary" icon="el-icon-search" @click="onGetList">搜素</el-button>
        </el-form-item>
      </el-form>
    </template>
    <el-table
      ref="resultTable"
      v-loading="listLoading"
      row-key="id"
      :data="resultTable"
      :default-expand-all="false"
      :row-class-name="tableRowClassName"
      highlight-current-row
      border
      style="width: 100%;"
    >
      <el-table-column prop="id" width="150" label="户号" />
      <el-table-column prop="headUserName" label="户主姓名" />
      <el-table-column prop="headUserAddress" label="居住地址" />
      <el-table-column prop="headUserIdNumber" label="身份证号" />
      <el-table-column prop="suggestCreditorName" label="建议授信人姓名" />
      <el-table-column prop="suggestCreditorIdNumber" label="建议授信人身份证号" />
      <el-table-column prop="suggestCreditLimit" label="建议授信额(万元)" />
      <el-table-column prop="deviationMark" label="偏离过大警告">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.deviationMark ? 'danger' : 'success'"
            disable-transitions
          >{{ scope.row.deviationMark ? '告警' : '无' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dangerUserMark" label="出现一户风险情况认定">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.dangerUserMark ? 'danger' : 'success'"
            disable-transitions
          >{{ scope.row.dangerUserMark ? '告警' : '无' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="refuseMark" label="拒绝授信表示标识">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.refuseMark ? 'danger' : 'success'"
            disable-transitions
          >{{ scope.row.refuseMark ? '拒绝授信' : '无' }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </container>
</template>

<script>
import Container from '@/components/Container/index'
import { getCalculateList, getSectionCodeList, generateDetailCollectXlsx, generateCreditDetailXlsx, getUserPowerSelect } from '@/api/questionnaire/household'
export default {
  name: 'Calculateresult',
  components: {
    Container
  },
  data() {
    return {
      belongedStreet: null,
      userSelect: null,
      // 表格加载
      listLoading: false,
      // 表格数据
      resultTable: [{
        id: 0,
        headUserName: '',
        headUserIdNumber: '',
        headUserAddress: '',
        suggestCreditorName: '',
        suggestCreditorIdNumber: '',
        suggestCreditLimit: 0,
        deviationMark: false,
        dangerUserMark: false,
        refuseMark: false
      }],
      sectionOption: [],
      peopleOption: []
    }
  },
  mounted() {
    this.getSectionCodeList()
  },
  methods: {
    // 行政村变更更换公议人员
    getUserPower: async function() {
      const data = { code: this.belongedStreet }

      const res = await getUserPowerSelect(data)
      if (res.success) {
        this.peopleOption = res.data
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 生成授信明细表
    generateCreditDetail: async function() {
      if (this.belongedStreet) {
        const data = { code: this.belongedStreet }

        const res = await generateCreditDetailXlsx(data)
        if (res.success) {
          this.$alert('<a target="_blank" href="/api/questionnaire/household/DownloadCreditCollectFile?fileName=' + res.data + '">下载文件<a>', '下载界面', {
            dangerouslyUseHTMLString: true
          })
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      } else {
        this.$message({
          message: '请选择行政村后操作'
        })
      }
    },
    // 生成评价明细表
    generateDetailCollect: async function() {
      if (this.belongedStreet && this.userSelect) {
        const data = { code: this.belongedStreet, id: this.userSelect }
        const res = await generateDetailCollectXlsx(data)
        if (res.success) {
          // this.$message({
          //   showClose: true,
          //   message: '<a href="/api/questionnaire/household/DownloadFile?fileName=' + res.data + '">下载文件<a>',
          //   type: 'success'
          // })
          this.$alert('<a target="_blank" href="/api/questionnaire/household/DownloadFile?fileName=' + res.data + '">下载文件<a>', '下载界面', {
            dangerouslyUseHTMLString: true
          })
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      } else {
        this.$message({
          message: '请选择行政村和公议人之后进行操作',
          type: 'error'
        })
      }
    },
    // 获取行政村代码
    getSectionCodeList: async function() {
      const res = await getSectionCodeList()
      if (res.success) {
        this.sectionOption = res.data
      } else {
        this.$message({
          message: res.data,
          type: 'error'
        })
      }
    },
    // 变更颜色
    tableRowClassName: function({ row, rowIndex }) {
      if (row.deviationMark) {
        return 'warning-row'
      }
      if (row.dangerUserMark) {
        return 'warning-row'
      }
      if (row.refuseMark) {
        return 'danger-row'
      }

      return ''
    },
    // 查询
    onGetList: async function() {
      if (this.belongedStreet) {
        this.listLoading = true
        const res = await getCalculateList({ code: this.belongedStreet })

        if (res.success) {
          this.resultTable = res.data
          console.log(res.data)
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }

        this.listLoading = false
      } else {
        this.$message({
          message: '目前只支持分行政村查看，请选择行政村后再次尝试!',
          type: 'error'
        })
      }
    }
  }
}
</script>

<style>
  .el-table .warning-row {
    background: rgba(230, 162, 60, 0.39);
  }

  .el-table .danger-row {
    background: rgba(245, 108, 108, 0.44);
  }
</style>
