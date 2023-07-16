// ChatRoom.js

import firebase from 'firebase/compat/app';
import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import '../chatStyles.css'; // Import the chatStyles.css file

const ChatRoom = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const messagesRef = firestore.collection('messages');
    const unsubscribe = messagesRef
      .orderBy('timestamp')
      .onSnapshot((snapshot) => {
        const messageList = snapshot.docs.map((doc) => doc.data());
        setMessages(messageList);
      });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      const { uid, displayName } = user;
      const messagesRef = firestore.collection('messages');
      await messagesRef.add({
        content: newMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        displayName,
      });
      setNewMessage('');
    }
  };

  const handleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        {user ? (
          <button className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
        ) : (
          <button className="sign-in-button" onClick={handleSignIn}>
            Sign In
          </button>
        )}
      </div>
      {user && (
        <>
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                className={`chat-message ${
                  message.uid === user.uid ? 'sender-message' : 'receiver-message'
                }`}
                key={message.timestamp}
              >
                <span className="sender-name">{message.displayName}</span>
                <span className="message-content">{message.content}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="message-input"
              placeholder="Type a message..."
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatRoom;
