import { describe, it, expect } from 'vitest'
import type * as BlogApi from '../BlogApi/BlogApiClient'
import Comment from './Comment'

describe('Comment', () => {
  it('can be constructed from a Comment', () => {
    const apiComment: BlogApi.Comment = {
      id: 'foo',
      postId: 'bar',
      createdAt: '1843-12-12T14:48:00.000Z',
      content: 'Hello, world',
      author: 'Ada Lovelace',
    }

    const comment = new Comment(apiComment)

    expect(comment.id).toEqual(apiComment.id)
    expect(comment.createdAt).toEqual(new Date(apiComment.createdAt))
    expect(comment.content).toEqual(apiComment.content)
    expect(comment.author).toEqual(apiComment.author)
  })
})
