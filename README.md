# Social Q&A & Knowledge Sharing Platform

# CodeQuest

A modern Full-Stack Social Q&A Platform inspired by Stack Overflow, designed to combine knowledge sharing with social networking. Users can ask questions, share posts, build professional connections, chat with friends and teams, earn rewards through community participation, and manage their accounts securely with advanced authentication, moderation, and multilingual support.


## 🚀 Features

### 👤 Authentication & Security
- User Registration & Login
- Email OTP Verification (Signup & Password Reset only)
- Forgot Password via Email
- Forgot Password via Mobile Number
- Random Password Generator
- Login History Tracking
- Browser & Device Detection
- Secure Authentication Rules
- OTP-based Language Switching
- Session Validation & Access Control
- Role-Based Access Control (User / Admin)
- Account Suspension (Admin-enforced bans block login)

### 💬 Community & Social Features
- Public Question & Answer Platform
- Public Social Feed
- Create, Edit & Delete Posts
- User Profiles
- Friend System
- Like, Comment & Share Posts
- Image Uploads
- Video Uploads
- Community Interaction

Posting Rules
- 0 Friends → Cannot create public posts
- 1 Friend → 1 post/day
- 2 Friends → 2 posts/day
- Similarly with 3-10 Friends
- More than 10 Friends → Unlimited posts/day

### 💬 Real-Time Chat & Teams
- Friend-to-Friend Direct Messaging (text, images, and videos up to 20MB)
- Deep-linkable Conversations (jump straight to a chat from a friend's profile)
- Team / Community Creation (requires 15+ Reward Points)
- Public Team Directory — browse and join teams created by other users
- WhatsApp-style Group Chat per Team (previewable before joining, join required to send)
- Team Membership Management

### ❓ Question & Answer System
- Ask Questions
- Submit Answers
- Subscription-based Question Limits
- Community Voting
- Reward Points for Answers
- Bonus Rewards for Popular Answers
- Automatic Point Deduction for Deleted or Downvoted Answers
- AI Assistant (Groq-powered chat for Q&A help, with full Markdown-formatted responses)

### 🏆 Reward System
- Earn 5 Points per Answer
- Bonus 5 Points after Receiving 5 Upvotes
- User Reputation Display
- Reward Point Transfers
- Points Required to Create a Team (15+)
- Secure Backend Validation
- Real-time Point Updates

### 🛡️ Admin & Moderation
- Role-Based Admin Access
- Content Reporting (Questions, Answers, Posts, Comments, Teams, Team Messages)
- Report Review Queue (Pending / Resolved / Dismissed)
- Content Deletion by Admins
- User Management (Ban / Unban Accounts)
- Promote / Demote Admin Roles
- Team Oversight (Rename, Delete, Remove Members)
- Audit Log of All Moderation Actions

### 💳 Subscription & Payments
- Free Plan
- Bronze Plan
- Silver Plan
- Gold Plan
- Razorpay / Stripe Dummy Integration
- Invoice Email Generation
- Subscription Confirmation Emails
- Subscription-based Posting Limits
- Payment Time Validation

### 🌍 Multi-language Support

Supported Languages:

- English
- Hindi
- Spanish
- Portuguese
- Chinese
- French

Additional Security:

- Email OTP required for all Language switches

### 📱 Smart Login Rules

Mobile

- Login Allowed Only Between 12:00 AM – 12:00 PM (IST)

Desktop & Mobile

- No OTP required at login — OTP is reserved for Signup and Password Reset

### 📊 User Dashboard
- View Profile
- View Reward Points
- Login History
- Subscription Details
- Friend Management
- Language Preferences
- Trending Tags & Quick Actions (sidebar)

---

## 🚀 Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Third-Party Services
- Cloudinary — image & video storage (posts, chat, team media)
- SMTP2GO — transactional email (OTP, password reset)
- Groq — AI Assistant
- Razorpay — payments (dummy integration)

---

## 📂 Project Structure

```
.
├── server/
└── stack/
```

---

## CodeQuest Overview
![codeQuest Overview](stack/src/images/codequest_overview.png)

---

### ✨ Highlights
- Secure Authentication System
- Knowledge Sharing Platform
- Social Networking Features
- Real-Time Friend & Team Chat
- Reward-based Community Engagement
- Subscription Management
- Payment Integration
- Login History & Device Tracking
- Multi-language Support
- OTP Protected Sensitive Operations
- Role-Based Admin Panel & Content Moderation
- Responsive User Interface
- RESTful Backend Architecture

---

#### Future Enhancements
- Real-time Notifications (push-based, replacing chat/team polling)
- Dark Mode
- Rich Text Editor
- Progressive Web App (PWA)

---

## 👨‍💻 Author

Aditya Varshney

If you found this project useful, consider giving it a ⭐ on GitHub.