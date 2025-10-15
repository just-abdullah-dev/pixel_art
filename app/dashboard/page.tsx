'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  username: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadProjects = async () => {
      try {
        // Check authentication
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);

        // Load projects
        const projectsRes = await fetch('/api/projects');
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.projects);
        }

        setIsLoading(false);
      } catch {
        router.push('/login');
      }
    };

    checkAuthAndLoadProjects();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch {
      alert('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Projects</h1>
            <p className="text-gray-400">Welcome back, {user?.username}!</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/editor"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              + New Project
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No projects yet</p>
            <Link
              href="/editor"
              className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition group"
              >
                <div className="aspect-square bg-gray-700 flex items-center justify-center">
                  <div className="text-gray-500 text-sm">
                    {project.width} × {project.height}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2 truncate">{project.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/editor?id=${project.id}`}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded text-center hover:bg-purple-700 transition text-sm"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-purple-400 font-medium mb-2">Drawing Tools</h3>
              <p className="text-gray-400 text-sm">
                Pencil, eraser, fill bucket, eyedropper, line, rectangle, and circle tools
              </p>
            </div>
            <div>
              <h3 className="text-purple-400 font-medium mb-2">Layers & Animation</h3>
              <p className="text-gray-400 text-sm">
                Multiple layers with opacity control and frame-by-frame animation support
              </p>
            </div>
            <div>
              <h3 className="text-purple-400 font-medium mb-2">Real-time Collaboration</h3>
              <p className="text-gray-400 text-sm">
                Work together with others in real-time (coming soon!)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
