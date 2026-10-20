# ToolCrest Full-Stack Engineering & Optimization Plan

An enterprise-grade overhaul of ToolCrest to implement real client-side PDF cryptographic tools, production Firebase authentication, secure contact message persistence, clean ad network compliance, GitHub Pages SPA routing, and cohesive dark-navy/golden visual architecture.

---

## Architecture & Priority Roadmap

```
+---------------------------------------------------------------------------------+
| ToolCrest Application Layer                                                     |
|                                                                                 |
|  [PDF Cryptographic Engine]        [Firebase Security & DB]   [SEO & Routing]   |
|  - AES-256 / RC4 encrypt/decrypt   - Firebase Email/Pass Auth - GitHub Pages SPA|
|  - Real error catch (no fake win)  - Strict firestore.rules   - Canonical URLs  |
|  - Real coordinate redaction       - Contact messages store   - Clean ads.txt   |
|  - PDF/A-1b ISO OutputIntent       - Admin message inbox      - Per-tool titles |
+---------------------------------------------------------------------------------+
| Design Language: #0B1020 (Canvas) | #111827 (Surface) | #F3B542 (Gold Accent)   |
| Green restricted strictly to success feedback states; zero static pill clutter  |
+---------------------------------------------------------------------------------+
```

---

## User Review Required

> [!IMPORTANT]
> The following architectural decisions incorporate your answered preferences:
> 1. **Admin Authentication**: Converted from hardcoded passcodes to **Firebase Email and Password Authentication** (`signInWithEmailAndPassword`) restricted to authorized administrator accounts.
> 2. **Contact Form**: Form entries are validated, spam-protected with honeypots and rate limiting, persisted into Firestore's `contact_messages` collection, and viewable in the Admin Portal with an optional webhook notification dispatch.
> 3. **Ads.txt**: Stripped the invalid `<script>` HTML tag completely, leaving an authorized seller comment template ready for your publisher ID.
> 4. **PDF Security**: Added `@pdfsmaller/pdf-encrypt` and `@pdfsmaller/pdf-decrypt` to perform real client-side AES-256 / RC4 encryption and decryption, with authentic error reporting when passwords fail.

---

## Proposed Changes

### Priority 1: Real PDF Tools & Verification (Protect, Unlock, Redact, PDF/A)

#### [NEW] Dependencies
- Install `@pdfsmaller/pdf-encrypt` (AES-256 / RC4 PDF encryption with permissions).
- Install `@pdfsmaller/pdf-decrypt` (AES-256 / RC4 PDF decryption with password verification).

#### `src/services/pdfEngine.ts`
- **`encryptPdf(file: File, userPassword: string, ownerPassword?: string, options?: any)`**:
  - Read file buffer and run `encryptPDF` using 256-bit AES standard.
  - Require password length >= 3 characters; throw clear validation errors if blank.
  - Return encrypted `Uint8Array`.
- **`decryptPdf(file: File, password: string)`**:
  - Check `isEncrypted(pdfBytes)`. If not encrypted, return clean copy with informational notice.
  - Call `decryptPDF(pdfBytes, password)`.
  - On wrong password or failure: catch error and throw specific `"Incorrect password. The document could not be decrypted."` error. Never emit false success messages.
- **`redactPdf(file: File, redactions: Array<{ page: number, x: number, y: number, width: number, height: number }>)`**:
  - Support coordinate-based bounding boxes, page selection, and preset zones (header margin, footer margin, sensitive address block).
  - Permanently mask content using PDF stream black rectangles.
- **`pdfToPdfA(file: File)`**:
  - Inject ISO 19005-1b compliance dictionary, OutputIntents (`sRGB IEC61966-2.1`), and XMP metadata with `pdfaid:part="1"` and `pdfaid:conformance="B"`.
  - Save with uncompressed object streams (`useObjectStreams: false`) as required by the PDF/A specification.

#### `src/components/tools/PdfToolView.tsx`
- Replace fake `splitPdf` calls for `protect-pdf` and `unlock-pdf` with genuine `encryptPdf` and `decryptPdf` handlers.
- Add password input fields with toggle visibility, validation feedback, and clear error presentation when an invalid password is provided.
- Provide custom redaction controls (page selector, coordinate/preset box pickers).

---

### Priority 2: Secure Admin Authentication & Strict Firestore Security Rules

#### `src/pages/AdminPage.tsx`
- Remove `DEFAULT_ADMIN_PASSWORD`, `LEGACY_ADMIN_PASSWORD`, and the `handleQuickUnlock` bypass completely.
- Build a secure **Firebase Email & Password login interface** with `signInWithEmailAndPassword`, password masking, and error handling (invalid credentials, user disabled).
- Maintain session state with `onAuthStateChanged(auth)` and enforce authorization checks against `mralexander461@gmail.com` or authorized UID records in Firestore.
- Add a new **"Inquiries & Contact Messages"** management tab where the administrator can review incoming user messages, mark them as read, and delete them.

