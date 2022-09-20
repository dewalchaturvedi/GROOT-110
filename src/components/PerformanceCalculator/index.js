import { React, useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import Selector from '../Selector';
import { Container } from '@mui/system';
import CustomizedTables from '../Table';
import getSpeedData from '../../utilities/getPsiData';
import PersistentDrawerLeft from '../Drawer';
import Filter from '../Selector/Filter';
import ToastMessage from '../ToastMessage';

const textContainerStyle = {
    width: '70%',
    margin: 20
};

const PerformanceCalculator = props => {
    const [psiConfig, setPsiConfig] = useState({
        numberOfRounds: 3,
        platform: 'desktop,mobile',
        urlListCSV: '',
        apiKey: '',
    });
    const [isShimmer, setShimmer] = useState({ mobile: true, desktop: true })
    const [mobileTestScores, setMobileTestScores] = useState([]);
    const [desktopTestScores, setDesktopTestScores] = useState([]);
    const [mobileMedianScores, setMobileMedianScores] = useState([]);
    const [desktopMedianScores, setDesktopMedianScores] = useState([]);
    const [mobileAverageScores, setMobileAverageScores] = useState([]);
    const [desktopAverageScores, setDesktopAverageScores] = useState([]);

    const [snackBar, setSnackBar] = useState({
        open: false,
        message: "",
        type: "info",
    });

    const handleClose = () => {
        setSnackBar(snackBar => ({ ...snackBar, open: false, message: '' }));
    };

    const [buildRunning, setBuildRunning] = useState(false);
    const [filter, setFilter] = useState("tests");

    const handleChange = (e) => {
        setPsiConfig({ ...psiConfig, [e.target.id ? e.target.id : e.target.name]: e.target.value })
    }

    useEffect(() => {
        hideShimmer();
    }, [mobileMedianScores, desktopMedianScores]);
    const triggerBuild = () => {
        getSpeedData({ round: psiConfig?.numberOfRounds, urlListCSV: psiConfig?.urlListCSV, device: psiConfig.platform, setMobileTestScores, setDesktopTestScores, setMobileMedianScores, setDesktopMedianScores, setSnackBar, apiKey: psiConfig?.apiKey, setDesktopAverageScores, setMobileAverageScores });
        setBuildRunning(true);
    };

    const hideShimmer = () => {
        if (psiConfig.platform === 'desktop,mobile') {
            setShimmer({ ...isShimmer, mobile: !mobileMedianScores.length > 0, desktop: !desktopMedianScores.length > 0 })
        } else if (psiConfig.platform === 'desktop') {
            setShimmer({ ...isShimmer, desktop: !desktopMedianScores.length > 0 })
        } else if (psiConfig.platform === 'mobile') {
            return setShimmer({ ...isShimmer, mobile: !mobileMedianScores.length > 0 })
        }
    }
    return (
        <div>
            <Container>
                <h1>Page Speed Calculator</h1>
                <h4>Please enter the following data to initiate build</h4>
                <div>
                    <TextField error={psiConfig?.apiKey ? false : true} helperText={!psiConfig?.apiKey && <span>Create your own <a style={{ textDecoration: "none", color: "cornflowerblue" }} target='_blank' href="https://developers.google.com/speed/docs/insights/v5/get-started">Here</a></span>} required id="apiKey"
                        label={"Enter your google cloud API key here"}
                        variant="standard" style={textContainerStyle} onChange={handleChange} />
                </div>
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
                    <Button variant="contained" onClick={triggerBuild} disabled={!psiConfig.numberOfRounds || !psiConfig.urlListCSV || !psiConfig.apiKey}  >Build</Button>
                </div>
                <ToastMessage
                    open={snackBar.open}
                    message={snackBar.message}
                    type={snackBar.type}
                    handleClose={handleClose}
                />
                {buildRunning ? <div style={{ marginBottom: 50 }}>
                    {psiConfig.platform === 'desktop,mobile' ?
                        <div>
                            <div style={{ marginBottom: 80 }}>
                                <h4 style={{ marginLeft: '45%' }}>PSI Results : Mobile-Site</h4>
                                <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                    <Filter filter={filter} setFilter={setFilter} />
                                </div>
                                <CustomizedTables testScores={filter === 'tests' ? mobileTestScores : filter === 'median' ? mobileMedianScores : mobileAverageScores} hideShimmer={isShimmer.mobile} />
                            </div>
                            <div>
                                <h4 style={{ marginLeft: '45%' }}>PSI Results : Desktop</h4>
                                <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                    <Filter filter={filter} setFilter={setFilter} />
                                </div>
                                <CustomizedTables testScores={filter === 'tests' ? desktopTestScores : filter === 'median' ? desktopMedianScores : desktopAverageScores} hideShimmer={isShimmer.desktop} />
                            </div>
                        </div>
                        :
                        <div>
                            <h4 style={{ marginLeft: '45%' }}>PSI Results</h4>
                            <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                <Filter filter={filter} setFilter={setFilter} />
                            </div>
                            <CustomizedTables hideShimmer={psiConfig.platform === 'mobile' ? isShimmer.mobile : isShimmer.desktop} testScores={psiConfig.platform === 'mobile' ? (filter === 'tests' ? mobileTestScores : filter === 'median' ? mobileMedianScores : mobileAverageScores) : (filter === 'tests' ? desktopTestScores : filter === 'median' ? desktopMedianScores : desktopAverageScores)} />
                        </div>
                    }
                </div> : null}
            </Container>
        </div>
    );
}

export default PerformanceCalculator;




//             if (mobileMedianScores.length > 0) setShimmer({ ...isShimmer, mobile: false })
//             else if (desktopMedianScores.length > 0) setShimmer({ ...isShimmer, desktop: false })