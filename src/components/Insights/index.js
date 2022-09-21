import { Container } from "@mui/system";
import React from "react";
import { LineChart } from "../LineChart";

const Insights = props => {
    return (
        <div>
            <Container style={{maxHeight:'400px',overflow:'hidden'}}>
                <h1>Insights</h1>
                <LineChart />
            </Container>
        </div>
    )
}

export default Insights;