import React, { useCallback, useEffect, useState } from 'react';
import axios from '../axios';
import {
    TextField,
    Button,
    Typography,
    Container,
    Box,
    Grid,
    Card,
    CardContent,
    Paper,
} from '@mui/material';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get('/api/notes/');

            if (Array.isArray(response.data)) {
                setNotes(response.data);
            } else {
                setNotes([]);
                setError('Invalid response received from the server.');
            }
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            setNotes([]);
            setError('Failed to load notes from the backend.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const resetForm = () => {
        setTitle('');
        setContent('');
        setEditingNoteId(null);
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            return;
        }

        const payload = {
            title: title.trim(),
            content: content.trim(),
        };

        try {
            setError('');

            if (editingNoteId !== null) {
                const response = await axios.put(
                    `/api/notes/${editingNoteId}/`,
                    payload
                );

                setNotes((currentNotes) =>
                    currentNotes.map((note) =>
                        note.id === editingNoteId ? response.data : note
                    )
                );
            } else {
                const response = await axios.post('/api/notes/', payload);

                setNotes((currentNotes) => [
                    ...currentNotes,
                    response.data,
                ]);
            }

            resetForm();
        } catch (error) {
            console.error('Failed to save note:', error);
            setError(
                editingNoteId !== null
                    ? 'Failed to update the note.'
                    : 'Failed to add the note.'
            );
        }
    };

    const startEditing = (note) => {
        setEditingNoteId(note.id);
        setTitle(note.title);
        setContent(note.content);
        setError('');
    };

    const deleteNote = async (noteId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this note?'
        );

        if (!confirmed) return;

        try {
            setError('');
            await axios.delete(`/api/notes/${noteId}/`);

            setNotes((currentNotes) =>
                currentNotes.filter((note) => note.id !== noteId)
            );

            if (editingNoteId === noteId) {
                resetForm();
            }
        } catch (error) {
            console.error('Failed to delete note:', error);
            setError('Failed to delete the note.');
        }
    };

    return (
        <Paper
            sx={{
                backgroundColor: 'rgb(135, 206, 250)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={5}>
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="h4"
                            gutterBottom
                            sx={{ textAlign: 'center', marginBottom: 4 }}
                        >
                            {editingNoteId !== null
                                ? 'Edit Note'
                                : 'Add a New Note'}
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                backgroundColor: 'white',
                                padding: 3,
                                borderRadius: 2,
                                boxShadow: 3,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Title"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                            />

                            <TextField
                                fullWidth
                                label="Content"
                                multiline
                                rows={4}
                                value={content}
                                onChange={(event) =>
                                    setContent(event.target.value)
                                }
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                {editingNoteId !== null
                                    ? 'Update Note'
                                    : 'Add Note'}
                            </Button>

                            {editingNoteId !== null && (
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                            )}

                            {error && (
                                <Typography
                                    color="error"
                                    sx={{ textAlign: 'center', marginTop: 1 }}
                                >
                                    {error}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="h4"
                            gutterBottom
                            sx={{ textAlign: 'center', marginBottom: 4 }}
                        >
                            Notes List
                        </Typography>

                        {loading ? (
                            <Typography sx={{ textAlign: 'center' }}>
                                Loading notes...
                            </Typography>
                        ) : notes.length === 0 ? (
                            <Typography sx={{ textAlign: 'center' }}>
                                No notes available.
                            </Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {notes.map((note) => (
                                    <Grid item xs={12} key={note.id}>
                                        <Card elevation={3}>
                                            <CardContent>
                                                <Typography
                                                    variant="h6"
                                                    gutterBottom
                                                >
                                                    {note.title}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {note.content}
                                                </Typography>

                                                {note.created_at && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        display="block"
                                                        sx={{ marginTop: 2 }}
                                                    >
                                                        Created:{' '}
                                                        {new Date(
                                                            note.created_at
                                                        ).toLocaleString()}
                                                    </Typography>
                                                )}

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1,
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() =>
                                                            startEditing(note)
                                                        }
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() =>
                                                            deleteNote(note.id)
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Paper>
    );
};

export default Notes;
