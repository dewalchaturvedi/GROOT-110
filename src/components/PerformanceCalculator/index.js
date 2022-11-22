import { React, useEffect, useState } from 'react';
import { Button, Grid, TextField } from '@mui/material';
import Selector from '../Selector';
import { Container } from '@mui/system';
import CustomizedTables from '../Table';
import getSpeedData from '../../utilities/getPsiData';
import PersistentDrawerLeft from '../Drawer';
import Filter from '../Selector/Filter';
import ToastMessage from '../ToastMessage';
import LinearProgressWithLabel from '../LinearProgressWithLabel';
import CheckboxWithLabel from '../CheckBox';
import { getUrlListForSelectedEnvs } from '../../utilities/getUrlListForSelectedEnvs';

const textContainerStyle = {
    width: '70%',
    margin: 20
};

const PERFORMANCE_ENVS = {
    live: { label: "Live", selected: true, queryString: '' },
    test: { label: "Test", selected: false, queryString: 'module=test' },
    dev: { label: "Dev", selected: false, queryString: 'module=dev' },
    dev2: { label: "Dev 2", selected: false, queryString: 'module=dev2' },
    dev3: { label: "Dev 3", selected: false, queryString: 'module=dev3' },
  };

const PerformanceCalculator = props => {
    const [psiConfig, setPsiConfig] = useState({
        numberOfRounds: 3,
        platform: 'desktop,mobile',
        urlListCSV: '',
        apiKey: '',
    });
    const [performanceEnvs, setPerformanceEnvs] = useState(PERFORMANCE_ENVS)
    const [isShimmer, setShimmer] = useState({ mobile: true, desktop: true })
    const [mobileTestScores, setMobileTestScores] = useState([]);
    const [desktopTestScores, setDesktopTestScores] = useState([]);
    const [mobileMedianScores, setMobileMedianScores] = useState([]);
    const [desktopMedianScores, setDesktopMedianScores] = useState([]);
    const [mobileAverageScores, setMobileAverageScores] = useState([]);
    const [desktopAverageScores, setDesktopAverageScores] = useState([]);

    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [queueCount, setQueueCount] = useState(0);
    const [totalUrlCount, setTotalUrlCount] = useState(0);
    const [progress, setProgress] = useState(0);
    
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
        const urlListCSV = getUrlListForSelectedEnvs(psiConfig?.urlListCSV, performanceEnvs);
        getSpeedData({ round: psiConfig?.numberOfRounds, urlListCSV: urlListCSV, device: psiConfig.platform, setMobileTestScores, setDesktopTestScores, setMobileMedianScores, setDesktopMedianScores, setSnackBar, apiKey: psiConfig?.apiKey, setDesktopAverageScores, setMobileAverageScores, setSuccessCount, setErrorCount, setTotalUrlCount, setProgress, setQueueCount });
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

    const selectedEnvCount = Object.keys(performanceEnvs).filter(env => performanceEnvs[env].selected).length; 
    return (
        <div>
            <Container>
                <h1>Page Speed Calculator</h1>
                <p>Please enter the following data to initiate build</p>
                <div>
                    <TextField error={psiConfig?.apiKey ? false : true} helperText={!psiConfig?.apiKey && <span>Create your own <a style={{ textDecoration: "none", color: "cornflowerblue" }} target='_blank' href="https://developers.google.com/speed/docs/insights/v5/get-started">Here</a></span>} required id="apiKey"
                        label={"Your API Key"}
                        variant="standard" style={textContainerStyle} onChange={handleChange} />
                </div>
                <div>
                    <TextField id="numberOfRounds" label="Number of Test Rounds" variant="standard" style={textContainerStyle} onChange={handleChange} />
                </div>
                <div>
                    <TextField id="urlListCSV" label="Enter URL" variant="standard" style={textContainerStyle}
                        onChange={handleChange} />
                </div>
                <div style={{ margin: "20px", width: "70%" }}>
                    <div>Select the envs : </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        {Object.keys(performanceEnvs).map((env) => {
                            const envState = performanceEnvs[env];
                            return (
                                <CheckboxWithLabel
                                    checked={envState.selected}
                                    handleChange={() =>
                                        setPerformanceEnvs({
                                        ...performanceEnvs,
                                        [env]: { ...envState, selected: !envState.selected },
                                        })
                                    }
                                    label={envState.label}
                                />
                            );
                        })}
                    </div>
                </div>
                <div style={{ width: '30%', margin: 20 }}>
                    <Selector handleSelectorChange={handleChange} />
                </div>
                <div style={{ margin: 20 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={2}>
                        <Button variant="contained" onClick={triggerBuild} disabled={!psiConfig.numberOfRounds || !psiConfig.urlListCSV || !psiConfig.apiKey || !selectedEnvCount}  >Build</Button>
                        </Grid>
                        {buildRunning && <>
                            <Grid item xs={3}><p>Total URLs: {totalUrlCount}</p></Grid>
                            <Grid item xs={3}><p>Success: {successCount}</p></Grid>
                            <Grid item xs={3}><p>Retry Queue Count: {queueCount}</p></Grid>
                        </>}
                    </Grid>
                </div>
                <ToastMessage
                    open={snackBar.open}
                    message={snackBar.message}
                    type={snackBar.type}
                    handleClose={handleClose}
                />
                {buildRunning ? <div style={{ marginBottom: 50 }}>
                    <LinearProgressWithLabel value={progress} />
                    {psiConfig.platform === 'desktop,mobile' ?
                        <div>
                            <div style={{ marginBottom: 80 }}>
                                <p style={{ marginLeft: '45%' }}>PSI Results : Mobile-Site</p>
                                <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                    <Filter filter={filter} setFilter={setFilter} />
                                </div>
                                <CustomizedTables testScores={filter === 'tests' ? mobileTestScores : filter === 'median' ? mobileMedianScores : mobileAverageScores} hideShimmer={isShimmer.mobile} />
                            </div>
                            <div>
                                <p style={{ marginLeft: '45%' }}>PSI Results : Desktop</p>
                                <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                    <Filter filter={filter} setFilter={setFilter} />
                                </div>
                                <CustomizedTables testScores={filter === 'tests' ? desktopTestScores : filter === 'median' ? desktopMedianScores : desktopAverageScores} hideShimmer={isShimmer.desktop} />
                            </div>
                        </div>
                        :
                        <div>
                            <p style={{ marginLeft: '45%' }}>PSI Results</p>
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