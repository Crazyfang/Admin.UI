<template>
  <section style="padding:10px;">
    <el-row :gutter="20" type="flex" justify="space-around">
      <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8">
        <el-card class="box-card">
          <div slot="header">
            <span>档案类型编辑</span>
            <el-button-group style="float: right">
              <el-button type="primary" icon="el-icon-edit" @click="onAddRecordType">新增</el-button>
              <el-button type="primary" icon="el-icon-share" @click="onEditRecordType">编辑</el-button>
              <confirm-button type="delete" icon="el-icon-delete" @click="onDeleteRecordType">删除</confirm-button>
            </el-button-group>
          </div>
          <el-table
            ref="recordTypeTable"
            v-loading="listLoading"
            style="width: 100%"
            highlight-current-row
            row-key="id"
            max-height="500px"
            border
            :data="recordTypeList"
            @row-click="RecordTypeClick"
          >
            <el-table-column prop="recordTypeName" label="档案类型" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8">
        <el-card class="box-card">
          <div slot="header">
            <span>档案文件类型编辑</span>
            <el-button-group style="float: right">
              <el-button type="primary" icon="el-icon-edit" @click="onAddRecordFileType">新增</el-button>
              <el-button type="primary" icon="el-icon-share" @click="onEditRecordFileType">编辑</el-button>
              <confirm-button type="delete" icon="el-icon-delete" @click="onDeleteRecordFileType">删除</confirm-button>
            </el-button-group>
          </div>
          <el-table
            ref="fileTypeTable"
            style="width: 100%"
            highlight-current-row
            row-key="id"
            max-height="500px"
            border
            :data="recordFileTypeList"
            @row-click="RecordFileTypeClick"
          >
            <el-table-column prop="fileTypeName" label="档案文件类型" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8">
        <el-card class="box-card">
          <div slot="header">
            <span>档案文件编辑</span>
            <el-button-group style="float: right">
              <el-button type="primary" icon="el-icon-edit" @click="onAddRecordFile">新增</el-button>
              <el-button type="primary" icon="el-icon-share" @click="onEditRecordFile">编辑</el-button>
              <confirm-button type="delete" icon="el-icon-delete" @click="onDeleteRecordFile">删除</confirm-button>
            </el-button-group>
          </div>
          <el-table
            ref="fileTable"
            style="width: 100%"
            highlight-current-row
            row-key="id"
            max-height="500px"
            border
            :data="recordFileList"
            @row-click="RecordFileClick"
          >
            <el-table-column prop="recordFileName" label="档案文件" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <!--      新增-->
    <el-dialog
      v-model="addRecordTypeFormVisible"
      title="新增"
      :visible.sync="addRecordTypeFormVisible"
      :close-on-click-modal="false"
      @close="onCloseAddRecordTypeForm"
    >
      <el-form ref="addRecordTypeForm" :model="addRecordTypeForm" label-width="80px" :rules="addRecordTypeFormRules">
        <el-form-item prop="recordTypeName" label="档案类型名称" label-width="150px">
          <el-input v-model="addRecordTypeForm.recordTypeName" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="addRecordTypeFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="addRecordTypeFormValidate" :loading="addRecordTypeLoading" @click="addRecordType" />
        </div>
      </template>
    </el-dialog>
    <!--编辑窗口-->
    <el-dialog
      v-model="editRecordTypeFormVisible"
      title="编辑"
      :visible.sync="editRecordTypeFormVisible"
      :close-on-click-modal="false"
      @close="onCloseEditRecordTypeForm"
    >
      <el-form ref="editRecordTypeForm" :model="editRecordTypeForm" :rules="editRecordTypeFormRules" label-width="80px">
        <el-form-item prop="recordTypeName" label="档案类型名称" label-width="150px">
          <el-input v-model="editRecordTypeForm.recordTypeName" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="editRecordTypeFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="editRecordTypeFormValidate" :loading="editRecordTypeLoading" @click="editRecordType" />
        </div>
      </template>
    </el-dialog>
    <!--    档案文件类型部分-->
    <el-dialog
      v-model="addRecordFileTypeFormVisible"
      title="新增档案文件类型"
      :visible.sync="addRecordFileTypeFormVisible"
      :close-on-click-modal="false"
      @close="onCloseAddRecordFileTypeForm"
    >
      <el-form ref="addRecordFileTypeForm" :model="addRecordFileTypeForm" label-width="80px" :rules="addRecordFileTypeFormRules">
        <el-form-item prop="recordFileTypeName" label="档案文件类型名称" label-width="150px">
          <el-input v-model="addRecordFileTypeForm.recordFileTypeName" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="addRecordFileTypeFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="addRecordFileTypeFormValidate" :loading="addRecordFileTypeLoading" @click="addRecordFileType" />
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editRecordFileTypeFormVisible"
      title="编辑档案文件类型"
      :visible.sync="editRecordFileTypeFormVisible"
      :close-on-click-modal="false"
      @close="onCloseEditRecordFileTypeForm"
    >
      <el-form ref="editRecordFileTypeForm" :model="editRecordFileTypeForm" :rules="editRecordFileTypeFormRules" label-width="80px">
        <el-form-item prop="recordTypeName" label="档案文件名称" label-width="150px">
          <el-input v-model="editRecordFileTypeForm.recordFileTypeName" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="editRecordFileTypeFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="editRecordFileTypeFormValidate" :loading="editRecordFileTypeLoading" @click="editRecordFileType" />
        </div>
      </template>
    </el-dialog>
    <!--    档案文件部分-->
    <el-dialog
      v-model="addRecordFileFormVisible"
      title="新增档案文件"
      :visible.sync="addRecordFileFormVisible"
      :close-on-click-modal="false"
      @close="onCloseAddRecordFileForm"
    >
      <el-form ref="addRecordFileForm" :model="addRecordFileForm" label-width="80px" :rules="addRecordFileFormRules">
        <el-form-item prop="recordFileName" label="档案文件名称" label-width="150px">
          <el-input v-model="addRecordFileForm.recordFileName" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="addRecordFileFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="addRecordFileFormValidate" :loading="addRecordFileLoading" @click="addRecordFile" />
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editRecordFileFormVisible"
      title="编辑档案文件"
      :visible.sync="editRecordFileFormVisible"
      :close-on-click-modal="false"
      @close="onCloseEditRecordFileForm"
    >
      <el-form ref="editRecordFileForm" :model="editRecordFileForm" label-width="80px" :rules="editRecordFileFormRules">
        <el-form-item prop="recordTypeName" label="档案文件类型名称" label-width="150px">
          <el-input v-model="editRecordFileForm.recordFileName" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="editRecordFileFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="editRecordFileFormValidate" :loading="editRecordFileLoading" @click="editRecordFile" />
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script>
import { addRecordType
  , getRecordTypeList
  , updateRecordType
  , deleteRecordType
} from '@/api/record/recordtype'
import { getRecordFileTypeList
  , addRecordFileType
  , updateRecordFileType
  , deleteRecordFileType
} from '@/api/record/recordfiletype'
import { addRecordFile
  , updateRecordFile
  , deleteRecordFile
  , getRecordFileList
} from '@/api/record/recordfile'
import ConfirmButton from '@/components/ConfirmButton'

