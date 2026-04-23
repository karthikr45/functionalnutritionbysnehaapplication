import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const NUTRITION_PROMPT = `You are a board-certified clinical nutritionist and functional medicine specialist. You are analyzing a patient's medical document for a fellow clinician (not a patient). Your output will be read by a practicing doctor preparing for a consultation.

Produce a clinically rigorous, structured analysis. Output MUST follow this exact format with these exact section headers (no markdown asterisks, no code blocks):

## EXECUTIVE SUMMARY
One crisp paragraph (2-3 sentences) describing: document type, patient's most significant issue, and the recommended clinical priority. Write for a peer clinician.

## PATIENT SNAPSHOT
- Age: [extract or write "Not specified"]
- Sex: [extract or write "Not specified"]
- Document date: [extract or write "Not specified"]
- Document type: [Lab panel / Imaging / Prescription / Clinical notes / Other]

## KEY FINDINGS
For each abnormal or notable value, use this exact format on its own line:
[SEVERITY] Parameter: Value (Reference range) — Clinical interpretation

Where SEVERITY is one of: [CRITICAL], [HIGH], [LOW], [BORDERLINE], [NORMAL-NOTABLE]
Example:
[HIGH] TSH: 6.2 mIU/L (0.4–4.0) — Subclinical hypothyroidism likely; consider autoimmune etiology
[LOW] Vitamin D 25-OH: 18 ng/mL (30–100) — Deficiency; impacts immune function and bone health

List all clinically meaningful findings. If the document has no abnormal values, say "All parameters within reference range" and highlight any trending concerns.

## CLINICAL INTERPRETATION
A focused clinical synthesis (2-4 bullet points). Connect the dots between findings:
- Pattern recognition (e.g., insulin resistance triad, iron deficiency anemia, HPA axis dysregulation)
- Likely root causes to investigate
- Differential diagnoses worth ruling out

## NUTRITIONAL IMPLICATIONS
Translate findings into nutrition terms. Use evidence-based connections:
- Deficiencies/excesses indicated by the data
- Metabolic dysfunction patterns (e.g., dysglycemia, dyslipidemia, inflammation)
- Gut-brain, gut-hormone, or other axis involvement if relevant

## RECOMMENDED INTERVENTIONS
Divide into two sub-sections:

### Dietary Strategy
- 3-5 specific, actionable dietary recommendations
- Include macronutrient targets when appropriate (e.g., "protein at 1.2-1.6 g/kg body weight")
- Reference specific foods, not vague advice

### Supplementation
- Specific supplements with suggested dosages based on findings
- Format: "Supplement name — Dose — Rationale"
- Example: "Vitamin D3 — 5000 IU/day for 8 weeks, then retest — addresses deficiency"
- Only suggest if the data supports it; say "No supplementation indicated from this data" if applicable

## LIFESTYLE & FOLLOW-UP
- Lifestyle modifications relevant to findings (sleep, stress, movement)
- Suggested follow-up labs and timing
- Recommended consultation frequency

## RED FLAGS & REFERRALS
List any findings that warrant:
- Urgent medical attention (write [URGENT] prefix)
- Specialist referral (endocrinology, cardiology, gastroenterology, etc.)
- Additional testing before nutrition intervention

If none, write "No urgent red flags identified."

## CONSULTATION TALKING POINTS
3-5 specific questions or topics the clinician should raise with the patient during the consultation. These should be open-ended and help uncover root causes.

---

RULES:
- Use the exact section headers above with ## prefix
- Use [SEVERITY] tags for lab findings in all caps in square brackets
- Be specific with numbers, dosages, and timelines — avoid vague language
- Reference evidence-based nutrition and functional medicine principles
- Write for a clinical peer — use appropriate medical terminology
- No disclaimers about "consulting a doctor" — you ARE addressing the doctor
- Keep total response focused and efficient — no padding or repetition`;

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParseModule: any = await import('pdf-parse');
  const pdfParse = pdfParseModule.default || pdfParseModule;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized — Doctor only' }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured. Add ANTHROPIC_API_KEY to .env' }, { status: 500 });
  }

  const { documentId, force } = await req.json();
  if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 });

  try {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // Return cached analysis unless force regenerate
    if (!force && document.aiAnalysis) {
      return NextResponse.json({
        analysis: document.aiAnalysis,
        documentTitle: document.title,
        documentType: document.type,
        cached: true,
        analyzedAt: document.aiAnalyzedAt,
      });
    }

    const fileRes = await fetch(document.fileUrl);
    if (!fileRes.ok) return NextResponse.json({ error: 'Failed to fetch document file' }, { status: 500 });
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    const mimeType = document.fileType || (document.fileUrl.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    const isPdf = mimeType.includes('pdf') || document.fileUrl.endsWith('.pdf');

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const contentBlocks: Anthropic.MessageCreateParams['messages'][0]['content'] = [];

    if (isPdf) {
      let pdfText = '';
      try {
        pdfText = await extractPdfText(buffer);
      } catch (err: any) {
        console.error('[ai-analyze] PDF extraction failed:', err);
      }

      if (pdfText && pdfText.trim().length >= 20) {
        const truncatedText = pdfText.substring(0, 30000);
        contentBlocks.push({
          type: 'text',
          text: `${NUTRITION_PROMPT}\n\n--- DOCUMENT CONTENT ---\n${truncatedText}\n--- END OF DOCUMENT ---`,
        });
      } else {
        const fileSizeMB = buffer.byteLength / (1024 * 1024);
        if (fileSizeMB > 20) {
          return NextResponse.json({
            error: `PDF is ${fileSizeMB.toFixed(1)}MB and exceeds the size limit. Please compress or split the file.`,
          }, { status: 413 });
        }
        const base64 = buffer.toString('base64');
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 },
        } as any);
        contentBlocks.push({ type: 'text', text: NUTRITION_PROMPT });
      }
    } else {
      const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const imgType = supportedImageTypes.includes(mimeType) ? mimeType : 'image/jpeg';
      const base64 = buffer.toString('base64');
      contentBlocks.push({
        type: 'image',
        source: { type: 'base64', media_type: imgType as any, data: base64 },
      });
      contentBlocks.push({ type: 'text', text: NUTRITION_PROMPT });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: contentBlocks }],
    });

    const analysis = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    // Persist to DB so future requests return from cache
    const now = new Date();
    await prisma.document.update({
      where: { id: documentId },
      data: { aiAnalysis: analysis, aiAnalyzedAt: now },
    });

    return NextResponse.json({
      analysis,
      documentTitle: document.title,
      documentType: document.type,
      cached: false,
      analyzedAt: now,
    });
  } catch (err: any) {
    console.error('[ai-analyze] Error:', err);
    const msg = err?.message || '';
    if (msg.includes('rate_limit') || msg.includes('429') || msg.includes('Too Many')) {
      return NextResponse.json({
        error: 'AI rate limit reached. Please wait a moment and try again.',
      }, { status: 429 });
    }
    if (msg.includes('authentication') || msg.includes('api_key') || msg.includes('invalid')) {
      return NextResponse.json({
        error: 'AI API key is invalid. Please check ANTHROPIC_API_KEY in .env',
      }, { status: 500 });
    }
    return NextResponse.json({
      error: 'Failed to analyze document. Please try again.',
    }, { status: 500 });
  }
}
