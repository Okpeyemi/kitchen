# Project Story: Kitchen 🍳

## 💡 What Inspired Me

The inspiration for **Kitchen** came from the philosophy of Eitan Bernath: helping people actually cook what they’ve been meaning to make. I wanted to build a tool that turns inspiration into action—an app that can generate a grocery list from a recipe video or link, organize what you want to cook, and make it simple to go from “I saw this” to “it’s on the table.”

I wanted to build a bridge between the physical ingredients we own and the infinite world of digital recipes. I envisioned a companion that wasn't just a passive recipe book, but an active "Sous-Chef" that could look at what I had—literally, through a camera lens—and tell me how to do it.

## 🧠 What I Learned

Building Kitchen was a deep dive into the intersection of Mobile Development and Generative AI.
*   **AI Integration**: I learned that integrating AI isn't just about sending a prompt; it's about *prompt engineering*. Crafting the right instructions to get Gemini to return valid, structured JSON data that the app can programmatically use was a significant learning curve.
*   **Cross-Platform nuance**: Using Expo and React Native taught me how to balance platform-specific needs (like camera permissions and file systems on iOS vs Android) while maintaining a single codebase.
*   **State Management**: synchronizing local state (what the user selects) with remote server state (Supabase) and AI results required a solid grasp of caching strategies using TanStack Query.

## 🏗️ How I Built My Project

I built Kitchen using a modern, robust stack designed for speed and scalability:
1.  **Framework**: I chose **Expo (React Native)** to ensure I could deploy to both iOS and Android efficiently.
2.  **The Brain (AI)**: I integrated **Google Gemini 3 Flash** as the core intelligence. It handles the heavy lifting of image recognition (identifying food from photos) and natural language processing (parsing text into structured recipe objects).
3.  **The Backend**: **Supabase** acts as the backbone, handling secure User Authentication and storing user preferences and saved recipes in a Postgres database.
4.  **Data Layer**: I used **TanStack Query** to manage async data fetching, ensuring the app feels snappy and responsive even when communicating with external AI APIs.

## 🏔️ The Challenges I Faced

*   **Taming the LLM**: One of the biggest hurdles was getting the AI to consistently output strictly formatted JSON. Early versions would often return conversational text ("Here is your recipe...") which broke the app's parsers. I had to iteratively refine the system prompts to enforce strict output schemas.
*   **Image Handling**: Processing images on mobile devices—handling compression, base64 conversion, and mime-types—before sending them to the Gemini API was tricky to get right across different device types.
*   **Ingredient Matching logic**: Creating a "smart" comparison between a recipe's ingredient list (which might say "2 tbsp olive oil") and a user's fridge (which might just have "Oil") required implementing fuzzy matching logic to avoid false negatives.
