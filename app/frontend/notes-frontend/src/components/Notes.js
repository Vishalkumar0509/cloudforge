import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Box, Grid, Card, CardContent, CardActions, Paper } from '@mui/material';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        const response = await axios.get('/api/notes/');
        setNotes(response.data);
    };

    const addNote = async () => {
        const response = await axios.post('/api/notes/', { title, content });
        setNotes([...notes, response.data]);
        setTitle('');
        setContent('');
    };

    return (
        <Paper
            sx={{
                backgroundColor: 'rgb(135,206,250)', // Light blue background
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
            }}
        >
            <Container maxWidth="lg">
                <Box display="flex" justifyContent="space-between">
                    <Box flex={1} mr={4}>
                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', marginBottom: 4 }}>
                            Add a New Note
                        </Typography>
                        <Box
                            mb={4}
                            component="form"
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
                            <Button variant="contained" color="primary" onClick={addNote} sx={{ alignSelf: 'center' }}>
                                Add Note
                            </Button>
                        </Box>
                    </Box>
                    <Box flex={1}>
                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', marginBottom: 4 }}>
                            Notes List
                        </Typography>
                        <Grid container spacing={3}>
                            {notes.map((note) => (
                                <Grid item xs={12} key={note.id}>
                                    <Card elevation={3} sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {note.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {note.content}
                                            </Typography>
                                        </CardContent>
                                        {/* <CardActions>
                                            <Button size="small" color="primary">
                                                Edit
                                            </Button>
                                            <Button size="small" color="secondary">
                                                Delete
                                            </Button>
                                        </CardActions> */}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </Paper>
    );
};

export default Notes;
