<template>
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
          <el-col :span="8">
            <el-form-item>
              <treeselect
                v-model="filter.managerDepartmentId"
                :multiple="false"
                :options="departments"
                :max-height="200"
                :flat="false"
                :default-expand-level="1"
                :normalizer="normalizer"
                placeholder="选择部门"
              />
            </el-form-item>
          </el-col>
          <el-col :span="22">
            <el-form-item>
              <el-button type="primary" @click="onGetList">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onAdd">新增</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addRecordBorrow(1)">调阅</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addRecordBorrow(0)">借阅</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-button type="primary" @click="showBorrowList">
              借调阅查看
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </template>

    <!--借调阅清单-->
    <el-drawer
      title="借调阅清单"
      :visible.sync="drawer"
      direction="rtl"
    >
      <el-collapse style="margin: 5px 5px">
        <el-collapse-item v-for="(item, arr) in borrowList" :key="item.id" :name="item.id">
          <template slot="title">
            <span class="collapse-title">
              {{ item.id }} - {{ borrowStatus(item.returnSign) }} {{ item.refuseReason ? '  拒绝原因：' + item.refuseReason : '' }}
              <el-link v-if="item.borrowType === 0" type="primary" style="float: right">借阅</el-link>
              <el-link v-if="item.borrowType === 1" type="success" style="float: right">调阅</el-link>
              <!--   <el-button style="float: right" size="large" type="text" @click.stop="addRecordFileType(item, editForm.fileList, arr)">添加</el-button>-->
            </span>
          </template>
          <el-button v-if="item.returnSign === 0" @click="cancelBorrow(borrowList, arr, item.id)">取消申请</el-button>
          <el-row v-for="record in item.recordBorrowItemList" :key="record.id">
            <el-col :span="24">
              档案用户: {{ record.record.recordUserName }} - {{ record.record.recordUserInCode }}
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              申请时间: {{ item.createdTime }}
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>
    </el-drawer>

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
      <el-table-column label="操作" width="240px" fixed="right">
        <template v-slot="{ $index, row }">
          <el-button @click="getRecordBasicInfo($index, row)">查看详情</el-button>
          <el-button @click="onEdit($index, row)">编辑</el-button>
          <confirm-button type="delete" :loading="row._loading" @click="onDelete($index, row)" />
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
    </template>

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
            value-format="yyyy-MM-dd"
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
                      value-format="yyyy-MM-dd"
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
                      value-format="yyyy-MM-dd"
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
                      value-format="yyyy-MM-dd"
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

    <!--编辑窗口-->
    <el-dialog
      v-model="editFormVisible"
      title="编辑"
      :visible.sync="editFormVisible"
      :close-on-click-modal="false"
      @close="onCloseEditForm"
    >
      <el-form ref="editForm" :model="editForm.record" label-width="150px" label-position="left" :rules="editFormRules">
        <el-form-item prop="recordUserName" label="档案用户姓名">
          <el-input v-model="editForm.record.recordUserName" auto-complete="off" />
        </el-form-item>
        <el-form-item label="客户内码" prop="recordUserInCode">
          <el-input v-model="editForm.record.recordUserInCode" auto-complete="off" />
        </el-form-item>

        <el-form-item label="客户码" prop="recordUserCode">
          <el-input v-model="editForm.record.recordUserCode" auto-complete="off" />
        </el-form-item>

        <el-form-item label="档案归属支行" prop="managerDepartmentId">
          <treeselect
            v-model="editForm.record.managerDepartmentId"
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
          <el-select v-model="editForm.record.managerUserId" placeholder="请选择">
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
          <el-radio-group v-model="editForm.record.recordType" @change="editRadioChange">
            <el-radio v-for="item in recordTypeList" :key="item.id" :label="item.id">{{ item.recordTypeName }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="授信到期日" prop="creditDueDate">
          <el-date-picker
            v-model="editForm.record.creditDueDate"
            type="date"
            size="mini"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-divider content-position="left">档案内容</el-divider>
        <el-row>
          <el-col :span="24">
            <el-collapse>
              <el-collapse-item v-for="(item, arr) in editForm.fileList" :key="item.uid" :name="item.uid">
                <template slot="title">
                  <span class="collapse-title">{{ item.name }} {{ item.remarks ? '-' + item.remarks : '' }} <el-button style="float: right" size="large" type="text" @click.stop="addRecordFileType(item, editForm.fileList, arr)">添加</el-button></span>
                </template>
                <el-row style="margin-bottom: 20px">
                  <el-col :span="4">
                    <span>备注项:</span>
                  </el-col>
                  <el-col :span="4">
                    <el-input v-model="item.remarks" auto-complete="off" />
                  </el-col>
                  <el-col :span="4" style="margin-left: 30px">
                    <el-button type="primary" icon="el-icon-delete" @click.stop="delRecordFileType(editForm.fileList, arr)">删除当前文件类型</el-button>
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
                      value-format="yyyy-MM-dd"
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
                      size="mini"
                      placeholder="选择日期"
                      value-format="yyyy-MM-dd"
                    />
                  </el-col>
                  <el-col :span="5" :offset="2">
                    <el-input-number v-if="child.checked" v-model="child.num" :min="1" label="份数" />
                  </el-col>
                </el-row>
                <el-row v-for="other in item.children.filter(i => i.otherSign === 1)" :key="other.guid" style="margin-bottom: 20px">
                  <el-col :span="8">
                    <el-input v-model="other.name" placeholder="请输入其他文件名称" />
                  </el-col>
                  <el-col :span="6" :offset="1">
                    <el-date-picker
                      v-if="other.name"
                      v-model="other.creditDueDate"
                      type="date"
                      size="mini"
                      placeholder="选择日期"
                      value-format="yyyy-MM-dd"
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
          <el-button @click.native="editFormVisible = false">取消</el-button>
          <confirm-button type="submit" :validate="editFormValidate" :loading="editLoading" @click="onEditSubmit" />
        </div>
      </template>
    </el-dialog>

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
          <span>{{ recordTypeList.filter(i => { return i.id === recordInfo.record.recordType }).length > 0 ? recordTypeList.filter(i => { return i.id === recordInfo.record.recordType })[0].recordTypeName : '未知类型' }}</span>
        </el-col>
      </el-row>
      <el-divider content-position="left">档案文件</el-divider>
      <el-row v-for="item in usedRecordFileType" :key="item.id" style="margin: 20px;">
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
            <el-col :span="2" style="margin-bottom: 20px;margin-top: 20px"><el-checkbox v-if="recordFile.handOverSign" v-model="recordFile.checked" /></el-col>
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
          <el-button @click.native="superAddition">更换文件</el-button>
          <el-button @click.native="historyVisible = true">查看档案历史</el-button>
          <el-button @click.native="printPage(recordInfo.record.id)">打印清单</el-button>
        </div>
      </template>
    </el-dialog>

    <!--  档案历史查看  -->
    <el-dialog
      v-model="historyVisible"
      title="档案历史"
      :visible.sync="historyVisible"
      :close-on-click-modal="true"
      append-to-body
    >
      <el-timeline v-for="item in recordHistory" :key="item.id">
        <el-timeline-item :timestamp="item.createdTime" placement="top">
          <el-card>
            <h4>{{ item.operateType }}</h4>
            <div v-html="item.operateInfo" />
            <p>操作人:{{ item.createdUserName }}-{{ item.createdUserId }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <div slot="footer" class="dialog-footer">
        <el-button @click="historyVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 档案补充提交-->
    <el-dialog v-model="visibleAdditionalPage" :visible.sync="visibleAdditionalPage" title="档案补充提交界面" width="60%">
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <span>档案号:</span>
        </el-col>
        <el-col :span="6">
          <span>{{ recordAdditionInfo.record.recordId }}</span>
        </el-col>
        <el-col :span="6">
          <span>档案用户姓名:</span>
        </el-col>
        <el-col :span="6">
          <span>{{ recordAdditionInfo.record.recordUserName }}</span>
        </el-col>
      </el-row>
      <el-divider />
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <span>档案用户客户号:</span>
        </el-col>
        <el-col :span="6">
          <span>{{ recordAdditionInfo.record.recordUserCode }}</span>
        </el-col>
        <el-col :span="6">
          <span>档案用户客户内码:</span>
        </el-col>
        <el-col :span="6">
          <span>{{ recordAdditionInfo.record.recordUserInCode }}</span>
        </el-col>
      </el-row>
      <el-divider />
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <span>归管支行:</span>
        </el-col>
        <el-col :span="6">
          <span>{{ recordAdditionInfo.record.departmentName }}</span>
        </el-col>
        <el-col :span="6">
          <span>归管客户经理:</span>
        </el-col>
        <el-col :span="6">
          <span>{{ recordAdditionInfo.record.userCode }}-{{ recordAdditionInfo.record.userName }}</span>
        </el-col>
      </el-row>
      <el-divider />
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <span>授信到期日:</span>
        </el-col>
        <el-col :span="6">
          <span>{{ recordAdditionInfo.record.creditDueDate }}</span>
        </el-col>
        <el-col :span="6">
          <span>档案类型:</span>
        </el-col>
        <el-col :span="6">
          <span>{{ recordTypeList.filter(i => { return i.id === recordAdditionInfo.record.recordType }).length > 0 ? recordTypeList.filter(i => { return i.id === recordAdditionInfo.record.recordType })[0].recordTypeName : '未知类型' }}</span>
        </el-col>
      </el-row>
      <el-divider content-position="left">档案文件</el-divider>
      <el-row>
        <el-col :span="24">
          <el-collapse>
            <el-collapse-item v-for="(item, arr) in recordAdditionInfo.recordFileTypeList" :key="item.uid" :name="item.uid">
              <template slot="title">
                <span class="collapse-title">{{ item.name }} {{ item.remarks ? '-' + item.remarks : '' }}
                  <el-button
                    style="float: right"
                    size="large"
                    type="text"
                    @click.stop="addRecordFileType(item, recordAdditionInfo.recordFileTypeList, arr)"
                  >添加</el-button></span>
              </template>
              <el-row style="margin-bottom: 20px">
                <el-col :span="4">
                  <span>备注项:</span>
                </el-col>
                <el-col :span="4">
                  <el-input v-model="item.remarks" auto-complete="off" />
                </el-col>
                <el-col :span="4" style="margin-left: 30px">
                  <el-button type="primary" icon="el-icon-delete" @click.stop="delRecordFileType(recordAdditionInfo.recordFileTypeList, arr)">删除当前文件类型</el-button>
                </el-col>
              </el-row>
              <el-row v-for="child in item.children.filter(i => i.otherSign === 0)" :key="child.uid" style="margin-bottom: 20px;">
                <el-col :span="4">
                  <el-checkbox v-model="child.checked" :label="child.name" border />
                </el-col>
                <el-col :span="7">
                  <el-date-picker
                    v-if="child.checked"
                    v-model="child.creditDueDate"
                    type="date"
                    size="mini"
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
                  />
                </el-col>
                <el-col :span="5" :offset="2">
                  <el-input-number v-if="child.checked" v-model="child.num" :min="1" label="份数" />
                </el-col>
              </el-row>
              <el-row v-for="other in item.children.filter(i => i.otherSign === 1)" :key="other.guid" style="margin-bottom: 20px">
                <el-col :span="3">
                  <el-input v-model="other.name" placeholder="请输入其他文件名称" />
                </el-col>
                <el-col :span="6" :offset="1">
                  <el-date-picker
                    v-if="other.name"
                    v-model="other.creditDueDate"
                    type="date"
                    size="mini"
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
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
      <template #footer>
        <div class="dialog-footer">
          <el-button @click.native="visibleAdditionalPage = false">取消</el-button>
          <confirm-button type="submit" :loading="addAdditionVisible" @click="addAdditionInfo" />
        </div>
      </template>
    </el-dialog>

    <!-- 档案主动更换-->
    <el-dialog v-model="visibleChangeData" :visible.sync="visibleChangeData" title="主动更换文件" width="60%">
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
                    value-format="yyyy-MM-dd"
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
  </container>
</template>

<script>
import { formatTime, listToTree } from '@/utils'
import { getRecordList, addRecord, deleteRecord, updateRecord, getRecordBasicInfo, getRecordAdditionalInfo, getEditPageReturn, addRecordAdditionalInfo, applyChangeFile } from '@/api/record/record'
import { getRecordTypeList } from '@/api/record/recordtype'
import { updateRecordPageList, addRecordPageList } from '@/api/record/recordfiletype'
import { getUserSelect } from '@/api/admin/user'
import ConfirmButton from '@/components/ConfirmButton'
import Pagination from '@/components/Pagination'
import Container from '@/components/Container/index'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getDepartmentList } from '@/api/admin/department'
import { getRecordHistoryList } from '@/api/record/recordhistory'
import { addRecordBorrow, getBorrowList, cancelRecordBorrow } from '@/api/record/recordborrow'

export default {
  name: 'Record',
  components: {
    Container,
    Pagination,
    ConfirmButton,
    Treeselect
  },
  data() {
    return {
      filter: {
        recordId: '',
        recordUserName: '',
        recordUserInCode: '',
        recordUserCode: '',
        managerDepartmentId: null
      },
      drawer: false,
      borrowList: [{
        id: 0,
        borrowType: 0,
        refuseReason: '',
        returnSign: 0,
        createdTime: '',
        recordBorrowItemList: []
      }],
      recordHistory: [
        { id: 0, operateType: '', operateInfo: '', createdUserName: '', createdTime: '', createdUserId: '' }
      ],
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
      addAdditionVisible: false,
      recordAdditionInfo: { record: {
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
        uid: '',
        checkedRecordFileTypeId: 0,
        recordFileTypeId: 0,
        name: '',
        remarks: '',
        children: []
      }]
      },
      visibleAdditionalPage: false,
      recordList: [],
      departments: [],
      expandRowKeys: [],
      listLoading: false,
      pager: {},
      sels: [], // 列表选中列
      infoVisible: false,
      historyVisible: false,

      normalizer(node) {
        return {
          id: node.id,
          label: node.departmentName,
          children: node.children
        }
      },
      userList: [],
      recordTypeList: [{ id: 0, recordTypeName: '' }],
      recordType: 0,
      editFormVisible: false, // 编辑界面是否显示
      editLoading: false,
      editFormRules: {
        recordUserName: [{ required: true, message: '请输入档案用户姓名', trigger: 'blur' }],
        recordUserInCode: [{ required: true, message: '请输入客户内码', trigger: 'blur' }],
        recordUserCode: [{ required: true, message: '请输入客户码', trigger: 'blur' }],
        managerDepartmentId: [{ required: true, message: '请输入档案归属部门', trigger: 'blur' }],
        managerUserId: [{ required: true, message: '请输入档案归属客户经理', trigger: 'blur' }],
        recordType: [{ required: true, message: '请选择档案类型', trigger: 'change' }],
        creditDueDate: [{ required: true, message: '请输入授信到期日', trigger: 'change' }]
      },
      // 编辑界面数据
      editForm: {
        record: {
          id: 0,
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
      changeData: [],
      visibleChangeData: false,
      changeDataSubmit: false
    }
  },
  computed: {
    usedRecordFileType: function() {
      return this.recordInfo.recordFileTypeList.filter(i => {
        if (JSON.stringify(i.children) !== '[]') {
          return i
        }
      })
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
    this.onGetList()
    this.getDepartmentListPage()
    this.getRecordTypeList()
  },
  methods: {
    changeDataSub: async function() {
      this.changeDataSubmit = true
      const param = {
        type: 1,
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
    superAddition: async function() {
      var sign = false
      this.usedRecordFileType.forEach(i => {
        if (i.children.filter(j => j.checked === true).length > 0) {
          sign = true
        }
      })
      if (!sign) {
        this.$message({
          message: '请勾选想要主动更换的文件之后再进行操作',
          type: 'error'
        })
      } else {
        const data = this.usedRecordFileType.filter(i => i.children.filter(j => j.checked === true).length > 0)
        this.changeData = _.cloneDeep(data)
        this.changeData.forEach(i => {
          i.children = i.children.filter(j => j.checked === true)
        })
        // this.changeData.forEach(i => {
        //   i.children.forEach(j => {
        //     j.creditDueDate = ''
        //   })
        // })
        this.visibleChangeData = true
        console.log(this.changeData)
      }
    },
    unionSetDate: function(event, item) {
      item.children.forEach(i => {
        i.creditDueDate = event
      })
    },
    unionDateSet: function(name) {
      return name === '权证类' || name === '贷款业务要件类' || name === '承兑业务要件类' || name === '贴现业务要件类' || name === '保函业务要件类'
    },
    changeDepartment: async function(node) {
      const id = {
        id: node.id
      }
      const res = await getUserSelect(id)
      this.userList = res.data
    },
    async getRecordBasicInfo(index, row) {
      const res = await getRecordBasicInfo({ id: row.id })
      const res2 = await getRecordHistoryList({ id: row.id })
      if (!res.success && res.msg) {
        this.$message({
          message: res.msg,
          type: 'error'
        })
        return
      }
      this.recordInfo = res.data
      this.infoVisible = true
      this.recordHistory = res2.data
    },
    printPage: function(id) {
      const { href } = this.$router.resolve({
        name: 'print',
        path: '/print',
        query: { id: id }
      })
      window.open(href, '_blank')
    },
    cancelBorrow: async function(item, index, id) {
      const res = await cancelRecordBorrow({ id: id })

      if (res.success) {
        // item.splice(index, 1)
        item[index].returnSign = 3
        this.$message({
          message: '取消申请成功',
          type: 'info'
        })
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    showBorrowList: async function() {
      const res = await getBorrowList()
      if (res.success) {
        this.borrowList = res.data
        this.drawer = true
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    addRecordBorrow: async function(type) {
      if (this.sels.length === 0) {
        this.$message({
          message: '请勾选档案后再点击操作',
          type: 'error'
        })
      } else {
        const idList = []
        let sign = false
        this.sels.forEach(i => {
          if (i.status !== 1) {
            sign = true
          } else {
            idList.push(i.id)
          }
        })
        if (sign) {
          this.$message({
            message: '请勾选在库状态的档案,重新勾选后再进行操作!',
            type: 'error'
          })
        } else {
          const obj = {
            borrowType: type,
            recordBorrowItemIdList: idList,
            returnSign: 0
          }
          const res = await addRecordBorrow(obj)
          if (res && res.success) {
            this.$message({
              message: '申请成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: res.msg,
              type: 'error'
            })
          }
        }
      }
    },
    addAdditionInfo: async function() {
      this.addAdditionVisible = true
      const obj = _.cloneDeep(this.recordAdditionInfo)

      const res = await addRecordAdditionalInfo(obj)
      this.addAdditionVisible = false
      if (res.success) {
        this.$message({
          message: this.$t('admin.addOk'),
          type: 'success'
        })
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
      this.visibleAdditionalPage = false
    },

    showAdditionPage: async function(row) {
      if (row.status === 1) {
        this.$message({
          message: '当前档案处于待移交状态，无需补充提交，可直接进行档案编辑',
          type: 'info'
        })
      } else {
        const res = await getRecordAdditionalInfo({ id: row.id })
        if (!res.success) {
          if (res.msg) {
            this.$message({
              message: res.msg,
              type: 'error'
            })
          }
          return
        }
        this.recordAdditionInfo = res.data
        this.visibleAdditionalPage = true
      }
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
    editRadioChange: async function(val) {
      const res = await updateRecordPageList({ id: val, recordId: this.editForm.record.id })
      this.editForm.fileList = res.data
    },
    getRecordTypeList: async function() {
      const res = await getRecordTypeList()
      this.recordTypeList = res.data
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
    borrowStatus: function(statu) {
      if (statu === 0) {
        return '待审核'
      } else if (statu === 1) {
        return '审核通过'
      } else if (statu === 2) {
        return '拒绝'
      } else if (statu === 3) {
        return '取消申请'
      } else if (statu === 4) {
        return '归还'
      }
    },
    // 合同下文件份数变更(需满足合同下文件份数小于等于文件份数)
    addNum: function(currentValue, oldValue, parent, contractId) {
      const sumNum = parent.contract ? parent.contract.reduce(function(total, currentValue, currentIndex, arr) {
        return total + currentValue.num
      }, 0) : 0
      if (sumNum > parent.num) {
        this.$alert('合同文件数量总和不能超过该文件的数量', '提示', {
          confirmButtonText: '确定'
        })
        this.$nextTick(() => {
          const item = parent.contract.filter(o => o.id === contractId)
          item[0].num = oldValue
        })
      }
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
    // 删除其他文件
    deleteOther(parent, id) {
      parent.children = parent.children.filter(o => o.uid !== id)
    },
    formatCreatedTime: function(row, column, time) {
      return formatTime(time, 'yyyy-MM-dd hh:mm')
    },
    // 显示编辑界面
    async onEdit(index, row) {
      const loading = this.$loading()
      if (this.departments.length === 0) {
        await this.getDepartmentListPage()
      }
      await this.getUserSelect(row.managerDepartmentId)
      const res = await getEditPageReturn({ id: row.id })
      loading.close()
      if (res && res.success) {
        if (res.msg === '编辑界面') {
          this.editForm.record = res.data
          this.editFormVisible = true
          await this.editRadioChange(this.editForm.record.recordType)
        } else {
          this.recordAdditionInfo = res.data
          this.visibleAdditionalPage = true
        }
      }
    },
    // 获取部门列表填充部门下拉树
    async getDepartmentListPage() {
      const res = await getDepartmentList()
      if (res && res.success) {
        this.departments = listToTree(res.data)
      }
    },
    // 获取档案列表
    onGetList: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize,
        filter: this.filter
      }
      this.listLoading = true
      const res = await getRecordList(para)
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
      this.recordList = data
    },
    // 关闭编辑界面
    onCloseEditForm() {
      this.$refs.editForm.resetFields()
      this.editForm.fileList = []
    },
    // 编辑
    editFormValidate: function() {
      let isValid = false
      this.$refs.editForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    // 编辑档案界面提交
    async onEditSubmit() {
      this.editLoading = true
      const para = _.cloneDeep(this.editForm)

      const res = await updateRecord(para)
      this.editLoading = false
      if (res.success) {
        this.$message({
          message: this.$t('admin.updateOk'),
          type: 'success'
        })
        this.$refs['editForm'].resetFields()
        this.editForm.fileList = []
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
    async onAdd() {
      if (this.departments.length === 0) {
        await this.getDepartmentListPage()
      }
      // if (this.userList.length === 0) {
      //   await this.getUserSelect()
      // }
      this.addForm.fileList = []
      this.addFormVisible = true
      // this.addForm.record.recordType = 1
    },
    // 关闭添加档案界面
    onCloseAddForm() {
      this.$refs.addForm.resetFields()
    },
    // 新增字段验证
    addFormValidate: function() {
      let isValid = false
      this.$refs.addForm.validate(valid => {
        isValid = valid
      })
      return isValid
    },
    // 添加档案界面提交
    async onAddSubmit() {
      this.addLoading = true
      const para = _.cloneDeep(this.addForm)

      const res = await addRecord(para)
      this.addLoading = false

      if (res.success) {
        this.$message({
          message: this.$t('admin.addOk'),
          type: 'success'
        })
        this.$refs['addForm'].resetFields()
        this.addForm.fileList = []
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
      const res = await deleteRecord(para)

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
  .collapse-title {
    flex: 1 0 90%;
    order: 1;
  }

  .el-collapse-item__header {
    flex: 1 0 auto;
    order: -1;
  }
</style>
