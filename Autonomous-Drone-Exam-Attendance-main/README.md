# Drone Attend AI - Smart Facial Recognition Attendance System

> A modern, AI-powered facial recognition system for automated attendance tracking using real-time face detection and identification.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🌟 Features

- **Real-Time Face Recognition** - Instant detection and identification of multiple faces simultaneously
- **Smart Attendance Logging** - Automatic attendance tracking with timestamps
- **Dataset Management** - Easy-to-use interface for building and managing facial datasets
- **Multi-Face Detection** - Recognizes multiple people in a single frame
- **Camera Integration** - Live webcam capture and image upload support
- **Authentication System** - Secure login with protected routes
- **Responsive UI** - Modern, mobile-friendly interface built with shadcn/ui
- **Local Storage** - Browser-based data persistence (no backend required)
- **Unknown Face Detection** - Identifies and flags unrecognized individuals

## 🎯 Use Cases

- **Educational Institutions** - Automated student attendance in classrooms
- **Corporate Offices** - Employee attendance and access control
- **Events & Conferences** - Quick participant check-in
- **Security Systems** - Visitor identification and tracking

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+) or Node.js (v18+)
- Modern web browser with webcam support
- Webcam/Camera access

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/drone-attend-ai.git
cd drone-attend-ai
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Start development server**
```bash
bun run dev
# or
npm run dev
```

4. **Open your browser**
```
http://localhost:5173
```

### Default Login Credentials

```
Username: admin
Password: admin
```

## 📖 Usage Guide

### 1. Build Your Facial Dataset

1. Navigate to **"Dataset"** page
2. Enter person's name
3. Choose one method:
   - **Upload Images**: Select multiple photos (JPG/PNG)
   - **Capture from Camera**: Use live webcam to capture faces
4. System automatically extracts and stores facial features
5. Repeat for each person

### 2. Face Recognition

1. Go to **"Face Scan"** page
2. Click **"Start Camera"**
3. Click **"Start Face Scan"**
4. System will:
   - Detect all faces in frame
   - Match against your dataset
   - Display names for recognized faces (GREEN)
   - Show "UNKNOWN" for unrecognized faces (RED)

### 3. View Attendance

1. Navigate to **"Attendance"** page
2. View complete attendance logs
3. Filter by date, name, or status
4. Export data as needed

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 6.0** - Build tool & dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Component library

### AI & Recognition
- **face-api.js** - Facial recognition & detection
- **TensorFlow.js** - Machine learning models

### State & Routing
- **React Router DOM** - Client-side routing
- **TanStack Query** - Data fetching & caching
- **React Hook Form** - Form management

### UI Components
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Recharts** - Data visualization

## 📁 Project Structure

```
drone-attend-ai/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── landing/     # Landing page sections
│   │   ├── layout/      # Layout components (Navbar, Footer)
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   │   ├── Index.tsx    # Landing page
│   │   ├── Login.tsx    # Authentication
│   │   ├── Recognition.tsx   # Face scanning
│   │   ├── FacialDataset.tsx # Dataset management
│   │   └── Attendance.tsx    # Attendance logs
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## 🔧 Available Scripts

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Build for development (with source maps)
bun run build:dev

# Preview production build
bun run preview

# Lint code
bun run lint
```

## 🎨 Features in Detail

### Facial Recognition Engine
- Uses face-api.js for robust face detection
- SSD MobileNetV1 for face detection
- 68-point facial landmark detection
- Face recognition with 128-dimensional descriptors
- Configurable confidence thresholds

### Dataset Management
- Add faces via upload or camera capture
- Store multiple images per person
- Export/import dataset functionality
- Delete and manage entries
- Browser localStorage persistence

### Attendance System
- Automatic timestamp logging
- Status tracking (PRESENT/UNVERIFIED)
- Real-time attendance updates
- Historical data viewing
- Export capabilities

## 🔒 Security & Privacy

- All facial data stored locally in browser
- No external API calls for face recognition
- Data never leaves user's device
- Can be fully offline after initial model download
- Protected routes with authentication

## 🌐 Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Edge 90+ ✅
- Safari 14+ ✅

**Note:** Webcam access required for real-time features.

## 📝 Tips for Best Results

1. **Good Lighting** - Ensure face is well-lit
2. **Multiple Angles** - Upload 3-5 images per person
3. **Clear Images** - Face should occupy 50%+ of frame
4. **Direct Facing** - Front-facing shots work best
5. **No Obstructions** - Avoid hats, sunglasses during enrollment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) - Facial recognition library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning framework

## 📧 Support

For support, email sakthipriyan9144@gmail.com or open an issue in this repository.

## 🚧 Roadmap

- [ ] Backend integration for cloud storage
- [ ] Multiple camera support
- [ ] Advanced analytics dashboard
- [ ] Mobile app version
- [ ] Batch processing of images
- [ ] Integration with HR systems
- [ ] Attendance reports & exports
- [ ] Multi-tenant support

---

**Made with using React, TypeScript, and face-api.js**
