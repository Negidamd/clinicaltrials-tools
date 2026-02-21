import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Get user from session and fetch projects from DB
    // const session = await getServerSession(authOptions);
    // const projects = await prisma.project.findMany({
    //   where: { userId: session.user.id },
    //   include: { _count: { select: { calculations: true } } },
    //   orderBy: { updatedAt: 'desc' },
    // });

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, indication, phase } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Project name is required" },
        { status: 400 }
      );
    }

    // TODO: Create project in DB
    // const project = await prisma.project.create({
    //   data: { userId: session.user.id, name, description, indication, phase },
    // });

    return NextResponse.json({
      success: true,
      data: { id: "demo", name, description, indication, phase },
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
