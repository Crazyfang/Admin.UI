import request from '@/utils/request'

export const addLoanUser = params => {
  return request.post('/api/loan/loanUser/AddLoanUser', params)
}

export const editLoanUser = params => {
  return request.put('/api/loan/loanUser/Edit', params)
}

export const getLoanUserInfo = params => {
  return request.get('/api/loan/loanUser/Get', { params: params })
}

export const delLoanUserInfo = params => {
  return request.delete('/api/loan/loanUser/Delete', { params: params })
}

export const getLoanUserList = params => {
  return request.post('/api/loan/loanUser/GetList', params)
}

export const verifyLoanUserList = params => {
  return request.get('/api/loan/loanUser/Verify', { params: params })
}
