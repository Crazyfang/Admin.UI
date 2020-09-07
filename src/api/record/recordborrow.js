import request from '@/utils/request'

export const addRecordBorrow = params => {
  return request.post('/api/record/recordBorrow/AddRecordBorrow', params)
}

export const cancelRecordBorrow = params => {
  return request.get('/api/record/recordBorrow/CancelRecordBorrow', { params })
}

export const getBorrowList = params => {
  return request.get('/api/record/recordBorrow/GetBorrowList', { params })
}

export const getVerifyList = params => {
  return request.post('/api/record/recordBorrow/GetVerifyList', params)
}

export const getBorrowDetail = params => {
  return request.get('/api/record/recordBorrow/GetBorrowDetail', { params })
}

export const verifyBorrow = params => {
  return request.put('/api/record/recordBorrow/verifyBorrow', params)
}

export const getReturnPage = params => {
  return request.post('/api/record/recordBorrow/GetReturnPage', params)
}

export const returnRecord = params => {
  return request.get('/api/record/recordBorrow/ReturnRecord', { params })
}
