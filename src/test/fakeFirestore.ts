// Minimal in-memory stand-in for the parts of the Admin Firestore API this app uses.
type Data = Record<string, unknown>
type Snapshot = {
  id: string
  ref: { path: string }
  exists: boolean
  data: () => Data | undefined
  get: (field: string) => unknown
}

export function fakeFirestore() {
  const store = new Map<string, Data>()

  const snapshot = (path: string): Snapshot => {
    const data = store.get(path)
    return {
      id: path.split('/').pop()!,
      ref: { path },
      exists: data !== undefined,
      data: () => (data ? { ...data } : undefined),
      get: (field: string) => data?.[field],
    }
  }

  function docRef(path: string) {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => snapshot(path),
      create: async (data: Data) => {
        if (store.has(path)) throw Object.assign(new Error('ALREADY_EXISTS'), { code: 6 })
        store.set(path, { ...data })
      },
      set: async (data: Data, options?: { merge?: boolean }) => {
        store.set(path, options?.merge ? { ...store.get(path), ...data } : { ...data })
      },
      update: async (data: Data) => {
        if (!store.has(path)) throw Object.assign(new Error('NOT_FOUND'), { code: 5 })
        store.set(path, { ...store.get(path), ...data })
      },
      collection: (name: string) => collectionRef(`${path}/${name}`),
    }
  }

  type Query = {
    filters: [string, unknown][]
    order?: [string, 'asc' | 'desc']
    max?: number
  }

  function query(path: string, q: Query) {
    return {
      where: (field: string, _op: '==', value: unknown) =>
        query(path, { ...q, filters: [...q.filters, [field, value]] }),
      orderBy: (field: string, dir: 'asc' | 'desc' = 'asc') => query(path, { ...q, order: [field, dir] }),
      limit: (n: number) => query(path, { ...q, max: n }),
      get: async (): Promise<{ docs: Snapshot[]; empty: boolean }> => {
        const depth = path.split('/').length + 1
        let docs: Snapshot[] = [...store.keys()]
          .filter((key) => key.startsWith(`${path}/`) && key.split('/').length === depth)
          .map(snapshot)
          .filter((s) => q.filters.every(([f, v]) => s.get(f) === v))
        if (q.order) {
          const [field, dir] = q.order
          docs.sort((a, b) => {
            const x = String(a.get(field)), y = String(b.get(field))
            return dir === 'asc' ? x.localeCompare(y) : y.localeCompare(x)
          })
        }
        if (q.max !== undefined) docs = docs.slice(0, q.max)
        return { docs, empty: docs.length === 0 }
      },
    }
  }

  function collectionRef(path: string) {
    return { ...query(path, { filters: [] }), doc: (id: string) => docRef(`${path}/${id}`) }
  }

  const db = {
    collection: collectionRef,
    doc: docRef,
    getAll: async (...refs: { path: string }[]) => refs.map((r) => snapshot(r.path)),
    batch: () => {
      const ops: (() => void)[] = []
      const batch = {
        create: (ref: { path: string }, data: Data) => {
          ops.push(() => {
            if (store.has(ref.path)) throw Object.assign(new Error('ALREADY_EXISTS'), { code: 6 })
          })
          ops.push(() => store.set(ref.path, { ...data }))
          return batch
        },
        commit: async () => {
          // All-or-nothing: check every precondition before applying any write.
          const checks = ops.filter((_, i) => i % 2 === 0)
          const writes = ops.filter((_, i) => i % 2 === 1)
          checks.forEach((check) => check())
          writes.forEach((write) => write())
        },
      }
      return batch
    },
  }

  return { db, store }
}
