import request from '@/utils/request'

export const getHouseHoldPage = params => {
  return request.post('/api/questionnaire/household/Page', params)
}

export const getCalculateList = params => {
  return request.get('/api/questionnaire/household/CalculatePage', { params: params })
}

export const getSectionCodeList = params => {
  return request.get('/api/questionnaire/household/GetSectionCodeList', { params: params })
}

export const generateDetailCollectXlsx = params => {
  return request.post('/api/questionnaire/household/GenerateDetailCollectXlsx', params)
}

export const downloadFile = params => {
  return request.get('/api/questionnaire/household/DownloadFile', { params: params })
}

export const generateCreditDetailXlsx = params => {
  return request.get('/api/questionnaire/household/GenerateCreditDetailXlsx', { params: params })
}

export const getUserPowerSelect = params => {
  return request.get('/api/questionnaire/household/GetUserPowerSelect', { params: params })
}
