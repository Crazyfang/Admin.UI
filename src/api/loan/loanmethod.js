import request from '@/utils/request'

export const getLoanMethod = params => {
  return request.get('/api/loan/loanMethodChange/Get', { params: params })
}

export const addLoanMethod = params => {
  return request.post('/api/loan/loanMethodChange/Add', params)
}

export const editLoanMethod = params => {
  return request.put('/api/loan/loanMethodChange/Edit', params)
}

export const delLoanMethod = params => {
  return request.delete('/api/loan/loanMethodChange/Delete', { params: params })
}

export const getLoanMethodPage = params => {
  return request.post('/api/loan/loanMethodChange/GetPage', params)
}

export const verifyLoanMethod = params => {
  return request.get('/api/loan/loanMethodChange/VerifyLoanMethod', { params: params })
}
