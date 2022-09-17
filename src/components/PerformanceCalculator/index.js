import { React, useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import Selector from '../Selector';
import { Container } from '@mui/system';
import CustomizedTables from '../Table';
import getSpeedData from '../../utilities/getPsiData';
import PersistentDrawerLeft from '../Drawer';
import Filter from '../Selector/Filter';

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

    const [buildRunning, setBuildRunning] = useState(false);
    const [filter, setFilter] = useState("tests");

    const handleChange = (e) => {
        setPsiConfig({ ...psiConfig, [e.target.id ? e.target.id : e.target.name]: e.target.value })
    }

    // useEffect(() => {
    //     getSpeedData({ round: psiConfig?.numberOfRounds, urlListCSV: psiConfig?.urlListCSV, device: psiConfig.platform, setMobileTestScores, setDesktopTestScores, setMobileMedianScores, setDesktopMedianScores });
    // }, []);
    // console.log(psiConfig)
    const triggerBuild = () => {
        getSpeedData({ round: psiConfig?.numberOfRounds, urlListCSV: psiConfig?.urlListCSV, device: psiConfig.platform, setMobileTestScores, setDesktopTestScores, setMobileMedianScores, setDesktopMedianScores });
        setBuildRunning(true);
    };

    console.log("median", mobileMedianScores, desktopMedianScores);

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
                    <Button variant="contained" onClick={triggerBuild} >Build</Button>
                </div>
                {buildRunning ? <div style={{ marginBottom: 50 }}>
                    {psiConfig.platform === 'desktop,mobile' ?
                        <div>
                            <div style={{ marginBottom: 80 }}>
                                <h4 style={{ marginLeft: '45%' }}>PSI Results : Mobile-Site</h4>
                                <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                    <Filter filter={filter} setFilter={setFilter} />
                                </div>
                                <CustomizedTables testScores={filter === 'tests' ? mobileTestScores : mobileMedianScores} />
                            </div>
                            <div>
                                <h4 style={{ marginLeft: '45%' }}>PSI Results : Desktop</h4>
                                <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                    <Filter filter={filter} setFilter={setFilter} />
                                </div>
                                <CustomizedTables testScores={filter === 'tests' ? desktopTestScores : desktopMedianScores} />
                            </div>
                        </div>
                        :
                        <div>
                            <h4 style={{ marginLeft: '45%' }}>PSI Results</h4>
                            <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                <Filter filter={filter} setFilter={setFilter} />
                            </div>
                            <CustomizedTables hideShimmer={filter === 'median' || (psiConfig.platform === 'mobile' ? mobileMedianScores.length > 0 : desktopMedianScores.length > 0)} testScores={psiConfig.platform === 'mobile' ? (filter === 'tests' ? mobileTestScores : mobileMedianScores) : (filter === 'tests' ? desktopTestScores : desktopMedianScores)} />
                        </div>
                    }
                </div> : null}
            </Container>
        </div>
    );
}

export default PerformanceCalculator;