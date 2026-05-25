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

⚠️ **The `.gitignore` file prevents `firebase-config.js` from being committed**

Before pushing to GitHub:
```bash
# Make sure firebase-config.js is NOT committed (it's in .gitignore)
git status

# You should see: "nothing to commit, working tree clean"
# And firebase-config.js should NOT appear in the list
```

## After Pushing to GitHub

1. **Update README.md** with your GitHub username in clone command
2. **Share** the repository link
3. **Update firebase-config.js** locally with your own credentials
4. Never push `firebase-config.js` to GitHub!

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
- Keep `firebase-config.js` in `.gitignore`
- Store credentials securely locally
- Use environment variables in production

❌ DON'T:
- Commit `firebase-config.js` to GitHub
- Share API keys in code comments
- Push .env files with secrets

## Documentation for Others

When someone clones your repo, they need to:

1. Copy your README.md instructions
2. Follow FIREBASE_SETUP.md
3. Create their own Firebase project
4. Get their own credentials
5. Update `firebase-config.js` locally
6. Never commit `firebase-config.js`

---

**Your repository is ready for GitHub!** 🚀
