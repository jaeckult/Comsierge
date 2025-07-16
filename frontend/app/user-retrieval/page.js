// 'use client';

// import { useState, useEffect } from 'react';
// import { getComprehensiveUserData, getAllUsers } from '../../api';
// import { useRouter } from 'next/navigation';

// export default function UserRetrievalPage() {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const router = useRouter();

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   const loadUsers = async () => {
//     try {
//       setLoading(true);
//       const usersData = await getAllUsers();
//       setUsers(usersData);
//     } catch (err) {
//       setError('Failed to load users');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadUserData = async (userId) => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await getComprehensiveUserData(userId);
//       setUserData(data);
//     } catch (err) {
//       setError('Failed to load user data');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUserSelect = (user) => {
//     setSelectedUser(user);
//     loadUserData(user.id);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//   };

//   if (loading && !userData) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">User Data Retrieval</h1>
//           <p className="text-gray-800">Comprehensive user information and data</p>
//         </div>
  
//         {/* User Selection */}
//         <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
//           <h2 className="text-xl font-semibold mb-4 text-gray-900">Select User</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {users.map((user) => (
//               <button
//                 key={user.id}
//                 onClick={() => handleUserSelect(user)}
//                 className={`p-4 rounded-lg border-2 transition-all text-left ${
//                   selectedUser?.id === user.id
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
//                 }`}
//               >
//                 <div>
//                   <h3 className="font-medium text-gray-900">{user.username}</h3>
//                   <p className="text-sm text-gray-800">ID: {user.id}</p>
//                   <p className="text-sm text-gray-800">Created: {formatDate(user.createdAt)}</p>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
  
//         {/* Error Display */}
//         {error && (
//           <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-8">
//             <p className="text-red-900 font-medium">{error}</p>
//           </div>
//         )}
  
//         {/* User Data Display */}
//         {userData && (
//           <div className="bg-white rounded-lg shadow-sm border text-gray-900">
//             {/* User Info Header */}
//             <div className="p-6 border-b">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">{userData.user.username}</h2>
//                   <p className="text-gray-800">User ID: {userData.user.id}</p>
//                 </div>
//                 <div className="text-right text-sm text-gray-700">
//                   <p>Created: {formatDate(userData.user.createdAt)}</p>
//                   <p>Updated: {formatDate(userData.user.updatedAt)}</p>
//                 </div>
//               </div>
//             </div>
  
//             {/* Tabs */}
//             <div className="border-b bg-gray-50">
//               <nav className="flex space-x-8 px-6 text-sm">
//                 {["overview", "credentials", "messages", "scheduled", "contacts", "forwardings"].map((tab) => (
//                   <button
//                     key={tab}
//                     onClick={() => setActiveTab(tab)}
//                     className={`py-4 px-1 border-b-2 font-medium ${
//                       activeTab === tab
//                         ? 'border-blue-500 text-blue-700'
//                         : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
//                     }`}
//                   >
//                     {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                   </button>
//                 ))}
//               </nav>
//             </div>

//             {/* Tab Content */}
//             <div className="p-6">
//               {/* Overview Tab */}
//               {activeTab === 'overview' && (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-gray-50 p-4 rounded-lg">
//                       <h4 className="font-semibold mb-2">User Information</h4>
//                       <div className="space-y-2 text-sm">
//                         <div>
//                           <span className="font-medium">Username:</span> {userData.user.username}
//                         </div>
//                         <div>
//                           <span className="font-medium">Password:</span>
//                           <div className="flex items-center gap-2 mt-1">
//                             <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
//                               {userData.user.password}
//                             </code>
//                             <button
//                               onClick={() => copyToClipboard(userData.user.password)}
//                               className="text-blue-600 hover:text-blue-800 text-xs"
//                             >
//                               Copy
//                             </button>
//                           </div>
//                         </div>
//                         <div>
//                           <span className="font-medium">Created:</span> {formatDate(userData.user.createdAt)}
//                         </div>
//                         <div>
//                           <span className="font-medium">Updated:</span> {formatDate(userData.user.updatedAt)}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 p-4 rounded-lg">
//                       <h4 className="font-semibold mb-2">Twilio Phone Numbers</h4>
//                       {userData.twilioPhoneNumbers.map((phone, index) => (
//                         <div key={phone.id} className="mb-3 p-3 bg-white rounded border">
//                           <div className="text-sm space-y-1">
//                             <div><span className="font-medium">Phone:</span> {phone.twilioPhoneNumber}</div>
//                             <div><span className="font-medium">Account SID:</span> {phone.twilioAccountSid}</div>
//                             <div><span className="font-medium">Auth Token:</span>
//                               <div className="flex items-center gap-2 mt-1">
//                                 <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
//                                   {phone.twilioAuthToken}
//                                 </code>
//                                 <button
//                                   onClick={() => copyToClipboard(phone.twilioAuthToken)}
//                                   className="text-blue-600 hover:text-blue-800 text-xs"
//                                 >
//                                   Copy
//                                 </button>
//                               </div>
//                             </div>
//                             <div><span className="font-medium">Primary:</span> {phone.isPrimary ? 'Yes' : 'No'}</div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Credentials Tab */}
//               {activeTab === 'credentials' && (
//                 <div className="space-y-6">
//                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                     <h4 className="font-semibold text-red-800 mb-2">⚠️ Sensitive Information</h4>
//                     <p className="text-red-700 text-sm">
//                       This section contains sensitive credentials. Handle with care.
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-gray-50 p-4 rounded-lg">
//                       <h4 className="font-semibold mb-3">User Credentials</h4>
//                       <div className="space-y-3">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Username
//                           </label>
//                           <div className="flex items-center gap-2">
//                             <input
//                               type="text"
//                               value={userData.user.username}
//                               readOnly
//                               className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm"
//                             />
//                             <button
//                               onClick={() => copyToClipboard(userData.user.username)}
//                               className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
//                             >
//                               Copy
//                             </button>
//                           </div>
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Password (Hashed)
//                           </label>
//                           <div className="flex items-center gap-2">
//                             <input
//                               type="text"
//                               value={userData.user.password}
//                               readOnly
//                               className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono"
//                             />
//                             <button
//                               onClick={() => copyToClipboard(userData.user.password)}
//                               className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
//                             >
//                               Copy
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 p-4 rounded-lg">
//                       <h4 className="font-semibold mb-3">Twilio Credentials</h4>
//                       {userData.twilioPhoneNumbers.map((phone, index) => (
//                         <div key={phone.id} className="mb-4 p-4 bg-white rounded border">
//                           <h5 className="font-medium mb-2">Phone Number {index + 1}</h5>
//                           <div className="space-y-3">
//                             <div>
//                               <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Phone Number
//                               </label>
//                               <div className="flex items-center gap-2">
//                                 <input
//                                   type="text"
//                                   value={phone.twilioPhoneNumber}
//                                   readOnly
//                                   className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm"
//                                 />
//                                 <button
//                                   onClick={() => copyToClipboard(phone.twilioPhoneNumber)}
//                                   className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
//                                 >
//                                   Copy
//                                 </button>
//                               </div>
//                             </div>
//                             <div>
//                               <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Account SID
//                               </label>
//                               <div className="flex items-center gap-2">
//                                 <input
//                                   type="text"
//                                   value={phone.twilioAccountSid}
//                                   readOnly
//                                   className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono"
//                                 />
//                                 <button
//                                   onClick={() => copyToClipboard(phone.twilioAccountSid)}
//                                   className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
//                                 >
//                                   Copy
//                                 </button>
//                               </div>
//                             </div>
//                             <div>
//                               <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Auth Token
//                               </label>
//                               <div className="flex items-center gap-2">
//                                 <input
//                                   type="text"
//                                   value={phone.twilioAuthToken}
//                                   readOnly
//                                   className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono"
//                                 />
//                                 <button
//                                   onClick={() => copyToClipboard(phone.twilioAuthToken)}
//                                   className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
//                                 >
//                                   Copy
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Messages Tab */}
//               {activeTab === 'messages' && (
//                 <div>
//                   <div className="mb-4 flex justify-between items-center">
//                     <h4 className="text-lg font-semibold">
//                       Messages ({userData.messages.length})
//                     </h4>
//                     <div className="text-sm text-gray-500">
//                       Showing {Math.min(userData.messages.length, 50)} of {userData.messages.length}
//                     </div>
//                   </div>
//                   <div className="space-y-3 max-h-96 overflow-y-auto">
//                     {userData.messages.slice(0, 50).map((message) => (
//                       <div key={message.id} className="border rounded-lg p-4 bg-gray-50">
//                         <div className="flex justify-between items-start mb-2">
//                           <div className="flex items-center gap-2">
//                             <span className={`px-2 py-1 rounded text-xs font-medium ${
//                               message.direction === 'inbound' 
//                                 ? 'bg-green-100 text-green-800' 
//                                 : 'bg-blue-100 text-blue-800'
//                             }`}>
//                               {message.direction}
//                             </span>
//                             <span className={`px-2 py-1 rounded text-xs font-medium ${
//                               message.messageStatus === 'delivered' 
//                                 ? 'bg-green-100 text-green-800'
//                                 : message.messageStatus === 'failed'
//                                 ? 'bg-red-100 text-red-800'
//                                 : 'bg-yellow-100 text-yellow-800'
//                             }`}>
//                               {message.messageStatus}
//                             </span>
//                           </div>
//                           <span className="text-xs text-gray-500">
//                             {formatDate(message.timestamp)}
//                           </span>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                           <div>
//                             <span className="font-medium">From:</span> {message.from}
//                           </div>
//                           <div>
//                             <span className="font-medium">To:</span> {message.to}
//                           </div>
//                         </div>
//                         <div className="mt-2">
//                           <span className="font-medium">Body:</span>
//                           <p className="text-sm bg-white p-2 rounded border mt-1">
//                             {message.body}
//                           </p>
//                         </div>
//                         <div className="mt-2 text-xs text-gray-500">
//                           <span className="font-medium">Message SID:</span> {message.messageSid}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Scheduled Messages Tab */}
//               {activeTab === 'scheduled' && (
//                 <div>
//                   <h4 className="text-lg font-semibold mb-4">
//                     Scheduled Messages ({userData.scheduledMessages.length})
//                   </h4>
//                   <div className="space-y-3">
//                     {userData.scheduledMessages.map((scheduled) => (
//                       <div key={scheduled.id} className="border rounded-lg p-4 bg-gray-50">
//                         <div className="flex justify-between items-start mb-2">
//                           <div className="flex items-center gap-2">
//                             <span className={`px-2 py-1 rounded text-xs font-medium ${
//                               scheduled.sent 
//                                 ? 'bg-green-100 text-green-800'
//                                 : scheduled.failed
//                                 ? 'bg-red-100 text-red-800'
//                                 : 'bg-yellow-100 text-yellow-800'
//                             }`}>
//                               {scheduled.sent ? 'Sent' : scheduled.failed ? 'Failed' : 'Pending'}
//                             </span>
//                           </div>
//                           <span className="text-xs text-gray-500">
//                             Scheduled: {formatDate(scheduled.sendAt)}
//                           </span>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                           <div>
//                             <span className="font-medium">From:</span> {scheduled.from}
//                           </div>
//                           <div>
//                             <span className="font-medium">To:</span> {scheduled.to}
//                           </div>
//                         </div>
//                         <div className="mt-2">
//                           <span className="font-medium">Body:</span>
//                           <p className="text-sm bg-white p-2 rounded border mt-1">
//                             {scheduled.body}
//                           </p>
//                         </div>
//                         {scheduled.errorMessage && (
//                           <div className="mt-2 text-sm text-red-600">
//                             <span className="font-medium">Error:</span> {scheduled.errorMessage}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Contacts Tab */}
//               {activeTab === 'contacts' && (
//                 <div>
//                   <h4 className="text-lg font-semibold mb-4">
//                     Contacts ({userData.contacts.length})
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {userData.contacts.map((contact) => (
//                       <div key={contact.id} className="border rounded-lg p-4 bg-gray-50">
//                         <h5 className="font-medium text-gray-900">{contact.name}</h5>
//                         <p className="text-sm text-gray-600">{contact.phone}</p>
//                         <p className="text-xs text-gray-500 mt-2">
//                           Created: {formatDate(contact.createdAt)}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Forwardings Tab */}
//               {activeTab === 'forwardings' && (
//                 <div>
//                   <h4 className="text-lg font-semibold mb-4">
//                     Message Forwardings ({userData.messageForwardings.length})
//                   </h4>
//                   <div className="space-y-3">
//                     {userData.messageForwardings.map((forwarding) => (
//                       <div key={forwarding.id} className="border rounded-lg p-4 bg-gray-50">
//                         <div className="flex justify-between items-start mb-2">
//                           <span className="text-xs text-gray-500">
//                             Forwarded: {formatDate(forwarding.forwardedAt)}
//                           </span>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div>
//                             <h5 className="font-medium text-sm mb-2">Original Message</h5>
//                             <div className="text-xs space-y-1">
//                               <div><span className="font-medium">From:</span> {forwarding.originalMessage.from}</div>
//                               <div><span className="font-medium">To:</span> {forwarding.originalMessage.to}</div>
//                               <div><span className="font-medium">Body:</span> {forwarding.originalMessage.body}</div>
//                             </div>
//                           </div>
//                           <div>
//                             <h5 className="font-medium text-sm mb-2">Forwarded Message</h5>
//                             <div className="text-xs space-y-1">
//                               <div><span className="font-medium">From:</span> {forwarding.forwardedMessage.from}</div>
//                               <div><span className="font-medium">To:</span> {forwarding.forwardedMessage.to}</div>
//                               <div><span className="font-medium">Body:</span> {forwarding.forwardedMessage.body}</div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// } 