import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'
import theme from './theme'
import {
    HomeBar,
    HomeWrapper,
    LoginScreen,
    PlaylistsScreen,
    RegisterScreen,
    CatalogScreen,
    Statusbar
} from './components'

const App = () => {   
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <AuthContextProvider>
                    <GlobalStoreContextProvider>              
                        <HomeBar />
                        <Switch>
                            <Route path="/" exact component={HomeWrapper} />
                            <Route path="/playlists" exact component={PlaylistsScreen} />
                            <Route path="/songs" exact component={CatalogScreen} />
                            <Route path="/login/" exact component={LoginScreen} />
                            <Route path="/register/" exact component={RegisterScreen} />
                            <Route path="/edit-account/" exact component={RegisterScreen} />
                        </Switch>
                        <Statusbar />
                    </GlobalStoreContextProvider>
                </AuthContextProvider>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App