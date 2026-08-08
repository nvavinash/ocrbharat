# import os
# import tempfile
# import uvicorn
# from fastapi import FastAPI, UploadFile, File, HTTPException
# from fastapi.middleware.cors import CORSMiddleware

# # Initialize PaddleOCR engine for Hindi ('hi')
# try:
#     from paddleocr import PaddleOCR
#     ocr_engine = PaddleOCR(use_angle_cls=True, lang='hi', show_log=False)
# except Exception as e:
#     print(f"PaddleOCR Engine initialization warning: {e}")
#     ocr_engine = None

# app = FastAPI(title="Hindi Handwriting PaddleOCR Microservice")

# # Enable CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# def health_check():
#     return {
#         "success": True,
#         "message": "Hindi PaddleOCR Microservice is active."
#     }

# @app.post("/ocr")
# async def extract_hindi_text(image: UploadFile = File(...)):
#     """
#     Accept an uploaded image, process with PaddleOCR (Hindi), and return JSON response.
#     Expected JSON:
#     {
#       "success": true,
#       "ocrText": "..."
#     }
#     """
#     temp_file_path = None
#     try:
#         file_bytes = await image.read()
#         if not file_bytes:
#             raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

#         ext = os.path.splitext(image.filename)[1] if image.filename else ".png"
#         if not ext:
#             ext = ".png"

#         # Save temporarily for PaddleOCR
#         with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
#             temp_file.write(file_bytes)
#             temp_file_path = temp_file.name

#         if ocr_engine is None:
#             raise RuntimeError("PaddleOCR engine is not loaded on python service.")

#         # Run PaddleOCR analysis
#         results = ocr_engine.ocr(temp_file_path, cls=True)

#         extracted_lines = []
#         if results and results[0]:
#             for line in results[0]:
#                 if line and len(line) >= 2:
#                     text_str = line[1][0]
#                     if text_str:
#                         extracted_lines.append(text_str.strip())

#         ocr_text = " ".join(extracted_lines)

#         return {
#             "success": True,
#             "ocrText": ocr_text
#         }

#     except Exception as err:
#         return {
#             "success": False,
#             "ocrText": "",
#             "error": str(err)
#         }
#     finally:
#         if temp_file_path and os.path.exists(temp_file_path):
#             try:
#                 os.remove(temp_file_path)
#             except Exception:
#                 pass

# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

import os
import tempfile
import json
import uvicorn

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware


# Disable oneDNN if needed
os.environ["FLAGS_use_mkldnn"] = "0"


# Initialize PaddleOCR
try:
    from paddleocr import PaddleOCR

    ocr_engine = PaddleOCR(
        lang="devanagari",
        use_textline_orientation=True
    )

    print("PaddleOCR initialized successfully")

except Exception as e:
    print(f"PaddleOCR initialization error: {e}")
    ocr_engine = None



app = FastAPI(
    title="Hindi Handwriting PaddleOCR Microservice"
)


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def health_check():

    return {
        "success": True,
        "message": "Hindi PaddleOCR Microservice is active."
    }



@app.post("/ocr")
async def extract_hindi_text(
    image: UploadFile = File(...)
):

    temp_file_path = None

    try:

        file_bytes = await image.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty"
            )


        ext = os.path.splitext(
            image.filename
        )[1] or ".png"


        # Create temporary image
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=ext
        ) as temp_file:

            temp_file.write(file_bytes)
            temp_file_path = temp_file.name



        if ocr_engine is None:
            raise Exception(
                "OCR engine not loaded"
            )


        # PaddleOCR 3.x API
        # results = ocr_engine.predict(
        #     temp_file_path
        # )
        # results = ocr_engine.ocr(
        # temp_file_path,
        # cls=True
        # )

        # extracted_lines = []


        # for result in results:

        #     data = result.json


        #     if isinstance(data, str):
        #         data = json.loads(data)


        #     texts = (
        #         data
        #         .get("res", {})
        #         .get("rec_texts", [])
        #     )


        #     extracted_lines.extend(texts)



        # ocr_text = " ".join(
        #     extracted_lines
        # )


        # return {
        #     "success": True,
        #     "ocrText": ocr_text
        # }

    # Run PaddleOCR

        results = ocr_engine.ocr(
            temp_file_path,
            cls=True
        )


        extracted_lines = []


        if results and results[0]:

            for line in results[0]:

                text = line[1][0]

                extracted_lines.append(
                      text.strip()
                )


        ocr_text = " ".join(extracted_lines)


        return {
            "success": True,
        "ocrText": ocr_text
        }

    except Exception as err:

        return {
            "success": False,
            "ocrText": "",
            "error": str(err)
        }



    finally:

        if temp_file_path and os.path.exists(
            temp_file_path
        ):

            os.remove(
                temp_file_path
            )




if __name__ == "__main__":

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )