import request from '@/utils/request'

export const addRecordFileType = params => {
  return request.post('/api/record/recordFileType/Add', params)
}

export const updateRecordFileType = params => {
  return request.put('/api/record/recordFileType/Update', params)
}

export const deleteRecordFileType = params => {
  return request.delete('/api/record/recordFileType/Delete', { params: params })
}

export const addRecordPageList = params => {
  return request.get('/api/record/recordFileType/AddRecordPageList', { params: params })
}

export const updateRecordPageList = params => {
  return request.get('/api/record/recordFileType/UpdateRecordPageList', { params: params })
}

export const getRecordFileTypeList = params => {
  return request.get('/api/record/recordFileType/GetListByRecTypeId', { params: params })
}
