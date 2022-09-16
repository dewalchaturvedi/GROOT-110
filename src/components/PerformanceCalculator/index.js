import { React } from 'react';
import { Button, TextField } from '@mui/material';
import Selector from '../Selector';
import { Container } from '@mui/system';
import CustomizedTables from '../Table';

const PerformanceCalculator = props => {

    const textContainerStyle = {
        width: '70%',
        margin: 20
    };

    return (
        <Container>
            <h1>Page Speed Calculator</h1>
            <h4>Please enter the following fields to initiate build:</h4>
            <div>
                <TextField id="standard-basic" label="Provide Outer Iteration Value for set run" variant="standard" style={textContainerStyle} />
            </div>
            <div>
                <TextField id="standard-basic" label="Enter Inner Iteration Count" variant="standard" style={textContainerStyle} />
            </div>
            <div>
                <TextField id="standard-basic" label="Enter URL" variant="standard" style={textContainerStyle} />
            </div>
            <div style={{ width: '30%', margin: 20 }}>
                <Selector />
            </div>
            <div style={{ margin: 20 }}>
                <Button variant="contained">Build</Button>
            </div>
            <div style={{ margin: 20 }}>
                <CustomizedTables />
            </div>
        </Container>
    );
}

export default PerformanceCalculator;