type Result =
  | {
      data: Response
      error?: undefined
      errorType?: undefined
    }
  | {
      data?: undefined
      error: Error
      errorType: 'ServerError' | 'ClientError' | 'RequestError'
    }

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

    return {
      data: response,
    }
  }
}
