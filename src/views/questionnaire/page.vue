<template>
  <el-tabs tab-position="top">
    <el-tab-pane label="未评审列表">
      <container>
        <template #header>
          <!--查询-->
          <el-form :inline="true" :model="filter" @submit.native.prevent>
            <el-row>
              <el-col :span="4">
                <el-form-item>
                  <el-input v-model="filter.headUserName" placeholder="户主姓名">
                    <template #prefix>
                      <i class="el-input__icon el-icon-search" />
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item>
                  <el-input v-model="filter.headIdNumber" placeholder="户主身份证">
                    <template #prefix>
                      <i class="el-input__icon el-icon-search" />
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <el-button type="primary" @click="onGetHouseHoldList">查询</el-button>
                </el-form-item>
                <!-- <el-form-item>
                  <el-button type="primary">新增</el-button>
                </el-form-item> -->
              </el-col>
            </el-row>
          </el-form>
        </template>
        <!-- 列表 -->
        <el-table
          ref="surveyTable"
          v-loading="listLoading"
          row-key="id"
          :data="surveyList"
          :default-expand-all="false"
          highlight-current-row
          border
          style="width: 100%;"
        >
          <el-table-column prop="id" width="150" label="户号" />
          <el-table-column prop="userName" label="户主姓名" />
          <el-table-column prop="address" label="居住地址" />
          <el-table-column prop="idNumber" label="身份证号" />
          <el-table-column label="操作" width="120px" fixed="right">
            <template v-slot="{ $index, row }">
              <el-button icon="el-icon-info" type="primary" @click="addAppraise($index, row)">公议评价</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog title="详细信息添加" :visible.sync="addFormVisible" width="80%" :close-on-click-modal="false">
          <el-form ref="surveyForm" label-width="150px" label-position="left">
            <el-divider content-position="left">第一部分</el-divider>
            <el-row v-for="item in addForm.members" :key="item.idNumber" style="margin-bottom: 20px;">
              <el-col :span="4">
                <span>{{ item.userName }}</span>
              </el-col>
              <el-col :span="10">
                <span>{{ item.idNumber }}</span>
              </el-col>
              <el-col :span="4">
                <span>{{ item.relation }}</span>
              </el-col>
              <el-col :span="6">
                <el-checkbox v-model="item.longStay" label="是否村内常住" border />
              </el-col>
            </el-row>
            <el-divider content-position="left">第二部分</el-divider>
            <el-form-item label="家庭无固定收入">
              <el-radio v-model="addForm.instability" :label="true">是</el-radio>
              <el-radio v-model="addForm.instability" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="家庭成员欠债不还或有赖账">
              <el-radio v-model="addForm.repudiate" :label="true">是</el-radio>
              <el-radio v-model="addForm.repudiate" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="家庭成员品德较差">
              <el-radio v-model="addForm.reputation" :label="true">是</el-radio>
              <el-radio v-model="addForm.reputation" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="家庭成员涉嫌赌博行为">
              <el-radio v-model="addForm.gamble" :label="true">是</el-radio>
              <el-radio v-model="addForm.gamble" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="家庭成员存在民间借贷">
              <el-radio v-model="addForm.lending" :label="true">是</el-radio>
              <el-radio v-model="addForm.lending" :label="false">否</el-radio>
            </el-form-item>
            <el-divider v-if="displaySign" content-position="left">第三部分</el-divider>
            <el-row v-if="displaySign">
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭自建房产情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.selfBuilding" :label="true">有</el-radio>
                <el-radio v-model="addForm.selfBuilding" :label="false">无</el-radio>
              </el-col>
              <el-col v-if="addForm.selfBuilding" :span="24" style="margin-bottom: 10px;">
                <el-checkbox v-model="addForm.bungalow" label="平房" border style="margin-right: 20px;" />
                <el-input-number v-model="addForm.bungalowCount" />
              </el-col>
              <el-col v-if="addForm.selfBuilding" :span="24" style="margin-bottom: 10px;">
                <el-checkbox v-model="addForm.building" label="楼房" border style="margin-right: 20px;" />
                <el-input-number v-model="addForm.buildingCount" />
              </el-col>
              <el-col v-if="addForm.selfBuilding" :span="24" style="margin-bottom: 10px;">
                <el-checkbox v-model="addForm.cottage" label="别墅" border style="margin-right: 20px;" />
                <el-input-number v-model="addForm.cottageCount" />
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭商品房情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.goodsBuilding" :label="true">有</el-radio>
                <el-radio v-model="addForm.goodsBuilding" :label="false">无</el-radio>
                <el-input-number v-if="addForm.goodsBuilding" v-model="addForm.goodsBuildingCount" />
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭汽车拥有情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.carHold" :label="true">有</el-radio>
                <el-radio v-model="addForm.carHold" :label="false">无</el-radio>
                <el-input-number v-if="addForm.carHold" v-model="addForm.carHoldCount" />
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭负债情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="addForm.debtCondition" placeholder="家庭银行负债、民间负债金额">
                  <template slot="append">万元</template>
                </el-input>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭年收入</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="addForm.homeEarning" placeholder="家庭所有成员年收入金额">
                  <template slot="append">万元</template>
                </el-input>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭年支出</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="addForm.homePay" placeholder="家庭年支出金额，主要包括日常支出、子女就学、建房、婚嫁">
                  <template slot="append">万元</template>
                </el-input>
              </el-col>
            </el-row>
            <el-divider v-if="displaySign" content-position="left">第四部分</el-divider>
            <el-row v-if="displaySign">
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在家庭收入不稳定的情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.condition1" :label="true">是</el-radio>
                <el-radio v-model="addForm.condition1" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭存在严重疾病等重大负担</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.condition2" :label="true">是</el-radio>
                <el-radio v-model="addForm.condition2" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在家庭关系不和睦、邻里关系紧张、与村民关系不融洽等情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.condition3" :label="true">是</el-radio>
                <el-radio v-model="addForm.condition3" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在不遵守村规民约、不配合村组织工作开展的情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.condition4" :label="true">是</el-radio>
                <el-radio v-model="addForm.condition4" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在不守信、恶意拖欠水电气费等不诚信行为</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.condition5" :label="true">是</el-radio>
                <el-radio v-model="addForm.condition5" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在其他工作及生活情况需要重点说明的</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="addForm.remarks" type="textarea" autosize placeholder="请输入内容" />
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="addFormVisible = false">取 消</el-button>
            <confirm-button type="other" :loading="addFormLoading" button-text-string="提交" content="提交之后无法更改" @click="addAppraiseClick" />
            <!--<el-button type="primary" @click="submitFun">提交</el-button>-->
          </div>
        </el-dialog>
        <template #footer>
          <pagination
            ref="pager"
            :page.sync="pager.currentPage"
            :size.sync="pager.pageSize"
            :total="pager.total"
            @get-page="onGetHouseHoldList"
          />
        </template>
      </container>
    </el-tab-pane>
    <el-tab-pane label="已评审列表">
      <container>
        <el-table
          ref="surveyTable2"
          v-loading="appraiseListLoading"
          row-key="id"
          :data="appraiseList"
          :default-expand-all="false"
          highlight-current-row
          border
          style="width: 100%;"
        >
          <el-table-column prop="id" width="50" label="ID" />
          <el-table-column prop="userName" label="户主姓名" />
          <el-table-column prop="address" label="居住地址" />
          <el-table-column prop="idNumber" label="身份证号" />
          <el-table-column label="操作" width="120px" fixed="right">
            <template v-slot="{ $index, row }">
              <el-button icon="el-icon-info" type="primary" @click="appraiseDetail($index, row)">已评价</el-button>
            </template>
          </el-table-column>
        </el-table>
        <template #footer>
          <pagination
            ref="pager"
            :page.sync="appraisePager.currentPage"
            :size.sync="appraisePager.pageSize"
            :total="appraisePager.total"
            @get-page="onGetAppraiseList"
          />
        </template>
        <el-dialog title="信息查看" :visible.sync="detailVisible" width="80%">
          <el-form ref="surveyForm2" label-width="200px" label-position="left">
            <el-divider content-position="left">第一部分</el-divider>
            <el-row v-for="item in detailForm.members" :key="item.idNumber" style="margin-bottom: 20px;">
              <el-col :span="4">
                <span>{{ item.userName }}</span>
              </el-col>
              <el-col :span="10">
                <span>{{ item.idNumber }}</span>
              </el-col>
              <el-col :span="4">
                <span>{{ item.relation }}</span>
              </el-col>
              <el-col :span="6">
                <span>{{ item.longStay ? '村内常住' : '村内不常住' }}</span>
              </el-col>
            </el-row>
            <el-divider content-position="left">第二部分</el-divider>
            <el-form-item label="家庭无固定收入">
              <span>{{ detailForm.instability ? '是' : '否' }}</span>
              <!-- <el-radio v-model="addForm.instability" :label="true">是</el-radio>
              <el-radio v-model="addForm.instability" :label="false">否</el-radio> -->
            </el-form-item>
            <el-form-item label="家庭成员欠债不还或有赖账">
              <span>{{ detailForm.repudiate ? '是' : '否' }}</span>
              <!-- <el-radio v-model="addForm.repudiate" :label="true">是</el-radio>
              <el-radio v-model="addForm.repudiate" :label="false">否</el-radio> -->
            </el-form-item>
            <el-form-item label="家庭成员品德较差">
              <span>{{ detailForm.reputation ? '是' : '否' }}</span>
              <!-- <el-radio v-model="addForm.reputation" :label="true">是</el-radio>
              <el-radio v-model="addForm.reputation" :label="false">否</el-radio> -->
            </el-form-item>
            <el-form-item label="家庭成员涉嫌赌博行为">
              <span>{{ detailForm.gamble ? '是' : '否' }}</span>
              <!-- <el-radio v-model="addForm.gamble" :label="true">是</el-radio>
              <el-radio v-model="addForm.gamble" :label="false">否</el-radio> -->
            </el-form-item>
            <el-form-item label="家庭成员存在民间借贷">
              <span>{{ detailForm.lending ? '是' : '否' }}</span>
              <!-- <el-radio v-model="addForm.lending" :label="true">是</el-radio>
              <el-radio v-model="addForm.lending" :label="false">否</el-radio> -->
            </el-form-item>
            <el-divider v-if="displaySignDetail" content-position="left">第三部分</el-divider>
            <el-row v-if="displaySignDetail">
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭自建房产情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="detailForm.selfBuilding" :label="true">有</el-radio>
                <el-radio v-model="detailForm.selfBuilding" :label="false">无</el-radio>
              </el-col>
              <el-col v-if="detailForm.selfBuilding" :span="24" style="margin-bottom: 10px;">
                <el-checkbox v-model="detailForm.bungalow" label="平房" border style="margin-right: 20px;" />
                <el-input-number v-model="detailForm.bungalowCount" />
              </el-col>
              <el-col v-if="detailForm.selfBuilding" :span="24" style="margin-bottom: 10px;">
                <el-checkbox v-model="detailForm.building" label="楼房" border style="margin-right: 20px;" />
                <el-input-number v-model="detailForm.buildingCount" />
              </el-col>
              <el-col v-if="detailForm.selfBuilding" :span="24" style="margin-bottom: 10px;">
                <el-checkbox v-model="detailForm.cottage" label="别墅" border style="margin-right: 20px;" />
                <el-input-number v-model="detailForm.cottageCount" />
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭商品房情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="detailForm.goodsBuilding" :label="true">有</el-radio>
                <el-radio v-model="detailForm.goodsBuilding" :label="false">无</el-radio>
                <el-input-number v-if="detailForm.goodsBuilding" v-model="detailForm.goodsBuildingCount" />
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭汽车拥有情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="detailForm.carHold" :label="true">有</el-radio>
                <el-radio v-model="detailForm.carHold" :label="false">无</el-radio>
                <el-input-number v-if="detailForm.carHold" v-model="detailForm.carHoldCount" />
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭负债情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="detailForm.debtCondition" placeholder="家庭银行负债、民间负债金额">
                  <template slot="append">万元</template>
                </el-input>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭年收入</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="detailForm.homeEarning" placeholder="家庭所有成员年收入金额">
                  <template slot="append">万元</template>
                </el-input>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭年支出</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="detailForm.homePay" placeholder="家庭年支出金额，主要包括日常支出、子女就学、建房、婚嫁">
                  <template slot="append">万元</template>
                </el-input>
              </el-col>
            </el-row>
            <el-divider v-if="displaySignDetail" content-position="left">第四部分</el-divider>
            <el-row v-if="displaySignDetail">
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在家庭收入不稳定的情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="detailForm.condition1" :label="true">是</el-radio>
                <el-radio v-model="detailForm.condition1" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭存在严重疾病等重大负担</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="detailForm.condition2" :label="true">是</el-radio>
                <el-radio v-model="detailForm.condition2" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在家庭关系不和睦、邻里关系紧张、与村民关系不融洽等情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="detailForm.condition3" :label="true">是</el-radio>
                <el-radio v-model="detailForm.condition3" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在不遵守村规民约、不配合村组织工作开展的情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="detailForm.condition4" :label="true">是</el-radio>
                <el-radio v-model="detailForm.condition4" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在不守信、恶意拖欠水电气费等不诚信行为</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="detailForm.condition5" :label="true">是</el-radio>
                <el-radio v-model="detailForm.condition5" :label="false">否</el-radio>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>存在其他工作及生活情况需要重点说明的</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="detailForm.remarks" type="textarea" autosize placeholder="请输入内容" />
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="detailVisible = false">返  回</el-button>
          </div>
        </el-dialog>
      </container>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Container from '@/components/Container/index'
