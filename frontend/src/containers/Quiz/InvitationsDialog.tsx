import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
} from '@mui/material';
import React from 'react';

import InvitationsComponent from './Invitations';

type Props = {
  open: boolean;
  onClose: () => void;
  quizId?: string;
};

const InvitationsDialog: React.FC<Props> = ({ open, onClose, quizId }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      aria-labelledby="invite-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        id="invite-dialog-title"
        sx={{
          m: 0,
          p: 3.5,
          pl: 4,
          pr: 10,
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        Invite candidates
        <IconButton
          aria-label="close invite dialog"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            p: 1.5,
          }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3.5,
          pt: 1.5,
        }}
      >
        <Box sx={{ width: '100%' }}>
          <InvitationsComponent quizId={quizId} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationsDialog;
