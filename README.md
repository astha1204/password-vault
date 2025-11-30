# 🔐 Password Generator + Secure Vault

A privacy-first password manager built with **Next.js**, **TypeScript**, and **MongoDB**.  
Generate strong passwords, store them securely in an encrypted vault, and manage credentials with a clean, intuitive interface.

---

## 🌐 Live Demo  
👉 [Live Application](https://password-vault-git-main-hemant-singh-rawats-projects.vercel.app)

---

## 🧑‍💻 Project Overview

This project was developed as part of an internship assignment for  
**[Web Development Company - Top](https://in.linkedin.com/company/web-development-company-top)**  
**Founder:** [Setu Agrawal](https://in.linkedin.com/in/setu-agrawal-1032681aa)

---

## 🎯 Goal

Build a simple, secure web application where users can:
- ✅ Generate cryptographically strong passwords  
- ✅ Save credentials to a **personal encrypted vault**  
- ✅ View, edit, and delete entries through an intuitive dashboard  
- ✅ Maintain **speed, minimalism, and privacy-first design**

---

## 🚀 Features

### **Core Features**
- 🧠 **Advanced Password Generator**  
  - Adjustable length (8-64 characters)
  - Customizable character sets (lowercase, uppercase, numbers, symbols)
  - Optional exclusion of look-alike characters (l, I, 1, O, 0, o)
  - Cryptographically secure random generation using Web Crypto API

- 🔒 **Encrypted Vault Storage**  
  - Store entries with title, username, password, URL, and notes
  - Full CRUD operations (Create, Read, Update, Delete)
  - Real-time search and filtering
  - Client-side encryption—**no plaintext data ever stored or transmitted**

- 🔐 **Secure Authentication**  
  - Email and password-based registration and login
  - JWT-based session management with NextAuth.js
  - Secure password hashing with bcrypt

- 📋 **Smart Clipboard Management**  
  - One-click password copying
  - Auto-clear from clipboard after 15 seconds for security
  - Visual feedback for copy operations

- 🔍 **Search and Filter**  
  - Instantly search vault entries by title or username
  - Real-time filtering without page reloads

---

### **Enhanced Features**
- 🔑 **Two-Factor Authentication (2FA)**  
  - TOTP-based authentication using authenticator apps
  - QR code generation for easy setup
  - Backup codes for account recovery

- 🌙 **Dark Mode Support**  
  - System-aware theme switching
  - Manual dark/light mode toggle
  - Persistent theme preference

- 📱 **Responsive Design**  
  - Mobile-first approach
  - Optimized for all screen sizes
  - Touch-friendly interface

- 📊 **Account Management**  
  - User profile settings
  - Password change functionality
  - 2FA enable/disable controls

---

## 🧠 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | Next.js 15.5.4 (Pages Router) + TypeScript |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB with Mongoose ODM |
| **Encryption** | Web Crypto API (AES-GCM + PBKDF2) |
| **Authentication** | NextAuth.js + JWT |
| **UI Framework** | Tailwind CSS |
| **Component Library** | shadcn/ui |
| **Icons** | Lucide React |
| **Notifications** | Sonner (Toast system) |
| **2FA** | Speakeasy (TOTP) + QRCode |

---

## 🧩 Project Structure

```
password-vault/
├── src/
│   ├── pages/
│   │   ├── api/            # Backend API routes
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   └── vault/      # Vault CRUD operations
│   │   ├── dashboard.tsx   # Main dashboard
│   │   ├── login.tsx       # Login page
│   │   ├── signup.tsx      # Registration page
│   │   └── account.tsx     # Account settings
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── PasswordGenerator.tsx
│   │   ├── VaultEditor.tsx
│   │   ├── VaultList.tsx
│   │   └── AuthProvider.tsx
│   ├── lib/
│   │   ├── mongodb.ts      # Database connection
│   │   ├── auth.ts         # Auth utilities
│   │   └── db.ts           # Database helpers
│   ├── utils/
│   │   └── crypto.ts       # Encryption utilities
│   ├── models/
│   │   └── User.ts         # User schema
│   └── styles/
│       └── globals.css     # Global styles
├── public/                 # Static assets
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Dependencies
```

---

## 🔐 Security & Encryption

All vault items are **encrypted client-side** before transmission to the server.

### Encryption Specification
- **Algorithm:** AES-GCM (256-bit)  
- **Key Derivation:** PBKDF2-SHA256 with 100,000 iterations
- **Salt:** Unique random salt per user (stored separately)
- **IV:** Unique random initialization vector per entry
- **Result:** Server stores only encrypted ciphertext

### Why This Approach?

**AES-GCM** provides:
- Fast, authenticated encryption
- Both confidentiality and integrity verification
- Protection against tampering

**PBKDF2** adds:
- Computational cost to brute-force attacks
- Secure key derivation from user passwords
- Industry-standard key stretching

**Architecture Benefits:**
- Zero-knowledge architecture—server cannot decrypt user data
- Even in case of database breach, passwords remain secure
- Complies with modern security best practices

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or Atlas)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Hemantsrawat15/password-vault.git
cd password-vault
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=""
JWT_SECRET=""
NEXT_PUBLIC_APP_NAME=PasswordVault
```

**Generate secrets:**
```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32
```

### 4️⃣ Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5️⃣ Build for Production
```bash
npm run build
npm start
```

---

## 🌍 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure Environment Variables**
   Add the following in Vercel dashboard:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel domain)

4. **Deploy** 🚀
   - Vercel automatically builds and deploys
   - Your live URL is generated instantly

### Deploy to Render

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables
5. Deploy

---

## 🧭 Application Flow

1. **Sign Up** → Create secure account with email and password
2. **Generate Password** → Use built-in generator with custom options
3. **Save to Vault** → Store encrypted credentials securely
4. **Search & Filter** → Find entries instantly
5. **Edit/Delete** → Manage credentials as needed
6. **Copy Credentials** → One-click copy with auto-clear
7. **Enable 2FA** → Add extra layer of security (optional)

---

## 📸 Screenshots

### Password Generator
Customizable password generation with security options.

### Vault Dashboard
Clean interface for managing all credentials.

### Two-Factor Authentication
Enhanced security with TOTP-based 2FA.

---

## 🧾 Deliverables Checklist

✅ Live demo URL on Vercel  
✅ Complete GitHub repository with documentation  
✅ Screen recording (60-90 seconds) demonstrating:
   - Password generation
   - Saving to vault
   - Search functionality
   - Edit and delete operations
✅ Network traffic shows only encrypted data  
✅ Database inspection confirms no plaintext storage  
✅ Responsive design (mobile and desktop)  
✅ Dark mode support  

---

## ⏰ Development Timeline

- **Planning & Setup:** 1 day
- **Core Features:** 2 days
- **Security Implementation:** 1 day
- **UI/UX Polish:** 1 day
- **Testing & Deployment:** 0.5 day

**Total:** 3-5 working days

---

## 💡 Inspiration

Inspired by leading password managers including Bitwarden, 1Password, and Proton Pass, this project reimagines credential management with:
- Minimalist design philosophy
- Transparency in security implementation
- Privacy-first architecture
- Open-source approach

---

## 🛠️ Future Enhancements

- [ ] Import/Export functionality (encrypted JSON)
- [ ] Password strength analyzer
- [ ] Breach detection integration
- [ ] Browser extension
- [ ] Shared vaults for teams
- [ ] Biometric authentication
- [ ] Password history tracking
- [ ] Secure notes and documents

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Hemant Singh Rawat**  
🔗 [GitHub](https://github.com/Hemantsrawat15)  
🌐 [LinkedIn](https://www.linkedin.com/in/hemant-singh-rawat)

---

## 🏢 Organization

**Web Development Company - Top**  
An innovative web development company focused on building modern, scalable, and secure web solutions.

📧 Contact: [Company LinkedIn](https://in.linkedin.com/company/web-development-company-top)

---

## 🙏 Acknowledgments

- Assignment designed by [Setu Agrawal](https://in.linkedin.com/in/setu-agrawal-1032681aa)
- Built with guidance from Web Development Company - Top
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

## 📞 Support

For questions or issues:
- Open an issue on [GitHub](https://github.com/Hemantsrawat15/password-vault/issues)
- Contact via [LinkedIn](https://www.linkedin.com/in/hemant-singh-rawat)

---

**⭐ If you found this project helpful, please consider giving it a star on GitHub!**
