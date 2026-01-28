#!/bin/bash

# Lion Dine API - Setup and Deploy Script
# This script helps you prepare and deploy your API to Railway

set -e  # Exit on error

echo "🦁 Lion Dine Menu API - Setup and Deploy"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the liondine directory?"
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating .env.example as template..."
    echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
    echo ""
    echo "❗ IMPORTANT: Edit .env and add your OpenAI API key before deploying!"
    echo "   Get your key from: https://platform.openai.com/api-keys"
    echo ""
else
    echo "✅ Found .env file"
    
    # Check if OPENAI_API_KEY is set
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        echo "✅ OpenAI API key appears to be configured"
    else
        echo "⚠️  Warning: OpenAI API key may not be properly configured in .env"
        echo "   Make sure it starts with: OPENAI_API_KEY=sk-..."
    fi
    echo ""
fi

# Test build
echo "🔨 Testing production build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    echo "✅ Git initialized"
    echo ""
else
    echo "✅ Git already initialized"
    echo ""
fi

# Add files
echo "📝 Staging files for commit..."
git add .
echo "✅ Files staged"
echo ""

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "📝 Creating commit..."
    git commit -m "Setup Lion Dine Menu API for deployment" || echo "ℹ️  Commit created or already exists"
    echo ""
fi

echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "📋 Next Steps for Railway Deployment:"
echo ""
echo "1️⃣  Create a GitHub repository:"
echo "   → Go to: https://github.com/new"
echo "   → Name it: liondine-api"
echo "   → Keep it public or private"
echo "   → DO NOT add README, .gitignore, or license"
echo ""
echo "2️⃣  Push to GitHub:"
echo "   Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/liondine-api.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3️⃣  Deploy on Railway:"
echo "   → Go to: https://railway.app"
echo "   → Click 'New Project'"
echo "   → Select 'Deploy from GitHub repo'"
echo "   → Select your liondine-api repository"
echo "   → Add environment variable:"
echo "     - Key: OPENAI_API_KEY"
echo "     - Value: sk-proj-... (from your .env file)"
echo "   → Deploy!"
echo ""
echo "4️⃣  Get your URL:"
echo "   → In Railway: Settings → Domains"
echo "   → Click 'Generate Domain'"
echo "   → Your API: https://your-app.up.railway.app"
echo ""
echo "========================================"
echo "📚 Documentation:"
echo "   • Full guide: RAILWAY_DEPLOYMENT.md"
echo "   • Quick guide: DEPLOY.md"
echo "   • For iOS dev: FOR_IOS_DEVELOPER.md"
echo "========================================"
echo ""
echo "🎉 Ready to deploy!"
