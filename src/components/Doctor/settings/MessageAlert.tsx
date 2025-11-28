import React from 'react';
import { Message } from '@/types/doctor';

interface MessageAlertProps {
  message: Message;
}

const MessageAlert: React.FC<MessageAlertProps> = ({ message }) => {
  if (!message.content) return null;

  return (
    <div
      className={`mx-6 mt-4 p-4 rounded-md ${
        message.type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}
    >
      {message.content}
    </div>
  );
};

export default MessageAlert;
