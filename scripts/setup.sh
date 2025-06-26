#!/bin/bash

echo "🎬 Setting up Grainydays Drinking Game Generator..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Setting up database..."
npm run db:push

echo "✅ Setup complete!"
echo ""
echo "🚀 Your app is now running at: http://localhost:5173"
echo "🗄️ Database is available at: localhost:5432"
echo ""
echo "📝 Next steps:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Select a video and set your intoxication level"
echo "3. Generate your drinking game!"
echo ""
echo "🛠️ Development commands:"
echo "- View logs: docker-compose logs -f"
echo "- Stop services: docker-compose down"
echo "- Restart services: docker-compose restart" 