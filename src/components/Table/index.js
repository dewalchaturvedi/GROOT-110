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
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

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

function copytable(el) {
    window.getSelection().removeAllRanges();
    let range = document.createRange();
    range.selectNode(document.getElementById(el));
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
}

const generateId = () => {
    return new Date().getTime() + "table"
};

export default function CustomizedTables(props) {
    const tableId = React.useMemo(() => generateId(), []);
    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <div style={{ float: "right" }} onClick={() => { copytable(tableId); props?.onCopyClick?.();}}> <ContentPasteIcon /> </div>  
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table aria-label="sticky table" stickyHeader={true} id={tableId}>
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
                                <StyledTableCell component="th" scope="row">{row.testUrl || ''}</StyledTableCell>
                                <StyledTableCell align="right">{row.PerformanceScore}</StyledTableCell>
                                <StyledTableCell align="right">{row.labCLS || row.fieldCLS}</StyledTableCell>
                                <StyledTableCell align="right">{row.TBT}</StyledTableCell>
                                <StyledTableCell align="right">{row.labLCP || row.fieldLCP}</StyledTableCell>
                                <StyledTableCell align="right">{row.labFCP || row.fieldFCP}</StyledTableCell>
                                <StyledTableCell align="right">{row.TTFB}</StyledTableCell>
                                <StyledTableCell align="right">{row.TTI}</StyledTableCell>
                                <StyledTableCell align="right">{row.pageSize}</StyledTableCell>
                                <StyledTableCell align="right">{row.labMaxFID || row.fieldFID}</StyledTableCell>
                                <StyledTableCell align="right">{row.speedIndex}</StyledTableCell>
                                <StyledTableCell align="right">{row.date}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                        {props.showShimmer && <StyledTableRow>
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
