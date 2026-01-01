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
  where,
  orderBy
} from 'firebase/firestore'
import { masksDb } from '@/config/firebase'
import { useToastStore } from './toast'

export const useShipmentsStore = defineStore('shipments', () => {
  const toast = useToastStore()
  
  const shipments = ref([])
  const buffer = ref([]) // Буфер отгрузки (корзина)
  const isLoading = ref(true)
  
  let unsubscribe = null

  // Computed
  const totalShipments = computed(() => shipments.value.length)
  const pendingShipments = computed(() => shipments.value.filter(s => s.status === 'pending').length)
  const completedShipments = computed(() => shipments.value.filter(s => s.status === 'completed').length)
  const bufferCount = computed(() => buffer.value.length)

  // Статусы
  const STATUSES = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  }

  const STATUS_LABELS = {
    pending: 'Ожидает',
    in_progress: 'В процессе',
    completed: 'Завершена',
    cancelled: 'Отменена'
  }

  // Initialize
  const init = async () => {
    try {
      // Load buffer from localStorage
      const savedBuffer = localStorage.getItem('shipmentBuffer')
      if (savedBuffer) {
        buffer.value = JSON.parse(savedBuffer)
      }

      // Setup listener for shipments
      const shipmentsQuery = query(
        collection(masksDb, 'shipments'),
        orderBy('createdAt', 'desc')
      )
      
      unsubscribe = onSnapshot(shipmentsQuery, (snapshot) => {
        shipments.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        isLoading.value = false
      }, (error) => {
        console.error('Shipments listener error:', error)
        toast.error('Ошибка загрузки отгрузок')
        isLoading.value = false
      })
    } catch (error) {
      console.error('Shipments init error:', error)
      toast.error('Ошибка инициализации отгрузок')
      isLoading.value = false
    }
  }

  // Buffer operations
  const addToBuffer = (item) => {
    // Check if item already in buffer
    const exists = buffer.value.find(i => i.id === item.id && i.type === item.type)
    if (exists) {
      toast.warning('Товар уже в буфере отгрузки')
      return
    }

    buffer.value.push({
      ...item,
      addedAt: new Date().toISOString()
    })
    
    saveBufferToStorage()
    toast.success('Добавлено в буфер отгрузки')
  }

  const removeFromBuffer = (index) => {
    buffer.value.splice(index, 1)
    saveBufferToStorage()
    toast.success('Удалено из буфера')
  }

  const clearBuffer = () => {
    buffer.value = []
    saveBufferToStorage()
    toast.success('Буфер очищен')
  }

  const saveBufferToStorage = () => {
    localStorage.setItem('shipmentBuffer', JSON.stringify(buffer.value))
  }

  // Shipment CRUD
  const createShipment = async (shipmentData) => {
    try {
      if (buffer.value.length === 0) {
        toast.error('Буфер отгрузки пуст')
        return
      }

      const data = {
        ...shipmentData,
        items: buffer.value.map(item => ({
          id: item.id,
          type: item.type,
          serial: item.serial,
          model: item.model || item.wireType,
          size: item.size,
          details: item
        })),
        status: STATUSES.PENDING,
        itemsCount: buffer.value.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(masksDb, 'shipments'), data)
      
      // Update items status to 'shipped'
      // This would require updating masks/spools stores
      
      clearBuffer()
      toast.success('Отгрузка создана')
    } catch (error) {
      console.error('Create shipment error:', error)
      toast.error('Ошибка создания отгрузки')
      throw error
    }
  }

  const updateShipment = async (id, updates) => {
    try {
      const data = {
        ...updates,
        updatedAt: serverTimestamp()
      }
      await updateDoc(doc(masksDb, 'shipments', id), data)
      toast.success('Отгрузка обновлена')
    } catch (error) {
      console.error('Update shipment error:', error)
      toast.error('Ошибка обновления отгрузки')
      throw error
    }
  }

  const deleteShipment = async (id) => {
    try {
      await deleteDoc(doc(masksDb, 'shipments', id))
      toast.success('Отгрузка удалена')
    } catch (error) {
      console.error('Delete shipment error:', error)
      toast.error('Ошибка удаления отгрузки')
      throw error
    }
  }

  const changeStatus = async (id, newStatus) => {
    try {
      await updateShipment(id, { status: newStatus })
      toast.success(`Статус изменён на "${STATUS_LABELS[newStatus]}"`)
    } catch (error) {
      console.error('Change status error:', error)
    }
  }

  // Cleanup
  const cleanup = () => {
    if (unsubscribe) unsubscribe()
  }

  return {
    // State
    shipments,
    buffer,
    isLoading,
    
    // Computed
    totalShipments,
    pendingShipments,
    completedShipments,
    bufferCount,
    
    // Constants
    STATUSES,
    STATUS_LABELS,
    
    // Methods
    init,
    cleanup,
    addToBuffer,
    removeFromBuffer,
    clearBuffer,
    createShipment,
    updateShipment,
    deleteShipment,
    changeStatus
  }
})

