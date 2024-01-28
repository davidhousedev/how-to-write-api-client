type Result =
  | {
      data: Response
      status: number
      error?: undefined
      errorType?: undefined
    }
  | {
      data?: undefined
      status: number
      error: Error
      errorType: 'ServerError' | 'ClientError'
    }

export default class BlogApiClient {
  async getPosts(): Promise<Result> {
    const response = await fetch('https://example.com/posts')

    if (response.status >= 500 && response.status < 600) {
      return {
        status: response.status,
        error: new Error('Received an error from an external resource', {
          cause: response,
        }),
        errorType: 'ServerError',
      }
    }

    if (response.status >= 400 && response.status < 500) {
      return {
        status: response.status,
        error: new Error('Sent a problematic request to an external resource', {
          cause: response,
        }),
        errorType: 'ClientError',
      }
    }

    return {
      data: response,
      status: response.status,
    }
  }
}
