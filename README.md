# CryptX — Cloud-Based Multi-Format Encryption & Secure Storage Platform

> **Tagline:** *Your Data. Your Keys. Your Privacy.*  
> **Domain:** Cloud Computing &bull; Cybersecurity &bull; Cryptography &bull; Secure File Storage  
> **Project Type:** University Capstone Platform  
> **Current Milestone:** Phase 1 — Professional Frontend Foundation & Architecture Baseline

---

## 1. Overview

**CryptX** is a modern, commercial-grade cybersecurity web platform designed for end-to-end multi-format encryption (text, documents, and images) coupled with secure cloud storage and cryptographic key management.

This repository currently houses the **Phase 1 Frontend Foundation**, establishing the design system, modular architecture, responsive components, and cryptographic product specifications.

---

## 2. Technology Stack

### Frontend (Phase 1)
- **Framework:** React 18 with TypeScript 5
- **Tooling:** Vite 6
- **Styling:** Tailwind CSS 3 with custom cybersecurity color palette
- **Iconography:** Lucide Icons
- **Design Aesthetic:** Enterprise Cybersecurity SaaS (Dark theme with `#080B12`, `#101622`, `#141D2B`, cyan `#00D4FF`, and blue `#3B82F6` accents)

### Architecture Roadmap (Future Phases)
- **Backend:** Python FastAPI (asynchronous REST endpoints & streaming)
- **Database:** PostgreSQL (user credentials, cryptographic metadata, audit logs)
- **Cryptography Engine:** Python `cryptography` library (AES-256-GCM authenticated encryption, SHA-256 integrity digests)
- **Cloud Infrastructure:** Cloud Object Storage (sealed opaque blobs) & Cloud Key Management Service (KMS)

---

## 3. Getting Started

### Prerequisites
Node.js (v20+ or v22 LTS) is required. An isolated Node.js v22.14.0 LTS runtime is pre-provisioned inside `.tools/` for immediate portability.

### Development Server
To launch the Vite development server locally:
```bash
npm run dev
```
By default, the server runs on `http://localhost:3000`.

### Production Build & Type Check
To compile TypeScript and create an optimized production build in `dist/`:
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 4. Architectural Folder Structure

```
cryptx/
├── .tools/                     # Portable Node.js runtime (sandboxed environment)
├── dist/                       # Production build output
├── public/                     # Static public assets
├── src/
│   ├── components/
│   │   ├── layout/             # Global layout (Footer.tsx)
│   │   ├── navigation/         # Header & responsive menus (Navbar.tsx)
│   │   ├── sections/           # Landing page modules:
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HeroVisual.tsx  # Interactive vault & cryptographic stream diagram
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── SecuritySection.tsx
│   │   │   └── AboutSection.tsx
│   │   └── ui/                 # Reusable design system primitives:
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Modal.tsx
│   ├── pages/
│   │   └── LandingPage.tsx     # Master landing page layout & interactive dialogs
│   ├── styles/
│   │   └── index.css           # Tailwind directives & mesh grid overlays
│   ├── types/
│   │   ├── index.ts            # Domain TypeScript interfaces
│   │   └── lucide-react.d.ts   # Icon type definitions
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # React DOM root entrypoint
├── index.html                  # HTML5 template with Inter & JetBrains Mono typography
├── package.json                # Project dependencies & npm scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # CryptX dark theme & color system
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundler configuration
```

---

## 5. Security & Cryptographic Principles

- **Confidentiality:** Authenticated encryption using **AES-256-GCM**.
- **Integrity:** Tamper detection through **SHA-256** checksums and 128-bit GCM authentication tags.
- **Key Isolation:** Master key separation (KEK/DEK envelope encryption model) with zero plaintext key logging.
- **Rigorous Grounding:** Security derived from peer-reviewed cryptographic standards rather than obscurity.
