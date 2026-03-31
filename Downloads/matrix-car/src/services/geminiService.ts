import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function processVoiceSearch(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user said: "${query}". 
      Extract search filters from this query for a car marketplace. 
      The categories are 'Car' and 'Part'.
      Listing types are 'Sale' and 'Rent'.
      Conditions are 'New' and 'Used'.
      Engine types are 'EV', 'Hybrid', 'PHEV', 'Gasoline', 'Diesel'.
      
      Return a JSON object with the following fields:
      - searchQuery: string (the main search term)
      - category: 'Car' | 'Part' | null
      - make: string[] (list of car brands mentioned)
      - model: string[] (list of car models mentioned)
      - minYear: string | null
      - maxYear: string | null
      - engineType: string[]
      - listingType: string[]
      - condition: string[]
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            searchQuery: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Car', 'Part'] },
            make: { type: Type.ARRAY, items: { type: Type.STRING } },
            model: { type: Type.ARRAY, items: { type: Type.STRING } },
            minYear: { type: Type.STRING },
            maxYear: { type: Type.STRING },
            engineType: { type: Type.ARRAY, items: { type: Type.STRING } },
            listingType: { type: Type.ARRAY, items: { type: Type.STRING } },
            condition: { type: Type.ARRAY, items: { type: Type.STRING } },
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error processing voice search:", error);
    return null;
  }
}

export async function getCarSpecs(carName: string, year: number) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed technical specification for the ${year} ${carName}. 
      Include:
      1. Battery capacity (if EV) or Engine specs (if Hybrid)
      2. Range (WLTP or EPA)
      3. Acceleration (0-100 km/h)
      4. Top speed
      5. Charging speed (if applicable)
      6. Key features
      
      Format the output as a clean, scannable list in Arabic and English.`,
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching car specs:", error);
    return "Sorry, I couldn't fetch the specifications at this moment. | عذراً، لا يمكنني جلب المواصفات في الوقت الحالي.";
  }
}
