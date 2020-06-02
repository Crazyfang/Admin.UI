import request from '@/utils/request'

export const getDepartmentList = params => {
  return request.get('/api/admin/department/GetList', { params: params })
}

export const getDepartment = params => {
  return request.get('/api/admin/department/GetDepartment', { params: params })
}

export const editDepartment = params => {
  return request.post('/api/admin/department/UpdateDepartment', params)
}

export const removeDepartment = params => {
  return request.delete('/api/admin/department/DeleteDepartment', { params: params })
}

export const addDepartment = params => {
  return request.post('/api/admin/department/addDepartment', params)
}
