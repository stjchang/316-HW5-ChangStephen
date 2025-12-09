import { useState, useEffect, useContext, useRef } from 'react'
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import storeRequestSender from '../store/requests';
import authRequestSender from '../auth/requests';
import YouTube from 'react-youtube';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';

import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RepeatIcon from '@mui/icons-material/Repeat';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '1400px',
    height: '85%',
    maxHeight: '900px',
    border: '3px solid #000',
    boxShadow: 24,
    overflow: 'hidden',
    display: 'flex',
    bgcolor: '#E8F5E9',
};

export default function MUIPlayPlaylistModal({ open, onClose, playlist = null, onPlaylistUpdate = null }) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [youtubePlayer, setYoutubePlayer] = useState(null);
    const [playlistData, setPlaylistData] = useState(null);
    const [ownerData, setOwnerData] = useState(null);
    const [isLooping, setIsLooping] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [lastPlayedSongId, setLastPlayedSongId] = useState(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (playlist && open) {
            async function loadPlaylist() {
                try {
                    const response = await storeRequestSender.getPlaylistById(playlist._id, true);
                    if (response.success) {
                        setPlaylistData(response.playlist);
                        setCurrentSongIndex(0);
                        
                        if (onPlaylistUpdate) {
                            onPlaylistUpdate(response.playlist);
                        }
                        
                        if (response.playlist.ownerEmail) {
                            if (auth.loggedIn && auth.user && auth.user.email === response.playlist.ownerEmail) {
                                setOwnerData({
                                    userName: auth.user.userName,
                                    email: auth.user.email,
                                    avatarImage: auth.user.avatarImage
                                });
                            } else {
                                try {
                                    const ownerResponse = await authRequestSender.getUserByEmail(response.playlist.ownerEmail);
                                    if (ownerResponse.success) {
                                        setOwnerData(ownerResponse.user);
                                    }
                                } catch (error) {
                                    console.error("Error fetching owner data:", error);
                                }
                            }
                        }
                        
                        if (auth.loggedIn && auth.user) {
                        }
                    }
                } catch (error) {
                    console.error("Error loading playlist:", error);
                }
            }
            loadPlaylist();
        } else if (!open) {
            if (youtubePlayer) {
                try {
                    youtubePlayer.stopVideo();
                    youtubePlayer.destroy();
                } catch (error) {
                    console.error("Error stopping YouTube player:", error);
                }
                setYoutubePlayer(null);
            }
            setPlaylistData(null);
            setOwnerData(null);
            setCurrentSongIndex(0);
            setLastPlayedSongId(null);
        }
    }, [playlist?._id, open, auth.loggedIn]);

    useEffect(() => {
        return () => {
            if (youtubePlayer) {
                try {
                    youtubePlayer.stopVideo();
                    youtubePlayer.destroy();
                } catch (error) {
                }
            }
        };
    }, [youtubePlayer]);

    const displayPlaylist = playlistData || playlist;
    const songs = displayPlaylist?.songs || [];
    const currentSong = songs[currentSongIndex] || null;
    const ownerEmail = displayPlaylist?.ownerEmail || playlist?.ownerEmail || '';
    
    // default blue image (200x200)
    const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzE5NzZkMiIvPjwvc3ZnPg==';

    const getAccountIcon = () => {
        if (ownerData) {
            if (ownerData.avatarImage) {
                return (
                    <Avatar 
                        src={ownerData.avatarImage} 
                        alt={ownerData.userName || ownerEmail}
                        sx={{ width: 70, height: 70 }}
                        onError={(e) => {
                            e.target.src = defaultAvatar;
                        }}
                    />
                );
            } else if (ownerData.userName) {
                const initials = ownerData.userName.substring(0, 2).toUpperCase();
                return (
                    <Avatar sx={{ width: 70, height: 70, bgcolor: '#8932CC' }}>
                        {initials}
                    </Avatar>
                );
            }
        }
        return (
            <Avatar 
                src={defaultAvatar}
                sx={{ width: 70, height: 70 }}
            />
        );
    };

    const handleSongClick = (index) => {
        setCurrentSongIndex(index);
        if (youtubePlayer && songs[index]?.youTubeId) {
            youtubePlayer.loadVideoById(songs[index].youTubeId);
        }
    };

    const handlePrevious = () => {
        if (currentSongIndex > 0) {
            const newIndex = currentSongIndex - 1;
            setCurrentSongIndex(newIndex);
            if (youtubePlayer && songs[newIndex]?.youTubeId) {
                youtubePlayer.loadVideoById(songs[newIndex].youTubeId);
            }
        }
    };

    const handleNext = () => {
        if (currentSongIndex < songs.length - 1) {
            const newIndex = currentSongIndex + 1;
            setCurrentSongIndex(newIndex);
            if (youtubePlayer && songs[newIndex]?.youTubeId) {
                youtubePlayer.loadVideoById(songs[newIndex].youTubeId);
                setTimeout(() => {
                    if (youtubePlayer) {
                        youtubePlayer.playVideo();
                    }
                }, 500); 
            }
        } else if (isLooping && songs.length > 0) {
            setCurrentSongIndex(0);
            if (youtubePlayer && songs[0]?.youTubeId) {
                youtubePlayer.loadVideoById(songs[0].youTubeId);
                setTimeout(() => {
                    if (youtubePlayer) {
                        youtubePlayer.playVideo();
                    }
                }, 500);
            }
        }
    };

    const handlePlay = () => {
        if (youtubePlayer && currentSong?.youTubeId) {
            youtubePlayer.playVideo();
            setIsPlaying(true);
        }
    };

    const onPlayerReady = (event) => {
        try {
            playerRef.current = event.target;
            setYoutubePlayer(event.target);
            if (currentSong?.youTubeId) {
                event.target.loadVideoById(currentSong.youTubeId);
            }
        } catch (error) {
            console.error("Error setting up YouTube player:", error);
        }
    };

    const onPlayerStateChange = async (event) => {
        //  player states:
        // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused)
        if (event.data === 1) {
            // video is playing
            setIsPlaying(true);
            if (currentSong && currentSong.title && currentSong.artist && currentSong.year) {
                try {
                    const allSongsResponse = await storeRequestSender.getAllSongs();
                    if (allSongsResponse && allSongsResponse.success) {
                        const catalogSong = allSongsResponse.data.find(song => 
                            song.title === currentSong.title &&
                            song.artist === currentSong.artist &&
                            song.year === currentSong.year
                        );
                        
                        if (catalogSong && catalogSong._id && catalogSong._id !== lastPlayedSongId) {
                            const currentListens = catalogSong.listens || 0;
                            await storeRequestSender.updateSong(
                                catalogSong._id,
                                undefined, 
                                undefined,
                                undefined, 
                                undefined,
                                currentListens + 1 
                            );
                            setLastPlayedSongId(catalogSong._id);
                        }
                    }
                } catch (error) {
                    console.error("Error incrementing song listens:", error);
                }
            }
        } else if (event.data === 2) {
            // video is paused
            setIsPlaying(false);
        } else if (event.data === 0) {
            // video ended 
            setLastPlayedSongId(null);
            if (isPlaying) {
                if (currentSongIndex < songs.length - 1) {
                    handleNext();
                } else if (isLooping && songs.length > 0) {
                    setCurrentSongIndex(0);
                    if (youtubePlayer && songs[0]?.youTubeId) {
                        youtubePlayer.loadVideoById(songs[0].youTubeId);
                        // loop
                        setTimeout(() => {
                            if (youtubePlayer) {
                                youtubePlayer.playVideo();
                            }
                        }, 500);
                    }
                } else {
                    setIsPlaying(false);
                }
            }
        }
    };

    const handleToggleLoop = () => {
        setIsLooping(!isLooping);
    };

    const youtubeOpts = {
        height: '390',
        width: '100%',
        playerVars: {
            autoplay: 0,
        },
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{ zIndex: 1300 }}
        >
    
            <Box sx={modalStyle}>
                {/* Song Info */}
                <Box sx={{
                    width: '450px',
                    bgcolor: 'white',
                    border: '3px solid #90CAF9',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Title Bar */}
                    <Box sx={{
                        bgcolor: '#8932CC',
                        color: 'white',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                            Play Playlist
                        </Typography>
                    </Box>

                    {/* Playlist Header */}
                    <Box sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: '1px solid #e0e0e0'
                    }}>
                        {getAccountIcon()}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {playlistData?.name || playlist?.name || 'Untitled Playlist'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {ownerData?.userName || playlistData?.ownerEmail || playlist?.ownerEmail || ''}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Songs List */}
                    <Box sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 2
                    }}>
                        {songs.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                                No songs in this playlist.
                            </Typography>
                        ) : (
                            songs.map((song, index) => (
                                <Button
                                    key={index}
                                    fullWidth
                                    onClick={() => handleSongClick(index)}
                                    sx={{
                                        mb: 1,
                                        p: 1.5,
                                        justifyContent: 'flex-start',
                                        textAlign: 'left',
                                        textTransform: 'none',
                                        bgcolor: index === currentSongIndex ? '#F9EF94FF' : 'transparent',
                                        color: 'text.primary',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            bgcolor: index === currentSongIndex ? '#F9EF94FF' : '#f5f5f5'
                                        }
                                    }}
                                >
                                    <Typography variant="body1" sx={{ fontWeight: index === currentSongIndex ? 'bold' : 'normal' }}>
                                        {song.title || 'Untitled'}{song.artist ? ` by ${song.artist}` : ''}{song.year ? ` (${song.year})` : ''}
                                    </Typography>
                                </Button>
                            ))
                        )}
                    </Box>
                </Box>

                {/* Right Panel*/}
                <Box sx={{
                    flex: 1,
                    bgcolor: '#EAC3F5FF',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    position: 'relative'
                }}>
                    {currentSong ? (
                        <>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                                {currentSong.title || 'Untitled'}
                            </Typography>

                            {/* YouTube Player */}
                            <Box sx={{
                                mb: 3,
                                bgcolor: 'black',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                {currentSong.youTubeId ? (
                                    <YouTube
                                        videoId={currentSong.youTubeId}
                                        opts={youtubeOpts}
                                        onReady={onPlayerReady}
                                        onStateChange={onPlayerStateChange}
                                    />
                                ) : (
                                    <Box sx={{
                                        width: '100%',
                                        height: '390px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <Typography>No YouTube ID available</Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Previous, Play, Next, Loop */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 2,
                                mb: 2
                            }}>
                                <IconButton
                                    onClick={handlePrevious}
                                    disabled={currentSongIndex === 0}
                                    sx={{
                                        bgcolor: '#424242',
                                        color: 'white',
                                        width: 48,
                                        height: 48,
                                        '&:hover': { bgcolor: '#616161' },
                                        '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' }
                                    }}
                                >
                                    <SkipPreviousIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handlePlay}
                                    sx={{
                                        bgcolor: '#424242',
                                        color: 'white',
                                        width: 48,
                                        height: 48,
                                        '&:hover': { bgcolor: '#616161' }
                                    }}
                                >
                                    <PlayArrowIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleNext}
                                    disabled={currentSongIndex === songs.length - 1 && !isLooping}
                                    sx={{
                                        bgcolor: '#424242',
                                        color: 'white',
                                        width: 48,
                                        height: 48,
                                        '&:hover': { bgcolor: '#616161' },
                                        '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' }
                                    }}
                                >
                                    <SkipNextIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleToggleLoop}
                                    sx={{
                                        bgcolor: isLooping ? '#8932CC' : '#424242',
                                        color: 'white',
                                        width: 48,
                                        height: 48,
                                        '&:hover': { bgcolor: isLooping ? '#702963' : '#616161' }
                                    }}
                                >
                                    <RepeatIcon />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                        }}>
                            <Typography variant="h6" color="text.secondary">
                                No songs to play
                            </Typography>
                        </Box>
                    )}

                    {/* Close Button */}
                    <Button
                        variant="contained"
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            bgcolor: '#F84D4DFF',
                            color: 'white',
                            '&:hover': { bgcolor: '#F84D4DFF' },
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

