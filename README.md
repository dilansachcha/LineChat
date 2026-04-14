# LineChat 💬

A near real-time mobile chat application built with React Native and Java Servlets. It features secure user authentication, contact-based chat management, live messaging via periodic polling, and dynamic user status handling.

This project demonstrates a complete full-stack mobile architecture, bridging a React Native frontend with a robust Java Servlet backend and relational MySQL database.

---

## 🏗️ Tech Stack & Architecture

### 📱 Frontend (Mobile App)
* **Framework:** React Native (built with Expo)
* **Navigation:** Expo Router (File-based routing)
* **State & Storage:** `useState`, `useEffect`, and AsyncStorage (Persistent session management)
* **UI & Performance:** FlashList (Optimized rendering for long chat histories), Custom Fonts (Montserrat)
* **Hardware APIs:** Expo Image Picker (Native gallery access for avatars)

### 🖥️ Backend & Database
* **Server:** Java Servlets (Apache Tomcat)
* **ORM:** Hibernate (Criteria API for dynamic, object-based database querying)
* **Database:** MySQL 
* **Data Parsing:** Gson (JSON serialization/deserialization)

---

## 🗄️ Database Design

The relational foundation of the chat system is built on four core tables:
* **User:** `id`, `mobile` (Unique login ID - eliminates email dependency), `first_name`, `last_name`, `password`, `registered_date_time`, `user_status_id (FK)`
* **User_Status:** Tracks presence (`1 = Online`, `2 = Offline`)
* **Chat:** `id`, `from_user`, `to_user`, `message`, `date_time`, `chat_status`
* **Chat_Status:** Tracks read receipts (`1 = Seen`, `2 = Unseen`)

---

## ✨ Core Features & Engineering Decisions

* **Near Real-Time Messaging via Polling:** Implemented a highly reliable polling architecture (`setInterval` at 5-second intervals) to synchronize the chat state. This deliberate design choice bypasses complex WebSocket overhead while ensuring robust, uninterrupted message delivery using standard HTTP servlets.
* **Optimized Data Fetching (Home Screen):** Engineered the backend to minimize payload sizes for the home screen inbox. Utilized Hibernate's `setMaxResults(1)` and `Order.desc("id")` to efficiently query and return only the absolute latest message and timestamp per conversation.
* **Dynamic Status Tracking:** Engineered real-time visual indicators for "Online/Offline" user presence and "Seen/Unseen" read receipts (green ticks). Statuses are managed securely via relational database flags and updated dynamically on message load (`LoadChat.java`).
* **Multi-Protocol API Communication:** * *Multipart (Signup):* Frontend utilizes `FormData` for image uploads; backend uses Java `Files.copy()` to natively store file-based avatars (`/AvatarImages/mobile.png`).
  * *JSON (Signin):* Utilizes `JSON.stringify()` and Gson for secure credential verification.
  * *Query Params (Chat):* Efficient URL parameter passing for message retrieval and sending.
* **High-Performance Rendering:** Swapped standard ScrollViews for Shopify's `FlashList` in the chat interface, guaranteeing 60fps rendering. Implemented `useRef` for automatic `scrollToEnd()` behavior to mimic native chat app experiences.
* **Data Formatting:** Handled UI logic smoothly using `SimpleDateFormat` for readable timestamps, dynamic avatar fallback (extracting `charAt(0)` for initials if no image exists), and robust client-side sorting to ensure the latest active chats always appear at the top.

---

## 📸 Screenshots & Demo

| Home (Chat Inbox) | Active Chat Interface |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/8b244f2d-fc52-487c-8eaa-26ef038bbd00" width="250" /> | <img src="https://github.com/user-attachments/assets/8afd0169-9708-4b21-9043-a3656217e7f4" width="250" /> |

---

## 📥 Installation & Setup

### 1. Clone the Repository
    git clone https://github.com/dilansachcha/LineChat.git
    cd LineChat

### 2. Backend Setup (Java/Tomcat)
* Import the project into your preferred Java IDE (e.g., IntelliJ IDEA, Eclipse).
* Configure your Apache Tomcat server.
* Update the `hibernate.cfg.xml` file with your local or cloud MySQL credentials.
* Build and deploy the artifact to the server.

### 3. Frontend Setup (Expo)
Navigate to the app directory and install dependencies:

    cd app
    npm install

Create a `.env` file in the root of the frontend directory and add your backend IP address to connect the app to your local server:

    EXPO_PUBLIC_URL=http://YOUR_LOCAL_IP:8080/LineChatBackend

Start the Expo development server:

    npx expo start
