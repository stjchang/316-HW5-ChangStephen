import { useContext } from 'react'
import GlobalStoreContext from '../store';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const style1 = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    height: 300,
    border: '3px solid #000',
    overflow: 'hidden',
};

export default function MUIDeleteSongModal() {
    const { store } = useContext(GlobalStoreContext);
    let name = "";
    if (store.songMarkedForDeletion) {
        name = store.songMarkedForDeletion.title;
    }
    function handleDeleteSong(event) {
        if (event) {
            event.stopPropagation();
        }
        store.deleteMarkedSong();
    }
    function handleCloseModal(event) {
        if (event) {
            event.stopPropagation();
        }
        store.hideModals();
    }

    return (
        <Modal
        open={store.songMarkedForDeletion !== null}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        onClose={handleCloseModal}
        >
        <Box sx={style1}>
            <Box sx={{ 
                bgcolor: '#8932CC', 
                color: 'white', 
                p: 2,
                fontWeight: 'bold'
            }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Remove Song?
                </Typography>
            </Box>
            
            <Box sx={{ 
                bgcolor: '#F6B5FFFF', 
                p: 3,
                height: 'calc(100% - 80px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <Box>
                    <Typography variant="h6" sx={{ color: '#424242', fontWeight: 'bold', mb: 1 }}>
                        Are you sure you want to remove this song from the catalog?
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#424242', mt: 1 }}>
                        Doing so will remove it from playlists you own.
                    </Typography>
                </Box>
                
                {/* Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'space-between' }}>
                    <Button 
                        type="button"
                        sx={{
                            bgcolor: '#424242',
                            color: 'white',
                            '&:hover': { bgcolor: '#616161' },
                            textTransform: 'none',
                            px: 3,
                            py: 1
                        }}
                        onClick={handleDeleteSong}
                    >
                        Remove Song
                    </Button>
                    <Button 
                        type="button"
                        sx={{
                            bgcolor: '#424242',
                            color: 'white',
                            '&:hover': { bgcolor: '#616161' },
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            ml: 'auto'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCloseModal(e);
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

