<template>
  <section style="padding:10px;">
    <!--查询-->
    <el-form :inline="true" :model="filters" @submit.native.prevent>
      <el-form-item>
        <el-input v-model="filters.label" placeholder="部门名称或编号" @keyup.enter.native="onGetList">
          <template #prefix>
            <i class="el-input__icon el-icon-search" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onGetList">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表-->
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      row-key="id"
      :data="departmentTree"
      :default-expand-all="false"
      :expand-row-keys="expandRowKeys"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      highlight-current-row
      border
      style="width: 100%;"
      @select-all="onSelectAll"
      @select="onSelect"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column type="index" width="50" label="#" />
      <el-table-column prop="departmentName" label="部门名称" width />
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column prop="departmentCode" label="部门编号" width />
      <el-table-column label="操作" width="180">
        <template v-slot="{ $index, row }">
          <el-button @click="onEdit($index, row)">编辑</el-button>
          <confirm-button type="delete" :loading="row._loading" @click="onDelete($index, row)" />
        </template>
      </el-table-column>
    </el-table>
    <!--      新增-->
    <el-dialog
      v-model="addFormVisible"
      title="新增"
      :visible.sync="addFormVisible"
      :close-on-click-modal="false"
      @close="onCloseAddForm"
    >
      <el-form ref="addForm" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item prop="parentId" label="上级部门">
          <treeselect
            v-model="addForm.parentId"
            :multiple="false"
            :options="departmentTree"
            :max-height="200"
            :flat="true"
            :default-expand-level="1"
            :normalizer="normalizer"
            placeholder="选择上级部门"
          />
        </el-form-item>
        <el-form-item label="部门编号" prop="departmentCode">
          <el-input v-model="addForm.departmentCode" auto-complete="off" />
        </el-form-item>
        <el-form-item label="部门名称" prop="departmentName">
          <el-input v-model="addForm.departmentName" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="addFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="addFormValidate" :loading="addLoading" @click="onAddSubmit" />
        </div>
      </template>
    </el-dialog>
    <!--编辑窗口-->
    <el-dialog
      v-model="editFormVisible"
      title="编辑"
      :visible.sync="editFormVisible"
      :close-on-click-modal="false"
      @close="onCloseEditForm"
    >
      <el-form ref="editForm" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item prop="parentId" label="上级部门">
          <treeselect
            v-model="editForm.parentId"
            :multiple="false"
            :options="departmentTree"
            :max-height="200"
            :flat="true"
            :default-expand-level="1"
            :normalizer="normalizer"
            placeholder="选择上级部门"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="departmentName">
          <el-input v-model="editForm.departmentName" auto-complete="off" />
        </el-form-item>
        <el-form-item label="部门代码" prop="departmentCode">
          <el-input v-model="editForm.departmentCode" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="editFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="editFormValidate" :loading="editLoading" @click="onEditSubmit" />
        </div>
      </template>
    </el-dialog>

  </section>
</template>

<script>
import { formatTime, treeToList, listToTree } from '@/utils'
import { getDepartment, removeDepartment, getDepartmentList, editDepartment, addDepartment } from '@/api/admin/department'
import ConfirmButton from '@/components/ConfirmButton'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'Department',
  components: {
    ConfirmButton,
    Treeselect
  },
  data() {
    return {
      filters: {
        label: ''
      },
      departmentTree: [],
      expandRowKeys: [],
      listLoading: false,
      sels: [], // 列表选中列

      modules: [],
      editFormVisible: false, // 编辑界面是否显示
      editLoading: false,
      editFormRules: {
        departmentCode: [{ required: true, message: '请输入部门编号', trigger: 'blur' }],
        departmentName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
      },
      // 编辑界面数据
      editForm: {
        id: 0,
        parentId: '',
        departmentCode: '',
        departmentName: ''
      },
      normalizer(node) {
        return {
          id: node.id,
          label: node.departmentName,
          children: node.children
        }
      },
      addFormVisible: false, // 新增界面是否显示
      addLoading: false,
      addFormRules: {
        departmentCode: [{ required: true, message: '请输入部门编号', trigger: 'blur' }],
        departmentName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
      },
      // 新增界面数据
      addForm: {
        parentId: null,
        departmentCode: '',
        departmentName: ''
      }
    }
  },
  mounted() {
    this.onGetList()
  },
  methods: {
    formatCreatedTime: function(row, column, time) {
      return formatTime(time, 'yyyy-MM-dd hh:mm')
    },
    // 显示编辑界面
    async onEdit(index, row) {
      const loading = this.$loading()
      const res = await getDepartment({ id: row.id })
      loading.close()
      if (res && res.success) {
        const data = res.data
        console.log(res.data)
        this.editForm = data
        this.editFormVisible = true
      }
    },
    // 获取列表
    onGetList: async function() {
      const para = {
        key: this.filters.label
      }
      this.listLoading = true
      const res = await getDepartmentList(para)
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

      const list = _.cloneDeep(res.data)

      list.forEach(l => {
        l._loading = false
      })

      const tree = listToTree(list)
      this.sels = []
      this.departmentTree = tree
    },
    onCloseEditForm() {
      this.$refs.editForm.resetFields()
    },
    // 编辑
    editFormValidate: function() {
      let isValid = false
      this.$refs.editForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    async onEditSubmit() {
      this.editLoading = true
      const para = _.cloneDeep(this.editForm)
      if (para.id === para.parentId) {
        this.$message({
          message: '所属部门不能是自身！',
          type: 'error'
        })
        this.editLoading = false
        return
      }

      const res = await editDepartment(para)
      this.editLoading = false
      if (res.success) {
        this.$message({
          message: this.$t('admin.updateOk'),
          type: 'success'
        })
        this.$refs['editForm'].resetFields()
        this.editFormVisible = false
        await this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },

    // 显示新增界面
    onAdd() {
      this.addFormVisible = true
    },
    onCloseAddForm() {
      this.$refs.addForm.resetFields()
    },
    // 新增
    addFormValidate: function() {
      let isValid = false
      this.$refs.addForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    async onAddSubmit() {
      this.addLoading = true
      const para = _.cloneDeep(this.addForm)

      const res = await addDepartment(para)
      this.addLoading = false

      if (res.success) {
        this.$message({
          message: this.$t('admin.addOk'),
          type: 'success'
        })
        this.$refs['addForm'].resetFields()
        this.addFormVisible = false
        await this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 删除
    async onDelete(index, row) {
      row._loading = true
      const para = { id: row.id }
      const res = await removeDepartment(para)

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

    onSelectAll: function(selection) {
      const selections = treeToList(selection)
      const rows = treeToList(this.departmentTree)
      const checked = selections.length === rows.length
      rows.forEach(row => {
        this.$refs.multipleTable.toggleRowSelection(row, checked)
      })

      this.sels = this.$refs.multipleTable.selection
    },
    onSelect: function(selection, row) {
      const checked = selection.some(s => s.id === row.id)
      if (row.children && row.children.length > 0) {
        const rows = treeToList(row.children)
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row, checked)
        })
      }

      this.sels = this.$refs.multipleTable.selection
    }
  }
}
</script>
