import Settings from '../models/Settings.js';
import { logAudit } from '../utils/auditHelper.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    await logAudit({
      req,
      action: 'UPDATE',
      entity: 'Settings',
      entityId: settings._id,
      details: `Updated system settings by ${req.user.name}`,
    });

    res.json({ success: true, data: settings, message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
