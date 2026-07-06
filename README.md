# Social Q&A Platform (StackOverflow Clone)

# CodeQuest

A full-stack community platform inspired by Stack Overflow with additional social networking features. The project is being developed as part of an internship assignment and will be completed in multiple tasks.

## 🚀 Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

---

# Initial Platform

### Authentication
- User Registration
- User Login

## ✅ Complete Features (Task 1)

### Social Module
- Public Social Feed
- User Profiles
- Friend System
- Create Posts
- Upload Images
- Upload Videos
- Like Posts
- Comment on Posts
- Share Posts

### Posting Rules
- 0 Friends → Cannot create public posts
- 1 Friend → 1 post/day
- 2 Friends → 2 posts/day
- Similarly with 3-10 Friends
- More than 10 Friends → Unlimited posts/day

## ✅ Complete Features (Task 2)

### Forgot Password Module
- Forgot Password Page & Route
- Password Reset using Registered Email
- Password Reset using Registered Mobile Number
- One Forgot Password Request Allowed per Day
- Random Password Generator
- Generated Password contains only Uppercase & Lowercase Alphabets
- Validation and Error Handling for Invalid Requests

## ✅ Complete Features (Task 3)

### Subscription Plans
  - Free Plan (1 Question/Day)
  - Bronze Plan – ₹100/month (5 Questions/Day)
  - Silver Plan – ₹300/month (10 Questions/Day)
  - Gold Plan – ₹1000/month (Unlimited Questions)

### Payment Module
- Razorpay/Stripe Payment Gateway Integration
- Automatic Invoice Email after Successful Payment
- Subscription Details Sent via Email
- Question Posting Limits Based on Active Subscription
- Payment Allowed Only Between **10:00 AM – 11:00 AM (IST)**
- Payment Validation for Restricted Time Window

## ✅ Complete Features (Task 4)

### Reward Points System

- Reward Point System for User Contributions
- Users Earn **5 Points** for Every Answer Submitted
- Additional **5 Bonus Points** when an Answer Reaches **5 Upvotes**
- User Points Displayed on Profile
- Point Transfer Between Users
- Search Users Before Initiating Point Transfer
- Point Transfer Allowed Only if User Has More Than **10 Points**
- Automatic Point Deduction for Downvoted Answers
- Automatic Point Deduction When an Answer is Deleted
- Backend Validation to Prevent Invalid or Unauthorized Point Transfers
- Real-time Reward Point Updates Based on User Activity

## ✅ Complete Features (Task 5)

### Login History & Security

- User Login History Tracking
- Capture Browser Type, Operating System, Device Type, and IP Address
- Display Login History in User Profile
- Browser-based Authentication Rules
  - Google Chrome → Email OTP Verification Required
  - Microsoft Browser → Direct Login Without OTP
- Mobile Login Time Restriction (10:00 AM – 1:00 PM IST)
- Access Denied for Mobile Logins Outside Allowed Time Window
- Secure OTP Verification Workflow
- Backend Validation for Login Rules and Device Detection

---

## 📌 Upcoming Features

- Multi-language Support

---

## 📂 Project Structure

```
.
├── server/
└── stack/
```

---

## 📖 Project Status

🟢 Task 1 Completed
🟢 Task 2 Completed
🟢 Task 3 Completed
🟢 Task 4 Completed
🟢 Task 5 Completed

More features will be added in future tasks.

---

## 👨‍💻 Author

Aditya Varshney