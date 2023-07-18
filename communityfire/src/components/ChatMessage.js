import React, { useEffect, useRef } from 'react';

const ChatMessage = ({ message }) => {
  // Extract the necessary data from the message
  const { content, displayName } = message;

  // Create a ref to the message div
  const messageRef = useRef(null);

  // Set the width of the message div to fit its content using useEffect
  useEffect(() => {
    const { current: messageDiv } = messageRef;
    messageDiv.style.width = 'fit-content';
  }, []);

  return (
    // Attach the messageRef to the div to access it in useEffect
    <div ref={messageRef} className="chat-message">
      <p className="sender-name">{displayName}</p>
      <p className="message-content">{content}</p>
    </div>
  );
};

export default ChatMessage;
