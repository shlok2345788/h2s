# AI Question Difficulty & Quality Analyzer

A premium, animated web application that analyzes questions for difficulty level, quality score, and potential issues using AI-powered analysis.

## 🚀 Features

### Landing Page
- **Hero Section** with animated gradient orbs and floating elements
- **Problem Section** highlighting key pain points
- **How It Works** flow visualization with 4 steps
- Premium animations using Framer Motion

### Analyzer
- **Real-time Analysis** of single or multiple questions
- **Difficulty Rating**: Easy, Medium, Hard
- **Quality Score**: 0-100 with animated progress bar
- **Issue Flags**: Ambiguous, Too Broad, Needs Context, etc.
- **Keyword Detection**: Automatically highlights key technical concepts

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Express** with TypeScript
- **CORS** enabled
- **Mock AI Analysis** (ready for ML integration)

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup

1. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Environment Setup**

Frontend: Copy `.env.example` to `.env`
```bash
cd frontend
cp .env.example .env
```

Backend: Copy `.env.example` to `.env`
```bash
cd backend
cp .env.example .env
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

## 📖 Usage

1. Navigate to http://localhost:5173
2. Click "Try Demo" or navigate to the Analyzer page
3. Enter questions (one per line or separated by blank lines)
4. Click "Analyze Questions"
5. View results with:
   - Difficulty badges
   - Quality scores with animated progress bars
   - Issue flags
   - Detected keywords

### Example Questions

```
What is the time complexity of quicksort in the worst case?

Explain the concept of virtual DOM in React and how it improves performance.

Write a function to reverse a linked list.
```

## 🎨 Features Breakdown

### 1. Landing Page Components
- **HeroSection**: Animated title, CTA buttons, floating gradient orb
- **ProblemSection**: 3 problem cards with hover animations
- **HowItWorks**: 4-step flow with icons and glow effects

### 2. Analyzer Page Components
- **QuestionInput**: Textarea with example loader
- **ResultCard**: Displays analysis results
- **DifficultyBadge**: Color-coded difficulty indicator
- **QualityScore**: Animated progress bar (0-100)
- **FlagList**: Issue flags with icons

### 3. Mock Analysis Logic
The backend provides realistic mock analysis based on:
- Word count
- Question structure
- Technical terminology
- Complexity indicators

Ready for ML model integration!

## 🔧 API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Analyze Questions
```
POST http://localhost:5000/api/analyze
Content-Type: application/json

{
  "questions": [
    "What is recursion?",
    "Explain binary search algorithm"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "question": "What is recursion?",
      "difficulty": "Easy",
      "qualityScore": 75,
      "flags": ["Needs Context: Add more specific details"],
      "keywords": ["recursion"]
    }
  ],
  "count": 1
}
```

## 🎯 Project Structure

```
h2s/
├── .github/
│   └── copilot-instructions.md
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── api/              # API client
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   └── index.ts          # Express server
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🎨 Design Features

- **Dark Theme**: Premium dark mode with gradient accents
- **Glass Morphism**: Frosted glass effects on cards
- **Smooth Animations**: Fade-ins, slide-ins, hover effects
- **Gradient Text**: Eye-catching gradient text for headings
- **Responsive Design**: Mobile-first approach

## 🚧 Future Enhancements

- [ ] Integrate real ML model for analysis
- [ ] Add user authentication
- [ ] Save analysis history
- [ ] Export reports to PDF
- [ ] Batch upload via CSV/Excel
- [ ] API key management
- [ ] Analytics dashboard
- [ ] Multi-language support

## 📝 License

MIT License - feel free to use this project for your portfolio or production!

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for a premium user experience.

---

**Made with ❤️ for better question assessment**
