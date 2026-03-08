import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API routes
  app.post("/api/customize", async (req, res) => {
    const { dish_name, user_metrics, selected_swaps } = req.body;

    if (!dish_name || !user_metrics) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const systemInstruction = `You are the Nutri-Malay Architect. 
Your Goal: Take a standard Malaysian recipe and a set of user health constraints (BMI, target calories) to produce a modified, healthy version of the dish.

Input: {dish_name, bmi, calorie_limit}. 

Output Rules:
1. Always return valid JSON.
2. Scaling Logic: If the user's BMI is high (over 25) or their calorie goal is low, prioritize "karbo" (carbohydrate) reduction and increasing fiber.
3. Authenticity Guardrail: Ensure the modified recipe still tastes like the original dish. Always suggest local Malaysian health swaps like cauliflower rice, diluted santan, or monkfruit sweetener.

Expected JSON structure:
{
  "modified_dish_name": "string",
  "architect_note": "string",
  "ingredients": ["string"],
  "steps": ["string"],
  "nutrition": {
    "calories": number,
    "protein": number,
    "fat": number,
    "carbs": number,
    "fiber": number
  },
  "ai_details": {
    "portion_control": "string",
    "smart_swaps": "string"
  }
}`;

      const prompt = `Dish: ${dish_name}
User Metrics: ${JSON.stringify(user_metrics)}
Selected Swaps: ${selected_swaps.join(", ")}`;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const responseText = result.text;
      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to customize recipe" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
