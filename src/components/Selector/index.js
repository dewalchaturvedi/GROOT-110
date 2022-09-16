import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

const Selector = props => {
    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Platform</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                // value={age}
                label="Age"
            // onChange={handleChange}
            >
                <MenuItem value={10}>Desktop</MenuItem>
                <MenuItem value={20}>M-Site</MenuItem>
                <MenuItem value={30}>Both</MenuItem>
            </Select>
        </FormControl>
    );
}

export default Selector;