import Pagination from '@/components/Pagination/index'
import ConfirmButton from '@/components/ConfirmButton'
import { getHouseHoldPage } from '@/api/questionnaire/household'
import { getAppraisePage, getAppraiseDetail, addAppraise, getAddInfoReturn } from '@/api/questionnaire/appraise'
export default {
  name: 'Page',
  components: {
    Container,
    Pagination,
    ConfirmButton
  },
  data() {
    return {
      // Query conditions
      filter: {
        userName: '',
        idNumber: ''
      },
      // pager field
      pager: {},

      appraisePager: {},

      // Table data
      surveyList: [],
      // Table loading field
      listLoading: false,
      // field judge the dialog hide or show up
      dialogVisible: false,

      // 已评价列表
      appraiseList: [],
      appraiseListLoading: false,

      addForm: {
        members: [],
        instability: false,
        repudiate: false,
        reputation: false,
        gamble: false,
        lending: false,
        selfBuilding: false,
        // 平房
        bungalow: false,
        // 楼房
        building: false,
        // 别墅
        cottage: false,
        bungalowCount: 1,
        buildingCount: 1,
        cottageCount: 1,

        // 商品房持有
        goodsBuilding: false,
        goodsBuildingCount: 1,

        // 汽车持有
        carHold: false,
        carHoldCount: 1,

        // 负债情况
        debtCondition: null,

        // 家庭收入
        homeEarning: null,

        // 家庭支出
        homePay: null,

        condition1: false,
        condition2: false,
        condition3: false,
        condition4: false,
        condition5: false,

        remarks: ''
      },
      addFormVisible: false,
      addFormLoading: false,

      detailForm: {
        members: [],
        instability: false,
        repudiate: false,
        reputation: false,
        gamble: false,
        lending: false,
        selfBuilding: false,
        // 平房
        bungalow: true,
        // 楼房
        building: false,
        // 别墅
        cottage: false,
        bungalowCount: 2,
        buildingCount: 1,
        cottageCount: 1,

        // 商品房持有
        goodsBuilding: false,
        goodsBuildingCount: 1,

        // 汽车持有
        carHold: false,
        carHoldCount: 1,

        // 负债情况
        debtCondition: null,

        // 家庭收入
        homeEarning: null,

        // 家庭支出
        homePay: null,

        condition1: false,
        condition2: false,
        condition3: false,
        condition4: false,
        condition5: false,

        remarks: null
      },
      detailVisible: false
    }
  },
  computed: {
    displaySign: function() {
      return !(this.addForm.instability || this.addForm.repudiate || this.addForm.reputation || this.addForm.gamble || this.addForm.lending)
    },
    displaySignDetail: function() {
      return !(this.detailForm.instability || this.detailForm.repudiate || this.detailForm.reputation || this.detailForm.gamble || this.detailForm.lending)
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
    this.appraisePager = this.$refs.pager.getPager()
    this.onGetHouseHoldList()
    this.onGetAppraiseList()
  },
  methods: {
    // 添加评价
    addAppraiseClick: async function() {
      this.addFormLoading = true
      const data = _.cloneDeep(this.addForm)

      if (data.instability || data.repudiate || data.reputation || data.gamble || data.lending) {
        console.log(123)
      } else {
        // 拥有自建房的情况下要求必须勾选其中一个房屋类型
        if (data.selfBuilding) {
          if (data.bungalow || data.building || data.cottage) {
            console.log('test')
          } else {
            this.$message({
              message: '请勾选房产类型及输入房产数目!',
              type: 'error'
            })
            this.addFormLoading = false
            return
          }
        }
        // 负债情况
        if (data.debtCondition == null) {
          this.$message({
            message: '负债情况为必填项!',
            type: 'error'
          })
          this.addFormLoading = false
          return
        }
        // 家庭收入情况
        if (data.homeEarning == null) {
          this.$message({
            message: '家庭收入情况为必填项!',
            type: 'error'
          })
          this.addFormLoading = false
          return
        }
        // 家庭支出
        if (data.homePay == null) {
          this.$message({
            message: '家庭支出情况为必填项!',
            type: 'error'
          })
          this.addFormLoading = false
          return
        }
      }

      const res = await addAppraise(data)
      this.addFormLoading = false

      if (res.success) {
        this.$message({
          message: '评价成功!',
          type: 'success'
        })
        this.addFormVisible = false
        this.addForm = this.$options.data().addForm
        await this.onGetHouseHoldList()
        await this.onGetAppraiseList()
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 已评价详情查看
    appraiseDetail: async function(index, row) {
      row._loading = true
      const res = await getAppraiseDetail({ id: row.id })
      row._loading = false

      if (res.success) {
        this.detailForm = res.data
        this.detailVisible = true
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    // 获取已评价分页
    onGetAppraiseList: async function() {
      const para = {
        currentPage: this.appraisePager.currentPage,
        pageSize: this.appraisePager.pageSize
      }
      this.appraiseListLoading = true
      const res = await getAppraisePage(para)
      this.appraiseListLoading = false

      if (!res.success) {
        if (res.msg) {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
        return
      }

      this.appraisePager.total = res.data.total
      const data = _.cloneDeep(res.data.list)

      data.forEach(l => {
        l._loading = false
      })
      this.appraiseList = data
    },
    // 未评价公议列表
    onGetHouseHoldList: async function() {
      const para = {
        currentPage: this.pager.currentPage,
        pageSize: this.pager.pageSize,
        filter: this.filter
      }
      this.listLoading = true
      const res = await getHouseHoldPage(para)
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
      this.surveyList = data
    },
    // 点击添加评价
    addAppraise: async function(index, row) {
      const res = await getAddInfoReturn({ id: row.id })
      if (res.success) {
        console.log(res.data)
        this.addForm = res.data
        this.addFormVisible = true
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    submitFun: function() {
      this.$message({
        message: '提交成功!',
        type: 'success'
      })
      this.addFormVisible = false
    }
  }
}
</script>

<style>

</style>
