#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."

until python -c 'import os, psycopg2; psycopg2.connect(
dbname=os.environ["POSTGRES_DB"],
user=os.environ["POSTGRES_USERNAME"],
password=os.environ["POSTGRES_PASSWORD"],
host=os.environ["POSTGRES_HOST"],
port=os.environ["POSTGRES_PORT"]
).close()'
do
    echo "PostgreSQL not ready, retrying..."
    sleep 2
done

echo "PostgreSQL is ready!"

echo "Running Django migrations..."
python manage.py migrate

echo "Starting Django..."
exec python manage.py runserver 0.0.0.0:8000
