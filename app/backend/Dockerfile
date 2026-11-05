FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements/requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

RUN sed -i 's/\r$//' entrypoint.sh \
    && chmod +x entrypoint.sh \
    && useradd --create-home --uid 10001 --shell /usr/sbin/nologin cloudforge \
    && chown -R cloudforge:cloudforge /app

USER 10001

EXPOSE 8000

CMD ["./entrypoint.sh"]
