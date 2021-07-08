import request from '@/utils/request'

export const addFile = params => {
  return request.post('/api/antimoney/file/add', params)
}

export const uploadPicture = params => {
  return request.post('/api/antimoney/file/FileImageUpload', params)
}

export const getPictureList = params => {
  return request.get('/api/antimoney/picture/GetPictureList', { params: params })
}
