


@echo off
cd /d "%~dp0"

start cmd /k "cd backend && npm i && npm run dev"
start cmd /k "cd frontend && npm i && npm run dev"
