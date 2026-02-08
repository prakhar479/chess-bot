FROM python:3.11-slim

WORKDIR /app
COPY pyproject.toml README.md API.md DESIGN.md /app/
COPY chessbot /app/chessbot
COPY bots /app/bots

RUN pip install --no-cache-dir .

EXPOSE 8000
CMD ["python", "-m", "chessbot.web.app"]
