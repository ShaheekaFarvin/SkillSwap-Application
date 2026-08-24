# Phase 2 — Complete Database Design

## 2.1 Entities
1. USERS
2. CATEGORIES
3. SKILLS
4. USER_SKILLS
5. LEARNING_REQUESTS
6. SWAP_REQUESTS
7. SESSIONS
8. REVIEWS

## 2.2 Relationships
- CATEGORIES 1:M SKILLS
- USERS 1:M USER_SKILLS
- SKILLS 1:M USER_SKILLS
- USERS 1:M LEARNING_REQUESTS
- SKILLS 1:M LEARNING_REQUESTS
- USERS 1:M SWAP_REQUESTS as requester
- USERS 1:M SWAP_REQUESTS as receiver
- SKILLS 1:M SWAP_REQUESTS as offered skill
- SKILLS 1:M SWAP_REQUESTS as requested skill
- SWAP_REQUESTS 1:M SESSIONS
- SESSIONS 1:M REVIEWS
- USERS 1:M REVIEWS

## 2.3–2.4 ER Model
USER_SKILLS resolves the conceptual many-to-many relationship between USERS and SKILLS. SWAP_REQUESTS contains two references to USERS and two references to SKILLS.

## 2.5 Relational Schema
See `database/schema.sql`.

## 2.6 Normalization
The design uses atomic attributes (1NF), separates partial dependencies (2NF), and separates category information from skills to remove transitive dependencies (3NF).

## 2.7 MySQL
See `database/schema.sql`.

## 2.8 Sample Data & CRUD
See `database/seed.sql`. The application exposes create/read/update/delete workflows through the REST API.
