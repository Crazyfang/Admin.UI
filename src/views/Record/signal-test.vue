<template>
  <container>
    <el-input v-model="sendMessage" />
    <el-input v-model="getMessage" type="textarea" />
    <el-button type="primary" @click="send">发送</el-button>
  </container>
</template>

<script>
import Container from '@/components/Container/index'
export default {
  name: 'SignalTest',
  components: { Container },
  data() {
    return {
      getMessage: '',
      sendMessage: ''
    }
  },
  created() {
    // this.signalr.off('Show')
    // this.signalr.on('Show', (info, message) => {
    //   console.log(info, message)
    //   this.getMessage = this.getMessage + info + message
    // })
  },
  mounted() {
    // if (this.signalr.state === 'Disconnected') {
    //   this.signalr.start().then(() => {
    //     console.log('连接')
    //   })
    // }
  },
  methods: {
    send: function() {
      this.signalr.send('SendMsg', this.sendMessage).then(() => {
        this.sendMessage = ''
      })
    }
  }
}
</script>

<style scoped>

</style>
