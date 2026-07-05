# Kiyanna Frontend — Agentic E-Commerce & Virtual Try-On Experience 🛒✨

The modern, responsive web application for **Kiyanna**, an AI-powered shopping assistant built for [Kapruka](https://www.kapruka.com). Built with **Next.js 15**, **React 19**, and **Tailwind CSS**, it features real-time Server-Sent Events (SSE) streaming, Generative UI components, seamless chat session persistence, and a dedicated **Virtual Try-On** studio.

---

## 🌟 Key Features

- **💬 Real-Time Generative UI & SSE Streaming**:
  - Streams agent responses word-by-word with ultra-low latency.
  - **Dynamic Product Carousels**: Renders interactive product cards directly inside the chat feed with prices, images, Add-to-Cart buttons, and "Try On" triggers.
  - **Live Thinking Processes**: Displays collapsible accordions showing the AI's internal reasoning, search steps, and reflection checks in real time.
  - **Interactive Order Tracking & Payment Cards**: Embeds live tracking timelines and instant Kapruka payment links within the conversation.
- **👗 Dedicated Virtual Try-On Studio (`/tryon`)**:
  - A specialized three-panel workspace allowing users to upload full-body photos and virtually test clothing items discovered during chat.
  - Features an interactive **Product Strip** at the bottom that automatically hydrates with garments recommended in your conversation history.
- **💾 Seamless Session & UI Persistence**:
  - Backed by global React Contexts (`ChatContext`, `CartContext`, `SidebarContext`) and server-side storage.
  - Refreshing the browser or navigating between `/c/[id]`, `/tryon`, and `/checkout/success` retains all chat messages, product carousels, thinking accordions, and shopping cart states without glitching or resetting.
- **🎨 Premium Gemini-Style Aesthetics**:
  - Sleek dark mode design with glassmorphism, subtle micro-animations, background ambient leak glows, and modern typography.
  - Fully responsive layout featuring a collapsible desktop sidebar and smooth slide-over mobile drawer.
- **🛍️ Integrated Checkout & Tracking Flows**:
  - Full support for adding items to cart, specifying gift greetings and delivery dates, initiating Kapruka checkout, and tracking completed orders.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) & Vanilla CSS (`index.css`)
- **Icons**: [Google Material Symbols Outlined](https://fonts.google.com/icons)
- **Language**: TypeScript
- **Package Manager**: `pnpm`

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Node.js 18+ and `pnpm` installed:

```bash
npm install -g pnpm
```

### 2. Installation

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the `frontend/` directory pointing to your running backend API:

```env
# URL of the Kiyanna Backend API
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

### 4. Running the Development Server

Start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the assistant.

---

## 🗺️ Application Architecture & Routes

- `app/page.tsx` — **Home / New Chat Screen**: Welcome screen with quick prompt starters and image upload capabilities.
- `app/c/[id]/page.tsx` — **Active Chat Interface**: The primary conversational interface with sidebar navigation, streaming chat feed, and cart fab.
- `app/tryon/page.tsx` — **Virtual Try-On Studio**: Dedicated workspace for testing apparel on uploaded user photos.
- `app/checkout/success/page.tsx` — **Order Confirmation**: Celebratory order completion page with payment links and order tracking triggers.

---

## 🧩 Key Components

```text
src/components/
├── ChatInterface.tsx        # Main orchestrator handling SSE fetching, aborts, and session hydration
├── chat/
│   ├── ChatFeed.tsx         # Renders message bubbles, thinking accordions, and UI payloads
│   ├── ChatInput.tsx        # Auto-expanding multiline input with image attachment support
│   └── ThinkingProcess.tsx  # Live reasoning accordion component
├── generative/
│   ├── ProductCard.tsx      # Individual product display card with Add-to-Cart and Try-On actions
│   ├── ProductCarousel.tsx  # Horizontal scrolling product carousel embedded in chat
│   ├── OrderTimeline.tsx    # Live order progress tracking visualization
│   └── PayLinkCard.tsx      # Embedded Kapruka checkout payment button
├── layout/
│   ├── LeftSidebar.tsx      # Collapsible Gemini-style navigation sidebar
│   └── CartFab.tsx          # Floating shopping cart button and drawer
└── new-chat/
    └── NewChatScreen.tsx    # Landing screen with conversational prompt starters
```
