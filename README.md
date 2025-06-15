
# Real-time Collaborative Code Editor

A modern, real-time collaborative code editor built with React, TypeScript, Socket.IO, and Monaco Editor. Features include live code collaboration, chat, code execution with 30+ programming languages, and permission management.

## 🚀 Features

### Core Features
- **Real-time Collaboration**: Multiple users can edit code simultaneously with live cursor tracking
- **Code Execution**: Run code in 30+ programming languages using JDoodle API
- **Live Chat**: Built-in chat system for team communication
- **Session Management**: Create/join rooms with unique session codes
- **Permission Control**: Host can manage user permissions (viewer/editor)
- **Language Support**: JavaScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, and more

### UI/UX Features
- **Modern Design**: Beautiful, responsive interface with dark theme
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Real-time Presence**: See who's online and their cursor positions
- **Toast Notifications**: User-friendly notifications for all actions
- **Mobile Responsive**: Works seamlessly on all device sizes

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Monaco Editor** for code editing
- **Socket.IO Client** for real-time communication
- **Shadcn/ui** for UI components
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket communication
- **JDoodle API** for code execution
- **CORS** for cross-origin requests

## 📦 Installation & Setup

### Frontend Setup

The frontend is already configured in this project. Make sure to start the backend server first.

### Backend Setup

1. **Create a new directory for the backend:**
```bash
mkdir code-sync-backend
cd code-sync-backend
```

2. **Copy the backend files:**
- Copy `backend-server.js` to `server.js`
- Copy `backend-package.json` to `package.json`

3. **Install dependencies:**
```bash
npm install
```

4. **Start the backend server:**
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Environment Configuration

The JDoodle API keys are already configured in the backend:
- Client ID: `9f8e948469a69a8a0131a609b035c810`
- Client Secret: `81dbf7d707ef56da425acdd9e1e0c09ecb10fee78b2803c01c8cea757e3a570c`

## 🚀 Deployment

### Deploy Backend

Deploy your backend to any hosting platform that supports Node.js (such as Vercel, Render, Heroku, or your own VPS).

- Push backend code to your GitHub repository
- Connect your repository to your chosen deployment platform
- Set the following environment variables in your platform dashboard:
   - `JDOODLE_CLIENT_ID`: 9f8e948469a69a8a0131a609b035c810
   - `JDOODLE_CLIENT_SECRET`: 81dbf7d707ef56da425acdd9e1e0c09ecb10fee78b2803c01c8cea757e3a570c

- Update CORS origins in `backend-server.js`, for example:
```javascript
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-frontend-domain.com"],
    methods: ["GET", "POST"]
  }
});
```

### Deploy Frontend

- Update Socket.IO connection in your frontend to point to your deployed backend:
```javascript
const newSocket = io('https://your-backend-domain.com', {
  query: { roomId, userName, userRole }
});
```

- Deploy using your preferred platform (Vercel, Netlify, Render, GitHub Pages, etc.)

#### Custom Domains

You can connect your production app to a custom domain via your hosting provider. Refer to their documentation for detailed instructions.

## 🎯 Usage

### Creating a Room
1. Enter your name
2. Generate or enter a room ID
3. Click "Create Room"
4. Share the room ID with collaborators

### Joining a Room
1. Enter your name
2. Enter the room ID
3. Click "Join Room"
4. Wait for host to grant editing permissions (if needed)

### Code Collaboration
- **Real-time editing**: Type and see changes instantly
- **Language selection**: Choose from 30+ programming languages
- **Code execution**: Click "Run Code" to execute your program
- **Chat**: Use the sidebar chat for communication

### Permission Management (Host Only)
- **Change user permissions**: Click the settings icon next to user names
- **Promote to editor**: Give users editing rights
- **Demote to viewer**: Remove editing rights

## 🔧 API Endpoints

### Backend API Routes

#### Health Check
```
GET /api/health
```

#### Create Session
```
POST /api/create-session
Body: { "userName": "John Doe" }
```

#### Join Session
```
POST /api/join-session/:code
Body: { "userName": "Jane Doe" }
```

#### Get Room Info
```
GET /api/rooms/:roomId
```

### Socket.IO Events

#### Client to Server
- `joinRoom`: Join a collaboration room
- `codeChange`: Send code changes
- `languageChange`: Change programming language
- `chatMessage`: Send chat message
- `executeCode`: Execute code
- `changePermission`: Change user permissions

#### Server to Client
- `userJoined`: User joined notification
- `userLeft`: User left notification
- `codeChange`: Receive code changes
- `languageChange`: Language changed
- `chatMessage`: Receive chat message
- `executionResult`: Code execution result
- `permissionChanged`: Permission change notification

## 🎨 Customization

### Adding New Languages

Add new languages to the `LANGUAGES` array in `src/pages/Room.tsx`:

```javascript
const LANGUAGES = [
  // ... existing languages
  { value: 'python', label: 'Python', jdoodleId: 'python3' },
  { value: 'newlang', label: 'New Language', jdoodleId: 'jdoodle-id' }
];
```

### Styling Customization

The project uses Tailwind CSS. Customize colors, fonts, and spacing by modifying:
- `tailwind.config.ts`
- `src/index.css`
- Component className props

## 🔒 Security Features

- **Session-based rooms**: Each room is isolated
- **Permission control**: Host manages user permissions
- **Input validation**: All user inputs are validated
- **CORS protection**: Configured for specific origins
- **Rate limiting**: Built-in Socket.IO rate limiting

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Ensure backend server is running
   - Check CORS configuration
   - Verify Socket.IO URL in frontend

2. **Code Execution Fails**
   - Check JDoodle API credentials
   - Verify internet connection
   - Check language support

3. **Permissions Not Working**
   - Ensure user is host
   - Check Socket.IO connection
   - Verify room state

### Debug Mode

Enable debug logging by adding to backend:
```javascript
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('Debug info:', data);
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🙏 Acknowledgments

- **Monaco Editor** for the excellent code editor
- **Socket.IO** for real-time communication
- **JDoodle** for code execution API
- **Shadcn/ui** for beautiful UI components
- **Tailwind CSS** for styling system

---

Built with ❤️ for the coding community

