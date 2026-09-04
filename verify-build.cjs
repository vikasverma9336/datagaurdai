#!/usr/bin/env node

/**
 * DataGuard AI - Build & Deployment Verification
 * Run this script to verify everything is ready for Chrome
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const EXTENSION_DIR = path.join(ROOT, 'extension');
const DIST_DIR = path.join(EXTENSION_DIR, 'dist');

console.log('\n🔍 DataGuard AI - Verification Checklist\n');
console.log('='.repeat(60));

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper functions
function checkFileExists(filePath, name) {
  if (fs.existsSync(filePath)) {
    checks.passed.push(`✓ ${name}`);
    return true;
  } else {
    checks.failed.push(`✗ ${name} - FILE NOT FOUND`);
    return false;
  }
}

function checkFileContent(filePath, searchString, name) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(searchString)) {
      checks.warnings.push(`⚠ ${name} - Pattern not found`);
      return false;
    }
    checks.passed.push(`✓ ${name}`);
    return true;
  } catch (e) {
    checks.failed.push(`✗ ${name} - Cannot read file`);
    return false;
  }
}

function checkNoImportInBundle(filePath, name) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for import statements (but not in comments)
    const importPattern = /^import\s+/m;
    if (importPattern.test(content)) {
      checks.failed.push(`✗ ${name} - Contains import statements (ES6 modules not allowed)`);
      return false;
    }
    checks.passed.push(`✓ ${name} - No ES6 imports (properly bundled)`);
    return true;
  } catch (e) {
    checks.failed.push(`✗ ${name} - Cannot read file`);
    return false;
  }
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2) + ' KB';
  } catch (e) {
    return 'N/A';
  }
}

// Run checks
console.log('\n📁 Source Files\n');
checkFileExists(path.join(EXTENSION_DIR, 'src/content/content.ts'), 'Content script source');
checkFileExists(path.join(EXTENSION_DIR, 'src/background/background.ts'), 'Background script source');
checkFileExists(path.join(EXTENSION_DIR, 'src/ui/SecurityModalDOM.ts'), 'Security modal (vanilla DOM)');
checkFileExists(path.join(EXTENSION_DIR, 'src/content/debugger.ts'), 'Debug utilities');

console.log('\n🔨 Build Output\n');
checkFileExists(path.join(DIST_DIR, 'manifest.json'), 'manifest.json');
checkFileExists(path.join(DIST_DIR, 'content.js'), 'content.js (bundled)');
checkFileExists(path.join(DIST_DIR, 'background.js'), 'background.js (bundled)');
checkFileExists(path.join(DIST_DIR, 'popup.html'), 'popup.html');
checkFileExists(path.join(DIST_DIR, 'popup.js'), 'popup.js (React UI)');
checkFileExists(path.join(DIST_DIR, 'popup.css'), 'popup.css (styles)');

console.log('\n🎨 Icon Assets\n');
checkFileExists(path.join(DIST_DIR, 'icons/icon-16.png'), 'icon-16.png');
checkFileExists(path.join(DIST_DIR, 'icons/icon-48.png'), 'icon-48.png');
checkFileExists(path.join(DIST_DIR, 'icons/icon-128.png'), 'icon-128.png');

console.log('\n🔐 Security Checks\n');
checkNoImportInBundle(path.join(DIST_DIR, 'content.js'), 'content.js - No ES6 imports');
checkNoImportInBundle(path.join(DIST_DIR, 'background.js'), 'background.js - No ES6 imports');
checkFileContent(path.join(DIST_DIR, 'manifest.json'), '"manifest_version": 3', 'Manifest V3 format');

console.log('\n📋 Manifest Validation\n');
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(DIST_DIR, 'manifest.json'), 'utf8'));
  
  if (manifest.manifest_version === 3) {
    checks.passed.push('✓ Manifest V3 compatible');
  } else {
    checks.failed.push('✗ Manifest version mismatch');
  }
  
  if (manifest.permissions && manifest.permissions.includes('scripting')) {
    checks.passed.push('✓ Has scripting permission');
  } else {
    checks.failed.push('✗ Missing scripting permission');
  }
  
  if (manifest.host_permissions && manifest.host_permissions.length > 0) {
    checks.passed.push('✓ Host permissions configured');
  } else {
    checks.warnings.push('⚠ No host permissions specified');
  }
  
  if (manifest.content_scripts && manifest.content_scripts.length > 0) {
    checks.passed.push('✓ Content scripts configured');
  } else {
    checks.failed.push('✗ No content scripts found');
  }
  
  if (manifest.icons && Object.keys(manifest.icons).length >= 2) {
    checks.passed.push('✓ Extension icons registered');
  } else {
    checks.warnings.push('⚠ Fewer than 2 icon sizes registered');
  }
} catch (e) {
  checks.failed.push('✗ Manifest.json is invalid JSON');
}

console.log('\n📦 File Sizes\n');
console.log(`  content.js:   ${getFileSize(path.join(DIST_DIR, 'content.js'))}`);
console.log(`  background.js: ${getFileSize(path.join(DIST_DIR, 'background.js'))}`);
console.log(`  popup.js:     ${getFileSize(path.join(DIST_DIR, 'popup.js'))}`);
console.log(`  popup.css:    ${getFileSize(path.join(DIST_DIR, 'popup.css'))}`);

console.log('\n📚 Documentation\n');
checkFileExists(path.join(ROOT, 'START_HERE.md'), 'START_HERE.md - Quick start guide');
checkFileExists(path.join(ROOT, 'README.md'), 'README.md - Architecture docs');
checkFileExists(path.join(ROOT, 'TROUBLESHOOTING.md'), 'TROUBLESHOOTING.md - Debug guide');
checkFileExists(path.join(ROOT, 'QUICK_START.md'), 'QUICK_START.md - Demo scenarios');

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n✅ Verification Summary\n');

console.log(`  Passed:  ${checks.passed.length}`);
console.log(`  Failed:  ${checks.failed.length}`);
console.log(`  Warnings: ${checks.warnings.length}`);

if (checks.passed.length > 0) {
  console.log('\n✓ Passed Checks:');
  checks.passed.forEach(check => console.log(`  ${check}`));
}

if (checks.warnings.length > 0) {
  console.log('\n⚠ Warnings:');
  checks.warnings.forEach(check => console.log(`  ${check}`));
}

if (checks.failed.length > 0) {
  console.log('\n✗ Failed Checks:');
  checks.failed.forEach(check => console.log(`  ${check}`));
}

// Final verdict
console.log('\n' + '='.repeat(60));

if (checks.failed.length === 0) {
  console.log('\n🎉 READY FOR CHROME!\n');
  console.log('Next steps:');
  console.log('  1. Go to chrome://extensions');
  console.log('  2. Enable "Developer Mode"');
  console.log('  3. Click "Load unpacked"');
  console.log(`  4. Select: ${DIST_DIR}`);
  console.log('\n📖 See START_HERE.md for detailed setup instructions\n');
  process.exit(0);
} else {
  console.log('\n❌ FIX ISSUES BEFORE LOADING IN CHROME\n');
  process.exit(1);
}
