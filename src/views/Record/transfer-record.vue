<template>
  <container>
    <el-steps :active="active" finish-status="success" align-center>
      <el-step title="选择部门" />
      <el-step title="选择转出人" />
      <el-step title="选择接收人" />
    </el-steps>
    <div style="margin: 0 auto;width: 800px;height: auto;padding: 30px">
      <el-form v-show="step1" label-width="80px" style="width: 400px;margin: 0 auto">
        <el-form-item label="选择部门">
          <el-select v-model="department" placeholder="选择部门" @change="departmentChange">
            <el-option v-for="depart in departmentList" :key="depart.id" :label="depart.value" :value="depart.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form v-show="step2" label-width="120px" style="width: 400px;margin: 0 auto">
        <el-form-item label="选择转出人">
          <el-select v-model="recordTransfer" placeholder="选择转出者" @change="userChange">
            <el-option v-for="user in userList" :key="user.value" :label="user.label" :value="user.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form v-show="step3" label-width="80px">
        <el-form-item>
          <el-col :span="4">
            <span>选择转让类型</span>
          </el-col>
          <el-col :span="8">
            <el-radio-group v-model="transferType" @change="changeTransferType">
              <el-radio label="1">全部转让</el-radio>
              <el-radio label="2">部分转让</el-radio>
            </el-radio-group>
          </el-col>
          <el-col :span="4" :offset="8">
            <el-button v-if="transferType === '2' || otherReciever.length === 0" @click="addReciever">增添接收者</el-button>
          </el-col>
        </el-form-item>
        <el-form-item v-for="(item, index) in otherReciever" :key="item.id">
          <el-row style="margin-top: 20px">
            <el-col :span="4">
              <span>选择接收者</span>
            </el-col>
            <el-col :span="6">
              <el-select v-model="item.value" placeholder="选择接收者">
                <el-option v-for="user in userList" :key="user.value" :label="user.label" :value="user.value" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <span>选择接收档案</span>
            </el-col>
            <el-col :span="6">
              <el-select v-model="item.selectRecord" multiple collapse-tags @change="initOption">
                <el-option v-for="record in optionSelect[index]" :key="record.id" :label="record.userName" :value="record.id">
                  <span style="float:left">{{ record.userName }}</span>
                  <span style="float:right;color:#8492a6;font-size:13px">{{ record.recordId }}</span>
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="delReciever(item.id, index)">
                删除
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
    <el-row style="margin-top: 20px">
      <el-col :span="4" :offset="4">
        <el-button @click="back">上一步</el-button>
      </el-col>
      <el-col :span="4" :offset="4">
        <confirm-button v-if="step3" type="submit" :loading="buttonLoading" @click="clickSubmit" />
      </el-col>
      <el-col :span="4" :offset="4">
        <el-button @click="next">下一步</el-button>
      </el-col>
    </el-row>
  </container>
</template>

<script>
import Container from '@/components/Container/index'
import ConfirmButton from '@/components/ConfirmButton'
import { getSelectList } from '@/api/admin/department'
import { getListByUser, relationChange, relationPagePermissions } from '@/api/record/record'
import { getUserSelect } from '@/api/admin/user'

