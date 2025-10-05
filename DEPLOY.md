# Frontend Deployment Guide for Dokploy

## Настройки для Dokploy

### 1. Создание проекта в Dokploy
- **Название**: `dayzone-frontend`
- **Тип**: `Docker`
- **Репозиторий**: ваш GitHub репозиторий с frontend

### 2. Настройки сборки
- **Dockerfile Path**: `frontend/Dockerfile` (или `frontend/Dockerfile.simple` если проблемы с ESLint)
- **Build Context**: корень проекта
- **Port**: `80`

### 2.1 Альтернативный Dockerfile
Если возникают проблемы с ESLint, используйте `Dockerfile.simple`:
- **Dockerfile Path**: `frontend/Dockerfile.simple`

### 3. Environment Variables
```
REACT_APP_API_URL=http://85.215.53.87:5000/api
GENERATE_SOURCEMAP=false
CI=false
ESLINT_NO_DEV_ERRORS=true
```

### 4. Домен
- **Домен**: `dayzone-frontend.traefik.me` (или ваш домен)
- **HTTPS**: автоматический через Let's Encrypt

## Файлы для деплоя

1. **Dockerfile** - многоэтапная сборка React + Nginx
2. **nginx.conf** - конфигурация веб-сервера
3. **docker-compose.yml** - для локального тестирования
4. **.env.production** - production переменные
5. **package.json** - с отключенным CI режимом

## Команды для сборки

```bash
# Локальная сборка
docker build -t dayzone-frontend .

# Запуск
docker run -p 3000:80 dayzone-frontend
```

## Доступ к приложению

После деплоя приложение будет доступно по адресу:
- **Frontend**: `https://dayzone-frontend.traefik.me`
- **API**: `http://85.215.53.87:5000/api`
