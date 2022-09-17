import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Skeleton } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
}

export default function CustomizedTables(props) {



    const rows = [
        props.testScores.map(item => {
            createData(item.testUrl, item.PerformanceScore, item.labCLS, item.TBT, item.labLCP, item.labFCP, item.TTFB, item.TTI, item.pageSize, item.labMaxFID, item.speedIndex, item.date)
        })
    ];

    // console.log("PROPS --> ", rows)

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table aria-label="sticky table" stickyHeader={true} >
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>URL</StyledTableCell>
                            <StyledTableCell align="right">Page Score</StyledTableCell>
                            <StyledTableCell align="right">CLS</StyledTableCell>
                            <StyledTableCell align="right">TBT</StyledTableCell>
                            <StyledTableCell align="right">LCP</StyledTableCell>
                            <StyledTableCell align="right">FCP</StyledTableCell>
                            <StyledTableCell align="right">TTFB</StyledTableCell>
                            <StyledTableCell align="right">TTI</StyledTableCell>
                            <StyledTableCell align="right">Page Size</StyledTableCell>
                            <StyledTableCell align="right">FID</StyledTableCell>
                            <StyledTableCell align="right">Speed Index</StyledTableCell>
                            <StyledTableCell align="right">TimeStamp</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.testScores.map((row) => (
                            <StyledTableRow key={row.name}>
                                <StyledTableCell component="th" scope="row">{row.testUrl}</StyledTableCell>
                                <StyledTableCell align="right">{row.PerformanceScore}</StyledTableCell>
                                <StyledTableCell align="right">{row.labCLS}</StyledTableCell>
                                <StyledTableCell align="right">{row.TBT}</StyledTableCell>
                                <StyledTableCell align="right">{row.labLCP}</StyledTableCell>
                                <StyledTableCell align="right">{row.labFCP}</StyledTableCell>
                                <StyledTableCell align="right">{row.TTFB}</StyledTableCell>
                                <StyledTableCell align="right">{row.TTI}</StyledTableCell>
                                <StyledTableCell align="right">{row.pageSize}</StyledTableCell>
                                <StyledTableCell align="right">{row.labMaxFID}</StyledTableCell>
                                <StyledTableCell align="right">{row.speedIndex}</StyledTableCell>
                                <StyledTableCell align="right">{row.date}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                        {!props.hideShimmer && <StyledTableRow>
                            <StyledTableCell component="th" scope="row">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                            <StyledTableCell align="left">{<Skeleton variant="rectangular" width={60} height={10} />}</StyledTableCell>
                        </StyledTableRow>}
                    </TableBody>
                </Table>
            </TableContainer >
        </Paper>
    );
}
