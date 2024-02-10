import { z } from 'zod'
import DomainComment from '../domain/Comment'
import DomainPost from '../domain/Post'

type Ok<T> = {
  data: T
  error?: undefined
  errorType?: undefined
}

type Err = {
  data?: undefined
  error: Error
  errorType: 'ServerError' | 'ClientError' | 'RequestError' | 'TypeError'
}

export type Result<T> = Ok<T> | Err

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

const commentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  createdAt: z.string().datetime(),
  content: z.string(),
  author: z.string(),
})

/**
 * Comment represents a comment on a blog post
 */
export type Comment = z.infer<typeof commentSchema>

export default class BlogApiClient {
  async getPosts(): Promise<Result<DomainPost[]>> {
    return this.callApi(`https://example.com/posts`, (data) =>
      this.handleGetPostsResponse(data)
    )
  }

  async getComments(postId: string): Promise<Result<DomainComment[]>> {
    return this.callApi(
      `https://example.com/posts/${postId}/comments`,
      (data) => this.handleGetCommentsResponse(data)
    )
  }

  private async callApi<T>(
    url: string,
    responseParser: (json: unknown) => Promise<Result<T>>
  ) {
    let response: Response
    try {
      response = await fetch(url)
    } catch (err) {
      return this.handleRequestError(err)
    }

    if (response.status >= 500 && response.status < 600) {
      return this.handleServerError(response)
    }

    if (response.status >= 400 && response.status < 500) {
      return this.handleClientError(response)
    }

    try {
      const data = await response.json()
      return await responseParser(data)
    } catch (err) {
      return this.handleJsonParseError(err)
    }
  }

  private async handleGetPostsResponse(json: unknown) {
    const parseResult = z.array(postSchema).safeParse(json)

    if (!parseResult.success) {
      return this.handleMalformedData(parseResult.error.issues)
    }

    return {
      data: parseResult.data.map((apiPost) => new DomainPost(apiPost)),
    } satisfies Ok<DomainPost[]>
  }

  private async handleGetCommentsResponse(json: unknown) {
    const parseResult = z.array(commentSchema).safeParse(json)

    if (!parseResult.success) {
      return this.handleMalformedData(parseResult.error.issues)
    }

    return {
      data: parseResult.data.map((apiComment) => new DomainComment(apiComment)),
    } satisfies Ok<DomainComment[]>
  }

  private handleRequestError(err: unknown) {
    return {
      error: new Error('Failed to perform a request', {
        cause: err,
      }),
      errorType: 'RequestError',
    } satisfies Err
  }

  private handleClientError(response: Response) {
    return {
      error: new Error('Sent a problematic request to an external resource', {
        cause: response,
      }),
      errorType: 'ClientError',
    } satisfies Err
  }

  private handleMalformedData(issues: z.ZodIssue[]) {
    return {
      error: new Error('Received malformed data', {
        cause: issues,
      }),
      errorType: 'TypeError',
    } satisfies Err
  }

  private handleServerError(response: Response) {
    return {
      error: new Error('Received an error from an external resource', {
        cause: response,
      }),
      errorType: 'ServerError',
    } satisfies Err
  }

  private handleJsonParseError(err: unknown) {
    return {
      error: new Error('Failed to parse valid JSON', { cause: err }),
      errorType: 'TypeError',
    } satisfies Err
  }
}
