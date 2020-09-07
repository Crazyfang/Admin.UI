<template>
  <container>
    <!--    <template #header>-->
    <!--      <el-button @click="getDic">获取</el-button>-->
    <!--    </template>-->
    <!--列表-->
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      row-key="id"
      :data="notifyList"
      :default-expand-all="false"
      highlight-current-row
      border
      style="width: 100%;"
    >
      <el-table-column prop="id" width="50" label="ID" />
      <el-table-column prop="sign" label="阅读标志" width="120px">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.sign === false ? 'danger' : 'success'"
            disable-transitions
          >{{ scope.row.sign === false ? '未阅读' : '已阅读' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="readTime" label="阅读时间" :formatter="formatCreatedTime" width="150px" />
      <el-table-column prop="message" label="消息" width="auto" />
      <el-table-column label="操作" width="120px" fixed="right">
        <template v-slot="{ $index, row }">
          <el-button icon="el-icon-reading" type="primary" :disabled="row.sign" @click.native="readNotify(row)">已阅</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <pagination
        ref="pager"
        :page.sync="pager.currentPage"
        :size.sync="pager.pageSize"
        :total="pager.total"
        @get-page="onGetList"
      />

    </template>
  </container>
</template>

<script>
import { getNotifyPage, readNotify, getDictionary } from '@/api/record/notify'
import Container from '@/components/Container/index'
import Pagination from '@/components/Pagination'
import { formatTime } from '@/utils'
export default {
  name: 'Notify',
  components: {
    Container,
    Pagination
  },
  data() {
    return {
      pager: {},
      listLoading: false,
      notifyList: []
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
    this.onGetList()
  },
  methods: {
    getDic: function() {
      const res = getDictionary()
      console.log(res)
      this.$message({
        message: res,
        type: 'success'
      })
    },
    readNotify: async function(row) {
      const res = await readNotify({ id: row.id })
      console.log(res)
      if (res.success) {
        await this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 获取通知列表
    onGetList: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize
      }
      this.listLoading = true
      const res = await getNotifyPage(para)
      this.listLoading = false

      if (res.success) {
        this.notifyList = res.data.list
        this.pager.total = res.data.total
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    formatCreatedTime: function(row, column, time) {
      if (time) {
        return formatTime(time, 'yyyy-MM-dd hh:mm')
      } else {
        return '无阅读时间'
      }
    }
  }
}
</script>

<style scoped>

</style>
