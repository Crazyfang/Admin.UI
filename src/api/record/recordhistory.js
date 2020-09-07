import request from '@/utils/request'

export const getRecordHistoryList = params => {
  return request.get('/api/record/recordHistory/Get', { params })
}
