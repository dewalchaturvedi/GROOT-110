import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Overlay } from '../Overlay/Overlay';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InsightsIcon from '@mui/icons-material/Insights';
import HomeIcon from '@mui/icons-material/Home';
import PerformanceCalculator from '../PerformanceCalculator';
import Insights from '../Insights';
import { addRow } from '../../utilities/firebaseUtils';
import { collection, getFirestore } from 'firebase/firestore';

const drawerWidth = 240;
// const ModalContainer = StyledComponent.div`
// position: absolute;
// top: 0;
// left: 0;
// width: 100%;
// height: 100%;
// background: rgba(0, 0, 0, 0.91)
// `;
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: `-${drawerWidth}px`,
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        }),
    }),
);

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft(props) {
    let {fire = {}} = props;
    // let firestore = getFirestore();
    // var dbCollection = collection(firestore,"/psi-99");
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [showHome, setShowHome] = React.useState(true);

    const handleDrawerOpen = () => {
        setOpen(true);
        // addRow(dbCollection,{"cls":0.01,"page_score":'76'})
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const navButtonClickHandler = () => {
        setOpen(false);
        setShowHome(!showHome);
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                    IPS: InfoEdge Performance Suite
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {['Home', 'Insights'].map((text, index) => (
                        <ListItem key={text} disablePadding >
                            <ListItemButton onClick={navButtonClickHandler} >
                                <ListItemIcon>
                                    {index % 2 === 0 ? <HomeIcon /> : <InsightsIcon />}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
            </Drawer>
            <Main open={open}>
            {/* {!showHome && <h1 style={{zIndex:'10',position:'absolute',top:'100px',left:'50px'}}>Under Construction</h1>} */}
            {!showHome && <Overlay/>}

                <DrawerHeader />
                {showHome ? <PerformanceCalculator /> : <Insights />}
            </Main>
            {/* <p className={"footer-heart"}>
  Made with <g-emoji className="g-emoji" alias="heart" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png">
<img className="emoji" alt="heart" height="20" width="20" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png"/></g-emoji> by <a href="https://armin.id">Arminisme</a>
</p> */}
        </Box>
    );
}
