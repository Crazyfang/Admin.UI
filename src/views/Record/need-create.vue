<template>
  <Container>
    <!--列表-->
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      row-key="contractNo"
      :data="recordList"
      :default-expand-all="false"
      highlight-current-row
      border
      style="width: 100%;"
    >
      <el-table-column prop="contractNo" label="合同号" />
      <el-table-column prop="custINNO" label="客户内码" />
      <el-table-column prop="custNO" label="客户号" />
      <el-table-column prop="custname" label="客户姓名" />
      <el-table-column label="操作" width="130px" fixed="right">
        <template v-slot="{ $index, row }">
          <el-button @click="onAdd($index, row)">添加</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--新增-->
    <el-dialog
      v-model="addFormVisible"
      title="新增"
      :visible.sync="addFormVisible"
      :close-on-click-modal="false"
      @close="onCloseAddForm"
    >
      <el-form ref="addForm" :model="addForm.record" label-width="150px" label-position="left" :rules="addFormRules">
        <el-form-item prop="recordUserName" label="档案用户姓名">
          <el-input v-model="addForm.record.recordUserName" auto-complete="off" />
        </el-form-item>
        <el-form-item label="客户内码" prop="recordUserInCode">
          <el-input v-model="addForm.record.recordUserInCode" auto-complete="off" />
        </el-form-item>

        <el-form-item label="客户码" prop="recordUserCode">
          <el-input v-model="addForm.record.recordUserCode" auto-complete="off" />
        </el-form-item>

        <el-form-item label="档案归属支行" prop="managerDepartmentId">
          <treeselect
            v-model="addForm.record.managerDepartmentId"
            :multiple="false"
            :options="departments"
            :max-height="200"
            :flat="false"
            :default-expand-level="1"
            :normalizer="normalizer"
            placeholder="选择部门"
            @select="(node, instanceId) => changeDepartment(node)"
          />
        </el-form-item>

        <el-form-item label="档案归属客户经理" prop="managerUserId">
          <el-select v-model="addForm.record.managerUserId" filterable placeholder="请选择">
            <el-option
              v-for="item in userList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span style="float: left">{{ item.peopleId }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="档案类型" prop="recordType">
          <el-radio-group v-model="addForm.record.recordType" @change="addRadioChange">
            <el-radio v-for="item in recordTypeList" :key="item.id" :label="item.id">{{ item.recordTypeName }}</el-radio>
            <!--            <el-radio label="1">企业</el-radio>-->
            <!--            <el-radio label="2">个人</el-radio>-->
          </el-radio-group>
        </el-form-item>

        <el-form-item label="授信到期日" prop="creditDueDate">
          <el-date-picker
            v-model="addForm.record.creditDueDate"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>

        <el-divider content-position="left">档案内容</el-divider>
        <el-row>
          <el-col :span="24">
            <el-collapse>
              <el-collapse-item v-for="(item, arr) in addForm.fileList" :key="item.uid" :name="item.uid">
                <template slot="title">
                  <span class="collapse-title">{{ item.name }} {{ item.remarks ? '-' + item.remarks : '' }} <el-button style="float: right" size="large" type="text" @click.stop="addRecordFileType(item, addForm.fileList, arr)">添加</el-button></span>
                </template>
                <el-row style="margin-bottom: 20px">
                  <el-col :span="4">
                    <span>备注项:</span>
                  </el-col>
                  <el-col :span="4">
                    <el-input v-model="item.remarks" auto-complete="off" />
                  </el-col>
                  <el-col :span="4" style="margin-left: 30px">
                    <el-button type="primary" icon="el-icon-delete" @click.stop="delRecordFileType(addForm.fileList, arr)">删除当前文件类型</el-button>
                  </el-col>
                </el-row>
                <el-row v-if="unionDateSet(item.name)" style="margin-bottom: 20px;">
                  <el-col :span="6">
                    <span>统一过期时间设定:</span>
                  </el-col>
                  <el-col :span="6">
                    <el-date-picker
                      v-model="item.date"
                      type="date"
                      size="mini"
                      placeholder="选择日期"
                      @change="unionSetDate($event, item)"
                    />
                  </el-col>
                </el-row>
                <el-row v-for="child in item.children.filter(i => i.otherSign === 0)" :key="child.uid" style="margin-bottom: 20px;">
                  <el-col :span="8">
                    <el-checkbox v-model="child.checked" :label="child.name" border />
                  </el-col>
                  <el-col :span="7">
                    <el-date-picker
                      v-if="child.checked"
                      v-model="child.creditDueDate"
                      type="date"
                      placeholder="选择日期"
                    />
                  </el-col>
                  <el-col :span="5" :offset="2">
                    <el-input-number v-if="child.checked" v-model="child.num" :min="1" label="份数" />
                  </el-col>
                </el-row>
                <el-row v-for="other in item.children.filter(i => i.otherSign === 1)" :key="other.uid" style="margin-bottom: 20px">
                  <el-col :span="8">
                    <el-input v-model="other.name" placeholder="请输入其他文件名称" />
                  </el-col>
                  <el-col :span="6" :offset="1">
                    <el-date-picker
                      v-if="other.name"
                      v-model="other.creditDueDate"
                      type="date"
                      placeholder="选择日期"
                    />
                  </el-col>
                  <el-col :span="4" :offset="2">
                    <el-input-number v-if="other.name" v-model="other.num" :min="1" label="份数" />
                  </el-col>
                  <el-col :span="2" :offset="1">
                    <el-button type="primary" icon="el-icon-delete" @click="deleteOther(item, other.uid)">删除</el-button>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <el-button type="primary" icon="el-icon-plus" @click="addOther(item)">添加其他</el-button>
                  </el-col>
                </el-row>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="addFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="addFormValidate" :loading="addLoading" @click="onAddSubmit" />
        </div>
      </template>
    </el-dialog>

    <!--分页-->
    <template #footer>
      <pagination
        ref="pager"
        :page.sync="pager.currentPage"
        :size.sync="pager.pageSize"
        :total="pager.total"
        @get-page="getPage"
      />
    </template>
  </Container>
