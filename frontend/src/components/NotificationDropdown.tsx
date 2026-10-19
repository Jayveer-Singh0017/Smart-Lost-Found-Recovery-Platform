import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { NotificationDto } from '../types';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [paged, count] = await Promise.all([
        notificationService.getMyNotifications(0, 8),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(paged.content);
      setUnreadCount(count);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      notificationService.getUnreadCount().then(setUnreadCount).catch(() => {});
    }, 30000); // Polling unread count every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleClickItem = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch {
        // ignore
      }
    }
    setIsOpen(false);

    if (notification.referenceType === 'ItemReport' && notification.referenceId) {
      navigate(`/items/${notification.referenceId}`);
    } else if (notification.referenceType === 'Claim' && notification.referenceId) {
      navigate(`/claims`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#182338] rounded-xl transition cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5 stroke-[2]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-[#0B1020]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#121A2B] shadow-2xl border border-[#2B3850] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between p-4 border-b border-[#2B3850] bg-[#182338]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F1F5F9] text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-[#6D5EF7]/20 text-[#6D5EF7] text-xs px-2 py-0.5 rounded-full font-semibold border border-[#6D5EF7]/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-[#6D5EF7] hover:text-[#8D82F9] transition flex items-center cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-[#2B3850]">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClickItem(n)}
                  className={`p-3.5 hover:bg-[#182338] transition cursor-pointer flex gap-3 text-left ${
                    !n.isRead ? 'bg-[#6D5EF7]/10' : ''
                  }`}
                >
                  <div className="mt-1 flex-shrink-0">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        !n.isRead ? 'bg-[#6D5EF7] ring-2 ring-[#6D5EF7]/30' : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!n.isRead ? 'font-bold text-[#F1F5F9]' : 'font-medium text-[#94A3B8]'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-[#94A3B8] line-clamp-2 mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      {n.referenceId && (
                        <span className="inline-flex items-center text-[#6D5EF7] hover:underline">
                          View details <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
