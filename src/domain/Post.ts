import type * as BlogApi from '../BlogApi/BlogApiClient'

export default class Post {
  id: string
  createdAt: Date
  content: string
  author: string

  constructor(post: BlogApi.Post) {
    this.id = post.id
    this.createdAt = new Date(post.createdAt)
    this.content = post.content
    this.author = post.author
  }
}
