import { React, useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import Selector from '../Selector';
import { Container } from '@mui/system';
import CustomizedTables from '../Table';
import getSpeedData from '../../utilities/getPsiData';
import PersistentDrawerLeft from '../Drawer';

const textContainerStyle = {
    width: '70%',
    margin: 20
};

const PerformanceCalculator = props => {
    const [psiConfig, setPsiConfig] = useState({
        numberOfRounds: 3,
        platform: 'desktop,mobile',
        urlListCSV: ''
    });

    const [mobileTestScores, setMobileTestScores] = useState([]);
    const [desktopTestScores, setDesktopTestScores] = useState([]);
    const [mobileMedianScores, setMobileMedianScores] = useState([]);
    const [desktopMedianScores, setDesktopMedianScores] = useState([]);

    const handleChange = (e) => {
        setPsiConfig({ ...psiConfig, [e.target.id ? e.target.id : e.target.name]: e.target.value })
    }

    useEffect(() => {
        getSpeedData({ round: psiConfig?.numberOfRounds, urlListCSV: psiConfig?.urlListCSV, device: psiConfig.platform, setMobileTestScores, setDesktopTestScores, setMobileMedianScores, setDesktopMedianScores });
    }, []);
    console.log(psiConfig)
    return (
        <div>
            <Container>
                <h1>Page Speed Calculator</h1>
                <h4>Please enter the following fields to initiate build:</h4>
                <div>
                    <TextField id="numberOfRounds" label="Number of Test Rounds" variant="standard" style={textContainerStyle} onChange={handleChange} />
                </div>
                <div>
                    <TextField id="urlListCSV" label="Enter URL" variant="standard" style={textContainerStyle}
                        onChange={handleChange} />
                </div>
                <div style={{ width: '30%', margin: 20 }}>
                    <Selector handleSelectorChange={handleChange} />
                </div>
                <div style={{ margin: 20 }}>
                    <Button variant="contained">Build</Button>
                </div>
                <div style={{ margin: 20 }}>
                    <CustomizedTables />
                </div>
            </Container>
        </div>
    );
}

export default PerformanceCalculator;