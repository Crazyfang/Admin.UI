import request from '@/utils/request'

export const getNotifyCount = params => {
  return request.get('/api/record/notify/GetCount', { params: params })
}

export const getNotifyPage = params => {
  return request.post('/api/record/notify/GetPage', params)
}

export const readNotify = params => {
  return request.get('/api/record/notify/ReadNotify', { params: params })
}

export const getDictionary = params => {
  return request.get('/api/record/notify/GetDictionary', { params: params })
}
