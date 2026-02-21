"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, User, Bot, Calculator, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: { calculator: string; slug: string }[];
}

const examplePrompts = [
  "I'm designing a Phase III trial for a new diabetes drug. Where do I start?",
  "What's the best design for comparing two doses of an anti-hypertensive?",
  "Help me estimate sample size for a survival endpoint in oncology.",
  "Should I use a non-inferiority or superiority design for my biosimilar trial?",
  "How do I account for clustering in my school-based intervention study?",
];

export default function DesignAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your clinical trial design advisor. I can help you choose the right study design, select endpoints, estimate parameters, and calculate sample sizes.\n\nTell me about your research question, and I'll guide you through the design process.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulated response (will be replaced with Claude API call)
    setTimeout(() => {
      const response: Message = {
        role: "assistant",
        content:
          "Based on your description, I'd recommend starting with a **parallel-group, randomized, double-blind superiority design**. This is the gold standard for Phase III trials.\n\nFor your primary endpoint, consider using a continuous outcome measured at a fixed timepoint, which would allow you to use a **two-sample t-test** for the primary analysis.\n\nHere are my suggestions:\n\n1. **Study Design**: Parallel-group, 1:1 randomization\n2. **Primary Endpoint**: Change from baseline at Week 24\n3. **Sample Size Calculator**: Two-Sample T-Test\n4. **Key Assumptions**: You'll need estimates for the expected mean difference and standard deviation from Phase II data or published literature.\n\nWould you like me to help you estimate the sample size? I can pre-fill the calculator with suggested parameters.",
        suggestions: [
          { calculator: "Two-Sample T-Test", slug: "two-sample-ttest" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl font-bold text-[#1B2A4A]"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              Design Advisor
            </h1>
            <Badge className="bg-purple-100 text-purple-700">AI</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Get AI-powered guidance on trial design, endpoints, and sample size estimation.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          3 / 3 conversations remaining
        </Badge>
      </div>

      <Card className="flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
        {/* Messages area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[#0D7377] text-white"
                    : "bg-slate-50 text-foreground"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.suggestions.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/calculators/${s.slug}`}
                        className="flex items-center gap-2 rounded border bg-white p-2 text-sm font-medium text-[#0D7377] hover:bg-[#E6F7F7] transition-colors"
                      >
                        <Calculator className="h-4 w-4" />
                        {s.calculator}
                        <ArrowRight className="h-3 w-3 ml-auto" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Example prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  {prompt.slice(0, 60)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your study or ask a question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-[#0D7377] hover:bg-[#0a5c5f]"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
