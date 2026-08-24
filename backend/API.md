# SkillSwap API

Base URL: `/api`

## Auth
- POST `/auth/register`
- POST `/auth/login`

## Skills
- GET `/skills?q=`
- GET `/skills/categories`
- GET `/skills/:id/teachers`
- GET `/skills/mine/list` (auth)
- POST `/skills/mine` (auth)
- DELETE `/skills/mine/:id` (auth)

## Users
- GET `/users/me` (auth)
- PUT `/users/me` (auth)
- GET `/users/search?q=` (auth)

## Requests and Sessions
- POST `/requests/learning` (auth)
- GET `/requests/learning/mine` (auth)
- POST `/requests/swap` (auth)
- GET `/requests/swap` (auth)
- PATCH `/requests/swap/:id` (auth)
- POST `/requests/sessions` (auth)
- GET `/requests/sessions` (auth)
- PATCH `/requests/sessions/:id` (auth)
- POST `/requests/reviews` (auth)

## Admin
- GET `/admin/stats` (admin)
- GET `/admin/users` (admin)
- POST `/admin/categories` (admin)
- POST `/admin/skills` (admin)