</template>

<script>
import Container from '@/components/Container/index'
import Pagination from '@/components/Pagination'
import { stockAdd, getNeedCreateRecordList } from '@/api/record/record'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { addRecordPageList } from '@/api/record/recordfiletype'
import { getUserSelect } from '@/api/admin/user'
import { getRecordTypeList } from '@/api/record/recordtype'
import { getDepartmentList } from '@/api/admin/department'
import { listToTree } from '@/utils'
import ConfirmButton from '@/components/ConfirmButton'
export default {
  name: 'NeedCreate',
  components: {
    Container,
    Pagination,
    Treeselect,
    ConfirmButton
  },
  data() {
    return {
      pager: '',
      recordList: [],
      listLoading: false,
      addFormVisible: false, // 新增界面是否显示
      addLoading: false,
      addFormRules: {
        recordUserName: [{ required: true, message: '请输入档案用户姓名', trigger: 'blur' }],
        recordUserInCode: [{ required: true, message: '请输入客户内码', trigger: 'blur' }],
        recordUserCode: [{ required: true, message: '请输入客户码', trigger: 'blur' }],
        managerDepartmentId: [{ required: true, message: '请输入档案归属部门', trigger: 'blur' }],
        managerUserId: [{ required: true, message: '请输入档案归属客户经理', trigger: 'blur' }],
        recordType: [{ required: true, message: '请选择档案类型', trigger: 'change' }],
        creditDueDate: [{ required: true, message: '请输入授信到期日', trigger: 'change' }]
      },
      // 新增界面数据
      addForm: {
        record: {
          recordUserName: '',
          recordUserInCode: '',
          recordUserCode: '',
          managerDepartmentId: null,
          managerUserId: '',
          recordType: 0,
          creditDueDate: ''
        },
        fileList: []
      },
      recordTypeList: [{ id: 0, recordTypeName: '' }],
      normalizer(node) {
        return {
          id: node.id,
          label: node.departmentName,
          children: node.children
        }
      },
      userList: [],
      departments: []
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
    this.getPage()
    this.getDepartmentListPage()
    this.getRecordTypeList()
  },
  methods: {
    // 获取部门列表填充部门下拉树
    async getDepartmentListPage() {
      const res = await getDepartmentList()
      if (res && res.success) {
        this.departments = listToTree(res.data)
      }
    },
    getRecordTypeList: async function() {
      const res = await getRecordTypeList()
      this.recordTypeList = res.data
    },
    // 添加档案界面提交
    async onAddSubmit() {
      this.addLoading = true
      const para = _.cloneDeep(this.addForm)

      const res = await stockAdd(para)
      this.addLoading = false

      if (res.success) {
        this.$message({
          message: this.$t('admin.addOk'),
          type: 'success'
        })
        this.$refs['addForm'].resetFields()
        this.addForm.fileList = []
        this.addFormVisible = false
        await this.getPage()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 新增字段验证
    addFormValidate: function() {
      let isValid = false
      this.$refs.addForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    changeDepartment: async function(node) {
      const id = {
        id: node.id
      }
      const res = await getUserSelect(id)
      this.userList = res.data
    },
    // 关闭添加档案界面
    onCloseAddForm() {
      this.$refs.addForm.resetFields()
    },
    // 填充Select下拉框用户列表
    getUserSelect: async function(node) {
      const id = node
      const res = await getUserSelect({ id: id })
      if (res && res.success) {
        console.log(this.userList)
        this.userList = res.data
      }
    },
    unionSetDate: function(event, item) {
      item.children.forEach(i => {
        i.creditDueDate = event
      })
    },
    // 添加文件类型
    addRecordFileType: function(item, parent, index) {
      const uuid = require('uuid')
      const newItem = _.cloneDeep(item)
      newItem.uid = uuid.v1()
      newItem.checkedRecordFileTypeId = 0
      newItem.children.forEach(item => {
        item.checedRecordFileId = 0
      })
      console.log(newItem)
      parent.splice(index + 1, 0, newItem)
    },
    // 删除文件类型
    delRecordFileType: function(parent, index) {
      parent.splice(index, 1)
    },
    addRadioChange: async function(val) {
      const res = await addRecordPageList({ id: val })
      this.addForm.fileList = res.data
    },
    // 添加其他文件
    addOther: function(parent) {
      const uuid = require('uuid')
      parent.children.push({
        uid: uuid.v1(),
        checked: true,
        checkedRecordFileId: 0,
        recordFileId: 0,
        name: '',
        creditDueDate: '',
        num: 1,
        otherSign: 1
      })
    },
    unionDateSet: function(name) {
      return name === '权证类' || name === '贷款业务要件类' || name === '承兑业务要件类' || name === '贴现业务要件类' || name === '保函业务要件类'
    },
    // 删除其他文件
    deleteOther(parent, id) {
      parent.children = parent.children.filter(o => o.uid !== id)
    },
    onAdd: async function(index, row) {
      if (this.departments.length === 0) {
        await this.getDepartmentListPage()
      }
      // if (this.userList.length === 0) {
      //   await this.getUserSelect()
      // }
      const recordUserInCode = row.custINNO
      const recordUserCode = row.custNO
      const recordUserName = row.custname
      this.addForm.record.recordUserInCode = recordUserInCode
      this.addForm.record.recordUserCode = recordUserCode
      this.addForm.record.recordUserName = recordUserName
      this.addForm.fileList = []
      this.addFormVisible = true
    },
    // 获取分页
    getPage: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize
      }

      this.listLoading = true
      const res = await getNeedCreateRecordList(para)
      this.listLoading = false

      if (res.success) {
        this.recordList = res.data.list
        this.pager.total = res.data.total
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    }
  }
}
</script>

<style scoped>
.collapse-title {
  flex: 1 0 90%;
  order: 1;
}

.el-collapse-item__header {
  flex: 1 0 auto;
  order: -1;
}
</style>
