import { describe, expect, it, vi } from 'vitest'
import BlogApiClient, { Post } from './BlogApiClient'

describe('BlogApiClient', () => {
  it('can get all posts', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch')

    const blogPostFixture: Post = {
      id: 'foo',
      createdAt: '1843-12-12T14:48:00.000Z',
      content: 'Hello, world',
      author: 'Ada Lovelace',
    }

    fetcher.mockImplementationOnce(async (url, options) => {
      if (!url) throw new Error('No URL was provided to fetch')

      if (typeof url !== 'string')
        throw new Error('Mock expects a URL string to be passed into fetch')

      if (url === 'https://example.com/posts')
        return new Response(JSON.stringify([blogPostFixture]), {
          status: 200,
        })

      return new Response(null, { status: 404 })
    })

    const client = new BlogApiClient()

    const result = await client.getPosts()

    expect(result.error).toBeUndefined()
    expect(result.errorType).toBeUndefined()
    expect(result.data).toEqual([blogPostFixture])
    expect(fetcher).toHaveBeenCalledOnce()
    expect(fetcher).toHaveBeenCalledWith('https://example.com/posts')
  })

  it('returns an error if malformed data is returned', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch')

    fetcher.mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: 1234 }]), { status: 200 })
    )

    const client = new BlogApiClient()

    const result = await client.getPosts()

    expect(result.error).toEqual(new Error('Received malformed Post data'))
    expect(result.errorType).toBe('TypeError')
  })

  it('handles JSON parse errors in the response', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch')

    fetcher.mockResolvedValueOnce(new Response('Server error', { status: 200 }))

    const client = new BlogApiClient()

    const result = await client.getPosts()

    expect(result.error).toEqual(new Error('Failed to parse valid JSON'))
    expect(result.errorType).toBe('TypeError')
  })

  it.each([
    [500, 'ServerError', 'Received an error from an external resource'],
    [503, 'ServerError', 'Received an error from an external resource'],
    [400, 'ClientError', 'Sent a problematic request to an external resource'],
    [401, 'ClientError', 'Sent a problematic request to an external resource'],
    [403, 'ClientError', 'Sent a problematic request to an external resource'],
    [429, 'ClientError', 'Sent a problematic request to an external resource'],
  ])(
    'handles and safely returns HTTP %i errors',
    async (status, errorType, errorMessage) => {
      const fetcher = vi.spyOn(globalThis, 'fetch')

      fetcher.mockImplementationOnce(async () => {
        return new Response(null, { status })
      })

      const client = new BlogApiClient()

      const result = await client.getPosts()

      expect(result.error).toEqual(new Error(errorMessage))
      expect(result.errorType).toBe(errorType)
    }
  )

  it('handles thrown errors from fetch', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch')

    fetcher.mockRejectedValueOnce(new TypeError('Boom!'))

    const client = new BlogApiClient()

    const result = await client.getPosts()

    expect(result.error).toEqual(new Error('Failed to perform a request'))
    expect(result.errorType).toBe('RequestError')
  })
})
