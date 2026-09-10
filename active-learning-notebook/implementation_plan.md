# Lumen AI: V2 Master Architecture Plan

## Core Philosophy
Lumen is not a standard dashboard with an "AI Button." It is an **Empathetic Mentor**—a proactive, chat-first study partner that deeply understands the user, holds them accountable, and utilizes Generative UI for an immersive active-learning experience.

## Financial Constraint & Tech Stack
To keep subscription costs aggressively low (under ₦2000 / ~$1.30 per user/month), we rely on a heavily optimized "True $0" backend architecture:
- **Google AI Studio (Gemini 1.5 Flash)**: High speed, 1M context window, ultra-cheap per token, native multi-modality (reading images/PPTX).
- **Groq (Llama 3)**: For lightning-fast, simple tool executions and grading.
- **Supabase (`pgvector`)**: Free tier vector database for RAG (Retrieval-Augmented Generation).
- **Cloudflare AI Gateway**: For rate-limiting and custom-keyed response caching.

---

## Architectural Pillars

### 1. The Conversational Dashboard ("Omni-Prompt")
- **Chat-First UI**: Replaces the static dashboard. The AI proactively greets the user based on their Master Timetable (e.g., *"Good morning Ibrahim! You have 3 days until your Biology Midterm... let's do a quick quiz."*).
- **Generative UI + Database Integrity**: The AI uses Tool Calling to render beautiful React components inline (Quizzes, Flashcards). Crucially, **it silently saves these components to Supabase**. A quiz generated in the chat is permanently accessible in the `/review` tab.
- **The Empathetic Mentor Persona**: A strict but caring friend. It learns the user's hobbies (e.g., soccer) to generate analogies. If the user slacks off, it gently guides them back using relatable, personalized encouragement.

### 2. Cost Control & Token Compression
- **Cloudflare Caching with Persona Keys**: Caching is heavily utilized, but the Cache Key includes a hash of the user's persona (e.g., "5th Grader"). This guarantees personalized responses while saving 100% of the cost if two similar users ask the same question.
- **RAG over Raw Context**: Instead of dumping entire textbooks into the prompt every time, we use `pgvector` to fetch only the 2-3 most relevant paragraphs per message.
- **Strict Guardrails**: The system prompt ensures the AI refuses to act as a general chatbot (e.g., writing code or arguing politics), saving tokens strictly for education.

### 3. Textbook Deduplication & Upload Limits
- Before a textbook is uploaded, the browser computes a **SHA-256 Hash**.
- If that textbook already exists in the vector database, we skip the expensive AI processing and simply link the new user to the existing embeddings.
- Native multimodality handles PDFs, EPUBs, images, and PPTX files seamlessly.

### 4. Voice-Enabled Active Recall (Feynman Technique)
- A microphone toggle allowing the user to explain concepts out loud to the AI.
- Native HTML5 Web Speech API converts speech to text for free.
- Gemini evaluates the transcription, identifying gaps in understanding and grading their active recall.

---

## Implementation Phasing (Start Simple, Scale Later)
*All work is isolated on the `v2-ai-integration` branch.*

### Phase 1: Wire Existing Groundwork (Currently In Progress)
- Hook up the existing `Create Note` page to Gemini Flash for native Markdown streaming.
- Implement `generateObject` for Smart Flashcard Extraction from those notes.
- Integrate Cloudflare AI Gateway for the initial routing and rate limiting.

### Phase 2: RAG & Textbook Uploads
- Supabase `pgvector` setup.
- Build the SHA-256 browser hashing and file upload pipeline.
- Implement the "Chat with your Textbook" sidebar.

### Phase 3: The Omni-Prompt Dashboard
- Deprecate the old static dashboard.
- Build the central Chat interface.
- Implement Tool Calling for Generative UI (rendering Quizzes and Flashcards directly in the chat stream and saving them to the database).

### Phase 4: Voice & Advanced Persona
- Fine-tune the Empathetic Mentor system prompt.
- Integrate Web Speech API for the Feynman Technique voice grading.
