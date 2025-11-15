import { FiUser, FiMessageCircle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 rounded-full p-2 ${
          isUser
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
        }`}
      >
        {isUser ? <FiUser className="w-4 h-4" /> : <FiMessageCircle className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-sm mb-2 last:mb-0 text-gray-900 dark:text-gray-100">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2 space-y-1 text-sm text-gray-900 dark:text-gray-100">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2 space-y-1 text-sm text-gray-900 dark:text-gray-100">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="text-gray-900 dark:text-gray-100">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>
                ),
                em: ({ children }) => <em className="italic text-gray-900 dark:text-gray-100">{children}</em>,
                code: ({ children }) => (
                  <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                    {children}
                  </code>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mb-2 text-gray-900 dark:text-white">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold mb-1 text-gray-900 dark:text-white">{children}</h3>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
