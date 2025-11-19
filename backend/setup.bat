@echo off
echo 🚀 Wordly Backend Setup
echo =======================

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env created. Please edit it with your database credentials.
) else (
    echo ✅ .env already exists
)

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo ✅ Backend setup complete!
echo.
echo Next steps:
echo 1. Edit .env with your MySQL credentials
echo 2. Run: mysql -u root -p ^< database.sql
echo 3. Run: npm run dev
pause
