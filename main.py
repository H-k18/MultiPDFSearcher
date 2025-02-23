from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
import os
import fitz  # PyMuPDF
import spacy

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

# ✅ Serve PDFs as static files
PDF_FOLDER = "pdfs"
app.mount("/pdf", StaticFiles(directory=PDF_FOLDER), name="pdfs")

def search_keyword_in_pdf(pdf_path, keyword):
    """Search for a keyword inside a PDF and return matches."""
    matches = []
    pdf = fitz.open(pdf_path)
    keyword_lower = keyword.lower()

    for page_num in range(len(pdf)):
        text = pdf[page_num].get_text("text")
        text_lower = text.lower()

        if keyword_lower in text_lower:
            # Find the keyword position safely
            start_idx = text_lower.find(keyword_lower)
            snippet_start = max(0, start_idx - 30)  # Ensure no negative index
            snippet_end = start_idx + len(keyword_lower) + 50  # Adjust snippet length
            snippet = text[snippet_start:snippet_end].strip()

            matches.append({
                "page": page_num + 1,
                "snippet": snippet
            })

    return matches

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handle WebSocket communication for real-time PDF search."""
    await websocket.accept()
    print("✅ WebSocket Connected")

    try:
        while True:
            keyword = await websocket.receive_text()
            print(f"🔍 Searching for: {keyword}")

            results = []
            for pdf_file in os.listdir(PDF_FOLDER):
                if pdf_file.endswith(".pdf"):
                    pdf_path = os.path.join(PDF_FOLDER, pdf_file)
                    matches = search_keyword_in_pdf(pdf_path, keyword)

                    for match in matches:
                        # ✅ Construct URL to open the PDF at the correct page
                        pdf_url = f"http://localhost:8000/pdf/{pdf_file}#page={match['page']}"

                        result = {
                            "pdf_name": pdf_file,
                            "page": match["page"],
                            "snippet": match["snippet"],
                            "download_url": pdf_url  # ✅ Directly opens PDF at the correct page
                        }
                        results.append(result)
                        await websocket.send_json(result)

    except Exception as e:
        print(f"❌ Error: {e}")

    finally:
        print("⚠️ WebSocket Disconnected")
        await websocket.close()
