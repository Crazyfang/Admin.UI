import request from '@/utils/request'

export const getRecordTypeList = params => {
  return request.get('/api/record/recordType/GetAll', { params: params })
}

export const getRecordType = params => {
  return request.get('/api/record/recordType/Get', { params: params })
}

export const addRecordType = params => {
  return request.post('/api/record/recordType/Add', params)
}

export const updateRecordType = params => {
  return request.put('/api/record/recordType/Update', params)
}

export const deleteRecordType = params => {
  return request.delete('/api/record/recordType/Delete', { params: params })
}
