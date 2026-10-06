import { useEffect, useRef } from 'react'
import { useUserCollection, useFirestoreActions } from '../../lib/firestore'
import { useAuth } from '../auth/AuthContext'
import type { Category } from '../../types'
import { DEFAULT_CATEGORIES } from './defaultCategories'

export function useCategories() {
  const { user } = useAuth()
  const { data, loading, error } = useUserCollection<Category>('categories')
  const { add, update, remove } = useFirestoreActions('categories')
  const seeded = useRef(false)

  // Seed kategori default sekali saat user baru pertama kali login dan belum punya kategori
  useEffect(() => {
    if (!user || loading || seeded.current) return
    if (data.length > 0) {
      seeded.current = true
      return
    }
    seeded.current = true
    DEFAULT_CATEGORIES.forEach((cat) => {
      add({ ...cat, createdAt: Date.now() }).catch(console.error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, data.length])

  function addCategory(payload: Omit<Category, 'id' | 'createdAt'>) {
    return add({ ...payload, createdAt: Date.now() })
  }

  function updateCategory(id: string, payload: Partial<Omit<Category, 'id'>>) {
    return update(id, payload)
  }

  function deleteCategory(id: string) {
    return remove(id)
  }

  return { categories: data, loading, error, addCategory, updateCategory, deleteCategory }
}
