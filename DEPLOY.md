# Инструкция по деплою на GitHub Pages

## Подготовка репозитория

1. **Создайте новый репозиторий на GitHub**
   - Название: `jupiter-inventory` (или любое другое)
   - Сделайте его публичным или приватным

2. **Инициализируйте Git локально**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Jupiter Inventory System"
   ```

3. **Подключите удаленный репозиторий**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/jupiter-inventory.git
   git branch -M main
   git push -u origin main
   ```

## Настройка GitHub Pages

1. **Перейдите в Settings репозитория**
   - Settings → Pages

2. **Настройте Source**
   - Source: GitHub Actions

3. **Обновите base URL в `vite.config.js`**
   ```js
   base: '/jupiter-inventory/', // Замените на название вашего репозитория
   ```

4. **Закоммитьте изменения**
   ```bash
   git add vite.config.js
   git commit -m "Update base URL for GitHub Pages"
   git push
   ```

## Автоматический деплой

После push в ветку `main`:
- GitHub Actions автоматически соберет проект
- Развернет его на GitHub Pages
- Сайт будет доступен по адресу: `https://YOUR_USERNAME.github.io/jupiter-inventory/`

## Ручной деплой (альтернатива)

Если хотите использовать ручной деплой:

```bash
npm run deploy
```

Это выполнит сборку и отправит файлы в ветку `gh-pages`.

## Проверка деплоя

1. Откройте Actions в репозитории
2. Дождитесь завершения workflow
3. Перейдите по ссылке на ваш сайт

## Важные замечания

- **HTTPS**: GitHub Pages автоматически использует HTTPS
- **Кастомный домен**: Можно настроить в Settings → Pages
- **Кэширование**: При обновлениях может потребоваться Ctrl+F5
- **Firebase**: Убедитесь, что Firebase настроен на работу с вашим доменом

## Обновление сайта

Просто делайте push в main:

```bash
git add .
git commit -m "Update: описание изменений"
git push
```

Сайт обновится автоматически через 1-2 минуты.

