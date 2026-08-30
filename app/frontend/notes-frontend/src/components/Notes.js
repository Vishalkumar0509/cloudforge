import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
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

const API_URL = process.env.REACT_APP_API_URL;

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get(
                `${API_URL}/api/notes/`
            );

            console.log('Notes API response:', response.data);

            if (Array.isArray(response.data)) {
                setNotes(response.data);
            } else {
                console.error(
                    'Expected an array of notes, received:',
                    response.data
                );

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

    const addNote = async (event) => {
        event.preventDefault();

        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            return;
        }

        try {
            setError('');

            const response = await axios.post(
                `${API_URL}/api/notes/`,
                {
                    title: title.trim(),
                    content: content.trim(),
                }
            );

            console.log('Add note response:', response.data);

            setNotes((currentNotes) => {
                if (!Array.isArray(currentNotes)) {
                    return [response.data];
                }

                return [...currentNotes, response.data];
            });

            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Failed to add note:', error);
            setError('Failed to add the note.');
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

                    {/* Add Note Section */}
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="h4"
                            gutterBottom
                            sx={{
                                textAlign: 'center',
                                marginBottom: 4,
                            }}
                        >
                            Add a New Note
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={addNote}
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
                                onChange={(e) => setTitle(e.target.value)}
                                variant="outlined"
                            />

                            <TextField
                                fullWidth
                                label="Content"
                                multiline
                                rows={4}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                variant="outlined"
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{
                                    alignSelf: 'center',
                                }}
                            >
                                Add Note
                            </Button>

                            {error && (
                                <Typography
                                    color="error"
                                    sx={{
                                        textAlign: 'center',
                                        marginTop: 1,
                                    }}
                                >
                                    {error}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* Notes List Section */}
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="h4"
                            gutterBottom
                            sx={{
                                textAlign: 'center',
                                marginBottom: 4,
                            }}
                        >
                            Notes List
                        </Typography>

                        {loading ? (
                            <Typography
                                sx={{
                                    textAlign: 'center',
                                }}
                            >
                                Loading notes...
                            </Typography>
                        ) : notes.length === 0 ? (
                            <Typography
                                sx={{
                                    textAlign: 'center',
                                }}
                            >
                                No notes available.
                            </Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {notes.map((note) => (
                                    <Grid
                                        item
                                        xs={12}
                                        key={note.id}
                                    >
                                        <Card
                                            elevation={3}
                                            sx={{
                                                height: '100%',
                                            }}
                                        >
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
                                                        sx={{
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        Created:{' '}
                                                        {new Date(
                                                            note.created_at
                                                        ).toLocaleString()}
                                                    </Typography>
                                                )}
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