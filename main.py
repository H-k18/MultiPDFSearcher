from fastapi import FastAPI, WebSocket, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import fitz  # PyMuPDF
import spacy
app = FastAPI()
nlp = spacy.load("en_core_web_sm")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to ["http://localhost:5173"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ✅ Folder for PDFs
PDF_FOLDER = "pdfs"
os.makedirs(PDF_FOLDER, exist_ok=True)
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
            start_idx = text_lower.find(keyword_lower)
            snippet_start = max(0, start_idx - 30)
            snippet_end = start_idx + len(keyword_lower) + 50
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
                        pdf_url = f"http://localhost:8000/pdf/{pdf_file}#page={match['page']}"

                        result = {
                            "pdf_name": pdf_file,
                            "page": match["page"],
                            "snippet": match["snippet"],
                            "download_url": pdf_url
                        }
                        results.append(result)
                        await websocket.send_json(result)

    except Exception as e:
        print(f"❌ Error: {e}")

    finally:
        print("⚠️ WebSocket Disconnected")
        await websocket.close()

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    """Handles PDF uploads and saves them to the pdfs folder."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = os.path.join(PDF_FOLDER, file.filename)

    try:
        with open(file_path, "wb") as f:
            f.write(await file.read())

        print(f"✅ File uploaded successfully: {file.filename}")
        return JSONResponse(content={"message": "File uploaded successfully"}, status_code=200)

    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Upload failed")
    
@app.delete("/delete_pdf/{pdf_name}")
async def delete_pdf(pdf_name: str):
    """Delete a PDF file from the server."""
    file_path = os.path.join(PDF_FOLDER, pdf_name)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"{pdf_name} deleted successfully"}
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/list_pdfs/")
def list_pdfs():
    """Returns a list of uploaded PDFs."""
    return [file for file in os.listdir(PDF_FOLDER) if file.endswith(".pdf")]
