import { describe, expect, it, vi } from 'vitest'
import BlogApiClient from './BlogApiClient'

describe('BlogApiClient', () => {
  it('can get all posts', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch')

    // implement a mock fetcher
    fetcher.mockImplementationOnce(async (url, options) => {
      if (!url) throw new Error('No URL was provided to fetch')

      if (typeof url !== 'string')
        throw new Error('Mock expects a URL string to be passed into fetch')

      if (url === 'https://example.com/posts')
        return new Response(null, { status: 200 })

      return new Response(null, { status: 404 })
    })

    const client = new BlogApiClient()

    const response = await client.getPosts()

    expect(response.status).toBe(200)
    expect(fetcher).toHaveBeenCalledOnce()
    // assert that fetcher was called with the expected endpoint
    expect(fetcher).toHaveBeenCalledWith('https://example.com/posts')
  })
})
