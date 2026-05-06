import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

import { ChatGroq } from "@langchain/groq";

// Helper: extract raw text from a PDF buffer using the pdf-parse v2.x class API
const extractTextFromBuffer = async (buffer) => {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  // result.pages is an array of { text, num } — join all page texts
  return result.pages.map(p => p.text).join('\n');
};

const llm = new ChatGroq({
  model: "llama-3.1-8b-instant",   // Much faster model for extraction
  temperature: 0,                   // Deterministic output
  apiKey: process.env.GROQ_API_KEY,
});

export const extractResumeData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded." });
    }

    // Step 1: Extract raw text from the PDF buffer using the v2.x class-based API
    const rawText = await extractTextFromBuffer(req.file.buffer);

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ success: false, error: "Could not extract meaningful text from the PDF." });
    }

    // Step 2: Use Groq LLM to parse and structure the resume data
    const prompt = `You are a resume parser. Extract structured information from the following resume text and return it as a valid JSON object.

Resume Text:
---
${rawText.substring(0, 5000)}
---

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "name": "candidate full name or empty string",
  "email": "email or empty string",
  "phone": "phone or empty string",
  "currentRole": "current or most recent job title",
  "totalExperience": "estimated total years of experience as a string",
  "skills": ["skill1", "skill2"],
  "technicalSkills": ["tech1", "tech2"],
  "softSkills": ["soft1", "soft2"],
  "workExperience": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "time period",
      "highlights": ["key achievement or responsibility"]
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "institution name",
      "year": "graduation year or period"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "projects": [
    {
      "name": "project name",
      "description": "brief description",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "summary": "a 2-3 sentence professional summary of the candidate based on the resume"
}`;

    const response = await llm.invoke(prompt);
    let content = response.content.trim();

    // Strip markdown code blocks if present
    content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let resumeData;
    try {
      resumeData = JSON.parse(content);
    } catch (parseError) {
      console.error("[ResumeController] JSON Parse Error:", parseError.message);
      console.error("[ResumeController] Raw content:", content.substring(0, 500));
      return res.status(500).json({ success: false, error: "Failed to parse resume structure from AI response." });
    }

    console.log(`[ResumeController] Successfully extracted resume for: ${resumeData.name || 'Unknown'}`);

    return res.status(200).json({
      success: true,
      resumeData,
    });
  } catch (error) {
    console.error("[ResumeController] Error:", error);

    if (error.message?.includes('rate_limit_exceeded')) {
      return res.status(429).json({
        success: false,
        error: "AI is currently busy (Rate Limit). Please try again in a moment.",
        isRateLimit: true
      });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
};
