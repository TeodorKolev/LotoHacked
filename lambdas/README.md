# Lambda Functions - Loto Hacked

This folder contains the AWS Lambda functions that power the Loto Hacked lottery analytics system.

## 📋 Overview

The system consists of three main Lambda functions that work together to download, process, and serve lottery data:

1. **`csv-download.py`** - Downloads CSV files from external sources and stores them in S3
2. **`analytics.py`** - Processes CSV data and generates comprehensive analytics
3. **`api.py`** - Serves analytics data through a REST API with caching

## 🔄 Data Flow

```
1. CSV Download → 2. Analytics Processing → 3. API Serving
     (S3)              (DynamoDB)           (Cached Responses)
```

---

## 📁 Lambda Functions

### 1. **`csv-download.py`**

Downloads lottery CSV files from external URLs and uploads them to S3.

#### **Purpose:**
- Downloads ZIP files containing CSV data
- Extracts CSV files from ZIP archives
- Uploads CSV data to S3 for processing

#### **Dependencies:**
- ✅ **No external layers needed** - All dependencies are built-in
- `urllib.request`, `urllib.error` - HTTP downloading
- `zipfile` - ZIP extraction
- `boto3` - S3 uploads
- `io.BytesIO` - Memory buffer handling

#### **Event Parameters:**
```json
{
  "detail": {
    "CSV_URL": "https://example.com/data.zip",
    "S3_BUCKET": "your-lottery-bucket",
    "S3_KEY": "data/lottery.csv"
  }
}
```

#### **Error Handling:**
- Validates all required event parameters
- Handles HTTP download failures
- Manages ZIP extraction errors
- Provides detailed error messages

---

### 2. **`analytics.py`**

Processes CSV data from S3 and generates comprehensive lottery analytics.

#### **Purpose:**
- Reads CSV data from S3 with multi-encoding support
- Generates 10+ different types of analytics
- Stores results in DynamoDB for API consumption

#### **Dependencies:**
- ✅ **No external layers needed** - All dependencies are built-in
- `csv` - CSV parsing
- `boto3` - S3 and DynamoDB operations
- `collections.Counter` - Frequency analysis
- `datetime` - Timestamp generation
- `typing` - Type hints

#### **Supported Lottery Formats:**
- **FDJ** (`ENV=fdj`): Uses `numero_chance` field, UTF-8 encoding
- **EuroMillions** (`ENV=em`): Uses `etoile_1`, `etoile_2` fields, ISO-8859-1 encoding

#### **Event Parameters:**
```json
{
  "detail": {
    "S3_BUCKET": "your-lottery-bucket",
    "S3_KEY": "data/lottery.csv",
    "ANALYTICS_TABLE": "AnalyticsTable",
    "ENV": "fdj",
    "MAX_NUMBER": 49,
    "LAST_N": 20
  }
}
```

#### **Analytics Generated:**
1. **Pattern Analysis** - Color pattern distribution
2. **Odd/Even Distribution** - Number parity analysis
3. **Low/High Distribution** - Number range analysis  
4. **Consecutive Numbers** - Sequential number detection
5. **Frequency Analysis** - Individual number frequencies
6. **Sum Analysis** - Draw total distributions
7. **Pairs Analysis** - Number pair frequencies
8. **Hot/Cold Numbers** - Most/least frequent numbers
9. **Pattern Prediction** - Next pattern suggestions
10. **Draws Storage** - Complete draw history

---

### 3. **`api.py`**

REST API that serves analytics data with intelligent caching.

#### **Purpose:**
- Provides REST endpoints for lottery analytics
- Implements 1-hour in-memory caching
- Handles multiple lottery formats
- Supports real-time data queries

#### **Dependencies:**
- ✅ **No external layers needed** - All dependencies are built-in
- `json` - JSON serialization
- `boto3` - DynamoDB operations
- `time` - Cache timestamp management
- `collections.defaultdict` - Heatmap calculations
- `decimal` - DynamoDB number handling

#### **API Endpoints:**

