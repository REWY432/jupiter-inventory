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
  serverTimestamp 
} from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { masksDb, masksAuth } from '@/config/firebase'
import { useToastStore } from './toast'

export const useMasksStore = defineStore('masks', () => {
  const toast = useToastStore()
  
  const masks = ref([])
  const generations = ref([])
  const isLoading = ref(true)
  const isConnected = ref(false)
  
  let unsubscribeMasks = null
  let unsubscribeGenerations = null

  // Computed
  const totalCount = computed(() => masks.value.length)
  const rapierCount = computed(() => masks.value.filter(m => m.model === 'Рапира').length)
  const epeeCount = computed(() => masks.value.filter(m => m.model === 'Шпага').length)
  const sabreCount = computed(() => masks.value.filter(m => m.model === 'Сабля').length)
  const coachCount = computed(() => masks.value.filter(m => m.model === 'Тренер').length)

  // Initialize
  const init = async () => {
    try {
      // Try anonymous auth, but continue even if it fails
      try {
        await signInAnonymously(masksAuth)
      } catch (authError) {
        console.warn('Anonymous auth not enabled, continuing without auth:', authError.code)
      }
      
      isConnected.value = true
      setupListeners()
    } catch (error) {
      console.error('Masks init error:', error)
      toast.error('Ошибка подключения к базе масок')
      isConnected.value = false
    }
  }

  // Setup real-time listeners
  const setupListeners = () => {
    // Masks listener
    const masksQuery = query(collection(masksDb, 'masks'))
    unsubscribeMasks = onSnapshot(masksQuery, (snapshot) => {
      masks.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      isLoading.value = false
    }, (error) => {
      console.error('Masks listener error:', error)
      toast.error('Ошибка загрузки масок')
    })

    // Generations listener
    const generationsQuery = query(collection(masksDb, 'generations'))
    unsubscribeGenerations = onSnapshot(generationsQuery, (snapshot) => {
      generations.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => (a.code || '').localeCompare(b.code || ''))
    })
  }

  // CRUD Operations
  const addMask = async (maskData) => {
    try {
      const data = {
        ...maskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await addDoc(collection(masksDb, 'masks'), data)
      toast.success('Маска добавлена')
    } catch (error) {
      console.error('Add mask error:', error)
      toast.error('Ошибка добавления маски')
      throw error
    }
  }

  const updateMask = async (id, maskData) => {
    try {
      const data = {
        ...maskData,
        updatedAt: serverTimestamp()
      }
      await updateDoc(doc(masksDb, 'masks', id), data)
      toast.success('Маска обновлена')
    } catch (error) {
      console.error('Update mask error:', error)
      toast.error('Ошибка обновления маски')
      throw error
    }
  }

  const deleteMask = async (id) => {
    try {
      await deleteDoc(doc(masksDb, 'masks', id))
      toast.success('Маска удалена')
    } catch (error) {
      console.error('Delete mask error:', error)
      toast.error('Ошибка удаления маски')
      throw error
    }
  }

  const bulkDeleteMasks = async (ids) => {
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(masksDb, 'masks', id))))
      toast.success(`Удалено масок: ${ids.length}`)
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('Ошибка массового удаления')
      throw error
    }
  }

  const bulkUpdateMasks = async (ids, updates) => {
    try {
      const data = {
        ...updates,
        updatedAt: serverTimestamp()
      }
      await Promise.all(ids.map(id => updateDoc(doc(masksDb, 'masks', id), data)))
      toast.success(`Обновлено масок: ${ids.length}`)
    } catch (error) {
      console.error('Bulk update error:', error)
      toast.error('Ошибка массового обновления')
      throw error
    }
  }

  // Generations CRUD
  const addGeneration = async (genData) => {
    try {
      await addDoc(collection(masksDb, 'generations'), genData)
      toast.success('Поколение добавлено')
    } catch (error) {
      console.error('Add generation error:', error)
      toast.error('Ошибка добавления поколения')
      throw error
    }
  }

  const updateGeneration = async (id, genData) => {
    try {
      await updateDoc(doc(masksDb, 'generations', id), genData)
      toast.success('Поколение обновлено')
    } catch (error) {
      console.error('Update generation error:', error)
      toast.error('Ошибка обновления поколения')
      throw error
    }
  }

  const deleteGeneration = async (id) => {
    try {
      await deleteDoc(doc(masksDb, 'generations', id))
      toast.success('Поколение удалено')
    } catch (error) {
      console.error('Delete generation error:', error)
      toast.error('Ошибка удаления поколения')
      throw error
    }
  }

  // Helpers
  const getNextSeq = () => {
    if (masks.value.length === 0) return 1
    return Math.max(...masks.value.map(m => m.globalSeq || 0)) + 1
  }

  const checkSerialExists = (serial, excludeId = null) => {
    return masks.value.some(m => m.serial === serial && m.id !== excludeId)
  }

  const checkSeqExists = (seq, excludeId = null) => {
    return masks.value.some(m => m.globalSeq === seq && m.id !== excludeId)
  }

  // Cleanup
  const cleanup = () => {
    if (unsubscribeMasks) unsubscribeMasks()
    if (unsubscribeGenerations) unsubscribeGenerations()
  }

  return {
    // State
    masks,
    generations,
    isLoading,
    isConnected,
    
    // Computed
    totalCount,
    rapierCount,
    epeeCount,
    sabreCount,
    coachCount,
    
    // Methods
    init,
    cleanup,
    addMask,
    updateMask,
    deleteMask,
    bulkDeleteMasks,
    bulkUpdateMasks,
    addGeneration,
    updateGeneration,
    deleteGeneration,
    getNextSeq,
    checkSerialExists,
    checkSeqExists
  }
})

