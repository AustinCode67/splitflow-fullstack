# SplitFlow

SplitFlow is a full-stack group expense sharing web application that helps users manage shared expenses, split costs, record payments, and track settlements within groups.

## Live Demo

https://splitflow-frontend-sepia.vercel.app

## Features

- User registration and login
- JWT-based authentication
- Create and manage expense groups
- Add and remove group members
- Create and manage expenses
- Equal, exact, and percentage-based expense splitting
- Record payments between members
- Calculate balances and settlement recommendations
- Group budgets
- Expense analytics
- Activity history
- Responsive user interface

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- REST APIs

### Database
- PostgreSQL

### Deployment
- Vercel – Frontend
- Railway – Backend and PostgreSQL

### Version Control
- Git
- GitHub

## System Architecture

User  
↓  
React Frontend – Vercel  
↓  
REST API  
↓  
Spring Boot Backend – Railway  
↓  
PostgreSQL Database – Railway

## Security

SplitFlow uses Spring Security and JWT authentication to protect secured API endpoints. Users receive a JWT after successful login, which is included in subsequent authenticated API requests.

## Project Structure

```text
splitflow/
├── splitflow/              # Spring Boot backend
├── splitflow-frontend/     # React frontend
├── .gitignore
└── README.md
