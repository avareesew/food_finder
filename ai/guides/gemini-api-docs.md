# Google Gemini API Documentation
## Real Documentation from Context7

**Last Updated:** February 16, 2026  
**Source:** Google AI Developer Docs (ai.google.dev)

---

## Overview

The Gemini API is Google's generative AI API that enables developers to build applications with text generation, multimodal understanding (text + images), real-time conversations, and specialized capabilities.

**Key Model for Our MVP:** `gemini-2.0-flash`

---

## Authentication

All API calls require an API key set in environment variables:

```javascript
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

**How to Get API Key:**
1. Go to [https://ai.google.dev](https://ai.google.dev)
2. Sign up for Gemini API access
3. Navigate to API keys section
4. Generate a new key
5. Add to `.env.local`: `GEMINI_API_KEY=your_key_here`

---

## Installation

```bash
npm install @google/generative-ai
```

**Package Name:** `@google/generative-ai` (official Google SDK)

---

## Core Use Case: Image → Structured Data Extraction

This is exactly what we need for flyer parsing!

### Example 1: Process Image with Prompt

```javascript
import { GoogleGenAI, createUserContent, createPartFromBase64 } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function extractFlyerData(imagePath) {
  // Read image file
  const imageBuffer = fs.readFileSync(imagePath);
  
  // Convert buffer to base64 string
  const imageBase64 = imageBuffer.toString("base64");
  
  // Build prompt
  const prompt = "Extract event details from this flyer: event name, location, date/time, and food description";
  
  // Build contents with image and text
  const contents = createUserContent([
    prompt,
    createPartFromBase64(imageBase64, "image/jpeg"), // or "image/png"
  ]);
  
  // Generate content
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: contents,
  });
  
  return response.text;
}
```

---

### Example 2: Structured JSON Output (CRITICAL FOR US!)

```javascript
async function extractFlyerDataAsJSON(imageBase64) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: createUserContent([
      "Extract event details from this flyer and return as JSON",
      createPartFromBase64(imageBase64, "image/jpeg")
    ]),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          eventName: { type: "string" },
          location: {
            type: "object",
            properties: {
              building: { type: "string" },
              room: { type: "string" }
            },
            required: ["building", "room"]
          },
          dateTime: {
            type: "object",
            properties: {
              start: { type: "string" }, // ISO format
              end: { type: "string" }
            },
            required: ["start"]
          },
          foodDescription: { type: "string" },
          estimatedPortions: { type: "number" }
        },
        required: ["eventName", "location", "dateTime", "foodDescription"]
      }
    }
  });
  
  // Response will be valid JSON matching our schema!
  return JSON.parse(response.text);
}
```

**This is HUGE:** Gemini can return structured JSON that matches our exact schema!

---

## File Upload API (Alternative Approach)

For larger files or when you want to reuse an image:

```javascript
async function uploadAndProcess() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Upload file first
  const myfile = await ai.files.upload({
    file: path.join(__dirname, "flyer.jpg"),
    config: { mimeType: "image/jpeg" },
  });
  
  console.log("Uploaded file URI:", myfile.uri);
  
  // Then use the file in generation
  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: createUserContent([
      createPartFromUri(myfile.uri, myfile.mimeType),
      "Extract event details from this flyer"
    ]),
  });
  
  return result.text;
}
```

---

## Token Counting (For Cost Estimation)

```javascript
async function countTokens(imageBase64, prompt) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const contents = createUserContent([
    prompt,
    createPartFromBase64(imageBase64, "image/jpeg"),
  ]);
  
  const countResponse = await ai.models.countTokens({
    model: "gemini-2.0-flash",
    contents: contents,
  });
  
  console.log("Total tokens:", countResponse.totalTokens);
  return countResponse.totalTokens;
}
```

**Pricing (as of Feb 2026):**
- Input: $0.000075 per 1,000 tokens
- Output: $0.0003 per 1,000 tokens
- Images count as ~258 tokens each

**Estimated cost per flyer:** ~$0.0001 (one-hundredth of a cent!)

---

## Error Handling

```javascript
async function safeExtraction(imageBase64) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: createUserContent([
        "Extract event details",
        createPartFromBase64(imageBase64, "image/jpeg")
      ])
    });
    
    return { success: true, data: response.text };
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Common errors:
    // - Invalid API key
    // - Rate limit exceeded
    // - Image too large (>20MB)
    // - Unsupported file format
    
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

---

## Rate Limits (Free Tier)

- **1,500 requests per day**
- **15 requests per minute**
- **4 million tokens per minute**

For MVP with 30-50 posts/week, we're well within limits!

---

## Best Practices for Flyer Extraction

### 1. **Optimize Prompt Engineering**

```javascript
const FLYER_EXTRACTION_PROMPT = `
You are analyzing an event flyer. Extract the following information:
1. Event name/title
2. Building name and room number (e.g., "TMCB 210")
3. Date and time (convert to ISO format if possible)
4. Food description (what food is available)
5. Estimated number of portions (if mentioned)

Return ONLY valid JSON matching this schema. If a field is unclear, use null.
`;
```

### 2. **Image Preprocessing (Optional)**

- Resize images to max 1024x1024 (reduces tokens)
- Convert to JPEG (smaller than PNG)
- Increase contrast if flyer is faded

### 3. **Validation Layer**

Always validate the extracted JSON:

```javascript
function validateExtractedData(data) {
  const required = ['eventName', 'location', 'dateTime', 'foodDescription'];
  
  for (const field of required) {
    if (!data[field]) {
      return { valid: false, missing: field };
    }
  }
  
  return { valid: true };
}
```

---

## Integration with Next.js API Route

```javascript
// app/api/extract-flyer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, createUserContent, createPartFromBase64 } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Convert File to base64
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    // Extract with Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: createUserContent([
        "Extract event details and return as JSON",
        createPartFromBase64(base64, image.type)
      ]),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          // ... your schema here
        }
      }
    });
    
    const extractedData = JSON.parse(response.text);
    
    return NextResponse.json({
      success: true,
      data: extractedData
    });
    
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract flyer data' },
      { status: 500 }
    );
  }
}
```

---

## Key Takeaways

✅ **Gemini 2.0 Flash supports multimodal (image + text)**  
✅ **Can return structured JSON matching our schema**  
✅ **NPM package: `@google/generative-ai`**  
✅ **Authentication via API key (no OAuth needed)**  
✅ **Extremely cheap (~$0.0001 per flyer)**  
✅ **1,500 free requests/day (enough for MVP)**  
✅ **Works with both base64 images and file uploads**

---

## Testing Checklist

Before building:
- [ ] Obtain Gemini API key
- [ ] Test with 5-10 real BYU flyers
- [ ] Verify JSON schema extraction works
- [ ] Measure average extraction time (target: <3 seconds)
- [ ] Test error handling (bad images, rate limits)

---

**This API is production-ready and exactly matches our architecture!** 🎉
