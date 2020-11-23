import request from '@/utils/request'

export const getCurrencyList = params => {
  return request.get('/api/antimoney/currency/List', { params: params })
}
