// import * as signalR from '@aspnet/signalr'
import * as signalR from '@microsoft/signalr'
import store from '@/store'
const signal = new signalR.HubConnectionBuilder()
  .configureLogging(signalR.LogLevel.Debug)
  .withUrl('http://154.25.8.51:9998/hub', {
  // .withUrl('http://localhost:8888/hub', {
    // skipNegotiation: true,
    transport: signalR.HttpTransportType.LongPolling,
    accessTokenFactory: () => store.getters.token
  }).withAutomaticReconnect()
  // .withUrl('http://localhost:8888/hub', {})
  .build()

export default {
  install: function(Vue) {
    Vue.prototype.signalr = signal
  }
}
