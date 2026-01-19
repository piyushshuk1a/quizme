import { useAuth0 } from '@auth0/auth0-react';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button as MuiButton,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useParams } from 'react-router';

import { Button } from '@/components/Button';
import { useMutation } from '@/hooks/swr/useMutation';
import { parseEmails } from '@/utils/emailUtils';

type Props = {
  quizId?: string;
};

type InvitePayload = {
  candidates: { userEmail: string }[];
};

type Invoker = (arg: unknown) => Promise<unknown>;

export const Invitations: React.FC<Props> = ({ quizId: propQuizId }) => {
  const [emailsText, setEmailsText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [inviteLink, setInviteLink] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();
  const { getAccessTokenSilently } = useAuth0();
  const params = useParams() as { id?: string };
  const quizId = propQuizId ?? params.id;

  // useMutation hook
  const mutation = useMutation<void, InvitePayload>(
    quizId ? `/api/quizzes/${quizId}/invite` : null,
    { method: 'PUT' },
  );

  let inviteInvoker: Invoker | undefined = undefined;
  const maybe = mutation as unknown;

  if (maybe && typeof maybe === 'function') {
    // hook exported as function
    inviteInvoker = maybe as Invoker;
  } else if (maybe && typeof maybe === 'object') {
    // hook returned an object with common names
    const candidate = maybe as {
      trigger?: Invoker;
      mutate?: Invoker;
      mutateAsync?: Invoker;
    };
    inviteInvoker =
      candidate.trigger ?? candidate.mutate ?? candidate.mutateAsync;
  }

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

      const payload = {
        candidates: emails.map((e) => ({ userEmail: e })),
      };

      if (inviteInvoker) {
        try {
          // 1) try calling with payload only (common)
          await inviteInvoker(payload);
        } catch (firstErr) {
          try {
            // 2) try explicit request object
            await inviteInvoker({
              url: `/api/quizzes/${quizId}/invite`,
              method: 'PUT',
              body: payload,
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
          } catch (secondErr) {
            throw secondErr ?? firstErr;
          }
        }
      } else {
        // fallback to fetch
        const response = await fetch(`/api/quizzes/${quizId}/invite`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => null);
          enqueueSnackbar(err?.message || 'Could not create invitations', {
            variant: 'error',
          });
          setIsSending(false);
          return;
        }
      }

      setInvitedEmails(emails);
      setInviteLink(generateInviteLink(quizId));
      enqueueSnackbar('Invitations recorded in application', {
        variant: 'success',
      });
      setEmailsText('');
    } catch (error: unknown) {
      console.error('invite error', error);
      enqueueSnackbar('Error creating invitations', { variant: 'error' });
    } finally {
      setIsSending(false);
    }
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
            <TextField
              value={inviteLink}
              InputProps={{ readOnly: true }}
              size="small"
              fullWidth
            />
            <MuiButton
              variant="outlined"
              size="medium"
              onClick={() => copyToClipboard(inviteLink)}
            >
              Copy Link
            </MuiButton>
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
