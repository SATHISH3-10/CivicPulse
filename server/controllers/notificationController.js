import Notification from '../models/Notification.js';

export async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .populate('complaintId', 'complaintId title status')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markRead(req, res) {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

export async function markAllRead(req, res) {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    console.error('markAllRead error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}
