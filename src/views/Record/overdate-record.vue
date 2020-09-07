<template>
  <container>
    <!--列表-->
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      row-key="id"
      :data="recordList"
      :default-expand-all="false"
      highlight-current-row
      border
      style="width: 100%;"
      @select-all="onSelectAll"
      @select="onSelect"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" width="50" label="ID" />
      <el-table-column prop="recordId" label="档案编号" width="150px" />
      <el-table-column prop="status" label="档案状态" width="120px">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status === 0 ? 'danger' : ( scope.row.status === 1 ? 'success' : 'primary' )"
            disable-transitions
          >{{ statusConculate(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="recordUserName" label="档案用户姓名" width="120px" />
      <el-table-column prop="recordUserInCode" label="客户内码" width="250px" />
      <el-table-column prop="recordUserCode" label="客户码" width="200px" />
      <el-table-column prop="departmentCode" label="档案归属支行编号" width="150px" />
      <el-table-column prop="departmentName" label="档案归属支行" width="130px" />
      <el-table-column prop="userCode" label="档案归属客户经理编号" width="170px" />
      <el-table-column prop="userName" label="档案归属客户经理" width="150px" />
      <el-table-column prop="createdTime" label="创建时间" :formatter="formatCreatedTime" width="150px" />
      <el-table-column label="操作" width="130px" fixed="right">
        <template v-slot="{ $index, row }">
          <el-button @click="showDetail($index, row)">查看详情</el-button>
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
        :checked-count="sels.length"
        @get-page="onGetList"
      />

      <!-- 档案主动更换-->
      <el-dialog v-model="visibleChangeData" :visible.sync="visibleChangeData" title="更换过期文件" width="60%">
        <el-row>
          <el-col :span="24">
            <el-collapse>
              <el-collapse-item v-for="item in changeData" :key="item.uid" :name="item.uid">
                <template slot="title">
                  <span class="collapse-title">{{ item.name }} {{ item.remarks ? '-' + item.remarks : '' }}</span>
                </template>
                <el-row v-for="child in item.children" :key="child.id" style="margin-bottom: 20px;">
                  <el-col :span="6">
                    <span>{{ child.name }}</span>
                    <!--<el-checkbox v-model="child.checked" :label="child.name" border />-->
                  </el-col>
                  <el-col :span="5">
                    <el-switch
                      v-model="child.checked"
                      active-text="删除"
                      inactive-text="更新日期"
                    />
                  </el-col>
                  <el-col :span="6">
                    <el-date-picker
                      v-if="!child.checked"
                      v-model="child.creditDueDate"
                      type="date"
                      size="mini"
                      placeholder="选择日期"
                    />
                  </el-col>
                  <el-col :span="5" :offset="2">
                    <span>份数:{{ child.num }}</span>
                    <!-- <el-input-number v-if="child.checked" v-model="child.num" :min="1" label="份数" />-->
                  </el-col>
                </el-row>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer">
          <el-button @click="visibleChangeData = false">取 消</el-button>
          <confirm-button type="submit" :loading="changeDataSubmit" @click="changeDataSub" />
        </div>
      </el-dialog>
    </template>
  </container>
</template>

<script>
import Container from '@/components/Container/index'
import { formatTime } from '@/utils'
import Pagination from '@/components/Pagination'
import ConfirmButton from '@/components/ConfirmButton'
import { getExpiredRecordList,
  getChangeDetail,
  applyChangeFile } from '@/api/record/record'

export default {
  name: 'OverdateRecord',
  components: {
    Container,
    Pagination,
    ConfirmButton
  },
  data() {
    return {
      recordList: [],
      sels: [],
      pager: {},
      changeData: [],
      listLoading: false,
      visibleChangeData: false,
      changeDataSubmit: false
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
    this.onGetList()
  },
  methods: {
    changeDataSub: async function() {
      this.changeDataSubmit = true
      const param = {
        type: 0,
        fileList: _.cloneDeep(this.changeData)
      }
      const res = await applyChangeFile(param)
      this.changeDataSubmit = false
      if (res.success) {
        this.$message({
          message: '申请成功',
          type: 'success'
        })
        this.visibleChangeData = false
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 档案状态
    statusConculate: function(num) {
      if (num === 0) {
        return '待移交'
      } else if (num === 1) {
        return '在库'
      } else if (num === 2) {
        return '借阅中'
      }
    },
    showDetail: async function(index, row) {
      const id = {
        id: row.id
      }

      const res = await getChangeDetail(id)

      if (res.success) {
        this.changeData = res.data
        this.visibleChangeData = true
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    onGetList: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize
      }
      this.listLoading = true

      const res = await getExpiredRecordList(para)
      this.listLoading = false

      if (res.success) {
        this.pager.total = res.data.total
        const data = _.cloneDeep(res.data.list)

        data.forEach(l => {
          l._loading = false
        })

        this.recordList = data
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    formatCreatedTime: function(row, column, time) {
      return formatTime(time, 'yyyy-MM-dd hh:mm')
    },
    onSelectAll: function(selection) {
      const selections = selection
      const rows = this.recordList
      const checked = selections.length === rows.length
      rows.forEach(row => {
        this.$refs.multipleTable.toggleRowSelection(row, checked)
      })

      this.sels = this.$refs.multipleTable.selection
    },
    onSelect: function(selection, row) {
      const checked = selection.some(s => s.id === row.id)
      this.$refs.multipleTable.toggleRowSelection(row, checked)

      this.sels = this.$refs.multipleTable.selection
    }
  }
}
</script>

<style scoped>

</style>
