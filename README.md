# Kitchen 🍳

**Kitchen** is an intelligent culinary companion powered by AI that transforms how you discover, organize, and cook recipes. Whether you're snapping a photo of a delicious dish or pasting a link from a cooking video, Kitchen helps you turn inspiration into a meal on your table.

## 🚀 Key Features

*   **📸 AI Video & Image Analysis**: Snap a photo of any dish or raw ingredients. Our integration with **Google Gemini AI** identifies the food and generates a complete recipe with ingredients and step-by-step instructions.
*   **🔗 Smart Link Extraction**: Paste a URL from a cooking blog or video. Kitchen extracts the structured recipe details instantly.
*   **🧊 Digital Fridge & Smart Inventory**: Keep track of what you have at home. The app automatically compares recipe requirements with your specific fridge inventory, highlighting exactly what you need to buy and what you already own.
*   **🔥 Trending & Discover**: Explore trending recipes and categories powered by TheMealDB.
*   **📱 Cross-Platform**: Built with **Expo** and **React Native** for a seamless experience on iOS and Android.

## 🛠️ Tech Stack

*   **Framework**: [Expo](https://expo.dev/) (React Native)
*   **AI Engine**: [Google Gemini](https://deepmind.google/technologies/gemini/) (gemini-3-flash-preview)
*   **Backend/Auth**: [Supabase](https://supabase.com/)
*   **Data Fetching**: TanStack Query
*   **Routing**: Expo Router
*   **Styling**: React Native StyleSheet with custom theme constants

## 🏁 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/kitchen.git
    cd kitchen
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your API keys:
    ```env
    EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the app**
    ```bash
    npx expo start
    ```

## 📱 Project Structure

*   `app/`: Main application screens and routing (Expo Router).
*   `components/`: Reusable UI components.
*   `lib/`: Helper functions, including `gemini.ts` for AI logic.
*   `constants/`: Theme colors, fonts, and global configurations.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
