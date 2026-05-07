import notificationService from '../services/notification.service.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const notificationController = {
  createNotification: asyncHandler(async (req, res) => {
    const notification = await notificationService.createNotification({
      ...req.body,
      actorId: req.body.actorId || req.userId,
    }, req.app.get('io'));

    res.status(201).json({
      success: true,
      message: 'Notificación creada',
      data: notification,
    });
  }),

  getNotifications: asyncHandler(async (req, res) => {
    const result = await notificationService.getNotifications(req.userId);

    res.status(200).json({
      success: true,
      message: 'Notificaciones obtenidas',
      data: result,
    });
  }),

  markAsRead: asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.userId);

    res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notification,
    });
  }),

  markAllAsRead: asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.userId);

    res.status(200).json({
      success: true,
      message: 'Notificaciones marcadas como leídas',
      data: result,
    });
  }),
};

export default notificationController;
