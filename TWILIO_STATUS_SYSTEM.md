# Twilio Message Status System

This document explains how message statuses are managed by Twilio in the Comsierge messaging application.

## Overview

The Comsierge app uses Twilio's status callback system to automatically track the delivery status of SMS messages. When a message is sent, Twilio will send status updates to our webhook endpoints as the message progresses through different states.

## Message Status Flow

### 1. Message Sending
When a user sends an SMS message:

1. **Frontend** calls `POST /api/messages/sendSMS`
2. **Backend** creates a Twilio client with user's credentials
3. **Backend** sends SMS via Twilio with status callback URL
4. **Backend** stores initial message in database with status from Twilio response
5. **Twilio** begins processing the message

### 2. Status Callbacks
Twilio automatically sends status updates to our webhook endpoint:

- **Endpoint**: `POST /api/messageStatus`
- **Triggered by**: Twilio when message status changes
- **Updates**: Message status in database with timestamp

## Message Statuses

### Outbound Message Statuses (sent by users)
- **`queued`** - Message is queued for delivery
- **`sending`** - Message is being sent to carrier
- **`sent`** - Message has been sent to carrier
- **`delivered`** - Message has been delivered to recipient
- **`undelivered`** - Message could not be delivered
- **`failed`** - Message failed to send
- **`canceled`** - Message was canceled

### Inbound Message Statuses (received by users)
- **`received`** - Message received from sender
- **`accepted`** - Message accepted by Twilio

## Webhook Configuration

### Automatic Configuration
When a user signs up, webhooks are automatically configured:

```javascript
// In signup controller
await twilioClient.incomingPhoneNumbers(phoneNumberSid).update({
  smsUrl: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/smsWebhook`,
  smsMethod: 'POST',
  statusCallback: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/messageStatus`,
  statusCallbackMethod: 'POST'
});
```

### Manual Configuration
Existing users can configure webhooks manually:

```bash
POST /api/configure-webhooks
Authorization: Bearer <token>
```

## Backend Implementation

### Message Status Webhook (`/api/messageStatus`)
```javascript
// Handles status updates from Twilio
messageStatusRouter.post('/', async (req, res) => {
  const { MessageSid, MessageStatus, ErrorCode, ErrorMessage, Timestamp } = req.body;
  
  // Update message status in database
  const message = await prisma.message.update({
    where: { messageSid: MessageSid },
    data: {
      messageStatus: MessageStatus,
      errorCode: ErrorCode || null,
      errorMessage: ErrorMessage || null,
      statusTimestamp: new Date(Timestamp)
    }
  });
});
```

### Send SMS with Status Callback
```javascript
// Include status callback when sending messages
const messageData = {
  body: body,
  from: twilioPhone.twilioPhoneNumber,
  to: to,
  statusCallback: `${process.env.TWILIO_SMS_WEBHOOK_URL}/api/messageStatus`,
  statusCallbackMethod: 'POST'
};

const twilioMessage = await twilioClient.messages.create(messageData);
```

## Frontend Implementation

### Message Status Component
The `MessageStatus` component displays current status and allows manual status checking:

```javascript
<MessageStatus 
  messageId={message.id}
  initialStatus={message.messageStatus}
  onStatusUpdate={(newStatus) => handleStatusCheck(message.id, newStatus)}
/>
```

### Status Summary
The `StatusSummary` component shows:
- Count of messages by status
- Recent status updates
- Overall delivery statistics

## API Endpoints

### Check Message Status
```bash
GET /api/messages/:id/check-status
Authorization: Bearer <token>
```
Manually fetches current status from Twilio and updates database.

### Get Status Summary
```bash
GET /api/messages/status/summary
Authorization: Bearer <token>
```
Returns status counts and recent updates for the authenticated user.

## Environment Variables

Required environment variables:

```bash
# Backend
TWILIO_SMS_WEBHOOK_URL=https://your-domain.com
JWT_SECRET=your-jwt-secret

# Frontend (if different)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Testing

### Test Webhook Endpoint
```bash
POST /api/test-webhook
Content-Type: application/json

{
  "MessageSid": "SM1234567890",
  "From": "+1234567890",
  "To": "+0987654321",
  "Body": "Test message",
  "MessageStatus": "delivered"
}
```

### Manual Status Check
Use the frontend "Check Status" button or API endpoint to manually verify message status.

## Troubleshooting

### Common Issues

1. **Status not updating**: Check webhook configuration and backend logs
2. **Webhook not receiving calls**: Verify Twilio webhook URL is accessible
3. **Authentication errors**: Ensure JWT_SECRET is set correctly
4. **Database errors**: Check Prisma schema and database connection

### Debug Steps

1. Check backend logs for webhook calls
2. Verify webhook URLs in Twilio console
3. Test webhook endpoints manually
4. Check message status in Twilio console
5. Verify user credentials are correct

## Security Considerations

- All webhook endpoints validate required parameters
- User authentication required for status checks
- Status updates only affect user's own messages
- Error handling prevents webhook failures from affecting app

## Best Practices

1. **Always include status callbacks** when sending messages
2. **Handle all status types** in webhook processing
3. **Store error information** for failed messages
4. **Provide manual status checking** for user control
5. **Log webhook activity** for debugging
6. **Validate webhook data** before processing 