import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ListIcon from '@mui/icons-material/List';


const HomeScreen = () => {
    const history = useHistory();

    const handleContinueAsGuest = () => {
        history.push('/playlists');
    };

    const handleLogin = () => {
        history.push('/login/');
    };

    const handleCreateAccount = () => {
        history.push('/register/');
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
            bgcolor: '#FFFACD',
            p: 4,
            border: '1px solid #000'
        }}>
            <Typography 
                variant="h3" 
                component="h1"
                sx={{
                    fontWeight: 'bold',
                    mb: 4,
                    color: '#000',
                    fontSize: '3rem'
                }}
            >
                The Playlister
            </Typography>

            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                mb: 6
            }}>
                <MusicNoteIcon sx={{ fontSize: 80, color: '#000' }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ width: 60, height: 8, bgcolor: '#000', borderRadius: 1 }} />
                    <Box sx={{ width: 60, height: 8, bgcolor: '#000', borderRadius: 1 }} />
                    <Box sx={{ width: 60, height: 8, bgcolor: '#000', borderRadius: 1 }} />
                </Box>
            </Box>

            <Box sx={{ 
                display: 'flex', 
                gap: 3,
                mt: 4
            }}>
                <Button
                    variant="contained"
                    onClick={handleContinueAsGuest}
                    sx={{
                        bgcolor: '#424242',
                        color: '#fff',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: '#616161'
                        }
                    }}
                >
                    Continue as Guest
                </Button>
                <Button
                    variant="contained"
                    onClick={handleLogin}
                    sx={{
                        bgcolor: '#424242',
                        color: '#fff',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: '#616161'
                        }
                    }}
                >
                    Login
                </Button>
                <Button
                    variant="contained"
                    onClick={handleCreateAccount}
                    sx={{
                        bgcolor: '#424242',
                        color: '#fff',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: '#616161'
                        }
                    }}
                >
                    Create Account
                </Button>
            </Box>
        </Box>
    );
}

export default HomeScreen;
