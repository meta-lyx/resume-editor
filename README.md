# 🚀 AI Resume Editor - Cloudflare Edition

> AI-powered resume optimization platform built with modern Cloudflare stack

[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare-orange)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.6-green)](https://hono.dev/)

---

## ✨ Features

- 🤖 **AI-Powered Optimization** - GPT-4 & Claude 3 integration
- 📄 **Multiple Optimization Types**
  - ATS Optimization
  - Language Polish
  - Achievement Highlighting
  - Job Matching
- 🔐 **Secure Authentication** - Better Auth with email verification
- 💳 **Stripe Integration** - Subscription management
- 📧 **Email Service** - Resend for transactional emails
- 📦 **File Storage** - Cloudflare R2 for resume files
- 🗄️ **SQLite Database** - D1 for serverless SQL
- 🚀 **Edge Deployment** - Cloudflare Workers for global performance

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Cloudflare Workers
- **Framework:** Hono.js
- **Database:** Drizzle ORM + D1 (SQLite)
- **Auth:** Better Auth
- **Email:** Resend
- **Storage:** Cloudflare R2
- **AI:** OpenAI & Anthropic
- **Payment:** Stripe

### Frontend (Coming Soon)
- **Framework:** React 18
- **Router:** TanStack Router
- **State:** TanStack Query
- **UI:** shadcn/ui + Tailwind CSS
- **Forms:** React Hook Form + Zod

### Infrastructure
- **Hosting:** Cloudflare Pages + Workers
- **CI/CD:** GitHub Actions
- **Monitoring:** Cloudflare Analytics

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- pnpm
- Cloudflare account
- API keys (OpenAI/Anthropic, Resend, Stripe)

### Quick Start

```bash
# Clone repository
git clone https://github.com/meta-lyx/resume-editor.git
cd resume-editor

# Install dependencies
pnpm install

# Create D1 database
npx wrangler d1 create ai-resume-editor-db

# Set up secrets (see DEPLOYMENT.md for details)
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OPENAI_API_KEY
# ... (set all secrets)

# Initialize database
npx wrangler d1 execute ai-resume-editor-db --remote --file=./drizzle/init.sql

# Deploy
npx wrangler deploy
```

For detailed setup instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🏗️ Project Structure

```
ai-resume-editor/
├── src/
│   ├── server/                    # Backend (Hono.js)
│   │   ├── index.ts              # Main server
│   │   ├── db/
│   │   │   ├── schema.ts         # Database schema
│   │   │   └── index.ts          # DB connection
│   │   ├── lib/
│   │   │   ├── auth.ts           # Better Auth
│   │   │   ├── email.ts          # Resend integration
│   │   │   ├── ai.ts             # OpenAI/Anthropic
│   │   │   └── r2.ts             # R2 storage
│   │   └── routes/
│   │       ├── auth.ts           # Auth endpoints
│   │       ├── resume.ts         # Resume CRUD
│   │       ├── ai.ts             # AI optimization
│   │       ├── upload.ts         # File upload
│   │       └── subscription.ts   # Stripe integration
│   └── client/                    # Frontend (React) [To be added]
├── drizzle/                       # Database migrations
├── .github/workflows/             # GitHub Actions CI/CD
├── wrangler.toml                 # Cloudflare config
├── DEPLOYMENT.md                 # Deployment guide
└── package.json
```

---

## 🔑 Environment Variables

### Required Secrets

Set these using `npx wrangler secret put <NAME>`:

```bash
RESEND_API_KEY              # Email service
OPENAI_API_KEY              # AI optimization
ANTHROPIC_API_KEY           # Alternative AI
STRIPE_SECRET_KEY           # Payment processing
STRIPE_PUBLISHABLE_KEY      # Stripe client
STRIPE_WEBHOOK_SECRET       # Stripe webhooks
BETTER_AUTH_SECRET          # Auth encryption
R2_ACCESS_KEY_ID            # R2 storage
R2_SECRET_ACCESS_KEY        # R2 storage
```

### Configuration

Edit in `wrangler.toml`:

```toml
[vars]
NODE_ENV = "production"
APP_URL = "https://your-domain.com"
```

---

## 🚀 Development

### Local Development

```bash
# Start backend dev server
pnpm run dev

# Start frontend dev server (in another terminal)
pnpm run dev:client
```

- Backend: http://localhost:8787
- Frontend: http://localhost:5173

### Database Management

```bash
# Generate migration
pnpm run db:generate

# Apply migration locally
pnpm run db:migrate

# Apply migration to production
pnpm run db:migrate:prod

# Open database GUI
pnpm run db:studio
```

### Build

```bash
pnpm run build
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Resumes
- `GET /api/resumes` - Get all user resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/:id` - Get single resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `GET /api/resumes/:id/versions` - Get resume versions

### AI Optimization
- `POST /api/ai/optimize` - Optimize resume
- `POST /api/ai/suggestions` - Get improvement suggestions
- `GET /api/ai/history` - Get optimization history
- `GET /api/ai/models` - Get available AI models

### File Upload
- `POST /api/upload` - Upload resume file
- `GET /api/upload` - Get user's uploaded files
- `DELETE /api/upload/:id` - Delete uploaded file
- `GET /api/upload/:id/download` - Download file

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `GET /api/subscriptions/current` - Get user's subscription
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout
- `POST /api/subscriptions/webhook` - Stripe webhook
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/usage` - Get usage statistics

---

## 💰 Pricing

### Subscription Plans

| Plan | Price | Optimizations | Features |
|------|-------|---------------|----------|
| **Free** | $0/mo | 3/month | Basic ATS optimization |
| **Basic** | $9.99/mo | 20/month | ATS + Language polish |
| **Premium** | $19.99/mo | Unlimited | All features + Priority AI |
| **Enterprise** | $49.99/mo | Unlimited | Team sharing + API access |

---

## 🔒 Security

- ✅ Email verification required
- ✅ Secure password hashing (Better Auth)
- ✅ Session management with secure tokens
- ✅ Stripe PCI compliance
- ✅ Environment variable encryption
- ✅ CORS protection
- ✅ Rate limiting (Cloudflare)

---

## 📊 Monitoring

### View Logs
```bash
npx wrangler tail
```

### Analytics
- Cloudflare Dashboard → Workers & Pages → ai-resume-editor
- Real-time request metrics
- Error tracking
- Performance monitoring

---

## 🧪 Testing

```bash
# Run tests (once implemented)
pnpm test

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Hono.js](https://hono.dev/) - Lightweight web framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Better Auth](https://www.better-auth.com/) - Authentication library
- [Cloudflare](https://www.cloudflare.com/) - Infrastructure platform
- [OpenAI](https://openai.com/) & [Anthropic](https://www.anthropic.com/) - AI models
- [Resend](https://resend.com/) - Email API
- [Stripe](https://stripe.com/) - Payment processing

---

## 📞 Support

- 📧 Email: support@your-domain.com
- 💬 Discord: [Join our community](https://discord.gg/your-invite)
- 📖 Documentation: [Full docs](https://docs.your-domain.com)
- 🐛 Issues: [GitHub Issues](https://github.com/meta-lyx/resume-editor/issues)

---

## 🗺️ Roadmap

- [x] Backend API with Hono.js
- [x] Database setup with Drizzle + D1
- [x] Authentication with Better Auth
- [x] AI optimization (OpenAI + Anthropic)
- [x] File storage with R2
- [x] Email service with Resend
- [x] Subscription with Stripe
- [x] CI/CD with GitHub Actions
- [ ] Frontend with React + TanStack Router
- [ ] Resume templates
- [ ] LinkedIn integration
- [ ] Team collaboration features
- [ ] API for developers
- [ ] Mobile app

---

## 📈 Status

✅ **Backend:** Complete and deployed
🚧 **Frontend:** In development
📋 **Documentation:** Complete

**Last Updated:** November 2024

---

Made with ❤️ by [Your Name](https://github.com/meta-lyx)

**Star this repo if you find it helpful!** ⭐

