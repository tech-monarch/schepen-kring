# 🚀 Backend Developer Instructions - Multi-Tenant Chat Widget

## 📋 **What You Need to Build**

**Goal:** Create a backend API that supports embeddable chat widgets for multiple partners (webshop owners).

**Each partner gets:**
- Their own customizable chat widget
- Their own AI chatbot trained on their specific data
- Ability to update widget settings directly from the widget (no admin dashboard needed)

---

## 🗄️ **Database Tables to Create**

### **1. User Companies Table**
```sql
CREATE TABLE user_companies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id VARCHAR(255) UNIQUE NOT NULL, -- e.g., '123', '456'
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    logo_url VARCHAR(500) NULL,
    settings JSON NULL,
    ai_config JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **2. Widget Settings Table**
```sql
CREATE TABLE widget_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id VARCHAR(255) NOT NULL,
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    text_color VARCHAR(7) DEFAULT '#ffffff',
    background_color VARCHAR(7) DEFAULT '#ffffff',
    border_radius INT DEFAULT 12,
    company_name VARCHAR(255) NOT NULL,
    company_logo VARCHAR(500) NULL,
    welcome_message TEXT NOT NULL,
    placeholder_text VARCHAR(255) DEFAULT 'Type your message...',
    position ENUM('bottom-right', 'bottom-left', 'top-right', 'top-left') DEFAULT 'bottom-right',
    auto_open BOOLEAN DEFAULT FALSE,
    show_typing_indicator BOOLEAN DEFAULT TRUE,
    ai_personality TEXT DEFAULT 'friendly and helpful assistant',
    ai_temperature DECIMAL(2,1) DEFAULT 0.7,
    max_tokens INT DEFAULT 500,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES user_companies(company_id)
);
```

### **3. Chat Conversations Table**
```sql
CREATE TABLE chat_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL, -- Anonymous user ID
    session_id VARCHAR(255) NOT NULL,
    messages JSON NOT NULL, -- Array of messages
    metadata JSON NULL,
    last_activity_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_user (company_id, user_id),
    INDEX idx_company_session (company_id, session_id)
);
```

### **4. Pinecone Vectors Table**
```sql
CREATE TABLE pinecone_vectors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id VARCHAR(255) NOT NULL,
    vector_id VARCHAR(255) NOT NULL, -- Pinecone vector ID
    content TEXT NOT NULL, -- Original content
    metadata JSON NULL,
    source VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company (company_id),
    UNIQUE KEY unique_company_vector (company_id, vector_id)
);
```

---

## 🔧 **API Endpoints to Create**

### **Widget Settings API**

**GET** `/api/widget-settings/{companyId}`
- **Purpose:** Get widget settings for a specific company
- **Response:** JSON with all widget settings
- **Example:** `GET /api/widget-settings/123`

**POST** `/api/widget-settings/{companyId}`
- **Purpose:** Update widget settings for a specific company
- **Body:** JSON with settings to update
- **Example:** `POST /api/widget-settings/123` with `{"primary_color": "#ff0000", "welcome_message": "Hello!"}`

### **Partner Chat API**

**POST** `/api/partner-chat/{companyId}`
- **Purpose:** Handle AI chat conversations for a specific company
- **Body:** `{"message": "Hello", "user_id": "user123", "history": []}`
- **Response:** `{"message": "AI response", "company_id": "123"}`

---

## 🤖 **AI Integration Required**

### **1. Pinecone Integration**
- **Purpose:** Store and search company-specific knowledge
- **Setup:** Get Pinecone API key and create index
- **Function:** Search for relevant context when user sends message

### **2. OpenAI Integration**
- **Purpose:** Generate AI responses
- **Setup:** Get OpenAI API key
- **Function:** Create responses using company context and settings

---

## 📝 **Step-by-Step Implementation**

### **Step 1: Database Setup**
1. Create the 4 tables above
2. Add some test data for company_id '123'

### **Step 2: Create Controllers**
1. **WidgetSettingsController** - Handle widget settings
2. **PartnerChatController** - Handle AI chat

### **Step 3: Create Services**
1. **PineconeService** - Search company knowledge
2. **AIService** - Generate AI responses

### **Step 4: Add API Routes**
```php
// Add to routes/api.php
Route::get('/widget-settings/{companyId}', [WidgetSettingsController::class, 'getSettings']);
Route::post('/widget-settings/{companyId}', [WidgetSettingsController::class, 'updateSettings']);
Route::post('/partner-chat/{companyId}', [PartnerChatController::class, 'sendMessage']);
```

### **Step 5: Environment Configuration**
Add to `.env`:
```bash
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-west1-gcp
OPENAI_API_KEY=your_openai_api_key
```

---

## 🧪 **Testing**

### **Test Widget Settings:**
```bash
curl -X GET http://your-domain.com/api/widget-settings/123
```

### **Test Chat:**
```bash
curl -X POST http://your-domain.com/api/partner-chat/123 \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, I need help with my order"}'
```

---

## 🎯 **Key Requirements**

1. **Multi-tenant isolation** - Each company_id has separate data
2. **Real-time settings** - Partners can update widget settings instantly
3. **AI responses** - Each partner gets responses based on their data
4. **CORS enabled** - Widget can be embedded on any website
5. **Error handling** - Graceful fallbacks when AI services fail

---

## 📊 **Expected Data Flow**

1. **Partner embeds widget** on their website with `data-company="123"`
2. **Widget loads settings** from `/api/widget-settings/123`
3. **User sends message** → Widget calls `/api/partner-chat/123`
4. **Backend searches Pinecone** for company-specific context
5. **AI generates response** using company's data and settings
6. **Response sent back** to widget

---

## 🚀 **Priority: URGENT**

**This needs to be completed today.** The frontend widget is ready and waiting for these APIs.

**Deliverables:**
- [ ] Database tables created
- [ ] API endpoints working
- [ ] Pinecone integration working
- [ ] OpenAI integration working
- [ ] CORS configured
- [ ] Tested with curl commands

**Questions?** Ask me immediately - don't wait!

---

## 📁 **Reference Files**

- **Complete technical specs:** `BACKEND_API_REQUIREMENTS.md`
- **Frontend widget:** `public/widget.js`
- **Widget embed guide:** `WIDGET_EMBED_GUIDE.md`

**Everything is copy-paste ready in the reference files!**
