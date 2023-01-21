import { React, useEffect, useState } from 'react';
import { Button, FormControl, Grid, TextField } from '@mui/material';
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
        iterationNum: 20
    });
    const [performanceEnvs, setPerformanceEnvs] = useState(PERFORMANCE_ENVS)
    const [isShimmer, setShimmer] = useState({ mobile: true, desktop: true })
    const [mobileTestScores, setMobileTestScores] = useState([]);
    const [desktopTestScores, setDesktopTestScores] = useState([]);
    const [mobileMedianScores, setMobileMedianScores] = useState([]);
    const [desktopMedianScores, setDesktopMedianScores] = useState([]);
    const [mobileAverageScores, setMobileAverageScores] = useState([]);
    const [desktopAverageScores, setDesktopAverageScores] = useState([]);
    const [mobileOriginFieldData, setMobileOriginFieldData] = useState([]);
    const [desktopOriginFieldData, setDesktopOriginFieldData] = useState([]);
    const [isRemember, setRemember] = useState(false);
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
        toggleShimmer();
        if(progress ===100 && !(mobileMedianScores.length>0 || desktopMedianScores.length >0 )){
            setSnackBar(snackBar => ({ ...snackBar, open: true, message: 'Test scores successfully fetched, calculating median and average scores shortly',type: 'warning' }));
        }
    }, [filter,progress,mobileMedianScores, desktopMedianScores]);
    const triggerBuild = () => {
        setSuccessCount(0);
        setQueueCount(0);
        setTotalUrlCount(0);
        setProgress(0);
        setMobileTestScores([]);
        setDesktopTestScores([]);
        setMobileMedianScores([]);
        setDesktopMedianScores([]);
        setMobileAverageScores([]);
        setDesktopAverageScores([]);
        setMobileOriginFieldData([]);
        setDesktopOriginFieldData([]);
        const urlListCSV = getUrlListForSelectedEnvs(psiConfig?.urlListCSV, performanceEnvs);
        getSpeedData({iterationNum: psiConfig?.iterationNum,  round: psiConfig?.numberOfRounds, urlListCSV, device: psiConfig.platform, setMobileTestScores, setDesktopTestScores, setMobileMedianScores, setDesktopMedianScores, setSnackBar, apiKey: psiConfig?.apiKey, setDesktopAverageScores, setMobileAverageScores, setSuccessCount, setErrorCount, setTotalUrlCount, setProgress, setQueueCount,setMobileOriginFieldData, setDesktopOriginFieldData });
        setBuildRunning(true);
        handleStoreData();
    };
    const transformedFieldOriginMobile = mobileOriginFieldData.length>0? [mobileOriginFieldData[0]]:mobileOriginFieldData;
    const transformedFieldOriginDesktop = desktopOriginFieldData.length>0 ? [desktopOriginFieldData[0]]:desktopOriginFieldData

    const toggleShimmer = () => {
        if (psiConfig.platform === 'desktop,mobile') {
            if(filter === 'origin'){
                setShimmer({ ...isShimmer, mobile: !mobileOriginFieldData.length > 0, desktop: !desktopOriginFieldData.length > 0 })
            }else if(filter === 'tests'){
                setShimmer({ ...isShimmer, mobile: progress!==100, desktop: progress!==100})
            }else{
                setShimmer({ ...isShimmer, mobile: !mobileMedianScores.length > 0, desktop: !desktopMedianScores.length > 0 })
            }
        } else if (psiConfig.platform === 'desktop') {
            if(filter === 'origin'){
                setShimmer({ ...isShimmer, desktop: !desktopOriginFieldData.length > 0 })
            }else if(filter === 'tests'){
                setShimmer({ ...isShimmer, desktop: progress!==100})
            }else{
                setShimmer({ ...isShimmer, desktop: !desktopMedianScores.length > 0 })
            }
        } else if (psiConfig.platform === 'mobile') {
            if(filter === 'origin'){
                setShimmer({ ...isShimmer, desktop: !mobileOriginFieldData.length > 0 })
            }else if(filter === 'tests'){
                setShimmer({ ...isShimmer, mobile: progress!==100})
            }else{
                return setShimmer({ ...isShimmer, mobile: !mobileMedianScores.length > 0 })
            }
        }
    }

    const handleCopyClick = () => {
        setSnackBar({...snackBar, open: true, message: 'Text copied',  type: "success" })
    }

    const handleStoreData = () => {
        if(isRemember) {
            const obj = JSON.stringify(psiConfig);
            localStorage.setItem('psiConfig', obj)
        } else {
            localStorage.setItem('psiConfig', '')
        }
    }

    useEffect(() => {
        if(localStorage?.getItem('psiConfig')){
            const psiConfigObj = JSON.parse(localStorage.getItem('psiConfig'));
            setPsiConfig({ ...psiConfig, ...psiConfigObj})
            setRemember(true);
        }
    }, []);

    const selectedEnvCount = Object.keys(performanceEnvs).filter(env => performanceEnvs[env].selected).length; 
    return (
        <div>
            <Container>
                <h1>Page Speed Calculator</h1>
                <p>Please enter the following data to initiate build</p>
               <FormControl fullWidth={true}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <TextField error={psiConfig?.apiKey ? false : true} autoComplete ={"on"}  helperText={!psiConfig?.apiKey && <span>Create your own <a style={{ textDecoration: "none", color: "cornflowerblue" }} target='_blank' href="https://developers.google.com/speed/docs/insights/v5/get-started">Here</a></span>}
                        required id="apiKey"
                        value={psiConfig?.apiKey || ''}
                        label={"Your API Key"}
                        variant="standard" style={textContainerStyle} onChange={handleChange} />
                    <CheckboxWithLabel
                        checked={isRemember}
                        handleChange={() => {setRemember(!isRemember)}}
                        label="remember me"
                    />
                </div>
                <div>
                    <TextField id="numberOfRounds" value={psiConfig?.numberOfRounds || ''} label="Number of Test Rounds" variant="standard"  defaultValue={psiConfig.numberOfRounds} style={textContainerStyle} onChange={handleChange} />
                </div>

                <div>
                    <TextField id="iterationNum" value={psiConfig?.iterationNum || ''} label="Number of iteration each round" variant="standard" defaultValue={psiConfig.iterationNum} style={textContainerStyle} onChange={handleChange} />
                </div>

                <div>
                    <TextField id="urlListCSV" value={psiConfig?.urlListCSV || ''} label="Enter URL" variant="standard"  style={textContainerStyle}
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
                    <Selector value={psiConfig?.platform} handleSelectorChange={handleChange} />
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
                </FormControl>
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
                                <CustomizedTables testScores={filter==='origin' ? transformedFieldOriginMobile: filter === 'tests' ? mobileTestScores : filter === 'median' ? mobileMedianScores : mobileAverageScores} showShimmer={isShimmer.mobile} onCopyClick={handleCopyClick} />
                            </div>
                            <div>
                                <p style={{ marginLeft: '45%' }}>PSI Results : Desktop</p>
                                <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                    <Filter filter={filter} setFilter={setFilter} />
                                </div>
                                <CustomizedTables testScores={filter==='origin' ? transformedFieldOriginDesktop: filter === 'tests' ? desktopTestScores : filter === 'median' ? desktopMedianScores : desktopAverageScores} showShimmer={isShimmer.desktop}  onCopyClick={handleCopyClick}/>
                            </div>
                        </div>
                        :
                        <div>
                            <p style={{ marginLeft: '45%' }}>PSI Results</p>
                            <div style={{ marginLeft: '80%', marginTop: -60, marginBottom: 20 }}>
                                <Filter filter={filter} setFilter={setFilter} />
                            </div>
                            <CustomizedTables showShimmer={psiConfig.platform === 'mobile' ? isShimmer.mobile : isShimmer.desktop} testScores={psiConfig.platform === 'mobile' ? (filter==='origin' ? transformedFieldOriginMobile:filter === 'tests' ? mobileTestScores : filter === 'median' ? mobileMedianScores : mobileAverageScores) : (filter === 'tests' ? desktopTestScores :filter==='origin' ? transformedFieldOriginDesktop: filter === 'median' ? desktopMedianScores : desktopAverageScores)} onCopyClick={handleCopyClick} />
                        </div>
                    }
                </div> : null}
            </Container>
        </div>
    );
}

export default PerformanceCalculator;