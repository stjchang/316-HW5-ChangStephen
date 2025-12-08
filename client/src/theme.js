import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#8932CC',
            dark: '#702963',
            light: '#CBC3E3',
            contrastText: '#fff',
        },
        secondary: {
            main: '#8932CC',
            dark: '#702963',
            light: '#CBC3E3',
            contrastText: '#fff',
        },
        error: {
            main: '#d32f2f',
            dark: '#c62828',
            light: '#ef5350',
            contrastText: '#fff',
        },
        success: {
            main: '#2e7d32',
            dark: '#1b5e20',
            light: '#4caf50',
            contrastText: '#fff',
        },
        info: {
            main: '#1976d2',
            dark: '#1565c0',
            light: '#42a5f5',
            contrastText: '#fff',
        },
        warning: {
            main: '#ed6c02',
            dark: '#e65100',
            light: '#ff9800',
            contrastText: '#fff',
        },
        background: {
            default: '#FFFACD', 
            paper: '#fff',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
        },
    },
    typography: {
        fontFamily: '"Lexend Exa", "Roboto", "Helvetica", "Arial", sans-serif',
    },
});

export default theme;

