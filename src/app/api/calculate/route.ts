import { NextRequest, NextResponse } from "next/server";

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { calculatorType, ...inputs } = body;

    if (!calculatorType) {
      return NextResponse.json(
        { success: false, error: "calculatorType is required" },
        { status: 400 }
      );
    }

    // Proxy to Python engine
    const response = await fetch(
      `${PYTHON_ENGINE_URL}/api/v1/calculate/${calculatorType}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { success: false, error: `Calculation failed: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Calculate API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
