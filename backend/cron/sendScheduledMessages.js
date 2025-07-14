const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const twilio = require('twilio');
require('dotenv').config();
const cron = require('node-cron');

async function sendScheduledMessages() {
  const now = new Date();
  const scheduledMessages = await prisma.scheduledMessage.findMany({
    where: {
      sendAt: { lte: now },
      sent: false,
      failed: false
    },
    include: {
      user: {
        include: {
          twilioPhoneNumbers: true
        }
      },
      twilioPhoneNumber: true
    }
  });

  for (const msg of scheduledMessages) {
    try {
      const twilioPhone = msg.twilioPhoneNumber;
      if (!twilioPhone) {
        throw new Error('No Twilio phone number found for scheduled message');
      }
      const twilioClient = twilio(twilioPhone.twilioAccountSid, twilioPhone.twilioAuthToken);
      const messageData = {
        body: msg.body,
        from: msg.from,
        to: msg.to,
        statusCallback: process.env.TWILIO_SMS_WEBHOOK_URL
          ? `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/messageStatus`
          : undefined,
        statusCallbackMethod: 'POST'
      };
      const twilioMessage = await twilioClient.messages.create(messageData);
      await prisma.scheduledMessage.update({
        where: { id: msg.id },
        data: { sent: true, failed: false, errorMessage: null }
      });
      await prisma.message.create({
        data: {
          messageSid: twilioMessage.sid,
          accountSid: twilioMessage.accountSid,
          from: twilioMessage.from,
          to: twilioMessage.to,
          body: twilioMessage.body,
          numMedia: parseInt(twilioMessage.numMedia) || 0,
          mediaUrl: null,
          messageStatus: twilioMessage.status,
          timestamp: new Date(),
          userId: msg.userId,
          direction: 'outbound-api',
          twilioPhoneNumberId: twilioPhone.id
        }
      });
      console.log(`Scheduled message sent: ${msg.id} -> ${twilioMessage.sid}`);
    } catch (error) {
      await prisma.scheduledMessage.update({
        where: { id: msg.id },
        data: { failed: true, errorMessage: error.message }
      });
      console.error(`Failed to send scheduled message ${msg.id}:`, error.message);
    }
  }
}

// Schedule the job to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Checking for scheduled messages...');
  await sendScheduledMessages();
});

console.log('Scheduled message cron job started.'); 