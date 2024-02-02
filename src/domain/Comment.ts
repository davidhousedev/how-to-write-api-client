import type * as BlogApi from '../BlogApi/BlogApiClient'

export default class Comment {
  id: string
  createdAt: Date
  content: string
  author: string

  constructor(comment: BlogApi.Comment) {
    this.id = comment.id
    this.poostId = comment.postId
    this.createdAt = new Date(comment.createdAt)
    this.content = comment.content
    this.author = comment.author
  }
}
