# Product Matcher Integration System

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [STORIS Overview](#storis-overview)
4. [Integration Setup](#integration-setup)
5. [Database Configuration](#database-configuration)
6. [Script Implementation](#script-implementation)
7. [Testing & Deployment](#testing--deployment)
8. [Maintenance & Support](#maintenance--support)

## Introduction

### Project Overview
This documentation details my implementation of an automated product matching system integrated with STORIS ERP. The system automates the process of matching compatible products while maintaining synchronization with STORIS inventory data.

### Purpose
- Automate product compatibility matching
- Reduce manual data entry errors
- Streamline inventory management
- Ensure data consistency between systems

## System Architecture

### Components Overview
```
┌─────────────────┐        ┌──────────────────┐
│   STORIS ERP    │◄─────►│  Progress DB      │
│   (Core System) │        │  (OpenEdge)      │
└────────┬────────┘        └──────────┬───────┘
         │                            │
         │         ┌─────────────────┐│
         └────────►│  ODBC Bridge    ││
                  └────────┬────────┘│
                           │         │
                  ┌────────┴────────┐│
                  │ Integration Layer├┘
                  └────────┬────────┘
                           │
                  ┌────────┴────────┐ 
                  │ Product Matcher  │
                  │    Database     │
                  └────────┬────────┘
                           │
                  ┌────────┴────────┐
                  │    REST API     │
                  └────────┬────────┘
                           │
                  ┌────────┴────────┐
                  │  Client Apps    │
                  └────────────────┘
```

## STORIS Overview

### STORIS ERP System
STORIS Key components include:

- **Inventory Management System**

- **Database System** (Progress OpenEdge (formerly Progress 4GL))

## Integration Setup

### Prerequisites
1. **Software Requirements**
   ```
   - Node.js v14.0.0 or higher
   - Progress OpenEdge Client
   - Progress DataDirect Connect64 for ODBC
   - Microsoft SQL Server 2019 (local cache)
   - Git for version control
   ```

2. **Access Requirements**
   ```
   - STORIS database credentials (READ access minimum)
   - Network access to STORIS server
   - Local admin rights for ODBC setup
   - SQL Server authentication credentials
   ```

### Installation Steps

1. **Progress OpenEdge Setup**
   ```bash
   # Install Progress OpenEdge Client
   ./setup.exe --mode silent --installdir /opt/progress
   
   # Configure ODBC Driver
   odbcconf.exe /A {DRIVER=Progress OpenEdge 11.7 Driver}
   ```

2. **ODBC Configuration**
   ```ini
   [STORIS_DSN]
   Driver = Progress OpenEdge Wire Protocol
   Host = your_storis_server
   Port = 20931
   Database = storis
   UID = your_username
   PWD = your_password
   ```

3. **Application Installation**
   ```bash
   # Clone repository
   git clone https://github.com/your-org/product-matcher
   
   # Install dependencies
   cd product-matcher
   npm install
   
   # Configure environment
   cp .env.example .env
   ```

## Database Configuration

### STORIS Database Schema
Important tables and their relationships:
```sql
-- Example STORIS schema (simplified)
PUB.inventory (
    item_no VARCHAR(20) PRIMARY KEY,
    description VARCHAR(100),
    category_cd VARCHAR(10),
    sub_category_cd VARCHAR(10),
    active LOGICAL
)

PUB.product_details (
    item_no VARCHAR(20) REFERENCES inventory(item_no),
    size_cd VARCHAR(5),
    material_cd VARCHAR(10),
    retail_price DECIMAL(10,2)
)
```

### Local Cache Database
```sql
-- Create local matching database
CREATE DATABASE ProductMatcher;
GO

USE ProductMatcher;
GO

-- Create tables
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    storis_item_no VARCHAR(20) UNIQUE,
    product_type VARCHAR(50),
    size VARCHAR(20),
    last_sync DATETIME
);

CREATE TABLE product_matches (
    id INT IDENTITY(1,1) PRIMARY KEY,
    source_item_no VARCHAR(20),
    target_item_no VARCHAR(20),
    match_type VARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (source_item_no) REFERENCES products(storis_item_no),
    FOREIGN KEY (target_item_no) REFERENCES products(storis_item_no)
);
```

## Script Implementation

### Core Components

1. **STORIS Connector**
```javascript
class StorisConnector {
    constructor(config) {
        this.config = config;
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await odbc.connect(this.buildConnectionString());
            console.log('Connected to STORIS successfully');
        } catch (error) {
            console.error('STORIS connection error:', error);
            throw error;
        }
    }

    buildConnectionString() {
        return `DSN=${this.config.dsn};UID=${this.config.username};PWD=${this.config.password}`;
    }
}
```

2. **Data Synchronization**
```javascript
class DataSync {
    async syncProducts() {
        const query = `
            SELECT 
                i.item_no,
                i.description,
                i.category_cd,
                p.size_cd,
                p.retail_price
            FROM 
                PUB.inventory i
                JOIN PUB.product_details p ON i.item_no = p.item_no
            WHERE 
                i.active = true
        `;
        
        const results = await this.storisConnector.query(query);
        await this.processResults(results);
    }
}
```

### Configuration File (.env)
```ini
# STORIS Connection
STORIS_DSN=STORIS_PROD
STORIS_USERNAME=integration_user
STORIS_PASSWORD=secure_password

# Local Database
SQL_SERVER=localhost
SQL_DATABASE=ProductMatcher
SQL_USERNAME=sa
SQL_PASSWORD=local_password

# Application Settings
PORT=3000
SYNC_INTERVAL=3600000
LOG_LEVEL=info
```

## Testing & Deployment

### Testing Procedures

1. **Connection Testing**
```bash
# Test STORIS connectivity
node tests/storis-connection.js

# Test local database
node tests/local-db-connection.js

# Test data sync
node tests/sync-test.js
```

2. **Integration Testing**
```bash
# Full integration test suite
npm run test:integration

# Single component test
npm run test:component -- --component=matching
```

### Deployment Steps

1. **Production Setup**
```bash
# Build application
npm run build

# Deploy to production server
npm run deploy:prod

# Verify deployment
npm run verify-deployment
```

## Maintenance & Support

### Regular Maintenance

1. **Database Maintenance**
```sql
-- Weekly maintenance tasks
EXEC sp_updatestats;
DBCC CHECKDB;

-- Clean up old matches
DELETE FROM product_matches 
WHERE created_at < DATEADD(month, -3, GETDATE());
```

2. **Monitoring**
- Monitor sync job status
- Check error logs daily
- Review performance metrics
- Validate data consistency

### Troubleshooting Guide

Common issues and solutions:

1. **STORIS Connection Issues**
```
Error: Cannot connect to STORIS
Solution: 
- Verify ODBC configuration
- Check network connectivity
- Validate credentials
```

2. **Sync Failures**
```
Error: Data sync incomplete
Solution:
- Check STORIS query permissions
- Verify table structures
- Review error logs
```

3. **Performance Issues**
```
Problem: Slow matching response
Solution:
- Review indexes
- Check query execution plans
- Optimize cache usage
```