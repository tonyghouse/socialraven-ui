import { PostResponse } from "./PostResponse"

export interface PostResponsePage {
  content: PostResponse[]
  totalPages: number
  totalElements: number
  number: number // current page
  size: number
  first: boolean
  last: boolean
}
