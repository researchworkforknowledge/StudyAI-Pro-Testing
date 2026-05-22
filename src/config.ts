// StudyAI Pro configuration for static sites (like GitHub Pages)
export const STATIC_CONFIG = {
  // Option 1: Direct Gemini API key (Exposed to visitors - not recommended for public sites)
  GEMINI_API_KEY: "YOUR_COPIED_GEMINI_API_KEY_HERE",

  // Option 2 (Highly Recommended for Production & Vercel):
  // Put your Vercel deployment URL here (e.g., "https://my-study-ai.vercel.app")
  // Your private Gemini API key will sit safely on Vercel, and your GitHub Pages site
  // will securely route all AI requests through your Vercel deployment!
  VERCEL_API_URL: ""
};
