# CRQ-Rocket 🚀
### The Developer's Change Request & CAB Release Assistant

CRQ-Rocket is a full-stack developer productivity application designed to bridge the gap between fast-moving engineering teams and formal IT Change Advisory Boards (CAB). It transforms raw, informal developer notes, defect identifiers, and technical code snippets into rigorous, enterprise-compliant Change Requests (CRQs), stakeholder broadcast emails, and formal monochrome PDF release dossiers.

---

## 📌 What This App Does

- **Raw Note Professionalization**: Converts rough technical descriptions, commit notes, SQL queries, or JSON payloads into passive-voice, audit-ready engineering documentation using Google Gemini (`gemini-3.8-flash`).
- **Monochrome Enterprise CAB PDF Dossier**: Automatically generates an enterprise-standard, monochrome A4 PDF dossier (via `jsPDF` and `jspdf-autotable`) complete with defect metadata, risk ratings, implementation summaries, test logs, and approval signatures.
- **Stakeholder Email Packaging**: Drafts structured, executive-ready email announcements tailored for release managers, QA leads, and product stakeholders without dumping confusing raw code into the email body.
- **Review & Safety Gate**: Provides an interactive preview screen allowing engineers to inspect, fine-tune, and verify the generated documentation and recipient distribution before anything is sent.
- **Direct Mail & Webmail Launch**: Launches your default email client (`mailto:`) or Gmail Web with recipients, subject, and body pre-filled, while automatically downloading the PDF dossier ready to attach.
- **Developer Identity Profiles**: Stores local engineer identity profiles (Name, Role, and Email) so all generated release requests and sign-offs accurately reflect the author.

---

## 💡 Initial Creation Prompt

The initial prompt that established and guided the development of this application:

```text
Build "CRQ-Rocket: The Developer's Change Request Assistant".
Transform raw technical notes, defect IDs, and code snippets into professional, CAB-ready change requests (CRQs), stakeholder emails, and formal PDF release dossiers.

Core Requirements:
1. Intake Form:
   - Defect Number / Ticket ID (e.g., DEF-702)
   - Change Request Title
   - Raw Fix Notes / Code Snippets / Queries
   - Raw Testing / Validation Notes
   - Target Release Date
   - Assessed Risk Level (Low, Medium, High)
   - Internal Approvers / Peer Reviewers
   - Stakeholder Distribution List (comma-separated emails)

2. AI Professionalizer (via Gemini API):
   - Rewrite rough engineering notes into formal, passive-voice enterprise audit documentation.
   - Preserve technical artifacts (JSON, SQL, function signatures) in clean fenced code blocks.
   - Generate a concise, polished stakeholder email that references the attached PDF rather than pasting raw code blocks into the email.
   - Enforce professional sign-off phrasing ("We look forward to hearing from you as soon as possible.") followed by Submitter Name and Role.

3. CAB PDF Release Dossier:
   - High-fidelity monochrome (black & white) A4 formal document.
   - Include document metadata headers, defect classification, implementation summary, validation records, and formal signature blocks.
   - Support multi-page pagination with running header and footer.

4. Review & Safety Gate:
   - Interactive review screen before dispatch.
   - Editable fields for final sign-off.
   - One-click "Send Test to Me" vs "Send to All Stakeholders".
   - Direct launch of email client (mailto / Gmail) alongside automatic PDF download.
   - Navigation options to return to review and broadcast to full distribution.

5. Clean Google Enterprise Aesthetic:
   - Clean, modern layout inspired by Google Cloud and Google Workspace design guidelines.
   - Responsive design for both desktop and mobile viewports.
```

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with Google-inspired enterprise design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Engine**: [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Backend**: [Express](https://expressjs.com/) with TypeScript execution via [tsx](https://github.com/privatenumber/tsx)
- **AI Engine**: Google Gen AI SDK (`@google/genai`) running `gemini-3.8-flash`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Node.js 20+
- npm or bun

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/crq-rocket.git
cd crq-rocket
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Required for AI-powered note professionalization
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Set a Resend API key for direct transactional email delivery
RESEND_API_KEY=
```

*(Note: If `GEMINI_API_KEY` is not provided, CRQ-Rocket automatically falls back to an intelligent deterministic CAB transformation template so you can continue testing offline).*

### 4. Run the Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
├── server.ts                   # Express server, Gemini API proxy, and email endpoints
├── src/
│   ├── App.tsx                 # Root application state and router
│   ├── components/
│   │   ├── CRQForm.tsx         # Developer input form & templates
│   │   ├── GeneratingState.tsx # Loading animation & stage indicator
│   │   ├── Header.tsx          # Application header & profile trigger
│   │   ├── IdentityModal.tsx   # Developer profile modal
│   │   ├── ReviewSafetyGate.tsx# Stakeholder preview & approval screen
│   │   └── SentConfirmation.tsx# Delivery receipt & email/PDF launcher
│   ├── types/
│   │   └── crq.ts              # TypeScript schemas and models
│   └── utils/
│       └── pdfGenerator.ts     # Monochrome CAB A4 PDF dossier generator
├── metadata.json               # AI Studio project configuration
├── package.json
└── tsconfig.json
```

---

## 📄 License

MIT License. Free for developer and enterprise use.
