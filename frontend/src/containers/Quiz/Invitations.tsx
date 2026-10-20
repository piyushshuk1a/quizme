// frontend/src/containers/Quiz/Invitations.tsx
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { generatePath, useParams } from 'react-router';

import { Button } from '@/components/Button';
import { API_ENDPOINTS, API_REQUEST_TYPES, ROUTES } from '@/constants';
import { useMutation } from '@/hooks/swr/useMutation';
import { parseEmails } from '@/utils/emailUtils';

type Props = {
  quizId?: string;
};

type InvitePayload = {
  candidates: { userEmail: string }[];
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const Invitations: React.FC<Props> = ({ quizId: propQuizId }) => {
  const [emailsText, setEmailsText] = useState<string>('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [inviteLink, setInviteLink] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();
  const params = useParams() as { id?: string };
  const quizId = propQuizId ?? params.id;

  // `throwOnError` makes a failed request reject so that we never report a
  // success for invitations the server did not record.
  const { trigger: sendInvitations, isMutating: isSending } = useMutation<
    InvitePayload,
    void,
    { message?: string },
    unknown,
    unknown,
    true
  >({
    path: quizId
      ? generatePath(API_ENDPOINTS.inviteCandidates, { id: quizId })
      : null,
    method: API_REQUEST_TYPES.put,
    throwOnError: true,
  });

  const generateInviteLink = (id: string): string =>
    `${window.location.origin.replace(/\/$/, '')}${generatePath(ROUTES.quiz, { id })}?invite=true`;

  const handleSend = async (): Promise<void> => {
    if (isSending) return;

    if (!quizId) {
      enqueueSnackbar('Quiz id not found', { variant: 'error' });
      return;
    }

    const emails = [...new Set(parseEmails(emailsText))];
    if (emails.length === 0) {
      enqueueSnackbar('Please enter at least one email', {
        variant: 'warning',
      });
      return;
    }

    const invalid = emails.filter((e) => !/\S+@\S+\.\S+/.test(e));
    if (invalid.length) {
      enqueueSnackbar(`Invalid email(s): ${invalid.join(', ')}`, {
        variant: 'error',
      });
      return;
    }

    try {
      await sendInvitations({
        candidates: emails.map((e) => ({ userEmail: e })),
      });

      setInvitedEmails((prev) => [...new Set([...prev, ...emails])]);
      setInviteLink(generateInviteLink(quizId));
      enqueueSnackbar('Invitations recorded in application', {
        variant: 'success',
      });
      setEmailsText('');
    } catch (error: unknown) {
      console.error('invite error', error);
      enqueueSnackbar(
        typeof error === 'string' ? error : 'Error creating invitations',
        { variant: 'error' },
      );
    }
  };

  const handleCopy = async (text: string): Promise<void> => {
    const ok = await copyToClipboard(text);
    enqueueSnackbar(ok ? 'Copied to clipboard' : 'Could not copy', {
      variant: ok ? 'success' : 'error',
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack gap={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Invite candidates to this quiz (in-app)
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Enter one or more email addresses (comma, semicolon or newline
            separated).
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Candidate emails
          </Typography>

          <TextField
            fullWidth
            minRows={4}
            multiline
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            placeholder="alice@example.com, bob@example.com"
            variant="outlined"
          />
        </Box>

        {/* Invite link + copy  */}
        {inviteLink && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Share this invite link:
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                value={inviteLink}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
              />
              <Button variant="outlined" onClick={() => handleCopy(inviteLink)}>
                Copy Link
              </Button>
            </Stack>
          </Box>
        )}

        {/* CTA */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={isSending}
            sx={{ minWidth: 150, px: 3 }}
          >
            {isSending ? 'Sending...' : 'Send invite'}
          </Button>
        </Box>

        {invitedEmails.length > 0 && (
          <Box>
            <Typography variant="subtitle2">Invited emails</Typography>
            <List dense>
              {invitedEmails.map((e) => (
                <ListItem
                  key={e}
                  secondaryAction={
                    <IconButton onClick={() => handleCopy(e)}>
                      <FileCopyIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText primary={e} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default Invitations;