| Endpoint | Purpose | Cache Key |
|----------|---------|-----------|
| `GET /{name}/all` | All analytics for a lottery | `{name}_all` |
| `GET /{name}/last_n?n=50` | Last N draws | `{name}_last_n_{n}` |
| `GET /{name}/heatmap/last_n?n=50` | Heatmap data | `{name}_heatmap_last_n_{n}` |
| `GET /lottery` | List all lotteries | `lottery_list` |

#### **Environment Variables:**
```bash
ANALYTICS_TABLE=AnalyticsTable
LOTTERY_TABLE=LotteryTable
```

#### **Caching:**
- **TTL:** 1 hour (3600 seconds)
- **Storage:** In-memory cache
- **Auto-cleanup:** Expired entries automatically removed
- **Benefits:** Faster responses, reduced DynamoDB costs

---

## 🚀 Deployment

### **Requirements:**
- AWS Lambda Python 3.9+ runtime
- IAM permissions for S3, DynamoDB access
- Environment variables configured

### **Deploy Commands:**
```bash
# Create deployment packages
zip csv-download.zip csv-download.py
zip analytics.zip analytics.py  
zip api.zip api.py

# Deploy via AWS CLI
aws lambda update-function-code --function-name csv-download --zip-file fileb://csv-download.zip
aws lambda update-function-code --function-name analytics --zip-file fileb://analytics.zip
aws lambda update-function-code --function-name api --zip-file fileb://api.zip
```

### **IAM Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow", 
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::your-lottery-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem", 
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:region:account:table/AnalyticsTable",
        "arn:aws:dynamodb:region:account:table/LotteryTable"
      ]
    }
  ]
}
```

---

## 🧪 Testing

### **Test csv-download.py:**
```json
{
  "detail": {
    "CSV_URL": "https://www.fdj.fr/content/dam/fdj/corporate/jeux/resultats/loto/grille-numero-sorties-loto.zip",
    "S3_BUCKET": "test-bucket",
    "S3_KEY": "data/test.csv"
  }
}
```

### **Test analytics.py:**
```json
{
  "detail": {
    "S3_BUCKET": "test-bucket",
    "S3_KEY": "data/test.csv", 
    "ANALYTICS_TABLE": "AnalyticsTable",
    "ENV": "fdj",
    "MAX_NUMBER": 49,
    "LAST_N": 20
  }
}
```

### **Test api.py:**
```bash
# Test endpoints
curl https://your-api-gateway.com/lottery
curl https://your-api-gateway.com/fdj-loto/all
curl https://your-api-gateway.com/fdj-loto/last_n?n=10
```

---

## 🔧 Configuration

### **Environment Variables:**

| Function | Variable | Description | Example |
|----------|----------|-------------|---------|
| `analytics.py` | - | Uses event parameters | - |
| `api.py` | `ANALYTICS_TABLE` | DynamoDB analytics table | `AnalyticsTable` |
| `api.py` | `LOTTERY_TABLE` | DynamoDB lottery table | `LotteryTable` |

### **Memory & Timeout:**
- **csv-download.py:** 512MB, 60s timeout
- **analytics.py:** 1024MB, 300s timeout  
- **api.py:** 256MB, 30s timeout

---

## 🎯 Key Features

- ✅ **No External Dependencies** - All functions use built-in libraries only
- ✅ **Multi-Encoding Support** - Handles UTF-8 and ISO-8859-1 CSV files
- ✅ **Comprehensive Validation** - Detailed error handling and validation
- ✅ **Intelligent Caching** - 1-hour TTL with automatic cleanup
- ✅ **Multiple Lottery Support** - FDJ, EuroMillions, and extensible
- ✅ **Real-time Analytics** - 10+ different analysis types
- ✅ **Production Ready** - Proper logging, error handling, and monitoring

---

## 📊 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CSV Download  │ -> │    Analytics    │ -> │      API        │
│                 │    │                 │    │                 │
│ • Download ZIP  │    │ • Process CSV   │    │ • REST Endpoints│
│ • Extract CSV   │    │ • Generate      │    │ • Caching       │
│ • Upload to S3  │    │   Analytics     │    │ • JSON Response │
│                 │    │ • Store DynamoDB│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
    Amazon S3              Amazon DynamoDB           API Gateway
```

This architecture provides a scalable, serverless solution for lottery analytics processing and serving! 🚀 