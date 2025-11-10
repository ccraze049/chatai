# AI Chat Application

## Overview

This is a dual-mode AI chat application inspired by Perplexity.ai's minimal aesthetic. The application allows users to engage with an AI assistant in two distinct modes: **Chat Mode** for natural conversations and **Code Mode** for programming-related tasks. Users can maintain multiple conversation sessions, switch between modes seamlessly, and enjoy a clean, distraction-free interface with both light and dark themes.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 10, 2025:**
- **Mobile Responsiveness Optimization:**
  - Implemented comprehensive mobile UX improvements for 320-768px screens
  - Added custom xs breakpoint (480px) for very small devices (320-360px)
  - Optimized ModeToggle: Icon-only display on mobile with responsive sizing
  - Enhanced WelcomeScreen: Responsive typography, spacing, and icons
  - Improved Navbar: Responsive padding/gaps, mobile-friendly controls
  - Enhanced Sidebar: Mobile overlay with backdrop, API Keys/Docs links for mobile users
  - Replaced all emojis with lucide-react icons per design guidelines
  - Removed hover effects from non-interactive elements for better touch experience
- **Accessibility Improvements:**
  - Implemented complete focus management for Sidebar modal overlay
  - Added ARIA semantics: role="dialog", aria-modal, aria-labels
  - Keyboard navigation: Tab trapping on mobile, Escape closes sidebar
  - Focus restoration: Returns focus to trigger button when closing
- **API Key Management:**
  - Implemented complete API key management system similar to Google's API keys
  - Added secure API key generation with bcrypt hashing (keys shown only once at creation)
  - Created API keys management page for creating, viewing, and deleting keys
  - Built comprehensive API documentation page with usage examples
  - Added dual authentication support: session-based (UI) and API key-based (programmatic)
  - Updated all storage implementations to support API key CRUD operations
  - API keys use format "sk-{random-hex}" and are hashed before storage with keyPrefix for display

**November 9, 2025:**
- Implemented complete authentication system with MongoDB Atlas and Gmail OTP
- Added user signup, login, email verification (OTP), and logout functionality
- Integrated MongoDB Atlas for persistent data storage
- Set up Nodemailer with Gmail SMTP for sending OTP verification emails
- Added session management using express-session
- Updated chat sessions to be user-specific (linked by userId)
- Created login/signup UI with dialog interface in header
- Added MongoDB storage layer alongside existing in-memory and PostgreSQL options

## System Architecture

### Authentication System

**User Registration Flow:**
1. User provides email and password
2. System creates user account with hashed password (bcrypt)
3. OTP (6-digit code) is generated and sent via Gmail
4. OTP expires after 10 minutes
5. User verifies email with OTP
6. Account is activated and session is created

**Login Flow:**
1. User provides email and password
2. System validates credentials
3. Checks if email is verified
4. Creates session with user information

**Security Features:**
- Passwords hashed using bcrypt (10 salt rounds)
- API keys hashed using bcrypt before storage (10 salt rounds)
- OTP codes hashed before storage
- Session-based authentication with secure cookies
- Email verification required before login
- OTP expiration (10 minutes)
- API keys shown only once at creation (never exposed again)
- MongoDB indexes for performance and TTL for automatic cleanup

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Framework:**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui component library (New York style variant)
- Tailwind CSS for utility-first styling with custom design tokens
- Custom CSS variables for theme management (light/dark mode)

**Design System:**
- Typography: Inter for UI/body text, JetBrains Mono for code blocks
- Consistent spacing using Tailwind units (2, 4, 6, 8)
- Perplexity-inspired minimal aesthetic with clean layouts
- Custom color system using HSL values for theme flexibility

**Key Components:**
- Navbar: Fixed header with mode toggle, new chat button, and authentication (login/logout, user email display, API keys link)
- AuthDialog: Modal dialog for login/signup with OTP verification flow
- Sidebar: Collapsible session history with toggle functionality
- ChatMessage: Markdown rendering with syntax highlighting (react-markdown, remark-gfm, react-syntax-highlighter)
- ChatInput: Auto-expanding textarea with keyboard shortcuts
- WelcomeScreen: Initial landing state with mode-specific examples
- ModeToggle: Chat/Code mode switcher with visual feedback
- ThemeToggle: Light/dark theme switcher with localStorage persistence
- ApiKeys: Page for managing API keys with create/delete functionality
- Documentation: Comprehensive API documentation with code examples

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js
- TypeScript for type safety across the stack
- ESM module system (type: "module")

**Request Processing:**
- JSON body parsing with raw body preservation
- Request/response logging middleware for API endpoints
- CORS handling through Vite middleware in development

**API Endpoints:**
- `POST /api/chat/completions` - Streams AI responses via Groq API
- `GET /api/sessions` - Retrieves chat sessions (filtered by user if authenticated)
- `POST /api/sessions` - Creates new chat sessions (linked to user if authenticated)
- `GET /api/sessions/:id/messages` - Fetches messages for a specific session
- `POST /api/messages` - Adds new messages to sessions

**Authentication Endpoints:**
- `POST /api/auth/signup` - Create account and send OTP email
- `POST /api/auth/verify-otp` - Verify email with OTP code
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - End user session
- `GET /api/auth/me` - Get current user information

**API Key Endpoints:**
- `GET /api/keys` - List all API keys for current user (requires session auth)
- `POST /api/keys` - Create new API key (requires session auth, returns full key once)
- `DELETE /api/keys/:id` - Delete an API key (requires session auth)
- All chat endpoints support both session-based and API key-based authentication

