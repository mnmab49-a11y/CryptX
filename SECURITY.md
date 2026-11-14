# Security Policy — CryptX

## Supported Versions

| Version | Status |
| :--- | :--- |
| `v1.0.x` (main branch) | ✅ Actively maintained |
| Older branches | ❌ Not supported |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.** Public disclosure before a patch is available could put users at risk.

### How to Report

1. **Email the project maintainer directly:**  
   Please describe the vulnerability in detail — include reproduction steps, affected component (backend / frontend / cryptographic layer), and potential impact.

2. **What to include in your report:**
   - A clear summary of the vulnerability
   - Affected endpoint(s), route(s), or file(s)
   - Steps to reproduce (minimal proof-of-concept if possible)
   - Expected vs. actual behaviour
   - Suggested remediation (optional but appreciated)

3. **Response timeline:**
   - Acknowledgement within **48 hours** of receipt
   - Initial assessment within **5 business days**
   - Patch or remediation plan within **14 days** for confirmed critical findings

---

## Security Architecture Commitments

CryptX was designed with the following security guarantees:

| Commitment | Implementation |
| :--- | :--- |
| **Zero plaintext persistence** | All files and payloads are AES-256-GCM encrypted before disk write |
| **Authenticated encryption** | 128-bit AEAD tag is verified before any plaintext is released |
| **Bit-exact integrity** | SHA-256 checksum stored at encryption time, re-verified at decryption |
| **Envelope key hierarchy** | Per-payload DEKs are wrapped with Master KEK (NIST RFC 3394); raw DEKs are never persisted |
| **Secret enforcement at startup** | Server refuses to start with a JWT secret < 32 characters or a master key ≠ 32 raw bytes |
| **Argon2id password hashing** | OWASP-recommended parameters: `m=65536`, `t=3`, `p=4` |
| **No hardcoded secrets** | All secrets are required environment variables; default fallbacks are forbidden |
| **CORS restricted** | Only the production Vercel domain and allowlisted preview domains are accepted |

---

## Known Security Limitations

These are intentional design decisions or limitations documented for transparency:

1. **Server-managed keys — not client-side zero-knowledge:** The Master KEK is held by the backend server. Decryption occurs server-side during authenticated streaming. This is by design for a university capstone project; production KMS (e.g., AWS KMS, GCP Cloud KMS) integration would be the natural hardening path.

2. **Academic deployment context:** The public deployment at `crypt-x1.vercel.app` and `cryptx-backend.fastapicloud.dev` is a live demonstration environment for a university capstone project. It is not recommended for storing real sensitive data.

3. **SQLite in local development:** The local developer environment uses SQLite. The Docker Compose and production environments use PostgreSQL. SQLite has no row-level security, access control, or network isolation.

---

## Acknowledgements

Responsible disclosure of genuine security findings will be acknowledged in the release notes and README, with the reporter's consent.
