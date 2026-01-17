import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import React from 'react';

import InvitationsComponent from '@/containers/Quiz/Invitations';

type Props = {
  open: boolean;
  onClose: () => void;
  quizId?: string | undefined;
};

const InvitationsDialog: React.FC<Props> = ({ open, onClose, quizId }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="invite-dialog-title"
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="invite-dialog-title">
        Invite candidates
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Reuse the existing Invitations component */}
        <InvitationsComponent quizId={quizId} />
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        {/* Invitations controls handled inside Invitations component */}
      </DialogActions>
    </Dialog>
  );
};
export default InvitationsDialog;
