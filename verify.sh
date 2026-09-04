#!/bin/bash
# DataGuard AI - Build & Verification Script

echo "🛡 DataGuard AI - Extension Verification"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✓ Project structure verified"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

echo "✓ Node.js $(node --version) found"
echo "✓ npm $(npm --version) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install > /dev/null 2>&1
echo "✓ Dependencies installed"
echo ""

# Navigate to extension directory
cd extension

# Build
echo "🔨 Building extension..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Check dist folder
if [ -d "dist" ]; then
    echo "✓ dist/ directory created"
    
    # Verify key files
    files=("manifest.json" "content.js" "background.js" "popup.html" "popup.js" "style.css")
    for file in "${files[@]}"; do
        if [ -f "dist/$file" ]; then
            echo "  ✓ dist/$file"
        else
            echo "  ❌ dist/$file MISSING"
        fi
    done
else
    echo "❌ dist/ directory not created"
    exit 1
fi

echo ""

# Run tests
echo "🧪 Running tests..."
npm run test -- --run > /tmp/test_output.txt 2>&1

if grep -q "Test Files  4 passed" /tmp/test_output.txt; then
    echo "✓ All tests passed"
    test_count=$(grep "Tests  " /tmp/test_output.txt | awk '{print $2}')
    echo "  ✓ $test_count tests passed"
else
    echo "❌ Tests failed"
    cat /tmp/test_output.txt
    exit 1
fi

echo ""
echo "✅ DataGuard AI Extension is ready!"
echo ""
echo "Next steps:"
echo "1. Open Chrome and go to chrome://extensions"
echo "2. Enable 'Developer Mode' (top-right toggle)"
echo "3. Click 'Load unpacked'"
echo "4. Select: dataguard-ai/extension/dist"
echo "5. Go to chatgpt.com and test with demo prompts"
echo ""
echo "📖 See QUICK_START.md for demo scenarios"
echo "📚 See README.md for full documentation"
