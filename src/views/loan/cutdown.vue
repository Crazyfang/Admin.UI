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
              <el-select v-model="filter.overSign" placeholder="请选择" clearable>
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
              <el-button type="primary" @click="onGetList">查询</el-button>
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
      :data="loanUserList"
      :default-expand-all="false"
      highlight-current-row
      border
      style="width: 100%;"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <div v-for="(item, index) in props.row.budget" :key="index">
              <el-form-item>
                <span>开始时间: {{ formatTime(item.beginTime) }} - 结束时间: {{ formatTime(item.endTime) }}</span>
              </el-form-item>
              <el-form-item v-for="value in item.item" :key="value.id">
                <span>
                  方式: {{ value.name }} - 目标值: {{ value.wantedValue }} - 当前值: {{ value.presentValue }}
                </span>
                <span>
                  <el-tag :type="computeMax(value.wantedValue, value.presentValue) === '未完成'?'danger':'success'">
                    {{ computeMax(value.wantedValue, value.presentValue) }}
                  </el-tag>
                </span>
              </el-form-item>
            </div>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="id" width="50" label="ID" />
      <el-table-column prop="userName" label="客户名称" width="200px" />
      <el-table-column prop="userCode" label="客户号" width="200px" />
      <el-table-column prop="overSign" label="状态" width="180px">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.overSign === 1 ? 'danger' : ( scope.row.overSign === 2 ? 'success' : 'primary' )"
            disable-transitions
          >{{ statusCalculate(scope.row.overSign) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="verifyUserName" label="审核用户姓名" width="200px" />
      <el-table-column prop="verifyTime" label="审核时间" width="200px" :formatter="formatCreatedTime" />
      <el-table-column label="操作" width="240px" fixed="right">
        <template v-slot="{ $index, row }">
          <el-button @click="editPageClick(row.id)">编辑</el-button>
          <confirm-button type="delete" :loading="row._loading" @click="delLoanUser($index, row)" />
          <confirm-button type="other" button-text-string="审核" content="确定审核通过吗？" @click="verifyLoanUser($index, row)" />
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
          <span>到期月份增加:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <el-button @click="addMonth(addForm.budget)">添加</el-button>
        </el-col>
      </el-row>
      <el-divider />
      <el-row v-for="(item, index) in addForm.budget" :key="index" :gutter="20" style="margin-bottom: 20px">
        <el-col :span="4">
          <span>选择考核时长(月)</span>
        </el-col>
        <el-col :span="8" style="margin-bottom: 10px">
          <el-input-number v-model="item.countMonth" controls-position="right" :min="1" />
        </el-col>
        <el-col :span="12" style="margin-bottom: 10px">
          <el-button @click="delMonth(addForm.budget, index)">删除</el-button>
        </el-col>
        <div v-for="(type, indexs) in item.item" :key="indexs" :gutter="20">
          <el-col :span="12" style="margin-bottom: 10px">
            <el-checkbox v-model="type.checked" :label="type.name" border />
          </el-col>
          <el-col :span="12" style="margin-bottom: 10px">
            <el-input v-model="type.wantedValue" placeholder="请输入内容" class="input-with-select">
              <template slot="append">万</template>
            </el-input>
          </el-col>
        </div>
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
      title="添加界面"
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
          <span>到期月份增加:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <el-button @click="addMonth(editForm.budget)">添加</el-button>
        </el-col>
      </el-row>
      <el-divider />
      <el-row v-for="(item, index) in editForm.budget" :key="index" :gutter="20" style="margin-bottom: 20px">
        <el-col :span="4">
          <span>选择考核时长(月)</span>
        </el-col>
        <el-col :span="8" style="margin-bottom: 10px">
          <el-input-number v-model="item.countMonth" controls-position="right" :min="1" />
        </el-col>
        <el-col :span="12" style="margin-bottom: 10px">
          <el-button @click="delMonth(addForm.budget, index)">删除</el-button>
        </el-col>
        <div v-for="(type, indexs) in item.item" :key="indexs" :gutter="20">
          <el-col :span="12" style="margin-bottom: 10px">
            <el-checkbox v-model="type.checked" :label="type.name" border />
          </el-col>
          <el-col :span="12" style="margin-bottom: 10px">
            <el-input v-model="type.wantedValue" placeholder="请输入内容" class="input-with-select">
              <template slot="append">万</template>
            </el-input>
          </el-col>
        </div>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="editVisible = false">取消</el-button>
          <confirm-button type="submit" :loading="editLoading" @click="submitEdit" />
        </div>
      </template>
    </el-dialog>

    <!--详情界面-->
    <el-dialog
      v-model="detailVisible"
      width="60%"
      title="详情界面"
      :visible.sync="detailVisible"
      :close-on-click-modal="true"
    >
      <el-row :gutter="20">
        <el-col :span="8" style="margin-bottom: 20px">
          <span>客户姓名:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <span>{{ detailForm.userName }}</span>
        </el-col>
        <el-col :span="8" style="margin-bottom: 20px">
          <span>客户号:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <span>{{ detailForm.userCode }}</span>
        </el-col>
        <el-col :span="8" style="margin-bottom: 20px">
          <span>起始时间:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <span>{{ detailForm.beginTime }}</span>
        </el-col>
        <el-col :span="8" style="margin-bottom: 20px">
          <span>结束时间:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <span>{{ detailForm.endTime }}</span>
        </el-col>
        <el-col :span="8" style="margin-bottom: 20px">
          <span>起始日期计算方式:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <span>手工输入</span>
        </el-col>
        <el-col :span="8" style="margin-bottom: 20px">
          <span>当前状态:</span>
        </el-col>
        <el-col :span="16" style="margin-bottom: 20px">
          <span>{{ detailForm.type === 0 ? '有效期内' : detailForm.type === 1 ? '红色预警' : '已完成' }}</span>
        </el-col>
      </el-row>
      <el-divider />
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="8">
          <span>类别</span>
        </el-col>
        <el-col :span="8">
          <span>当前值</span>
        </el-col>
        <el-col :span="8">
          <span>目标值</span>
        </el-col>
      </el-row>
      <el-row v-for="(item, index) in detailForm.budget" :key="index" :gutter="20" style="margin-bottom: 20px">
        <el-col :span="8">
          <span>{{ item.name }}</span>
        </el-col>
        <el-col :span="8">
          <span>{{ item.originalValue }}万</span>
        </el-col>
        <el-col :span="8">
          <span>{{ item.wantedValue }}万</span>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="detailVisible = false">取消</el-button>
          <confirm-button type="other" button-text-string="审核通过" />
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
import { addLoanUser, editLoanUser, getLoanUserInfo, delLoanUserInfo, getLoanUserList, verifyLoanUserList } from '@/api/loan/loan'
export default {
  name: 'CutDown',
  components: { Container, Pagination, ConfirmButton },
  data() {
    return {
      filter: {
        userName: '',
        userCode: '',
        overSign: 0
      },
      options: [{
        value: 0,
        label: '有效期内'
      }, {
        value: 1,
        label: '完成'
      }, {
        value: 2,
        label: '审核通过'
      }, {
        value: 3,
        label: '超期未完成'
      }],
      pager: {},
      listLoading: false,
      loanUserList: [{
        id: 1,
        userName: '测试企业',
        userCode: '828000000',
        overSign: 0,
        verifyUserCode: '',
        verifyUserName: '',
        budget: [{
          id: 1,
          beginTime: '',
          endTime: '',
          item: [{
            id: 1,
            name: '',
            wantedValue: 0,
            presentValue: 0
          }],
          _loading: false
        }]
      }],

      addVisible: false,
      addForm: {
        userName: '',
        userCode: '',
        beginTime: '',
        // timeType: 0,
        budget: [{ countMonth: '', item: [{
          name: '担保类',
          checked: false,
          wantedValue: null
        }, {
          name: '信用类',
          checked: false,
          wantedValue: null
        }, {
          name: '抵押类',
          checked: false,
          wantedValue: null
        }] }]
      },
      addLoading: false,

      editVisible: false,
      editForm: {
        id: 0,
        userName: '',
        userCode: '',
        beginTime: '',
        // timeType: 0,
        budget: [{ countMonth: '', item: [{
          name: '担保类',
          checked: false,
          wantedValue: null
        }, {
          name: '信用类',
          checked: false,
          wantedValue: null
        }, {
          name: '抵押类',
          checked: false,
          wantedValue: null
        }] }]
      },
      editLoading: false,

      detailVisible: false,
      detailForm: {
        userName: '测试企业',
        userCode: '828000000',
        beginTime: '2020-08-01 11:45:15',
        endTime: '2021-08-01 11:45:15',
        countMonth: 12,
        // timeType: 0,
        type: 0,
        budget: [{
          name: '担保类',
          checked: true,
          originalValue: 200,
          wantedValue: 100
        }, {
          name: '信用类',
          checked: true,
          originalValue: 300,
          wantedValue: 200
        }]
      }
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
    this.onGetList()
  },
  methods: {
    computeMax: function(wantedValue, presentValue) {
      if (presentValue) {
        if (wantedValue > presentValue) {
          return '完成'
        } else {
          return '未完成'
        }
      } else {
        return '未完成'
      }
    },
    // 审核贷款压缩
    verifyLoanUser: async function($index, row) {
      const res = await verifyLoanUserList({ id: row.id })

      if (res.success) {
        this.$message({
          message: '审核通过',
          type: 'success'
        })
        this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 获取分页信息
    onGetList: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize,
        filter: this.filter
      }
      this.listLoading = true
      const res = await getLoanUserList(para)
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
      this.loanUserList = data
    },
    // 删除按钮触发事件
    delLoanUser: async function(index, row) {
      row._loading = true
      const para = { id: row.id }

      const res = await delLoanUserInfo(para)
      row._loading = false

      if (!res.success) {
        this.$message({
          message: res.msg,
          type: 'error'
        })
        return
      }
      this.$message({
        message: this.$t('admin.deleteOk'),
        type: 'success'
      })
      await this.onGetList()
    },
    // 编辑按钮点击事件
    editPageClick: async function(id) {
      const res = await getLoanUserInfo({ id: id })
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
    // 编辑提交
    submitEdit: async function() {
      const data = _.cloneDeep(this.editForm)

      this.editLoading = true
      const res = await editLoanUser(data)
      this.editLoading = false
      if (res.success) {
        this.$message({
          message: '编辑成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
      this.editVisible = false
    },
    // 添加提交
    submitAdd: async function() {
      // const data = {
      //   addForm: _.cloneDeep(this.addForm)
      // }
      const data = _.cloneDeep(this.addForm)

      this.addLoading = true
      const res = await addLoanUser(data)

      this.addLoading = false
      if (res.success) {
        this.$message({
          message: '添加成功!',
          type: 'success'
        })
        this.addVisible = false
        this.addForm = this.$options.data().addForm
        this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 添加考核月数
    addMonth: function(item) {
      item.push({ countMonth: '', item: [{
        name: '担保类',
        checked: false,
        wantedValue: null
      }, {
        name: '信用类',
        checked: false,
        wantedValue: null
      }, {
        name: '抵押类',
        checked: false,
        wantedValue: null
      }] })
    },
    // 删除考核月数
    delMonth: function(item, index) {
      item.splice(index, 1)
    },
    // 日期格式化
    formatCreatedTime: function(row, column, time) {
      return formatTime(time, 'yyyy-MM-dd')
    },
    formatTime: function(time) {
      return formatTime(time, 'yyyy-MM-dd')
    },
    // 状态转换
    statusCalculate: function(type) {
      if (type === 0) {
        return '有效期内'
      } else if (type === 1) {
        return '完成目标'
      } else if (type === 2) {
        return '审核通过'
      } else {
        return '超期未完成'
      }
    }
  }
}
</script>

<style scoped>

</style>
