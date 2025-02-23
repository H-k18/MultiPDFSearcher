# 📄 MultiPDFSearcher

MultiPDFSearcher is a React-based web application that allows users to search for specific keywords across multiple open PDF files in real-time. The app connects to a WebSocket server to fetch search results dynamically.

## 🚀 Features
- 🔍 **Search Across Multiple PDFs**: Enter a keyword to find matches in multiple PDF documents.
- ⚡ **Real-Time Results**: Uses WebSockets to display search results instantly.
- 🎨 **User-Friendly Interface**: Simple and clean UI.
- 📄 **Results Overview**: Displays matched PDFs, page numbers, and snippets of text.

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/H-k18/MultiPDFSearcher.git
cd MultiPDFSearcher
```

### 2️⃣ Install Dependencies
Make sure you have **Node.js** installed, then run:
```sh
npm install
```

### 3️⃣ Run the Application
Start the React development server:
```sh
npm start
```
The app will be available at **`http://localhost:3000`**.

---

## 🔧 Backend Setup (WebSocket Server)
This application requires a WebSocket server to fetch search results. You can create a **FastAPI WebSocket server** using Python. Below is a simple example:

```python
from fastapi import FastAPI, WebSocket
import json

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        keyword = await websocket.receive_text()
        # Simulating a search result (Replace with actual logic)
        results = [{"pdf_name": "example.pdf", "page": 5, "snippet": "Keyword found in context..."}]
        await websocket.send_text(json.dumps(results))
```

Run this FastAPI server using:
```sh
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 📸 Screenshots
![MultiPDFSearcher UI](https://via.placeholder.com/800x400?text=MultiPDFSearcher+Screenshot)

---

## 🎨 Technologies Used
- **Frontend**: React, CSS
- **Backend**: FastAPI (WebSocket Server)
- **Communication**: WebSockets

---

## 🤝 Contributing
Contributions are welcome! If you’d like to improve this project:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m "Added new feature"`).
4. Push to your branch (`git push origin feature-branch`).
5. Open a **Pull Request** on GitHub.

---

## 📜 License
This project is **open-source** and available under the **MIT License**.

---

## ⭐ Show Some Love
If you find this project useful, please ⭐ **star the repository** and share it with others! 🚀🔥
