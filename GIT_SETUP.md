# Esco Loans - Git Configuration

## Initial Setup Steps

```bash
# 1. Navigate to project directory
cd /home/erchad/Desktop/EscoLoans

# 2. Initialize git (already done)
# git init

# 3. Add all files to git
git add .

# 4. Create initial commit
git commit -m "Initial commit: Esco Loans System with Firebase backend"

# 5. Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/esco-loans.git

# 6. Rename branch to main (if needed)
git branch -M main

# 7. Push to GitHub
git push -u origin main
```

## GitHub Repository Setup

1. **Create Repository on GitHub**
   - Go to https://github.com/new
   - Name: `esco-loans`
   - Description: `A modern loan application platform for financial relief`
   - Choose: Public (to share) or Private (for private use)
   - DO NOT initialize with README (you already have one)
   - Click "Create repository"

2. **Follow GitHub Instructions**
   - Copy the commands from GitHub
   - Paste in terminal
   - Your code will be uploaded!

## Important: Firebase Credentials

⚠️ **Firebase values are now expected from environment variables**

Before deploying to Vercel:
```bash
# Check the example variable names
cat .env.example

# Keep real values in local env files or Vercel project settings
git status
```

## After Pushing to GitHub

1. **Update README.md** with your GitHub username in clone command
2. **Share** the repository link
3. **Set Firebase environment variables** in Vercel
4. Keep real values out of committed `.env` files

## Common Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Protecting Your Firebase Credentials

✅ DO:
- Store credentials securely locally
- Use environment variables in production
- Set the same values in Vercel project settings

❌ DON'T:
- Share API keys in code comments
- Push `.env` files with secrets

## Documentation for Others

When someone clones your repo, they need to:

1. Copy your README.md instructions
2. Follow FIREBASE_SETUP.md
3. Create their own Firebase project
4. Get their own credentials
5. Create local env values if needed
6. Never commit secret `.env` files

---

**Your repository is ready for GitHub!** 🚀
