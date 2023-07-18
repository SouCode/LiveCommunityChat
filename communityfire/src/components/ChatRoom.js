import firebase from 'firebase/compat/app';
import React, { useState, useEffect, useRef } from 'react';
import { auth, firestore } from '../firebase';
import '../chatStyles.css';

const ChatRoom = () => {
  // State variables
  const [user, setUser] = useState(null); // User object
  const [messages, setMessages] = useState([]); // Array of messages
  const [newMessage, setNewMessage] = useState(''); // Current input value for new message
  const [theme, setTheme] = useState('dark'); // Theme ('dark' or 'light')
  const messagesEndRef = useRef(null); // Ref for scrolling to the bottom of the messages

  useEffect(() => {
    // Firebase auth state change listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // Set the user object if authenticated
      } else {
        setUser(null); // Set user to null if not authenticated
      }
    });

    return () => unsubscribe(); // Unsubscribe from the listener on component unmount
  }, []);

  useEffect(() => {
    // Fetch messages from Firestore and set up snapshot listener
    const messagesRef = firestore.collection('messages');
    const unsubscribe = messagesRef
      .orderBy('timestamp')
      .onSnapshot((snapshot) => {
        const messageList = snapshot.docs.map((doc) => doc.data());
        setMessages(messageList); // Update messages state with new messages
      });

    return () => unsubscribe(); // Unsubscribe from the snapshot listener on component unmount
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the messages when new messages are received
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      setNewMessage(''); // Clear the input value after sending a message
    }
  };

  const handleSignIn = () => {
    // Sign in with Google
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  const handleSignOut = () => {
    // Sign out
    auth.signOut();
  };

  const toggleTheme = () => {
    // Toggle between 'dark' and 'light' theme
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    // Update the HTML root element with the selected theme
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={`chat-container ${theme}`}>
      {/* Chat header */}
      <div className="chat-header">
        {/* Conditional rendering of sign-in or sign-out button */}
        {user ? (
          <button className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
        ) : (
          <button className="sign-in-button" onClick={handleSignIn}>
            Sign In
          </button>
        )}

        {/* Theme toggle */}
        <div className="theme-toggle" onClick={toggleTheme}>
          <div className={`slider ${theme === 'light' ? 'light' : 'dark'}`}></div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="chat-messages">
        {/* Map through messages and render each chat message */}
        {messages.map((message) => (
          <div
            className={`chat-message ${
              message.uid === user?.uid ? 'sender-message' : 'receiver-message'
            }`}
            key={message.timestamp}
          >
            <span className="sender-name">{message.displayName}</span>
            <span className="message-content">{message.content}</span>
          </div>
        ))}

        {/* Empty div with ref for scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message form */}
      {user && (
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
      )}
    </div>
  );
};

export default ChatRoom;
