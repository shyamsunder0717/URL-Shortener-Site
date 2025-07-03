# Full-Stack URL Shortener Service

<p align="center">
  <img src="https://github.com/shyamsunder0717/URL-Shortener-Site/blob/main/views/Landing%20Page.png" alt="URL Shortener Landing Page" width="80%">
</p>

This is a comprehensive, full-stack URL shortener application designed to simulate a production-scale service. It includes a modern frontend, a robust backend with an API, and a complete analytics dashboard. The entire application is containerized with Docker and deployed on Google Cloud Run, showcasing a complete development-to-deployment workflow.

**Live Demo:** [https://my-url-shortener-a1b2c3d4ef-uc.a.run.app](https://my-url-shortener-a1b2c3d4ef-uc.a.run.app)  
*(Note: Replace with your actual deployed URL!)*

**Admin Dashboard:** [https://my-url-shortener-a1b2c3d4ef-uc.a.run.app/admin/dashboard](https://my-url-shortener-a1b2c3d4ef-uc.a.run.app/admin/dashboard)  
*(Note: Replace with your actual deployed URL!)*

---

## ✨ Features

This project is more than just a simple app; it's a demonstration of production-ready engineering concepts.

### Frontend
- **Modern, Responsive UI:** A creative and animated user interface built with HTML5 and CSS3, ensuring a great experience on any device.
- **Dynamic Results:** Real-time feedback when a URL is shortened, including the new link and a direct link to its analytics page.
- **Asynchronous API Calls:** Uses the `fetch` API to communicate with the backend without reloading the page.
- **Visual Feedback:** Interactive elements with hover effects, loading states, and copy-to-clipboard animations.

### Backend
- **RESTful API:** A clean API endpoint (`/api/shorten`) for creating new short URLs.
- **High-Performance Redirects:** The core of the service, redirecting short URLs to their original destination with a 301 status code.
- **Full Analytics Suite:**
    - **Individual Link Tracking:** Every link has its own stats page (`/:shortKey/stats`) showing clicks and creation date.
    - **Overall Service Dashboard:** A comprehensive admin panel (`/admin/dashboard`) displaying service-wide metrics and a detailed table of all generated links.

### Production-Scale Simulations
To demonstrate an understanding of scalable systems, this application simulates several key production features:
- **Base62 Encoding:** Generates clean, unique, non-sequential short URL keys from a numeric counter, just like production systems (e.g., `bit.ly`). This is more efficient and predictable than using random strings.
- **Simulated Redis Caching:** Implements an in-memory cache to simulate how a high-speed data store like Redis would be used. The first request for a URL queries the "database," while subsequent requests are served instantly from the "cache," dramatically reducing latency.
- **API Rate Limiting:** Includes middleware to track requests by IP address and temporarily block users who exceed a certain number of requests in a given time window, protecting the service from abuse.

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center"><strong>Creative Landing Page</strong></td>
    <td align="center"><strong>Shortened Link Result</strong></td>
  </tr>
  <tr>
    <td><img src="https://github.com/shyamsunder0717/URL-Shortener-Site/blob/main/views/Running%20desktop.png" alt="Running Desktop Screenshot" width="100%"></td>
    <td><img src="https://github.com/shyamsunder0717/URL-Shortener-Site/blob/main/views/result%20page.png" alt="Result Screenshot" width="100%"></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><strong>Admin Analytics Dashboard</strong></td>
  </tr>
  <tr>
    <td colspan="2"><img src="https://github.com/shyamsunder0717/URL-Shortener-Site/blob/main/views/dashboard.png" alt="Dashboard Screenshot" width="100%"></td>
  </tr>
</table>

---

## 🛠️ Tech Stack & Architecture

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3 (with animations), Vanilla JavaScript (ES6+)
- **Architecture:** RESTful API, Containerized Application
- **Deployment:**
    - **Containerization:** Docker
    - **Hosting:** Google Cloud Run
    - **Container Registry:** Google Artifact Registry

---

## 🚀 Running Locally

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shyamsunder0717/URL-Shortener-Site.git
    cd URL-Shortener-Site
    ```

2.  **Install dependencies:**
    (Requires Node.js and npm installed)
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    node server.js
    ```

4.  **Open the application:**
    - Main App: [http://localhost:3000](http://localhost:3000)
    - Admin Dashboard: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

---

## ☁️ Deployment to Google Cloud

This application is designed for easy deployment to a serverless platform like Google Cloud Run.

1.  **Prerequisites:**
    - Google Cloud SDK (`gcloud`) installed and configured.
    - A Google Cloud project with Billing, Cloud Run API, and Artifact Registry API enabled.

2.  **Deploy Command:**
    From the root of the project directory, run the following command. The `Dockerfile` in the repository contains all the necessary instructions.

    ```bash
    gcloud run deploy my-url-shortener --source . --allow-unauthenticated
    ```

This command will automatically containerize the application, push the image to Google Artifact Registry, and deploy it as a public service on Cloud Run.
