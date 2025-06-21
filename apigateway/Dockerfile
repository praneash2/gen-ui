FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# ✅ This works because your FastAPI app is in main.py and uses `if __name__ == "__main__"`
CMD ["python", "main.py"]
