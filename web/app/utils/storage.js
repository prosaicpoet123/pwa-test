import engine from 'store/src/store-engine'
import sessionStorage from 'store/storages/sessionStorage'
import localStorage from 'store/storages/localStorage'
import memoryStorage from 'store/storages/memoryStorage' // Fallback for crazy environments like Safari Incognito
import expirePlugin from 'store/plugins/expire'

const store = engine.createStore([sessionStorage, localStorage, memoryStorage], [expirePlugin])

/**
 * Provides central access to "browser" storage. Uses the `store`
 * npm package to provide sensible fallbacks all the way to
 * in-memory (non-durable) storage for severely constrained
 * environments (like Safari Private Browsing).
 */
export const getStorage = () => {
    return store
}
