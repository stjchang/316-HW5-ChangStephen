import { useContext, useEffect, useState, useCallback } from 'react';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';
import storeRequestSender from '../store/requests';
import MUIDeleteSongModal from './MUIDeleteSongModal';
import MUIEditSongModal from './MUIEditSongModal';
import SongCard from './SongCard';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function CatalogScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [songs, setSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchByTitle, setSearchByTitle] = useState('');
    const [searchByArtist, setSearchByArtist] = useState('');
    const [searchByYear, setSearchByYear] = useState('');
    const [sortBy, setSortBy] = useState('listens-desc');
    const [songToEdit, setSongToEdit] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedSong, setSelectedSong] = useState(null);
    const [selectedSongForPlayer, setSelectedSongForPlayer] = useState(null);
    const [isVideoEmbeddable, setIsVideoEmbeddable] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState(null);
    const [lastPlayedSongId, setLastPlayedSongId] = useState(null);

    const loadSongs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await storeRequestSender.getAllSongs();
            console.log("CatalogScreen - getAllSongs response:", response);
            if (response && response.success !== undefined) {
            if (response.success) {
                setSongs(response.data || []);
                } else {
                    console.error("getAllSongs returned success: false", response);
                    setSongs([]);
                }
            } else {
                console.warn("Unexpected response structure:", response);
                setSongs(Array.isArray(response) ? response : (response?.data || []));
            }
        } catch (error) {
            console.error("Error loading songs:", error);
            setSongs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPlaylists = useCallback(async () => {
        if (!auth.loggedIn) return;
        try {
            const response = await storeRequestSender.getAllPlaylists();
            if (response.success) {
                
                const userPlaylists = (response.data || []).filter(
                    playlist => playlist.ownerEmail === auth.user?.email
                );
                const sorted = userPlaylists.sort((a, b) => {
                    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                    return bTime - aTime; 
                });
                setPlaylists(sorted);
            }
        } catch (error) {
            console.error("Error loading playlists:", error);
        }
    }, [auth.loggedIn, auth.user]);

    const applyFiltersAndSort = useCallback(() => {
        let filtered = [...songs];

        // apply search filters
        if (searchByTitle.trim()) {
            const query = searchByTitle.toLowerCase().trim();
            filtered = filtered.filter(song => 
                song.title && song.title.toLowerCase().includes(query)
            );
        }

        if (searchByArtist.trim()) {
            const query = searchByArtist.toLowerCase().trim();
            filtered = filtered.filter(song => 
                song.artist && song.artist.toLowerCase().includes(query)
            );
        }

        if (searchByYear.trim()) {
            const query = searchByYear.trim();
            filtered = filtered.filter(song => 
                song.year && song.year.toString().includes(query)
            );
        }

        // apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'listens-desc':
                    return (b.listens || 0) - (a.listens || 0);
                case 'listens-asc':
                    return (a.listens || 0) - (b.listens || 0);
                case 'playlists-desc':
                    return (b.playlists?.length || 0) - (a.playlists?.length || 0);
                case 'playlists-asc':
                    return (a.playlists?.length || 0) - (b.playlists?.length || 0);
                case 'title-asc':
                    return (a.title || '').localeCompare(b.title || '');
                case 'title-desc':
                    return (b.title || '').localeCompare(a.title || '');
                case 'artist-asc':
                    return (a.artist || '').localeCompare(b.artist || '');
                case 'artist-desc':
                    return (b.artist || '').localeCompare(a.artist || '');
                case 'year-desc':
                    return (b.year || 0) - (a.year || 0);
                case 'year-asc':
                    return (a.year || 0) - (b.year || 0);
                default:
                    return 0;
            }
        });

        setFilteredSongs(filtered);
        
    }, [songs, searchByTitle, searchByArtist, searchByYear, sortBy]);

    useEffect(() => {
        loadSongs();
        loadPlaylists();
    }, []); 

    useEffect(() => {
        if (auth.loggedIn) {
            loadPlaylists();
        }

    }, [auth.loggedIn, auth.user]);

    useEffect(() => {
        if (selectedSongForPlayer && selectedSongForPlayer._id && selectedSongForPlayer._id !== lastPlayedSongId) {
            const incrementListens = async () => {
                try {
                    const currentListens = selectedSongForPlayer.listens || 0;

                    // only update listens
                    await storeRequestSender.updateSong(
                        selectedSongForPlayer._id,
                        undefined,
                        undefined,
                        undefined, 
                        undefined, 
                        currentListens + 1 
                    );

                    setSongs(prevSongs => prevSongs.map(song => 
                        song._id === selectedSongForPlayer._id 
                            ? { ...song, listens: currentListens + 1 }
                            : song
                    ));
                    setLastPlayedSongId(selectedSongForPlayer._id);
                } catch (error) {
                    console.error("Error incrementing song listens:", error);
                }
            };
            incrementListens();
        }
    }, [selectedSongForPlayer?._id]);

    useEffect(() => {
        if (store && store.songMarkedForDeletion === null && !loading) {
            const timer = setTimeout(() => {
            loadSongs();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [store?.songMarkedForDeletion]); 

    useEffect(() => {
        applyFiltersAndSort();
    }, [applyFiltersAndSort]);


    const handleSearch = () => {
        applyFiltersAndSort();
    };

    const handleClear = () => {
        setSearchByTitle('');
        setSearchByArtist('');
        setSearchByYear('');
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const handleMenuOpen = (event, song) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedSong(song);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedSong(null);
    };

    const handleAddSong = () => {
        if (!auth.loggedIn) {
            alert("Please log in to add songs to the catalog.");
            return;
        }
        setSongToEdit({});
    };

    const handleAddSongComplete = async (songData) => {
        try {
            const response = await storeRequestSender.createSong(
                songData.title,
                songData.artist,
                songData.year,
                songData.youTubeId
            );
            if (response.success) {
                setSongToEdit(null);
                loadSongs();
            } else {
                alert(response.errorMessage || "Failed to add song");
            }
        } catch (error) {
            alert(error.message || "Failed to add song");
        }
    };

    const handleEditSong = () => {
        if (!selectedSong) return;
        if (!auth.loggedIn) {
            alert("Please log in to edit songs.");
            handleMenuClose();
            return;
        }
        if (auth.user.email !== selectedSong.ownerEmail) {
            alert("You can only edit songs you added to the catalog.");
            handleMenuClose();
            return;
        }
        setSongToEdit(selectedSong);
        handleMenuClose();
    };

    const handleEditSongComplete = async (songData) => {
        try {
            const response = await storeRequestSender.updateSong(
                songToEdit._id,
                songData.title,
                songData.artist,
                songData.year,
                songData.youTubeId
            );
            if (response.success) {
                setSongToEdit(null);
                loadSongs();
            } else {
                alert(response.errorMessage || "Failed to update song");
            }
        } catch (error) {
            alert(error.message || "Failed to update song");
        }
    };

    const handleDeleteSong = () => {
        if (!selectedSong) return;
        if (!auth.loggedIn) {
            alert("Please log in to remove songs.");
            handleMenuClose();
            return;
        }
        if (auth.user.email !== selectedSong.ownerEmail) {
            alert("You can only remove songs you added to the catalog.");
            handleMenuClose();
            return;
        }
        store.markSongForDeletion(selectedSong);
        handleMenuClose();
    };

    const handleAddToPlaylistClick = (event) => {
        if (!selectedSong) return;
        if (!auth.loggedIn) {
            alert("Please log in to add songs to playlists.");
            handleMenuClose();
            return;
        }

        setPlaylistMenuAnchor(event.currentTarget);
    };

    const handlePlaylistMenuClose = () => {
        setPlaylistMenuAnchor(null);
    };

    const handleAddToSpecificPlaylist = async (playlistId) => {
        if (!selectedSong) return;
        try {
            const response = await storeRequestSender.addSongToPlaylist(playlistId, {
                title: selectedSong.title,
                artist: selectedSong.artist,
                year: selectedSong.year,
                youTubeId: selectedSong.youTubeId,
                ownerEmail: selectedSong.ownerEmail
            });
            if (response.success) {
                handlePlaylistMenuClose();
        handleMenuClose();
                loadPlaylists();
            } else {
                alert(response.errorMessage || "Failed to add song to playlist");
            }
        } catch (error) {
            alert(error.message || "Failed to add song to playlist");
        }
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case 'listens-desc': 
                return 'Listens (Hi-Lo)';
            case 'listens-asc': 
                return 'Listens (Lo-Hi)';
            case 'playlists-desc':
                    return 'Playlists (Hi-Lo)';
            case 'playlists-asc': 
                return 'Playlists (Lo-Hi)';
            case 'title-asc': 
                return 'Title (A-Z)';
            case 'title-desc':
                    return 'Title (Z-A)';
            case 'artist-asc': 
                return 'Artist (A-Z)';
            case 'artist-desc': 
                return 'Artist (Z-A)';
            case 'year-desc': 
                return 'Year (Hi-Lo)';
            case 'year-asc': 
                return 'Year (Lo-Hi)';
            default: return 'Listens (Hi-Lo)';
        }
    };

    const youtubeOpts = {
        height: '390',
        width: '100%',
        playerVars: {
            autoplay: 0,
        },
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: 'calc(100vh - 64px)',
                bgcolor: '#FFF8E1'
            }}>
                <Typography>Loading songs...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            display: 'flex', 
            height: 'calc(100vh - 64px)', 
            bgcolor: '#FFF8E1' 
        }}>
            {/* Left */}
            <Box sx={{ 
                width: '350px', 
                bgcolor: '#FFF8E1',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #e0e0e0'
            }}>
                {/* Title */}
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 'bold', 
                        color: '#8932CC',
                        mb: 3
                    }}
                >
                Songs Catalog
            </Typography>

                {/* Search Fields */}
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="by Title"
                        value={searchByTitle}
                        onChange={(e) => setSearchByTitle(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: searchByTitle && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchByTitle('')}
                                        edge="end"
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        placeholder="by Artist"
                        value={searchByArtist}
                        onChange={(e) => setSearchByArtist(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: searchByArtist && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchByArtist('')}
                                        edge="end"
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        placeholder="by Year"
                        value={searchByYear}
                        onChange={(e) => setSearchByYear(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: searchByYear && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchByYear('')}
                                        edge="end"
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Search / Clear  */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                        sx={{
                            flex: 1,
                            bgcolor: '#8932CC',
                            '&:hover': { bgcolor: '#702963' },
                            borderRadius: '20px'
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleClear}
                        sx={{
                            flex: 1,
                            bgcolor: '#8932CC',
                            '&:hover': { bgcolor: '#702963' },
                            borderRadius: '20px'
                        }}
                    >
                        Clear
                    </Button>
                </Box>

                {/* YouTube Player */}
                <Box sx={{ mt: 'auto' }}>
                    {selectedSongForPlayer && selectedSongForPlayer.youTubeId ? (
                        isVideoEmbeddable ? (
                            <Box>
                                <Box
                                    component="iframe"
                                    src={`https://www.youtube.com/embed/${selectedSongForPlayer.youTubeId}?enablejsapi=1`}
                                    width="100%"
                                    height="390"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    onError={() => {
                                        console.error("YouTube iframe error - video may not be embeddable");
                                        setIsVideoEmbeddable(false);
                                    }}
                                    onLoad={() => {
                                        setTimeout(() => {}, 1000);
                                    }}
                                    sx={{
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        bgcolor: '#000'
                                    }}
                                />
                                <Box sx={{ mt: 1, textAlign: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        href={`https://www.youtube.com/watch?v=${selectedSongForPlayer.youTubeId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        sx={{
                                            borderColor: '#FF0000',
                                            color: '#FF0000',
                                            '&:hover': {
                                                borderColor: '#CC0000',
                                                bgcolor: 'rgba(255, 0, 0, 0.04)'
                                            }
                                        }}
                                    >
                                        Watch on YouTube
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ 
                                width: '100%', 
                                height: '390px', 
                                bgcolor: '#f5f5f5',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                p: 3,
                                gap: 2
                            }}>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                                    Video cannot be embedded
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                                    {selectedSongForPlayer.title || 'This song'}{selectedSongForPlayer.artist ? ` by ${selectedSongForPlayer.artist}` : ''}
                                </Typography>
                                <Button
                                    variant="contained"
                                    href={`https://www.youtube.com/watch?v=${selectedSongForPlayer.youTubeId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        bgcolor: '#FF0000',
                                        '&:hover': { bgcolor: '#CC0000' },
                                        borderRadius: '20px',
                                        px: 4,
                                        py: 1.5
                                    }}
                                >
                                    Watch on YouTube
                                </Button>
                            </Box>
                        )
                    ) : (
                        <Box sx={{ 
                            width: '100%', 
                            height: '390px', 
                            bgcolor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px'
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                Select a song to play
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Right */}
            <Box sx={{ 
                flex: 1, 
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Sort / Count */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    mb: 2
                }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        Sort:
                    </Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                        <Select
                            value={sortBy}
                            onChange={handleSortChange}
                            displayEmpty
                            sx={{
                                bgcolor: 'white',
                                '& .MuiSelect-select': {
                                    py: 1
                                }
                            }}
                        >
                            <MenuItem value="listens-desc">Listens (Hi-Lo)</MenuItem>
                            <MenuItem value="listens-asc">Listens (Lo-Hi)</MenuItem>
                            <MenuItem value="playlists-desc">Playlists (Hi-Lo)</MenuItem>
                            <MenuItem value="playlists-asc">Playlists (Lo-Hi)</MenuItem>
                            <MenuItem value="title-asc">Title (A-Z)</MenuItem>
                            <MenuItem value="title-desc">Title (Z-A)</MenuItem>
                            <MenuItem value="artist-asc">Artist (A-Z)</MenuItem>
                            <MenuItem value="artist-desc">Artist (Z-A)</MenuItem>
                            <MenuItem value="year-desc">Year (Hi-Lo)</MenuItem>
                            <MenuItem value="year-asc">Year (Lo-Hi)</MenuItem>
                        </Select>
                    </FormControl>
                    <Typography variant="body1" sx={{ ml: 'auto' }}>
                        {filteredSongs.length} Song{filteredSongs.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>

                {/* Song Cards */}
                <Box sx={{ flex: 1, mb: 2, overflow: 'auto' }}>
                    {filteredSongs.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', p: 3, color: '#666' }}>
                            {searchByTitle || searchByArtist || searchByYear 
                                ? 'No songs match your search.' 
                                : 'No songs in catalog yet.'}
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {filteredSongs.map((song, index) => (
                                <SongCard
                                    key={song._id || index}
                                    song={song}
                                    index={index}
                                    isSelected={selectedSongForPlayer && selectedSongForPlayer._id === song._id}
                                    isOwner={auth.loggedIn && auth.user && song.ownerEmail === auth.user.email}
                                    onSongClick={(clickedSong) => {
                                        setSelectedSongForPlayer(clickedSong);
                                    }}
                                    onMenuClick={handleMenuOpen}
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                {/* New Song Button  */}
                    {auth.loggedIn && (
                        <Button
                            variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddSong}
                            sx={{
                                bgcolor: '#8932CC',
                            '&:hover': { bgcolor: '#702963' },
                            borderRadius: '20px',
                            alignSelf: 'flex-start',
                            px: 3,
                            mt: 'auto'
                        }}
                    >
                        New Song
                        </Button>
                )}
            </Box>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {auth.loggedIn && (
                    <MenuItem
                        onMouseEnter={handleAddToPlaylistClick}
                        onMouseLeave={handlePlaylistMenuClose}
                        sx={{ position: 'relative' }}
                    >
                        Add to Playlist
                        {playlistMenuAnchor && (
                            <Menu
                                anchorEl={playlistMenuAnchor}
                                open={Boolean(playlistMenuAnchor)}
                                onClose={handlePlaylistMenuClose}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                MenuListProps={{
                                    onMouseLeave: handlePlaylistMenuClose,
                                }}
                                sx={{
                                    pointerEvents: 'auto',
                                }}
                            >
                                {playlists.length === 0 ? (
                                    <MenuItem disabled>No playlists available</MenuItem>
                                ) : (
                                    playlists.slice(0, 5).map((playlist) => (
                                        <MenuItem
                                            key={playlist._id}
                                            onClick={() => handleAddToSpecificPlaylist(playlist._id)}
                                        >
                                            {playlist.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Menu>
                        )}
                    </MenuItem>
                )}
                {selectedSong && auth.loggedIn && auth.user && auth.user.email === selectedSong.ownerEmail && (
                    <>
                        <MenuItem onClick={handleEditSong}>
                            Edit Song
                        </MenuItem>
                        <MenuItem onClick={handleDeleteSong}>
                            Delete Song
                        </MenuItem>
                    </>
                )}
            </Menu>

            {/* Edit Song Modal */}
            {songToEdit && (
                <MUIEditSongModal
                    open={!!songToEdit}
                    onClose={() => setSongToEdit(null)}
                    onSubmit={songToEdit._id ? handleEditSongComplete : handleAddSongComplete}
                    mode={songToEdit._id ? "edit" : "add"}
                    song={songToEdit._id ? songToEdit : null}
                />
            )}

            <MUIDeleteSongModal />
        </Box>
    );
}
