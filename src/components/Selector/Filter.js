import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

const Filter = props => {

    const handleChange = (e) => {
        props.setFilter(e.target.value);
    }

    return (
        <FormControl style={{ width: 150 }}>
            <InputLabel id="demo-simple-select-label">Filter</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                name='platform'
                value={props.filter}
                label="Age"
                onChange={handleChange}
            // onChange={handleChange}
            >
                <MenuItem value={"tests"} onChange={handleChange}>Test Scores</MenuItem>
                <MenuItem value={"median"} onChange={handleChange}>Median Score</MenuItem>
                <MenuItem value={"average"} onChange={handleChange}>Average Score</MenuItem>
            </Select>
        </FormControl>
    );
}

export default Filter;