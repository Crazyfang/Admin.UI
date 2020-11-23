<template>
  <container>
    <template #header>
      <el-form :inline="true" :model="filter" @submit.native.prevent>
        <el-row>
          <el-col :span="4">
            <el-form-item>
              <el-input v-model="filter.companyName" placeholder="公司名称">
                <template #prefix>
                  <i class="el-input__icon el-icon-search" />
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="onGetList">查询</el-button>
            <el-button type="primary" @click.prevent="openCompanyDialog('Add', 0)">添加</el-button>
          </el-col>
        </el-row>
      </el-form>
    </template>
    <el-table
      ref="companyTable"
      v-loading="listLoading"
      row-key="id"
      :data="companyList"
      :default-expand-all="false"
      highlight-current-row
      border
      style="width: 100%;"
      :row-class-name="companyTableRowClassName"
    >
      <el-table-column label="ID">
        <template slot-scope="scope">
          <i v-if="scope.row.noticeSign" class="el-icon-warning" />
          <span :style="scope.row.noticeSign ? 'margin-left: 10px' : ''">{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="companyName" label="公司名称" />
      <el-table-column prop="businessLicense" label="营业执照号" />
      <el-table-column label="操作" width="240px" fixed="right">
        <template v-slot="{ $index, row }">
          <el-button @click="getContract(row.id)">查看合同</el-button>
          <el-button @click="openCompanyDialog('Edit', row.id)">编辑</el-button>
          <confirm-button type="delete" :loading="row._loading" @click="deleteCompany($index, row)" />
        </template>
      </el-table-column>
    </el-table>
    <!--    合同查看-->
    <el-dialog
      v-model="contractVisible"
      :visible.sync="contractVisible"
      title="查看合同"
      width="80%"
    >
      <container>
        <template #header>
          <el-form :model="contractFilter" :inline="true" @submit.native.prevent>
            <el-row>
              <el-col :span="4">
                <el-form-item>
                  <el-input v-model="contractFilter.contractNo" placeholder="合同号" clearable>
                    <template #prefix>
                      <i class="el-input__icon el-icon-search" />
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click.prevent="getContractList">查询</el-button>
                <el-button type="primary" @click.prevent="openContractDialog('Add', 0)">添加</el-button>
                <el-button type="primary" @click.prevent="downloadContractFile">导出合同</el-button>
              </el-col>
            </el-row>
          </el-form>
        </template>
        <el-table
          ref="contractTable"
          v-loading="contractListLoading"
          row-key="id"
          :data="contractList"
          :default-expand-all="false"
          highlight-current-row
          border
          style="width: 100%;"
          :row-class-name="tableRowClassName"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" label-width="150px">
                <el-form-item v-for="item in props.row.files" :key="item.id" :label="item.fileName">
                  <el-tag :type="item.overSign ? 'success' : 'danger'">{{ item.overSign ? '已完成' : '未完成' }}</el-tag>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="ID" />
          <el-table-column prop="ladingInquireDate" label="提单查询日期" width="170px" />
          <el-table-column prop="contractNo" label="合同号" width="200px" />
          <el-table-column prop="remitterName" label="汇款人姓名" width="150px" />
          <el-table-column prop="remitterAddress" label="汇款人国别" width="200px" />
          <el-table-column prop="consigneeName" label="收货人姓名" width="150px" />
          <el-table-column prop="consigneeAddress" label="收货人国别" width="200px" />
          <el-table-column prop="currency" label="币种" width="100px" />
          <el-table-column prop="amount" label="金额" width="100px" />
          <el-table-column prop="settlementDate" label="解付日期" width="170px" />
          <el-table-column prop="paymentNature" label="款项性质" width="150px" />
          <el-table-column prop="deliveryDate" label="发货日期" width="170px" />
          <el-table-column prop="dataSubmitInfo" label="资料提交情况" width="170px" />
          <el-table-column prop="remarks" label="备注" width="150px" />
          <el-table-column label="提醒时间" width="170px">
            <template slot-scope="scope">
              <el-popover v-if="scope.row.awakeTime" trigger="hover" placement="top">
                <p>提醒事项</p>
                <p>{{ scope.row.awakeNotes }}</p>
                <div slot="reference" class="name-wrapper">
                  <el-tag size="medium">{{ scope.row.awakeTime }}</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="350px" fixed="right">
            <template v-slot="{ $index, row }">
              <el-button @click="getNotice(row)">设置提醒时间</el-button>
              <el-button @click="openFileDialog(row.id)">添加文件</el-button>
              <el-button type="primary" @click="openContractDialog('Edit', row.id)">编辑</el-button>
              <confirm-button type="delete" :loading="row._loading" @click="deleteContract($index, row)" />
            </template>
          </el-table-column>
        </el-table>
        <!--        设置提醒时间-->
        <el-dialog
          width="50%"
          title="设置提醒时间"
          :visible.sync="SetDialogVisible"
          append-to-body
        >
          <el-form ref="setNoticeForm" label-width="150px" label-position="left" :model="setNoticeForm">
            <el-form-item
              prop="awakeTime"
              label="提醒时间"
              :rules="{
                required: true, message: '提醒时间不能为空', trigger: 'blur'
              }"
            >
              <el-date-picker
                v-model="setNoticeForm.awakeTime"
                type="date"
                placeholder="选择提醒时间"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item
              prop="awakeNotes"
              label="提醒事项"
              :rules="{
                required: true, message: '提醒事项不能为空', trigger: 'blur'
              }"
            >
              <el-input v-model="setNoticeForm.awakeNotes" auto-complete="false" placeholder="" />
            </el-form-item>
            <el-form-item
              prop="enableSign"
              label="启用标记"
            >
              <el-switch
                v-model="setNoticeForm.enableSign"
                style="display: block"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="启用"
                inactive-text="不启用"
              />
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="SetDialogVisible = false">取 消</el-button>
            <confirm-button type="submit" :validate="setNoticeFormValidate" :loading="setNoticeFormLoading" @click="noticeSubmit" />
          </span>
        </el-dialog>
        <!--        添加编辑合同-->
        <el-dialog
          width="50%"
          :title="contractDialogTitle"
          :visible.sync="contractDialogVisible"
          append-to-body
        >
          <el-form ref="contractForm" label-width="150px" label-position="left" :model="contractForm">
            <el-form-item
              prop="ladingInquireDate"
              label="提单查询日期"
              :rules="{
                required: true, message: '提单查询日期不能为空', trigger: 'blur'
              }"
            >
              <el-date-picker
                v-model="contractForm.ladingInquireDate"
                type="date"
                placeholder="选择提单查询日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item
              prop="contractNo"
              label="合同号"
              :rules="{
                required: true, message: '合同号不能为空', trigger: 'blur'
              }"
            >
              <el-input v-model="contractForm.contractNo" placeholder="请输入合同号" />
            </el-form-item>
            <el-form-item
              prop="remitterName"
              label="汇款人姓名"
              :rules="{
                required: true, message: '汇款人姓名不能为空', trigger: 'blur'
              }"
            >
              <el-input v-model="contractForm.remitterName" placeholder="请输入汇款人姓名" />
            </el-form-item>
            <el-form-item
              prop="remitterAddress"
              label="汇款人地址"
              :rules="{
                required: true, message: '汇款人国别不能为空', trigger: 'blur'
              }"
            >
              <el-input v-model="contractForm.remitterAddress" placeholder="请输入汇款人国别" />
            </el-form-item>
            <el-form-item
              prop="consigneeName"
              label="收货人姓名"
              :rules="{
                required: true, message: '收货人姓名不能为空', trigger: 'blur'
              }"
            >
              <el-input v-model="contractForm.consigneeName" placeholder="请输入收货人姓名" />
            </el-form-item>
            <el-form-item
              prop="consigneeName"
              label="收货人地址"
              :rules="{
                required: true, message: '收货人国别不能为空', trigger: 'blur'
              }"
            >
              <el-input v-model="contractForm.consigneeAddress" placeholder="请输入收货人国别" />
            </el-form-item>
            <el-form-item
              prop="currencyId"
              label="币种"
              :rules="{
                required: true, message: '币种不能为空', trigger: 'blur'
              }"
            >
              <el-select v-model="contractForm.currencyId" placeholder="请选择币种">
                <el-option
                  v-for="item in currencyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <!--              <el-input v-model="contractForm.currency" placeholder="请输入币种" />-->
            </el-form-item>
            <el-form-item
              prop="amount"
              label="金额"
              :rules="{
                required: true, message: '金额不能为空', trigger: 'blur'
              }"
            >
              <el-input v-model="contractForm.amount" placeholder="请输入金额" />
            </el-form-item>
            <el-form-item
              prop="settlementDate"
              label="解付日期"
              :rules="{
                required: true, message: '解付日期不能为空', trigger: 'blur'
              }"
            >
              <el-date-picker
                v-model="contractForm.settlementDate"
                type="date"
                placeholder="选择解付日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item
              prop="paymentNature"
              label="款项性质"
              :rules="{
                required: true, message: '款项性质不能为空', trigger: 'blur'
              }"
            >
              <el-select v-model="contractForm.paymentNature" placeholder="请选择款项性质">
                <el-option
                  v-for="item in paymentNatureOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <!--              <el-input v-model="contractForm.paymentNature" placeholder="请输入款项性质" />-->
            </el-form-item>
            <el-form-item
              prop="deliveryDate"
              label="发货日期"
              :rules="{
                required: true, message: '发货日期不能为空', trigger: 'blur'
              }"
            >
              <el-date-picker
                v-model="contractForm.deliveryDate"
                type="date"
                placeholder="选择发货日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item
              prop="remarks"
              label="资料提交情况"
            >
              <el-input v-model="contractForm.dataSubmitInfo" placeholder="请输入资料提交情况" />
            </el-form-item>
            <el-form-item
              prop="remarks"
              label="备注"
            >
              <el-input v-model="contractForm.remarks" placeholder="请输入备注" />
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="contractDialogVisible = false">取 消</el-button>
            <confirm-button type="submit" :validate="contractAddOrEditValidate" :loading="contractFormLoading" @click="contractSubmit" />
          </span>
        </el-dialog>
        <!--        上传文件-->
        <el-dialog
          width="70%"
          title="文件查看"
          :visible.sync="fileVisible"
          append-to-body
        >
          <el-row v-for="item in fileList.filter(i => i.presetFileId !== 0)" :key="item.uid" border style="margin-bottom: 20px">
            <el-col :span="8">
              <i v-if="item.pictureList.length !== 0" class="el-icon-success bg-green" />
              {{ item.fileName }}
            </el-col>
            <el-col :span="8">
              <el-switch
                v-model="item.overSign"
                style="display: block"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="已完成"
                inactive-text="未完成"
              />
            </el-col>
            <el-col :span="8">
              <el-button type="primary" style="margin-right: 10px" @click="openRenameDialog(item)">编辑</el-button>
              <el-button plain style="width:90px;" @click="openUploadDialog(item)">
                <i class="el-icon-upload el-icon--left" />上传
              </el-button>
            </el-col>
          </el-row>
          <el-row v-for="item in fileList.filter(i => i.presetFileId === 0)" :key="item.uid" border style="margin-bottom: 20px">
            <el-col :span="6">
              <el-input v-model="item.fileName" placeholder="请输入文件名称" width>
                <template v-if="item.pictureList.length !== 0" slot="prepend"><i class="el-icon-success" /></template>
              </el-input>
            </el-col>
            <el-col :span="8" offset="2">
              <el-switch
                v-model="item.overSign"
                style="display: block"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="已完成"
                inactive-text="未完成"
              />
            </el-col>
            <el-col :span="8">
              <el-button type="primary" style="margin-right: 10px" @click="delOtherFile(item.uid)">删除</el-button>
              <el-button plain style="width:90px;" @click="openUploadDialog(item)">
                <i class="el-icon-upload el-icon--left" />上传
              </el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="4" :offset="10">
              <el-button type="primary" @click="addOtherFile">添加其他</el-button>
            </el-col>
          </el-row>
          <span slot="footer" class="dialog-footer">
            <el-button @click="fileVisible = false">取 消</el-button>
            <confirm-button type="submit" :loading="fileAddLoading" @click="fileSubmit" />
          </span>

          <el-dialog
            width="40%"
            title="文件名编辑"
            :visible.sync="fileNameDialogVisible"
            append-to-body
          >
            <el-row>
              <el-col :span="8">
                文件名:
              </el-col>
              <el-col :span="16">
                <input v-model="fileName" auto-complete="false" placeholder="请输入文件名">
              </el-col>
            </el-row>
            <span slot="footer" class="dialog-footer">
              <el-button @click="fileNameDialogVisible = false">取 消</el-button>
              <confirm-button type="submit" @click="renameFileName" />
            </span>
          </el-dialog>
        </el-dialog>

        <el-dialog
          width="50%"
          title="图片上传"
          :visible.sync="pictureDialogVisible"
          append-to-body
          @closed="closePicDialogFunc"
        >
          <el-upload
            class="avatar-uploader"
            action="/api/antimoney/file/FileImageUpload"
            list-type="picture-card"
            :headers="token"
            :on-success=" (response, file, fileList) => onImageSuccess(response)"
            :file-list="pictureFileList"
            :on-preview="addImageToArray"
            :on-remove="removePicture"
            style="display: inline-block;"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <el-image-viewer
            v-if="showViewer"
            :on-close="()=>{ showViewer = false }"
            :url-list="imgList"
          />
          <!--          <el-button v-if="item.filePath" type="primary" icon="el-icon-zoom-in" style="margin-left: 10px" @click="addImageToArray(item)">查看图片</el-button>-->
        </el-dialog>
        <template #footer>
          <pagination
            ref="pager"
            :page.sync="contractPager.currentPage"
            :size.sync="contractPager.pageSize"
            :total="contractPager.total"
            @get-page="getContractList"
          />
        </template>
      </container>
      <span slot="footer" class="dialog-footer">
        <el-button @click="contractPageCancel">取 消</el-button>
      </span>
    </el-dialog>
    <!--    新增编辑界面-->
    <el-dialog
      width="50%"
      :visible.sync="companyDialogVisible"
      :title="companyDialogTitle"
    >
      <el-form ref="companyForm" label-position="left" :model="companyForm" label-width="150px">
        <el-form-item
          prop="companyName"
          label="公司名称"
          :rules="{
            required: true, message: '公司名称不能为空', trigger: 'blur'
          }"
        >
          <el-input v-model="companyForm.companyName" palceholder="请输入公司名称" auto-complete="off" />
        </el-form-item>
        <el-form-item
          prop="businessLicense"
          label="营业执照号"
          :rules="{
            required: true, message: '营业执照号不能为空', trigger: 'blur'
          }"
        >
          <el-input v-model="companyForm.businessLicense" placeholder="请输入营业执照号" auto-complete="off" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="companyDialogVisible = false">取 消</el-button>
        <confirm-button type="submit" :validate="companyAddOrEditValidate" :loading="addFormLoading" @click="companySubmit" />
      </span>
    </el-dialog>
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
import Container from '@/components/Container/index'
import Pagination from '@/components/Pagination'
import ConfirmButton from '@/components/ConfirmButton/index'
import { companyPage, addCompany, editCompany, getCompany, delCompany } from '@/api/antimoney/company'
import {
  contractPage,
  addContract,
  editContract,
  getFileList,
  getContract,
  delContract,
  getNotes,
  addOrEditNotes,
  generateContractList
} from '@/api/antimoney/contract'
import { addFile } from '@/api/antimoney/file'
import { getCurrencyList } from '@/api/antimoney/currency'
export default {
  name: 'Company',
  components: { ConfirmButton, Container, Pagination, 'el-image-viewer': () => import('element-ui/packages/image/src/image-viewer') },
  data() {
    return {
      paymentNatureOption: [{
        value: '货到',
        label: '货到'
      }, {
        value: '预收',
        label: '预收'
      }],
      // 图片列表
      pictureFileList: [],
      // 图片上传界面显示
      pictureDialogVisible: false,
      // 币种列表
      currencyOptions: [],
      fileName: '',
      fileNameItem: {},
      fileNameDialogVisible: false,
      showViewer: false,
      imgList: [],
      setNoticeFormLoading: false,
      setNoticeForm: {
        contractId: 0,
        awakeTime: '',
        awakeNotes: '',
        enableSign: false
      },
      // 设置提醒窗口是否显示
      SetDialogVisible: false,
      // 提醒设置窗口展示
      noteDialogVisible: false,
      // 设置提醒
      contractNotes: {
        contractId: 0,
        awakeTime: '',
        awakeNotes: ''
      },
      // 文件添加加载变量
      fileAddLoading: false,
      // 公司筛选条件
      filter: {
        companyName: ''
      },
      // 合同筛选条件
      contractFilter: {
        companyId: 0,
        contractNo: '',
        noticeSign: false
      },
      // 公司分页
      pager: {},
      // 合同分页
      contractPager: {},
      // 公司表格加载
      listLoading: false,
      // 合约表格加载
      contractListLoading: false,
      // 公司表格数据
      companyList: [{
        id: 1,
        companyName: '宁波进出口贸易有限公司',
        businessLicense: '99999999'
      }],
      contractList: [{
        id: 1,
        contractNo: 'AA1111',
        // 汇款人姓名
        remitterName: '测试',
        // 汇款人地址
        remitterAddress: '测试地址',
        // 收货人姓名
        consigneeName: '测试1',
        // 收货人地址
        consigneeAddress: '测试地址1',
        // 币种
        currency: '人民币',
        // 金额
        amount: 9000,
        // 解付日期
        settlementDate: '2020-10-29',
        // 款项性质
        paymentNature: '预付',
        // 发货日期
        deliveryDate: '2020-12-31',
        // 资料提交情况
        dataSubmitInfo: '',
        // 提单查询日期
        ladingInquireDate: '',
        // 备注
        remarks: '测试备注',
        // 提醒时间
        awakeTime: '2020-12-30'
      }],
      // 文件类别
      fileList: [{
        uid: '8888',
        id: 1,
        selectId: 1,
        fileName: '情况说明',
        presetFileId: 0,
        filePath: '',
        overSign: true,
        loading: false,
        pictureList: []
      }, {
        uid: '9999',
        id: 2,
        selectId: 2,
        fileName: '合约',
        presetFileId: 0,
        filePath: '',
        overSign: true,
        loading: false,
        pictureList: []
      }],
      // 合同添加加载变量
      contractFormLoading: false,
      // 合同新增编辑界面是否显示
      contractDialogVisible: false,
      // 合同新增编辑界面标题
      contractDialogTitle: '',
      // 合同界面操作类型
      contractOperateType: '',
      // 选中公司id
      selectCompanyId: 0,
      // 公司界面操作类型
      companyOperateType: '',
      // 添加编辑公司确认按钮的加载变量
      addFormLoading: false,
      // 公司新增编辑界面是否显示
      companyDialogVisible: false,
      // 公司新增编辑界面标题
      companyDialogTitle: '',
      // 公司新增编辑表单
      companyForm: {
        id: 0,
        companyName: '',
        businessLicense: ''
      },
      contractForm: {
        id: 0,
        contractNo: '',
        // 汇款人姓名
        remitterName: '',
        // 汇款人地址
        remitterAddress: '',
        // 收货人姓名
        consigneeName: '',
        // 收货人地址
        consigneeAddress: '',
        // 币种
        currencyId: '',
        // 金额
        amount: '',
        // 解付日期
        settlementDate: '',
        // 款项性质
        paymentNature: '',
        // 发货日期
        deliveryDate: '',
        // 备注
        remarks: '',
        // 资料提交情况
        dataSubmitInfo: '',
        // 提单查询日期
        ladingInquireDate: '',
        companyId: 0
      },
      // 合约对话框是否显示
      contractVisible: false,
      // 文件对话框是否显示
      fileVisible: false
    }
  },
  computed: {
    token() {
      return { 'Authorization': 'Bearer ' + this.$store.getters.token }
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
    this.contractPager = this.$refs.pager.getPager()
    this.onGetList()
    this.getCurrencyData()
  },
  methods: {
    // 下载合同文件
    downloadContractFile: async function() {
      const data = {
        currentPage: this.contractPager.currentPage,
        pageSize: this.contractPager.pageSize,
        filter: this.contractFilter
      }
      const res = await generateContractList(data)
      if (res.success) {
        await this.$alert('<a target="_blank" href="/api/antimoney/contract/downloadfile?fileName=' + res.data + '">下载文件<a>', '下载界面', {
          dangerouslyUseHTMLString: true
        })
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 关闭图片对话框
    closePicDialogFunc: function() {
      this.pictureFileList = []
    },
    openUploadDialog: function(item) {
      this.pictureFileList = item.pictureList
      this.pictureDialogVisible = true
    },
    // 图片删除
    removePicture: function(file, fileList) {
      const index = this.pictureFileList.findIndex(i => i.id === file.id)
      index > -1 && this.pictureFileList.splice(index, 1)
      console.log(this.fileList)
    },
    // 获取币种数据
    getCurrencyData: async function() {
      const res = await getCurrencyList()

      if (res.success) {
        this.currencyOptions = res.data
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 打开重命名文件对话框
    openRenameDialog: function(item) {
      this.fileName = ''
      this.fileNameItem = item
      this.fileNameDialogVisible = true
    },
    // 重命名文件名称
    renameFileName: function() {
      if (this.fileName) {
        this.fileNameItem.fileName = this.fileName
        this.$message({
          message: '修改成功',
          type: 'success'
        })
        this.fileNameDialogVisible = false
      } else {
        this.$message({
          message: '请输入文件名称再提交!',
          type: 'error'
        })
      }
    },
    addImageToArray: function(item) {
      this.imgList = []
      // this.imgList.push('/upload/antimoney/' + item.filePath)
      this.imgList.push(item.url)
      this.showViewer = true
    },
    onImageSuccess(res, item) {
      // item.loading = false
      if (!(res && res.code === 1)) {
        if (res.msg) {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
        return
      }
      const data = { id: 0, url: 'http://154.25.8.51:9998/upload/antimoney/' + res.data, name: '图片.jpg' }
      this.pictureFileList.push(data)
      // item.filePath = res.data
    },
    contractPageCancel: async function() {
      this.contractVisible = false
      await this.onGetList()
    },
    // 获取提醒
    getNotice: async function(row) {
      const res = await getNotes({ contractId: row.id })

      if (res.success) {
        res.data.contractId = row.id
        this.setNoticeForm = res.data
        this.SetDialogVisible = true
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 提交提醒
    noticeSubmit: async function() {
      const data = _.cloneDeep(this.setNoticeForm)

      this.setNoticeFormLoading = true
      const res = await addOrEditNotes(data)
      this.setNoticeFormLoading = false

      if (res.success) {
        this.$message({
          message: '编辑成功',
          type: 'success'
        })
        this.SetDialogVisible = false
        await this.getContractList()
        await this.onGetList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 设置提醒表单验证
    setNoticeFormValidate: function() {
      let isValid = false
      this.$refs.setNoticeForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    // 行列变更颜色
    tableRowClassName({ row, rowIndex }) {
      if (row.awakeTime && Date.parse(row.awakeTime) <= new Date() && row.enableSign) {
        return 'warning-row'
      } else {
        return ''
      }
    },
    // 公司行列变更颜色
    companyTableRowClassName({ row, rowIndex }) {
      if (row.noticeSign) {
        return 'warning-row'
      } else {
        return ''
      }
    },
    // 删除公司
    deleteCompany: async function(index, row) {
      row._loading = true
      const para = { companyId: row.id }
      const res = await delCompany(para)

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
    // 删除合同
    deleteContract: async function(index, row) {
      row._loading = true
      const para = { contractId: row.id }
      const res = await delContract(para)

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
      await this.getContractList()
      await this.onGetList()
    },
    // 查看文件
    openFileDialog: async function(id) {
      const res = await getFileList({ contractId: id })

      console.log(res.data)

      if (res.success) {
        res.data.forEach(i => {
          i.loading = false
        })
        this.fileList = res.data
        this.fileVisible = true
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 文件提交
    fileSubmit: async function() {
      const data = _.cloneDeep(this.fileList)

      this.fileAddLoading = true
      const res = await addFile(data)
      this.fileAddLoading = false

      if (res.success) {
        this.$message({
          message: '添加成功',
          type: 'success'
        })
        this.fileVisible = false
        await this.getContractList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 合同表单验证
    contractAddOrEditValidate: function() {
      let isValid = false
      this.$refs.contractForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    // 合同提交
    contractSubmit: async function() {
      if (this.contractOperateType === 'Add') {
        this.contractForm.companyId = this.contractFilter.companyId
        const data = _.cloneDeep(this.contractForm)
        this.contractFormLoading = true
        const res = await addContract(data)
        this.contractFormLoading = false

        if (res.success) {
          this.$message({
            message: '添加成功',
            type: 'success'
          })
          await this.getContractList()
          this.contractDialogVisible = false
          this.$refs.contractForm.resetFields()
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      } else if (this.contractOperateType === 'Edit') {
        const data = _.cloneDeep(this.contractForm)
        this.contractFormLoading = true
        const res = await editContract(data)
        this.contractFormLoading = false

        if (res.success) {
          this.$message({
            message: '编辑成功',
            type: 'success'
          })
          await this.getContractList()
          this.contractDialogVisible = false
          this.$refs.contractForm.resetFields()
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      }
    },
    // 打开添加或编辑合同界面
    openContractDialog: async function(type, id) {
      // this.$refs.contractForm.resetFields()
      this.contractOperateType = type
      if (type === 'Add') {
        this.contractDialogTitle = '添加合同'
      } else if (type === 'Edit') {
        const res = await getContract({ contractId: id })
        if (res.success) {
          this.contractForm = res.data
          this.contractVisible = true
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
        this.contractDialogTitle = '编辑合同'
      }
      this.contractDialogVisible = true
    },
    // 获取公司下面的合同
    getContract: async function(id) {
      this.contractFilter.companyId = id
      const para = {
        currentPage: this.contractPager.currentPage,
        pageSize: this.contractPager.pageSize,
        filter: this.contractFilter
      }
      const res = await contractPage(para)
      if (res.success) {
        this.contractList = res.data.list
        const data = _.cloneDeep(res.data.list)

        data.forEach(l => {
          l._loading = false
        })
        this.contractPager.total = res.data.total
        this.contractVisible = true
      } else {
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    },
    // 打开添加或编辑公司界面
    openCompanyDialog: async function(type, id) {
      // this.$refs.companyForm.resetFields()
      this.companyOperateType = type
      if (type === 'Add') {
        this.companyDialogTitle = '添加公司'
        // this.$refs.companyForm.resetFields()
      } else if (type === 'Edit') {
        // 获取数据
        const res = await getCompany({ companyId: id })
        if (res.success) {
          this.companyForm = res.data
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
        this.companyDialogTitle = '编辑公司'
      }
      this.companyDialogVisible = true
    },
    // 添加编辑公司表单验证
    companyAddOrEditValidate: function() {
      let isValid = false
      this.$refs.companyForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    // 添加或者编辑提交
    companySubmit: async function() {
      if (this.companyOperateType === 'Add') {
        const data = _.cloneDeep(this.companyForm)

        this.addFormLoading = true
        const res = await addCompany(data)
        this.addFormLoading = false

        if (res.success) {
          this.$message({
            message: '添加成功',
            type: 'success'
          })
          this.companyDialogVisible = false
          await this.onGetList()
          this.$refs.companyForm.resetFields()
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
        // 提交
      } else if (this.companyOperateType === 'Edit') {
        const data = _.cloneDeep(this.companyForm)

        this.addFormLoading = true
        const res = await editCompany(data)
        this.addFormLoading = false

        if (res.success) {
          this.$message({
            message: '编辑成功',
            type: 'success'
          })
          this.companyDialogVisible = false
          await this.onGetList()
          this.$refs.companyForm.resetFields()
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
        // 提交
      }
    },
    // 获取公司列表
    onGetList: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize,
        filter: this.filter
      }

      const res = await companyPage(para)

      if (res.success) {
        this.pager.total = res.data.total
        const data = _.cloneDeep(res.data.list)

        data.forEach(l => {
          l._loading = false
        })
        this.companyList = data
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 获取公司下的合同文件
    getContractList: async function() {
      const para = {
        currentPage: this.contractPager.currentPage,
        pageSize: this.contractPager.pageSize,
        filter: this.contractFilter
      }
      const res = await contractPage(para)
      if (res.success) {
        this.contractList = res.data.list
        const data = _.cloneDeep(res.data.list)

        data.forEach(l => {
          l._loading = false
        })
        this.contractPager.total = data
        this.contractVisible = true
      } else {
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    },
    // 添加其他文件
    addOtherFile: function() {
      const uuid = require('uuid')
      this.fileList.push({
        uid: uuid.v1(),
        id: 0,
        fileName: '',
        presetFileId: 0,
        filePath: '',
        overSign: false,
        loading: false,
        pictureList: []
      })
    },
    // 删除其他文件
    delOtherFile: function(uid) {
      this.fileList = this.fileList.filter(i => i.uid !== uid)
    }
  }
}
</script>

<style scoped>
.el-table .warning-row {
  background: oldlace;
}
</style>
