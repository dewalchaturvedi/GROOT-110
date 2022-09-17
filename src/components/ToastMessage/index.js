import { Alert, Slide, Snackbar } from '@mui/material';

export default function ToastMessage({ open, message, type, handleClose, ...other }) {
  return (
    <Snackbar
      autoHideDuration={5000}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'right' }}
      open={open}
      onClose={handleClose}
      {...other}>
      <Alert onClose={handleClose} severity={type}>
        {message}
      </Alert>
    </Snackbar>
  );
}
