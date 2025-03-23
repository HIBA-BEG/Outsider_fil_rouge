# 🎯 Observer - Event Management & Social Platform

A modern event management and social networking platform built with NestJS and React Native. Connect with friends, discover events, and manage your social calendar all in one place! 🌟

## 🌟 Features

### 👥 User Management
- Multi-role system (Admin, Organizer, Participant)
- Profile customization
- Friend system with request management
- Interest-based preferences
- Secure authentication

### 📅 Event Management
- Create and manage events
- Event registration and tracking
- Event status monitoring
- Support for event posters and location information
- Event analytics

### 🤝 Social Features
- Comment on events
- Rate events
- Connect with friends
- Interest-based recommendations

### 📍 Location Services
- City-based organization
- Administrative information

### 👮‍♂️ Moderation
- Content moderation system
- User management
- Archive system for events and comments
- Verification system
- Dark/Light theme toggle

## 🛠 Tech Stack

### Backend (observer-server)
- NestJS
- MongoDB with Mongoose
- JWT Authentication
- Node.js
- TypeScript
- Fastify
- Nodemailer for email services

### Frontend (observer-client)
- React Native/Expo
- TypeScript
- NativeWind (TailwindCSS)
- Expo Router
- Axios
- React Navigation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB
- npm
- Expo CLI
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/HIBA-BEG/Outsider_fil_rouge.git
cd observer-app
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd observer-server

# Install dependencies
npm install

# Create .env file (use .env.example as template)
cp .env.example .env

# Seed the cities database
npm run seed:cities

# Start development server
npm run start:dev
```

### 3. Frontend Setup
```bash
# Navigate to client directory
cd observer-client

# Install dependencies
npm install

# Create .env file (use .env.example as template)
cp .env.example .env

# Start the Expo development server
npm start
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/observer
JWT_SECRET=your_jwt_secret
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_password
MAIL_USERNAME=your_email
MAIL_FROM=your_email@gmail.com
CLIENT_URL=exp://your_client_url:8081
```

### Frontend (.env)
```env
API_URL=http://your_ip_address:3000
```

## 📱 Running the Mobile App

1. Install Expo Go on your mobile device
2. Scan the QR code from the Expo development server
3. The app will load on your device

## 🧪 Testing

### Backend Tests
```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
# Run tests
npm test

# Test with coverage
npm run test:coverage
```

## 📚 API Documentation

The API documentation is available at `https://documenter.getpostman.com/view/32417799/2sAYkHodyb` when running the development server.

## 🔍 Project Structure

observer-app/ <br>
├── observer-server/ # Backend NestJS application <br>
│ ├── src/ <br>
│ │ ├── admin/ # Admin module <br>
│ │ ├── authentication/ # Authentication module <br>
│ │ ├── city/ # City module <br>
│ │ ├── comment/ # Comment system <br>
│ │ ├── event/ # Event management <br>
│ │ ├── interest/ # interest management <br>
│ │ ├── rating/ # rating module <br>
│ │ ├── users/ # User management <br>
│ │ └── ... <br>
│ └── test/ # Backend tests <br>
└── observer-client/ # Frontend React Native application <br>
├── app/ # Expo Router pages <br>
├── components/ # Reusable components <br>
├── context/ # React Context providers <br>
└── types/ # TypeScript definitions <br>

## 🔮 Future Updates & Roadmap

### Upcoming Features
- 💬 Real-time Chat System
  - Direct messaging between users
  - Group chats for event participants
  - Message status indicators
  - File sharing capabilities

- 🔔 Push Notifications
  - Event reminders
  - Friend request notifications
  - Chat message notifications
  - Event updates and changes
  - Custom notification preferences

- 📱 Mobile Enhancements
  - Offline mode support
  - Custom event categories
  - Advanced event filtering

### Community Suggestions
We love hearing from you! If you have ideas for new features or improvements, please:
- 🎯 Open an issue on GitHub
- 📧 Email us at: [beghiba@gmail.com](mailto:beghiba@gmail.com)

## 📊 Project Resources & Documentation

### Project Management
- 📋 [Jira Board](https://beghiba.atlassian.net/jira/software/projects/OUT/list?atlOrigin=eyJpIjoiMWZlZDU0ZDFmYjBkNDMwODg2MzUxODViNDdkZjA0NmUiLCJwIjoiaiJ9)
  - Sprint planning
  - Task tracking
  - Bug reports
  - Feature requests

### Design & Mockups
- 🎨 [Figma Designs](https://www.figma.com/design/ClahAc40hNG8iJM3swcyCb/Observer?node-id=0-1&t=x7h95dVdFQTBs8Mp-1)
  - UI/UX wireframes
  - Component library
  - Design system
  - Prototype interactions

### Technical Documentation
- 📐 [UML Diagrams](https://drive.google.com/file/d/1BxiUgMlMMwcx5TS_XGbjraz8On2iVVlH/view?usp=drive_link)
  - Class diagrams
  - Use case diagrams

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👏 Acknowledgments

- NestJS team for the amazing backend framework
- Expo team for making mobile development easier
- MongoDB team for the robust database solution
- All contributors who have helped shape this project

## 📞 Contact

Project Link: [https://github.com/HIBA-BEG/Outsider_fil_rouge](https://github.com/HIBA-BEG/Outsider_fil_rouge)

---

⭐️ If you found this project helpful, please give it a star on GitHub! ⭐️
