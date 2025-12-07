import { useContext } from 'react'
import GlobalStoreContext from '../store';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const style1 = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 345,
    height: 250,
    backgroundSize: "contain",
    backgroundImage: `url(https://i.insider.com/602ee9ced3ad27001837f2ac?})`,
    border: '3px solid #000',
    padding: '20px',
    boxShadow: 24,
};

export default function MUIDeleteSongModal() {
    const { store } = useContext(GlobalStoreContext);
    let name = "";
    if (store.songMarkedForDeletion) {
        name = store.songMarkedForDeletion.title;
    }
    function handleDeleteSong(event) {
        store.deleteMarkedSong();
    }
    function handleCloseModal(event) {
        store.hideModals();
    }

    return (
        <Modal
        open={store.songMarkedForDeletion !== null}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style1}>
            <Typography sx={{fontWeight: 'bold'}} id="modal-modal-title" variant="h4" component="h2">
                Delete Song
            </Typography>
            <Divider sx={{borderBottomWidth: 5, p: '5px', transform: 'translate(-5.5%, 0%)', width:377}}/>
            <Box sx={{background: "rgb(172,79,198,0.05)"}}>
            <Typography id="modal-modal-description" variant="h6" sx={{color: "#301974" ,fontWeight: 'bold', mt: 1}}>
                Are you sure you want to delete the <Typography display="inline" id="modal-modal-description" variant="h6" sx={{color: "#820747CF" ,fontWeight: 'bold', mt: 2, textDecoration: 'underline'}}>{name}</Typography> song?
            </Typography>
            </Box>
            <Button sx={{opacity: 0.7, color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"60px", mr:"95px"}} variant="outlined" onClick={handleDeleteSong}> Confirm </Button>
            <Button sx={{opacity: 0.50, color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"60px", ml:"102px"}} variant="outlined" onClick={handleCloseModal}> Cancel </Button>
        </Box>
    </Modal>
    );
}

