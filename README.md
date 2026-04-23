# 🚗 SmartPark | Production-Ready IoT Parking System

A high-performance, real-time parking management solution built with the **MERN** stack (MongoDB, Express, React, Node.js). This system is designed with scalability, real-time synchronization, and premium user experience in mind.

---

## 🛠 Tech Stack Architecture

### **Backend (Node.js & Express)**
*   **Security**: Powered by `Helmet` for secure HTTP headers and `express-rate-limit` to prevent brute-force attacks.
*   **Real-time Engine**: Powered by `Socket.io` for millisecond-latency slot status updates across all connected clients.
*   **Database**: `MongoDB Atlas` with Mongoose ODM. Features complex indexing and virtual population for efficient data retrieval.
*   **Logging**: `Morgan` for production request logging and a global error handling pipeline for crash-proof operations.

### **Frontend (React & Vite)**
*   **UI Framework**: Vanilla **Tailwind CSS** with a custom design system focused on Glassmorphism and modern aesthetics.
*   **Animations**: `Framer Motion` for high-end micro-interactions and page transitions.
*   **Map Integration**: `Mapbox GL JS` with the **Mapbox Standard** 3D engine for photorealistic city navigation.
*   **State Management**: React Context API for global authentication and real-time socket management.

---

## 🏗 Modular Architecture (Real-World Standards)

### **1. Component-Based UI Kit**
The system uses a custom-built UI library located in `src/components/ui/`. This ensures:
*   **Visual Consistency**: Every button, input, and card follows the same design tokens.
*   **Maintainability**: Updates to the primary color or border-radius are made in one file and reflected system-wide.
*   **Reusability**: New features can be built in minutes using existing pre-styled components.

### **2. Real-time Slot Synchronization**
Instead of polling the server every few seconds (which wastes bandwidth), we use **WebSockets**.
1.  Admin updates a lot or a user makes a booking.
2.  The Backend emits a `slotUpdated` event via Socket.io.
3.  All active clients receive the event and update their local state immediately.
4.  The map markers and slot grid react instantly without a page refresh.

### **3. Database Schema Design**
*   **ParkingLot**: Stores metadata, location (GeoJSON-like coordinates), and pricing.
*   **Slot**: Linked to a ParkingLot via `ObjectId`. Uses composite indexing `(parkingLotId + slotNumber)` to ensure data integrity at the database level.
*   **Booking**: Tracks the relationship between User, Lot, and Slot. Generates unique base64-encoded QR codes for entry/exit validation.

---

## 🚀 Production Deployment Checklist

1.  **Environment Variables**: Ensure `NODE_ENV=production` is set to hide stack traces and enable production optimizations.
2.  **Rate Limiting**: Configured to 100 requests per 15 mins to mitigate DDoS risks.
3.  **CORS**: Currently set to `*` for development; should be restricted to the production domain in a live environment.
4.  **JWT Security**: Tokens are signed with HS256. For higher security, use HTTP-only cookies instead of LocalStorage.

---

## 📖 Beginner-to-Pro Guide
*   **Clean Code**: We avoid "prop drilling" by using Context Providers.
*   **DRY (Don't Repeat Yourself)**: Common logic for fetching data is abstracted into reusable `useEffect` patterns.
*   **User First**: Everything from the auto-geocoding Admin map to the redirect-back login flow is built to minimize user friction.

---
*Created with ❤️ for production-level developers and enthusiastic beginners.*