export default {
  name: 'TransferRecord',
  components: {
    Container,
    ConfirmButton
  },
  data() {
    return {
      department: '',
      departmentList: [],
      userList: [],
      recordTransfer: '',
      otherReciever: [],
      optionSelect: [],
      transferType: '',
      buttonLoading: false,
      recordList: [],
      step1: true,
      step2: false,
      step3: false,
      active: 0
    }
  },
  mounted() {
    this.getDepartmentList()
  },
  methods: {
    next: function() {
      if (this.active === 0) {
        if (!this.department) {
          this.$message({
            message: '请选择部门再进行下一步',
            type: 'error'
          })
        } else {
          this.active++
          this.step1 = false
          this.step2 = true
        }
      } else if (this.active === 1) {
        if (!this.recordTransfer) {
          this.$message({
            message: '请选择转出人再进行下一步',
            type: 'error'
          })
        } else {
          this.active++
          this.step2 = false
          this.step3 = true
        }
      }
    },
    back: function() {
      if (this.active === 0) {
        return
      } else if (this.active === 1) {
        this.active--
        this.step2 = false
        this.step1 = true
      } else {
        this.active--
        this.step3 = false
        this.step2 = true
      }
    },
    getDepartmentList: async function() {
      const res = await getSelectList()
      // const data = await relationPagePermissions()

      this.departmentList = res.data
      // if (data.data.departmentId !== 0) {
      //   this.department = data.data.departmentId
      //   const res1 = await getUserSelect({ id: this.department })
      //
      //   if (res1.success) {
      //     this.userList = res1.data
      //   } else {
      //     this.$message({
      //       message: res1.msg,
      //       type: 'error'
      //     })
      //   }
      // }
      // if (data.data.userId !== 0) {
      //   this.recordTransfer = data.data.userId
      // }
    },
    clickSubmit: async function() {
      if (!this.otherReciever) {
        this.$message({
          message: '请勾选需要转让的档案和接收的人',
          type: 'error'
        })

        return
      }
      this.buttonLoading = true
      const val = _.cloneDeep(this.otherReciever)

      const res = await relationChange(val)
      this.buttonLoading = false

      if (res.success) {
        this.$message({
          message: '变更成功',
          type: 'success'
        })
        this.step1 = true
        this.step3 = false
        this.active = 0
        this.department = ''
        this.userList = []
        this.recordTransfer = ''
        this.otherReciever = []
        this.optionSelect = []
        this.transferType = ''
        this.recordList = []
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    userChange: async function(value) {
      const data = { id: value }
      const res = await getListByUser(data)

      if (res.success) {
        this.recordList = res.data
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    departmentChange: async function() {
      this.recordTransfer = ''
      const res = await getUserSelect({ id: this.department })

      if (res.success) {
        this.userList = res.data
      } else {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      }
    },
    changeTransferType: function(value) {
      if (value === '1') {
        if (this.otherReciever.length > 1) {
          this.otherReciever.splice(1, this.otherReciever.length - 1)
          this.optionSelect.splice(1, this.optionSelect.length - 1)
        }
        if (this.otherReciever.length === 0) {
          this.addReciever()
        }

        this.otherReciever[0].selectRecord = this.recordList.reduce((previousValue, cur) => [...previousValue, cur.id], [])
      }
    },
    addReciever: function() {
      if (this.transferType) {
        const uuid = require('uuid')
        this.otherReciever.push({ id: uuid.v1(), value: '', selectRecord: [] })
        if (this.transferType === '1' && this.otherReciever.length === 1) {
          this.otherReciever[0].selectRecord = this.recordList.reduce((previousValue, cur) => [...previousValue, cur.id], [])
        }
        this.initOption()
      } else {
        this.$message({
          message: '请选择转让类型',
          type: 'error'
        })
      }
    },
    delReciever: function(id, index) {
      this.otherReciever = this.otherReciever.filter(i => i.id !== id)
      this.optionSelect.splice(index, 1)
      this.initOption()
    },
    initOption() {
      // 首先遍历所有已经选中的值
      this.otherReciever.forEach((_, i) => {
        // 假设遍历到第一个， i = 0
        const totalOtherChoose = this.otherReciever
          .filter((_, idx) => idx !== i) // 过滤出除了第一项的剩余的数组集合
          .reduce((total, cur) => [...total, ...cur.selectRecord], [])
        // 用reduce 将他们的值集合起来，例如第二项选了黄金糕，第三项选了双皮奶，那么值就是
        // 把未选中的所有下拉选项重新复制给 第一项
        this.optionSelect[i] = this.recordList.filter(
          // 先通过new Set().has()方法判断是否存在
          // 如果有了，则返回false，这样就过滤掉
          // 那么他剩下的就是所有未选中的
          x => !new Set(totalOtherChoose).has(x.id)
        )
      })
    }
  }
}
</script>

<style scoped>

</style>
