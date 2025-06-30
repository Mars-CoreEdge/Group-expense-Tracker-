# ExpenseTracker FastAPI Backend

A RESTful API backend for the ExpenseTracker application built with FastAPI and Supabase.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- Supabase account and project

### 1. Install Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env` file in the `api` directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

Get these values from your Supabase project:
- Go to Settings → API in your Supabase dashboard
- Copy the Project URL and anon public key
- Copy the service_role key (optional, for admin operations)

### 3. Start the Server

```bash
python start.py
```

The API will be available at:
- **Server**: http://localhost:8000
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc

## 📡 API Endpoints

### Authentication

All API endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_session_token>
```

### Required Endpoints

#### 1. Create Group
```http
POST /api/groups
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "My Group",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "My Group",
  "description": "Optional description",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "created_by": "user-uuid"
}
```

#### 2. Get Expenses for Group
```http
GET /api/expenses/{group_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "expenses": [
    {
      "id": 1,
      "description": "Coffee",
      "amount": 4.50,
      "group_id": 1,
      "created_by": "user-uuid",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "total_amount": 4.50
}
```

#### 3. Add Expense to Group
```http
POST /api/expenses/{group_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "description": "Coffee",
  "amount": 4.50
}
```

**Response:**
```json
{
  "id": 1,
  "description": "Coffee",
  "amount": 4.50,
  "group_id": 1,
  "created_by": "user-uuid",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Additional Endpoints

#### Get User Groups
```http
GET /api/groups
Authorization: Bearer <token>
```

#### Health Check
```http
GET /health
```

## 🔧 Development

### Running in Development Mode

The server runs with auto-reload enabled by default. Any changes to the code will automatically restart the server.

### Testing the API

1. **Using the interactive docs**: Visit http://localhost:8000/docs
2. **Using curl**:
   ```bash
   # Health check
   curl http://localhost:8000/health
   
   # Create group (requires auth token)
   curl -X POST http://localhost:8000/api/groups \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name": "Test Group", "description": "Test description"}'
   ```

### Project Structure

```
api/
├── main.py          # FastAPI application
├── config.py        # Configuration settings
├── database.py      # Supabase client setup
├── models.py        # Pydantic models
├── requirements.txt # Python dependencies
├── start.py         # Server startup script
└── README.md        # This file
```

## 🔒 Security Features

- **JWT Authentication**: Uses Supabase session tokens
- **User Isolation**: Users can only access their own groups and expenses
- **Input Validation**: Pydantic models validate all inputs
- **CORS**: Configured for frontend origins
- **Error Handling**: Comprehensive error responses

## 🐛 Troubleshooting

### Common Issues

1. **"Authorization header missing"**
   - Ensure you're sending the Authorization header with Bearer token
   - Token should be a valid Supabase session token

2. **"Internal server error"**
   - Check that Supabase credentials are correctly set in `.env`
   - Verify database tables exist (groups, expenses)

3. **CORS errors**
   - Frontend port should be listed in `config.py` CORS_ORIGINS

### Logs

The API logs all requests and errors. Check the console output for detailed error information.

## 🚀 Production Deployment

For production deployment:

1. Set `reload=False` in `start.py`
2. Use a production WSGI server like Gunicorn
3. Set proper environment variables
4. Configure HTTPS
5. Set up monitoring and logging

## 📝 API Documentation

Full interactive API documentation is available at `/docs` when the server is running. 