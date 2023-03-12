import { apiSlice } from '../app/apiSlice'

const photosApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: '/users',
        method: 'GET'
      })
    })
  })
})

export const { useGetUsersQuery } = photosApiSlice
