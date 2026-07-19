// AI client wrapper — all LLM calls go through here.
// Server-side only. Never expose the API key to the client.

export const MEDICAL_DISCLAIMER =
  "⚠️ This is educational wellness information, not medical advice. Consult a qualified healthcare professional for diagnosis or treatment.";

// Use models that the team is allowed to access on the LLM gateway.
// z-ai/glm-4.6v supports vision (image input) for food recognition.
const AI_MODEL = process.env.AI_MODEL || "z-ai/glm-5";
const AI_VISION_MODEL = process.env.AI_VISION_MODEL || "z-ai/glm-4.6v";

interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string | unknown[];
}

/** Low-level chat completion against the OpenAI-compatible endpoint. */
async function chatCompletion(
  messages: ChatMsg[],
  options: { temperature?: number; maxTokens?: number; json?: boolean } = {},
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) {
    throw new Error("AI service not configured (OPENAI_API_KEY missing)");
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1500,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI request failed (${res.status}): ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Parse JSON from LLM response, tolerant of code fences and prose around it. */
export function parseJsonLoose<T = unknown>(raw: string): T {
  let s = raw.trim();
  // Strip code fences
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  // Find first { ... last }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) {
    s = s.slice(first, last + 1);
  }
  return JSON.parse(s) as T;
}

// ---------------------------------------------------------------------------
// Food Recognition via vision LLM
// ---------------------------------------------------------------------------

export interface RecognizedFood {
  foods: Array<{
    name: string;
    estimatedPortion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  }>;
  totalCalories: number;
  healthierAlternatives: string[];
  description: string;
}

const SYSTEM_FOOD = `You are a nutrition expert AI. Analyze the provided meal photo and identify all food items.
Estimate portion sizes, calories, and macros (protein, carbs, fat, fiber, sugar in grams, sodium in mg) for each item.
Respond as JSON: {"foods":[{"name":"","estimatedPortion":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"sodium":0}],"totalCalories":0,"healthierAlternatives":["",""],"description":""}.
Use realistic portion estimates. If you cannot identify food confidently, return an empty foods array and explain in description.`;

export async function recognizeFoodFromImage(
  base64Image: string,
  mimeType: string,
): Promise<RecognizedFood> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_VISION_MODEL,
      messages: [
        { role: "system", content: SYSTEM_FOOD },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this meal photo and return the nutrition JSON.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Vision request failed (${res.status}): ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  return parseJsonLoose<RecognizedFood>(raw);
}

// ---------------------------------------------------------------------------
// Wellness Coach (meal plans)
// ---------------------------------------------------------------------------

