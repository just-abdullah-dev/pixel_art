import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all projects for the current user
export async function GET() {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        width: true,
        height: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create or update a project
export async function POST(request: Request) {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, width, height, frames } = body;

    // Convert project data to JSON string
    const projectData = JSON.stringify({ frames, width, height });

    // Generate thumbnail (simple base64 of first frame)
    // In production, you'd want to generate an actual preview image
    const thumbnail = projectData.substring(0, 100);

    if (id) {
      // Update existing project
      const project = await prisma.project.update({
        where: { id, userId },
        data: {
          name,
          width,
          height,
          data: projectData,
          thumbnail,
        },
      });
      return NextResponse.json({ project });
    } else {
      // Create new project
      const project = await prisma.project.create({
        data: {
          name,
          width,
          height,
          data: projectData,
          thumbnail,
          userId,
        },
      });
      return NextResponse.json({ project });
    }
  } catch (error) {
    console.error('Save project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
