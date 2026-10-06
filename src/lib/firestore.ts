import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '../features/auth/AuthContext'

function userCollection(uid: string, name: string) {
  return collection(db, 'users', uid, name)
}

/**
 * Subscribe realtime ke sebuah koleksi milik user yang sedang login.
 * Otomatis kosong (dan tidak query) kalau belum login.
 */
export function useUserCollection<T>(
  name: string,
  constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]
) {
  const { user } = useAuth()
  const [data, setData] = useState<(T & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setData([])
      setLoading(false)
      return
    }
    setLoading(true)
    const q = query(userCollection(user.uid, name), ...constraints)
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) })))
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(`Gagal memuat ${name}:`, err)
        setError('Gagal memuat data. Periksa koneksi kamu.')
        setLoading(false)
      }
    )
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, name])

  return { data, loading, error }
}

export function useFirestoreActions(name: string) {
  const { user } = useAuth()

  async function add(payload: Record<string, unknown>) {
    if (!user) throw new Error('Belum login')
    return addDoc(userCollection(user.uid, name), payload)
  }

  async function update(id: string, payload: Record<string, unknown>) {
    if (!user) throw new Error('Belum login')
    return updateDoc(doc(db, 'users', user.uid, name, id), payload)
  }

  async function remove(id: string) {
    if (!user) throw new Error('Belum login')
    return deleteDoc(doc(db, 'users', user.uid, name, id))
  }

  return { add, update, remove }
}