export interface MealPlanResult {
  meals: Array<{
    meal: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes: string;
}

const SYSTEM_COACH = `You are a nutrition coach AI. Generate personalized meal plans based on the user's profile.
Consider their calorie target, diet type, allergies, cuisine preferences, and goal.
Always respect allergies strictly — never include foods the user is allergic to.
Respond as JSON: {"meals":[{"meal":"Breakfast","name":"","description":"","calories":0,"protein":0,"carbs":0,"fat":0,"ingredients":["",""]}],"totalCalories":0,"totalProtein":0,"totalCarbs":0,"totalFat":0,"notes":""}.
Include ${MEDICAL_DISCLAIMER} in notes.`;

export async function generateMealPlan(
  userProfile: string,
): Promise<MealPlanResult> {
  const raw = await chatCompletion(
    [
      { role: "system", content: SYSTEM_COACH },
      { role: "user", content: userProfile },
    ],
    { temperature: 0.7, json: true, maxTokens: 2500 },
  );
  return parseJsonLoose<MealPlanResult>(raw);
}

// ---------------------------------------------------------------------------
// Recipe Generator
// ---------------------------------------------------------------------------

export interface RecipeResult {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: Array<{ name: string; amount: string }>;
  steps: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  tips: string;
}

const SYSTEM_RECIPE = `You are a healthy recipe expert AI. Generate a detailed recipe based on the user's request (ingredients available, diet, time, goals).
Respond as JSON: {"title":"","description":"","prepTime":"","cookTime":"","servings":2,"ingredients":[{"name":"","amount":""}],"steps":["",""],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"tips":""}.
Include safety note in tips if any ingredient requires careful handling.`;

export async function generateRecipe(prompt: string): Promise<RecipeResult> {
  const raw = await chatCompletion(
    [
      { role: "system", content: SYSTEM_RECIPE },
      { role: "user", content: prompt },
    ],
    { temperature: 0.7, json: true, maxTokens: 2500 },
  );
  return parseJsonLoose<RecipeResult>(raw);
}

// ---------------------------------------------------------------------------
// Exercise Plan
// ---------------------------------------------------------------------------

export interface ExercisePlanResult {
  title: string;
  level: string;
  workouts: Array<{
    day: string;
    focus: string;
    exercises: Array<{
      name: string;
      duration: string;
      description: string;
    }>;
    estimatedCaloriesBurned: number;
  }>;
  tips: string;
}

const SYSTEM_EXERCISE = `You are a fitness coach AI. Create a personalized exercise plan.
Consider the user's fitness level, goal, available time, and any limitations.
Respond as JSON: {"title":"","level":"","workouts":[{"day":"Day 1","focus":"","exercises":[{"name":"","duration":"","description":""}],"estimatedCaloriesBurned":0}],"tips":""}.
Include "${MEDICAL_DISCLAIMER}" in tips.`;

export async function generateExercisePlan(
  prompt: string,
): Promise<ExercisePlanResult> {
  const raw = await chatCompletion(
    [
      { role: "system", content: SYSTEM_EXERCISE },
      { role: "user", content: prompt },
    ],
    { temperature: 0.7, json: true, maxTokens: 2500 },
  );
  return parseJsonLoose<ExercisePlanResult>(raw);
}

// ---------------------------------------------------------------------------
// Health Insights
// ---------------------------------------------------------------------------

export interface HealthInsightResult {
  summary: string;
  trends: string[];
  recommendations: string[];
  positiveChanges: string[];
  areasForImprovement: string[];
  disclaimer: string;
}

const SYSTEM_INSIGHTS = `You are a wellness insights AI. Analyze the user's health logs (weight, hydration, sleep, mood, exercise, calories) and provide trend analysis.
Respond as JSON: {"summary":"","trends":[""],"recommendations":[""],"positiveChanges":[""],"areasForImprovement":[""],"disclaimer":""}.
Set disclaimer to: "${MEDICAL_DISCLAIMER}".`;

export async function generateHealthInsights(
  healthData: string,
): Promise<HealthInsightResult> {
  const raw = await chatCompletion(
    [
      { role: "system", content: SYSTEM_INSIGHTS },
      { role: "user", content: healthData },
    ],
    { temperature: 0.5, json: true, maxTokens: 1500 },
  );
  return parseJsonLoose<HealthInsightResult>(raw);
}

// ---------------------------------------------------------------------------
// Chat Assistant
// ---------------------------------------------------------------------------

const SYSTEM_CHAT = `You are a friendly wellness and nutrition assistant AI. You help users with:
- Calorie and nutrition questions
- Meal suggestions and diet tips
- Exercise recommendations
- Sleep, hydration, and stress management
- General wellness education including traditional practices (e.g., Ayurvedic dietary concepts)

RULES:
- You are NOT a medical professional. Never diagnose, prescribe medication, or give medical treatment advice.
- Always end your response with: "${MEDICAL_DISCLAIMER}"
- Be encouraging, evidence-informed, and practical.
- Keep responses concise but helpful (3-6 sentences unless the user asks for detail).`;

export async function chatWithAssistant(
  userMessage: string,
  history: Array<{ role: string; content: string }> = [],
): Promise<string> {
  const messages: ChatMsg[] = [{ role: "system", content: SYSTEM_CHAT }];
  for (const h of history.slice(-10)) {
    messages.push({
      role: (h.role === "user" ? "user" : "assistant"),
      content: h.content,
    });
  }
  messages.push({ role: "user", content: userMessage });

  return chatCompletion(messages, { temperature: 0.7, maxTokens: 800 });
}
