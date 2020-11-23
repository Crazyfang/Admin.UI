import request from '@/utils/request'

export const addFile = params => {
  return request.post('/api/antimoney/file/add', params)
}
