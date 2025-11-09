import { useEffect, useState } from "react";
import axios from "axios";
import { getCareerData } from "../api/gemini";
import "./GeminiSuggestions.css";

export default function GeminiSuggestions({ career }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!career) return;
      setLoading(true);
      setError("");
      try {
        const data = await getCareerData(career);
        setSuggestions(data || []);
      } catch (err) {
        setError("Unable to fetch suggestions. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [career]);

  async function handleUpload() {
    if (!uploadFile) return setUploadStatus("Please select a PDF file first.");
    setUploadStatus("Uploading...");
    const fd = new FormData();
    fd.append("file", uploadFile, uploadFile.name);
    try {
      const res = await axios.post("/api/upload_program", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data && res.data.ok) {
        setUploadStatus("Upload successful: " + (res.data.message || ""));
      } else if (res.data && res.data.error) {
        setUploadStatus("Upload failed: " + res.data.error);
      } else {
        setUploadStatus("Upload completed.");
      }
    } catch (err) {
      setUploadStatus("Upload error: " + (err.message || err));
    }
  }

  return (
    <div className="gemini-container">
      <h3>Gemini Suggestions</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 8 }}>Upload MDC program PDF: </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setUploadFile(e.target.files[0])}
          />
          <button onClick={handleUpload} style={{ marginLeft: 8 }}>
            Upload
          </button>
          <div style={{ marginTop: 6, color: "#333" }}>{uploadStatus}</div>
        </div>
      {loading && <p className="dots">Thinking</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && suggestions.length === 0 && (
        <p style={{ color: "red" }}>No suggestions returned from Gemini.</p>
      )}
      <div className="suggestions-container">
        {suggestions.map((item, i) => (
          <div key={i} className="suggestion-card">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
