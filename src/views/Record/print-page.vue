<template>
  <div>
    <el-button @click="directPrint">打印</el-button>
    <div id="templateDesignDiv" />

    <div v-for="item in usedRecordFileType" :id="item.uid" :key="item.uid" style="display: none;">
      <table class="hiprint-printElement-tableTarget" style="border-collapse: collapse;width: 559.5pt; ">
        <thead>
          <tr v-if="item.name === '个人管理类' || item.name === '担保企业管理类' || item.name === '担保个人管理类'">
            <td rowspan="6" style="text-align: center;">编号</td>
            <td colspan="3" style="text-align: center;">移交事由</td>
            <td colspan="7" style="text-align: center;">新增客户(√)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;存量周转(&nbsp;
              &nbsp; &nbsp; &nbsp;)
            </td>
          </tr>
          <tr v-else>
            <td rowspan="5" style="text-align: center;">编号</td>
            <td colspan="3" style="text-align: center;">移交事由</td>
            <td colspan="7" style="text-align: center;">新增客户(√)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;存量周转(&nbsp;
              &nbsp; &nbsp; &nbsp;)
            </td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: center;">客户经理</td>
            <td colspan="4" style="text-align: center;">{{ recordInfo.record.userName }}</td>
            <td style="text-align: center;">移交日</td>
            <td colspan="2" style="text-align: center;">{{ getDate() }}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: center;">客户名称</td>
            <td colspan="4" style="text-align: center;">{{ recordInfo.record.recordUserName }}</td>
            <td style="text-align: center;">支行</td>
            <td colspan="2" style="text-align: center;">{{ recordInfo.record.departmentName }}</td>
          </tr>
          <tr v-if="item.name === '个人管理类' || item.name === '担保企业管理类' || item.name === '担保个人管理类'">
            <td colspan="3" style="text-align: center;">保证人名称</td>
            <td colspan="7" style="text-align: center;">{{ item.remarks }}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: center;">资料名称:</td>
            <td style="text-align: center;">张数</td>
            <td colspan="1" style="text-align: center;">是否原件</td>
            <td colspan="2" style="text-align: center;">放款中心确认</td>
            <td colspan="3" style="text-align: center;">备注</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(recordFile, index) in item.children" :key="index">
            <td style="text-align: center;">{{ index + 1 }}</td>
            <td colspan="3" style="text-align: center;">{{ recordFile.name }}</td>
            <td style="text-align: center;">{{ recordFile.num === 0 ? '' : recordFile.num }}</td>
            <td style="text-align: center;" />
            <td colspan="2" style="text-align: center;" />
            <td colspan="3" style="text-align: center;" />
          </tr>
          <tr v-for="arr in 34 - item.children.length" :key="arr + item.children.length">
            <td style="text-align: center;" />
            <td colspan="3" style="text-align: center;" />
            <td style="text-align: center;" />
            <td style="text-align: center;" />
            <td colspan="2" style="text-align: center;" />
            <td colspan="3" style="text-align: center;" />
          </tr>
        </tbody>
      </table>
    </div>

  </div></template>
<script>
import $ from 'jquery'
import '@/assets/hiprint/css/hiprint.css'
import '@/assets/hiprint/css/print-lock.css'
import '@/assets/hiprint/polyfill.min.js'
import '@/assets/hiprint/plugins/jquery.minicolors.min.js'
import { hiprint } from '@/assets/hiprint/hiprint.bundle.js'
import '@/assets/hiprint/plugins/jquery.hiwprint.js'
import '@/assets/hiprint/plugins/qrcode.js'
import '@/assets/hiprint/plugins/JsBarcode.all.min.js'
import { getPrintInfo } from '@/api/record/record'

