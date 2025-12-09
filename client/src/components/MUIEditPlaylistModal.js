import { useState, useEffect, useContext } from 'react'
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { GlobalStoreContext, GlobalStoreActionType } from '../store';
import AuthContext from '../auth';
import storeRequestSender from '../store/requests';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DeleteIcon from '@mui/icons-material/Delete';

const style1 = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    height: 600,
    border: '3px solid #000',
    boxShadow: 24,
    overflow: 'hidden',
    bgcolor: '#F6B5FFFF',
    display: 'flex',
    flexDirection: 'column',
};

export default function MUIEditPlaylistModal({ open, onClose, onSubmit, playlist = null }) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const [name, setName] = useState('');
    const [localPlaylist, setLocalPlaylist] = useState(null);

    useEffect(() => {
        if (playlist && open) {
            async function loadPlaylist() {
                try {
                    const response = await storeRequestSender.getPlaylistById(playlist._id, false);
                    if (response.success) {
                        const loadedPlaylist = response.playlist;
                        setLocalPlaylist(loadedPlaylist);
                        setName(loadedPlaylist.name || '');
                        
                        if (store.setCurrentListForEditing) {
                            store.setCurrentListForEditing(loadedPlaylist);
                        }
                    }
                } catch (error) {
                    console.error("Error loading playlist:", error);
                }
            }
            loadPlaylist();
        } else if (!open) {
            setLocalPlaylist(null);
            setName('');
            if (store.closeCurrentList) {
                store.closeCurrentList();
            }
        }
    }, [playlist?._id, open]);


    const currentPlaylist = store.currentList;
    const songs = currentPlaylist?.songs || [];

    function handleUpdateName(event) {
        const newName = event.target.value;
        setName(newName);
    }

    function handleClearName() {
        setName('');
    }

    function handleAddSong() {
        onClose();
        history.push('/catalog');
    }

    function handleDuplicateSong(index) {
        if (currentPlaylist && songs[index]) {
            const songToDuplicate = { ...songs[index] };
            const newIndex = index + 1;
            const ownerEmail = auth.loggedIn && auth.user ? auth.user.email : null;
            store.addCreateSongTransaction(
                newIndex,
                "Copy of " + songToDuplicate.title,
                songToDuplicate.artist,
                songToDuplicate.year,
                songToDuplicate.youTubeId || '',
                ownerEmail
            );
        }
    }

    function handleRemoveSong(index) {
        if (currentPlaylist && songs[index]) {
            store.addRemoveSongTransaction(songs[index], index);
        }
    }

    function handleDragStart(event, index) {
        event.dataTransfer.setData("song", index);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDragEnter(event) {
        event.preventDefault();
    }

    function handleDragLeave(event) {
        event.preventDefault();
    }

    function handleDrop(event, targetIndex) {
        event.preventDefault();
        const sourceIndex = Number(event.dataTransfer.getData("song"));
        
        if (sourceIndex !== targetIndex && !isNaN(sourceIndex)) {
            store.addMoveSongTransaction(sourceIndex, targetIndex);
        }
    }

    function handleUndo() {
        if (store.canUndo()) {
            store.undo();
        }
    }

    function handleRedo() {
        if (store.canRedo()) {
            store.redo();
        }
    }

    async function handleClose() {
        if (currentPlaylist) {
            const finalName = name.trim() || currentPlaylist.name;
            if (finalName && currentPlaylist.name !== finalName) {
                currentPlaylist.name = finalName;
                await store.updateCurrentList();
            }
        }
        
        if (onSubmit && currentPlaylist) {
            onSubmit({
                name: name.trim() || currentPlaylist.name
            });
        }
        
        // Clear currentList
        if (store.closeCurrentList) {
            store.closeCurrentList();
        }
        
        onClose();
    }

    if (!currentPlaylist) {
        return null;
    }

    const hasName = name.trim().length > 0;

    return (
        <Modal
            open={open}
            onClose={hasName ? handleClose : undefined}
        >
            <Box sx={style1}>
                {/* Top Bar */}
                <Box sx={{ 
                    bgcolor: '#8932CC', 
                    color: 'white', 
                    p: 1,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', ml: 1 }}>
                        Edit Playlist
                    </Typography>
                </Box>

                {/* Title Bar Change Name + Add Song */}
                <Box sx={{ 
                    bgcolor: '#e0e0e0', 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <TextField
                        value={name}
                        onChange={handleUpdateName}
                        placeholder="Playlist Name"
                        variant="outlined"
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }
                        }}
                    />
                    <IconButton 
                        onClick={handleClearName}
                        sx={{ 
                            bgcolor: 'white',
                            '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        endIcon={<MusicNoteIcon />}
                        onClick={handleAddSong}
                        sx={{
                            bgcolor: '#8932CC',
                            '&:hover': { bgcolor: '#702963' },
                            borderRadius: '20px',
                            px: 3
                        }}
                    >
                        Add Song
                    </Button>
                </Box>

                {/* Songs List */}
                <Box sx={{ 
                    flex: 1, 
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                }}>
                    {songs.length === 0 ? (
                        <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', mt: 4 }}>
                            No songs in this playlist. (Click "Add Song" to add songs).
                        </Typography>
                    ) : (
                        songs.map((song, index) => (
                            <Box
                                key={index}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                sx={{
                                    bgcolor: '#F9EF94FF',
                                    borderRadius: '10px',
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    cursor: 'move',
                                    '&:hover': {
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 'medium', flex: 1 }}>
                                    {index + 1}. {song.title || 'Untitled'}{song.artist ? ` by ${song.artist}` : ''}{song.year ? ` (${song.year})` : ''}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDuplicateSong(index)}
                                        sx={{
                                            bgcolor: 'white',
                                            '&:hover': { bgcolor: '#f5f5f5' }
                                        }}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveSong(index)}
                                        sx={{
                                            bgcolor: 'white',
                                            '&:hover': { bgcolor: '#ffebee' }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>

                {/* Bottom Bar - Undo/Redo/Close*/}

                <Box sx={{ 
                    bgcolor: '#8932CC', 
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<UndoIcon />}
                            onClick={handleUndo}
                            disabled={!store.canUndo()}
                            sx={{
                                bgcolor: '#8932CC',
                                '&:hover': { bgcolor: '#702963' },
                                '&:disabled': { bgcolor: '#ccc' },
                                borderRadius: '20px'
                            }}
                        >
                            Undo
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<RedoIcon />}
                            onClick={handleRedo}
                            disabled={!store.canRedo()}
                            sx={{
                                bgcolor: '#8932CC',
                                '&:hover': { bgcolor: '#702963' },
                                '&:disabled': { bgcolor: '#ccc' },
                                borderRadius: '20px'
                            }}
                        >
                            Redo
                        </Button>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={handleClose}
                        disabled={!hasName}
                        sx={{
                            bgcolor: hasName ? '#F84D4DFF' : '#ccc',
                            '&:hover': hasName ? { bgcolor: '#C62424FF' } : {},
                            '&:disabled': { bgcolor: '#ccc', color: '#999' },
                            borderRadius: '20px',
                            px: 4
                        }}
                    >
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
