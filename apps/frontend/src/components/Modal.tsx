import React from 'react';
import { Modal as MUIModal, Box, Typography, Button } from '@mui/material';

interface ModalProps {
 open: boolean;
 onClose: () => void;
 title: string;
 content: string;
}

const style = {
 position: 'absolute' as 'absolute',
 top: '50%',
 left: '50%',
 transform: 'translate(-50%, -50%)',
 width: 400,
 bgcolor: 'background.paper',
 borderRadius: 2,
 boxShadow: 24,
 p: 4,
};

const Modal: React.FC<ModalProps> = ({ open, onClose, title, content }) => {
 return (
   <MUIModal open={open} onClose={onClose}>
     <Box sx={style}>
       <Typography variant="h6" component="h2">{title}</Typography>
       <Typography sx={{ mt: 2 }}>{content}</Typography>
       <Button sx={{ mt: 2 }} variant="contained" color="primary" onClick={onClose}>
         Close
       </Button>
     </Box>
   </MUIModal>
 );
};

export default Modal;
