<template>
  <div class="bg-purple-dark">
    <el-row :gutter="20" type="flex" justify="space-between">
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header">
            <span>档案总数</span>
          </div>
          <div>
            <span>50</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header">
            <span>借阅档案总数</span>
          </div>
          <div>
            <span>50</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header">
            <span>未归还档案总数</span>
          </div>
          <div>
            <span>50</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" type="flex" justify="space-between">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-table
          border
          stripe
          :data="tableData"
          style="width: 100%"
          height="250"
        >
          <el-table-column
            prop="date"
            label="日期"
            width="180"
          />
          <el-table-column
            prop="name"
            label="姓名"
            width="180"
          />
          <el-table-column
            prop="address"
            label="地址"
          />
        </el-table>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-table
          border
          stripe
          :data="tableData"
          style="width: 100%"
          height="250"
        >
          <el-table-column
            prop="date"
            label="日期"
            width="180"
          />
          <el-table-column
            prop="name"
            label="姓名"
            width="180"
          />
          <el-table-column
            prop="address"
            label="地址"
          />
        </el-table>
      </el-col>
    </el-row>
  </div>

</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    }
  }
}
</script>

<style scoped>
  .el-row {
    margin-bottom: 20px;
  }
  .bg-purple-dark {
    background: rgba(204, 205, 206, 0.59);
    padding: 20px;
  }
  .box-card {
    text-align: center;
  }
</style>
