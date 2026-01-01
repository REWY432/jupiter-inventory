import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { spoolsDb, spoolsAuth } from '@/config/firebase'
import { useToastStore } from './toast'

export const useSpoolsStore = defineStore('spools', () => {
  const toast = useToastStore()
  
  const spools = ref([])
  const settings = ref({
    models: [
      { year: "2024", ean: "2000000010632" },
      { year: "2025", ean: "2000000040783" }
    ]
  })
  const isLoading = ref(true)
  const isConnected = ref(false)
  
  let unsubscribeSpools = null
  let unsubscribeSettings = null

  // Computed
  const totalCount = computed(() => spools.value.length)
  const chineseCount = computed(() => 
    spools.value.filter(s => {
      const wire = s.wireType || (s.model && s.model.includes('У') ? 'Favero' : 'Китайский')
      return wire === 'Китайский'
    }).length
  )
  const faveroCount = computed(() => 
    spools.value.filter(s => {
      const wire = s.wireType || (s.model && s.model.includes('У') ? 'Favero' : 'Китайский')
      return wire === 'Favero'
    }).length
  )

  // Initialize
  const init = async () => {
    try {
      // Try anonymous auth, but continue even if it fails
      try {
        await signInAnonymously(spoolsAuth)
      } catch (authError) {
        console.warn('Anonymous auth not enabled, continuing without auth:', authError.code)
      }
      
      isConnected.value = true
      setupListeners()
    } catch (error) {
      console.error('Spools init error:', error)
      toast.error('Ошибка подключения к базе катушек')
      isConnected.value = false
    }
  }

  // Setup real-time listeners
  const setupListeners = () => {
    // Spools listener
    const spoolsQuery = query(collection(spoolsDb, 'spools'))
    unsubscribeSpools = onSnapshot(spoolsQuery, (snapshot) => {
      spools.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      isLoading.value = false
    }, (error) => {
      console.error('Spools listener error:', error)
      toast.error('Ошибка загрузки катушек')
    })

    // Settings listener
    const settingsDoc = doc(spoolsDb, 'metadata', 'config')
    unsubscribeSettings = onSnapshot(settingsDoc, (docSnap) => {
      if (docSnap.exists()) {
        settings.value = docSnap.data()
      } else {
        // Create default settings
        setDoc(settingsDoc, settings.value)
      }
    })
  }

  // CRUD Operations
  const addSpool = async (spoolData) => {
    try {
      const data = {
        ...spoolData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await addDoc(collection(spoolsDb, 'spools'), data)
      toast.success('Катушка добавлена')
    } catch (error) {
      console.error('Add spool error:', error)
      toast.error('Ошибка добавления катушки')
      throw error
    }
  }

  const updateSpool = async (id, spoolData) => {
    try {
      const data = {
        ...spoolData,
        updatedAt: serverTimestamp()
      }
      await updateDoc(doc(spoolsDb, 'spools', id), data)
      toast.success('Катушка обновлена')
    } catch (error) {
      console.error('Update spool error:', error)
      toast.error('Ошибка обновления катушки')
      throw error
    }
  }

  const deleteSpool = async (id) => {
    try {
      await deleteDoc(doc(spoolsDb, 'spools', id))
      toast.success('Катушка удалена')
    } catch (error) {
      console.error('Delete spool error:', error)
      toast.error('Ошибка удаления катушки')
      throw error
    }
  }

  const bulkDeleteSpools = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(spoolsDb, 'spools', id))))
      toast.success(`Удалено катушек: ${ids.length}`)
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('Ошибка массового удаления')
      throw error
    }
  }

  const bulkUpdateSpools = async (ids, updates) => {
    try {
      const data = {
        ...updates,
        updatedAt: serverTimestamp()
      }
      await Promise.all(ids.map(id => updateDoc(doc(spoolsDb, 'spools', id), data)))
      toast.success(`Обновлено катушек: ${ids.length}`)
    } catch (error) {
      console.error('Bulk update error:', error)
      toast.error('Ошибка массового обновления')
      throw error
    }
  }

  // Settings
  const updateSettings = async (newSettings) => {
    try {
      await setDoc(doc(spoolsDb, 'metadata', 'config'), newSettings)
      toast.success('Настройки сохранены')
    } catch (error) {
      console.error('Update settings error:', error)
      toast.error('Ошибка сохранения настроек')
      throw error
    }
  }

  // Helpers
  const getNextSeq = () => {
    if (spools.value.length === 0) return 1
    return Math.max(...spools.value.map(s => s.globalSeq || 0)) + 1
  }

  const checkSerialExists = (serial, excludeId = null) => {
    return spools.value.some(s => s.serial === serial && s.id !== excludeId)
  }

  const checkSeqExists = (seq, excludeId = null) => {
    return spools.value.some(s => s.globalSeq === seq && s.id !== excludeId)
  }

  // Cleanup
  const cleanup = () => {
    if (unsubscribeSpools) unsubscribeSpools()
    if (unsubscribeSettings) unsubscribeSettings()
  }

  return {
    // State
    spools,
    settings,
    isLoading,
    isConnected,
    
    // Computed
    totalCount,
    chineseCount,
    faveroCount,
    
    // Methods
    init,
    cleanup,
    addSpool,
    updateSpool,
    deleteSpool,
    bulkDeleteSpools,
    bulkUpdateSpools,
    updateSettings,
    getNextSeq,
    checkSerialExists,
    checkSeqExists
  }
})

