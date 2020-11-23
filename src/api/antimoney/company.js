import request from '@/utils/request'

export const companyPage = params => {
  return request.post('/api/antimoney/company/page', params)
}

export const addCompany = params => {
  return request.post('/api/antimoney/company/add', params)
}

export const editCompany = params => {
  return request.put('/api/antimoney/company/edit', params)
}

export const getCompany = params => {
  return request.get('/api/antimoney/company/get', { params: params })
}

export const delCompany = params => {
  return request.delete('/api/antimoney/company/delete', { params: params })
}
