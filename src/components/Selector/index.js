import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

const Selector = props => {

    const handleChange = (e) => {
        props.handleSelectorChange(e);
    }

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Platform</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                name='platform'
                value={props?.value || ''}
                label="Age"
                onChange={handleChange}
            // onChange={handleChange}
            >
                <MenuItem value={"desktop"} >Desktop</MenuItem>
                <MenuItem value={"mobile"} >M-Site</MenuItem>
                <MenuItem value={"desktop,mobile"} >Both</MenuItem>
            </Select>
        </FormControl>
    );
}

export default Selector;