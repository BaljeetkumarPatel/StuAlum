# StuAlum

[![GitHub Stars](https://img.shields.io/github/stars/BaljeetkumarPatel/StuAlum?style=flat-square)](https://github.com/BaljeetkumarPatel/StuAlum)
[![GitHub Forks](https://img.shields.io/github/forks/BaljeetkumarPatel/StuAlum?style=flat-square)](https://github.com/BaljeetkumarPatel/StuAlum)
[![License](https://img.shields.io/badge/license-ISC-blue?style=flat-square)](https://opensource.org/licenses/ISC)
[![Repository Size](https://img.shields.io/github/languages/code-size/BaljeetkumarPatel/StuAlum?style=flat-square)](https://github.com/BaljeetkumarPatel/StuAlum)
[![Last Commit](https://img.shields.io/github/last-commit/BaljeetkumarPatel/StuAlum?style=flat-square)](https://github.com/BaljeetkumarPatel/StuAlum)
[![Language](https://img.shields.io/github/languages/top/BaljeetkumarPatel/StuAlum?style=flat-square)](https://github.com/BaljeetkumarPatel/StuAlum)

## An AI-Powered Student–Alumni Networking & Career Development Platform

StuAlum is a production-grade SaaS platform that bridges the gap between students and alumni through intelligent AI matching, real-time mentorship, semantic search, and data-driven career guidance. Built with enterprise-level architecture, cutting-edge AI capabilities, and a focus on scalability and security.

**[Live Demo](https://stu-alum.vercel.app)** • **[Report an Issue](https://github.com/BaljeetkumarPatel/StuAlum/issues)** • **[Request a Feature](https://github.com/BaljeetkumarPatel/StuAlum/discussions)**

---

## Why StuAlum?

### The Problem

- **Career Disconnect**: Students lack access to mentorship and guidance from industry professionals.
- **Alumni Engagement**: Alumni struggle to find meaningful ways to give back to their institutions.
- **Limited Networking**: Traditional alumni networks lack personalization and scalability.
- **Information Overload**: Matching the right mentor to the right student is complex and time-consuming.

### The Solution

StuAlum leverages **semantic embeddings**, **vector similarity search**, and **AI reasoning** to:

✓ Match students with ideal mentors based on skills, career goals, and aspirations  
✓ Enable real-time messaging with Socket.IO for seamless communication  
✓ Provide AI-powered career guidance and resource recommendations  
✓ Build community through forums, events, and peer networking  
✓ Gamify engagement with points, badges, and achievement tracking  
✓ Support institutional analytics and placement statistics  

---

## Key Features

### 🎓 Student Features

- **Intelligent Mentor Matching**: AI-powered recommendation engine finds ideal mentors based on embeddings
- **Profile Building**: Comprehensive profile with skills, interests, career goals, and project portfolio
- **Mentorship Discovery**: Search and browse qualified mentors with filtering by experience and industry
- **Real-Time Messaging**: Socket.IO–powered instant communication with mentors
- **Scheduled Sessions**: Calendar integration for mentorship appointments and follow-ups
- **Resource Access**: Download materials, guides, and career preparation resources from mentors
- **Community Forum**: Engage in category-based discussions with peers and alumni
- **Career Dashboard**: Track recommendations, applications, and interview prep resources
- **Event Discovery**: Attend webinars, workshops, and networking sessions
- **Gamification**: Earn points and badges for engagement and milestones
- **Notifications**: Personalized alerts for mentorship requests, messages, and events

### 👨‍💼 Alumni Features

- **Mentor Profile**: Showcase professional journey, skills, and expertise
- **Mentorship Preferences**: Define areas of focus and communication preferences
- **Mentor Matching**: Receive student profiles that align with your interests
- **Resource Sharing**: Upload PDFs, guides, and career prep materials
- **Session Management**: Schedule and manage mentorship meetings
- **Career Insights**: Share industry trends, job opportunities, and career paths
- **Community Contribution**: Participate in forums and provide peer guidance
- **Placement Analytics**: View aggregate placement statistics from your cohort
- **Speaking Opportunities**: Get invited to events and guest lectures
- **Engagement Tracking**: Monitor mentorship history and impact metrics

### 🤖 AI & Recommendation Engine

- **Semantic Embeddings**: Google Generative AI (text-embedding-004) for profile vectorization
- **Vector Search**: MongoDB Atlas Vector Search for similarity-based matching
- **Hybrid Scoring**: Combines vector similarity with domain-specific signals
  - Experience normalization (0-1 scale)
  - Branch/degree alignment
  - Industry-career goal overlap
  - Geographic and role preferences
- **AI Reasoning**: Gemini 2.5 Flash generates personalized match explanations
- **Dynamic Re-embedding**: Profiles automatically update embeddings on skill/goal changes
- **Production-Safe Fallback**: Graceful degradation with random vectors if API fails

### 💼 Career Features

- **AI-Powered Recommendations**: Personalized mentor, resource, and job recommendations
- **Career Guidance**: AI chatbot for interview prep and career questions
- **Resume Analysis**: Extract key skills and experience from uploaded documents
- **Skill Gap Analysis**: Identify missing skills aligned with target roles (Future)
- **Career Path Prediction**: AI-driven insights on potential trajectories (Future)
- **Mock Interviews**: AI-powered interview simulation and feedback (Future)

### 🌐 Networking Features

- **Alumni Directory**: Browse verified alumni with advanced search
- **CSV Export**: Admin-enabled bulk export of alumni data
- **Forum Categories**: Organized discussions across topics
- **Event Management**: Create, promote, and manage networking events
- **Alumni Invitations**: Admin tools to invite and onboard alumni
- **Social Profiles**: Link LinkedIn, GitHub, and LeetCode
- **Real-Time Notifications**: Instant alerts for connections and opportunities

### 🔒 Security & Authentication

- **JWT Authentication**: Bearer token–based session management
- **Role-Based Access Control (RBAC)**: Student, Alumni, Admin roles with distinct permissions
- **Password Hashing**: bcryptjs for secure credential storage
- **Middleware Protection**: Auth middleware validates tokens on protected routes
- **Ownership Verification**: Users can only modify their own data
- **File Upload Security**: Multer-based validation for document uploads
- **Environment Isolation**: Secure .env configuration for sensitive keys

### ⚙️ Admin Features

- **Alumni Invitation System**: Send invitations with custom messaging
- **User Verification**: Approve and verify student/alumni accounts
- **Analytics Dashboard**: Placement statistics and engagement metrics
- **Forum Moderation**: Manage posts, comments, and categories
- **Event Administration**: Create and manage networking events
- **CSV Data Export**: Bulk export for institutional reporting
- **Points & Badges Management**: Award and manage gamification rewards
- **Platform Settings**: Configure system parameters and business rules

---

## System Architecture

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend (Next.js/React)"]
        UI["UI Components & Pages"]
        Socket["Socket.IO Client"]
        Auth["Auth Context"]
    end
    
    subgraph Backend["⚙️ Backend (Express.js)"]
        API["REST API Router"]
        Auth_Mid["JWT Auth Middleware"]
        RBAC["Role-Based Access Control"]
        Controllers["Business Logic Controllers"]
        Models["MongoDB Models"]
    end
    
    subgraph Database["🗄️ Database Layer"]
        MongoDB["MongoDB Atlas"]
        VectorSearch["Vector Search Index<br/>alumniprofiles"]
    end
    
    subgraph AI["🤖 AI Engine"]
        Embeddings["Text Embedding<br/>text-embedding-004"]
        Reasoning["Generative AI<br/>Gemini 2.5 Flash"]
        Match["Hybrid Matcher"]
    end
    
    subgraph Services["🔧 External Services"]
        SendGrid["SendGrid Mail"]
        MailerSend["MailerSend Email"]
        Socket_Server["Socket.IO Server"]
    end
    
    Frontend -->|REST + JWT| Backend
    Frontend -->|Socket Events| Socket_Server
    Backend --> Auth_Mid
    Auth_Mid --> RBAC
    RBAC --> Controllers
    Controllers --> Models
    Models --> MongoDB
    Models --> VectorSearch
    Controllers -->|Text| Embeddings
    Embeddings -->|Vectors| VectorSearch
    VectorSearch -->|Candidates| Match
    Match -->|Prompt| Reasoning
    Controllers -->|Emails| SendGrid
    Controllers -->|Emails| MailerSend
    Socket_Server -.->|Real-time| Frontend
```

---

## User Flow

```mermaid
flowchart TD
    A["New User"] -->|Register| B{User Type?}
    B -->|Student| C["Student Registration<br/>Skills + Career Goals"]
    B -->|Alumni| D["Alumni Registration<br/>Experience + Expertise"]
    C -->|Create Profile| E["Profile Embedding Generated<br/>Stored in MongoDB"]
    D -->|Create Profile| F["Alumni Embedding Generated<br/>Stored in Vector DB"]
    E -->|Login| G["JWT Token Issued"]
    F -->|Login| G
    G -->|Browse Alumni| H["Vector Search<br/>Top Matches"]
    H -->|View Recommendations| I["AI Ranking<br/>Hybrid Scoring"]
    I -->|Select Mentor| J["Send Request"]
    J -->|Mentor Reviews| K{Accept?}
    K -->|Yes| L["Mentorship Active"]
    K -->|No| M["Request Declined"]
    L -->|Real-Time Chat| N["Socket.IO Messages"]
    L -->|Schedule Session| O["Calendar Event"]
    L -->|Share Resources| P["Upload & Download"]
    O -->|Complete| Q["Mark Complete"]
    N -.->|Typing Indicator| N
    P -->|Track| R["Mentorship History"]
    R -->|View Impact| S["Analytics Dashboard"]
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js / React | UI Framework & Components |
| | Vercel | Deployment & Hosting |
| **Backend** | Node.js | Runtime Environment |
| | Express.js 5.x | Web Framework |
| | Socket.IO 4.x | Real-Time Communication |
| **Database** | MongoDB 8.x | NoSQL Data Store |
| | Mongoose 8.x | ODM & Schema Validation |
| **Authentication** | JWT | Token-Based Auth |
| | bcryptjs | Password Hashing |
| **AI/ML** | Google Generative AI | Embeddings & Reasoning |
| | text-embedding-004 | Vector Generation |
| | Gemini 2.5 Flash | LLM for Explanations |
| **Vector Search** | MongoDB Atlas Vector Search | Semantic Similarity |
| **File Handling** | Multer 2.x | File Uploads |
| **Email** | SendGrid | Transactional Email |
| | MailerSend | Email Delivery |
| **Utilities** | dotenv | Environment Config |
| | CORS | Cross-Origin Requests |
| | body-parser | Request Parsing |
| **Dev Tools** | Git | Version Control |

---

## Folder Structure

```
StuAlum/
├── BACKEND/
│   ├── app.js                          # Express app entry point
│   ├── package.json                    # Backend dependencies
│   ├── .env                            # Environment variables
│   │
│   ├── config/
│   │   └── db.js                       # MongoDB connection
│   │
│   ├── models/
│   │   ├── StudentProfile.js           # Student schema + embeddings
│   │   ├── AlumniProfile.js            # Alumni schema + embeddings
│   │   ├── AdminProfile.js             # Admin schema
│   │   ├── MentorshipRequest.js        # Mentorship status tracking
│   │   ├── MentorshipSession.js        # Session scheduling
│   │   ├── Post.js                     # Forum posts
│   │   ├── PostComment.js              # Forum comments
│   │   ├── Event.js                    # Networking events
│   │   ├── Message.js                  # Real-time messages
│   │   ├── PlacementStats.js           # Analytics data
│   │   └── CareerArticleVideo.js       # Learning resources
│   │
│   ├── routes/
│   │   ├── studentRoutes.js            # Student auth & profile
│   │   ├── alumniRoutes.js             # Alumni auth & profile
│   │   ├── adminRoutes.js              # Admin operations
│   │   ├── authRoutes.js               # User authentication
│   │   ├── mentorshipRoutes.js         # Mentorship endpoints
│   │   ├── messageRoutes.js            # Messaging endpoints
│   │   ├── forumRoutes.js              # Forum endpoints
│   │   ├── eventRoutes.js              # Event management
│   │   ├── careerRoutes.js             # Career resources
│   │   ├── recommendationRoutes.js     # AI recommendations
│   │   ├── chatbotRoutes.js            # AI chatbot
│   │   ├── pointsRoutes.js             # Gamification
│   │   ├── placementRoutes.js          # Analytics
│   │   └── contactRoutes.js            # Contact form
│   │
│   ├── controllers/
│   │   ├── studentController.js        # Student logic
│   │   ├── alumniController.js         # Alumni logic
│   │   ├── adminController.js          # Admin logic
│   │   ├── mentorshipController.js     # Mentorship matching
│   │   ├── messageController.js        # Messaging logic
│   │   ├── recommendationController.js # AI matching engine
│   │   ├── forumController.js          # Forum moderation
│   │   └── analyticsController.js      # Placement analytics
│   │
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification
│   │   ├── checkRole.js                # Role-based access
│   │   ├── checkOwnership.js           # Ownership validation
│   │   └── uploadMiddleware.js         # Multer file handling
│   │
│   ├── utils/
│   │   ├── aiService.js                # Embedding & reasoning API
│   │   ├── emailService.js             # Email sending
│   │   └── validators.js               # Input validation
│   │
│   └── uploads/                        # File storage (local)
│
├── frontend/
│   ├── package.json                    # Frontend dependencies
│   ├── pages/
│   │   ├── index.js                    # Landing page
│   │   ├── register.js                 # Registration pages
│   │   ├── login.js                    # Login pages
│   │   ├── dashboard.js                # Dashboard
│   │   ├── profile.js                  # Profile management
│   │   ├── mentors.js                  # Mentor discovery
│   │   ├── messages.js                 # Messaging interface
│   │   ├── forum.js                    # Community forum
│   │   ├── events.js                   # Event listing
│   │   └── admin.js                    # Admin panel
│   │
│   ├── components/
│   │   ├── Layout.js                   # Main layout wrapper
│   │   ├── Navbar.js                   # Navigation
│   │   ├── Card.js                     # Reusable card
│   │   ├── SearchBar.js                # Search component
│   │   └── MentorCard.js               # Mentor profile card
│   │
│   ├── lib/
│   │   ├── api.js                      # API client utilities
│   │   ├── socket.js                   # Socket.IO client
│   │   └── auth.js                     # Auth helpers
│   │
│   └── styles/
│       └── globals.css                 # Global styles
│
├── .gitignore
├── README.md
└── package.json                        # Root package.json
```

---

## Installation

### Prerequisites

- **Node.js** 16+ and npm/yarn
- **MongoDB Atlas** account (cloud) or local MongoDB
- **Google Cloud API** account (for embeddings)
- **SendGrid/MailerSend** account (for email)
- **Environment variables** configured

### Clone the Repository

```bash
git clone https://github.com/BaljeetkumarPatel/StuAlum.git
cd StuAlum
```

### Backend Setup

```bash
cd BACKEND

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your credentials
# See Environment Variables section below

# Start the server
node app.js
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run development server
npm run dev
# Frontend runs on http://localhost:3000
```

### Database Setup

1. **MongoDB Atlas**:
   - Create cluster at [mongodb.com/cloud](https://www.mongodb.com/cloud/atlas)
   - Generate connection string
   - Add to `BACKEND/.env` as `MONGO_URI`

2. **Vector Search Index**:
   ```javascript
   // Create index on AlumniProfile collection
   db.alumniprofiles.createIndex(
     { embedding: "cosmosSearch" },
     { "cosmosSearchOptions": { "kind": "vector-ivf", "m": 4, "efConstruction": 400, "efSearch": 40, "metric": "cosine" } }
   )
   ```

### Environment Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `MONGO_URI` | String | ✅ | MongoDB connection string |
| `JWT_SECRET` | String | ✅ | Secret key for JWT tokens (min 32 chars) |
| `PORT` | Number | ❌ | Server port (default: 5000) |
| `GEMINI_API_KEY` | String | ✅ | Google Generative AI API key |
| `SENDGRID_API_KEY` | String | ✅ | SendGrid API key for emails |
| `MAILERSEND_API_KEY` | String | ❌ | MailerSend API key (alternative to SendGrid) |
| `NODE_ENV` | String | ❌ | Environment (development/production) |

**Example .env file**:
```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/stualum
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
GEMINI_API_KEY=your_google_generative_ai_key
SENDGRID_API_KEY=your_sendgrid_api_key
PORT=5000
NODE_ENV=development
```

### Run Locally

```bash
# Terminal 1: Backend
cd BACKEND
npm start

# Terminal 2: Frontend
cd frontend
npm run dev

# Open http://localhost:3000 in your browser
```

---

## Environment Variables Reference

Create a `.env` file in the `BACKEND/` directory:

```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Authentication
JWT_SECRET=your_jwt_secret_key_min_32_chars

# AI Services
GEMINI_API_KEY=your_google_generative_ai_key

# Email Services
SENDGRID_API_KEY=your_sendgrid_api_key
MAILERSEND_API_KEY=your_mailersend_api_key

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## API Overview

### Authentication Endpoints

```
POST   /api/student/register       Register new student
POST   /api/student/login          Student login
POST   /api/alumni/register        Register new alumni
POST   /api/alumni/login           Alumni login
GET    /api/auth/me                Get current user
```

### Student Endpoints

```
GET    /api/student/directory      Browse student directory
GET    /api/student/profile/:id    Get student profile
PATCH  /api/student/edit/:id       Update student profile
```

### Alumni Endpoints

```
GET    /api/alumni/directory       Browse alumni directory
GET    /api/alumni/export          Export alumni to CSV
GET    /api/alumni/:id             Get alumni profile
PATCH  /api/alumni/edit/:id        Update alumni profile
POST   /api/alumni/invite          Invite alumni (admin)
```

### Mentorship Endpoints

```
POST   /api/mentorship/request                Create mentorship request
GET    /api/mentorship/requests               Get pending requests
POST   /api/mentorship/respond                Accept/decline request
GET    /api/mentorship/connections           Get active connections
GET    /api/mentorship/match                  Get AI-matched mentors
POST   /api/mentorship/smart-match            Smart matching
GET    /api/mentorship/history                Get mentorship history
POST   /api/mentorship/schedule-session       Schedule session
GET    /api/mentorship/scheduled-sessions    Get scheduled sessions
POST   /api/mentorship/upload-resource       Upload resource (alumni)
GET    /api/mentorship/resources             Get resources
```

### Messaging Endpoints

```
POST   /api/messages/conversation            Create/get conversation
POST   /api/messages/send                    Send message
GET    /api/messages/conversations           Get all conversations
GET    /api/messages/conversation/:id        Get messages
```

### Recommendations Endpoint

```
POST   /api/recommendations/generate         Generate mentor recommendations
```

### Forum Endpoints

```
GET    /api/forums/categories               Get forum categories
POST   /api/forums/post                     Create post
GET    /api/forums/post/:id                 Get post
POST   /api/forums/comment                  Add comment
```

### Event Endpoints

```
GET    /api/events/list                     List events
POST   /api/events/create                   Create event
GET    /api/events/:id                      Get event details
```

### Career Endpoints

```
GET    /api/career/resources                Get career resources
POST   /api/career/upload                   Upload resource
```

### Admin Endpoints

```
GET    /api/admin/analytics                 Get analytics
POST   /api/admin/verify-user               Verify user
GET    /api/admin/pending-verifications     Get pending verifications
```

### Chatbot Endpoint

```
POST   /api/chatbot/ask                     AI career questions
```

### Gamification Endpoints

```
GET    /api/points/leaderboard              Get leaderboard
POST   /api/points/award                    Award points (admin)
GET    /api/points/badges                   Get badges
```

---

## Authentication Flow

### JWT Authentication Architecture

```
1. User Registration/Login
   ↓
2. Server validates credentials → checks password (bcryptjs)
   ↓
3. Server generates JWT token with payload:
   {
     id: user_id,
     role: "student|alumni|admin",
     email: user_email,
     iat: issued_at,
     exp: expiration_time
   }
   ↓
4. Token signed with JWT_SECRET
   ↓
5. Client stores token (localStorage/sessionStorage)
   ↓
6. Client sends token in Authorization header:
   Authorization: Bearer <token>
   ↓
7. Middleware (auth.js) validates:
   - Header format (Bearer <token>)
   - Token signature
   - Token expiration
   - Payload integrity (id, role)
   ↓
8. If valid → req.user populated → proceed
   If invalid → return 401 Unauthorized
```

### Role-Based Access Control (RBAC)

```
Student:
- Register/login
- Browse alumni directory
- Search mentors
- Request mentorship
- Send messages
- Access resources
- Participate in forums
- View recommendations

Alumni:
- Register/login
- View student profiles
- Manage mentorship requests
- Schedule sessions
- Upload resources
- View analytics
- Participate in forums

Admin:
- All alumni permissions
- Verify users
- Export data
- Manage categories
- View full analytics
- Award badges/points
- Send invitations
```

### Protected Routes Example

```javascript
// Middleware stack
router.patch(
  '/edit/:id',
  auth,                          // Verify JWT token
  checkRole(['student']),        // Verify role
  checkOwnership,                // Verify ownership of resource
  upload.fields([...]),          // Handle file uploads
  updateStudentProfile           // Execute controller
);
```

---

## Database Design

```mermaid
erDiagram
    STUDENT_PROFILE ||--o{ MENTORSHIP_REQUEST : initiates
    STUDENT_PROFILE ||--o{ MESSAGE : sends
    STUDENT_PROFILE ||--o{ POST : creates
    STUDENT_PROFILE ||--o{ POINTS : earns
    
    ALUMNI_PROFILE ||--o{ MENTORSHIP_REQUEST : receives
    ALUMNI_PROFILE ||--o{ MESSAGE : sends
    ALUMNI_PROFILE ||--o{ POST : creates
    ALUMNI_PROFILE ||--o{ MENTORSHIP_SESSION : hosts
    
    MENTORSHIP_REQUEST ||--o{ MENTORSHIP_SESSION : converts_to
    MENTORSHIP_SESSION ||--o{ MESSAGE : contains
    
    POST ||--o{ POST_COMMENT : has
    POST ||--o{ POST_LIKE : receives
    
    FORUM_CATEGORY ||--o{ POST : organizes
    
    EVENT ||--o{ STUDENT_PROFILE : attendees
    EVENT ||--o{ ALUMNI_PROFILE : speakers
    
    STUDENT_PROFILE {
        ObjectId _id
        string full_name
        string enrollment_number
        string email
        string password
        string branch
        int year_of_admission
        int year_of_graduation
        array skills
        array interests
        string career_goals
        string mentorship_area
        array embedding
        boolean is_verified
        int points
        array badges
        timestamp created_at
    }
    
    ALUMNI_PROFILE {
        ObjectId _id
        string email
        string password
        string full_name
        int graduation_year
        string current_position
        string company
        string industry
        int years_of_experience
        array skills
        string about_me
        array embedding
        boolean is_verified
        timestamp created_at
    }
    
    MENTORSHIP_REQUEST {
        ObjectId _id
        ObjectId mentee_id
        ObjectId mentor_id
        string status
        timestamp created_at
    }
    
    MENTORSHIP_SESSION {
        ObjectId _id
        ObjectId mentorship_id
        datetime scheduled_time
        string status
        timestamp created_at
    }
    
    MESSAGE {
        ObjectId _id
        ObjectId sender_id
        ObjectId recipient_id
        string content
        timestamp created_at
    }
    
    POST {
        ObjectId _id
        ObjectId forum_id
        string title
        string content
        ObjectId created_by
        string author_model_type
        int likes_count
        int views_count
        timestamp created_at
    }
    
    FORUM_CATEGORY {
        ObjectId _id
        string name
        string description
        timestamp created_at
    }
    
    EVENT {
        ObjectId _id
        string title
        string description
        datetime event_date
        ObjectId organizer_id
        timestamp created_at
    }
```

---

## AI Recommendation Pipeline

```mermaid
flowchart LR
    A["Student Profile<br/>Skills, Goals, Branch"] -->|Extract Text| B["Profile Aggregation<br/>Name + Branch + Skills + Goals"]
    B -->|Generate| C["Embedding Vector<br/>Google text-embedding-004<br/>1536 dimensions"]
    C -->|Query| D["Vector Search<br/>MongoDB Atlas Vector Search<br/>Cosine Similarity"]
    D -->|Retrieve| E["Top 100 Candidates<br/>Alumni Profiles<br/>Pre-embedded"]
    E -->|Re-rank| F["Hybrid Scoring<br/>55% Experience<br/>30% Vector Score<br/>10% Branch Match<br/>5% Industry Overlap"]
    F -->|Select| G["Top 5 Alumni<br/>Highest Scores"]
    G -->|Generate Prompt| H["Match Explanation<br/>Skills Alignment<br/>Experience Relevance<br/>Career Path Fit"]
    H -->|LLM Generation| I["Gemini 2.5 Flash<br/>Generative Reasoning"]
    I -->|Format| J["Final Response<br/>Ranked List<br/>Vector Scores<br/>Hybrid Scores<br/>AI Explanations"]
    J -->|Return| K["Frontend Render<br/>Mentor Cards<br/>With Reasoning"]
```

---

## Performance & Scalability

### Embedding Generation

- **Model**: `text-embedding-004` (Google Generative AI)
- **Vector Dimensions**: 1,536
- **Generation Trigger**: On profile creation/update
- **Caching**: Vectors stored in MongoDB for retrieval
- **Fallback**: Random vectors if API fails (graceful degradation)

### Vector Search Optimization

- **Index Type**: MongoDB Atlas Vector Search
- **Index Path**: `embedding` field
- **Similarity Metric**: Cosine distance
- **Num Candidates**: 100 (candidates retrieved before re-ranking)
- **Limit**: 20 (final results before hybrid filtering)
- **Query Time**: ~50-200ms depending on index size

### Hybrid Scoring Strategy

```
finalScore = 0.55 × experience + 0.30 × vectorScore + 0.10 × branchMatch + 0.05 × industryMatch

- Experience: Normalized to 0-1 range (years / 15)
- Vector Score: Direct similarity from MongoDB (0-1)
- Branch Match: Binary (1 if degree matches, 0 otherwise)
- Industry Match: Binary (1 if industry contains career goal, 0 otherwise)
```

### Real-Time Communication

- **Technology**: Socket.IO 4.x
- **Connection Model**: Room-based (one room per conversation)
- **Events**: joinConversation, leaveConversation, sendMessage, typing
- **Scalability**: Horizontal scaling with Redis adapter (Future)
- **Fallback**: REST API if WebSocket unavailable

### Database Optimization

- **Connection Pool**: Mongoose default pool
- **Indexing**: Composite indexes on frequently queried fields
- **Query Optimization**: Aggregation pipeline for complex queries
- **Lazy Loading**: Frontend implements pagination
- **Batch Operations**: Bulk inserts for analytics data

### Frontend Performance

- **Framework**: Next.js with server-side rendering
- **Deployment**: Vercel (edge caching, automatic optimization)
- **Code Splitting**: Dynamic imports for lazy loading
- **Image Optimization**: Next Image component
- **API Caching**: React Query/SWR for request caching

---

## Security Considerations

### Authentication & Authorization

✓ **JWT Verification**: Validates signature, expiration, payload integrity  
✓ **Role-Based Access Control**: Student, Alumni, Admin roles enforced  
✓ **Ownership Validation**: Users cannot modify others' data  
✓ **Protected Routes**: Auth middleware on all sensitive endpoints  
✓ **Token Expiration**: Automatic token refresh (Future)  

### Data Protection

✓ **Password Hashing**: bcryptjs with salting  
✓ **Sensitive Fields Hidden**: Password excluded from queries (`.select("-password")`)  
✓ **Environment Variables**: API keys never exposed in code  
✓ **CORS Configuration**: Restricted origins (production)  

### Input Validation

✓ **Email Validation**: Format checking  
✓ **File Upload Validation**: Type and size restrictions  
✓ **Required Fields**: Schema-level validation  
✓ **Case-Insensitive Processing**: Prevents duplicate records  

### Production Readiness

✓ **Error Handling**: Try-catch blocks with meaningful messages  
✓ **Graceful Degradation**: Fallback vectors if AI API fails  
✓ **Logging**: Console logs for debugging (production logging via Winston/Morgan - Future)  
✓ **Rate Limiting**: Recommended for production deployment (Future)  
✓ **HTTPS**: Required for production (Vercel provides automatic SSL)  

---

## Future Roadmap

### Phase 2: Advanced AI Features

- [ ] **AI Resume Analyzer**: Parse resumes, extract skills, predict career fit
- [ ] **Mock Interviews**: AI-powered interview simulation with feedback
- [ ] **Career Prediction**: ML model predicting likely career trajectories
- [ ] **Skill Gap Analysis**: Identify missing skills for target roles
- [ ] **Smart Job Recommendations**: Personalized job matching

### Phase 3: Communication & Engagement

- [ ] **Video Calling**: Zoom/Twilio integration for face-to-face sessions
- [ ] **Notification Engine**: Push notifications for mobile apps
- [ ] **Email Digests**: Weekly engagement summaries
- [ ] **AI Chatbot**: 24/7 career guidance and Q&A
- [ ] **Referral Program**: Gamified referral marketplace

### Phase 4: Mobile & Platform Expansion

- [ ] **Mobile App**: iOS/Android native apps
- [ ] **Mobile Responsiveness**: Fully optimized mobile web
- [ ] **Offline Mode**: Local data caching
- [ ] **Push Notifications**: Mobile app notifications

### Phase 5: Enterprise Features

- [ ] **SSO Integration**: SAML/OAuth for institutions
- [ ] **Advanced Analytics**: Custom reports and dashboards
- [ ] **Bulk User Import**: CSV batch uploads
- [ ] **API Rate Limits**: Tiered API access
- [ ] **Audit Logs**: Compliance and security tracking

### Phase 6: AI Enhancement

- [ ] **Fine-tuned Models**: Domain-specific embeddings
- [ ] **Contextual Recommendations**: Multi-modal matching
- [ ] **Sentiment Analysis**: Forum moderation automation
- [ ] **Natural Language Queries**: Voice search support

---

## Contributing

We welcome contributions from developers, designers, and product enthusiasts!

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request with a clear description

### Development Guidelines

- Follow existing code style and patterns
- Write meaningful commit messages
- Test changes locally before submitting
- Document new features in code comments
- Update README if adding new features

### Reporting Issues

- Check existing issues before creating duplicates
- Include reproduction steps and error logs
- Provide environment details (Node version, OS, etc.)
- Be descriptive but concise

---

## Testing

### Current Testing Strategy

The project uses manual testing during development. Automated testing framework is planned.

### Recommended Testing Approach (Future)

```bash
# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# End-to-End Tests
npm run test:e2e

# Coverage Reports
npm run test:coverage
```

### Testing Stack (Future)

- **Framework**: Jest
- **E2E**: Playwright / Cypress
- **Coverage**: NYC
- **Mocking**: Sinon / Jest Mocks

### Manual Testing Checklist

- [ ] User registration flow
- [ ] JWT token generation and validation
- [ ] Mentor matching algorithm
- [ ] Vector search accuracy
- [ ] Real-time messaging
- [ ] File uploads
- [ ] Email notifications
- [ ] Forum functionality
- [ ] Admin operations

---

## Deployment

### Frontend Deployment (Vercel)

The frontend is automatically deployed to Vercel on every push to the main branch.

```bash
# Manual deployment
vercel deploy --prod
```

**Environment Variables** (Set in Vercel Dashboard):
```
NEXT_PUBLIC_API_URL=https://api.stualum.com
```

### Backend Deployment Options

#### Option 1: Heroku (Recommended for Prototyping)

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create stualum-api

# Set environment variables
heroku config:set MONGO_URI=your_connection_string
heroku config:set JWT_SECRET=your_secret
heroku config:set GEMINI_API_KEY=your_key

# Deploy
git push heroku main
```

#### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

#### Option 3: AWS EC2

```bash
# Launch EC2 instance (Ubuntu 22.04)
# Connect via SSH
ssh -i key.pem ubuntu@instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo and install dependencies
git clone https://github.com/BaljeetkumarPatel/StuAlum.git
cd StuAlum/BACKEND
npm install

# Start with PM2 (process manager)
npm install -g pm2
pm2 start app.js --name "stualum"
pm2 save
pm2 startup
```

#### Option 4: Docker & Kubernetes

```dockerfile
# BACKEND/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "app.js"]
```

```bash
# Build and run
docker build -t stualum-api .
docker run -p 5000:5000 \
  -e MONGO_URI=your_uri \
  -e JWT_SECRET=your_secret \
  stualum-api
```

### Database Deployment

- **MongoDB Atlas** (Cloud): Already in use
- **Configuration**: Connection string in `.env`
- **Backups**: MongoDB Atlas automatic backups
- **Monitoring**: MongoDB Atlas monitoring dashboard

### Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Database backups scheduled
- [ ] Error logging setup
- [ ] Rate limiting enabled
- [ ] File upload limits set
- [ ] Email service tested
- [ ] AI API keys validated
- [ ] SSL certificates installed

---

## Author

**Baljieet Kumar Patel**

Building the future of student-alumni connections.

- **GitHub**: [@BaljeetkumarPatel](https://github.com/BaljeetkumarPatel)
- **LinkedIn**: [Baljieet Kumar Patel](#)
- **Portfolio**: [baljeetkumarpatel.com](#)
- **Email**: [contact@baljeetkumarpatel.com](#)
- **LeetCode**: [@BaljeetkumarPatel](#)

---

## Acknowledgements

We're grateful to the open-source community and the following projects:

- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: Flexible document database
- **Google Generative AI**: State-of-the-art embeddings and LLMs
- **Socket.IO**: Real-time communication library
- **Mongoose**: Elegant MongoDB object modeling
- **Next.js**: React framework for production
- **Vercel**: Seamless frontend deployment
- **Multer**: File upload middleware
- **JWT**: Secure token-based authentication
- **SendGrid**: Reliable email delivery
- **bcryptjs**: Password hashing security

Special thanks to all contributors, mentors, and the open-source community for inspiration and support.

---

## License

This project is licensed under the **ISC License** - see the LICENSE file for details.

The ISC License is permissive and allows free use, modification, and distribution for both commercial and private purposes.

---

## Footer

**Built with the vision of strengthening lifelong connections between students and alumni through modern software engineering and artificial intelligence.**

StuAlum is an engineering-first platform designed for scale, reliability, and impact. Whether you're a student seeking mentorship or an alumnus giving back, StuAlum creates meaningful, data-driven connections powered by cutting-edge AI.

[Live Demo](https://stu-alum.vercel.app) • [GitHub](https://github.com/BaljeetkumarPatel/StuAlum) • [Report Issue](https://github.com/BaljeetkumarPatel/StuAlum/issues) • [Discussions](https://github.com/BaljeetkumarPatel/StuAlum/discussions)

---

**Last Updated**: April 24, 2026 | **Status**: Active Development | **Maintainer**: [@BaljeetkumarPatel](https://github.com/BaljeetkumarPatel)
