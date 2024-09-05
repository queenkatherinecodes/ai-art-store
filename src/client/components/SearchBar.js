import React from 'react';
import { Box, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    const handleClear = () => {
        setSearchTerm('');
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                    backgroundColor: 'var(--input-bg-color)',
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'var(--input-border-color)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'var(--accent-color)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'var(--accent-color)',
                        },
                    },
                    '& .MuiInputBase-input': {
                        color: 'var(--text-color)',
                    },
                    '& .MuiInputBase-input::placeholder': {
                        color: 'var(--text-color)',
                        opacity: 0.7,
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'var(--text-color)' }} />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="clear search"
                                onClick={handleClear}
                                edge="end"
                                sx={{ color: 'var(--text-color)' }}
                            >
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
};

export default SearchBar;