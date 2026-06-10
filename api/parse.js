import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;
  if (!input?.trim()) {
    return res.status(400).json({ error: 'Missing input' });
  }

  const system = `You are a math expression parser for a graph sonification tool called EchoGraph. Given a natural language math request, extract:
  - expression: the mathematical expression to graph (e.g., "x^2", "sin(x)", "x+3")
  - xMin: the lower bound of the domain (number, default -10)
  - xMax: the upper bound of the domain (number, default 10)
  - step: the increment for x values (number, default 0.1)
  - explanation: a short, educational description of what the function looks like and what the user will hear (max 2 sentences)

  Return JSON only, no markdown. Example:
  {"expression":"x^2","xMin":0,"xMax":10,"step":0.1,"explanation":"This is a parabola opening upward. As you sweep from left to right, the pitch will rise quickly because the y-values increase quadratically."}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: input },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Groq parse error:', err);
    return res.status(500).json({ error: 'Failed to parse expression' });
  }
}