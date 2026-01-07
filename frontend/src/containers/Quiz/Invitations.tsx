import { useAuth0 } from '@auth0/auth0-react';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useParams } from 'react-router';

type Props = {
  quizId?: string;
};

const parseEmails = (text: string) =>
  text
    .split(/[\n,;,]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);

export const Invitations: React.FC<Props> = ({ quizId: propQuizId }) => {
  const [emailsText, setEmailsText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [inviteLink, setInviteLink] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();
  const { getAccessTokenSilently } = useAuth0();
  const params = useParams() as { id?: string };
  const quizId = propQuizId ?? params.id;

  const generateInviteLink = (id: string) =>
    `${window.location.origin}/quiz/${id}?invite=true`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Could not copy', { variant: 'error' });
    }
  };

  const handleSend = async () => {
    if (!quizId) {
      enqueueSnackbar('Quiz id not found', { variant: 'error' });
      return;
    }

    const emails = parseEmails(emailsText);
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

    setIsSending(true);

    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`/api/quizzes/${quizId}/invite`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidates: emails.map((e) => ({ userEmail: e })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        enqueueSnackbar(err?.message || 'Could not create invitations', {
          variant: 'error',
        });
        return;
      }

      setInvitedEmails(emails);
      setInviteLink(generateInviteLink(quizId));
      enqueueSnackbar('Invitations recorded in application', {
        variant: 'success',
      });
      setEmailsText('');
    } catch (error) {
      console.error('invite error', error);
      enqueueSnackbar('Error creating invitations', { variant: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack gap={2}>
        <Typography variant="h6">
          Invite candidates to this quiz (in-app)
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Enter one or more email addresses (comma, semicolon or newline
          separated). Invitations will be recorded in the application — invited
          users will see this quiz in their Invitations tab after they log in.
        </Typography>

        {inviteLink && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Share this invite link:
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                value={inviteLink}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <Button
                variant="outlined"
                onClick={() => copyToClipboard(inviteLink)}
              >
                Copy Link
              </Button>
            </Stack>
          </Box>
        )}

        <TextField
          fullWidth
          minRows={4}
          multiline
          value={emailsText}
          onChange={(e) => setEmailsText(e.target.value)}
          placeholder="alice@example.com, bob@example.com"
          label="Candidate emails"
        />

        <Button variant="contained" onClick={handleSend} disabled={isSending}>
          {isSending
            ? 'Creating invitations...'
            : 'Create Invitations & Generate Link'}
        </Button>

        {invitedEmails.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Invited emails</Typography>
            <List dense>
              {invitedEmails.map((e) => (
                <ListItem
                  key={e}
                  secondaryAction={
                    <IconButton onClick={() => copyToClipboard(e)}>
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
