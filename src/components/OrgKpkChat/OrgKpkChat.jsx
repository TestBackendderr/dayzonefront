import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { orgChatAPI } from '../../services/api';
import { API_CONFIG } from '../../config/api';
import '../GroupKpkChat/GroupKpkChat.scss';

const POLL_INTERVAL = 5000;

const OrgKpkChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [chatTitle, setChatTitle] = useState('КПК — организации');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastMessageIdRef = useRef(0);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      setError('');

      const after = initial ? null : lastMessageIdRef.current || null;
      const data = await orgChatAPI.getMessages(after && after > 0 ? after : undefined);

      setChatTitle(data.title || 'КПК — организации');

      const incoming = data.messages || [];
      if (initial) {
        setMessages(incoming);
      } else if (incoming.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const merged = [...prev];
          incoming.forEach((m) => {
            if (!ids.has(m.id)) merged.push(m);
          });
          return merged;
        });
      }

      if (incoming.length > 0) {
        const maxId = Math.max(...incoming.map((m) => m.id));
        if (maxId > lastMessageIdRef.current) {
          lastMessageIdRef.current = maxId;
        }
      }
    } catch (err) {
      if (initial) {
        setError(err.response?.data?.message || 'Ошибка загрузки чата');
        setMessages([]);
      }
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    lastMessageIdRef.current = 0;
    loadMessages(true);
  }, [loadMessages]);

  useEffect(() => {
    const timer = setInterval(() => loadMessages(false), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text && !photoFile) return;

    try {
      setSending(true);
      const data = await orgChatAPI.sendMessage(text, photoFile);
      setInput('');
      clearPhoto();
      if (data.chatMessage) {
        setMessages((prev) => [...prev, data.chatMessage]);
        lastMessageIdRef.current = Math.max(lastMessageIdRef.current, data.chatMessage.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Можно прикрепить только изображение');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canSend = (input.trim() || photoFile) && !sending;

  const formatTime = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    }) : '';

  return (
    <div className="group-kpk-chat">
      <div className="chat-header">
        <h2>Чат КПК организации</h2>
        <div className="chat-subtitle">{chatTitle}</div>
        <div className="chat-group-label">Общий канал — все группы и администрация</div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="chat-panel">
        <div className="chat-messages">
          {loading ? (
            <div className="chat-empty">Загрузка сообщений...</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">Сообщений пока нет — напишите первым</div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === user.id || msg.username === user.username;
              const isAdminMsg = msg.authorRole === 'Admin';
              return (
                <div
                  key={msg.id}
                  className={`chat-msg ${isOwn ? 'own' : ''} ${isAdminMsg ? 'admin-msg' : ''}`}
                >
                  <div className="chat-msg-author">
                    {msg.username}
                    <span className="chat-msg-group"> · {msg.authorGroupName}</span>
                  </div>
                  {msg.photo && (
                    <a
                      href={`${API_CONFIG.FILE_BASE_URL}${msg.photo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chat-msg-photo-link"
                    >
                      <img
                        src={`${API_CONFIG.FILE_BASE_URL}${msg.photo}`}
                        alt="Фото"
                        className="chat-msg-photo"
                      />
                    </a>
                  )}
                  {msg.message && <div className="chat-msg-text">{msg.message}</div>}
                  <div className="chat-msg-time">{formatTime(msg.createdAt)}</div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-bar" onSubmit={handleSend}>
          <div className="chat-input-main">
            {photoPreview && (
              <div className="chat-photo-preview">
                <img src={photoPreview} alt="Превью" />
                <button type="button" className="chat-photo-remove" onClick={clearPhoto}>✕</button>
              </div>
            )}
            <div className="chat-input-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="chat-file-input"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                className="btn-attach-photo"
                onClick={() => fileInputRef.current?.click()}
                title="Прикрепить фото"
              >
                📷
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Сообщение..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (canSend) handleSend(e);
                  }
                }}
              />
              <button type="submit" className="btn-send" disabled={!canSend}>
                {sending ? '...' : 'Отправить'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgKpkChat;
