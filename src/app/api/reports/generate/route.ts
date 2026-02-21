import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { calculatorType, inputs, outputs, format = "json" } = body;

    if (!calculatorType || !inputs || !outputs) {
      return NextResponse.json(
        { success: false, error: "calculatorType, inputs, and outputs are required" },
        { status: 400 }
      );
    }

    if (format === "json") {
      return NextResponse.json({
        success: true,
        data: {
          report: {
            generatedAt: new Date().toISOString(),
            calculator: calculatorType,
            version: "1.0.0",
            inputs,
            outputs,
            generatedBy: "ClinicalTrials.Tools",
          },
        },
      });
    }

    // For PDF generation, we'd use @react-pdf/renderer on the client side
    // or a server-side PDF library. Return the data for client-side rendering.
    return NextResponse.json({
      success: true,
      data: {
        reportData: {
          title: `Sample Size Report — ${calculatorType}`,
          generatedAt: new Date().toISOString(),
          calculator: calculatorType,
          inputs,
          outputs,
          watermark: true, // free tier
        },
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
