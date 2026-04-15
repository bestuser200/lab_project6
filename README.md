# ЛР6 — CI/CD для парковки

Проект уже содержит:
- unit-тесты (Jest)
- API/BDD тесты (Cucumber + Supertest)
- UI-тесты (Playwright)
- GitHub Actions workflow: `.github/workflows/ci.yml`

## Быстрый старт
1. `npm install`
2. `npm run test:unit`
3. `npm run test:api`
4. `npx playwright install`
5. `npm run test:ui`
6. `npm start`

## Структура
- `src/` — бизнес-логика
- `__tests__/` — unit-тесты
- `features/`, `steps/` — BDD/API
- `public/` — интерфейс
- `e2e/` — UI-тесты
- `.github/workflows/ci.yml` — CI pipeline
