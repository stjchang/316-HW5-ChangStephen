import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import storeRequestSender from '../store/requests'
import MUIEditPlaylistModal from './MUIEditPlaylistModal'
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AccountCircle from '@mui/icons-material/AccountCircle';


function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const playlist = props.playlist;
    if (!playlist) {
        return null;
    }

    const playlistName = playlist.name || '';
    const playlistId = playlist._id || '';
    const ownerEmail = playlist.ownerEmail || '';
    const listenerCount = props.listenerCount || (playlist.listeners?.length || 0);
    const isOwner = props.isOwner || false;

    const handlePlay = () => {
        if (props.onPlay) {
            props.onPlay();
        } 
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (props.onEdit) {
            props.onEdit();
        } else {
            setShowEditModal(true);
        }
    };

    const handleCopy = (e) => {
        e.stopPropagation();
        if (props.onCopy) {
            props.onCopy();
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (props.onDelete) {
            props.onDelete();
        } else {
            store.markListForDeletion(playlistId);
        }
    };

    const handleEditPlaylistComplete = async (playlistData) => {
        try {
            const updatedPlaylist = { ...playlist, name: playlistData.name };
            const response = await storeRequestSender.updatePlaylist(playlistId, updatedPlaylist);
            if (response.success) {
                setShowEditModal(false);
                if (props.onEditComplete) {
                    props.onEditComplete();
                }
            }
        } catch (error) {
            console.error("Error updating playlist:", error);
        }
    };

    const handleExpandPlaylist = (e) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };  

    return (
        <Box sx={{ 
            mb: 1.5, 
            p: 2, 
            bgcolor: 'white', 
            borderRadius: 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
            }}>
                {/* Owner Avatar */}
                <Avatar sx={{ bgcolor: '#8932CC', width: 50, height: 50 }}>
                    <AccountCircle sx={{ fontSize: 35 }} />
                </Avatar>

                {/* Playlist Name, Owner, and Listener Count */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {playlistName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {ownerEmail}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'medium' }}>
                        {listenerCount} Listener{listenerCount !== 1 ? 's' : ''}
                    </Typography>
                </Box>

                {/* Play, Copy, Edit, and Delete Buttons */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                    {isOwner && (
                        <>
                            <Button
                                size="small"
                                variant="contained"
                                sx={{ 
                                    bgcolor: '#d32f2f', 
                                    '&:hover': { bgcolor: '#c62828' }, 
                                    minWidth: '70px',
                                    textTransform: 'none',
                                    fontSize: '0.875rem'
                                }}
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                sx={{ 
                                    bgcolor: '#1976d2', 
                                    '&:hover': { bgcolor: '#1565c0' }, 
                                    minWidth: '70px',
                                    textTransform: 'none',
                                    fontSize: '0.875rem'
                                }}
                                onClick={handleEdit}
                            >
                                Edit
                            </Button>
                        </>
                    )}
                    {auth.loggedIn && (
                        <Button
                            size="small"
                            variant="contained"
                            sx={{ 
                                bgcolor: '#2e7d32', 
                                '&:hover': { bgcolor: '#1b5e20' }, 
                                minWidth: '70px',
                                textTransform: 'none',
                                fontSize: '0.875rem'
                            }}
                            onClick={handleCopy}
                        >
                            Copy
                        </Button>
                    )}
                    <Button
                        size="small"
                        variant="contained"
                        sx={{ 
                            bgcolor: '#8932CC', 
                            '&:hover': { bgcolor: '#702963' }, 
                            minWidth: '70px',
                            textTransform: 'none',
                            fontSize: '0.875rem'
                        }}
                        onClick={handlePlay}
                    >
                        Play
                    </Button>
                    <IconButton 
                        size="small"
                        sx={{ ml: 0.5 }}
                        onClick={handleExpandPlaylist}
                    >
                        {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </Box>
            </Box>
            
            {/* Dropdown Songs List */}
            {expanded && playlist.songs && playlist.songs.length > 0 && (
                <Box sx={{ 
                    mt: 2, 
                    pt: 2, 
                    borderTop: '1px solid #e0e0e0',
                    pl: 9
                }}>
                    {playlist.songs.slice(0, 3).map((song, index) => (
                        <Typography 
                            key={index} 
                            variant="body2" 
                            sx={{ 
                                color: 'text.secondary',
                                mb: 0.5
                            }}
                        >
                            {index + 1}. {song.title || 'Untitled'}{song.artist ? ` by ${song.artist}` : ''}{song.year ? ` (${song.year})` : ''}
                        </Typography>
                    ))}
                </Box>
            )}
            
            {/* <MUIEditPlaylistModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleEditPlaylistComplete}
                playlist={playlist}
            /> */}
        </Box>
    );
}

export default PlaylistCard;