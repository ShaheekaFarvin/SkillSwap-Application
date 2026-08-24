# Phase 3 — Application & UI/UX Design

## 3.1 System Architecture
React frontend → REST API → Node.js/Express backend → MySQL database.

## 3.2 User Roles
Normal users can manage profiles, skills, learning requests, swaps, sessions and reviews. Administrators can manage users, categories, skills and monitoring data.

## 3.3 User Flow
Register → Login → Profile → Add Skills → Find Skill → View Teacher → Send Swap Request → Accept/Reject → Schedule Session → Complete → Review.

## 3.4 Pages
Public: Home, About/Browse, Login, Register.
User: Dashboard, Profile, My Skills, Find Skills, Requests, Sessions, Reviews, Settings.
Admin: Dashboard, Users, Categories, Skills, Requests, Sessions.

## 3.5 Wireframes
The frontend in this project implements the core screens described by the Phase 3 wireframes: home, dashboard, find skills, profile, requests, sessions and reviews.

## 3.6 UI/UX
Modern card-based interface, clear status badges, consistent forms/buttons, accessible contrast, responsive layouts and feedback messages.

## 3.7 Navigation
Desktop navigation and responsive mobile behavior are implemented in the React shell.

## 3.8 Responsive Design
The CSS adapts the layout for desktop, tablet and mobile widths without requiring horizontal scrolling.

## 3.9 Validation & Security
Client-side form constraints are combined with server-side validation. JWT authentication, bcrypt password hashing, parameterized SQL queries, foreign keys, UNIQUE constraints and role checks are implemented.
