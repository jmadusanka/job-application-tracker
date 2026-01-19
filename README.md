# Job Application Analytics & Feedback System (POC)

A proof-of-concept application for tracking job applications and analyzing resume-job matches with simulated AI-powered insights.

## 🎯 Features

- **Application Management**: Track all your job applications in one place
- **Resume-Job Matching**: View simulated AI analysis of how well your resume matches each job
- **Skill Gap Analysis**: Identify missing skills and requirements
- **ATS Compatibility Check**: Get insights on how ATS-friendly your resume is
- **Improvement Suggestions**: Receive categorized suggestions to improve your resume
- **Professional Dashboard**: Clean, modern interface with intuitive navigation

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd job-application-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### First-Time Login

This is a demo application with simulated authentication. You can log in with **any email and password combination**:

- Email: `demo@example.com` (or any email)
- Password: `password` (or any password)

## 📁 Project Structure

```
job-application-tracker/
├── app/
│   ├── (auth)/
│   │   └── login/              # Login page
│   ├── (dashboard)/
│   │   └── dashboard/          # Main dashboard
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page (redirects to login)
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── layout/                 # Layout components (Sidebar, TopBar)
│   ├── applications/           # Application management components
│   └── analytics/              # Analytics visualization components
├── context/
│   ├── AuthContext.tsx         # Authentication state management
│   └── ApplicationContext.tsx  # Application data management
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   ├── mockData.ts             # Mock data generation
│   └── utils.ts                # Utility functions
└── copilot-instructions.md     # Development guidelines
```

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#1e40af, #3b82f6)
- **Success**: Green (#059669, #10b981)
- **Warning**: Amber (#d97706, #f59e0b)
- **Danger**: Red (#dc2626, #ef4444)
- **Neutral**: Slate grays

### Key Components

- **Cards**: Clean cards with subtle shadows
- **Badges**: Status and priority indicators
- **Progress Bars**: Skill and score visualizations
- **Donut Charts**: Overall match score display

## 📊 How It Works

### 1. Application Tracking

Add new job applications with:
- Job title and company
- Location
- Application channel (LinkedIn, Company Portal, Email)
- Status (Applied, Interview, Offer, Rejected)
- Full job description
- Resume reference

### 2. AI Analysis (Simulated)

The system simulates AI analysis by:
- Extracting skills from job descriptions
- Comparing against a mock resume profile
- Calculating match scores (overall, skills, experience, location)
- Identifying skill gaps
- Detecting ATS compatibility issues
- Generating improvement suggestions

### 3. Analytics Dashboard

View comprehensive insights:
- **Overall Match Score**: 0-100% score with visual indicator
- **Detailed Breakdown**: Skills, experience, and location match
- **Skills Analysis**: Matched vs. missing skills
- **ATS Compatibility**: Score and detected issues
- **Suggestions**: Categorized improvements (Summary, Experience, Skills, Format)

## 🔧 Tech Stack

- **Framework**: Next.js 16.1.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API

## ⚠️ POC Limitations

This is a **proof of concept** with the following limitations:

- ❌ No real backend or database
- ❌ No persistent storage (data resets on page reload)
- ❌ No real AI/NLP analysis (all simulated)
- ❌ No resume parsing from PDF/DOCX files
- ❌ No real authentication (fake login)
- ❌ No multi-user support

## 🎯 Use Cases

This POC demonstrates:

1. **User Experience**: How users would interact with a job tracking system
2. **Data Visualization**: Effective ways to present complex analytics
3. **UI/UX Patterns**: Professional design patterns for business applications
4. **Concept Validation**: Proof that the idea is viable and user-friendly

## 🚦 Next Steps (Post-POC)

If approved for full development:

1. **Backend Development**
   - REST API or GraphQL
   - Database (PostgreSQL)
   - Real authentication (JWT, OAuth)

2. **AI Integration**
   - Real NLP for skill extraction
   - Resume parsing (PDF/DOCX)
   - ATS compatibility checking
   - LLM-powered suggestions

3. **Additional Features**
   - Email tracking
   - Chrome extension for job scraping
   - Calendar integration
   - Analytics and reporting
   - Export functionality

## 📝 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding Mock Applications

Mock applications are generated in `lib/mockData.ts`. To modify:

1. Edit the `generateMockApplications()` function
2. Add more job descriptions with varied skills
3. Adjust score calculation logic in `generateAnalysis()`

### Customizing UI

- Colors: Update in component files and `app/globals.css`
- Layout: Modify components in `components/layout/`
- Dashboard: Adjust grid layout in `app/(dashboard)/dashboard/page.tsx`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author

Built as a proof of concept for demonstrating job application tracking and analytics functionality.

---

**Note**: This is a demo application with simulated AI features. All analysis results are generated using mock logic and do not represent actual AI/ML predictions.
