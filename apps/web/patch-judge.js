import fs from 'fs';

const filePath = 'src/app/api/sites/[slug]/judge/route.js';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update body destructuring to grab locale
content = content.replace(
  'const { currentPhase, pleaText, quizScore } = body || {};',
  'const { currentPhase, pleaText, quizScore, locale = "ar" } = body || {};'
);

// 2. Define English prompt and merge variables
const originalArPromptLine = 'const systemPrompt = `You are an AI Judge representing';
const replacementPrompts = `
        const systemPromptAr = \`You are an AI Judge representing`;

content = content.replace(originalArPromptLine, replacementPrompts);

const endOfArPrompt = `   - Use JSON format with {"title": "...", "details": "..."} as the exact structure.\`;

        const systemPromptEn = \`You are an AI Judge representing the girlfriend's ultimate authority.
The boyfriend has submitted a defense plea regarding a mistake he made.
Context:
- Girlfriend's Name/Nickname: "\${config.girlNickname}"
- Phase: "\${currentPhase}"
- Boyfriend's Defense Plea: "\${pleaText}"
- His score on the memory quiz: \${quizScore || 0}/3

Instructions:
1. Tone: Hilarious, witty, sarcastic Western courtroom style. Completely biased towards the girlfriend (\${config.girlNickname}).
2. Language: MUST be exclusively in English.
3. If his plea is good: Accept it with massive attitude, warning him he's on thin ice.
4. If his plea is weak/funny: Roast him mercilessly. Tell him the jury (her friends) are not impressed.
5. Format Requirement:
   - Exclusively return a raw JSON object (no markdown, no backticks).
   - Use JSON format with {"title": "...", "details": "..."} as the exact structure.\`;

        const finalSystemPrompt = locale === "en" ? systemPromptEn : systemPromptAr;
`;

content = content.replace(
  '   - Use JSON format with {"title": "...", "details": "..."} as the exact structure.`',
  endOfArPrompt
);

// 5. Update the API payload
content = content.replace(
  'contents: [{ parts: [{ text: systemPrompt }] }]',
  'contents: [{ parts: [{ text: finalSystemPrompt }] }]'
);

fs.writeFileSync(filePath, content);
console.log("judge/route.js updated perfectly!");