export default {
  name: 'FileType',
  components: {
    ConfirmButton
  },
  data() {
    return {
      recordTypeList: [],
      recordFileTypeList: [],
      recordFileList: [],
      recordType: {},
      recordFileType: {},
      recordFile: {},

      listLoading: false,
      editRecordTypeFormVisible: false, // 编辑界面是否显示
      editRecordTypeLoading: false,
      editRecordTypeFormRules: {
        recordTypeName: [{ required: true, message: '请输入档案类型名称', trigger: 'blur' }]
      },
      // 编辑界面数据
      editRecordTypeForm: {
        id: 0,
        recordTypeName: ''
      },
      addRecordTypeFormVisible: false, // 新增界面是否显示
      addRecordTypeLoading: false,
      addRecordTypeFormRules: {
        recordTypeName: [{ required: true, message: '请输入档案类型名称', trigger: 'blur' }]
      },
      // 新增界面数据
      addRecordTypeForm: {
        recordTypeName: ''
      },
      // 档案文件类型部分
      addRecordFileTypeFormVisible: false,
      addRecordFileTypeLoading: false,
      addRecordFileTypeFormRules: {
        recordFileTypeName: [{ required: true, message: '请输入档案文件类型名称', trigger: 'blur' }]
      },
      addRecordFileTypeForm: {
        recordFileTypeName: '',
        recordTypeId: 0
      },
      editRecordFileTypeFormVisible: false,
      editRecordFileTypeLoading: false,
      editRecordFileTypeFormRules: {
        recordFileTypeName: [{ required: true, message: '请输入档案文件类型名称', trigger: 'blur' }]
      },
      editRecordFileTypeForm: {
        recordFileTypeName: '',
        id: 0
      },
      // 档案文件部分
      addRecordFileFormVisible: false,
      addRecordFileLoading: false,
      addRecordFileFormRules: {
        recordFileName: [{ required: true, message: '请输入档案文件名称', trigger: 'blur' }]
      },
      addRecordFileForm: {
        recordFileName: '',
        recordFileTypeId: 0
      },

      editRecordFileFormVisible: false,
      editRecordFileLoading: false,
      editRecordFileFormRules: {
        recordFileName: [{ required: true, message: '请输入档案文件名称', trigger: 'blur' }]
      },
      editRecordFileForm: {
        recordFileName: '',
        id: 0
      }
    }
  },
  mounted() {
    this.onGetList()
  },
  methods: {
    RecordTypeClick: async function(row, column, event) {
      this.recordType = row
      const res = await getRecordFileTypeList({ id: row.id })
      this.recordFileTypeList = res.data
      this.recordFileList = []
      this.recordFileType = {}
      this.recordFile = {}
    },
    RecordFileTypeClick: async function(row, column, event) {
      this.recordFileType = row
      const res = await getRecordFileList({ id: row.id })
      this.recordFileList = res.data
      this.recordFile = []
    },
    RecordFileClick: async function(row, column, event) {
      this.recordFile = row
    },
    addRecordType: async function() {
      this.addRecordTypeLoading = true
      const para = _.cloneDeep(this.addRecordTypeForm)

      const res = await addRecordType(para)
      this.addRecordTypeLoading = false

      if (res.success) {
        this.$message({
          message: this.$t('admin.addOk'),
          type: 'success'
        })
        this.$refs['addRecordTypeForm'].resetFields()
        this.addRecordTypeFormVisible = false
        await this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    editRecordType: async function() {
      if (this.recordType) {
        this.editRecordTypeLoading = true
        const para = _.cloneDeep(this.editRecordTypeForm)
        const res = await updateRecordType(para)
        this.editRecordTypeLoading = false
        if (res.success) {
          this.$message({
            message: this.$t('admin.updateOk'),
            type: 'success'
          })
          this.$refs['editRecordTypeForm'].resetFields()
          this.editRecordTypeFormVisible = false
          await this.onGetList()
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      } else {
        this.$message({
          message: '请选中档案类别后进行操作',
          type: 'error'
        })
      }
    },
    // 显示编辑界面
    async onEditRecordType(index, row) {
      if (JSON.stringify(this.recordType) !== '{}') {
        this.editRecordTypeForm = _.cloneDeep(this.recordType)
        this.editRecordTypeFormVisible = true
      } else {
        this.$message({
          message: '请选中档案类别后进行操作',
          type: 'error'
        })
      }
    },
    // 获取列表
    onGetList: async function() {
      this.listLoading = true
      const res = await getRecordTypeList()
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

      this.recordTypeList = list
    },
    onCloseEditRecordTypeForm() {
      this.$refs.editRecordTypeForm.resetFields()
    },
    // 编辑
    editRecordTypeFormValidate: function() {
      let isValid = false
      this.$refs.editRecordTypeForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },

    // 显示新增界面
    onAddRecordType() {
      this.addRecordTypeFormVisible = true
    },
    onCloseAddRecordTypeForm() {
      this.$refs.addRecordTypeForm.resetFields()
    },
    // 新增
    addRecordTypeFormValidate: function() {
      let isValid = false
      this.$refs.addRecordTypeForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    // 删除
    async onDeleteRecordType() {
      if (JSON.stringify(this.recordType) !== '{}') {
        const data = { id: this.recordType.id }
        const res = await deleteRecordType(data)
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
        this.recordFileType = {}
        this.recordFile = {}
      } else {
        this.$message({
          message: '请选中档案类型进行删除',
          type: 'error'
        })
      }
    },
    // 档案文件类型函数部分
    addRecordFileTypeFormValidate: function() {
      let isValid = false
      this.$refs.addRecordFileTypeForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    onAddRecordFileType: function() {
      if (JSON.stringify(this.recordType) === '{}') {
        this.$message({
          message: '请选择档案类型后再进行该操作',
          type: 'error'
        })
      } else {
        this.addRecordFileTypeFormVisible = true
      }
    },
    addRecordFileType: async function() {
      this.addRecordFileTypeLoading = true
      this.addRecordFileTypeForm.recordTypeId = this.recordType.id
      const para = _.cloneDeep(this.addRecordFileTypeForm)

      const res = await addRecordFileType(para)
      this.addRecordFileTypeLoading = false

      if (res.success) {
        this.$message({
          message: this.$t('admin.addOk'),
          type: 'success'
        })
        this.$refs['addRecordFileTypeForm'].resetFields()
        this.addRecordFileTypeFormVisible = false
        const result = await getRecordFileTypeList({ id: this.recordType.id })
        this.recordFileTypeList = result.data
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    onCloseAddRecordFileTypeForm: function() {
      this.$refs.addRecordFileTypeForm.resetFields()
      this.addRecordFileTypeFormVisible = false
    },
    // 档案文件类型编辑界面显示
    onEditRecordFileType: function() {
      if (JSON.stringify(this.recordFileType) === '{}') {
        this.$message({
          message: '请选择档案文件类型后进行编辑操作',
          type: 'error'
        })
      } else {
        this.editRecordFileTypeForm.id = this.recordFileType.id
        this.editRecordFileTypeForm.recordFileTypeName = this.recordFileType.fileTypeName
        this.editRecordFileTypeFormVisible = true
      }
    },
    editRecordFileTypeFormValidate: function() {
      let isValid = false
      this.$refs.editRecordFileTypeForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    onCloseEditRecordFileTypeForm: function() {
      this.$refs.editRecordFileTypeForm.resetFields()
      this.editRecordFileTypeFormVisible = false
    },
    editRecordFileType: async function() {
      this.editRecordFileTypeLoading = true
      this.editRecordFileTypeForm.recordTypeId = this.recordType.id
      const para = _.cloneDeep(this.editRecordFileTypeForm)

      const res = await updateRecordFileType(para)
      this.editRecordFileTypeLoading = false

      if (res.success) {
        this.$message({
          message: this.$t('admin.updateOk'),
          type: 'success'
        })
        this.$refs['editRecordFileTypeForm'].resetFields()
        this.editRecordFileTypeFormVisible = false
        const result = await getRecordFileTypeList({ id: this.recordType.id })
        this.recordFileTypeList = _.cloneDeep(result.data)
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    onDeleteRecordFileType: async function() {
      if (JSON.stringify(this.recordFileType) !== '{}') {
        const data = { id: this.recordFileType.id }
        const res = await deleteRecordFileType(data)
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
        const result = await getRecordFileTypeList({ id: this.recordType.id })
        this.recordFileTypeList = result.data
        this.recordFileType = {}
        this.recordFile = {}
      } else {
        this.$message({
          message: '请选中档案文件类型进行删除',
          type: 'error'
        })
      }
    },
    // 档案文件添加部分
    onCloseAddRecordFileForm: function() {
      this.$refs.addRecordFileForm.resetFields()
      this.addRecordFileFormVisible = false
    },
    addRecordFileFormValidate: function() {
      let isValid = false
      this.$refs.addRecordFileForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    addRecordFile: async function() {
      this.addRecordFileLoading = true
      this.addRecordFileForm.recordFileTypeId = this.recordFileType.id
      const para = _.cloneDeep(this.addRecordFileForm)

      const res = await addRecordFile(para)
      this.addRecordFileLoading = false

      if (res.success) {
        this.$message({
          message: this.$t('admin.addOk'),
          type: 'success'
        })
        this.$refs['addRecordFileForm'].resetFields()
        this.addRecordFileFormVisible = false
        const result = await getRecordFileList({ id: this.recordFileType.id })
        this.recordFileList = result.data
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    onAddRecordFile: function() {
      if (JSON.stringify(this.recordFileType) === '{}') {
        this.$message({
          message: '请选择档案文件类型后进行操作',
          type: 'error'
        })
      } else {
        this.addRecordFileFormVisible = true
      }
    },

    onCloseEditRecordFileForm: function() {
      this.$refs.editRecordFileForm.resetFields()
      this.editRecordFileFormVisible = false
    },
    editRecordFileFormValidate: function() {
      let isValid = false
      this.$refs.editRecordFileForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    editRecordFile: async function() {
      this.editRecordFileLoading = true
      const para = _.cloneDeep(this.editRecordFileForm)

      const res = await updateRecordFile(para)
      this.editRecordFileLoading = false

      if (res.success) {
        this.$message({
          message: this.$t('admin.updateOk'),
          type: 'success'
        })
        this.$refs['editRecordFileForm'].resetFields()
        this.editRecordFileFormVisible = false
        const result = await getRecordFileList({ id: this.recordFileType.id })
        this.recordFileList = result.data
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    onEditRecordFile: function() {
      if (JSON.stringify(this.recordFile) === '{}') {
        this.$message({
          message: '请选择档案文件后进行编辑操作',
          type: 'error'
        })
      } else {
        this.editRecordFileForm = _.cloneDeep(this.recordFile)
        this.editRecordFileFormVisible = true
      }
    },
    onDeleteRecordFile: async function() {
      if (JSON.stringify(this.recordFile) === '{}') {
        this.$message({
          message: '请选择档案文件后进行删除操作',
          type: 'error'
        })
      } else {
        const data = { id: this.recordFile.id }
        const res = await deleteRecordFile(data)
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
        const result = await getRecordFileList({ id: this.recordFileType.id })
        this.recordFileList = result.data
        this.recordFileType = {}
        this.recordFile = {}
      }
    }
  }
}
</script>
