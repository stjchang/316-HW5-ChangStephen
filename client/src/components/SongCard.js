import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function SongCard(props) {
    const { song, index, onMenuClick, isSelected = false, isOwner = false } = props;

    const formatNumber = (num) => {
        return num ? num.toLocaleString() : '0';
    };

    return (
        <Box
            key={song._id || index}
            sx={{
                bgcolor: isSelected ? '#FFA500' : '#F9EF94FF', 
                border: isOwner ? '3px solid #d32f2f' : '1px solid #d32f2f',
                borderRadius: '4px',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
            }}
            onClick={() => {
                if (props.onSongClick) {
                    props.onSongClick(song);
                }
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                    {song.title || 'Untitled'}{song.artist ? ` by ${song.artist}` : ''}{song.year ? ` (${song.year})` : ''}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                    Listens: {formatNumber(song.listens || 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                    Playlists: {song.playlists?.length || 0}
                </Typography>
            </Box>
            {onMenuClick && (
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onMenuClick(e, song);
                    }}
                    sx={{ ml: 2 }}
                >
                    <MoreVertIcon />
                </IconButton>
            )}
        </Box>
    );
}

export default SongCard;