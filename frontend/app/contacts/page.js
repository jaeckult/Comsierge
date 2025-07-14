"use client"
import { useState, useEffect } from 'react';
import { getContacts, createContact, updateContact, deleteContact } from '../../api/users';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createContact(name, phone);
      setName('');
      setPhone('');
      fetchContacts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setEditName(contact.name);
    setEditPhone(contact.phone);
  };

  const handleUpdate = async (id) => {
    try {
      await updateContact(id, editName, editPhone);
      setEditingId(null);
      fetchContacts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await deleteContact(id);
      fetchContacts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm">
  <h1 className="text-3xl font-bold mb-6 text-gray-800">Contacts</h1>

  {/* Contact Creation Form */}
  <form onSubmit={handleCreate} className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-8">
    <input
      type="text"
      placeholder="Name"
      value={name}
      onChange={e => setName(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      required
    />
    <input
      type="text"
      placeholder="Phone"
      value={phone}
      onChange={e => setPhone(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      required
    />
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition-colors"
    >
      Add
    </button>
  </form>

  {error && (
    <div className="text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded mb-4">
      {error}
    </div>
  )}

  {/* Contact List */}
  {loading ? (
    <div className="text-gray-600 text-center">Loading...</div>
  ) : contacts.length === 0 ? (
    <div className="text-gray-500 text-center py-12">No contacts found.</div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {contacts.map(contact => (
        <div
          key={contact.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex justify-between items-start hover:shadow transition-shadow"
        >
          {/* Left: Contact Info */}
          <div className="flex-1 cursor-pointer" onClick={() => router.push(`/chat/${contact.id}`)}>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
                {contact.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800 hover:text-blue-700 transition-colors">
                  {contact.name}
                </div>
                <div className="text-sm text-gray-500 font-mono">{contact.phone}</div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 ml-4 mt-2 md:mt-0">
            {editingId === contact.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleUpdate(contact.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors text-sm"
                  title="Save"
                >
                  ✅ Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition-colors text-sm"
                  title="Cancel"
                >
                  ✖ Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(contact)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition-colors text-sm"
                  title="Edit"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors text-sm"
                  title="Delete"
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

  );
} 