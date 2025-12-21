# Cat Game Frontend

Фронтенд Telegram Web App для игры Cat Game. Приложение написано на React + TypeScript и собирается через Vite.

## Быстрый старт

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Запустите dev-сервер:
   ```bash
   npm run dev
   ```
3. Сборка для продакшена:
   ```bash
   npm run build
   ```
4. Предпросмотр сборки:
   ```bash
   npm run preview
   ```

## Переменные окружения

- `VITE_API_BASE_URL` — базовый адрес API бэкенда. По умолчанию используется `http://localhost:8000/api`.

## Архитектура фронта

- Запросы к API проходят через `src/shared/api/httpClient.ts`.
- Глобальное состояние — через `src/shared/store/useGlobalStore.ts`.
- Модальные окна и вспомогательные разделы находятся в `src/components/homeExtraInfo/`.

## Зависимости

- React 19
- Vite
- styled-components
- react-router-dom
- zustand
- @react-three/fiber/@react-three/drei для 3D-сцены

