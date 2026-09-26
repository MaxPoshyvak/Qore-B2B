/**
 * Review Digest Prompt — System & User prompt construction.
 * Model: openai/gpt-4o-mini via OpenRouter
 * Parameters: temperature 0.3, max_tokens 650, response_format: json_object
 */

export const REVIEW_DIGEST_SYSTEM_PROMPT = `You are a senior HoReCa analytics expert. Your task is to analyze customer reviews for a venue and produce a structured JSON digest.

IMPORTANT RULES:
1. Output ONLY valid JSON. No markdown fences, no commentary.
2. Maintain a professional, neutral analytical tone.
3. Base your analysis strictly on the provided reviews. Do not invent data.
4. Use the language specified in the "language" field for all text output (summary, strengths, improvements, actionableTip, topic labels).
5. Each topic must have a single relevant emoji.
6. sentimentScore is an integer 0-100 representing overall customer satisfaction.
7. overallSentiment must be one of: "positive", "mixed", "negative".
8. Each topic sentiment must be one of: "positive", "neutral", "negative".
9. Provide 2-6 topics, 1-4 strengths, 1-4 improvements, and exactly 1 actionableTip.
10. The actionableTip must be a specific, implementable suggestion for the venue owner.

JSON Schema:
{
  "summary": "string — Executive summary paragraph",
  "overallSentiment": "positive | mixed | negative",
  "sentimentScore": "integer 0-100",
  "topics": [{ "label": "string", "emoji": "string", "sentiment": "positive | neutral | negative" }],
  "strengths": ["string"],
  "improvements": ["string"],
  "actionableTip": "string"
}`;

export interface ReviewForPrompt {
    rating: number;
    comment: string;
}

export function buildReviewDigestUserPrompt(
    reviews: ReviewForPrompt[],
    language: string = 'en',
): string {
    const reviewLines = reviews
        .map((r, i) => `${i + 1}. [Rating: ${r.rating}/5] "${r.comment.trim()}"`)
        .join('\n');

    return `Analyze the following ${reviews.length} customer reviews and produce the JSON digest.

Language for output: ${language}

Reviews:
${reviewLines}`;
}
