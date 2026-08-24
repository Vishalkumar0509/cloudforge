from django.urls import path
from .views import NoteListCreate

urlpatterns = [
    path('notes/', NoteListCreate.as_view(), name='note-list-create'),
]