#### `firestore.rules`
- Maintain public read on `/articles/{articleId}`.
- Restrict article write/update/delete strictly to verified admin (`mralexander461@gmail.com` or `/admins/{uid}`).
- Add rule block for `/contact_messages/{messageId}`:
  - `allow create: if isValidContactMessage(request.resource.data);`
  - `allow read, update, delete: if isAdmin();`
- Enforce schema validation for contact messages: email format, message length (<= 4000 chars), name (<= 120 chars), and honeypot field must be empty.
- Deploy rules to Firebase using `fax.DeployRules`.

---

### Priority 3: Working Contact Form with Validation & Spam Protection

#### `src/services/contactService.ts` [NEW]
- Define `ContactMessage` interface (`id`, `name`, `email`, `category`, `message`, `createdAt`, `read`, `ipCountry`).
- `sendContactMessage(message)`:
  - Validates email regex, non-empty fields, and checks anti-bot honeypot (`botField === ''`).
  - Implements client-side throttling (prevents multiple submissions within 30 seconds).
  - Saves record to Firestore `contact_messages` collection.
  - Dispatches optional webhook/notification payload if configured.

#### `src/pages/ContactUsPage.tsx`
- Connect submission form to `sendContactMessage`.
- Add honeypot field invisible to humans (`tabIndex={-1}`, `aria-hidden="true"`, hidden via CSS).
- Display real success confirmation upon Firestore write success and friendly error messaging if network or validation fails.

---

### Priority 4: Clean `ads.txt` File

#### `public/ads.txt`
- Remove the `<script>` tag and HTML markup.
- Format cleanly with standard IAB comments and authorized seller placeholder:
  ```text
  # ToolCrest Authorized Digital Sellers (ads.txt)
  # Replace with your verified Google AdSense publisher ID once approved:
  # google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
  ```

---

### Priority 5: Technical SEO, Internal Linking & GitHub Pages SPA Routing

#### `public/404.html` & `index.html`
- Implement GitHub Pages single-page redirect handler:
  - In `public/404.html`: lightweight script capturing the path and query, redirecting to `/?p=<path>` without 404 dead ends.
  - In `index.html`: restore deep URL on load using `window.history.replaceState`.
- Update `public/robots.txt`:
  - Ensure `/admin` is disallowed.
  - Reference canonical sitemap `https://toolcrest.site/sitemap.xml`.
- In `src/App.tsx` & `src/utils/seo.ts`:
  - Provide distinct `<title>` and `<meta name="description">` for every tool (e.g. "Merge PDF Online Free — ToolCrest", "Split PDF Pages Privately — ToolCrest", "Generate Wi-Fi & URL QR Codes — ToolCrest").
  - Set canonical link tags dynamically on route change.

---

### Priority 6: Golden & Dark Navy Theme Alignment (#0B1020, #111827, #F3B542)

#### Palette & Styling Uniformity
- **Base Canvas**: `#0B1020`
- **Card Surfaces**: `#111827`
- **Gold Accents**: `#F3B542` (with warm gradient variations `from-[#F3B542] to-yellow-500`)
- **Primary Typography**: `#FFFFFF`
- **Muted Typography / Borders**: `#CBD5E1` & `rgba(243, 181, 66, 0.25)`
- **Color Discipline**:
  - Remove rogue green backgrounds or buttons; green (`text-emerald-400`, `bg-emerald-500/10`) is reserved exclusively for successful operations (e.g., successful download, successful password unlock, contact sent).
  - Eliminate pill badge sandwiches on cards in accordance with the Zero-Pill design constitution, using clean unboxed inline text metadata (`·` separators).
  - Ensure mobile navigation links and buttons have touch targets >= 44px and smooth animations.

---

### Priority 7: Privacy Disclosures, Verification & Testing

#### Privacy & Policies (`src/pages/PrivacyPolicyPage.tsx`, `CookiePolicyPage.tsx`)
- Ensure accurate disclosures:
  - Document that PDF processing executes 100% in local WebAssembly/JavaScript memory without file transmission to remote servers.
  - Accurately describe Google Analytics 4 Consent Mode v2 behavior.
  - Disclose contact message persistence in Firestore for support inquiries.
  - No false claims of features or unauthorized ad trackers.

#### Verification & Live Testing
- **PDF Engine**:
  - Test `protect-pdf` with a sample PDF and password `testSecret123`.
  - Test `unlock-pdf` with `testSecret123` -> verify successful unlocked download.
  - Test `unlock-pdf` with `wrongPassword` -> verify error message displays and no corrupt file is downloaded.
- **Admin Authentication**:
  - Navigate to `/admin`; verify login requires email and password.
  - Test failed login -> verify security error alert.
- **Contact Message Flow**:
  - Submit test inquiry on `/contact-us` -> verify success screen.
  - Check Admin portal messages tab -> verify message is listed.
- **Theme & Responsiveness**:
  - Audit desktop (1440px) and mobile (375px) views for `#0B1020` canvas, `#F3B542` gold accents, and clean typography.
