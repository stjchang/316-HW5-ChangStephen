import { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';

import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

export default function HomeBar() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    // Determine if we're on an auth screen (register/login/edit account)
    const isAuthScreen = location.pathname === '/login/' || location.pathname === '/register/' || 
                        location.pathname === '/edit-account/';

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
    };

    const handleHomeClick = () => {
        if (store.navigateToHome) {
            store.navigateToHome();
        } else if (store.closeCurrentList) {
            store.closeCurrentList();
        }
    };

    const handlePlaylistsClick = () => {
        if (store.navigateToPlaylists) {
            store.navigateToPlaylists();
        } else {
            history.push('/playlists');
        }
    };

    const handleSongsCatalogClick = () => {
        if (store.navigateToSongsCatalog) {
            store.navigateToSongsCatalog();
        } else {
            history.push('/songs');
        }
    };

    const handleLoginClick = () => {
        handleMenuClose();
        if (store.navigateToLogin) {
            store.navigateToLogin();
        } else {
            history.push('/login/');
        }
    };

    const handleRegisterClick = () => {
        handleMenuClose();
        if (store.navigateToRegister) {
            store.navigateToRegister();
        } else {
            history.push('/register/');
        }
    };

    const handleEditAccountClick = () => {
        handleMenuClose();
        if (store.navigateToEditAccount) {
            store.navigateToEditAccount();
        } else {
            history.push('/edit-account/');
        }
    };

    const menuId = 'primary-search-account-menu';

    const loggedOutMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleLoginClick}>Login</MenuItem>
            <MenuItem onClick={handleRegisterClick}>Create Account</MenuItem>
        </Menu>
    );

    const loggedInMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleEditAccountClick}>Edit Account</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    const getAccountIcon = () => {
        if (auth.loggedIn && auth.user) {
            if (auth.user.avatarImage) {
                return (
                    <Avatar 
                        src={auth.user.avatarImage} 
                        alt={auth.user.userName}
                        sx={{ width: 40, height: 40 }}
                    />
                );
            } else if (auth.user.userName) {
                const initials = auth.user.userName.substring(0, 2).toUpperCase();
                return (
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}>
                        {initials}
                    </Avatar>
                );
            }
        }
        return <AccountCircle sx={{ fontSize: 40 }} />;
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ 
                            cursor: 'pointer',
                            mr: 3,
                            fontWeight: 'bold'
                        }}
                        onClick={handleHomeClick}
                    >
                        The Playlister
                    </Typography>

                    {!isAuthScreen && (
                        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                            <Button 
                                color="blue" 
                                onClick={handlePlaylistsClick}
                                sx={{ textTransform: 'none' }}
                            >
                                Playlists
                            </Button>
                            {auth.loggedIn && (
                                <Button 
                                    color="blue" 
                                    onClick={handleSongsCatalogClick}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Songs Catalog
                                </Button>
                            )}
                        </Box>
                    )}

                    {isAuthScreen && <Box sx={{ flexGrow: 1 }} />}

                    <Box>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account menu"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            // color="inherit"
                        >
                            {getAccountIcon()}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {/* Account Menu */}
            {auth.loggedIn ? loggedInMenu : loggedOutMenu}
        </Box>
    );
}

