import request from '@/utils/request'

export const getRecordFile = params => {
  return request.get('/api/record/recordFile/Get', { params: params })
}

export const GetListByRecFileTypeId = params => {
  return request.get('/api/record/recordFile/GetListByRecFileTypeId', { params: params })
}

export const addRecordFile = params => {
  return request.post('/api/record/recordFile/Add', params)
}

export const updateRecordFile = params => {
  return request.put('/api/record/recordFile/Update', params)
}

export const deleteRecordFile = params => {
  return request.delete('/api/record/recordFile/Delete', { params: params })
}

export const getRecordFileList = params => {
  return request.get('/api/record/recordFile/GetListByRecFileTypeId', { params: params })
}

export const refuseHandOver = params => {
  return request.get('/api/record/record/RefuseHandOver', { params: params })
}
