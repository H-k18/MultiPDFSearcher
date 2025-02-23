from fastapi import FastAPI, WebSocket
import fitz  # PyMuPDF
import spacy
import os

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

PDF_FOLDER = "pdfs"  # Folder where PDFs are stored

def search_keyword_in_pdf(pdf_path, keyword):
    matches = []
    doc = nlp(keyword.lower())  # Convert keyword to NLP format
    pdf = fitz.open(pdf_path)

    for page_num in range(len(pdf)):
        text = pdf[page_num].get_text("text")
        text_lower = text.lower()

        if keyword.lower() in text_lower:
            start_idx = text_lower.index(keyword.lower())
            snippet = text[max(0, start_idx - 30): start_idx + 50]  # Extract snippet
            matches.append({"page": page_num + 1, "snippet": snippet.strip()})

    return matches

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        keyword = await websocket.receive_text()
        results = []

        for pdf_file in os.listdir(PDF_FOLDER):
            if pdf_file.endswith(".pdf"):
                pdf_path = os.path.join(PDF_FOLDER, pdf_file)
                matches = search_keyword_in_pdf(pdf_path, keyword)
                for match in matches:
                    results.append({"pdf_name": pdf_file, "page": match["page"], "snippet": match["snippet"]})
                    await websocket.send_json(results[-1])  # Send results in real-time
