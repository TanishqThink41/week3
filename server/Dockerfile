FROM python:3.10-slim

# Disable interactive prompts during apt installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Tesseract OCR and clean up apt cache for a smaller image
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Set the container's working directory
WORKDIR /app

# Copy the pip requirements file and install the dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files into the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Run Gunicorn to serve the Django project. Adjust the wsgi module as needed.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]