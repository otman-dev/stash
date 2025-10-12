export interface Category {
  _id: string
  name: string
}

export interface Product {
  _id: string
  name: string
  description?: string
  media?: string[]
  units?: number
  categoryId?: string | null
}
export interface Category {
  _id: string
  name: string
}

export interface Product {
  _id: string
  name: string
  description?: string
  media?: string[]
  units?: number
  categoryId?: string | null
}
export interface Category {
  _id: string
  name: string
  description?: string
  color?: string
  createdAt?: string
}

export interface Product {
  _id: string
  name: string
  description?: string
  media?: string[]
  units?: number
  price?: number
  categoryId?: string | null
}
