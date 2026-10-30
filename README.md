# AyurSutra — Clinic Management System

A full-stack clinic-management starter project built with React, Tailwind CSS, Node.js, Express, MongoDB, JWT, and bcrypt.

## Features
- User registration and login with JWT authentication
- Patient CRUD
- Appointment CRUD
- Billing records
- Medicine/supply inventory CRUD
- Responsive React interface
- REST API with validation and centralized error handling

> This is a portfolio/demo project, not a certified medical-record system. Use synthetic data only. Before real clinical use, add authorization roles, audit logs, backups, privacy/security reviews, and applicable legal compliance.

## Project structure
```text
AyurSutra/
├── client/      # React + Vite + Tailwind
└── server/      # Express REST API + MongoDB
```

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas database
- Git (optional)

## 1. Configure the backend
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and fill in values:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ayursutra
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```
Start the API:
```bash
npm run dev
```
API health check: `http://localhost:5000/api/health`

## 2. Configure the frontend
Open another terminal:
```bash
cd client
npm install
```
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend:
```bash
npm run dev
```
Open `http://localhost:5173`.

## Demo workflow
1. Register a new account from the app.
2. Log in.
3. Add patients, appointments, bills, and inventory items.
4. Use the dashboard to review summary counts.

## API overview
All routes except registration/login and health require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET/POST | `/api/patients` | List/create patients |
| GET/PUT/DELETE | `/api/patients/:id` | Read/update/delete patient |
| GET/POST | `/api/appointments` | List/create appointments |
| PUT/DELETE | `/api/appointments/:id` | Update/delete appointment |
| GET/POST | `/api/bills` | List/create bills |
| GET/PUT/DELETE | `/api/bills/:id` | Manage bill |
| GET/POST | `/api/inventory` | List/create inventory items |
| PUT/DELETE | `/api/inventory/:id` | Update/delete inventory item |

## Production checklist
- Use a strong, unique `JWT_SECRET`; never commit `.env`.
- Configure MongoDB network access and credentials securely.
- Add role-based authorization and request rate limiting.
- Use HTTPS, secure token storage strategy, validation, logging, backups, and tests.
- Configure Vercel/server hosting and MongoDB Atlas environment variables separately.
