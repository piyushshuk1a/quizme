import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

import {
  inviteCandidates,
  listInvitedCandidates,
  // import other services if needed
} from '@/services';

type CandidateBody = { userEmail: string };
type InviteRequestBody = { candidates?: CandidateBody[] };

export const inviteCandidatesController = async (
  req: Request<{ id: string }, unknown, InviteRequestBody>,
  res: Response,
) => {
  try {
    const quizId = req.params.id;
    const { candidates } = req.body ?? {};

    if (!quizId) {
      return res.status(400).json({ message: 'quiz id is required' });
    }
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ message: 'candidates array is required' });
    }

    // Normalize and validate emails
    const normalized = candidates
      .map((c) => ({
        userEmail: String(c.userEmail || '')
          .trim()
          .toLowerCase(),
      }))
      .filter((c) => c.userEmail && /\S+@\S+\.\S+/.test(c.userEmail));

    if (normalized.length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid email addresses provided' });
    }

    // ensure each candidate object includes quizId (service expects it)
    const candidatesWithQuizId = normalized.map((c) => ({
      userEmail: c.userEmail,
      quizId,
    }));

    await inviteCandidates(quizId, candidatesWithQuizId);

    // Try to send emails if SMTP configured
    try {
      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT || '587');
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || 'no-reply@quizmaster';
      const frontendUrl = process.env.FRONTEND_URL || '';

      if (host && user && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          auth: { user, pass },
        });

        // Send emails in parallel
        await Promise.all(
          normalized.map(async (c) => {
            const inviteLink = frontendUrl
              ? `${frontendUrl}/quiz/${quizId}`
              : `#/quiz/${quizId}`;

            const mailOptions = {
              from: `${smtpFrom} <${user}>`,
              to: c.userEmail,
              subject: 'You are invited to take a quiz',
              html: `<p>You have been invited to take a quiz. Open: <a href="${inviteLink}">${inviteLink}</a></p>`,
              text: `You have been invited to take a quiz. Open: ${inviteLink}`,
            };

            return transporter.sendMail(mailOptions);
          }),
        );
      } else {
        console.info('SMTP is not configured; invitation emails were not sent');
      }
    } catch (emailError) {
      console.error('Error sending invitation emails:', emailError);
    }

    return res.status(200).json({ message: 'Invitations created' });
  } catch (error) {
    console.error('inviteCandidatesController error:', error);
    return res.status(500).json({ message: 'Could not create invitations' });
  }
};

export const listInvitedCandidatesController = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const quizId = req.params.id;
    if (!quizId) return res.status(400).json({ message: 'quiz id required' });

    const invited = await listInvitedCandidates(quizId);
    return res.status(200).json(invited);
  } catch (error) {
    console.error('listInvitedCandidatesController error:', error);
    return res
      .status(500)
      .json({ message: 'Could not fetch invited candidates' });
  }
};