**Development Environment:**
- Vite dev server integration for HMR (Hot Module Replacement)
- Custom middleware mode for API/static file serving
- Replit-specific plugins for development experience

### Data Storage

**Current Implementation:**
- **MongoDB Atlas (Primary):** Cloud-hosted MongoDB for production use
- **In-memory storage:** Fallback for development without database
- **PostgreSQL/Neon:** Optional support (not currently used)
- Interface-based storage abstraction (`IStorage`) for flexibility
- Automatic storage selection based on environment variables

**Storage Selection Logic:**
1. If `MONGODB_URI` is set → MongoDBStorage
2. Else if `DATABASE_URL` is set → PostgresStorage  
3. Else → MemStorage (in-memory)

**MongoDB Schema:**
- `users` collection: _id (ObjectId), email, passwordHash, isVerified, createdAt
- `emailVerifications` collection: _id (ObjectId), userId (ObjectId ref), otpHash, expiresAt, isUsed, createdAt
- `chatSessions` collection: _id (ObjectId), userId (ObjectId ref), title, mode, createdAt
- `messages` collection: _id (ObjectId), sessionId (string), role, content, createdAt
- `apiKeys` collection: _id (ObjectId), userId (ObjectId ref), name, keyHash, keyPrefix, lastUsedAt, createdAt

**Indexes:**
- users.email (unique)
- emailVerifications.userId, emailVerifications.expiresAt (TTL)
- chatSessions.userId, chatSessions.createdAt
- messages.sessionId, messages.createdAt
- apiKeys.userId, apiKeys.createdAt, apiKeys.keyHash (unique)

**Data Models:**
- User: User account with email and hashed password
- EmailVerification: OTP verification records with expiration
- ChatSession: Conversation with user relationship
- Message: Individual messages within sessions
- ApiKey: User API keys with hashed key and prefix for secure programmatic access

### External Dependencies

**AI Integration:**
- Groq API for LLM inference
- Model selection: `llama-3.3-70b-versatile` for both chat and code modes
- Streaming responses with configurable temperature (0.7) and max tokens (2048)
- API key authentication via environment variables

**Database:**
- **MongoDB Atlas** (`mongodb` driver) - Primary database for production
  - Cloud-hosted, fully managed MongoDB
  - Connection via MONGODB_URI environment variable
  - Automatic connection pooling
  - TTL indexes for automatic OTP expiration cleanup
- **PostgreSQL (Optional):** Neon Serverless support available
  - Drizzle ORM for type-safe operations
  - Connection via DATABASE_URL
  
**Email Service:**
- **Nodemailer** with Gmail SMTP
  - Sends OTP verification emails
  - Uses Gmail App Password for authentication
  - HTML-formatted emails with branded design
  - Environment variables: GMAIL_USER, GMAIL_APP_PASSWORD

**Development Services:**
- Replit-specific integrations:
  - Vite plugin for runtime error overlay
  - Cartographer plugin for code navigation
  - Dev banner for development environment indicators

**UI Libraries:**
- Comprehensive Radix UI component suite (accordion, dialog, dropdown, popover, toast, etc.)
- React Hook Form with Zod resolvers for form validation
- Lucide React for iconography
- date-fns for date formatting

**Authentication & Security:**
- bcrypt for password hashing (10 salt rounds)
- express-session for session management
- Secure HTTP-only cookies
- CSRF protection via same-site cookies
- Environment-based configuration

**Build & Tooling:**
- esbuild for production server bundling
- PostCSS with Tailwind CSS and Autoprefixer
- TypeScript compiler for type checking
- Path aliases (@/, @shared/, @assets/) for clean imports

## Environment Variables

Required for full functionality:
- `GROQ_API_KEY` - Groq AI API key for chat completions
- `MONGODB_URI` - MongoDB Atlas connection string
- `GMAIL_USER` - Gmail address for sending emails
- `GMAIL_APP_PASSWORD` - Gmail app password (not regular password)
- `SESSION_SECRET` (optional) - Secret for session encryption (defaults to development key)

## API Key Management

The application includes a complete API key management system inspired by Google's API keys:

**Features:**
- Users can create multiple named API keys for programmatic access
- Keys use the format "sk-{64-char-random-hex}" for easy identification
- Full key is shown only once at creation time for security
- Keys are bcrypt-hashed before storage (never stored in plain text)
- Only keyPrefix (first 12 characters) is stored for display purposes
- Users can view all their keys (with prefixes) and delete them
- API keys can be used with `Authorization: Bearer <key>` header
- Dual authentication: session-based for UI, API key for programmatic access
- Last used timestamp tracking for each key

**Security Implementation:**
- Keys are hashed using bcrypt (same as passwords) before storage
- Validation compares incoming key hash against stored hashes
- No copy button available for existing keys (prevents accidental exposure)
- Frontend never receives full keys after creation
- Keys are user-specific and cannot access other users' data

**Performance Considerations:**
- Current implementation scans all keys for validation (MVP acceptable)
- For production scale, implement indexed lookup by keyPrefix or UUID
- Consider caching frequently used keys to reduce bcrypt overhead

## Notes

- Resend email integration was proposed but user declined. Using Gmail with Nodemailer instead.
- The application previously had a DATABASE_URL pointing to Neon, but MongoDB Atlas is now the primary database.
- All chat sessions and messages are now user-specific when authenticated.
- Guest users (not logged in) can still use the chat, but their sessions are not persisted or linked to their account.
- API key feature added November 10, 2025, implementing secure key management similar to major cloud providers.