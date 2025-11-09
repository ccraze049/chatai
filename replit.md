# AI Chat Application

## Overview

This is a dual-mode AI chat application inspired by Perplexity.ai's minimal aesthetic. The application allows users to engage with an AI assistant in two distinct modes: **Chat Mode** for natural conversations and **Code Mode** for programming-related tasks. Users can maintain multiple conversation sessions, switch between modes seamlessly, and enjoy a clean, distraction-free interface with both light and dark themes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

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
- Navbar: Fixed header with mode toggle and new chat button
- Sidebar: Collapsible session history with toggle functionality
- ChatMessage: Markdown rendering with syntax highlighting (react-markdown, remark-gfm, react-syntax-highlighter)
- ChatInput: Auto-expanding textarea with keyboard shortcuts
- WelcomeScreen: Initial landing state with mode-specific examples
- ModeToggle: Chat/Code mode switcher with visual feedback
- ThemeToggle: Light/dark theme switcher with localStorage persistence

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
- `GET /api/sessions` - Retrieves all chat sessions
- `POST /api/sessions` - Creates new chat sessions
- `GET /api/sessions/:id/messages` - Fetches messages for a specific session
- `POST /api/sessions/:id/messages` - Adds new messages to sessions

**Development Environment:**
- Vite dev server integration for HMR (Hot Module Replacement)
- Custom middleware mode for API/static file serving
- Replit-specific plugins for development experience

### Data Storage

**Current Implementation:**
- In-memory storage using Map data structures
- Interface-based storage abstraction (`IStorage`) for future extensibility
- Session and message data stored separately with relationships via sessionId

**Schema Design (Drizzle ORM ready):**
- `chat_sessions` table: id (UUID), title, mode (chat/code), createdAt
- `messages` table: id (UUID), sessionId (foreign key), role (user/assistant), content, createdAt
- PostgreSQL dialect configuration for future database migration
- Zod schema validation for data integrity

**Data Models:**
- ChatSession: Represents a conversation with metadata
- Message: Individual user or assistant messages with timestamps
- Insert schemas for validation before persistence

### External Dependencies

**AI Integration:**
- Groq API for LLM inference
- Model selection: `llama-3.3-70b-versatile` for both chat and code modes
- Streaming responses with configurable temperature (0.7) and max tokens (2048)
- API key authentication via environment variables

**Database (Future):**
- Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- Connection pooling via DATABASE_URL environment variable
- Drizzle ORM for type-safe database operations
- Migration system configured via drizzle-kit

**Development Services:**
- Replit-specific integrations:
  - Vite plugin for runtime error overlay
  - Cartographer plugin for code navigation
  - Dev banner for development environment indicators

**UI Libraries:**
- Comprehensive Radix UI component suite (accordion, dialog, dropdown, popover, etc.)
- React Hook Form with Zod resolvers for form validation
- Lucide React for iconography
- date-fns for date formatting

**Build & Tooling:**
- esbuild for production server bundling
- PostCSS with Tailwind CSS and Autoprefixer
- TypeScript compiler for type checking
- Path aliases (@/, @shared/, @assets/) for clean imports