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
                  <el-input v-model="filter.userName" placeholder="户主姓名">
                    <template #prefix>
                      <i class="el-input__icon el-icon-search" />
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item>
                  <el-input v-model="filter.idNumber" placeholder="户主身份证">
                    <template #prefix>
                      <i class="el-input__icon el-icon-search" />
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <el-button type="primary">查询</el-button>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary">新增</el-button>
                </el-form-item>
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
          <el-table-column prop="id" width="50" label="ID" />
          <el-table-column prop="userName" label="户主姓名" />
          <el-table-column prop="address" label="居住地址" />
          <el-table-column prop="idNumber" label="身份证号" />
          <el-table-column label="操作" width="120px" fixed="right">
            <template v-slot="{ $index, row }">
              <el-button icon="el-icon-info" type="primary" @click="addFormVisible = true">补充信息</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog title="详细信息添加" :visible.sync="addFormVisible" width="80%">
          <el-form ref="surveyForm" label-width="150px" label-position="left">
            <el-divider content-position="left">第一部分</el-divider>
            <el-row v-for="item in addForm.userList" :key="item.idNumber" style="margin-bottom: 20px;">
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
            <el-form-item label="无固定收入情况">
              <el-radio v-model="addForm.instability" :label="true">是</el-radio>
              <el-radio v-model="addForm.instability" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="欠债不还或赖账行为">
              <el-radio v-model="addForm.repudiate" :label="true">是</el-radio>
              <el-radio v-model="addForm.repudiate" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="品德较差">
              <el-radio v-model="addForm.reputation" :label="true">是</el-radio>
              <el-radio v-model="addForm.reputation" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="涉嫌赌博行为">
              <el-radio v-model="addForm.gamble" :label="true">是</el-radio>
              <el-radio v-model="addForm.gamble" :label="false">否</el-radio>
            </el-form-item>
            <el-form-item label="民间借贷">
              <el-radio v-model="addForm.lending" :label="true">是</el-radio>
              <el-radio v-model="addForm.lending" :label="false">否</el-radio>
            </el-form-item>
            <el-divider v-if="displaySign" content-position="left">第三部分</el-divider>
            <el-row v-if="displaySign">
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭自建房产情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.selfBuilding" :label="true">是</el-radio>
                <el-radio v-model="addForm.selfBuilding" :label="false">否</el-radio>
              </el-col>
              <el-col v-if="addForm.selfBuilding" :span="24" style="margin-bottom: 10px;">
                <el-checkbox v-model="addForm.dungalow" label="平房" border style="margin-right: 20px;" />
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
                <el-radio v-model="addForm.goodsBuilding" :label="true">是</el-radio>
                <el-radio v-model="addForm.goodsBuilding" :label="false">否</el-radio>
                <el-input-number v-if="addForm.goodsBuilding" v-model="addForm.goodsBuildingCount" />
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭汽车拥有情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-radio v-model="addForm.carHold" :label="true">是</el-radio>
                <el-radio v-model="addForm.carHold" :label="false">否</el-radio>
                <el-input-number v-if="addForm.carHold" v-model="addForm.carHoldCount" />
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭负债情况</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="addForm.debtCondition" placeholder="被判定为家庭银行负债、民间负债金额">
                  <template slot="append">万元</template>
                </el-input>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭年收入</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="addForm.homeEarning" placeholder="被判定为家庭所有成员年收入金额">
                  <template slot="append">万元</template>
                </el-input>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <span>家庭年支出</span>
              </el-col>
              <el-col :span="24" style="margin-bottom: 20px;">
                <el-input v-model="addForm.homePay" placeholder="被判定为家庭年支出金额，主要包括日常支出、子女就学、建房、婚嫁">
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
            <el-button type="primary">提交</el-button>
          </div>
        </el-dialog>
        <template #footer>
          <pagination
            ref="pager"
            :page.sync="pager.currentPage"
            :size.sync="pager.pageSize"
            :total="pager.total"
          />
        </template>
      </container>
    </el-tab-pane>
    <el-tab-pane label="已评审列表">
      <el-table
        ref="surveyTable2"
        v-loading="listLoading"
        row-key="id"
        :data="surveyList"
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
            <el-button icon="el-icon-info" type="primary" @click="addFormVisible = true">补充信息</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Container from '@/components/Container/index'
import Pagination from '@/components/Pagination/index'
export default {
  name: 'Page',
  components: {
    Container,
    Pagination
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

      // Table data
      surveyList: [{
        id: 1,
        userName: '测试1',
        address: '宁波余姚陆埠镇',
        idNumber: '330281199509106677'
      }, {
        id: 2,
        userName: '测试2',
        address: '宁波余姚丈亭镇',
        idNumber: '330281199509106688'
      }, {
        id: 3,
        userName: '测试3',
        address: '宁波余姚三七市',
        idNumber: '330281199509106699'
      }, {
        id: 4,
        userName: '测试4',
        address: '宁波余姚河姆渡镇',
        idNumber: '330281199509106600'
      }, {
        id: 5,
        userName: '测试5',
        address: '宁波余姚梁弄镇',
        idNumber: '330281199509106611'
      }, {
        id: 6,
        userName: '测试6',
        address: '宁波余姚市',
        idNumber: '330281199509106622'
      }],
      // Table loading field
      listLoading: false,
      // field judge the dialog hide or show up
      dialogVisible: false,

      addForm: {
        userList: [{
          userName: '测试1',
          idNumber: '330281199509106666',
          relation: '户主',
          longStay: false
        }, {
          userName: '测试7',
          idNumber: '330281199509106667',
          relation: '父子',
          longStay: false
        }, {
          userName: '测试8',
          idNumber: '330281199509106668',
          relation: '配偶',
          longStay: false
        }],
        longStay: false,
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
      addFormVisible: false
    }
  },
  computed: {
    displaySign: function() {
      if (this.addForm.instability || this.addForm.repudiate || this.addForm.reputation || this.addForm.gamble || this.addForm.lending) {
        return false
      } else {
        return true
      }
    }
  },
  mounted() {
    this.pager = this.$refs.pager.getPager()
  }
}
</script>

<style>

</style>
