<div align="center">

# 🚀 SocialFlow

**Enterprise-Grade Social Media Marketing Platform**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![SocialFlow Dashboard](https://raw.githubusercontent.com/J33WAKASUPUN/Social-Media-Marketing-platform-V.2.0.0/main/socialflowhomeinterface.png)

**[Live Demo](https://socialflow-51u9.onrender.com)** • **[API Docs](https://socialflow-backend-api.duckdns.org/api-docs)** • **[Report Bug](https://github.com/J33WAKASUPUN/Social-Media-Marketing-platform-V.2.0.0/issues)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Platform Integrations](#-platform-integrations)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🎯 Overview

**SocialFlow Backend** is a robust, scalable REST API built with **Express.js** and **MongoDB** that powers a comprehensive social media management platform. It supports **6 major social platforms** with **OAuth 2.0 authentication**, **queue-based publishing**, **real-time analytics**, and **enterprise-grade security**.

### **Key Capabilities**

- 📅 **Unified Scheduling** - Schedule posts across multiple platforms from a single interface
- 🔄 **Automated Publishing** - Queue-based job system with retry logic and failure handling
- 📊 **Advanced Analytics** - Track performance metrics and engagement across all platforms
- 🔐 **Enterprise Security** - JWT authentication, 2FA, trusted devices, and role-based access control
- 📱 **Multi-Platform Support** - LinkedIn, Facebook, Instagram, Twitter, YouTube, WhatsApp
- 🎨 **Media Management** - AWS S3 and Cloudinary integration for optimized media storage
- 👥 **Team Collaboration** - Organizations, brands, and role-based permissions

---

## ✨ Core Features

### **1. Authentication & User Management**

- ✅ **Local Authentication** - Email/password with bcrypt hashing
- ✅ **Google OAuth 2.0** - Social login with profile sync
- ✅ **Two-Factor Authentication** - TOTP (Authenticator App) + Email OTP
- ✅ **Trusted Devices** - Device fingerprinting with IP geolocation
- ✅ **JWT Tokens** - Access + Refresh token strategy with Redis blacklisting
- ✅ **Password Recovery** - Secure reset links with expiration
- ✅ **Email Verification** - Account activation via SendGrid
- ✅ **Session Management** - Redis-backed sessions with Redis Store

### **2. Organization & Brand Management**

- ✅ **Multi-Tenancy** - Organizations with multiple brands
- ✅ **Role-Based Access Control (RBAC)** - Owner, Manager, Editor, Viewer
- ✅ **Granular Permissions** - 10+ permission types per role
- ✅ **Team Invitations** - Email-based invites with custom roles
- ✅ **Brand Settings** - Timezone, posting schedules, approval workflows

### **3. Social Media Channel Management**

#### **Supported Platforms**

| Platform | Status | Features Supported |
|----------|--------|-------------------|
| **LinkedIn** | ✅ Active | Text, Images, Carousels, Page Posts |
| **Facebook** | ✅ Active | Text, Photos, Videos, Multi-image Posts |
| **Instagram** | ✅ Active | Photos, Videos, Reels, Carousels |
| **Twitter (X)** | ✅ Active | Tweets, Images, Thread Support |
| **YouTube** | ✅ Active | Videos, Shorts, Playlists |
| **WhatsApp Business** | ✅ Active | Text, Media, Templates, Contacts |

#### **Channel Features**

- ✅ **OAuth 2.0 Integration** - Secure authorization for all platforms
- ✅ **Token Encryption** - AES-256-GCM encrypted storage
- ✅ **Auto Token Refresh** - Background refresh for expired tokens
- ✅ **Health Checks** - Automated connection testing
- ✅ **Multi-Account Support** - Connect multiple accounts per platform
- ✅ **Graceful Disconnection** - Soft delete with reconnection support

### **4. Post Management & Publishing**

#### **Content Creation**

- ✅ **Unified Post Composer** - Create once, publish everywhere
- ✅ **Rich Text Support** - Hashtags, mentions, formatting
- ✅ **Multi-Media Support** - Images, videos, carousels, documents
- ✅ **Media Library Integration** - Reuse uploaded media across posts
- ✅ **Platform-Specific Validation** - Character limits, media requirements
- ✅ **Draft Management** - Save and edit drafts before publishing

#### **Scheduling System**

- ✅ **Multi-Platform Scheduling** - Schedule to multiple platforms simultaneously
- ✅ **Flexible Timing** - Timezone-aware scheduling
- ✅ **Cron-Based Checker** - Runs every 1 minute to detect due posts
- ✅ **Bull Queue Integration** - Redis-backed job queue with priorities
- ✅ **Retry Logic** - Automatic retries with exponential backoff (3 attempts)
- ✅ **Failure Notifications** - Email + in-app alerts for failed posts

#### **Publishing Engine**

- ✅ **Queue-Based Processing** - Asynchronous job handling with Bull
- ✅ **Concurrency Control** - Process 5 jobs simultaneously
- ✅ **Platform-Specific Publishing** - Provider pattern for each platform
- ✅ **Media Upload Optimization** - Cloudinary for Instagram videos, S3 for others
- ✅ **Status Tracking** - Real-time status updates (pending → queued → published)
- ✅ **Published Post Archive** - Separate collection for published content

### **5. Media Management**

#### **Storage Solutions**

- ✅ **AWS S3 Integration** - Primary storage for all media
- ✅ **Cloudinary Integration** - Video optimization for Instagram
- ✅ **Sharp Image Processing** - Automatic thumbnail generation
- ✅ **FFmpeg Video Processing** - Duration, codec, bitrate extraction
- ✅ **Folder Organization** - Custom folders with metadata
- ✅ **Tag System** - Searchable tags for quick discovery

#### **Media Library Features**

- ✅ **Upload Validation** - File type, size, and format checks (max 100MB)
- ✅ **Metadata Extraction** - Dimensions, duration, aspect ratio, codec
- ✅ **Usage Tracking** - Track which posts use each media file
- ✅ **Bulk Operations** - Multi-select delete, move, tag
- ✅ **Storage Analytics** - Per-brand storage usage (1TB limit)
- ✅ **Soft Delete** - Recoverable deletion with status tracking

### **6. Analytics & Reporting**

#### **Dashboard Metrics**

- ✅ **Summary Statistics** - Total posts, success rate, scheduled count
- ✅ **Platform Distribution** - Posts by platform with percentages
- ✅ **Content Type Analysis** - Text, image, video, carousel breakdown
- ✅ **Posting Trends** - Daily posting activity over 30 days
- ✅ **Top Posting Days** - Best days for engagement (Sunday-Saturday)
- ✅ **Recent Activity** - Latest 10 posts with status

#### **Advanced Analytics**

- ✅ **Channel Performance** - Per-channel stats with success/failure rates
- ✅ **Time-Range Filtering** - 7d, 30d, 90d, all-time views
- ✅ **CSV Export** - Download analytics for external analysis
- ✅ **Real-Time Updates** - Live status changes for scheduled posts

### **7. WhatsApp Business Integration**

#### **Messaging Features**

- ✅ **WhatsApp Business API** - Official Meta API integration
- ✅ **Template Messages** - Pre-approved message templates
- ✅ **Media Messaging** - Images, videos, documents, audio
- ✅ **Contact Management** - Store and organize contacts with tags
- ✅ **Webhook Support** - Real-time message and status updates
- ✅ **Call Logs** - Track incoming/outgoing calls with duration
- ✅ **Account Health Monitoring** - Quality rating and messaging limits

#### **WhatsApp Analytics**

- ✅ **Message Status Tracking** - Sent, delivered, read, failed
- ✅ **Delivery Rates** - Success/failure metrics
- ✅ **Contact Engagement** - Track conversations per contact
- ✅ **Template Performance** - Template approval and usage stats

### **8. Notifications & Alerts**

#### **In-App Notifications**

- ✅ **Real-Time Alerts** - Post published, failed, channel disconnected
- ✅ **Priority Levels** - Low, medium, high, urgent
- ✅ **Read/Unread Tracking** - Mark notifications as read
- ✅ **Action URLs** - Deep links to relevant pages
- ✅ **Auto-Expiry** - TTL-based notification cleanup

#### **Email Notifications**

- ✅ **SendGrid Integration** - Transactional email service
- ✅ **Handlebars Templates** - Beautiful HTML emails
- ✅ **Welcome Emails** - Onboarding emails with quick start guide
- ✅ **Post Alerts** - Success/failure notifications
- ✅ **Team Invitations** - Email invites with accept links
- ✅ **Password Recovery** - Secure reset links
- ✅ **Daily Summaries** - Daily performance reports

### **9. Security & Compliance**

#### **Authentication Security**

- ✅ **Bcrypt Password Hashing** - 10 rounds of salting
- ✅ **JWT with RS256** - Asymmetric key signing
- ✅ **Token Blacklisting** - Redis-based logout tracking
- ✅ **Rate Limiting** - 5 login attempts per 15 minutes
- ✅ **Account Lockout** - Lock after 5 failed attempts (15 min)

#### **Data Protection**

- ✅ **AES-256-GCM Encryption** - OAuth tokens encrypted at rest
- ✅ **Helmet.js** - Security headers (CSP, HSTS, XSS protection)
- ✅ **CORS Configuration** - Strict origin validation
- ✅ **Mongo Sanitization** - Prevent NoSQL injection
- ✅ **Input Validation** - Joi schemas for all routes
- ✅ **XSS Prevention** - HTML sanitization

#### **Compliance**

- ✅ **GDPR Ready** - Data export, deletion, consent management
- ✅ **Soft Deletes** - Recoverable data deletion
- ✅ **Audit Logs** - Winston logger with file rotation
- ✅ **Error Tracking** - Structured error logging
- ✅ **Session Security** - HTTP-only, secure cookies
- ✅ **Privacy Policy** - Comprehensive privacy documentation available at [Privacy Policy](https://socialflow-51u9.onrender.com/privacy-policy)

### **10. Background Jobs & Automation**

#### **Bull Queue System**

- ✅ **Publish Queue** - Handles post publishing with priority (high, normal, low)
- ✅ **Retry Queue** - Automatic retries with exponential backoff
- ✅ **Analytics Queue** - Syncs platform analytics (future feature)
- ✅ **Job Monitoring** - Real-time queue stats (active, waiting, failed)
- ✅ **Job Cleanup** - Auto-delete completed jobs after 24 hours

#### **Cron Jobs**

- ✅ **Schedule Checker** - Runs every 1 minute to find due posts
- ✅ **Health Checks** - Periodic channel connection tests
- ✅ **Token Refresh** - Background token renewal
- ✅ **Analytics Sync** - (Future) Daily platform metrics sync

---

## 🛠 Tech Stack

### **Backend Framework**

- **Express.js 4.x** - Fast, unopinionated web framework
- **Node.js 20.x** - JavaScript runtime
- **Mongoose 8.x** - MongoDB ODM with schema validation

### **Databases**

- **MongoDB Atlas** - Primary database with Azure Cosmos DB compatibility
- **Redis 7.x** - Cache, sessions, job queue

### **Authentication & Security**

- **Passport.js** - OAuth strategies (Google)
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Speakeasy** - TOTP for 2FA
- **Helmet.js** - Security middleware
- **express-rate-limit** - API rate limiting

### **Storage & Media**

- **AWS S3** - Primary media storage
- **Cloudinary** - Video optimization (Instagram)
- **Sharp** - Image processing
- **FFmpeg** - Video metadata extraction
- **Multer** - File upload handling

### **Job Queue & Background Processing**

- **Bull** - Redis-backed job queue
- **node-cron** - Scheduled tasks
- **Bull Board** - Queue monitoring UI

### **Email & Notifications**

- **SendGrid** - Transactional emails
- **Nodemailer** - Email client
- **Handlebars** - Email templates

### **API Documentation**

- **Swagger UI** - Interactive API docs
- **swagger-jsdoc** - JSDoc to OpenAPI conversion

### **Testing & Quality**

- **Jest** - Unit and integration testing
- **Supertest** - HTTP assertion library
- **ESLint** - Code linting (Airbnb style)

### **Logging & Monitoring**

- **Winston** - Structured logging
- **Morgan** - HTTP request logger

### **DevOps**

- **Docker** - Containerization
- **PM2** - Process manager (production)
- **Nginx** - Reverse proxy and load balancer
- **UFW** - Firewall configuration
- **Let's Encrypt** - SSL/TLS certificates

---

## 🏗 Architecture

### **System Design**

```
┌──────────────┐
│   Client     │
│  (React)     │
└──────┬───────┘
       │
       ├─── HTTPS ───┐
       │             │
       ▼             ▼
┌──────────────────────────────┐
│   Nginx Reverse Proxy        │
│   + SSL/TLS (Let's Encrypt)  │
└──────────────┬───────────────┘
               │
               ▼
       ┌───────────────┐
       │  Express.js   │
       │  (PM2 Cluster)│
       └───────┬───────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌─────────┐ ┌───────┐ ┌────────┐
│ MongoDB │ │ Redis │ │  AWS   │
│  Atlas  │ │       │ │   S3   │
└─────────┘ └───┬───┘ └────────┘
                │
                ▼
        ┌───────────────┐
        │  Bull Queue   │
        │   Workers     │
        └───────┬───────┘
                │
        ┌───────┴────────┬────────┬────────┐
        ▼                ▼        ▼        ▼
   [LinkedIn]      [Facebook] [Twitter] [YouTube]
   [Instagram]                [WhatsApp]
```

### **Request Flow**

1. **Client Request** → Nginx (HTTPS) → Express.js (with CORS, Helmet, Rate Limiting)
2. **Authentication** → JWT Verification → User Lookup
3. **Authorization** → RBAC Check → Permission Validation
4. **Business Logic** → Service Layer → Provider Pattern
5. **Data Access** → Mongoose Models → MongoDB
6. **Response** → JSON with standardized format

### **Publishing Flow**

1. **User Creates Post** → `POST /api/v1/posts`
2. **Validation** → Platform-specific checks
3. **Media Upload** → AWS S3 (+ Cloudinary for Instagram videos)
4. **Schedule Creation** → Store in MongoDB
5. **Cron Job** → Check every 1 minute for due posts
6. **Queue Job** → Add to Bull queue (Redis)
7. **Worker Process** → Provider publishes to platform
8. **Status Update** → Update post status + send notifications
9. **Published Post** → Store in `PublishedPost` collection

---

## 📚 API Documentation

### **Interactive API Docs**

Access the **Swagger UI** at:

```
https://socialflow-backend-api.duckdns.org/api-docs
```

### **Base URL**

```
Production: https://socialflow-backend-api.duckdns.org
Frontend: https://socialflow-51u9.onrender.com
```

### **Authentication**

All protected routes require a Bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

### **API Endpoints**

#### **Authentication**

```http
POST   /api/v1/auth/register             # Register new user
POST   /api/v1/auth/login                # Login
POST   /api/v1/auth/refresh-token        # Refresh JWT
GET    /api/v1/auth/me                   # Get current user
POST   /api/v1/auth/logout               # Logout
POST   /api/v1/auth/forgot-password      # Request password reset
POST   /api/v1/auth/reset-password       # Reset password
PATCH  /api/v1/auth/profile              # Update profile
POST   /api/v1/auth/avatar               # Upload avatar

# Google OAuth
GET    /api/v1/auth/google               # Redirect to Google
GET    /api/v1/auth/google/callback      # OAuth callback

# Two-Factor Authentication
GET    /api/v1/auth/2fa/status           # Get 2FA status
POST   /api/v1/auth/2fa/setup/totp       # Setup TOTP
POST   /api/v1/auth/2fa/verify-setup     # Verify TOTP code
POST   /api/v1/auth/2fa/send-code        # Send email OTP
POST   /api/v1/auth/2fa/verify           # Verify 2FA code
POST   /api/v1/auth/2fa/disable          # Disable 2FA
```

#### **Organizations**

```http
POST   /api/v1/organizations             # Create organization
GET    /api/v1/organizations             # Get user's organizations
PATCH  /api/v1/organizations/:id         # Update organization
DELETE /api/v1/organizations/:id         # Delete organization

# Members
GET    /api/v1/organizations/:id/members # Get members
POST   /api/v1/organizations/:id/members # Invite member
PUT    /api/v1/organizations/:id/members/:userId # Update role
DELETE /api/v1/organizations/:id/members/:userId # Remove member
```

#### **Brands**

```http
POST   /api/v1/brands                    # Create brand
GET    /api/v1/brands                    # Get user's brands
GET    /api/v1/brands/:id                # Get brand details
PATCH  /api/v1/brands/:id                # Update brand
DELETE /api/v1/brands/:id                # Delete brand

# Team Management
GET    /api/v1/brands/:id/members        # Get brand members
POST   /api/v1/brands/:id/members        # Invite member
PATCH  /api/v1/brands/:id/members/:memberId # Update role
DELETE /api/v1/brands/:id/members/:memberId # Remove member
```

#### **Channels**

```http
# OAuth Flow
GET    /api/v1/channels/oauth/:provider  # Get OAuth URL
GET    /api/v1/channels/oauth/:provider/callback # OAuth callback

# Channel Management
GET    /api/v1/channels                  # Get brand channels
GET    /api/v1/channels/:id/test         # Test connection
PATCH  /api/v1/channels/:id/disconnect   # Disconnect channel
POST   /api/v1/channels/:id/refresh      # Refresh token
DELETE /api/v1/channels/:id              # Delete channel
```

#### **Posts**

```http
POST   /api/v1/posts                     # Create post
GET    /api/v1/posts                     # Get posts (filter by status)
GET    /api/v1/posts/:id                 # Get post details
PATCH  /api/v1/posts/:id                 # Update post
DELETE /api/v1/posts/:id                 # Delete post

# Scheduling
POST   /api/v1/posts/:id/schedule        # Schedule post
DELETE /api/v1/posts/:postId/schedules/:scheduleId # Cancel schedule
GET    /api/v1/posts/calendar            # Calendar view
```

#### **Media**

```http
POST   /api/v1/media/upload              # Upload media (max 10 files)
GET    /api/v1/media                     # Get media library
GET    /api/v1/media/:id                 # Get media details
PATCH  /api/v1/media/:id                 # Update metadata
DELETE /api/v1/media/:id                 # Delete media
POST   /api/v1/media/bulk-delete         # Bulk delete

# Folders
GET    /api/v1/media/folders             # Get folders
POST   /api/v1/media/folders             # Create folder
PATCH  /api/v1/media/folders/:name       # Rename folder
DELETE /api/v1/media/folders/:name       # Delete folder
POST   /api/v1/media/move-to-folder      # Move media

# Metadata
GET    /api/v1/media/stats               # Storage stats
GET    /api/v1/media/tags                # Popular tags
```

#### **Analytics**

```http
GET    /api/v1/analytics/dashboard       # Dashboard metrics
GET    /api/v1/analytics/channels        # Channel performance
GET    /api/v1/analytics/trends          # Posting trends
GET    /api/v1/analytics/export/csv      # Export to CSV
```

#### **Notifications**

```http
GET    /api/v1/notifications             # Get notifications
GET    /api/v1/notifications/unread-count # Unread count
PATCH  /api/v1/notifications/:id/read    # Mark as read
PATCH  /api/v1/notifications/read-all    # Mark all as read
DELETE /api/v1/notifications/:id         # Delete notification
```

#### **WhatsApp Business**

```http
POST   /api/v1/whatsapp/connect          # Connect account
GET    /api/v1/whatsapp/templates        # Get templates
POST   /api/v1/whatsapp/templates        # Create template
DELETE /api/v1/whatsapp/templates/:id    # Delete template

# Contacts
GET    /api/v1/whatsapp/contacts         # Get contacts
POST   /api/v1/whatsapp/contacts         # Create contact
PATCH  /api/v1/whatsapp/contacts/:id     # Update contact
DELETE /api/v1/whatsapp/contacts/:id     # Delete contact

# Messaging
POST   /api/v1/whatsapp/send-template    # Send template message
POST   /api/v1/whatsapp/send-text        # Send text message
POST   /api/v1/whatsapp/send-media       # Send media message
GET    /api/v1/whatsapp/messages         # Get message history

# Webhook (Public)
GET    /api/v1/whatsapp/webhook          # Verify webhook
POST   /api/v1/whatsapp/webhook          # Receive events
```

### **Standard Response Format**

#### **Success Response**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

#### **Error Response**

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### **Pagination**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

---

## 🔌 Platform Integrations

### **LinkedIn**

- **API Version**: v202510
- **Features**: Text, images, carousels, page posts
- **Token Expiry**: 60 days (no refresh)
- **Rate Limit**: 100 posts/day
- **Requirements**: Company Page access

### **Facebook**

- **API Version**: v18.0
- **Features**: Text, photos, videos, albums
- **Token Expiry**: Never (Page tokens)
- **Rate Limit**: 200 posts/day
- **Requirements**: Page publish permission

### **Instagram**

- **API Version**: v21.0 (Graph API)
- **Features**: Photos, videos, reels, carousels
- **Token Expiry**: 60 days (refreshable)
- **Rate Limit**: 25 posts/day
- **Requirements**: Business account, Facebook Page connection

### **Twitter (X)**

- **API Version**: v2 (OAuth 2.0 with PKCE)
- **Features**: Tweets, images (max 4), threads
- **Token Expiry**: 2 hours (refreshable)
- **Rate Limit**: 17 posts/24 hours (Free tier)
- **Requirements**: Twitter Developer account

### **YouTube**

- **API Version**: v3
- **Features**: Videos, Shorts, playlists
- **Token Expiry**: 1 hour (refreshable)
- **Rate Limit**: 10,000 quota units/day
- **Requirements**: YouTube channel

### **WhatsApp Business**

- **API Version**: v21.0 (Cloud API)
- **Features**: Text, media, templates, contacts
- **Token Expiry**: Never (long-lived)
- **Rate Limit**: Tier-based (50-unlimited/day)
- **Requirements**: Meta Business account, verified phone number

---

## 🔐 Security Features

### **Threat Protection**

- ✅ **SQL/NoSQL Injection** - Input sanitization
- ✅ **XSS Attacks** - HTML escaping
- ✅ **CSRF Protection** - SameSite cookies
- ✅ **Brute Force** - Rate limiting + account lockout
- ✅ **DDoS Protection** - Nginx rate limiting + Cloudflare (frontend)
- ✅ **Man-in-the-Middle** - HTTPS enforced with Let's Encrypt

### **Data Security**

- ✅ **Encryption at Rest** - AES-256-GCM for OAuth tokens
- ✅ **Encryption in Transit** - TLS 1.3 (Let's Encrypt)
- ✅ **Password Hashing** - bcrypt (10 rounds)
- ✅ **JWT Signing** - RS256 (asymmetric)
- ✅ **Secure Headers** - Helmet.js (CSP, HSTS)

### **Access Control**

- ✅ **Multi-Factor Authentication** - TOTP + Email
- ✅ **Role-Based Access Control** - 4 roles, 10+ permissions
- ✅ **Device Fingerprinting** - Trusted device management
- ✅ **IP Geolocation** - Track login locations
- ✅ **Session Management** - Redis-backed with expiry

### **Compliance**

- ✅ **GDPR** - Right to access, delete, export data
- ✅ **CCPA** - Data deletion requests
- ✅ **Audit Logs** - Winston logging with rotation
- ✅ **Data Retention** - 90-day log retention
- ✅ **Privacy Policy** - Comprehensive documentation at [Privacy Policy](https://socialflow-51u9.onrender.com/privacy-policy)

---

## 🚀 Deployment

### **Production Environment**

- **Hosting**: Self-Hosted on Personal VM
- **Web Server**: Nginx (Reverse Proxy + SSL/TLS Termination)
- **Process Manager**: PM2 (Cluster mode with auto-restart)
- **Database**: MongoDB Atlas (Azure Cosmos DB compatible)
- **Cache**: Redis 7.x (Local instance)
- **Storage**: AWS S3 (US East 2)
- **Email**: SendGrid
- **Domain**: socialflow-backend-api.duckdns.org
- **SSL**: Let's Encrypt (Auto-renewal with Certbot)

<!-- ### **Infrastructure Setup**

#### **Server Specifications**

```yaml
OS: Ubuntu 22.04 LTS
CPU: 4 cores
RAM: 8GB
Storage: 100GB SSD
Firewall: UFW (Uncomplicated Firewall)
```

#### **Nginx Configuration**

```nginx
# /etc/nginx/sites-available/socialflow-api
server {
    listen 80;
    server_name socialflow-backend-api.duckdns.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name socialflow-backend-api.duckdns.org;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/socialflow-backend-api.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/socialflow-backend-api.duckdns.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;

    # Proxy Configuration
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static Files
    location /uploads {
        alias /var/www/socialflow/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### **PM2 Configuration**

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'socialflow-api',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
```

#### **Firewall Configuration (UFW)**

```bash
# Allow SSH (important!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow MongoDB (if remote)
sudo ufw allow from <trusted-ip> to any port 27017

# Allow Redis (if remote)
sudo ufw allow from <trusted-ip> to any port 6379

# Enable firewall
sudo ufw enable
```

#### **SSL Certificate (Let's Encrypt)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d socialflow-backend-api.duckdns.org

# Auto-renewal (cron job)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Deployment Process**

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install --production

# 3. Run database migrations (if any)
npm run migrate

# 4. Restart PM2
pm2 restart socialflow-api

# 5. Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# 6. Check status
pm2 status
pm2 logs socialflow-api --lines 100
``` -->

### **Monitoring**

- **Logs**: Winston → File rotation (7 days) + PM2 logs
- **Errors**: Structured error tracking with Winston
- **Performance**: PM2 monitoring dashboard
- **Queue**: Bull Board dashboard at `/admin/queues`
- **Health Checks**: `/health`, `/ping` endpoints
- **Uptime**: Monitored with UptimeRobot

### **Backup Strategy**

```yaml
MongoDB: 
  - Daily automated backups to AWS S3
  - Point-in-time recovery enabled
  - 30-day retention

Redis:
  - RDB snapshots every 6 hours
  - AOF enabled for durability
  - 7-day retention

Application Files:
  - Daily backups to external storage
  - Version control with Git
```

### **CI/CD Pipeline**

```yaml
Trigger: Push to main branch
Steps:
  1. Run tests (npm test)
  2. Build Docker image
  3. SSH to VM
  4. Pull latest code
  5. Install dependencies
  6. Restart PM2
  7. Health check
  8. Rollback on failure
```

---

## 👨‍💻 Author

**Jeewaka Supun**

- GitHub: [@J33WAKASUPUN](https://github.com/J33WAKASUPUN)
- Email: supunprabodha789@gmail.com
- LinkedIn: [Jeewaka Supun](https://linkedin.com/in/jeewaka-supun)
- Website: [SocialFlow](https://socialflow-51u9.onrender.com)

---

## 🙏 Acknowledgments

- **Express.js** - Web framework
- **MongoDB** - Database
- **Redis** - Caching and job queue
- **Bull** - Job queue system
- **Passport.js** - OAuth strategies
- **SendGrid** - Email service
- **AWS** - S3 storage
- **Cloudinary** - Video optimization
- **Meta** - Facebook, Instagram, WhatsApp APIs
- **LinkedIn** - LinkedIn API
- **Twitter** - X (Twitter) API
- **Google** - YouTube API
- **Nginx** - Web server and reverse proxy
- **Let's Encrypt** - SSL certificates

---

<div align="center">

**Built with ❤️ by [Jeewaka Supun](https://github.com/J33WAKASUPUN)**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/J33WAKASUPUN/Social-Media-Marketing-platform-V.2.0.0/issues) • [Request Feature](https://github.com/J33WAKASUPUN/Social-Media-Marketing-platform-V.2.0.0/issues) • [API Docs](https://socialflow-backend-api.duckdns.org/api-docs)

</div>
