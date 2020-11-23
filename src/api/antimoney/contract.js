import request from '@/utils/request'

export const contractPage = params => {
  return request.post('/api/antimoney/contract/page', params)
}

export const addContract = params => {
  return request.post('/api/antimoney/contract/add', params)
}

export const editContract = params => {
  return request.put('/api/antimoney/contract/edit', params)
}

export const getFileList = params => {
  return request.get('/api/antimoney/contract/GetFileList', { params: params })
}

export const getContract = params => {
  return request.get('/api/antimoney/contract/get', { params: params })
}

export const delContract = params => {
  return request.delete('/api/antimoney/contract/delete', { params: params })
}

export const getNotes = params => {
  return request.get('/api/antimoney/contract/GetNotes', { params: params })
}

export const addOrEditNotes = params => {
  return request.put('/api/antimoney/contract/AddOrEditNotes', params)
}

export const generateContractList = params => {
  return request.post('/api/antimoney/contract/GenerateContratList', params)
}
