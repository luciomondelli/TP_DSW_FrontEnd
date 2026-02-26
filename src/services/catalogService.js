import api from './api'

export const getSports = async () => {
  const { data } = await api.get('/catalog/sports')
  return data.data
}

export const getPositionsBySport = async (sportId) => {
  const { data } = await api.get(`/catalog/positions?sportId=${sportId}`)
  return data.data
}