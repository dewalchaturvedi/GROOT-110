import React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const CheckboxWithLabel = (props) => {
  const { checked = false, handleChange = () => {}, label = "" } = props;

  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox onChange={handleChange} checked={checked} />}
        label={label}
      />
    </FormGroup>
  );
};

export default CheckboxWithLabel;
