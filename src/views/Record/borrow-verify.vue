<template>
  <section style="padding:10px;">
    <el-tabs tab-position="left" style="height: 100%; width: 100%">
      <el-tab-pane label="借调阅审核">
        <container>
          <template #header>
            <!--查询-->
            <el-form :inline="true" :model="filter" @submit.native.prevent>
              <el-row>
                <el-col :span="4">
                  <el-form-item>
                    <el-input v-model="filter.recordId" placeholder="档案编号" @keyup.enter.native="onGetList">
                      <template #prefix>
                        <i class="el-input__icon el-icon-search" />
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item>
                    <el-input v-model="filter.recordUserName" placeholder="用户姓名" @keyup.enter.native="onGetList">
                      <template #prefix>
                        <i class="el-input__icon el-icon-search" />
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item>
                    <el-input v-model="filter.recordUserInCode" placeholder="客户内码" @keyup.enter.native="onGetList">
                      <template #prefix>
                        <i class="el-input__icon el-icon-search" />
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item>
                    <el-input v-model="filter.recordUserCode" placeholder="客户码" @keyup.enter.native="onGetList">
                      <template #prefix>
                        <i class="el-input__icon el-icon-search" />
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item>
                    <el-button type="primary" @click="onGetList">查询</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>

          <!--列表-->
          <el-table
            ref="borrowVerifyTable"
            v-loading="listLoading"
            row-key="id"
            :data="borrowItem"
            :default-expand-all="false"
            highlight-current-row
            border
            style="width: 100%"
            @select-all="onSelectAll"
            @select="onSelect"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="id" width="50" label="ID" />
            <el-table-column prop="userName" label="申请人" width="120px" />
            <el-table-column prop="userCode" label="申请人柜员号" width="120px" />
            <el-table-column prop="borrowType" label="申请类型" width="120px">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.borrowType === 0 ? 'primary' : 'success'"
                  disable-transitions
                >{{ scope.row.borrowType === 0 ? '借阅' : '调阅' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="departmentName" label="申请人部门名称" width="120px" />
            <el-table-column prop="departmentCode" label="申请人部门编号" width="120px" />
            <el-table-column prop="recordCount" label="申请档案数量" width="120px" />
            <el-table-column prop="createdTime" label="创建时间" :formatter="formatCreatedTime" width="150px" />
            <el-table-column label="操作" width="120px" fixed="right">
              <template v-slot="{ $index, row }">
                <el-button @click.native="showBorrowDetailDialog(row.id)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!--审核界面-->
          <el-dialog
            v-model="borrowDetailVisible"
            title="借调阅详情"
            width="60%"
            :visible.sync="borrowDetailVisible"
            :close-on-click-modal="false"
            @close="closeBorrowDetailDialog"
          >
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                申请人名称:
              </el-col>
              <el-col :span="6">
                {{ borrowDetail.userName }}
              </el-col>
              <el-col :span="6">
                申请人柜员号:
              </el-col>
              <el-col :span="6">
                {{ borrowDetail.userCode }}
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                部门名称:
              </el-col>
              <el-col :span="6">
                {{ borrowDetail.departmentName }}
              </el-col>
              <el-col :span="6">
                部门编号:
              </el-col>
              <el-col :span="6">
                {{ borrowDetail.departmentCode }}
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                类型:
              </el-col>
              <el-col :span="6">
                <el-tag
                  :type="borrowDetail.borrowType === 0 ? 'primary' : 'success'"
                  disable-transitions
                >{{ borrowDetail.borrowType === 0 ? '借阅' : '调阅' }}</el-tag>
              </el-col>
              <el-col :span="6">
                申请时间:
              </el-col>
              <el-col :span="6">
                {{ formatCreatedTime(1, 2, borrowDetail.createdTime) }}
              </el-col>
            </el-row>
            <el-divider content-position="left">档案列表</el-divider>
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                档案编号
              </el-col>
              <el-col :span="6">
                档案用户姓名
              </el-col>
              <el-col :span="6">
                档案用户客户内码
              </el-col>
              <el-col :span="6">
                档案客用户客户号
              </el-col>
            </el-row>
            <el-row v-for="item in borrowDetail.recordBorrowItemList" :key="item.id" :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                {{ item.id }}
              </el-col>
              <el-col :span="6">
                {{ item.recordUserName }}
              </el-col>
              <el-col :span="6">
                {{ item.recordUserInCode }}
              </el-col>
              <el-col :span="6">
                {{ item.recordUserCode }}
              </el-col>
            </el-row>
            <el-dialog
              width="30%"
              title="填写拒绝原因"
              :visible.sync="refuseReasonPageVisible"
              append-to-body
            >
              <el-form :model="verifyTemplate">
                <el-form-item label="拒绝原因" label-width="120px">
                  <el-input v-model="verifyTemplate.refuseReason" autocomplete="off" />
                </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer">
                <el-button @click="refuseReasonPageVisible = false">取 消</el-button>
                <el-button type="primary" @click="verifyBorrowApple(0)">提 交</el-button>
              </div>
            </el-dialog>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="verifyBorrowApple(1)">同意借调阅</el-button>
                <el-button @click="refuseReasonPageVisible = true">拒绝</el-button>
                <el-button @click.native="closeBorrowDetailDialog">取消</el-button>
              </div>
            </template>
          </el-dialog>

          <template #footer>
            <pagination
              ref="pager"
              :page.sync="pager.currentPage"
              :size.sync="pager.pageSize"
              :total="pager.total"
              :checked-count="sels.length"
              @get-page="onGetList"
            />
          </template>
        </container>
      </el-tab-pane>
      <el-tab-pane label="档案移交确认">
        <container>
          <template #header>
            <el-form :inline="true">
              <el-row>
                <el-col :span="8">
                  <el-form-item>
                    <treeselect
                      v-model="handOverFilter.managerDepartmentId"
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
                </el-col>
                <el-col :span="6">
                  <el-form-item>
                    <el-select v-model="handOverFilter.managerUserId" clearable placeholder="请选择">
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
                </el-col>
                <el-col :span="6">
                  <el-button type="primary" @click.native="onHandOverGetList">查询</el-button>
                </el-col>
              </el-row>
            </el-form>
          </template>
          <!--列表-->
          <el-table
            ref="recordTable"
            v-loading="recordlistLoading"
            row-key="id"
            :data="recordList"
            :default-expand-all="false"
            highlight-current-row
            border
            style="width: 100%"
          >
            <el-table-column prop="id" width="50" label="ID" />
            <el-table-column prop="recordId" label="档案编号" width="150px" />
            <el-table-column prop="recordUserName" label="档案用户姓名" width="120px" />
            <el-table-column prop="recordUserCode" label="档案用户客户号" width="190px" />
            <el-table-column prop="recordUserInCode" label="档案用户客户内码" width="180px" />
            <el-table-column prop="recordManagerName" label="档案管理人" width="120px" />
            <el-table-column prop="recordManagerCode" label="档案管理人柜员号" width="150px" />
            <el-table-column prop="departmentName" label="申请人部门名称" width="120px" />
            <el-table-column prop="departmentCode" label="申请人部门编号" width="120px" />
            <el-table-column prop="createdTime" label="创建时间" :formatter="formatCreatedTime" width="150px" />
            <el-table-column label="操作" width="120px" fixed="right">
              <template v-slot="{ $index, row }">
                <el-button @click.native="getRecordBasicInfo($index, row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 档案详情展示  -->
          <el-dialog
            v-model="infoVisible"
            width="60%"
            title="档案具体内容"
            :visible.sync="infoVisible"
            :close-on-click-modal="true"
          >
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                <span>档案号:</span>
              </el-col>
              <el-col :span="6">
                <span>{{ recordInfo.record.recordId }}</span>
              </el-col>
              <el-col :span="6">
                <span>档案用户姓名:</span>
              </el-col>
              <el-col :span="6">
                <span>{{ recordInfo.record.recordUserName }}</span>
              </el-col>
            </el-row>
            <el-divider />
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                <span>档案用户客户号:</span>
              </el-col>
              <el-col :span="6">
                <span>{{ recordInfo.record.recordUserCode }}</span>
              </el-col>
              <el-col :span="6">
                <span>档案用户客户内码:</span>
              </el-col>
              <el-col :span="6">
                <span>{{ recordInfo.record.recordUserInCode }}</span>
              </el-col>
            </el-row>
            <el-divider />
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                <span>归管支行:</span>
              </el-col>
              <el-col :span="6">
                <span>{{ recordInfo.record.departmentName }}</span>
              </el-col>
              <el-col :span="6">
                <span>归管客户经理:</span>
              </el-col>
              <el-col :span="6">
                <span>{{ recordInfo.record.userCode }}-{{ recordInfo.record.userName }}</span>
              </el-col>
            </el-row>
            <el-divider />
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                <span>授信到期日:</span>
              </el-col>
              <el-col :span="6">
                <span>{{ recordInfo.record.creditDueDate }}</span>
              </el-col>
              <el-col :span="6">
                <span>档案类型:</span>
              </el-col>
              <el-col :span="6">
                <span>{{ recordInfo.record.recordType === 1 ? '企业' : '个人' }}</span>
              </el-col>
            </el-row>
            <el-divider content-position="left">档案文件</el-divider>
            <el-row v-for="item in recordInfo.recordFileTypeList" :key="item.id" style="margin: 20px;">
              <el-card class="box-card">
                <div slot="header">
                  <span>{{ item.name }}{{ item.remarks ? '-' + item.remarks:'' }}</span>
                </div>
                <el-row :gutter="20">
                  <el-col :span="2"><span>勾选框</span></el-col>
                  <el-col :span="7"><span>名称</span></el-col>
                  <el-col :span="7"><span>到期日</span></el-col>
                  <el-col :span="4"><span>份数</span></el-col>
                  <el-col :span="4"><span>是否移交</span></el-col>
                </el-row>
                <el-row v-for="recordFile in item.children" :key="recordFile.id" :gutter="20">
                  <el-col :span="2" style="margin-bottom: 20px;margin-top: 20px"><el-checkbox v-model="recordFile.checked" /></el-col>
                  <el-col :span="7" style="margin-bottom: 20px;margin-top: 20px"><span>{{ recordFile.name }}</span></el-col>
                  <el-col :span="7" style="margin-bottom: 20px;margin-top: 20px"><span>{{ recordFile.creditDueDate ? recordFile.creditDueDate : '无过期时间' }}</span></el-col>
                  <el-col :span="4" style="margin-bottom: 20px;margin-top: 20px"><span>{{ 'x' + recordFile.num }}</span></el-col>
                  <el-col :span="4" style="margin-bottom: 20px;margin-top: 20px"><span>{{ recordFile.handOverSign ? '已移交' : '未移交' }}</span></el-col>
                </el-row>
              </el-card>
            </el-row>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click.native="infoVisible = false">取消</el-button>
                <el-button @click.native="handOverInfoVisible = true">拒绝接受档案</el-button>
                <el-button @click.native="handOverSubmit">档案接收</el-button>
              </div>
            </template>
          </el-dialog>

          <el-dialog
            width="40%"
            title="拒绝面板"
            :visible.sync="handOverInfoVisible"
            append-to-body
          >
            <el-form label-position="left" label-width="80px">
              <el-form-item label="拒绝原因">
                <el-input v-model="handOverRefuseReason" />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="handOverInfoVisible = false">取 消</el-button>
              <confirm-button type="submit" :loading="handOverRefuseLoading" @click="refuseHandOver" />
            </div>
          </el-dialog>

          <template #footer>
            <pagination
              ref="handOverPager"
              :page.sync="handOverPager.currentPage"
              :size.sync="handOverPager.pageSize"
              :total="handOverPager.total"
              @get-page="onHandOverGetList"
            />
          </template>
        </container>

      </el-tab-pane>
      <el-tab-pane label="档案借阅归还">
        <!--列表-->
        <el-table
          ref="returnTable"
          v-loading="returnListLoading"
          :data="returnList"
          :default-expand-all="false"
          highlight-current-row
          border
          style="width: 100%"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item v-for="item in props.row.children" :key="item.id" label="档案编号">
                  <span>{{ item.recordUserName }} - {{ item.recordUserInCode }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="id" width="50" label="ID" />
          <el-table-column prop="userName" label="申请人" width="120px" />
          <el-table-column prop="userCode" label="申请人柜员号" width="120px" />
          <el-table-column prop="borrowType" label="申请类型" width="120px">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.borrowType === 0 ? 'primary' : 'success'"
                disable-transitions
              >{{ scope.row.borrowType === 0 ? '借阅' : '调阅' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="departmentName" label="申请人部门名称" width="120px" />
          <el-table-column prop="departmentCode" label="申请人部门编号" width="120px" />
          <el-table-column prop="recordCount" label="申请档案数量" width="120px" />
          <el-table-column prop="createdTime" label="创建时间" :formatter="formatCreatedTime" width="150px" />
          <el-table-column label="操作" width="120px" fixed="right">
            <template v-slot="{ $index, row }">
              <confirm-button type="other" button-text-string="接收档案" :loading="row._loading" content="确定接收档案吗" @click="returnRecord($index, row)" />
            </template>
          </el-table-column>
        </el-table>

        <template #footer>
          <pagination
            ref="returnPager"
            :page.sync="returnPager.currentPage"
            :size.sync="returnPager.pageSize"
            :total="returnPager.total"
            @get-page="onGetReturnList"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane label="档案文件更换">
        <container>
          <!--列表-->
          <el-table
            ref="recordFileChange"
            v-loading="fileChangeLoading"
            row-key="id"
            :data="changeData"
            :default-expand-all="false"
            highlight-current-row
            border
            style="width: 100%"
          >
            <el-table-column prop="id" width="50" label="ID" />
            <el-table-column prop="userName" label="提交人" width="120px" />
            <el-table-column prop="userCode" label="提交人柜员号" width="120px" />
            <el-table-column prop="type" label="申请类型" width="120px">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.type === 0 ? 'primary' : 'success'"
                  disable-transitions
                >{{ scope.row.type === 0 ? '过期更换' : '主动更换' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="departmentName" label="申请人部门名称" width="120px" />
            <el-table-column prop="departmentCode" label="申请人部门编号" width="120px" />
            <el-table-column prop="recordUserName" label="申请档案客户名称" width="150px" />
            <el-table-column prop="createdTime" label="创建时间" :formatter="formatCreatedTime" width="150px" />
            <el-table-column label="操作" width="120px" fixed="right">
              <template v-slot="{ $index, row }">
                <el-button @click.native="getDetail($index, row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <template #footer>
            <pagination
              ref="fileChangePager"
              :page.sync="fileChangePager.currentPage"
              :size.sync="fileChangePager.pageSize"
              :total="fileChangePager.total"
              @get-page="onGetApplyChangeList"
            />
          </template>

          <!-- 档案主动更换-->
          <el-dialog v-model="visibleChangeData" :visible.sync="visibleChangeData" title="详情" width="60%">
            <el-row>
              <el-col :span="24">
                <el-collapse>
                  <el-collapse-item v-for="item in changeDetail" :key="item.uid" :name="item.uid">
                    <template slot="title">
                      <span class="collapse-title">{{ item.name }} {{ item.remarks ? '-' + item.remarks : '' }}</span>
                    </template>
                    <el-row v-for="child in item.children" :key="child.id" style="margin-bottom: 20px;">
                      <el-col :span="6">
                        <span>{{ child.fileName }}</span>
                      </el-col>
                      <el-col :span="5">
                        <span>{{ child.delSign ? '删除' : '修改到期时间' }}</span>
                      </el-col>
                      <el-col :span="6">
                        <span>{{ child.delSign ? '' : child.creditDueDate }}</span>
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

            <el-dialog
              width="40%"
              title="拒绝面板"
              :visible.sync="innerVisible"
              append-to-body
            >
              <el-form label-position="left" label-width="80px">
                <el-form-item label="拒绝原因">
                  <el-input v-model="refuseReason" />
                </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer">
                <el-button @click="innerVisible = false">取 消</el-button>
                <confirm-button type="submit" :loading="refuseLoading" @click="refuseApply" />
              </div>
            </el-dialog>

            <div slot="footer" class="dialog-footer">
              <el-button @click="visibleChangeData = false">取 消</el-button>
              <el-button @click="innerVisible = true">拒绝申请</el-button>
              <confirm-button type="submit" :loading="acceptLoading" @click="acceptApply" />
            </div>
          </el-dialog>
        </container>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script>
import ConfirmButton from '@/components/ConfirmButton'
import Container from '@/components/Container/index'
import { formatTime, listToTree } from '@/utils'
import { getDepartmentList } from '@/api/admin/department'
import { getUserSelect } from '@/api/admin/user'
import { getVerifyList, getBorrowDetail, verifyBorrow, getReturnPage, returnRecord } from '@/api/record/recordborrow'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { handOverPage, handOverBasicInfo, handOverCheck, getApplyChangeList, getApplyChangeDetail, acceptApplyChange, refuseApplyChange, refuseHandOver } from '@/api/record/record'

export default {
  name: 'BorrowVerify',
  components: {
    Container,
    ConfirmButton,
    Pagination,
    Treeselect
  },
  data() {
    return {
      handOverFilter: {
        managerDepartmentId: null,
        managerUserId: null
      },
      // 用户列表
      userList: [],
      // 部门列表
      departments: [],
      normalizer(node) {
        return {
          id: node.id,
          label: node.departmentName,
          children: node.children
        }
      },
      verifyTemplate: {
        id: 0,
        verifyType: 0,
        refuseReason: ''
      },
      borrowDetail: {
        id: 0,
        userName: '',
        userCode: '',
        departmentName: '',
        departmentCode: '',
        createdTime: '',
        borrowType: 0,
        recordBorrowItemList: []
      },
      refuseReasonPageVisible: false,
      borrowDetailVisible: false,
      sels: [],
      pager: {},
      borrowItem: [{
        id: 0,
        userName: '',
        userCode: '',
        departmentName: '',
        departmentCode: '',
        recordCount: 0,
        createdTime: '',
        borrowType: 0
      }],
      filter: {
        recordId: '',
        recordUserName: '',
        recordUserInCode: '',
        recordUserCode: '',
        managerDepartmentId: null
      },
      listLoading: false,

      recordList: [{
        id: 0,
        recordId: '',
        recordUserName: '',
        recordUserCode: '',
        recordUserInCode: '',
        recordManagerName: '',
        recordManagerCode: '',
        departmentName: '',
        departmentCode: '',
        createdTime: '',
        recordType: 0
      }],
      recordlistLoading: false,
      handOverPager: {},
      handOverInfoVisible: false,
      handOverRefuseLoading: false,
      handOverRefuseReason: '',
      handOverItemId: 0,

      recordInfo: { record: {
        id: 0,
        recordId: '',
        recordUserName: '',
        recordUserInCode: '',
        recordUserCode: '',
        managerDepartmentId: 0,
        managerUserId: 0,
        recordType: 0,
        creditDueDate: '',
        status: 0,
        departmentName: '',
        departmentCode: '',
        userCode: '',
        userName: ''
      }, recordFileTypeList: [{
        id: 0,
        name: '',
        remarks: '',
        children: []
      }]
      },
      infoVisible: false,

      returnPager: {},
      returnListLoading: false,
      returnList: [{
        id: 0,
        userName: '',
        userCode: '',
        departmentName: '',
        departmentCode: '',
        recordCount: 0,
        createdTime: '',
        borrowType: 0,
        children: []
      }],

      fileChangeLoading: false,
      changeData: [],
      fileChangePager: {},
      visibleChangeData: false,
      changeDetail: [],
      acceptLoading: false,
      refuseReason: '',
      innerVisible: false,
      refuseLoading: false,
      changeId: 0
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
    this.handOverPager = this.$refs.pager.getPager()
    this.returnPager = this.$refs.pager.getPager()
    this.fileChangePager = this.$refs.pager.getPager()
    this.onGetList()
    this.onHandOverGetList()
    this.onGetReturnList()
    this.onGetApplyChangeList()
    this.getDepartmentListPage()
  },
  methods: {
    changeDepartment: async function(node) {
      const id = {
        id: node.id
      }
      const res = await getUserSelect(id)
      this.userList = res.data
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
    // 获取部门列表填充部门下拉树
    async getDepartmentListPage() {
      const res = await getDepartmentList()
      if (res && res.success) {
        this.departments = listToTree(res.data)
      }
    },
    refuseHandOver: async function() {
      console.log(this.handOverRefuseReason)
      if (this.handOverRefuseReason) {
        this.handOverRefuseLoading = true

        const data = {
          id: this.handOverItemId,
          reason: this.handOverRefuseReason
        }

        console.log(data)
        const res = await refuseHandOver(data)
        this.handOverRefuseLoading = false

        if (res.success) {
          this.$message({
            message: '移交拒绝成功',
            type: 'success'
          })

          this.handOverInfoVisible = false
          this.infoVisible = false
          await this.onHandOverGetList()
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      } else {
        this.$message({
          message: '请输入拒绝原因',
          type: 'error'
        })
      }
    },
    acceptApply: async function() {
      this.acceptLoading = true

      const data = {
        id: this.changeId
      }
      const res = await acceptApplyChange(data)
      this.acceptLoading = false
      if (res.success) {
        this.$message({
          message: '审核通过成功',
          type: 'success'
        })
        this.visibleChangeData = false
        await this.onGetApplyChangeList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    refuseApply: async function() {
      if (this.refuseReason) {
        this.refuseLoading = true

        const data = {
          id: this.changeId,
          refuseReason: this.refuseReason
        }

        const res = await refuseApplyChange(data)
        this.refuseLoading = false

        if (res.success) {
          this.$message({
            message: '审核拒绝成功',
            type: 'success'
          })

          this.innerVisible = false
          this.visibleChangeData = false
          await this.onGetApplyChangeList()
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      } else {
        this.$message({
          message: '请输入拒绝原因',
          type: 'error'
        })
      }
    },
    getDetail: async function(index, row) {
      const param = {
        id: row.id
      }

      const res = await getApplyChangeDetail(param)

      if (res.success) {
        this.changeDetail = res.data
        this.visibleChangeData = true
        this.changeId = row.id
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    onGetApplyChangeList: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize
      }

      this.fileChangeLoading = true

      const res = await getApplyChangeList(para)

      this.fileChangeLoading = false

      if (res.success) {
        this.fileChangePager.total = res.data.total
        this.changeData = res.data.list
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
    returnRecord: async function(index, row) {
      row._loading = true
      const res = await returnRecord({ id: row.id })
      row._loading = false

      if (res.success) {
        this.$message({
          message: '归还成功!',
          type: 'success'
        })
        await this.onGetReturnList()
      } else {
        if (res.msg) {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        } else {
          this.$message({
            message: '出现未知错误，请刷新后重试',
            type: 'error'
          })
        }
      }
    },
    onGetReturnList: async function() {
      const para = {
        currentPage: this.returnPager.currentPage,
        pageSize: this.returnPager.pageSize
      }

      this.returnListLoading = true
      const res = await getReturnPage(para)
      this.returnListLoading = false

      if (res.success) {
        this.returnPager.total = res.data.total
        const list = _.cloneDeep(res.data.list)

        list.forEach(l => {
          l._loading = false
        })
        this.returnList = list
      } else {
        if (res.msg) {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        } else {
          this.$message({
            message: '出现未知错误，请刷新后重试',
            type: 'error'
          })
        }
      }
    },

    verifyBorrowApple: async function(verifyType) {
      const input = _.cloneDeep(this.verifyTemplate)
      input.verifyType = verifyType

      const res = await verifyBorrow(input)

      if (res.success) {
        this.$message({
          message: '审核成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
      this.borrowDetailVisible = false
      this.refuseReasonPageVisible = false
      await this.onGetList()
      Object.assign(this.verifyTemplate, { id: 0, verifyType: 0, refuseReason: '' })
    },

    handOverSubmit: async function() {
      if (this.recordInfo.recordFileTypeList.filter(i => {
        if (i.children.filter(a => a.checked === true).length > 0) {
          return i
        }
      }).length > 0) {
        const data = _.cloneDeep(this.recordInfo)
        const res = await handOverCheck(data)

        if (res.success) {
          this.$message({
            message: '同意移交成功!',
            type: 'success'
          })
          this.infoVisible = false
          await this.onHandOverGetList()
        } else {
          console.log(res)
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      } else {
        this.$message({
          message: '请选中移交文件再进行同意移交操作!',
          type: 'error'
        })
      }
    },

    async getRecordBasicInfo(index, row) {
      this.handOverItemId = row.id
      const res = await handOverBasicInfo({ id: row.id })
      if (!res.success && res.msg) {
        this.$message({
          message: res.msg,
          type: 'error'
        })
        return
      }
      this.recordInfo = res.data
      this.infoVisible = true
    },

    showBorrowDetailDialog: async function(id) {
      this.verifyTemplate.id = id
      const loading = this.$loading()
      const res = await getBorrowDetail({ id: id })
      loading.close()

      if (res.success) {
        this.borrowDetail = res.data
        this.borrowDetailVisible = true
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    closeBorrowDetailDialog: function() {
      this.borrowDetailVisible = false
    },
    // 获取列表
    onGetList: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize
      }
      this.listLoading = true
      const res = await getVerifyList(para)
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
      const list = _.cloneDeep(res.data.list)

      list.forEach(l => {
        l._loading = false
      })

      this.borrowItem = list
    },
    onSelectAll: function(selection) {
      const selections = selection
      const rows = this.borrowItem
      const checked = selections.length === rows.length
      rows.forEach(row => {
        this.$refs.borrowVerifyTable.toggleRowSelection(row, checked)
      })

      this.sels = this.$refs.multipleTable.selection
    },
    onSelect: function(selection, row) {
      const checked = selection.some(s => s.id === row.id)
      this.$refs.borrowVerifyTable.toggleRowSelection(row, checked)

      this.sels = this.$refs.borrowVerifyTable.selection
    },

    onHandOverGetList: async function() {
      const para = {
        currentPage: this.handOverPager.currentPage,
        pageSize: this.handOverPager.pageSize,
        filter: this.handOverFilter
      }
      this.recordlistLoading = true
      const res = await handOverPage(para)
      this.recordlistLoading = false

      if (!res.success) {
        if (res.msg) {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
        return
      }
      this.handOverPager.total = res.data.total
      const list = _.cloneDeep(res.data.list)

      list.forEach(l => {
        l._loading = false
      })

      this.recordList = list
    }
  }
}
</script>
<style>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>
