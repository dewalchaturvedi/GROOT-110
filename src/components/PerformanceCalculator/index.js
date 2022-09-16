import { React, useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import Selector from '../Selector';
import { Container } from '@mui/system';
import CustomizedTables from '../Table';
import getSpeedData from '../../utilities/getPsiData';

const PerformanceCalculator = props => {

    const textContainerStyle = {
        width: '70%',
        margin: 20
    };

    const [psiConfig, setPsiConfig] = useState({
        numberOfRounds: 3,
        platform: 'MSite,Desktop',
        URL: ''
    });

    const handleTestRoundsChange = (e) => {
        setPsiConfig({ ...psiConfig, numberOfRounds: e.target.value })
    }

    const handleURLChange = (e) => {
        setPsiConfig({ ...psiConfig, URL: e.target.value })
    }

    const handleSelectorChange = (value) => {
        setPsiConfig({ ...psiConfig, platform: value })
    }

    console.log(psiConfig)
    useEffect(() => {
        getSpeedData();
    }, []);

    return (
        <Container>
            <h1>Page Speed Calculator</h1>
            <h4>Please enter the following fields to initiate build:</h4>
            <div>
                <TextField id="standard-basic" label="Number of Test Rounds" variant="standard" style={textContainerStyle} onChange={handleTestRoundsChange} />
            </div>
            <div>
                <TextField id="standard-basic" label="Enter URL" variant="standard" style={textContainerStyle}
                    onChange={handleURLChange} />
            </div>
            <div style={{ width: '30%', margin: 20 }}>
                <Selector handleSelectorChange={handleSelectorChange} />
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