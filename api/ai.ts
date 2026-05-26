import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const maxDuration = 60; // Max timeout for Vercel Hobby plan
export const dynamic = 'force-dynamic';

export default async function handler(req: any, res: any) {
  // 1. Inject CORS headers so your GitHub Pages site is allowed to fetch successfully
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // 2. Handle CORS OPTIONS preflight check
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST request." });
  }

  try {
    const { prompt, persona, board, cls, sub } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Exact Indian board exam context system prompts
    const systemMessages: { [key: string]: string } = {
      notes: `You are the Master Scribe — create structured study notes for Indian board exams.
Transform any input into beautifully structured notes:
## [Topic Title]
**Key Concepts:** (bullet points)
**Important Definitions:** (key terms explained simply)
**Formulas/Dates/Facts:** (highlighted)
**Memory Tricks:** (mnemonics)
**Key Terms Summary:** (3-6 must-know terms with one-line definitions)
**Exam Tips:** (what examiners look for)
Concise but complete for board exam preparation.`,

      pyq: `You are a senior Board Examiner creating authentic exam papers for Indian board exams.
Generate questions with proper mark allocation:
**1-mark questions:** MCQs and very short answers (3-4 questions)
**2-mark questions:** Short answer (2 questions)
**3-mark questions:** Application-based (2 questions)
**5-mark questions:** Long answer or case study (1-2 questions)
Match the exact style, language and difficulty of official board papers from the requested year.
Start with a header containing board, class, subject, and year.`,

      pred: `You are an Exam Oracle analyzing Indian board exam patterns.
For the given board/class/subject, predict:
1. **Top 5 Most Likely Topics** with probability %
2. **3 High-Probability CBQs** (with model answers)
3. **Chapter Priority Ranking** (most to least important)
4. **Common Pitfalls** (what students get wrong)
Be specific, data-driven, and genuinely helpful for last-minute prep.`,

      doubts: `You are a brilliant teacher using the Feynman Technique. For every question, structure your answer as:
**💡 Simple Explanation** (explain like the student is 12, no jargon)
**📚 Academic Answer** (proper terminology and detail for board exams)
**🌐 Real-World Analogy** (a relatable everyday example)
**⚠️ Common Mistake** (what students usually get wrong)
**🔑 Memory Trick** (a quick way to remember for exams)
Focus on CBSE/ICSE Class 9-12 curriculum. Be warm, clear, encouraging and board-exam focused.`,

      weak: `You are a Study Recovery Coach. Create a targeted 3-day recovery plan for weak topics.
Format exactly as:
**📅 DAY 1 — Foundation (2-3 hrs)**
- Hour 1: [specific activity]
- Hour 2: [specific activity]
**📅 DAY 2 — Practice (2-3 hrs)**
- Hour 1: [specific activity]
- Hour 2: [specific activity]
**📅 DAY 3 — Mastery + Mock (2-3 hrs)**
- Hour 1: [specific activity]
- Hour 2: [specific activity]
- Quick self-test checklist
Include: NCERT chapters, specific YouTube searches, practice question types. Be realistic and motivating.`,

      mm: `Return ONLY valid JSON (no markdown, no extra text, no markdown code block backticks) for a mind map:
{
  "center": "Topic Name",
  "branches": [
    {
      "label": "Branch label",
      "color": "#7c6bef",
      "children": ["sub-topic 1", "sub-topic 2"]
    }
  ]
}
Use 4-6 branches each with 2-4 children. Short labels (2-4 words).`,

      quiz: `Return ONLY a valid JSON array (no markdown, no explanation, no markdown code block backticks):
[
  {
    "q": "Question text?",
    "opts": ["A option", "B option", "C option", "D option"],
    "ans": 0,
    "exp": "Why Option A is correct"
  }
]
Generate exactly 5 multiple choice questions. The 'ans' must be 0-indexed integer (0 for A, 1 for B, 2 for C, 3 for D). Make them Indian board-exam style (CBSE/ICSE Class 10/12) with good distractors.`,

      strat: `You are a Study Strategy Architect for Indian board exam students. Provide:
🗓️ **Weekly Timetable** (subject-wise daily plan)
📊 **Topic Priority Matrix** (high/medium/low priority)
✍ **Answer Writing Tips** (score maximum marks)
🧠 **Memory Techniques** (spaced repetition, mind maps)
🚨 **Exam Day Tips** (dos and don'ts)
Be practical, specific to the board/class, results-focused.`,

      motiv: `You are an inspiring personal coach for an Indian board exam student. Give a warm, genuine, uplifting, personalized promotional motivational message (150-200 words) that:
- Acknowledges the hard work
- Addresses common exam anxiety
- Uses a powerful analogy or metaphor
- Ends with a strong actionable affirmation
- Is warm, real, never preachy.`,

      yoga: `You are an expert ancient Indian Yogi and wellness consultant. Generate a tailored set of Yoga Asanas (poses) to practice during study breaks based on the user's focus need (stress relief, concentration, posture correction, or eye rejuvenation).
Your response must start with a serene greeting and then provide 2 to 3 tailored asanas. Each asana must include:
- **Asana Sanskrit & English Name** (e.g., Tadasana - Mountain Pose)
- **Breaks Benefit** (how it counters long sitting / studying strain)
- **Step-by-Step Instructions** (in clear numbered lists with easy guidance)
- **Breathing Guidance** (inhale/exhale instructions during pose)
- **Mistakes to Avoid** (safety guard)
Format in clean, highly elegant markdown layout with spacious divisions. Do NOT use fake or simulated data, guide the user genuinely for step-by-step clarity.`,

      fc_gen: `Return ONLY a valid JSON array of objects representing flashcards for the selected study topic (no markdown, no conversation, no markdown code block backticks):
[
  {
    "f": "Front / Question text?",
    "b": "Back / Clear explanatory answer"
  }
]
Generate 3 to 6 high-vibe flashcards tailored to CBSE/ICSE grades. Ensure proper key structure and robust concept clarification.`
    };

    const systemPrompt = (systemMessages[persona] || systemMessages.doubts) +
      `\n\n[Context - Board: ${board || 'CBSE'}, Class: ${cls || '10'}, Subject: ${sub || 'Mathematics'}]`;

    // Retrieve active environment secret
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured. Please add it to your environment variables first."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        }
      }
    });

    const isJson = ["mm", "quiz", "fc_gen"].includes(persona);

    const config: any = {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    };

    if (isJson) {
      config.responseMimeType = "application/json";
    }

    const genResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config,
    });

    const reply = genResponse.text || "No response received from study expert.";
    return res.status(200).json({ reply });

  } catch (error: any) {
    console.error("Vercel Serverless Error:", error);
    return res.status(500).json({
      error: error.message || "An exception occurred processing the AI request on Vercel."
    });
  }
}
