# Pixel Art Editor

A powerful pixel art editor with real-time collaboration features, built with Next.js, TypeScript, and Socket.IO. Create amazing pixel art with features similar to Aseprite and collaborate online like Scribble.io!

## Features

### Core Drawing Tools
- **Pencil** - Draw individual pixels
- **Eraser** - Remove pixels
- **Fill Bucket** - Fill connected areas with color
- **Eyedropper** - Pick colors from the canvas
- **Line Tool** - Draw straight lines
- **Rectangle Tool** - Draw rectangle outlines
- **Circle Tool** - Draw circle outlines

### Professional Features
- **Layers System** - Multiple layers with opacity control and visibility toggles
- **Animation Support** - Create frame-by-frame animations with adjustable frame durations
- **Color Palette** - Customizable color palette with custom color picker
- **Undo/Redo** - Full history support with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- **Export** - Export your artwork as PNG images
- **Save/Load** - Save projects to the cloud and load them later

### Collaboration Features
- **Real-time Collaboration** - Work together with others in real-time (WebSocket-powered)
- **User Presence** - See who's online and working on the same project
- **Live Cursor Tracking** - See other users' cursors as they draw

### Authentication
- **User Accounts** - Sign up and login to save your projects
- **Project Management** - Dashboard to view, edit, and delete your projects
- **Secure** - JWT-based authentication with password hashing

## Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS
- **Authentication**: JWT with bcryptjs
- **Deployment**: Custom Node.js server

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use Aiven/similar service)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pixel_art
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Getting Started
1. **Sign Up**: Create an account at `/signup`
2. **Login**: Sign in at `/login`
3. **Create Project**: Click "New Project" from the dashboard
4. **Start Drawing**: Use the tools on the left sidebar to draw

### Keyboard Shortcuts
- **Ctrl + Z**: Undo
- **Ctrl + Y / Ctrl + Shift + Z**: Redo
- **Ctrl + S**: Save project

### Drawing Tips
- Use **layers** to organize your artwork
- Create **animations** by adding multiple frames
- Adjust **layer opacity** for transparency effects
- Use the **eyedropper** to sample colors from your canvas
- **Export** your work as PNG when finished

### Collaboration
- Share your project ID with others to collaborate
- Each user gets a unique colored cursor
- Changes are synced in real-time across all connected users

## Project Structure

```
pixel_art/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   └── projects/       # Project CRUD endpoints
│   ├── dashboard/          # User dashboard
│   ├── editor/             # Pixel art editor
│   ├── login/              # Login page
│   └── signup/             # Signup page
├── components/              # React components
│   ├── ColorPicker.tsx     # Color selection component
│   ├── LayerPanel.tsx      # Layer management
│   ├── PixelCanvas.tsx     # Main drawing canvas
│   ├── Timeline.tsx        # Animation timeline
│   └── Toolbar.tsx         # Drawing tools
├── lib/                     # Utility libraries
│   ├── auth.ts             # Authentication helpers
│   ├── prisma.ts           # Prisma client
│   ├── socket-context.tsx  # WebSocket context
│   └── types/              # TypeScript types
├── prisma/                  # Database schema
├── server.js                # Custom Node.js server with Socket.IO
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create or update project
- `GET /api/projects/[id]` - Get single project
- `DELETE /api/projects/[id]` - Delete project

## WebSocket Events

### Client → Server
- `join-project` - Join a project room
- `pixel-change` - Update a pixel
- `cursor-move` - Update cursor position
- `layer-update` - Update layer settings
- `frame-update` - Update frame settings

### Server → Client
- `users-update` - List of active users
- `pixel-changed` - Pixel was changed by another user
- `cursor-moved` - Another user's cursor moved
- `layer-updated` - Layer settings changed
- `frame-updated` - Frame settings changed

## Development

### Database Migrations
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### Building for Production
```bash
npm run build
npm start
```

## Future Enhancements

- [ ] GIF export for animations
- [ ] More drawing tools (gradient, spray paint, etc.)
- [ ] Brush size adjustment
- [ ] Custom canvas dimensions in editor
- [ ] Project templates
- [ ] Public gallery for sharing artwork
- [ ] Comments and likes on projects
- [ ] Import from image files
- [ ] Pixel perfect zoom controls

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or building your own pixel art editor!

## Acknowledgments

- Inspired by [Aseprite](https://www.aseprite.org/) for pixel art features
- Inspired by [Scribble.io](https://skribbl.io/) for real-time collaboration
- Built with Next.js, Prisma, and Socket.IO
