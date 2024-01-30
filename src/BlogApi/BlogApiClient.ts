import { z } from 'zod'
import DomainPost from '../domain/Post'

export type Result =
  | {
      data: Post[]
      error?: undefined
      errorType?: undefined
    }
  | {
      data?: undefined
      error: Error
      errorType: 'ServerError' | 'ClientError' | 'RequestError' | 'TypeError'
    }

const postSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  content: z.string(),
  author: z.string(),
})

/**
 * Post represents a blog post and its content
 */
export type Post = z.infer<typeof postSchema>

export default class BlogApiClient {
  async getPosts(): Promise<Result> {
    let response: Response
    try {
      response = await fetch('https://example.com/posts')
    } catch (err) {
      return {
        error: new Error('Failed to perform a request', {
          cause: err,
        }),
        errorType: 'RequestError',
      }
    }

    if (response.status >= 500 && response.status < 600) {
      return {
        error: new Error('Received an error from an external resource', {
          cause: response,
        }),
        errorType: 'ServerError',
      }
    }

    if (response.status >= 400 && response.status < 500) {
      return {
        error: new Error('Sent a problematic request to an external resource', {
          cause: response,
        }),
        errorType: 'ClientError',
      }
    }

    try {
      const posts = await response.json()

      const parseResult = z.array(postSchema).safeParse(posts)

      if (!parseResult.success) {
        return {
          error: new Error('Received malformed Post data', {
            cause: parseResult.error.issues,
          }),
          errorType: 'TypeError',
        }
      }

      return {
        data: parseResult.data.map((apiPost) => new DomainPost(apiPost)),
      }
    } catch (err) {
      return {
        error: new Error('Failed to parse valid JSON', { cause: err }),
        errorType: 'TypeError',
      }
    }
  }
}
