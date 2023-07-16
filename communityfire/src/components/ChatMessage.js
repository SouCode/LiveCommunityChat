// src/components/ChatMessage.js

import React from 'react';

const ChatMessage = ({ message }) => {
  const { content, displayName } = message;

  return (
    <div className="chat-message">
      <p>
        {displayName}: {content}
      </p>
    </div>
  );
};

export default ChatMessage;
