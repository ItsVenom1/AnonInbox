#!/usr/bin/env node
/**
 * NordMail Database Restore Script
 * 
 * This script handles disaster recovery by restoring from backups
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

console.log('🔄 NordMail Database Restore Utility\n');

// Get command line arguments
const args = process.argv.slice(2);
const backupFile = args[0];

if (!backupFile) {
  log('Usage: node scripts/restore.js <backup-file>', colors.yellow);
  log('\nAvailable backups:', colors.blue);
  
  const backupDir = path.join(rootDir, 'backups');
  if (existsSync(backupDir)) {
    const backups = readdirSync(backupDir)
      .filter(file => file.endsWith('.sql.gz'))
      .sort()
      .reverse(); // Most recent first
    
    if (backups.length === 0) {
      log('  No backups found in ./backups directory', colors.red);
    } else {
      backups.forEach((backup, index) => {
        const isLatest = index === 0 ? ' (latest)' : '';
        log(`  ${backup}${isLatest}`, colors.green);
      });
    }
  } else {
    log('  Backups directory not found', colors.red);
  }
  
  log('\nTo restore from S3:', colors.blue);
  log('  aws s3 cp s3://your-bucket/backups/backup-file.sql.gz ./backups/', colors.yellow);
  process.exit(1);
}

// Validate backup file
const backupPath = path.isAbsolute(backupFile) ? backupFile : path.join(rootDir, 'backups', backupFile);

if (!existsSync(backupPath)) {
  log(`❌ Backup file not found: ${backupPath}`, colors.red);
  process.exit(1);
}

// Confirm restore operation
log(`⚠️  WARNING: This will replace ALL data in your database!`, colors.yellow + colors.bold);
log(`📁 Backup file: ${backupPath}`, colors.blue);

// Simple confirmation (in production, you might want a more robust confirmation)
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Are you sure you want to proceed? (yes/no): ', (answer) => {
  rl.close();
  
  if (answer.toLowerCase() !== 'yes') {
    log('❌ Restore cancelled', colors.red);
    process.exit(0);
  }
  
  performRestore();
});

function performRestore() {
  try {
    log('\n🔄 Starting database restore...', colors.blue);
    
    // Load environment variables
    require('dotenv').config({ path: path.join(rootDir, '.env.production') });
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }
    
    // Create backup of current database
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreBackup = path.join(rootDir, 'backups', `pre_restore_${timestamp}.sql`);
    
    log('📊 Creating backup of current database...', colors.blue);
    execSync(`pg_dump "${databaseUrl}" > "${preRestoreBackup}"`, { stdio: 'inherit' });
    log(`✅ Current database backed up to: ${preRestoreBackup}`, colors.green);
    
    // Uncompress backup if needed
    let restoreFile = backupPath;
    if (backupPath.endsWith('.gz')) {
      log('🗜️  Decompressing backup file...', colors.blue);
      const uncompressedPath = backupPath.replace('.gz', '');
      execSync(`gunzip -c "${backupPath}" > "${uncompressedPath}"`, { stdio: 'inherit' });
      restoreFile = uncompressedPath;
    }
    
    // Drop existing database connections (PostgreSQL specific)
    log('🔌 Terminating database connections...', colors.blue);
    const dbName = process.env.PGDATABASE || 'nordmail_db';
    try {
      execSync(`psql "${databaseUrl}" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbName}' AND pid <> pg_backend_pid();"`, { stdio: 'pipe' });
    } catch (e) {
      // This might fail if no other connections exist, which is fine
    }
    
    // Restore database
    log('📥 Restoring database from backup...', colors.blue);
    execSync(`psql "${databaseUrl}" < "${restoreFile}"`, { stdio: 'inherit' });
    
    // Run any necessary migrations
    log('🔄 Running database migrations...', colors.blue);
    execSync('npm run db:push', { cwd: rootDir, stdio: 'inherit' });
    
    // Clean up temporary files
    if (restoreFile !== backupPath && existsSync(restoreFile)) {
      execSync(`rm "${restoreFile}"`);
    }
    
    log('\n✅ Database restore completed successfully!', colors.green + colors.bold);
    log(`📁 Pre-restore backup saved: ${preRestoreBackup}`, colors.blue);
    
    // Restart application if it's running
    try {
      execSync('pm2 restart nordmail', { stdio: 'pipe' });
      log('🔄 Application restarted', colors.green);
    } catch (e) {
      log('⚠️  Could not restart application automatically', colors.yellow);
      log('   Please restart manually: pm2 restart nordmail', colors.yellow);
    }
    
    log('\n🎉 Restore process completed!', colors.green + colors.bold);
    
  } catch (error) {
    log('\n❌ Restore failed:', colors.red + colors.bold);
    log(`   ${error.message}`, colors.red);
    log('\n🔧 Troubleshooting:', colors.blue);
    log('   1. Check database credentials in .env.production', colors.yellow);
    log('   2. Ensure PostgreSQL is running', colors.yellow);
    log('   3. Verify backup file is not corrupted', colors.yellow);
    log('   4. Check database permissions', colors.yellow);
    process.exit(1);
  }
}