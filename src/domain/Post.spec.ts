import { describe, it, expect } from 'vitest'
import type * as BlogApi from '../BlogApi/BlogApiClient'
import Post from './Post'

describe('Post', () => {
  it('can be constructed from a BlogApiPost', () => {
    const apiPost: BlogApi.Post = {
      id: 'foo',
      createdAt: '1843-12-12T14:48:00.000Z',
      content: 'Hello, world',
      author: 'Ada Lovelace',
    }

    const post = new Post(apiPost)

    expect(post.id).toEqual(apiPost.id)
    expect(post.createdAt).toEqual(new Date(apiPost.createdAt))
    expect(post.content).toEqual(apiPost.content)
    expect(post.author).toEqual(apiPost.author)
  })
})
