// // src/pages/Messages/MessageInput.jsx
// import React from 'react';

// const MessageInput = ({ newMessage, setNewMessage, onSend, sending }) => (
//   <form onSubmit={onSend} className="bg-white border-t p-3 flex items-center space-x-2">
//     <input
//       value={newMessage}
//       onChange={(e) => setNewMessage(e.target.value)}
//       placeholder="Type a message..."
//       className="flex-1 px-3 py-2 border rounded"
//     />
//     <button
//       type="submit"
//       disabled={!newMessage.trim() || sending}
//       className="px-4 py-2 bg-blue-500 text-white rounded"
//     >
//       {sending ? 'Sending...' : 'Send'}
//     </button>
//   </form>
// );

// export default MessageInput;

import React from "react";

const MessageInput = ({ newMessage, setNewMessage, onSend, sending }) => (
  <form
    onSubmit={onSend}
    className="p-4 bg-white border-t flex items-center gap-3"
  >
    <input
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Type a message..."
      className="flex-1 px-4 py-2 rounded-full bg-gray-100 border border-gray-300 focus:border-blue-500 outline-none text-black"
    />

    <button
      type="submit"
      disabled={!newMessage.trim() || sending}
      className="px-5 py-2 bg-blue-600 text-white rounded-full shadow disabled:bg-blue-300"
    >
      {sending ? "Sending..." : "Send"}
    </button>
  </form>
);

export default MessageInput;


