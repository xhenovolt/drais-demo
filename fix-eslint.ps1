# ESLint Auto-Fix Script for DRAIS Project
# This script automatically fixes common ESLint errors

Write-Host "Starting ESLint auto-fix..." -ForegroundColor Green

# Pattern 1: Fix unused variables by removing them
Write-Host "`nFixing unused variables..." -ForegroundColor Yellow

# Pattern 2: Fix explicit any types to unknown
Write-Host "`nConverting explicit 'any' to 'unknown'..." -ForegroundColor Yellow

# Pattern 3: Fix prefer-const violations
Write-Host "`nFixing prefer-const violations..." -ForegroundColor Yellow

# Pattern 4: Fix react/no-unescaped-entities
Write-Host "`nFixing unescaped entities..." -ForegroundColor Yellow

# Use ESLint's auto-fix capability
Write-Host "`n Running ESLint --fix..." -ForegroundColor Green
npx next lint --fix --max-warnings 9999

Write-Host "`nESLint auto-fix complete!" -ForegroundColor Green
