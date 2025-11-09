# Design Guidelines: Perplexity-Style Dual-Mode AI Chat Application

## Design Approach
**Reference-Based:** Primary inspiration from Perplexity.ai's minimal aesthetic, with supporting patterns from Linear (clean productivity UI) and ChatGPT (conversational interface). Focus on information clarity, generous whitespace, and seamless mode transitions.

**Core Principles:**
- Minimal distraction, maximum focus on conversation
- Clean, spacious layouts with breathing room
- Instant mode switching without visual jarring
- Professional yet approachable atmosphere

---

## Typography System

**Font Families:**
- Primary: Inter (UI elements, body text, chat messages)
- Monospace: JetBrains Mono (code blocks, technical content)

**Hierarchy:**
- Navbar/Headers: text-sm font-medium (consistent across app)
- Chat Messages: text-base leading-relaxed (optimal readability)
- User Input: text-base
- Sidebar Items: text-sm
- Code Blocks: text-sm font-mono
- Mode Labels: text-xs uppercase tracking-wide font-semibold

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 consistently (p-4, gap-6, space-y-8, etc.)

**Core Structure:**
```
├── Fixed Navbar (h-16, px-6)
├── Main Container (flex, full viewport minus navbar)
    ├── Collapsible Sidebar (w-64, p-4, border-r)
    └── Chat Area (flex-1, flex flex-col)
        ├── Messages Container (flex-1, overflow-auto, px-8, py-6)
        └── Input Box (sticky bottom, px-8, pb-6)
```

**Responsive Breakpoints:**
- Mobile: Sidebar overlays as drawer, full-width chat
- Desktop: Side-by-side layout with visible sidebar

---

## Component Library

### Navbar
- Full-width, border-b, backdrop-blur effect
- Left: Mode toggle pills (Chat 💬 / Code 💻) with rounded-full design
- Center: Empty (keeps focus on sides)
- Right: New Chat button + Theme toggle icon button
- Height: h-16, padding: px-6

### Mode Toggle
- Pill-style segmented control
- Active state: rounded-full with subtle shadow
- Inactive: transparent with hover state
- Icons + labels inline, gap-2

### Sidebar
- Fixed width: w-64
- Padding: p-4
- Header: "History" label (text-xs uppercase mb-4)
- Chat items: Rounded-lg cards with hover states
  - Icon (💬 or 💻) + truncated title
  - padding: p-3, gap-3, mb-2
  - timestamp: text-xs opacity-60

### Chat Messages Container
- Max-width: max-w-4xl mx-auto (centered, contained)
- Message bubbles:
  - User: ml-auto, max-w-3xl, rounded-2xl, p-4
  - AI: mr-auto, max-w-3xl, rounded-2xl, p-4
  - Gap between messages: space-y-6
  - Markdown support with proper spacing
  - Code blocks: rounded-lg, p-4, font-mono, with syntax highlighting

### Input Box
- Container: max-w-4xl mx-auto w-full
- Input field: rounded-2xl, p-4, border, min-h-[56px]
- Dynamic placeholder changes with mode
- Send button: absolute right-4 top-1/2 transform -translate-y-1/2
- Shadow: subtle shadow-lg for depth

### Buttons
- New Chat: rounded-lg, px-4, py-2, font-medium
- Icon buttons: rounded-lg, p-2, hover states
- Primary actions: rounded-xl, px-6, py-3

---

## Interaction Patterns

**Mode Switching:**
- Instant visual feedback on toggle click
- No page reload, smooth transition
- Input placeholder updates immediately
- Model badge or indicator subtly shown

**New Chat:**
- Clears message area with fade transition
- Resets to initial greeting state
- History preserved in sidebar

**Chat History:**
- Click item to load conversation
- Active item highlighted in sidebar
- Smooth scroll to top of messages

**Animations:**
- Minimize to essential UI feedback only
- Message appear: simple fade-in (200ms)
- Sidebar toggle: slide transition (300ms)
- Hover states: opacity/background transitions (150ms)

---

## Layout Specifications

**Message Density:**
- Generous vertical spacing between messages (space-y-6)
- Line height: leading-relaxed for readability
- Code blocks: additional margin-y-4 for separation

**Container Constraints:**
- Chat messages: max-w-4xl for optimal reading
- Full-width sidebar and navbar for structure
- Input area: matches message container width

**Vertical Rhythm:**
- Navbar: 64px fixed
- Sidebar items: 12px margin-bottom
- Message spacing: 24px between messages
- Input box: 24px bottom padding

---

## Special Considerations

**Markdown Rendering:**
- Headers: Font size progression (h1: text-2xl, h2: text-xl, h3: text-lg)
- Lists: proper indentation (pl-6), marker spacing
- Links: underline on hover, consistent treatment
- Inline code: rounded, px-1.5, py-0.5, font-mono

**Code Syntax Highlighting:**
- Use Prism.js or similar library
- Language badge in top-right of code block
- Copy button on hover (top-right)
- Line numbers optional, avoid if not needed

**Responsive Behavior:**
- Mobile: Hide sidebar by default, hamburger menu
- Tablet: Optional sidebar toggle
- Desktop: Always-visible sidebar
- Input: Full width on mobile, contained on desktop

---

## Accessibility
- Focus states for all interactive elements (ring-2 on focus)
- Keyboard navigation: Tab through mode toggle → new chat → theme toggle
- ARIA labels for icon-only buttons
- Sufficient contrast ratios maintained
- Skip-to-content link for keyboard users

---

**Final Note:** This design prioritizes clarity and speed. Every element serves the core function of facilitating AI conversation. Avoid decorative flourishes that distract from the primary task.