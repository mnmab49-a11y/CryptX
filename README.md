# CryptX — Cloud-Based Multi-Format Encryption & Secure Storage Platform

<div align="center">

![CryptX Banner](https://img.shields.io/badge/CryptX-Cloud--Native%20Security-00D4FF?style=for-the-badge&logo=shield&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.12%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-38%2F38%20Passing-brightgreen?style=for-the-badge&logo=pytest&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production%20Ready-00E599?style=for-the-badge)

**Your Data. Your Keys. Your Privacy.**

*An enterprise-grade, cloud-native cryptographic platform delivering authenticated multi-format encryption (Text, Documents, Images), envelope key hierarchy (KEK/DEK), and immutable audit telemetry — built as a university capstone project in Cloud Computing & Cybersecurity.*

[🚀 Live Frontend Console](https://crypt-x1.vercel.app) &bull; [⚡ FastAPI Backend](https://cryptx-backend.fastapicloud.dev) &bull; [📖 Interactive API Docs (Swagger)](https://cryptx-backend.fastapicloud.dev/docs)

</div>

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Platform Architecture & Cryptographic Blueprint](#2-platform-architecture--cryptographic-blueprint)
- [3. Core Features & Capabilities](#3-core-features--capabilities)
- [4. Technology Stack](#4-technology-stack)
- [5. Repository File Structure](#5-repository-file-structure)
- [6. Cryptographic Specifications & Key Hierarchy](#6-cryptographic-specifications--key-hierarchy)
- [7. Environment Variables Reference](#7-environment-variables-reference)
- [8. REST API Documentation & Reference](#8-rest-api-documentation--reference)
- [9. Local Development & Deployment Guide](#9-local-development--deployment-guide)
  - [Option A: Docker Compose (Full-Stack)](#option-a-docker-compose-full-stack)
  - [Option B: Manual Setup (Frontend + Backend)](#option-b-manual-setup-frontend--backend)
  - [Option C: Deploy Frontend to Vercel](#option-c-deploy-frontend-to-vercel)
- [10. Automated Verification & Testing](#10-automated-verification--testing)
- [11. Security Baseline & Transparency Disclosures](#11-security-baseline--transparency-disclosures)
- [12. Contributing](#12-contributing)
- [13. License & Academic Attribution](#13-license--academic-attribution)

---

## 1. Executive Summary

**CryptX** is an end-to-end cloud platform engineered to solve the persistent vulnerabilities of plaintext data storage in multi-tenant cloud environments. Designed from the ground up for bit-exact confidentiality and tamper detection, CryptX guarantees that user payloads—whether sensitive text snippets, financial documents, or medical images—are never written to disk in unsealed forms.

### Primary Objectives
- **Zero-Plaintext Storage:** All files are immediately transformed into AES-256-GCM authenticated cipher streams before persistence.
- **Envelope Encryption Hierarchy:** Decouples per-file Data Encryption Keys (DEKs) from the server-managed Key Encryption Key (KEK) using NIST RFC 3394 Key Wrap.
- **Bit-Exact Lossless Preservation:** Guarantees 100% byte-for-byte fidelity for binary media (PNG, JPEG, WEBP, BMP) validated via pre/post SHA-256 integrity digests.
- **Immutable Forensic Telemetry:** Every cryptographic transaction (encrypt, decrypt, key wrap, deletion) generates an authenticated audit ledger record.

---

## 2. Platform Architecture & Cryptographic Blueprint

CryptX utilizes an **Envelope Encryption** architecture. Every file or payload generates an ephemeral, unique 256-bit Data Encryption Key (DEK). The payload is encrypted with hardware/software AES-GCM, and the DEK is wrapped using the server Master Key Encryption Key (KEK).

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated Client
    participant Frontend as CryptX React App (Vercel)
    participant API as FastAPI Backend
    participant Engine as Cryptography Engine (AES-256-GCM)
    participant Storage as Object Storage (Uploads)
    participant DB as PostgreSQL / SQLite Database

    Note over User,DB: Encrypt & Store Workflow
    User->>Frontend: Select File/Image (e.g. report.pdf, scan.png)
    Frontend->>API: POST /api/v1/crypto/files/encrypt (Multipart Form + JWT)
    API->>Engine: Stream file contents (up to 50MB)
    Engine->>Engine: 1. Generate unique 256-bit DEK & 96-bit Nonce
    Engine->>Engine: 2. Encrypt bytes -> Ciphertext + 128-bit Tag
    Engine->>Engine: 3. Wrap DEK with Server Master KEK (RFC 3394)
    Engine->>Engine: 4. Compute SHA-256 checksum of original bytes
    Engine->>Storage: Save opaque ciphertext (.bin)
    Engine->>DB: Store metadata (Nonce, Tag, Wrapped DEK, SHA-256)
    API->>DB: Log operation to Activity Audit Ledger
    API-->>Frontend: Return FileMetadataResponse (HTTP 201 Created)
    Frontend-->>User: Display Vault registration with SHA-256 & AEAD Tag

    Note over User,DB: Decrypt & Stream Workflow
    User->>Frontend: Click "Decrypt & Download"
    Frontend->>API: POST /api/v1/crypto/files/{id}/decrypt (Bearer JWT)
    API->>DB: Verify file ownership & load metadata
    API->>Storage: Read raw ciphertext bytes
    API->>Engine: 1. Unwrap DEK using Master KEK
    API->>Engine: 2. Authenticate & Decrypt (Nonce, Tag, DEK)
    API->>Engine: 3. Verify SHA-256 digest against DB record
    API-->>Frontend: Stream original plaintext with Content-Disposition
    Frontend-->>User: Browser downloads bit-exact original file
```

---

## 3. Core Features & Capabilities

### 🔒 1. Multi-Format Authenticated Encryption & Steganography
- **Multi-Algorithm Text Encryption:** Encrypt API keys, passwords, SQL connection strings, and tokens using **AES-256-GCM**, **ChaCha20-Poly1305**, or **AES-256-CBC + HMAC-SHA256**. Supports custom passphrase key derivation via PBKDF2-HMAC-SHA256 with 600,000 rounds and random salt.
- **Steganographic Carrier Badges for Files:** Secure documents, archives, and arbitrary files up to **50 MB**. Payloads are encrypted and encapsulated inside a visually rendered security badge PNG carrier (`.carrier.png`). Uploading the carrier image recovers the exact original document.
- **Decoy Cover Steganography for Images:** Encrypt photos using three decoy visual styles (**Scenic twilight**, **Cyber synthwave neon**, or **Cipher static noise**). The encrypted file downloads looking like a completely different, legitimate picture. Decrypting the decoy restores the original image byte-for-byte losslessly.
- **Lossless Byte Preservation:** 100% byte-exact fidelity for binary media (PNG, JPEG, WEBP, BMP) validated via SHA-256 cryptographic digests before and after encryption.

### 🎨 2. Immersive Cyber UI & Visual Engine
- **Dynamic Binary Matrix Canvas:** Falling vertical columns of binary code (`0` and `1`) with glowing neon heads, floating 01/hex packets, and mouse-interactive constellation particles.
- **Laser Scanner Previews:** Animated laser inspection sweep across encrypted carrier files and decoy images.
- **Responsive Dark Theme:** Engineered with Tailwind CSS, glowing neon accents, and full accessibility across mobile and desktop.

### 🛡️ 2. Vault Registry & Object Management
- **Bit-Exact Integrity Auditing:** Instant inspection of 128-bit AEAD tags and SHA-256 bit digests.
- **Cryptographic Metadata Inspector:** View stored internal names, nonce vectors, file size comparisons (plaintext vs ciphertext overhead), and timestamps.
- **Instant Decryption:** Authenticated tag verification before decryption stream execution.
- **Permanent Purge:** Complete server-side cryptographic erasure (removes ciphertext from disk and purges metadata from the database).

### 📊 3. Real-Time Telemetry & Audit Ledger
- **Storage Allocation:** Dynamically computes live ciphertext usage across Images, Documents, and Payloads.
- **Forensic Activity History:** Immutable tracking of user actions (`REGISTER`, `LOGIN`, `ENCRYPT_FILE`, `DECRYPT_FILE`, `DELETE_FILE`, `UPDATE_PROFILE`, `CHANGE_PASSWORD`).
- **Live Search & Filter:** Filter activity logs and vault objects by category, date, or SHA-256 hash.

### 🔑 4. Identity & Key Security
- **Argon2id Password Hashing:** Implemented with OWASP recommended hardening parameters ($m=65536$, $t=3$, $p=4$).
- **Cryptographic Session Tokens:** Standard HMAC-SHA256 JWT tokens with 24-hour expiration and strict Bearer authentication.
- **Route Guards:** Client-side protected route boundaries safeguarding authenticated views against unauthenticated session state.

---

## 4. Technology Stack

| Layer | Technologies & Specifications |
| :--- | :--- |
| **Frontend Framework** | React 18 &bull; TypeScript 5.7 &bull; Vite 6.0 |
| **Styling & Design System** | Tailwind CSS 3.4 &bull; Lucide React Icons &bull; Dark Cybersecurity Palette (`#080B12`, `#101622`, `#00D4FF`) |
| **Backend Framework** | Python 3.12+ / 3.14 &bull; FastAPI &bull; Starlette &bull; Pydantic v2 (Settings) |
| **Cryptographic Engine** | Python `cryptography` library &bull; `AESGCM` (NIST SP 800-38D) &bull; RFC 3394 AES Key Wrap |
| **Password Security** | Argon2id (`pwdlib[argon2]`) &bull; Cryptographic Salts &bull; Timing-attack safe comparisons |
| **Database & ORM** | SQLAlchemy 2.0 &bull; PostgreSQL 16 (Production) &bull; SQLite (Local Development) &bull; Alembic |
| **Production Hosting** | Frontend: Vercel (`crypt-x1`) &bull; Backend: FastAPI Cloud (`fastapicloud.dev`) |
| **Containerization** | Docker &bull; Docker Compose &bull; Multi-stage builds |

---

## 5. Repository File Structure

```
cryptx/
├── backend/                        # Python FastAPI Backend
│   ├── alembic/                    # Database migration versioning scripts
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py             # Dependency injection (get_db, get_current_user)
│   │   │   └── routes/             # REST API routers
│   │   │       ├── auth.py         # Registration, Login, Token generation
│   │   │       ├── users.py        # Profile & Password management
│   │   │       ├── crypto.py       # Text & File encrypt/decrypt endpoints
│   │   │       ├── vault.py        # Vault listing, details, summary & delete
│   │   │       └── activity.py     # Forensic audit trail queries
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic Settings with strict key validators
│   │   │   ├── database.py         # SQLAlchemy engine & session factory
│   │   │   └── security.py         # Argon2id hashing, JWT, NIST Key Wrap
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── user.py             # User accounts schema
│   │   │   ├── encrypted_file.py   # Encrypted files & cryptographic metadata
│   │   │   └── activity.py         # Immutable audit records schema
│   │   ├── schemas/                # Pydantic v2 request & response contracts
│   │   │   ├── auth.py             # Login, Register, Token schemas
│   │   │   ├── user.py             # User profile schemas
│   │   │   ├── crypto.py           # Encrypt/Decrypt payloads
│   │   │   └── vault.py            # File metadata & summary schemas
│   │   ├── services/               # Core business & crypto logic
│   │   │   ├── crypto_service.py   # AES-256-GCM AEAD & Key Wrap operations
│   │   │   ├── storage_service.py  # Binary ciphertext disk persistence
│   │   │   ├── auth_service.py     # Credential authentication logic
│   │   │   └── activity_service.py # Audit trail logging logic
│   │   └── main.py                 # FastAPI application root & CORS configuration
│   ├── storage/uploads/            # Opaque ciphertext storage repository
│   ├── tests/                      # Pytest automated test suite (31 tests)
│   │   ├── conftest.py             # Test fixtures, TestClient, test DB setup
│   │   ├── test_auth.py            # Authentication & JWT security tests
│   │   ├── test_config_security.py # Key validation & security setting tests
│   │   ├── test_cors.py            # CORS preflight & origin regex tests
│   │   ├── test_crypto.py          # AEAD encrypt/decrypt & tamper tests
│   │   ├── test_image_encryption.py# Lossless PNG, JPG, WEBP, BMP tests
│   │   └── test_vault.py           # Vault isolation, summary & delete tests
│   ├── Dockerfile                  # Production container definition
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Backend environment configuration template
│
├── src/                            # React 18 TypeScript Frontend
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx  # Authentication route guard
│   │   ├── dashboard/
│   │   │   └── DashboardLayout.tsx # Responsive navigation drawer & layout
│   │   ├── layout/
│   │   │   └── Footer.tsx          # Marketing footer
│   │   ├── navigation/
│   │   │   └── Navbar.tsx          # Dynamic navigation with live session state
│   │   ├── sections/               # Landing page modules
│   │   └── ui/                     # Primitives (Button, Card, Modal, Input, Badge)
│   ├── context/
│   │   └── AuthContext.tsx         # Global session state & 401 broadcast listeners
│   ├── pages/
│   │   ├── LandingPage.tsx         # CryptX product presentation
│   │   ├── LoginPage.tsx           # Authentication sign-in form
│   │   ├── RegisterPage.tsx        # Profile establishment with validation
│   │   └── dashboard/              # Authenticated dashboard views
│   │       ├── OverviewPage.tsx    # Live vault telemetry & breakdown
│   │       ├── EncryptTextPage.tsx # Text encryption / decryption console
│   │       ├── EncryptFilesPage.tsx# Arbitrary document encryption console
│   │       ├── EncryptImagesPage.tsx# Lossless image encryption console
│   │       ├── VaultPage.tsx       # Searchable vault registry & metadata modal
│   │       ├── ActivityPage.tsx    # Cryptographic audit trail ledger
│   │       ├── KeysPage.tsx        # KEK / DEK envelope hierarchy visualizer
│   │       └── SettingsPage.tsx    # Profile & password management
│   ├── services/
│   │   └── api.ts                  # Hardened API client with URL validator & error parser
│   ├── router/                     # Lightweight SPA client-side routing
│   ├── App.tsx                     # Top-level routing switch & route guarding
│   └── main.tsx                    # React application entrypoint
│
├── docker-compose.yml              # Multi-container orchestration (FastAPI + PostgreSQL)
├── vercel.json                     # Vercel deployment configuration & SPA rewrites
├── vite.config.ts                  # Vite build tooling configuration
├── tailwind.config.js              # CryptX cybersecurity dark theme tokens
├── package.json                    # Frontend dependencies & scripts
└── .env.example                    # Global environment configuration template
```

---

## 6. Cryptographic Specifications & Key Hierarchy

| Cryptographic Primitive | Implementation Standard | Parameter / Setting | Purpose |
| :--- | :--- | :--- | :--- |
| **Payload Cipher** | AES-256-GCM (AEAD) | 256-bit Key, 96-bit Random Nonce, 128-bit Tag | Data confidentiality and integrity verification. |
| **Key Wrapping** | NIST RFC 3394 Key Wrap | AES-256 Key Wrap | Wraps per-payload DEK with Server Master KEK. |
| **Password Hashing** | Argon2id | Memory: 64 MB, Iterations: 3, Parallelism: 4 | Resistant to GPU brute-force and side-channel attacks. |
| **Session Authentication** | JWT (JSON Web Token) | HMAC-SHA256 (HS256), 24h Expiration | Stateless, cryptographically signed API authorization. |
| **Integrity Digest** | SHA-256 | Bit-exact 256-bit cryptographic hash | Bit-for-bit tamper detection before and after decryption. |

### Envelope Encryption Flow
$$\text{Payload} \xrightarrow{\text{AES-256-GCM}(\text{DEK}, \text{Nonce})} \text{Ciphertext} + \text{Tag}$$
$$\text{DEK} \xrightarrow{\text{RFC 3394 Wrap}(\text{Master KEK})} \text{Wrapped DEK}$$

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Type | Description |
| :--- | :---: | :--- | :--- |
| `JWT_SECRET_KEY` | ✅ | String ≥ 32 chars | HMAC-SHA256 signing key for JWT tokens. Never use a default value in production. |
| `CRYPTX_MASTER_KEY` | ✅ | Base64 string → 32 bytes | Server Master KEK used to wrap per-file DEKs (RFC 3394). Must decode to exactly 256 bits. |
| `DATABASE_URL` | ✅ | SQLAlchemy DSN | PostgreSQL: `postgresql+psycopg2://user:pass@host/db`  •  SQLite: `sqlite:///./cryptx.db` |
| `CORS_ORIGINS` | Optional | JSON array | Additional allowed origins beyond the production Vercel domain. |
| `UPLOAD_DIR` | Optional | Path string | Directory for opaque ciphertext blobs. Defaults to `./storage/uploads`. |
| `MAX_FILE_SIZE_MB` | Optional | Integer | Per-upload size cap in megabytes. Defaults to `50`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional | Integer | JWT expiration window. Defaults to `1440` (24 hours). |
| `ALGORITHM` | Optional | String | JWT signing algorithm. Defaults to `HS256`. |

**Generate a secure Master KEK:**
```bash
python -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())"
```

**Generate a secure JWT secret:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Frontend (`.env` / `.env.production`)

| Variable | Required | Type | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | ✅ | URL string | Full backend URL. Local: `http://127.0.0.1:8000`  •  Production: `https://cryptx-backend.fastapicloud.dev` |

> **Security Note:** Never commit `.env` or `.env.production` to version control. Both files are listed in `.gitignore`. Use `.env.example` files as reference templates.

---

## 8. REST API Documentation & Reference

The FastAPI backend provides automated, interactive documentation accessible at `/docs` (Swagger UI) and `/redoc` (ReDoc).

### Endpoints Overview

| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Service health status & cipher engine check | No |
| `POST` | `/api/v1/auth/register` | Register new user profile | No |
| `POST` | `/api/v1/auth/login` | Authenticate credentials & return JWT | No |
| `GET` | `/api/v1/auth/me` | Fetch active user identity | **Yes** |
| `PUT` | `/api/v1/users/me` | Update user profile information | **Yes** |
| `POST` | `/api/v1/users/me/change-password` | Update account password (Argon2id) | **Yes** |
| `POST` | `/api/v1/crypto/text/encrypt` | Encrypt plaintext string | **Yes** |
| `POST` | `/api/v1/crypto/text/decrypt` | Decrypt and verify ciphertext payload | **Yes** |
| `POST` | `/api/v1/crypto/files/encrypt` | Upload and encrypt arbitrary file/image | **Yes** |
| `POST` | `/api/v1/crypto/files/{id}/decrypt` | Decrypt and download verified plaintext stream | **Yes** |
| `GET` | `/api/v1/vault/files` | Search & list user's encrypted vault files | **Yes** |
| `GET` | `/api/v1/vault/files/{id}` | Retrieve individual file cryptographic metadata | **Yes** |
| `DELETE` | `/api/v1/vault/files/{id}` | Permanently delete ciphertext and metadata | **Yes** |
| `GET` | `/api/v1/vault/summary` | Telemetry: total files, bytes, ops, recent files | **Yes** |
| `GET` | `/api/v1/activity` | Paginated forensic activity audit ledger | **Yes** |

---

## 9. Local Development & Deployment Guide

### Prerequisites
- **Node.js:** v20+ or v22 LTS (a portable Node.js runtime is pre-bundled in `.tools/` if needed)
- **Python:** v3.12 or newer
- **Docker & Docker Compose** (Optional, for containerized PostgreSQL environment)

---

### Option A: Docker Compose (Full-Stack)

The fastest method to spin up PostgreSQL and the FastAPI backend locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mnmab49-a11y/CryptX.git
   cd CryptX
   ```

2. **Configure root environment file:**
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure your `JWT_SECRET_KEY` (≥ 32 chars) and `CRYPTX_MASTER_KEY` (Base64 32-byte key).*

   Generate a valid 32-byte Base64 key:
   ```bash
   python -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())"
   ```

3. **Start PostgreSQL & FastAPI services:**
   ```bash
   docker-compose up -d --build
   ```

4. **Launch the frontend development server:**
   ```bash
   npm install
   npm run dev
   ```

---

### Option B: Manual Setup (Frontend + Backend)

#### 1. Backend Setup (FastAPI)
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your secrets

# Start development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will be available at `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).

#### 2. Frontend Setup (React + Vite)
In a new terminal window at repository root:
```bash
# Configure local frontend API target
echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### Option C: Deploy Frontend to Vercel

This is the recommended method for public deployments of the React frontend.

#### Prerequisites
- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- The FastAPI backend already deployed and accessible at a public HTTPS URL

#### Steps

1. **Fork or push** this repository to your GitHub account.

2. **Import the project into Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Select the `CryptX` GitHub repository
   - Set **Framework Preset** to `Vite`
   - Set **Root Directory** to `.` (repository root)

3. **Configure the required environment variable:**

   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://your-deployed-backend.fastapicloud.dev` |

   This tells the React app where to send API requests. Without this, the frontend will fail to authenticate.

4. **Deploy** — Vercel will run `npm run build` automatically and publish the `dist/` output.

5. **Verify CORS on the backend:** Ensure your backend's `CORS_ORIGINS` environment variable includes the Vercel deployment URL (e.g., `https://your-project.vercel.app`).

> **Note:** The `vercel.json` file at repository root configures SPA client-side routing rewrite rules so that deep links (e.g., `/dashboard/vault`) resolve correctly without 404s.

---

## 10. Automated Verification & Testing

CryptX includes a comprehensive automated test suite covering authentication, configuration validators, CORS origins, cryptographic roundtrips, and vault isolation.

### Run Backend Tests (Pytest)
```bash
backend/.venv/Scripts/python.exe -m pytest backend/tests -v
```
**Test Results (100% Pass Rate):**
```
backend/tests/test_auth.py::test_register_success PASSED
backend/tests/test_auth.py::test_register_duplicate_email PASSED
backend/tests/test_auth.py::test_login_success PASSED
backend/tests/test_auth.py::test_login_invalid_password PASSED
backend/tests/test_auth.py::test_me_unauthorized PASSED
backend/tests/test_auth.py::test_me_authorized PASSED
backend/tests/test_config_security.py::test_config_rejects_missing_jwt_secret PASSED
backend/tests/test_config_security.py::test_config_rejects_short_jwt_secret PASSED
backend/tests/test_config_security.py::test_config_rejects_missing_master_key PASSED
backend/tests/test_config_security.py::test_config_rejects_invalid_base64_master_key PASSED
backend/tests/test_config_security.py::test_config_rejects_non_32_byte_master_key PASSED
backend/tests/test_config_security.py::test_config_valid_keys_succeed PASSED
backend/tests/test_config_security.py::test_get_master_key_returns_32_bytes PASSED
backend/tests/test_cors.py::test_cors_preflight_vercel_origin PASSED
backend/tests/test_cors.py::test_cors_preflight_vercel_preview_regex PASSED
backend/tests/test_cors.py::test_cors_disallowed_origin PASSED
backend/tests/test_crypto.py::test_crypto_service_direct_roundtrip PASSED
backend/tests/test_crypto.py::test_crypto_service_tampered_tag PASSED
backend/tests/test_crypto.py::test_crypto_service_tampered_ciphertext PASSED
backend/tests/test_crypto.py::test_crypto_api_text_roundtrip PASSED
backend/tests/test_crypto.py::test_crypto_api_text_decrypt_tampered_payload PASSED
backend/tests/test_crypto.py::test_crypto_text_chacha20_roundtrip PASSED
backend/tests/test_crypto.py::test_crypto_text_aes_cbc_roundtrip PASSED
backend/tests/test_crypto.py::test_crypto_text_custom_key_roundtrip PASSED
backend/tests/test_crypto.py::test_carrier_image_download_and_decrypt_flow PASSED
backend/tests/test_crypto.py::test_image_decoy_cover_scenic_and_cyber_roundtrip PASSED
backend/tests/test_crypto.py::test_crypto_service_aad_tamper_fails PASSED
backend/tests/test_image_encryption.py::test_image_png_encryption_roundtrip PASSED
backend/tests/test_image_encryption.py::test_image_jpeg_encryption_roundtrip PASSED
backend/tests/test_image_encryption.py::test_image_webp_encryption_roundtrip PASSED
backend/tests/test_image_encryption.py::test_image_bmp_encryption_roundtrip PASSED
backend/tests/test_image_encryption.py::test_image_encryption_unauthenticated_rejection PASSED
backend/tests/test_image_encryption.py::test_image_encryption_size_limit_enforced PASSED
backend/tests/test_vault.py::test_file_encrypt_decrypt_roundtrip PASSED
backend/tests/test_vault.py::test_image_encrypt_byte_exact_preservation PASSED
backend/tests/test_vault.py::test_user_vault_isolation PASSED
backend/tests/test_vault.py::test_vault_summary_and_delete PASSED

======================== 38 passed, 2 warnings in 2.88s ========================
```

### Run Frontend Production Build & Typecheck
```bash
npm run build
```
Executes `tsc -b && vite build` ensuring 0 TypeScript errors and generating the optimized bundle in `dist/`.

---

## 11. Security Baseline & Transparency Disclosures

In accordance with rigorous cryptographic engineering principles:
1. **Server-Managed Key Hierarchy:** CryptX operates a **Server-Managed Envelope Encryption** architecture. The Master KEK is securely held by the server infrastructure (via environment secret or cloud KMS). CryptX does **not** claim client-side zero-knowledge isolation; keys are unwrapped in-memory on the backend server solely during authenticated decryption streaming.
2. **Authenticated Cipher Streams:** AES-256-GCM is an AEAD (Authenticated Encryption with Associated Data) mode. Any bit-flip or corruption in either the ciphertext, nonce, or tag results in an immediate `CryptographicIntegrityError`, preventing plaintext leakage.
3. **Strict Secret Enforcement:** The backend rejects startup if `JWT_SECRET_KEY` is shorter than 32 characters or if `CRYPTX_MASTER_KEY` does not decode to exactly 32 raw bytes (256 bits). Hardcoded default secrets are strictly prohibited.

---

## 12. Contributing

Contributions, bug reports, and feature suggestions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the full guidelines.

For security vulnerabilities, see [SECURITY.md](SECURITY.md) — do **not** open a public issue.

---

## 13. License & Academic Attribution

Distributed under the **MIT License**.

- **Project Lead:** Mina Amjad
- **Repository:** [https://github.com/mnmab49-a11y/CryptX](https://github.com/mnmab49-a11y/CryptX)
- **Domain:** Cloud Computing & Cybersecurity Capstone Project (2026)
- **Institutional Context:** University Engineering Graduation Project
