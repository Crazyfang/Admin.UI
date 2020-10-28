import request from '@/utils/request'

export const getAppraisePage = params => {
  return request.post('/api/questionnaire/appraise/Page', params)
}

export const getAppraiseDetail = params => {
  return request.get('/api/questionnaire/appraise/Detail', { params: params })
}

export const addAppraise = params => {
  return request.post('/api/questionnaire/appraise/Add', params)
}

export const getAddInfoReturn = params => {
  return request.get('/api/questionnaire/appraise/AddInfoReturn', { params: params })
}
