const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function analyzeTenderAndBids(tenderText, bids) {
  const prompt = `
You are a procurement evaluation engine.

INPUT:
Tender Requirements:
${tenderText}

Bid Documents:
${bids
  .map(
    (b, i) => `
[Bid ${i + 1}]
Filename: ${b.filename}
Content:
${b.text}
`
  )
  .join("\n")}

TASK:
1. Extract structured tender requirements
2. Extract structured specs from each bid
3. Determine which bids qualify
4. Select ONE best bid

OUTPUT STRICT JSON ONLY:
{
  "tender": { "item": "", "quantity": 0, "processor": "", "ram": "", "storage": "" },
  "qualified_bids": number,
  "best_bid": "filename.pdf",
  "best_specs": { "filename": "", "quantity": 0, "processor": "", "ram": "", "storage": "" }
}

Do not include explanations. Do not include markdown.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return JSON.parse(response.text);
}

module.exports = { analyzeTenderAndBids };
