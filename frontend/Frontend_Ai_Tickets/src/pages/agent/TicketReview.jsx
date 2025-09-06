import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketById, addReply, uploadAttachment } from '../../api/agentApi';

const TicketReview = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const response = await getTicketById(id);
      setTicket(response.data.data);
    } catch (error) {
      console.error('Error loading ticket:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await addReply(id, { content: replyContent });
      setReplyContent('');
      loadTicket();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    const formData = new FormData();
    formData.append('attachment', file);
    
    try {
      await uploadAttachment(id, formData);
      setFile(null);
      loadTicket();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  if (!ticket) return <div>Loading...</div>;

  return (
    <div>
      <h2>{ticket.title}</h2>
      <p>Status: {ticket.status}</p>
      <p>Priority: {ticket.priority}</p>
      <p>Category: {ticket.category}</p>
      <p>Description: {ticket.description}</p>

      <h3>Replies</h3>
      {ticket.replies.map(reply => (
        <div key={reply._id} style={{ border: '1px solid #eee', margin: '5px', padding: '10px' }}>
          <p>{reply.content}</p>
          <small>By: {reply.authorType} - {new Date(reply.createdAt).toLocaleString()}</small>
        </div>
      ))}

      <form onSubmit={handleReply}>
        <textarea
          placeholder="Add reply..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          required
        />
        <button type="submit">Add Reply</button>
      </form>

      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Upload File</button>
      </form>
    </div>
  );
};

export default TicketReview;