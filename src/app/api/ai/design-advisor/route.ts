import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a clinical trial design advisor built into ClinicalTrials.Tools.
Your role is to help investigators design their clinical trials by:

1. Understanding their research question, population, intervention, and outcomes
2. Recommending the optimal study design (parallel, crossover, cluster, adaptive, etc.)
3. Suggesting appropriate primary and secondary endpoints
4. Recommending the right sample size calculator and helping estimate parameters
5. Flagging potential design issues (multiplicity, missing stratification, etc.)

Always:
- Ask clarifying questions when needed
- Explain your reasoning
- Cite guidelines (ICH E9, E10, E17, E20) when relevant
- Recommend validation of your suggestions with a biostatistician for regulatory submissions
- Be conservative in parameter estimates (avoid overly optimistic effect sizes)

Never:
- Make definitive regulatory claims
- Replace a qualified biostatistician's judgment
- Guarantee trial success`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return a helpful fallback response when no API key is configured
      return NextResponse.json({
        success: true,
        data: {
          role: "assistant",
          content:
            "The AI Design Advisor requires an Anthropic API key to be configured. Please set the ANTHROPIC_API_KEY environment variable to enable this feature.\n\nIn the meantime, I can suggest that you:\n1. Browse our calculator catalog to find the right sample size calculator\n2. Check the Endpoint Library for typical effect sizes in your therapeutic area\n3. Review our blog guides for design best practices",
        },
      });
    }

    // Call Anthropic Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      return NextResponse.json(
        { success: false, error: "AI service temporarily unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.content[0]?.text || "I apologize, I was unable to generate a response.";

    return NextResponse.json({
      success: true,
      data: {
        role: "assistant",
        content: assistantMessage,
      },
    });
  } catch (error) {
    console.error("Design advisor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