export default {
  name: 'PrintPage',
  data() {
    return {
      id: 0,
      hiprintTemplate: '',
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
      }
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
  created() {
    this.id = this.$route.query.id
  },
  mounted() {
    hiprint.init()
    this.hiprintTemplate = new hiprint.PrintTemplate()
    // var panel = this.hiprintTemplate.addPrintPanel({ pagerType: 'A4', width: 210, height: 297, paperNumberDisabled: true })
    // panel.addPrintText({ options: { width: 140, height: 19, top: 30, left: 223, fontSize: 19, title: '个人信贷类', textAlign: 'center' }})
    // panel.addPrintTable({ options: { width: 565, height: 700, top: 62, left: 20, content: $('#testTable').html() }})
    // panel.addPrintText({ options: { width: 140, height: 19, top: 780, left: 20, fontSize: 15, title: '支行移交人签字:', textAlign: 'center' }})
    // panel.addPrintText({ options: { width: 180, height: 19, top: 780, left: 300, fontSize: 15, title: '放款中心审查人签字:', textAlign: 'center' }})
    // var panel2 = this.hiprintTemplate.addPrintPanel({ pagerType: 'A4', width: 210, height: 297 })
    // panel2.addPrintText({ options: { width: 140, height: 19, top: 20, left: 223, fontSize: 19, title: '个人信贷类', textAlign: 'center' }})
    // panel2.addPrintTable({ options: { width: 565, height: 'auto', top: 52, left: 20, content: $('#testTable').html() }})
    // this.hiprintTemplate.design('#templateDesignDiv')
    this.getRecordInfo(this.id)
  },
  methods: {
    getDate: function() {
      var date = new Date()
      var seperator1 = '-'
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var strDate = date.getDate()
      if (month >= 1 && month <= 9) {
        month = '0' + month
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate
      }
      return year + seperator1 + month + seperator1 + strDate
    },
    getRecordInfo: async function(id) {
      const res = await getPrintInfo({ id: id })
      console.log(res.data)
      if (!res.success) {
        this.$message({
          message: res.msg,
          type: 'error'
        })
      } else {
        this.recordInfo = res.data
        this.$nextTick(() => {
          this.usedRecordFileType.forEach(i => {
            var panel = this.hiprintTemplate.addPrintPanel({ pagerType: 'A4', width: 210, height: 297, paperNumberDisabled: true })
            if (i.name.indexOf('权证') !== -1 || i.name.indexOf('要件') !== -1) {
              panel.addPrintText({ options: { width: 140, height: 19, top: 30, left: 223, fontSize: 19, title: i.name, textAlign: 'center' }})
              panel.addPrintTable({ options: { width: 565, height: 680, top: 70, left: 20, content: $('#' + i.uid).html() }})
              panel.addPrintText({ options: { width: 140, height: 19, top: 47, left: 330, fontSize: 15, title: '合同号:', textAlign: 'center' }})
              panel.addPrintText({ options: { width: 160, height: 19, top: 47, left: 420, fontSize: 15, title: i.remarks, textAlign: 'center' }})
              panel.addPrintText({ options: { width: 140, height: 19, top: 760, left: 25, fontSize: 15, title: '支行移交人签字:', textAlign: 'center' }})
              panel.addPrintText({ options: { width: 70, height: 19, top: 760, left: 170, fontSize: 15, title: this.recordInfo.record.userName, textAlign: 'center' }})
              panel.addPrintText({ options: { width: 180, height: 19, top: 760, left: 300, fontSize: 15, title: '放款中心审查人签字:', textAlign: 'center' }})
            } else {
              panel.addPrintText({ options: { width: 140, height: 19, top: 30, left: 223, fontSize: 19, title: i.name, textAlign: 'center' }})
              panel.addPrintTable({ options: { width: 565, height: 680, top: 62, left: 20, content: $('#' + i.uid).html() }})
              panel.addPrintText({ options: { width: 140, height: 19, top: 750, left: 25, fontSize: 15, title: '支行移交人签字:', textAlign: 'center' }})
              panel.addPrintText({ options: { width: 70, height: 19, top: 750, left: 170, fontSize: 15, title: this.recordInfo.record.userName, textAlign: 'center' }})
              panel.addPrintText({ options: { width: 180, height: 19, top: 750, left: 300, fontSize: 15, title: '放款中心审查人签字:', textAlign: 'center' }})
            }
          })
          this.hiprintTemplate.design('#templateDesignDiv')
        })
      }
    },
    directPrint: function() {
      this.hiprintTemplate.print()
    }
  }
}
</script>

<style scoped>

</style>
