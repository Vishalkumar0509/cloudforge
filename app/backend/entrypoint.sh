#!/bin/sh

echo "Waiting for PostgreSQL..."

python manage.py migrate

echo "Starting Django..."

python manage.py runserver 0.0.0.0:8000