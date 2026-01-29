# Connect Backend API
REST API for a role-based session booking platform with payments, real-time chat, AI features, and video call sessions.


## Tech Stack
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Stripe (payments)
- ImageKit (image storage)
- ZegoCloud (video sessions)
- Socket.IO (real-time chat)
- Gemini AI (AI features)


## Core Features
- Role-based authentication (Student, Instructor, Admin)
- Session booking & scheduling
- Secure payments via Stripe
- Real-time chat system
- AI-powered assistant dashboard
- Video session integration
- Notifications system
- Admin dashboard for user & content management


## Environment Variables
Create a `.env` file in the root:

PORT=3001
NODE_ENV=
MONGO_URI=
FRONTEND_URL=
EMAIL_USER=
EMAIL_PASS=
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES=
GOOGLE_CALLBACK_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
ADMIN_EMAIL=
ADMIN_PASS=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ZEGO_APP_ID=
ZEGO_SERVER_SECRET=


## Installation & Setup
1. Clone the repository
git clone <repo-url>

2. cd <project-folder>

3. Install dependencies
npm install

4. Add environment variables

5. Start development server
npm run dev


## Available Scripts
npm run dev       # start development server  
npm run build     # build TypeScript  
npm start         # run production build  
npm run check     # lint + format + typecheck  


## Authentication
- JWT-based authentication
- Access token + Refresh token strategy
- Role-based route protection middleware


## Folder Structure
src/
├── common/
    ├── errors/
    └── utils/
├── config/
├── constants/
├── controllers/
├── services/
├── integrations/
├── interfaces/
├── middlewares/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
├── app.ts
└── server.ts


## Architecture
The backend follows a layered architecture:
Route → Controller → Service → Repository → Database


## Third-Party Integrations
- Stripe — payments & webhooks
- ImageKit — image upload and CDN delivery
- ZegoCloud — video session infrastructure
- Google OAuth — social login
- Gemini AI — AI chat features


## Error Handling
Centralized error middleware ensures consistent API error responses and logging using Winston.


## Author
Hadi Risha

