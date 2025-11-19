#!/bin/bash

echo "🚀 Wordly Backend Setup"
echo "======================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env created. Please edit it with your database credentials."
else
    echo "✅ .env already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your MySQL credentials"
echo "2. Run: mysql -u root -p < database.sql"
echo "3. Run: npm run dev"
