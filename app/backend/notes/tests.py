from rest_framework import status
from rest_framework.test import APITestCase

from .models import Note


class NoteListCreateTests(APITestCase):
    def setUp(self):
        self.url = "/api/notes/"

    def test_list_notes_returns_200(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_note_returns_201(self):
        payload = {
            "title": "CloudForge Test",
            "content": "Testing note creation through the API.",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Note.objects.count(), 1)
        self.assertEqual(Note.objects.first().title, "CloudForge Test")

    def test_created_note_appears_in_list(self):
        Note.objects.create(
            title="Existing Note",
            content="Testing note retrieval.",
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Existing Note")

    def test_create_note_without_title_is_rejected(self):
        payload = {"content": "A note without a title"}

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Note.objects.count(), 0)
