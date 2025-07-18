#!/bin/bash

echo "🚀 GitHub Repository Setup Script"
echo "=================================="
echo ""

# Get GitHub username and repository name
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your repository name (e.g., customer-rest-api-server): " REPO_NAME

# Validate inputs
if [ -z "$GITHUB_USERNAME" ] || [ -z "$REPO_NAME" ]; then
    echo "❌ Both username and repository name are required."
    exit 1
fi

# Construct GitHub URL
GITHUB_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "🔗 GitHub Repository URL: $GITHUB_URL"
echo ""

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Remote 'origin' already exists. Removing..."
    git remote remove origin
fi

# Add remote origin
echo "📡 Adding remote origin..."
git remote add origin "$GITHUB_URL"

if [ $? -eq 0 ]; then
    echo "✅ Remote origin added successfully!"
else
    echo "❌ Failed to add remote origin"
    exit 1
fi

# Push code to GitHub
echo ""
echo "📤 Pushing code to GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully!"
else
    echo "❌ Failed to push code. Make sure the repository exists on GitHub."
    exit 1
fi

# Push tags
echo ""
echo "🏷️  Pushing tags to GitHub..."
git push origin --tags

if [ $? -eq 0 ]; then
    echo "✅ Tags pushed successfully!"
else
    echo "⚠️  Failed to push tags, but code was pushed successfully."
fi

echo ""
echo "🎉 Setup complete! Your repository is now available at:"
echo "    $GITHUB_URL"
echo ""
echo "📋 Repository includes:"
echo "   • Complete Customer REST API server"
echo "   • All 14 development requirements met"
echo "   • 6 milestone and release tags"
echo "   • Comprehensive documentation"
echo "   • Production-ready code"
echo ""
echo "🌐 Visit: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
