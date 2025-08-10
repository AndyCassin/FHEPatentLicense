# CI/CD Pipeline Documentation

Complete guide to the Continuous Integration and Continuous Deployment pipeline for the Confidential Patent License Platform.

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Code Quality Tools](#code-quality-tools)
4. [Setup Instructions](#setup-instructions)
5. [Workflow Details](#workflow-details)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### CI/CD Features

✅ **Automated Testing** - Tests run on every push and pull request
✅ **Multi-Version Support** - Tests on Node.js 18.x and 20.x
✅ **Cross-Platform** - Tests on Ubuntu and Windows
✅ **Code Quality** - Solhint, ESLint, and Prettier checks
✅ **Coverage Tracking** - Codecov integration
✅ **Security Audits** - Automated dependency vulnerability scanning

### Pipeline Architecture

```
Push/PR → GitHub Actions
    ├── Test Workflow (Node 18.x, 20.x)
    │   ├── Compile Contracts
    │   ├── Run Tests
    │   └── Upload Coverage
    │
    └── Code Quality Workflow
        ├── Solhint (Solidity)
        ├── ESLint (JavaScript)
        ├── Prettier Check
        └── Security Audit
```

---

## GitHub Actions Workflows

### 1. Test Workflow (`.github/workflows/test.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Test Matrix**:
- **Node.js versions**: 18.x, 20.x
- **Operating Systems**: Ubuntu Latest, Windows Latest
- **Total combinations**: 4 (2 versions × 2 OS)

**Steps**:
1. Checkout code
2. Setup Node.js with caching
3. Install dependencies (`npm ci`)
4. Compile smart contracts
5. Run test suite
6. Generate coverage report
7. Upload coverage to Codecov (Ubuntu + Node 20.x only)

**Example Run**:
```yaml
Matrix: { node: 18.x, os: ubuntu-latest }
  ✓ Checkout code
  ✓ Setup Node.js 18.x
  ✓ Install dependencies (45s)
  ✓ Compile contracts (30s)
  ✓ Run tests (25s)
  ✓ Generate coverage (15s)
```

### 2. Code Quality Workflow (`.github/workflows/code-quality.yml`)

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

#### Lint Job
- **Solhint**: Solidity linting
- **Prettier**: Code formatting check
- **ESLint**: JavaScript linting

#### Security Job
- **npm audit**: Dependency vulnerability check
- **Audit report**: JSON report generation

**Example Run**:
```yaml
Lint Job:
  ✓ Run Solhint (5s)
  ✓ Check code formatting (3s)
  ✓ Run ESLint (4s)

Security Job:
  ✓ Run npm audit (8s)
  ✓ Generate audit report (2s)
```

---

## Code Quality Tools

### Solhint Configuration (`.solhint.json`)

Solidity linter configuration:

```json
{
  "extends": "solhint:recommended",
  "rules": {
    "code-complexity": ["error", 10],
    "compiler-version": ["error", "^0.8.24"],
    "func-visibility": ["error", { "ignoreConstructors": true }],
    "max-line-length": ["error", 120],
    "named-parameters-mapping": "warn",
    "no-console": "off",
    "not-rely-on-time": "off"
  }
}
```

**Key Rules**:
- Max cyclomatic complexity: 10
- Compiler version: ^0.8.24
- Max line length: 120 characters
- Function visibility required

### ESLint Configuration (`.eslintrc.json`)

JavaScript linter configuration:

```json
{
  "extends": ["eslint:recommended", "prettier"],
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "off",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

**Key Rules**:
- No unused variables (except prefixed with `_`)
- Console allowed
- Prefer `const` over `let`
- No `var` declarations

### Prettier Configuration (`.prettierrc.json`)

Code formatting configuration:

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5"
}
```

**Standards**:
- Line width: 120 characters
- Indentation: 2 spaces
- Semicolons: Required
- Quotes: Double quotes

### Codecov Configuration (`codecov.yml`)

Coverage reporting configuration:

```yaml
coverage:
  range: "70...100"
  status:
    project:
      target: 70%
    patch:
      target: 70%
```

**Settings**:
- Target coverage: 70%
- Coverage range: 70-100%
- Patch coverage: 70%

---

## Setup Instructions

### 1. Local Setup

Install all dependencies:

```bash
# Install project dependencies
npm install

# This installs:
# - solhint (Solidity linter)
# - eslint (JavaScript linter)
# - prettier (Code formatter)
# - All testing tools
```

### 2. GitHub Repository Setup

#### Enable GitHub Actions

1. Go to your repository on GitHub
2. Click "Settings" → "Actions" → "General"
3. Ensure "Allow all actions and reusable workflows" is selected

#### Configure Codecov

1. Visit [codecov.io](https://codecov.io/)
2. Sign up with GitHub account
3. Add your repository
4. Copy the Codecov token
5. Add token to GitHub Secrets:
   - Go to Settings → Secrets → Actions
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token
   - Click "Add secret"

#### Branch Protection (Optional)

Require CI checks before merging:

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - Require status checks to pass
   - Select "Test Suite" and "Code Quality Checks"
   - Require branches to be up to date

### 3. Pre-commit Hooks (Optional)

Install Husky for pre-commit hooks:

```bash
npm install --save-dev husky lint-staged
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

Configure `lint-staged` in `package.json`:

```json
{
  "lint-staged": {
    "*.sol": ["solhint", "prettier --write"],
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## Workflow Details

### Available NPM Scripts

```bash
# Linting
npm run lint              # Run all linters
npm run lint:sol          # Solidity only
npm run lint:js           # JavaScript only
npm run lint:fix          # Fix all auto-fixable issues

# Formatting
npm run prettier:check    # Check formatting
npm run prettier:write    # Fix formatting
npm run format            # Same as prettier:write

# Testing
npm test                  # Run tests
npm run test:coverage     # With coverage report

# Building
npm run compile           # Compile contracts
npm run clean             # Clean artifacts
```

### Running CI Checks Locally

Before pushing code, run CI checks locally:

```bash
# 1. Install dependencies
npm ci

# 2. Run linters
npm run lint

# 3. Check formatting
npm run prettier:check

# 4. Compile contracts
npm run compile

# 5. Run tests
npm test

# 6. Generate coverage
npm run test:coverage
```

### Workflow Triggers

#### Automatic Triggers

- **Push to main/develop**: Both workflows run
- **Pull request to main/develop**: Both workflows run
- **Commit to PR**: Workflows re-run automatically

#### Manual Triggers

Run workflows manually via GitHub UI:
1. Go to "Actions" tab
2. Select workflow
3. Click "Run workflow"

---

## Workflow Badges

Add status badges to README:

```markdown
![Test Suite](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Test%20Suite/badge.svg)
![Code Quality](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Code%20Quality/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Failing on CI but Passing Locally

**Issue**: Different Node.js versions

**Solution**:
```bash
# Test with specific version locally
nvm install 18
nvm use 18
npm test

nvm install 20
nvm use 20
npm test
```

#### 2. Solhint Errors

**Issue**: Contract doesn't meet style guidelines

**Solution**:
```bash
# Check specific issues
npm run lint:sol

# Common fixes:
# - Add function visibility
# - Reduce function complexity
# - Fix max line length
```

#### 3. Coverage Upload Fails

**Issue**: Codecov token not configured

**Solution**:
1. Verify `CODECOV_TOKEN` in GitHub Secrets
2. Check token is valid at codecov.io
3. Ensure `codecov.yml` is properly configured

#### 4. ESLint Errors

**Issue**: JavaScript style issues

**Solution**:
```bash
# Auto-fix issues
npm run lint:js -- --fix

# Or use full fix
npm run lint:fix
```

#### 5. Prettier Formatting Issues

**Issue**: Code not properly formatted

**Solution**:
```bash
# Fix all formatting
npm run prettier:write

# Or check what needs fixing
npm run prettier:check
```

### Debug Mode

Enable debug logging in workflows:

```yaml
- name: Debug Info
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"
    ls -la
```

---

## Best Practices

### 1. Before Committing

Always run locally before pushing:

```bash
npm run lint && npm test
```

### 2. Commit Messages

Use conventional commits:

```bash
feat: add new bidding feature
fix: resolve royalty calculation bug
docs: update CI/CD documentation
test: add edge case tests
chore: update dependencies
```

### 3. Pull Requests

- Ensure all CI checks pass
- Review coverage reports
- Address any security audit warnings
- Keep PRs focused and small

### 4. Dependency Management

- Review dependency updates regularly
- Run `npm audit` before releases
- Keep dependencies up to date

---

## Performance Metrics

### Typical CI Run Times

| Workflow | Duration | Billable Minutes |
|----------|----------|------------------|
| Test (Ubuntu, Node 18) | ~2 min | 2 min |
| Test (Ubuntu, Node 20) | ~2 min | 2 min |
| Test (Windows, Node 18) | ~3 min | 6 min (2x) |
| Test (Windows, Node 20) | ~3 min | 6 min (2x) |
| Code Quality | ~30 sec | 30 sec |

**Total per push**: ~16.5 billable minutes

**Monthly estimate** (50 pushes): ~825 minutes (~14 hours)

Note: GitHub provides 2,000 free minutes/month for public repos.

---

## Security

### Dependency Scanning

Automated via `npm audit` in CI:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Force fix (may break)
npm audit fix --force
```

### Secret Management

Never commit:
- `.env` files
- Private keys
- API tokens
- Passwords

Use GitHub Secrets for sensitive data.

---

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Codecov Docs](https://docs.codecov.com/)

### Tools
- [Solhint](https://github.com/protofire/solhint)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Codecov](https://codecov.io/)

---

## Summary

### CI/CD Checklist

- [x] GitHub Actions workflows configured
- [x] Multi-version Node.js testing (18.x, 20.x)
- [x] Cross-platform testing (Ubuntu, Windows)
- [x] Solhint configuration
- [x] ESLint configuration
- [x] Prettier configuration
- [x] Codecov integration
- [x] Security audit automation
- [x] Comprehensive documentation

### Next Steps

1. Push code to GitHub
2. Enable Actions in repository settings
3. Configure Codecov token
4. Watch first workflow run
5. Add badges to README
6. Set up branch protection rules

Your CI/CD pipeline is ready! 🚀

---

**Last Updated**: 2025-10-30
**Maintained By**: Development Team
**Support**: See project README for contact information
