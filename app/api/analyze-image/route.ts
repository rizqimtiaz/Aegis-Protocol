import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

const anomalySchema = z.object({
  label: z.string().describe('Short description of the anomaly, e.g., "Mismatched Lighting", "AI Artifacts", "Warped Background"'),
  confidence: z.number().min(0).max(100).describe('Confidence level from 0 to 100'),
  xMin: z.number().min(0).max(1).describe('Relative minimum X coordinate (0.0 to 1.0)'),
  yMin: z.number().min(0).max(1).describe('Relative minimum Y coordinate (0.0 to 1.0)'),
  xMax: z.number().min(0).max(1).describe('Relative maximum X coordinate (0.0 to 1.0)'),
  yMax: z.number().min(0).max(1).describe('Relative maximum Y coordinate (0.0 to 1.0)'),
});

const responseSchema = z.object({
  trustScore: z.number().min(0).max(100).describe('Overall trust score where 100 is authentic and 0 is entirely fabricated'),
  summary: z.string().describe('A detailed summary of the forensic analysis outlining the logic behind the trust score.'),
  anomalies: z.array(anomalySchema).describe('List of suspicious regions found in the image. Return an empty array if image is authentic.'),
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'Payload missing image data' }), { status: 400 });
    }

    const base64Data = image.split(',')[1] || image;

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: responseSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are an elite digital forensic analyst protocol named Aegis. Your objective is to mathematically identify AI-generated imagery, deepfakes, and photoshopped manipulations. Scan the provided image and extract findings into structured data. Check for impossible geometry, inconsistent lighting/shadows, synthetic blurring, and structural artifacts. Output coordinates mapping the bounding boxes of these anomalies as relative values strictly between 0.0 and 1.0.',
            },
            {
              type: 'image',
              image: base64Data,
            },
          ],
        },
      ],
    });

    return new Response(JSON.stringify(object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Forensic Pipeline Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Pipeline failed to analyze imagery' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
