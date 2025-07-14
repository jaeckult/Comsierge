'use client';
import { useState, useEffect } from 'react';
import { sendSMS, scheduleMessage, broadcastMessages, getScheduledMessages, cancelScheduledMessage } from '../../api/messages';
import { getCurrentUser, isAuthenticated } from '../../api/auth';
import { useRouter } from 'next/navigation';
import { getContacts } from '../../api/users';

export default function Compose() {
  const router = useRouter();
  const [form, setForm] = useState({
    to: '',
    body: '',
    mediaUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [sendAt, setSendAt] = useState('');
  const [broadcast, setBroadcast] = useState(false);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    // Check authentication on client side only
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);
      setAuthChecked(true);
      
      if (!authenticated) {
        router.push('/login');
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Fetch contacts for broadcast
    getContacts().then(setContacts).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isUserAuthenticated) {
      router.push('/login');
      return;
    }

    if (!form.to && !broadcast) {
      setError('Phone number is required unless broadcasting');
      return;
    }
    if (!form.body) {
      setError('Message is required');
      return;
    }
    if (schedule && !sendAt) {
      setError('Please select a date and time to schedule');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (broadcast) {
        // Broadcast to all contacts
        const toNumbers = contacts.map(c => c.phone);
        await broadcastMessages(toNumbers, form.body, form.mediaUrl || null);
        setSuccess('Broadcast sent! Redirecting to inbox...');
      } else if (schedule) {
        // Schedule message
        await scheduleMessage(form.to, form.body, sendAt);
        setSuccess('Message scheduled! Redirecting to inbox...');
      } else {
        // Send immediately
        await sendSMS(form.to, form.body, form.mediaUrl || null);
        setSuccess('Message sent successfully! Redirecting to inbox...');
      }
      setForm({ to: '', body: '', mediaUrl: '' });
      setSendAt('');
      setTimeout(() => {
        router.push('/inbox');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as +1 (XXX) XXX-XXXX for US numbers
    if (phoneNumber.length === 10) {
      return `+1 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    } else if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
      return `+1 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    }
    
    return value;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setForm({ ...form, to: formatted });
  };

  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading state if not authenticated (will redirect)
  if (!isUserAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 text-gray-900">
    {/* Header */}
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compose Message</h1>
            <p className="text-sm text-gray-700">Send a new SMS message</p>
          </div>
          <button
            onClick={() => router.push('/inbox')}
            className="text-blue-700 hover:text-blue-900 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors font-medium"
          >
            Back to Inbox
          </button>
        </div>
      </div>
    </div>

    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">&#10003;</span>
            {success}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Compose Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient */}
          <div>
            <label htmlFor="to" className="block text-sm font-semibold text-gray-800 mb-2">
              To (Phone Number)
            </label>
            <input
              type="tel"
              id="to"
              name="to"
              value={form.to}
              onChange={handlePhoneChange}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              required
            />
            <p className="mt-1 text-xs text-gray-700">
              Enter the recipient's phone number in international format
            </p>
          </div>

          {/* Broadcast Option */}
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-800">
              <input
                type="checkbox"
                checked={broadcast}
                onChange={e => setBroadcast(e.target.checked)}
                className="form-checkbox text-blue-600 focus:ring-blue-600"
              />
              <span>Broadcast to all contacts</span>
            </label>
          </div>

          {/* Message Body */}
          <div>
            <label htmlFor="body" className="block text-sm font-semibold text-gray-800 mb-2">
              Message
            </label>
            <textarea
              id="body"
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={6}
              maxLength={1600}
              placeholder="Type your message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none"
              required
            />
            <div className="flex justify-between items-center mt-1 text-xs text-gray-700">
              <p>{form.body.length}/1600 characters</p>
              <p>{Math.ceil(form.body.length / 160)} SMS messages</p>
            </div>
          </div>

          {/* Media URL */}
          <div>
            <label htmlFor="mediaUrl" className="block text-sm font-semibold text-gray-800 mb-2">
              Media URL (Optional)
            </label>
            <input
              type="url"
              id="mediaUrl"
              name="mediaUrl"
              value={form.mediaUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            <p className="mt-1 text-xs text-gray-700">
              Add a URL to an image, video, or audio file to send as MMS
            </p>
          </div>

          {/* Schedule Option */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-800">
              <input
                type="checkbox"
                checked={schedule}
                onChange={e => setSchedule(e.target.checked)}
                className="form-checkbox text-blue-600 focus:ring-blue-600"
              />
              <span>Schedule for later</span>
            </label>
            {schedule && (
              <input
                type="datetime-local"
                value={sendAt}
                onChange={e => setSendAt(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required={schedule}
              />
            )}
          </div>

          {/* Send Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/inbox')}
              className="px-4 py-2 text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!form.to && !broadcast) || !form.body}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Sending Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use international format for phone numbers (+1 for US/Canada)</li>
          <li>• Messages longer than 160 characters will be split into multiple SMS</li>
          <li>• Media URLs must be publicly accessible</li>
          <li>• Supported media formats: JPG, PNG, GIF, MP4, MP3</li>
        </ul>
      </div>
    </div>
  </div>
);

} 