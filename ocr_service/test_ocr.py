# from paddleocr import PaddleOCR
# import os

# # Replace with your actual image path
# image_path = r"C:\Users\avina\Downloads\screen.png"

# print("File Exists:", os.path.exists(image_path))

# ocr = PaddleOCR(use_angle_cls=True, lang="hi")

# result = ocr.ocr(image_path, cls=True)

# print("\nOCR Result:")
# print(result)

import paddle
import paddleocr
from paddleocr import PaddleOCR
import os

print("=" * 50)
print("Python:", __import__("sys").executable)
print("Paddle:", paddle.__version__)
print("PaddleOCR:", paddleocr.__version__)
print("Location:", paddleocr.__file__)
print("=" * 50)

image_path = r"C:\Users\avina\Downloads\ARTI-SIGN.jpeg"

print("Image exists:", os.path.exists(image_path))

ocr = PaddleOCR(
    use_angle_cls=True,
    lang="hi"
)

print("OCR Initialized")

result = ocr.ocr(image_path)

print(result)