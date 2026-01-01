# Руководство разработчика

## Установка и запуск

### Требования
- Node.js 18+ 
- npm 9+

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

### Сборка для продакшена
```bash
npm run build
```

### Предпросмотр сборки
```bash
npm run preview
```

## Структура проекта

```
src/
├── assets/              # Стили и статические ресурсы
│   └── main.css        # Главный файл стилей (Tailwind)
│
├── components/          # Vue компоненты
│   ├── common/         # Общие компоненты
│   │   ├── AppLayout.vue       # Главный layout с навигацией
│   │   └── ToastContainer.vue  # Контейнер уведомлений
│   ├── masks/          # Компоненты для масок (TODO)
│   └── spools/         # Компоненты для катушек (TODO)
│
├── composables/         # Композиции (Vue Composition API)
│   └── useScanner.js   # Хук для QR-сканера
│
├── config/             # Конфигурация
│   └── firebase.js     # Настройки Firebase
│
├── router/             # Vue Router
│   └── index.js        # Маршруты приложения
│
├── stores/             # Pinia stores (state management)
│   ├── masks.js        # Store для масок
│   ├── spools.js       # Store для катушек
│   ├── theme.js        # Store для темы
│   └── toast.js        # Store для уведомлений
│
├── utils/              # Утилиты
│   ├── csv.js          # Работа с CSV
│   └── print.js        # Печать этикеток и паспортов
│
├── views/              # Страницы приложения
│   ├── MasksView.vue   # Страница масок
│   └── SpoolsView.vue  # Страница катушек
│
├── App.vue             # Корневой компонент
└── main.js             # Точка входа

```

## Технологии

### Frontend
- **Vue 3** - Прогрессивный JavaScript фреймворк
- **Vite** - Быстрый сборщик модулей
- **Vue Router** - Официальный роутер для Vue
- **Pinia** - Официальный store для Vue (замена Vuex)
- **TailwindCSS** - Utility-first CSS фреймворк

### Backend
- **Firebase Firestore** - NoSQL база данных
- **Firebase Auth** - Аутентификация (анонимная)
- **IndexedDB Persistence** - Оффлайн режим

### Библиотеки
- **qrcode** - Генерация QR-кодов
- **html5-qrcode** - Сканирование QR-кодов
- **jsbarcode** - Генерация штрихкодов
- **jspdf** - Генерация PDF
- **html2canvas** - Рендеринг HTML в canvas
- **papaparse** - Парсинг CSV
- **chart.js** - Графики и диаграммы

## Добавление новых компонентов

### Создание компонента для масок

```vue
<!-- src/components/masks/MaskEditor.vue -->
<template>
  <div class="card p-6">
    <!-- Ваш код -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMasksStore } from '@/stores/masks'

const masksStore = useMasksStore()
// Ваша логика
</script>
```

### Использование в странице

```vue
<script setup>
import MaskEditor from '@/components/masks/MaskEditor.vue'
</script>

<template>
  <MaskEditor />
</template>
```

## Работа с Firebase

### Добавление записи
```js
await masksStore.addMask({
  serial: 'A-105',
  model: 'Рапира',
  size: 'M',
  // ...
})
```

### Обновление записи
```js
await masksStore.updateMask(id, {
  size: 'L'
})
```

### Удаление записи
```js
await masksStore.deleteMask(id)
```

## Стилизация

Проект использует TailwindCSS. Основные классы определены в `src/assets/main.css`.

### Примеры использования

```vue
<!-- Кнопка -->
<button class="btn-primary">Сохранить</button>

<!-- Карточка -->
<div class="card p-4">Контент</div>

<!-- Input -->
<input class="input" type="text" />

<!-- Badge -->
<span class="badge badge-success">Активно</span>
```

### Кастомные классы

Все кастомные классы определены в `@layer components` в `main.css`:
- `.glass` - эффект матового стекла
- `.card` - карточка с тенью
- `.btn-*` - кнопки разных стилей
- `.badge-*` - значки разных цветов

## Темная тема

Тема переключается автоматически через `useThemeStore`:

```vue
<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <button @click="themeStore.toggleTheme">
    Переключить тему
  </button>
</template>
```

Для стилей используйте модификатор `dark:`:

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Контент
</div>
```

## Уведомления (Toast)

```vue
<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const showNotification = () => {
  toast.success('Успешно!')
  toast.error('Ошибка!')
  toast.warning('Внимание!')
  toast.info('Информация')
}
</script>
```

## Отладка

### Vue DevTools
Установите расширение Vue DevTools для Chrome/Firefox

### Console Logs
Firebase логи можно увидеть в консоли браузера

### Network Tab
Проверяйте запросы к Firebase в Network tab

## Рекомендации

1. **Используйте Composition API** вместо Options API
2. **Следуйте структуре проекта** при добавлении файлов
3. **Пишите комментарии** для сложной логики
4. **Тестируйте на мобильных** устройствах
5. **Проверяйте темную тему** при добавлении стилей
6. **Используйте TypeScript** (опционально, можно добавить позже)

## Полезные команды

```bash
# Установка новой зависимости
npm install package-name

# Удаление зависимости
npm uninstall package-name

# Обновление зависимостей
npm update

# Проверка устаревших пакетов
npm outdated

# Очистка node_modules и переустановка
rm -rf node_modules package-lock.json
npm install
```

## Troubleshooting

### Проблема: Vite не запускается
**Решение**: Проверьте версию Node.js (должна быть 18+)

### Проблема: Firebase не подключается
**Решение**: Проверьте конфигурацию в `src/config/firebase.js`

### Проблема: Стили не применяются
**Решение**: Убедитесь, что Tailwind правильно настроен в `tailwind.config.js`

### Проблема: Сканер не работает
**Решение**: Проверьте, что приложение запущено через HTTPS или localhost

