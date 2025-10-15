import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          Pixel Art Editor
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Create amazing pixel art with real-time collaboration. Draw, animate, and share your creations with the world.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition shadow-lg border-2 border-white"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
