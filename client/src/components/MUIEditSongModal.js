import { useState, useEffect } from 'react'
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    border: '3px solid #000',
    boxShadow: 24,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
};

export default function MUIEditSongModal({ open, onClose, onSubmit, mode = "edit", song = null }) {
    const [ title, setTitle ] = useState('');
    const [ artist, setArtist ] = useState('');
    const [ year, setYear ] = useState('');
    const [ youTubeId, setYouTubeId ] = useState('');

    useEffect(() => {
        if (mode === "edit" && song) {
            setTitle(song.title || '');
            setArtist(song.artist || '');
            setYear(song.year?.toString() || '');
            setYouTubeId(song.youTubeId || '');
        } else {
            setTitle('');
            setArtist('');
            setYear('');
            setYouTubeId('');
        }
    }, [mode, song, open]);

    function handleConfirmEditSong() {
        onSubmit({
            title: title.trim(),
            artist: artist.trim(),
            year: parseInt(year),
            youTubeId: youTubeId.trim()
        });
    }

    function handleCancelEditSong() {
        onClose();
    }

    // clear buttons
    function handleClearTitle() {
        setTitle('');
    }

    function handleClearArtist() {
        setArtist('');
    }

    function handleClearYear() {
        setYear('');
    }

    function handleClearYouTubeId() {
        setYouTubeId('');
    }

    const isCompleteDisabled = !title.trim() || !artist.trim() || !year.trim() || !youTubeId.trim();

    return (
        <Modal
            open={open}
            onClose={handleCancelEditSong}
        >
            <Box sx={modalStyle}>
                {/* Header */}
                <Box sx={{
                    bgcolor: '#8932CC', 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center'
                }}>
            <Typography 
                        sx={{
                            fontWeight: 'bold',
                            color: 'white',
                            fontSize: '1.25rem'
                        }}
                    >
                Edit Song
            </Typography>
                </Box>

                <Box sx={{
                    bgcolor: '#C990F5FF', 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    {/* Title  */}
                    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ 
                            color: '#424242', 
                            fontSize: '1rem', 
                            fontWeight: 'medium',
                            mb: 0.5
                        }}>
                            Title
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Title"
                                fullWidth
                                variant="standard"
                                InputLabelProps={{
                                    shrink: false
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        bgcolor: '#E0E0E0', 
                                        px: 1,
                                        py: 0.5
                                    },
                                    '& .MuiInput-underline:before': {
                                        borderBottom: '1px solid #424242'
                                    },
                                    '& .MuiInput-underline:after': {
                                        borderBottom: '1px solid #424242'
                                    }
                                }}
                            />
                            {title && (
                                <IconButton
                                    onClick={handleClearTitle}
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        bgcolor: 'rgba(0,0,0,0.1)',
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' }
                                    }}
                                >
                                    <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    {/* Artist  */}
                    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ 
                            color: '#424242', 
                            fontSize: '1rem', 
                            fontWeight: 'medium',
                            mb: 0.5
                        }}>
                            Artist
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                placeholder="Artist"
                                fullWidth
                                variant="standard"
                                InputLabelProps={{
                                    shrink: false
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        bgcolor: '#E0E0E0',
                                        px: 1,
                                        py: 0.5
                                    },
                                    '& .MuiInput-underline:before': {
                                        borderBottom: '1px solid #424242'
                                    },
                                    '& .MuiInput-underline:after': {
                                        borderBottom: '1px solid #424242'
                                    }
                                }}
                            />
                            {artist && (
                                <IconButton
                                    onClick={handleClearArtist}
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        bgcolor: 'rgba(0,0,0,0.1)',
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' }
                                    }}
                                >
                                    <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    {/* Year  */}
                    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ 
                            color: '#424242', 
                            fontSize: '1rem', 
                            fontWeight: 'medium',
                            mb: 0.5
                        }}>
                            Year
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="Year"
                                fullWidth
                                variant="standard"
                                InputLabelProps={{
                                    shrink: false
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        bgcolor: '#E0E0E0',
                                        px: 1,
                                        py: 0.5
                                    },
                                    '& .MuiInput-underline:before': {
                                        borderBottom: '1px solid #424242'
                                    },
                                    '& .MuiInput-underline:after': {
                                        borderBottom: '1px solid #424242'
                                    }
                                }}
                            />
                            {year && (
                                <IconButton
                                    onClick={handleClearYear}
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        bgcolor: 'rgba(0,0,0,0.1)',
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' }
                                    }}
                                >
                                    <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    {/* YouTube Id  */}
                    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ 
                            color: '#424242', 
                            fontSize: '1rem', 
                            fontWeight: 'medium',
                            mb: 0.5
                        }}>
                            YouTube Id
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                value={youTubeId}
                                onChange={(e) => setYouTubeId(e.target.value)}
                                placeholder="YouTube Id"
                                fullWidth
                                variant="standard"
                                InputLabelProps={{
                                    shrink: false
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        bgcolor: '#E0E0E0',
                                        px: 1,
                                        py: 0.5
                                    },
                                    '& .MuiInput-underline:before': {
                                        borderBottom: '1px solid #424242'
                                    },
                                    '& .MuiInput-underline:after': {
                                        borderBottom: '1px solid #424242'
                                    }
                                }}
                            />
                            {youTubeId && (
                                <IconButton
                                    onClick={handleClearYouTubeId}
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        bgcolor: 'rgba(0,0,0,0.1)',
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' }
                                    }}
                                >
                                    <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        mt: 2,
                        justifyContent: 'space-between'
                    }}>
            <Button 
                            onClick={handleConfirmEditSong}
                            disabled={isCompleteDisabled}
                            sx={{
                                flex: 1,
                                bgcolor: '#B55AFFFF',
                                color: '#FFFFFFFF', 
                                border: '2px solid #424242',
                                borderRadius: '20px',
                                py: 1,
                                '&:hover': {
                                    bgcolor: '#D0D0D0'
                                },
                                '&:disabled': {
                                    bgcolor: '#E0E0E0',
                                    color: '#9E9E9E'
                                }
                            }}
                        >
                            Complete
                        </Button>
            <Button 
                            onClick={handleCancelEditSong}
                            sx={{
                                flex: 1,
                                bgcolor: '#F46262FF',
                                color: 'white',
                                borderRadius: '20px',
                                py: 1,
                                '&:hover': {
                                    bgcolor: '#616161'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
        </Box>
        </Modal>
    );
}