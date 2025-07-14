"use client"; 
import { useState, useEffect, useRef } from 'react';
import { getContacts } from '../../../api/users';
import { getMessages, sendSMS } from '../../../api/messages';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const params = useParams();
  const contactId = params.contactId;
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchContactAndMessages();
    // eslint-disable-next-line
  }, [contactId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchContactAndMessages = async () => {
    setLoading(true);
    try {
      const contacts = await getContacts();
      const c = contacts.find(c => c.id === contactId);
      setContact(c);
      if (!c) throw new Error('Contact not found');
      const data = await getMessages({
        limit: 100,
        conversationWith: c.phone
      });
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await sendSMS(contact.phone, body);
      setBody('');
      fetchContactAndMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 min-h-screen bg-gray-50 flex flex-col" style={{height: '100vh'}}>
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 text-center">Chat with <span className="text-blue-700">{contact?.name}</span></h1>
      </div>
      <div className="flex-1 flex flex-col-reverse overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-2" style={{minHeight: '400px', maxHeight: '60vh'}}>
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-700 bg-red-100 border border-red-300 rounded p-4 text-center max-w-md mx-auto mt-8">{error}</div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="text-gray-400 text-center my-8">No messages yet. Start the conversation!</div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`mb-3 flex ${msg.from === contact?.phone ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-md text-base break-words relative ${msg.from === contact?.phone
                    ? 'bg-gray-200 text-gray-900 border border-gray-300'
                    : 'bg-blue-700 text-white border border-blue-800'}
                  `}>
                    {/* Sender label for received messages */}
                    {msg.from === contact?.phone && (
                      <div className="text-xs text-blue-700 font-semibold mb-1">{contact?.name}</div>
                    )}
                    <div>{msg.body}</div>
                    <div className="text-xs text-gray-500 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>
      </div>
      <form onSubmit={handleSend} className="flex space-x-2 mt-2 bg-white rounded-lg shadow px-4 py-3 border border-gray-200">
        <input
          type="text"
          value={body}
          onChange={e => setBody(e.target.value)}
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
          placeholder="Type a message..."
          disabled={sending}
          autoFocus
        />
        <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold shadow disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" disabled={sending || !body.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 