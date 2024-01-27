export default class BlogApiClient {
  getPosts() {
    return fetch('https://example.com/posts')
  }
}
