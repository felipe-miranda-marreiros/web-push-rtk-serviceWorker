import { apiSlice } from '../app/apiSlice'

const photosApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPhotos: builder.query({
      query: () => ({
        url: '/photos',
        method: 'GET'
      })
    })
  })
})

export const { useGetPhotosQuery } = photosApiSlice
