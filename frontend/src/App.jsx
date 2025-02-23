import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [pdfList, setPdfList] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(""); // ✅ Upload success message

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResults((prev) => [...prev, data]);
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  const fetchPdfs = async () => {
    try {
      const response = await fetch("http://localhost:8000/list_pdfs/");
      const data = await response.json();
      setPdfList(data);
    } catch (error) {
      console.error("Failed to fetch PDFs:", error);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  const handleFileUpload = async () => {
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      setUploadMessage("❌ Only PDF files are allowed!");
      setTimeout(() => setUploadMessage(""), 2000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadMessage("✅ File uploaded successfully!");
        setFile(null);
        fetchPdfs();
        setTimeout(() => setUploadMessage(""), 1000);
      } else {
        setUploadMessage(`❌ ${result.detail}`);
        setTimeout(() => setUploadMessage(""), 2000);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadMessage("❌ Upload failed! Try again.");
      setTimeout(() => setUploadMessage(""), 2000);
    }
  };

  const handleSearch = () => {
    if (socket && keyword.trim()) {
      setResults([]);
      socket.send(keyword);
      setShowWelcome(false);
    }
  };

  const deletePDF = async (pdfName) => {
    try {
      const response = await fetch(`http://localhost:8000/delete_pdf/${pdfName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPdfList(pdfList.filter((pdf) => pdf !== pdfName));
      } else {
        console.error("Failed to delete PDF");
      }
    } catch (error) {
      console.error("Error deleting PDF:", error);
    }
  };

  return (
    <div className="container">
      {showWelcome && (
        <div className="welcome-message">
          <h1 className="fade-in">Welcome to MultiPDF Searcher</h1>
          <p className="fade-in">Find keywords in multiple PDFs instantly!</p>
        </div>
      )}

      <div className="upload-container">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleFileUpload}>Upload</button>
        {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
      </div>

      <div className="pdf-list">
        <h2>Uploaded PDFs:</h2>
        <ul>
          {pdfList.map((pdf, index) => (
            <li key={index}>
              <span>{pdf}</span>
              <div className="pdf-buttons">
                <a href={`http://localhost:8000/pdf/${pdf}`} download target = "_blank" className="download-button">
                  Download
                </a>
                <button className="delete-btn" onClick={() => deletePDF(pdf)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <h1>MultiPDF Searcher</h1>
      <div className="search-container">
        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter a keyword..." />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="results">
        {results.length > 0 && <h2>Results:</h2>}
        {results.length === 0 && !showWelcome && <h2 className="shake">No Match Found</h2>}
        <ul>
          {results.map((res, index) => (
            <li key={index}>
              <strong>{res.pdf_name}</strong> - Page {res.page}: {res.snippet}
              <a href={res.download_url} download className="download-button">Download PDF</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
