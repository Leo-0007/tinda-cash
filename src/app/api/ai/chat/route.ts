import { NextRequest, NextResponse } from "next/server";
import { type AgentType, routeToAgent, getAgentPrompt, generateAIResponse, type AgentMessage, type AgentContext } from "@/lib/ai/agents";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body as {
      messages: AgentMessage[];
      context?: AgentContext;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages requis" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const targetAgent = routeToAgent(lastMessage.content);

    // In production, this would call Claude API:
    // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // const response = await anthropic.messages.create({
    //   model: "claude-sonnet-4-20250514",
    //   max_tokens: 1024,
    //   system: getAgentPrompt(targetAgent),
    //   messages: messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
    // });

    const fullContext: AgentContext = {
      language: "fr",
      ...context,
    };

    const response = await generateAIResponse(messages, targetAgent, fullContext);

    return NextResponse.json({
      content: response.content,
      agent: response.agent,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "Erreur du service IA" },
      { status: 500 }
    );
  }
}
