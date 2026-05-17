# CJD HOBBY CLASSES Art Academy SaaS

A modern Vite + React application for a drawing and art classes business. The app includes a public marketing website, student dashboard, admin dashboard, art order workflow, inquiry capture, and Firebase-backed auth/data flows.

## Stack

- Vite
- React
- JavaScript
- Tailwind CSS
- React Router
- Firebase Auth + Firestore + Storage
- Framer Motion
- Lucide React

## Included Features

- Public pages: home, about, courses, gallery, workshops, contact, login, register, art order
- Student workspace: enrolled classes, attendance, fee tracking, progress, workshop registrations, notifications
- Admin workspace: course manager, workshop manager, gallery uploader, student roster, inquiry inbox, fee overview, announcements
- Custom art order flow with pricing estimator and Razorpay checkout handoff
- Fallback demo content so the UI stays usable even before Firestore is populated
- Light and dark theme toggle

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Fill in the Firebase, EmailJS, and Razorpay values in `.env`.
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Optional: log in as an admin account whose `users/{uid}.role` is set to `admin`.

## Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=

VITE_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Notes:

- `VITE_RAZORPAY_KEY_ID` is used in the frontend checkout flow.
- `RAZORPAY_KEY_SECRET` should stay server-side only if you later add secure order creation or signature verification.
- If EmailJS keys are omitted, inquiries still save in Firestore and the email send is skipped gracefully.

## Firebase Setup

1. Create a Firebase project and add a web app.
2. Enable Authentication with the `Email/Password` provider.
3. Create a Firestore database.
4. Create or allow these collections:
   - `users`
   - `students`
   - `courses`
   - `workshops`
   - `gallery`
   - `orders`
   - `inquiries`
   - `attendance`
   - `fees`
   - `announcements`
   - `faqs`
   - `testimonials`
   - `progress`
5. Enable Firebase Storage if you want reference image uploads for art orders.
6. After your first admin login, use the admin dashboard seed button to populate empty collections with sample content.

## Admin Role Setup

Public registration creates student accounts only. To create an admin:

1. Register or create a Firebase Auth user.
2. In Firestore, open `users/{uid}` for that account.
3. Set:
   ```json
   {
     "role": "admin"
   }
   ```
4. Sign in again and the app will route that account to `/admin`.

## Build Check

Production build verified locally with:

```bash
npm run build
```
