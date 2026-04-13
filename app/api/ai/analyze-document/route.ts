import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const NUTRITION_PROMPT = `You are an expert clinical nutritionist analyzing a patient's medical document for a functional nutrition consultation.

Analyze the provided document and return a structured analysis with the following sections (use plain text, no markdown):

1. DOCUMENT TYPE: Identify what kind of document this is (lab report, prescription, medical history, etc.)

2. KEY FINDINGS: List the most important values, observations, or concerns from the document. For lab reports, highlight any out-of-range values clearly with the actual value and the normal range.

3. NUTRITIONAL CONCERNS: Identify any nutritional issues or deficiencies suggested by the data (e.g., low Vitamin D, high blood sugar indicating insulin resistance, low iron suggesting anemia, etc.)

4. RECOMMENDED FOCUS AREAS: As a functional nutritionist, what areas should be prioritized in the consultation? (e.g., gut health, hormonal balance, blood sugar management, anti-inflammatory diet)

5. SUGGESTED NUTRITION INTERVENTIONS: Specific dietary recommendations based on the findings (foods to add, foods to avoid, supplements to consider)

6. RED FLAGS: Any urgent concerns that require immediate medical attention beyond nutrition

7. FOLLOW-UP RECOMMENDATIONS: What additional tests or monitoring should be considered?

Be concise, actionable, and professional. This is for the doctor's reference only — do not include disclaimers about consulting a doctor since the doctor IS the user.`;

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized — Doctor only' }, { status: 401 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI not configured. Add GEMINI_API_KEY to .env from https://aistudio.google.com/apikey' }, { status: 500 });
  }

  const { documentId } = await req.json();
  if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 });

  try {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // Fetch the file from Cloudinary
    const fileRes = await fetch(document.fileUrl);
    if (!fileRes.ok) return NextResponse.json({ error: 'Failed to fetch document file' }, { status: 500 });
    const buffer = await fileRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Determine MIME type
    const mimeType = document.fileType || (document.fileUrl.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

    // Call Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      NUTRITION_PROMPT,
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ]);

    const analysis = result.response.text();

    return NextResponse.json({
      analysis,
      documentTitle: document.title,
      documentType: document.type,
    });
  } catch (err: any) {
    console.error('[ai-analyze] Error:', err);
    const msg = err?.message || '';
    if (msg.includes('quota') || msg.includes('429') || msg.includes('Too Many')) {
      return NextResponse.json({
        error: 'AI rate limit reached. Please wait a minute and try again. (Free tier: 15 requests/minute)',
      }, { status: 429 });
    }
    if (msg.includes('API_KEY') || msg.includes('API key')) {
      return NextResponse.json({
        error: 'AI API key is invalid. Please check GEMINI_API_KEY in .env',
      }, { status: 500 });
    }
    return NextResponse.json({
      error: 'Failed to analyze document. Please try again.',
    }, { status: 500 });
  }
}
