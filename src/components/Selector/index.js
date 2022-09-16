import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

const Selector = props => {

    const handleChange = (e) => {
        props.handleSelectorChange(e.target.value);
    }

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Platform</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                // value={age}
                label="Age"
                onChange={handleChange}
            // onChange={handleChange}
            >
                <MenuItem value={"Desktop"} >Desktop</MenuItem>
                <MenuItem value={"MSite"} >M-Site</MenuItem>
                <MenuItem value={"MSite,Desktop"} >Both</MenuItem>
            </Select>
        </FormControl>
    );
}

export default Selector;