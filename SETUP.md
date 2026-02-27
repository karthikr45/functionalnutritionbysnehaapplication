# NutritionCare — Complete Setup Guide

## 🗂 Project Structure

```
nutrition-app/
├── app/
│   ├── (auth)/login & signup      ← Authentication pages
│   ├── patient/                   ← Patient portal
│   │   ├── dashboard/             ← Patient overview
│   │   ├── book/                  ← Booking wizard (calendar + payment)
│   │   ├── appointments/          ← View & manage appointments
│   │   ├── packages/              ← Buy & use packages
│   │   └── documents/             ← Upload/view documents
│   ├── doctor/                    ← Doctor portal
│   │   ├── dashboard/             ← Today's schedule
│   │   ├── appointments/          ← Manage all appointments
│   │   ├── availability/          ← Set weekly schedule & block dates
│   │   └── documents/             ← Manage documents
│   ├── blog/                      ← Blog (Sanity powered)
│   ├── studio/                    ← Sanity CMS Studio (/studio)
│   └── api/                       ← All API routes
├── components/                    ← Reusable UI components
├── lib/                           ← Auth, Prisma, Razorpay, Cloudinary
├── prisma/schema.prisma           ← Database schema
├── sanity/                        ← Sanity CMS config & queries
└── types/                         ← TypeScript types
```

---

## 🚀 Step-by-Step Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database (local or hosted)
- Accounts: Razorpay, Cloudinary, Sanity

---

### 2. Install Dependencies

```bash
cd nutrition-app
npm install
```

---

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all values:

```env
# PostgreSQL — Supabase, Railway, Neon, or local
DATABASE_URL="postgresql://user:pass@host:5432/nutrition_db"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"

# Razorpay (https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID="rzp_test_xxx"
RAZORPAY_KEY_SECRET="xxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxx"

# Cloudinary (https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# Sanity (https://www.sanity.io/manage → New Project)
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-token"  # from sanity.io/manage → API → Tokens
```

---

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create all tables
npx prisma migrate dev --name init

# Seed with demo data (doctor, patient, packages)
npm run seed
```

---

### 5. Run the Application

```bash
npm run dev
```

Open http://localhost:3000

---

## 👤 Test Credentials

| Role    | Email                         | Password    |
|---------|-------------------------------|-------------|
| Patient | patient@example.com           | Patient@123 |
| Doctor  | dr.priya@nutritioncare.com    | Doctor@123  |
| Admin   | admin@nutritioncare.com       | Admin@123   |

---

## 🎨 Key Features

### Patient Portal
- **Dashboard**: Overview of appointments, packages, documents
- **Smart Booking Wizard**: 4-step booking with live availability calendar
- **Package Purchase**: Buy consultation packages with Razorpay
- **Document Upload**: Upload lab reports, prescriptions (PDF/images via Cloudinary)
- **Appointment Management**: View, track, cancel appointments

### Doctor Portal
- **Dashboard**: Today's schedule, stats, upcoming appointments
- **Appointment Management**: Confirm, complete, cancel; add notes & video call links
- **Upload Diet Plans**: Attach diet plans or prescriptions to appointments
- **Availability Management**: Set weekly schedule (Mon–Sun, time ranges, slot duration)
- **Block Dates**: Mark specific dates as unavailable

### Landing Website
- Professional nutrition website with hero, about, services, how-it-works sections
- Dynamic packages section (loaded from DB)
- Real testimonials section
- Contact form
- Blog preview from Sanity

### Blog (Sanity CMS)
- Access Sanity Studio at `/studio` (doctor or admin login required)
- Create/edit blog posts with rich text, images, categories
- SEO metadata auto-generated
- Portable Text rendering

### Payments (Razorpay)
- Consultation fee payments (per appointment)
- Package purchases (all sessions pre-paid)
- Signature verification on backend
- Payment status tracked in DB

---

## 🔧 Services to Configure

### Razorpay
1. Create account at razorpay.com
2. Dashboard → Settings → API Keys → Generate Test Key
3. For production: complete KYC, switch to Live keys

### Cloudinary
1. Sign up at cloudinary.com (free tier: 25GB storage, 25GB bandwidth/month)
2. Dashboard → Settings → Copy Cloud Name, API Key, API Secret

### Sanity
1. Sign up at sanity.io
2. Create new project → Copy Project ID
3. Manage → API → Tokens → Create token with "Editor" access
4. Access Studio at /studio after setting NEXT_PUBLIC_SANITY_PROJECT_ID

### PostgreSQL Options
- **Local**: Install PostgreSQL, create DB: `createdb nutrition_db`
- **Supabase**: supabase.com (free tier available, copy connection string)
- **Railway**: railway.app (simple PostgreSQL hosting)
- **Neon**: neon.tech (serverless PostgreSQL)

---

## 📦 Production Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# https://vercel.com/[your-team]/[project]/settings/environment-variables
```

After deploying:
1. Update `NEXTAUTH_URL` to your production domain
2. Run migrations: `npx prisma migrate deploy`
3. Run seed: update DATABASE_URL to production DB and run `npm run seed`

---

## 🎯 Customization Guide

### Change Doctor Name/Bio
- Edit `prisma/seed.ts` → re-run `npm run seed`
- OR: Go to Prisma Studio (`npx prisma studio`) and edit DoctorProfile table

### Change Brand Colors
- Edit `tailwind.config.ts` → modify `primary` color values

### Change Consultation Fees
- Edit `prisma/seed.ts` → `consultationFee` and `followUpFee` fields
- OR: Update via Prisma Studio

### Add Multiple Doctors
- Current system supports multiple doctors (role=DOCTOR)
- Booking page fetches the first doctor; extend `GET /api/doctor/profile` to list all
- Add doctor selection step to booking wizard

### Email Notifications
- Install `nodemailer`: `npm install nodemailer`
- Add email sending in `/api/appointments/route.ts` after booking confirmation
