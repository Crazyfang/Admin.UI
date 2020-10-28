<template>
  <container>
    <template #header>
      <!--查询-->
      <el-form :inline="true" :model="filter" @submit.native.prevent>
        <el-row>
          <el-col :span="4">
            <el-form-item>
              <el-input v-model="filter.userCode" placeholder="客户号">
                <template #prefix>
                  <i class="el-input__icon el-icon-search" />
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item>
              <el-input v-model="filter.userName" placeholder="客户姓名">
                <template #prefix>
                  <i class="el-input__icon el-icon-search" />
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="6">
            <el-form-item label="选择类别" label-width="80px">
              <el-select v-model="filter.type" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" @click.native="onGetList">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addVisible = true">添加</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </template>

    <!--列表-->
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      row-key="id"
      :data="loanMethodList"
      :default-expand-all="false"
      highlight-current-row
      border
      style="width: 100%;"
    >
      <el-table-column prop="id" width="50" label="ID" />
      <el-table-column prop="userName" label="客户名称" width="200px" />
      <el-table-column prop="userCode" label="客户号" width="200px" />
      <el-table-column prop="type" label="状态" width="180px">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.overSign === 1 ? 'danger' : ( scope.row.overSign === 2 ? 'success' : 'primary' )"
            disable-transitions
          >{{ statusCalculate(scope.row.overSign) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sumValue" label="合同金额(万元)" width="150px" />
      <el-table-column prop="partialValue" label="需替换金额(万元)" width="150px" />
      <el-table-column prop="beginTime" label="设定起始时间" :formatter="formatCreatedTime" width="200px" />
      <el-table-column prop="overTime" label="结束时间" :formatter="formatCreatedTime" width="200px" />
      <el-table-column label="操作" width="240px" fixed="right">
        <template v-slot="{ $index, row }">
          <el-button @click="editButtonClick($index, row)">编辑</el-button>
          <confirm-button type="delete" :loading="row._loading" @click="delLoanMethod($index, row)" />
          <confirm-button type="other" button-text-string="审核" content="确定审核通过吗？" :loading="verifyLoading" @click="verifyLoanMethod($index, row)" />
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <template #footer>
      <pagination
        ref="pager"
        :page.sync="pager.currentPage"
        :size.sync="pager.pageSize"
        :total="pager.total"
      />
    </template>

    <!--添加界面-->
    <el-dialog
      v-model="addVisible"
      width="60%"
      title="添加界面"
      :visible.sync="addVisible"
      :close-on-click-modal="true"
    >
      <el-row :gutter="20">
        <el-col :span="8" style="margin-bottom: 20px">
          <span>客户姓名:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <el-input v-model="addForm.userName" placeholder="客户姓名" />
        </el-col>
        <el-col :span="8" style="margin-bottom: 20px">
          <span>客户号:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <el-input v-model="addForm.userCode" placeholder="客户号" />
        </el-col>
        <el-col :span="8" style="margin-bottom: 20px">
          <span>选择起始时间:</span>
        </el-col>
        <el-col :span="10" style="margin-bottom: 20px">
          <el-date-picker
            v-model="addForm.beginTime"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8" style="margin-bottom: 20px">
          <span>到期天数设置:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <el-input-number v-model="addForm.countDay" controls-position="right" :min="1" />
        </el-col>
      </el-row>
      <el-divider />
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12" style="text-align: center">
          <span>合同金额(万元)</span>
        </el-col>
        <el-col :span="12" style="text-align: center">
          <span>需替换金额(万元)</span>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12" style="text-align: center">
          <el-input v-model="addForm.sumValue" placeholder="合同金额" />
        </el-col>
        <el-col :span="12" style="text-align: center">
          <el-input v-model="addForm.partialValue" placeholder="需替换金额" />
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="addVisible = false">取消</el-button>
          <confirm-button type="submit" :loading="addLoading" @click="submitAdd" />
        </div>
      </template>
    </el-dialog>

    <!--编辑界面-->
    <el-dialog
      v-model="editVisible"
      width="60%"
      title="编辑界面"
      :visible.sync="editVisible"
      :close-on-click-modal="true"
    >
      <el-row :gutter="20">
        <el-col :span="8" style="margin-bottom: 20px">
          <span>客户姓名:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <el-input v-model="editForm.userName" placeholder="客户姓名" />
        </el-col>
        <el-col :span="8" style="margin-bottom: 20px">
          <span>客户号:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <el-input v-model="editForm.userCode" placeholder="客户号" />
        </el-col>
        <el-col :span="8" style="margin-bottom: 20px">
          <span>选择起始时间:</span>
        </el-col>
        <el-col :span="10" style="margin-bottom: 20px">
          <el-date-picker
            v-model="editForm.beginTime"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8" style="margin-bottom: 20px">
          <span>到期天数设置:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <el-input-number v-model="editForm.countDay" controls-position="right" :min="1" />
        </el-col>
      </el-row>
      <el-divider />
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12" style="text-align: center">
          <span>合同金额(万元)</span>
        </el-col>
        <el-col :span="12" style="text-align: center">
          <span>需替换金额(万元)</span>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12" style="text-align: center">
          <el-input v-model="editForm.sumValue" placeholder="合同金额" />
        </el-col>
        <el-col :span="12" style="text-align: center">
          <el-input v-model="editForm.partialValue" placeholder="需替换金额" />
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="editVisible = false">取消</el-button>
          <confirm-button type="submit" :loading="editLoading" @click="submitEdit" />
        </div>
      </template>
    </el-dialog>
  </container>
</template>

<script>
import { formatTime } from '@/utils'
import ConfirmButton from '@/components/ConfirmButton'
import Pagination from '@/components/Pagination'
import Container from '@/components/Container/index'
import { getLoanMethod, addLoanMethod, editLoanMethod, getLoanMethodPage, verifyLoanMethod, delLoanMethod } from '@/api/loan/loanmethod'
export default {
  name: 'MortgageReplacement',
  components: {
    ConfirmButton,
    Container,
    Pagination
  },
  data() {
    return {
      verifyLoading: false,
      filter: {
        userCode: '',
        userName: ''
      },
      options: [{
        value: 0,
        label: '有效期内'
      }, {
        value: 1,
        label: '完成目标'
      }, {
        value: 2,
        label: '审核通过'
      }, {
        value: 3,
        label: '超期未完成'
      }, {
        value: 4,
        label: '超期审核通过'
      }],
      pager: {},
      listLoading: false,
      loanMethodList: [{
        id: 1,
        userName: '测试企业',
        userCode: '828000000',
        beginTime: '2020-08-01 11:45:15',
        countDay: 365,
        overTime: '2021-08-01 11:45:15',
        sumValue: 1000,
        overSign: 0,
        partialValue: 500,
        _loading: false
      }],

      addVisible: false,
      addForm: {
        userName: '',
        userCode: '',
        beginTime: '',
        countDay: 0,
        sumValue: '',
        partialValue: ''
      },
      addLoading: false,

      editVisible: false,
      editForm: {
        id: 0,
        userName: '',
        userCode: '',
        beginTime: '',
        countDay: 0,
        sumValue: '',
        partialValue: ''
      },
      editLoading: false
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
    this.onGetList()
  },
  methods: {
    // 审核贷款方式变更
    verifyLoanMethod: async function(index, row) {
      this.verifyLoading = true
      const res = await verifyLoanMethod({ id: row.id })
      this.verifyLoading = false

      if (res.success) {
        this.$message({
          message: '审核成功',
          type: 'success'
        })
        await this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 删除贷款方式变更
    delLoanMethod: async function(index, row) {
      const res = await delLoanMethod({ id: row.id })

      if (res.success) {
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        await this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 编辑按钮点击
    editButtonClick: async function(index, row) {
      const res = await getLoanMethod({ id: row.id })

      if (res.success) {
        this.editForm = res.data
        this.editVisible = true
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 提交编辑
    submitEdit: async function() {
      const data = _.cloneDeep(this.editForm)

      this.editLoading = true
      const res = await editLoanMethod(data)
      this.editLoading = false

      if (res.success) {
        this.$message({
          message: '编辑成功',
          type: 'success'
        })
        this.editVisible = false
        this.editForm = this.$options.data().editForm
        await this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 提交添加
    submitAdd: async function() {
      const data = _.cloneDeep(this.addForm)
      this.addLoading = true

      const res = await addLoanMethod(data)
      this.addLoading = false

      if (res.success) {
        this.$message({
          message: '添加成功',
          type: 'success'
        })
        this.addVisible = false
        this.addForm = this.$options.data().addForm
        await this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 获取分页
    onGetList: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize,
        filter: this.filter
      }
      this.listLoading = true
      const res = await getLoanMethodPage(para)
      this.listLoading = false

      if (!res.success) {
        if (res.msg) {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
        return
      }

      this.pager.total = res.data.total
      const data = _.cloneDeep(res.data.list)

      data.forEach(l => {
        l._loading = false
      })
      this.loanMethodList = data
    },
    formatCreatedTime: function(row, column, time) {
      return formatTime(time, 'yyyy-MM-dd')
    },
    statusCalculate: function(type) {
      if (type === 0) {
        return '有效期内'
      } else if (type === 1) {
        return '完成目标'
      } else if (type === 2) {
        return '审核通过'
      } else if (type === 3) {
        return '超期完成'
      } else {
        return '超期审核完成'
      }
    }
  }
}
</script>

<style scoped>

</style>
