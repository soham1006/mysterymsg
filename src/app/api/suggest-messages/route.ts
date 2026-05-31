import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
);

console.log(
  "KEY:",
  process.env.GEMINI_API_KEY?.slice(0, 10)
);

export async function POST() {
  try {
    const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

    const prompt = `
Create a list of three open-ended and engaging questions formatted as a single string.

Requirements:
- Separate each question with '||'
- Suitable for an anonymous social messaging platform like Qooh.me
- Avoid personal, sensitive, or controversial topics
- Encourage friendly and engaging conversations
- Output only the questions, no numbering or extra text

Example:
What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
  console.error("GEMINI ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Error generating suggestions",
    },
    { status: 500 }
  );
}
}