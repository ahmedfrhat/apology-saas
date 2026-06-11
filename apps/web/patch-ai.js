import fs from 'fs';

const filePath = 'src/app/api/sites/[slug]/generate-ai/route.js';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update body destructuring to grab locale
content = content.replace(
  'const { incident_reason, coreIntent = "apology", textVibe = "affectionate", vibeIntensity = "medium" } = body || {};',
  'const { incident_reason, coreIntent = "apology", textVibe = "affectionate", vibeIntensity = "medium", locale = "ar" } = body || {};'
);

// 2. Define English prompt and merge variables
const originalArPromptLine = 'const systemPrompt = `You are a world-class relationship psychologist';
const replacementPrompts = `
        const petNameInstructionAr = config.petNameOverride 
          ? \`\\n   - CRITICAL: You MUST use the exact pet name "\${config.petNameOverride}" frequently and naturally as her primary name.\` 
          : \`\\n   - CRITICAL: You MUST use her name "\${config.girlName}" or her derived nickname "\${config.girlNickname}" frequently and naturally.\`;

        const petNameInstructionEn = config.petNameOverride 
          ? \`\\n   - CRITICAL: You MUST use the exact pet name "\${config.petNameOverride}" frequently and naturally as her primary name.\` 
          : \`\\n   - CRITICAL: You MUST use her name "\${config.girlName}" or her derived nickname "\${config.girlNickname}" frequently and naturally.\`;

        const systemPromptAr = \`You are a world-class relationship psychologist`;

content = content.replace(originalArPromptLine, replacementPrompts);

// 3. Fix petNameInstruction line to use Ar explicitly
content = content.replace(
  'Address the girl strictly in the 2nd person feminine singular (مخاطب مؤنث مفرد) (e.g. "إنتي", "سامحتيني", "زعّلتك").${petNameInstruction}',
  'Address the girl strictly in the 2nd person feminine singular (مخاطب مؤنث مفرد) (e.g. "إنتي", "سامحتيني", "زعّلتك").${petNameInstructionAr}'
);

// 4. Split the schemaString from systemPromptAr so we can reuse it for En
const endOfArPrompt = `   - Exclusively return a raw, clean JSON object matching this schema (do not wrap in markdown \\\`\\\`\\\`json code blocks, do not include trailing commas):\`;

        const systemPromptEn = \`You are a world-class relationship psychologist, a master copywriter, and a witty Western comedian.
Your task is to generate a custom configuration in JSON format based on the boyfriend's incident reason: "\${reason}".

Additional parameters guiding the generation:
- Core Intent: \${coreIntent} (Options: apology, love, joy)
- Text Vibe: \${textVibe} (Options: standard, funny, sarcastic)
- Vibe Intensity: \${vibeIntensity} (Options: low, medium, high)

Follow these instructions strictly:
1. Deep Semantic Analyzer & Dynamic Tone:
   - Sarcastic Comedy: If Text Vibe is "sarcastic" or "funny", you MUST inject witty, sarcastic Western roasting. Heavily hype up the girl using her pet name, while playfully destroying the boyfriend's ego in short, punchy English sentences.
   - Intensity Scaling: Dynamically morph sentence structure and emotional weight based on Vibe Intensity. If set to 'high', deliver maximum dramatic impact.
   - If Core Intent is "love" or "joy", frame the text entirely around affection, happiness, and appreciation rather than apology.
   - ABSOLUTE BAN ON STATIC PREFIXES: Strictly forbid using hardcoded templates, quotes, or sentence starters.
   - 100% ORGANIC SYNTHESIS: The input reason must ONLY be treated as "semantic context". Never copy the exact phrase.
2. Language and Addressing:
   - Address the girl directly as "you".\${petNameInstructionEn}
   - Output must be in fluent, modern, and engaging English. It must sound like a deeply caring human boyfriend.
3. Contextual Trivia & Letter Generation:
   - Generate exactly 3 quiz questions matching the incident and the core intent.
   - Reward coupons must compensate for the mistake or match the vibe.
4. Schema Constraint:
   - Exclusively return a raw, clean JSON object matching this schema (do not wrap in markdown \\\`\\\`\\\`json code blocks, do not include trailing commas):\`;

        const finalSystemPrompt = locale === "en" ? systemPromptEn : systemPromptAr;
        const schemaString = \\\`
      {`;

content = content.replace(
  '   - Exclusively return a raw, clean JSON object matching this schema (do not wrap in markdown ```json code blocks, do not include trailing commas):\n      {',
  endOfArPrompt
);

// 5. Update the API payload
content = content.replace(
  'contents: [{ parts: [{ text: systemPrompt }] }]',
  'contents: [{ parts: [{ text: finalSystemPrompt + "\\n" + schemaString }] }]'
);

// 6. Delete old petNameInstruction
content = content.replace(/const petNameInstruction = config\.petNameOverride[\s\S]*?frequently and naturally\.`;/, '');

fs.writeFileSync(filePath, content);
console.log("generate-ai updated perfectly!");
