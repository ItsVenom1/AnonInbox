# 🚀 NordMail Production Deployment Guide

This guide covers the complete automated deployment setup for NordMail, including database migrations, backup systems, and production monitoring.

## 🎯 Quick Start

### 1. Run Automated Deployment
```bash
node scripts/deploy.js
```

This script automatically:
- ✅ Creates production environment configuration
- ✅ Sets up database schema and migrations
- ✅ Configures automated backup system
- ✅ Creates process manager configuration
- ✅ Generates system service files
- ✅ Provides nginx configuration

### 2. Configure Environment
Edit the generated `.env.production` file with your actual credentials:

```bash
# Database (update with your PostgreSQL credentials)
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/nordmail_db

# Admin credentials (secure passwords generated automatically)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# S3 Backup Configuration (optional but recommended)
S3_ACCESS_KEY_ID=your_s3_access_key
S3_SECRET_ACCESS_KEY=your_s3_secret_key
S3_BUCKET_NAME=nordmail-backups
S3_REGION=us-east-1
```

### 3. Start Application
```bash
# Install PM2 process manager
npm install -g pm2

# Start application
pm2 start ecosystem.config.json

# Save PM2 configuration
pm2 save && pm2 startup
```

## 📊 Database Management

### Automated Migrations
The deployment system includes automated database migration:
- Schema changes are applied automatically on startup
- No manual SQL required
- Safe rollback capabilities

### Manual Migration
```bash
# Push schema changes to production database
npm run db:push

# Force push if there are conflicts
npm run db:push --force
```

## 💾 Backup System

### Automated Backups
- **Daily backups** at 2:00 AM automatically
- **S3 integration** for offsite storage
- **7-day retention** for local backups
- **Compression** to save storage space

### Manual Backup
```bash
# Create immediate backup
./scripts/backup.sh

# Check backup logs
tail -f logs/backup.log
```

### Restore from Backup
```bash
# List available backups
node scripts/restore.js

# Restore specific backup
node scripts/restore.js nordmail_backup_20241221_143022.sql.gz

# Restore from S3 (download first)
aws s3 cp s3://your-bucket/backups/backup-file.sql.gz ./backups/
node scripts/restore.js backup-file.sql.gz
```

## 🔧 System Service (Linux)

### Install as System Service
```bash
# Copy service file
sudo cp deployment/nordmail.service /etc/systemd/system/

# Enable and start service
sudo systemctl enable nordmail
sudo systemctl start nordmail

# Check status
sudo systemctl status nordmail
```

### Service Management
```bash
# Start/stop/restart
sudo systemctl start nordmail
sudo systemctl stop nordmail
sudo systemctl restart nordmail

# View logs
sudo journalctl -u nordmail -f
```

## 🌐 Web Server Configuration (Nginx)

### SSL Setup
1. Obtain SSL certificates (Let's Encrypt recommended):
```bash
sudo certbot --nginx -d your-domain.com
```

2. Update nginx configuration:
```bash
# Copy provided configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/nordmail

# Enable site
sudo ln -s /etc/nginx/sites-available/nordmail /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Features Included
- **HTTPS redirect** for all traffic
- **Security headers** for enhanced protection
- **Rate limiting** on API endpoints
- **Static file caching** for performance

## 📈 Monitoring & Logs

### Process Monitoring
```bash
# View PM2 dashboard
pm2 monit

# Check process status
pm2 status

# View logs
pm2 logs nordmail
pm2 logs nordmail-backup
```

### Log Files
- **Application logs**: `./logs/combined.log`
- **Error logs**: `./logs/error.log`
- **Backup logs**: `./logs/backup.log`
- **Access logs**: Configured in nginx

### Health Checks
```bash
# Check application health
curl https://your-domain.com/api/health

# Check admin panel
curl https://your-domain.com/nordmail-admin
```

## 🔒 Security Features

### Automated Security
- ✅ **Secure password generation** for admin accounts
- ✅ **JWT session management** with rotating secrets
- ✅ **Rate limiting** on API endpoints
- ✅ **HTTPS enforcement** in production
- ✅ **Security headers** via nginx
- ✅ **Database connection encryption**

### Manual Security Checklist
- [ ] Update default admin password
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Enable fail2ban for brute force protection
- [ ] Regular security updates

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database status
sudo systemctl status postgresql

# Verify credentials in .env.production
cat .env.production | grep DATABASE_URL
```

**Application Won't Start**
```bash
# Check PM2 logs
pm2 logs nordmail

# Restart application
pm2 restart nordmail
```

**Backup Failed**
```bash
# Check backup logs
tail -f logs/backup.log

# Test manual backup
./scripts/backup.sh
```

**Nginx Configuration Error**
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Performance Optimization

**Database Performance**
- Regular `VACUUM` and `ANALYZE` operations
- Index optimization for frequently queried columns
- Connection pooling for high traffic

**Application Performance**
- PM2 cluster mode for multi-core systems
- Static file caching via nginx
- Database query optimization

## 📞 Admin Access

### Default Access
- **URL**: `https://your-domain.com/nordmail-admin`
- **Username**: Check `.env.production` file
- **Password**: Check `.env.production` file

### Change Admin Credentials
Access the admin panel → Settings tab → Update credentials

## 🎊 Production Checklist

- [ ] ✅ Environment configured (`.env.production`)
- [ ] ✅ Database schema migrated
- [ ] ✅ SSL certificates installed
- [ ] ✅ Nginx configured and running
- [ ] ✅ PM2 processes started
- [ ] ✅ Automated backups enabled
- [ ] ✅ System service installed (optional)
- [ ] ✅ Admin credentials changed
- [ ] ✅ Firewall configured
- [ ] ✅ Monitoring setup

Your NordMail deployment is now production-ready! 🎉

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Let's Encrypt SSL Setup](https://letsencrypt.org/getting-started/)

---

*For support and updates, visit the NordMail admin panel or check the application logs.*