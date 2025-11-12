**App Plan: SignifyAI Learning Platform**

### 1. Vision & Goal

SignifyAI is an interactive Ghanaian Sign Language (GhSL) learning platform focused on healthcare and conversational sign recognition. It blends AI-powered gesture recognition, adaptive lessons, and gamified progress tracking into an elegant, modern web experience. The app aims to help users learn GhSL through practice, feedback, and playful interaction.

---

### 2. Tech Stack

* **Frontend:** Vite + React 19 + TailwindCSS + ShadCN/UI
* **Styling:** Geist Sans (headings), Inter (body)
* **State Management:** React Query + Zustand (lightweight global store)
* **Backend:** Supabase (Postgres, Auth, Edge Functions)
* **AI Integration:** FastAPI microservice (for model inference & feedback)
* **Video Processing:** WebRTC for live webcam input, integrated with MediaPipe (running in WebAssembly worker or server-side inference)

---

### 3. Design & Feel

**Style:** Clean, minimalist, futuristic.

* Use light shades of gray and deep blue or emerald accents for focus areas.
* Rounded, soft cards (2xl radius) with subtle shadows.
* Minimal borders, generous padding.
* Animated transitions (Framer Motion) for state changes.

**Typography:**

* **Geist Sans** – Headers, menus, and key CTAs (bold, confident aesthetic)
* **Inter** – Paragraphs, notes, tooltips, and body copy for clean readability.

**Feel:** Welcoming, modern, and vibrant. Interactions feel alive through soft micro-interactions – e.g., hovering over a lesson card slightly enlarges it, switching themes animates smoothly.

---

### 4. Core Pages & Flow

#### **1. Home Page**

* Hero section introducing SignifyAI with a tagline like:

  > "Learn Ghanaian Sign Language through AI-powered practice."
* Two prominent CTAs: **Start Learning** (leads to sign-up) and **Try Demo** (guest mode with limited access)
* Preview cards for “Basic Practice”, “Advanced Practice”, and “Freestyle Mode” with short animations.
* Section for testimonials or hackathon pitch content.
* Footer with About, GitHub, Contact, and License info.

#### **2. Auth Pages**

* Clean auth UI using ShadCN components.
* Tabs for **Login / Register**, each with subtle transitions.
* Social sign-in option (Google) via Supabase Auth.
* First-time users redirected to onboarding setup (nickname, theme, learning preferences).

#### **3. Dashboard (Main Learning Hub)**

The dashboard greets users dynamically:

> "Welcome back, Dave! Ready to learn something new today?"

**Layout:**

* Left sidebar navigation with icons + badges:

  * 🎤 **Basic Practice** (badge: lessons completed / total)
  * ⚙️ **Advanced Practice** (badge: lessons completed / total)
  * 🖊️ **Freestyle Mode** (badge: sessions played)
  * 🤖 **Ask Tutor** (AI Q&A chat)
  * Settings and Logout at bottom.

**Main Panel:**

* XP tracker at the top (progress bar + motivational message).
* Cards showing the 4 learning modes:

  * Each card displays completion stats and progress indicators.
  * Hover animation with gradient glow.
* Section: **Recent Activity** (recent lessons, test scores, or chat interactions).

#### **4. Practice Modes**

##### **Basic Practice (Word Mode)**

* Focuses on simple GhSL words.
* Flow: user sees word prompt + example animation.
* User acts it out live; model evaluates similarity.
* Feedback shown visually (heatmap overlay or score).

##### **Advanced Practice (Sentence Mode)**

* Uses sampled dataset sentences.
* Users mimic longer clips; model evaluates gesture sequence.
* Scores show alignment metrics (temporal + spatial accuracy).

##### **Freestyle Mode**

* Open-ended sandbox.
* User performs any sign and gets top-3 sentence predictions.
* Confidence displayed via animated bars.
* Option to replay their sign and compare with dataset video.

##### **Ask Tutor (AI Assistant)**

* Integrated chat powered by FinSight-like LLM.
* Can answer GhSL-related questions, explain signs, or suggest lessons.
* Context-aware: references user’s progress and practice data.

#### **5. Settings & Profile**

* Users customize theme (light/dark), enable assistive learning, and set learning goals.
* View XP level, badges earned, and practice streaks.
* Manage linked accounts (Google, Supabase email/password).

---

### 5. UI Components & Animations

* **Sidebar:** collapsible, highlights active tab.
* **Lesson Card:** uses Framer Motion for hover animation.
* **Badges:** dynamic count using Tailwind badge utilities.
* **XP Bar:** animated gradient fill.
* **Modal Overlays:** for feedback, test results, or lesson notes.
* **Video Recorder Widget:** floating component for webcam capture and preview.

---

### 6. User Journey Summary

1. **Sign up / Log in** → chooses nickname & theme.
2. **Dashboard** → greets user + shows learning progress.
3. **Pick a Practice Mode** → guided by short tooltips.
4. **Perform sign** → webcam captures motion → model inference.
5. **Feedback displayed** → similarity score, side-by-side comparison.
6. **XP gained** → progress updated in real-time.
7. **Optionally, chat with AI Tutor** for clarification or new lessons.

---

### 7. Future Extensions

* Leaderboards (by XP / streak)
* Multi-user freestyle battles (P2P via WebRTC)
* Voice narration for accessibility
* In-app analytics dashboard (powered by Supabase Edge + AdaptIQ Insights-style metrics)

---

### 8. Summary

The SignifyAI app combines sleek design, AI-assisted learning, and gamified engagement. The stack ensures rapid prototyping and scalability, while the layout, typography, and motion design create an inviting yet professional feel. Once this foundation is ready, new modes, analytics, and social layers can be seamlessly integrated to make SignifyAI the go-to digital space for learning Ghanaian Sign Language.
