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
type MutationHook =
  | { trigger?: Invoker; mutate?: Invoker; mutateAsync?: Invoker }
  | Invoker
  | null
  | undefined;

export const Invitations: React.FC<Props> = ({ quizId: propQuizId }) => {
  const [emailsText, setEmailsText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [inviteLink, setInviteLink] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();
  const { getAccessTokenSilently } = useAuth0();
  const params = useParams() as { id?: string };
  const quizId = propQuizId ?? params.id;

  // Call hook unconditionally
  const mutation = useMutation<void, InvitePayload>(
    quizId ? `/api/quizzes/${quizId}/invite` : null,
    { method: 'PUT' },
  );

  // Normalise the possible shapes to a single invoker typed with unknown
  const mutationHook = mutation as MutationHook;
  const inviteInvoker: Invoker | undefined =
    ((mutationHook &&
      typeof mutationHook === 'object' &&
      (mutationHook.trigger ??
        mutationHook.mutate ??
        mutationHook.mutateAsync)) as Invoker | undefined) ??
    (typeof mutationHook === 'function'
      ? (mutationHook as Invoker)
      : undefined);

  const generateInviteLink = (id: string) =>
    `${window.location.origin}/quiz/${id}?invite=true`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    } catch (error: unknown) {
      console.error(error);
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

      const payload: InvitePayload = {
        candidates: emails.map((e) => ({ userEmail: e })),
      };

      if (inviteInvoker) {
        // Try common invoker signatures:
        try {
          // 1) try calling with payload only (most common)
          await inviteInvoker(payload);
        } catch (firstError) {
          try {
            // 2) try calling with explicit request object
            await inviteInvoker({
              url: `/api/quizzes/${quizId}/invite`,
              method: 'PUT',
              body: payload,
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
          } catch (secondError) {
            // throw whichever is more meaningful
            throw secondError ?? firstError;
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

      // success path
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
    <Paper sx={{ p: 3 }}>
      <Stack gap={2}>
        <Typography variant="h6">
          Invite candidates to this quiz (in-app)
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Enter one or more email addresses (comma, semicolon or newline
          separated).
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
