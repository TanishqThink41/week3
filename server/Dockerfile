FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

EXPOSE 8000

# Run Gunicorn instead of Django's runserver
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
