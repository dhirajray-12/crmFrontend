// SettingsPopup.tsx
import React, { useState } from "react";
import "./SettingsPopup.css";

interface SettingsState {
  theme: "light" | "dark";
  notifications: boolean;
  soundEnabled: boolean;
  language: "en" | "es" | "fr";
  privacy: "public" | "private";
}
interface SettingsPopupProps {
  open: boolean;
  onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ open, onClose }) => {
  const [settings, setSettings] = useState<SettingsState>({
    theme: "light",
    notifications: true,
    soundEnabled: true,
    language: "en",
    privacy: "public",
  });

  const handleToggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectChange = (key: keyof SettingsState, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    onClose();
  };

  const handleReset = () => {
    setSettings({
      theme: "light",
      notifications: true,
      soundEnabled: true,
      language: "en",
      privacy: "public",
    });
  };

  return (
    <>
      {/* Backdrop */}
      {open && <div className="settings-backdrop" onClick={handleClose} />}

      {/* Settings Modal */}
      <div className={`settings-popup ${open ? "active" : ""}`}>
        {/* Header */}
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button
            className="close-btn"
            onClick={handleClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Theme Setting */}
          <div className="settings-group">
            <div className="settings-group-header">
              <h3>🎨 Appearance</h3>
            </div>
            <div className="setting-item">
              <div className="setting-label-wrapper">
                <label htmlFor="theme">Theme</label>
                <span className="setting-value">{settings.theme}</span>
              </div>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) =>
                  handleSelectChange(
                    "theme",
                    e.target.value as "light" | "dark",
                  )
                }
                className="setting-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {/* Notifications Setting */}
          <div className="settings-group">
            <div className="settings-group-header">
              <h3>🔔 Notifications</h3>
            </div>
            <div className="setting-item">
              <label htmlFor="notifications">Enable Notifications</label>
              <div className="toggle-switch">
                <input
                  id="notifications"
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle("notifications")}
                  className="toggle-input"
                />
                <label htmlFor="notifications" className="toggle-label"></label>
              </div>
            </div>

            <div className="setting-item">
              <label htmlFor="sound">Enable Sound</label>
              <div className="toggle-switch">
                <input
                  id="sound"
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={() => handleToggle("soundEnabled")}
                  className="toggle-input"
                />
                <label htmlFor="sound" className="toggle-label"></label>
              </div>
            </div>
          </div>

          {/* Language Setting */}
          <div className="settings-group">
            <div className="settings-group-header">
              <h3>🌍 Language</h3>
            </div>
            <div className="setting-item">
              <div className="setting-label-wrapper">
                <label htmlFor="language">Preferred Language</label>
                <span className="setting-value">
                  {settings.language.toUpperCase()}
                </span>
              </div>
              <select
                id="language"
                value={settings.language}
                onChange={(e) =>
                  handleSelectChange(
                    "language",
                    e.target.value as "en" | "es" | "fr",
                  )
                }
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="settings-group">
            <div className="settings-group-header">
              <h3>🔒 Privacy</h3>
            </div>
            <div className="setting-item">
              <div className="setting-label-wrapper">
                <label htmlFor="privacy">Profile Visibility</label>
                <span className="setting-value">{settings.privacy}</span>
              </div>
              <select
                id="privacy"
                value={settings.privacy}
                onChange={(e) =>
                  handleSelectChange(
                    "privacy",
                    e.target.value as "public" | "private",
                  )
                }
                className="setting-select"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset to Default
          </button>
          <div className="footer-actions">
            <button className="btn btn-outline" onClick={handleClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPopup;
