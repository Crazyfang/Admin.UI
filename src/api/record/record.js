import request from '@/utils/request'

export const getRecordList = params => {
  return request.post('/api/record/record/GetPage', params)
}

export const getRecord = params => {
  return request.get('/api/record/record/Get', { params: params })
}

export const addRecord = params => {
  return request.post('/api/record/record/Add', params)
}

export const stockAdd = params => {
  return request.post('/api/record/record/StockAdd', params)
}

export const updateRecord = params => {
  return request.put('/api/record/record/Update', params)
}

export const deleteRecord = params => {
  return request.delete('/api/record/record/Delete', { params: params })
}

export const getRecordBasicInfo = params => {
  return request.get('/api/record/record/GetBasicInfo', { params: params })
}

export const getRecordAdditionalInfo = params => {
  return request.get('/api/record/record/GetAdditionalInfo', { params: params })
}

export const getEditPageReturn = params => {
  return request.get('/api/record/record/EditPageReturn', { params: params })
}

export const addRecordAdditionalInfo = params => {
  return request.post('/api/record/record/AddAdditionalRecordInfo', params)
}

export const handOverPage = params => {
  return request.post('/api/record/record/HandOverPage', params)
}

export const handOverBasicInfo = params => {
  return request.get('/api/record/record/HandOverBasicInfo', { params })
}

export const handOverCheck = params => {
  return request.post('/api/record/record/HandOverCheck', params)
}

export const getListByUser = params => {
  return request.get('/api/record/record/GetListByUser', { params })
}

export const relationChange = params => {
  return request.post('/api/record/record/RelationChange', params)
}

export const getPrintInfo = params => {
  return request.get('/api/record/record/GetPrintInfo', { params })
}

export const getExpiredRecordList = params => {
  return request.post('/api/record/record/GetExpiredRecordList', params)
}

export const applyChangeFile = params => {
  return request.post('/api/record/record/ApplyChangeFile', params)
}

export const getChangeDetail = params => {
  return request.get('/api/record/record/GetChangeDetail', { params })
}

export const getApplyChangeList = params => {
  return request.post('/api/record/record/GetApplyChangeList', params)
}

export const getApplyChangeDetail = params => {
  return request.get('/api/record/record/GetApplyChangeDetail', { params })
}

export const acceptApplyChange = params => {
  return request.get('/api/record/record/AcceptApplyChange', { params: params })
}

export const refuseApplyChange = params => {
  return request.post('/api/record/record/RefuseApplyChange', params)
}

export const relationPagePermissions = params => {
  return request.get('/api/record/record/RelationPagePermissions', { params })
}

export const refuseHandOver = params => {
  return request.post('/api/record/record/RefuseHandOver', params)
}

export const getNeedCreateRecordList = params => {
  return request.post('/api/record/record/GetNeedCreateRecordList', params)
}
