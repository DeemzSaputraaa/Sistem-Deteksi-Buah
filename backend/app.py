import io
import os
from typing import List

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from ultralytics import YOLO

app = FastAPI(title="FruitDetect YOLOv11 API")

# CORS: izinkan akses dari frontend lokal / dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "models/best.pt")

try:
    model = YOLO(MODEL_PATH)
except Exception as exc:
    raise RuntimeError(f"Gagal memuat model dari {MODEL_PATH}: {exc}")

# Mapping nama kelas agar API mengembalikan label buah, bukan metadata model
CLASS_NAMES = os.getenv(
    "YOLO_CLASS_NAMES",
    ",".join(
        [
            "apel",
            "pisang",
            "jeruk",
            "anggur",
            "strawberry",
            "semangka",
            "melon",
            "pepaya",
            "jambu_biji",
            "alpukat",
            "salak",
            "mangga",
        ]
    ),
).split(",")

# Set nama kelas ke model (urutkan sesuai urutan label saat training best.pt)
model.model.names = {i: name for i, name in enumerate(CLASS_NAMES)}


@app.get("/health")
def health():
    return {"status": "ok"}


def _serialize_predictions(results) -> List[dict]:
    serialized = []
    for r in results:
        boxes = r.boxes
        names = r.names
        for box in boxes:
            cls_id = int(box.cls)
            serialized.append(
                {
                    "class": names.get(cls_id, str(cls_id)),
                    "score": float(box.conf),
                    "bbox": [float(x) for x in box.xyxy[0].tolist()],  # [x1, y1, x2, y2]
                }
            )
    return serialized


@app.post("/api/detect")
async def detect(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar")

    try:
        raw_bytes = await image.read()
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Gagal membaca gambar")

    try:
        results = model.predict(source=img, imgsz=640, conf=0.25, verbose=False)
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal menjalankan inferensi")

    preds = _serialize_predictions(results)
    return JSONResponse({"predictions": preds})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
