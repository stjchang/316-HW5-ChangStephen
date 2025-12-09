import { useContext, useEffect, useState } from 'react';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';
import storeRequestSender from '../store/requests';
import MUIDeleteModal from './MUIDeleteModal';
import MUIEditPlaylistModal from './MUIEditPlaylistModal';
import MUIPlayPlaylistModal from './MUIPlayPlaylistModal';
import PlaylistCard from './PlaylistCard';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function PlaylistsScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [playlists, setPlaylists] = useState([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [playingPlaylist, setPlayingPlaylist] = useState(null);
    const [showPlayModal, setShowPlayModal] = useState(false);
    
    // left side search fields
    const [searchByName, setSearchByName] = useState('');
    const [searchByUser, setSearchByUser] = useState('');
    const [searchBySongTitle, setSearchBySongTitle] = useState('');
    const [searchBySongArtist, setSearchBySongArtist] = useState('');
    const [searchBySongYear, setSearchBySongYear] = useState('');
    const [sortBy, setSortBy] = useState('listenerNames-hi-lo');

    useEffect(() => {
        loadPlaylists();
    }, []);

    useEffect(() => {
        if (store && store.listMarkedForDeletion === null && !loading) {
            const timer = setTimeout(() => {
                loadPlaylists();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [store?.listMarkedForDeletion]);

    useEffect(() => {
        applyFiltersAndSort();
    }, [playlists, searchByName, searchByUser, searchBySongTitle, searchBySongArtist, searchBySongYear, sortBy, auth.loggedIn, auth.user]);

    const loadPlaylists = async () => {
        try {
            setLoading(true);
            const response = await storeRequestSender.getAllPlaylists();
            if (response.success) {
                setPlaylists(response.data || []);
            }
        } catch (error) {
            console.error("Error loading playlists:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let filtered = [...playlists];

        const hasSearchQuery = searchByName.trim() || searchByUser.trim() || searchBySongTitle.trim() 
                            || searchBySongArtist.trim() || searchBySongYear.trim();    

        //if nothign in search, only shwo crrent users playlists
        if (!hasSearchQuery && auth.loggedIn && auth.user && auth.user.email) {
            filtered = filtered.filter(playlist => 
                playlist.ownerEmail === auth.user.email
            );
        }

        if (searchByName.trim()) {
            const query = searchByName.toLowerCase().trim();
            filtered = filtered.filter(playlist => 
                playlist.name.toLowerCase().includes(query)
            );
        }

        if (searchByUser.trim()) {
            const query = searchByUser.toLowerCase().trim();
            filtered = filtered.filter(playlist => 
                playlist.ownerEmail.toLowerCase().includes(query)
            );
        }

        if (searchBySongTitle.trim()) {
            const query = searchBySongTitle.toLowerCase().trim();
            filtered = filtered.filter(playlist => 
                playlist.songs && playlist.songs.some(song => 
                    song.title && song.title.toLowerCase().includes(query)
                )
            );
        }

        if (searchBySongArtist.trim()) {
            const query = searchBySongArtist.toLowerCase().trim();
            filtered = filtered.filter(playlist => 
                playlist.songs && playlist.songs.some(song => 
                    song.artist && song.artist.toLowerCase().includes(query)
                )
            );
        }

        if (searchBySongYear.trim()) {
            const query = searchBySongYear.trim();
            filtered = filtered.filter(playlist => 
                playlist.songs && playlist.songs.some(song => 
                    song.year && song.year.toString().includes(query)
                )
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'listenerNames-hi-lo':
                    const listenerNamesA = (a.listenerNames && a.listenerNames.length) || 0;
                    const listenerNamesB = (b.listenerNames && b.listenerNames.length) || 0;
                    return listenerNamesB - listenerNamesA;
                
                case 'listenerNames-lo-hi':
                    const listenerNamesALo = (a.listenerNames && a.listenerNames.length) || 0;
                    const listenerNamesBLo = (b.listenerNames && b.listenerNames.length) || 0;
                    return listenerNamesALo - listenerNamesBLo;
                
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                
                case 'user-asc':
                    return a.ownerEmail.localeCompare(b.ownerEmail);
                
                case 'user-desc':
                    return b.ownerEmail.localeCompare(a.ownerEmail);
                
                default:
                    return 0;
            }
        });

        setFilteredPlaylists(filtered);
    };

    const handleSearch = () => {
        applyFiltersAndSort();
    };

    const handleClear = () => {
        setSearchByName('');
        setSearchByUser('');
        setSearchBySongTitle('');
        setSearchBySongArtist('');
        setSearchBySongYear('');
    };

    const handleCreatePlaylist = async () => {
        if (!auth.loggedIn) {
            return;
        }
        try {
            const newListName = "Untitled Playlist";
            const response = await storeRequestSender.createPlaylist(
                newListName,
                [],
                auth.user.email
            );
            if (response.playlist) {
                setEditingPlaylist(response.playlist);
                setShowEditModal(true);
                loadPlaylists();
            }
        } catch (error) {
            console.error("Error creating playlist:", error);
        }
    };

    const handleEditPlaylistComplete = async () => {
        await loadPlaylists();
        setShowEditModal(false);
        setEditingPlaylist(null);
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading playlists...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: '#FFFACD' }}>
            {/* Left Panel - Filters */}
            <Box sx={{ 
                width: '300px', 
                p: 3, 
                bgcolor: '#FFFACD',
                borderRight: '1px solid #ddd',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Typography 
                    variant="h4" 
                    component="h1"
                    sx={{ 
                        fontWeight: 'bold', 
                        color: '#8932CC',
                        mb: 3,
                        fontSize: '2rem'
                    }}
                >
                    Playlists
                </Typography>

                {/* Search Fields in Panel*/}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    <TextField
                        placeholder="by Playlist Name"
                        value={searchByName}
                        onChange={(e) => setSearchByName(e.target.value)}
                        size="small"
                        InputProps={{
                            endAdornment: searchByName && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchByName('')}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        placeholder="by User Name"
                        value={searchByUser}
                        onChange={(e) => setSearchByUser(e.target.value)}
                        size="small"
                        InputProps={{
                            endAdornment: searchByUser && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchByUser('')}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        placeholder="by Song Title"
                        value={searchBySongTitle}
                        onChange={(e) => setSearchBySongTitle(e.target.value)}
                        size="small"
                        InputProps={{
                            endAdornment: searchBySongTitle && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchBySongTitle('')}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        placeholder="by Song Artist"
                        value={searchBySongArtist}
                        onChange={(e) => setSearchBySongArtist(e.target.value)}
                        size="small"
                        InputProps={{
                            endAdornment: searchBySongArtist && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchBySongArtist('')}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        placeholder="by Song Year"
                        value={searchBySongYear}
                        onChange={(e) => setSearchBySongYear(e.target.value)}
                        size="small"
                        InputProps={{
                            endAdornment: searchBySongYear && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchBySongYear('')}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Search and Clear Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
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
            </Box>

            {/* Playlists List */}
            <Box sx={{ 
                flex: 1, 
                p: 3, 
                bgcolor: '#FFFACD',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto'
            }}>
                {/* Sort and Count Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" sx={{ color: '#666' }}>
                            Sort:
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                                value={sortBy}
                                onChange={handleSortChange}
                                displayEmpty
                                sx={{
                                    bgcolor: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#8932CC',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#702963',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#8932CC',
                                    },
                                }}
                            >
                                <MenuItem value="listenerNames-hi-lo">Listener Count (Hi-Lo)</MenuItem>
                                <MenuItem value="listenerNames-lo-hi">Listener Count (Lo-Hi)</MenuItem>
                                <MenuItem value="name-asc">Playlist Name (A-Z)</MenuItem>
                                <MenuItem value="name-desc">Playlist Name (Z-A)</MenuItem>
                                <MenuItem value="user-asc">User Name (A-Z)</MenuItem>
                                <MenuItem value="user-desc">User Name (Z-A)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                        {filteredPlaylists.length} Playlist{filteredPlaylists.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {filteredPlaylists.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                            No playlists found.
                        </Typography>
                    ) : (
                        filteredPlaylists.map((playlist) => (
                            <PlaylistCard
                                key={playlist._id}
                                playlist={playlist}
                                onEditComplete={() => loadPlaylists()}
                                onPlay={(updatedPlaylist) => {
                                    const playlistToPlay = updatedPlaylist || playlist;
                                    setPlayingPlaylist(playlistToPlay);
                                    setShowPlayModal(true);
                                }}
                                onPlaylistUpdate={(updatedPlaylist) => {
                                    setPlaylists(prevPlaylists => {
                                        const updated = prevPlaylists.map(p => 
                                            p._id === updatedPlaylist._id ? { ...updatedPlaylist } : p
                                        );
                                        return updated;
                                    });
                                    setFilteredPlaylists(prevFiltered => {
                                        const updated = prevFiltered.map(p => 
                                            p._id === updatedPlaylist._id ? { ...updatedPlaylist } : p
                                        );
                                        return updated;
                                    });
                                }}
                                onCopy={async () => {
                                    try {
                                        if (store.copyPlaylist) {
                                            await store.copyPlaylist(playlist._id);
                                        } else {
                                            await storeRequestSender.copyPlaylist(playlist._id);
                                        }
                                        await loadPlaylists();
                                    } catch (error) {
                                        console.error("Error copying playlist:", error);
                                    }
                                }}
                                onDelete={() => store.markListForDeletion(playlist._id)}
                                isOwner={auth.loggedIn && playlist.ownerEmail === auth.user?.email}
                                listenerNamesCount={(playlist.listenerNames && playlist.listenerNames.length) || 0}
                            />
                        ))
                    )}
                </Box>

                {auth.loggedIn && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreatePlaylist}
                        sx={{
                            mt: 2,
                            bgcolor: '#8932CC',
                            '&:hover': { bgcolor: '#702963' },
                            borderRadius: '20px',
                            alignSelf: 'flex-start'
                        }}
                    >
                        New Playlist
                    </Button>
                )}
            </Box>

            <MUIDeleteModal />
            <MUIEditPlaylistModal
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingPlaylist(null);
                }}
                onSubmit={handleEditPlaylistComplete}
                playlist={editingPlaylist}
            />
            <MUIPlayPlaylistModal
                open={showPlayModal}
                onClose={() => {
                    setShowPlayModal(false);
                    setPlayingPlaylist(null);
                }}
                // for updating listener count
                onPlaylistUpdate={(updatedPlaylist) => {
                    setPlaylists(prevPlaylists => {
                        const updated = prevPlaylists.map(p => 
                            p._id === updatedPlaylist._id ? { ...updatedPlaylist } : p
                        );
                        return updated;
                    });
                    setFilteredPlaylists(prevFiltered => {
                        const updated = prevFiltered.map(p => 
                            p._id === updatedPlaylist._id ? { ...updatedPlaylist } : p
                        );
                        return updated;
                    });
                }}
                playlist={playingPlaylist}
            />
        </Box>
    );
}
