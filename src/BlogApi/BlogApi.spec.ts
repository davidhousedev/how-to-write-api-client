import { describe, expect, it } from 'vitest'
import BlogApiClient from './BlogApiClient'

describe('BlogApiClient', () => {
  it('can get all posts', () => {
    const client = new BlogApiClient()

    const response = client.getPosts()

    expect(response.status).toBe(200)
  })
})
