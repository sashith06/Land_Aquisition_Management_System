import React, { useState, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  InboxIcon, 
  PaperClipIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const Messages = () => {
  const [currentView, setCurrentView] = useState('inbox'); // inbox, outbox, compose, view
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageThread, setMessageThread] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Compose message state
  const [composeData, setComposeData] = useState({
    recipient_id: '',
    subject: '',
    content: '',
    priority: 'normal',
    attachments: []
  });

  useEffect(() => {
    loadMessages();
    loadUsers();
    loadUnreadCount();
  }, [currentView]);

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadUnreadCount();
      if (currentView === 'inbox') {
        loadMessages();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [currentView]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/messages?type=${currentView}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.messages) {
          setMessages(data.messages || []);
        } else {
          setMessages([]);
        }
      } else {
        console.error('Error loading messages:', response.statusText);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/messages/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.users) {
          setUsers(data.users || []);
        } else {
          setUsers([]);
        }
      } else {
        console.error('Error loading users:', response.statusText);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        } else {
          setUnreadCount(0);
        }
      } else {
        console.error('Error loading unread count:', response.statusText);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    setComposeData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index) => {
    setComposeData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!composeData.recipient_id || !composeData.subject || !composeData.content) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('recipient_id', composeData.recipient_id);
      formData.append('subject', composeData.subject);
      formData.append('content', composeData.content);
      formData.append('priority', composeData.priority);
      
      if (selectedMessage) {
        formData.append('parent_message_id', selectedMessage.id);
        formData.append('message_type', 'reply');
      }

      composeData.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setComposeData({
          recipient_id: '',
          subject: '',
          content: '',
          priority: 'normal',
          attachments: []
        });
        setCurrentView('inbox');
        loadMessages();
      } else {
        const error = await response.json();
        alert('Error sending message: ' + error.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
    setLoading(false);
  };

  const viewMessage = async (message) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/${message.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedMessage(data.message);
        
        // Load thread if it exists
        const threadResponse = await fetch(`http://localhost:5000/api/messages/${message.id}/thread`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (threadResponse.ok) {
          const threadData = await threadResponse.json();
          setMessageThread(threadData.thread);
        }
        
        setCurrentView('view');
        
        // Explicitly mark as read if it's an unread message
        if (!message.is_read && currentView === 'inbox') {
          try {
            const markReadResponse = await fetch(`http://localhost:5000/api/messages/${message.id}/read`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (markReadResponse.ok) {
              console.log('Message marked as read successfully');
            }
          } catch (markError) {
            console.error('Error marking message as read:', markError);
          }
        }
        
        // Update unread count and message list
        await loadUnreadCount();
        await loadMessages();
      }
    } catch (error) {
      console.error('Error loading message:', error);
    }
    setLoading(false);
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        alert('Message deleted successfully');
        loadMessages();
        loadUnreadCount(); // Update unread count
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
          setCurrentView('inbox');
        }
      } else {
        alert(`Error deleting message: ${result.message || 'Unknown error'}`);
        console.error('Delete error:', result);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message. Please try again.');
    }
  };

  const downloadAttachment = async (messageId, attachmentId, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}/attachments/${attachmentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Download failed');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error.message}`);
    }
  };

  const searchMessages = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
    }
    setLoading(false);
  };

  const replyToMessage = () => {
    setComposeData({
      recipient_id: selectedMessage.sender_id,
      subject: selectedMessage.subject.startsWith('Re: ') ? selectedMessage.subject : `Re: ${selectedMessage.subject}`,
      content: '',
      priority: 'normal',
      attachments: []
    });
    setCurrentView('compose');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-green-600 bg-green-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return <PhotoIcon className="w-4 h-4" />;
    }
    return <DocumentIcon className="w-4 h-4" />;
  };

  const renderSidebar = () => (
    <div className="bg-white border-r border-gray-200 w-64 flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
      </div>
      
      <div className="p-4">
        <button
          onClick={() => setCurrentView('compose')}
          className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          Compose
        </button>
      </div>

      <nav className="px-4">
        <div className="space-y-1">
          <button
            onClick={() => setCurrentView('inbox')}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
              currentView === 'inbox' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <InboxIcon className="w-5 h-5" />
            Inbox
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setCurrentView('outbox')}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
              currentView === 'outbox' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            Sent
          </button>
        </div>
      </nav>

      {/* Search */}
      <div className="p-4 border-t border-gray-200 mt-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchMessages()}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          {searchTerm && (
            <button
              onClick={searchMessages}
              className="absolute right-2 top-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Search
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderMessageList = () => (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold capitalize">{currentView}</h3>
      </div>
      
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <InboxIcon className="w-12 h-12 mx-auto mb-4" />
              <p>No messages found</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div
                key={message.id}
                onClick={() => viewMessage(message)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !message.is_read && currentView === 'inbox' ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 truncate">
                        {currentView === 'inbox' 
                          ? `${message.sender_first_name} ${message.sender_last_name}`
                          : `${message.recipient_first_name} ${message.recipient_last_name}`
                        }
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                    </div>
                    
                    <h4 className={`truncate ${!message.is_read && currentView === 'inbox' ? 'font-semibold' : 'font-medium'}`}>
                      {message.subject}
                    </h4>
                    
                    <p className="text-gray-600 text-sm truncate mt-1">
                      {(message.content || message.message || '').substring(0, 100)}{(message.content || message.message || '').length > 100 ? '...' : ''}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{new Date(message.created_at).toLocaleDateString()}</span>
                      {message.has_attachments > 0 && (
                        <span className="flex items-center gap-1">
                          <PaperClipIcon className="w-3 h-3" />
                          {message.attachment_count}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!message.is_read && currentView === 'inbox' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(message.id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCompose = () => (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {selectedMessage ? 'Reply to Message' : 'Compose Message'}
        </h3>
        <button
          onClick={() => setCurrentView('inbox')}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={sendMessage} className="flex-1 flex flex-col p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To: <span className="text-red-500">*</span>
            </label>
            <select
              value={composeData.recipient_id}
              onChange={(e) => setComposeData(prev => ({ ...prev, recipient_id: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select recipient...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role}) - {user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={composeData.subject}
              onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={composeData.priority}
                onChange={(e) => setComposeData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
              <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                <PaperClipIcon className="w-4 h-4" />
                <span className="text-sm">Choose files...</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                />
              </label>
            </div>
          </div>

          {composeData.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments ({composeData.attachments.length})</h4>
              <div className="space-y-2">
                {composeData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message: <span className="text-red-500">*</span>
            </label>
            <textarea
              value={composeData.content}
              onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
              placeholder="Type your message here..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentView('inbox')}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="w-4 h-4" />
            )}
            Send Message
          </button>
        </div>
      </form>
    </div>
  );

  const renderMessageView = () => (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('inbox')}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">Message Details</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={replyToMessage}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm"
          >
            Reply
          </button>
          <button
            onClick={() => deleteMessage(selectedMessage.id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {selectedMessage && (
          <div className="p-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedMessage.sender_first_name} {selectedMessage.sender_last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{selectedMessage.sender_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedMessage.subject}
                </h2>

                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Attachments ({selectedMessage.attachments.length})
                    </h5>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          {getFileIcon(attachment.mime_type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{attachment.original_filename}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.file_size)} • {attachment.file_type}
                            </p>
                          </div>
                          <button
                            onClick={() => downloadAttachment(selectedMessage.id, attachment.id, attachment.original_filename)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedMessage.content || selectedMessage.message || 'No content available'}
              </div>
            </div>

            {/* Show message thread if there are replies */}
            {messageThread.length > 1 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Conversation ({messageThread.length - 1} replies)
                </h4>
                <div className="space-y-4">
                  {messageThread.slice(1).map((message) => (
                    <div key={message.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {message.sender_first_name} {message.sender_last_name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-gray-700">
                        {message.content || message.message || 'No content available'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex">
      {renderSidebar()}
      
      {currentView === 'compose' && renderCompose()}
      {(currentView === 'inbox' || currentView === 'outbox') && renderMessageList()}
      {currentView === 'view' && renderMessageView()}
    </div>
  );
};

export default Messages;