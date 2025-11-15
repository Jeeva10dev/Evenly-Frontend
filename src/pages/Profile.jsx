import React, { useState } from "react";
import { useAuthContext } from "../hooks/AuthContext.jsx";
import { changePassword, uploadProfilePic, getUser, sendInsightsEmailNow, sendRemindersEmailNow, updateAiConsent } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import BackButton from "../components/BackButton.jsx";

function getProfilePicUrl(imageUrl) {
  if (!imageUrl) return "/logos/logo-s.png";
  if (imageUrl.startsWith("http")) return imageUrl;
  return import.meta.env.VITE_BACKEND_URL + imageUrl;
}


export default function Profile() {
  const { user, logout, login } = useAuthContext();
  const [profilePic, setProfilePic] = useState(user?.imageUrl || null);
  const [picLoading, setPicLoading] = useState(false);
  const [picSuccess, setPicSuccess] = useState("");
  const [picError, setPicError] = useState("");

  // New features state
  // Insights/reminders state
  const [insightsEnabled, setInsightsEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [aiConsent, setAiConsent] = useState(user?.aiConsent ?? false);
  // Load aiConsent from user on mount
  React.useEffect(() => {
    if (user?.aiConsent !== undefined) setAiConsent(user.aiConsent);
  }, [user]);

  // Persist aiConsent toggle
  const handleAiConsentChange = async (val) => {
    setAiConsent(val);
    try {
      await updateAiConsent(val);
    } catch (err) {
      // Optionally show error
    }
  };
  const [insightsTime, setInsightsTime] = useState("10:00");
  const [insightsDay, setInsightsDay] = useState(1);
  const [remindersTime, setRemindersTime] = useState("10:00");
  const [remindersDay, setRemindersDay] = useState(1);
  const [sendInsightsLoading, setSendInsightsLoading] = useState(false);
  const [sendInsightsSuccess, setSendInsightsSuccess] = useState("");
  const [sendInsightsError, setSendInsightsError] = useState("");
  const [sendRemindersLoading, setSendRemindersLoading] = useState(false);
  const [sendRemindersSuccess, setSendRemindersSuccess] = useState("");
  const [sendRemindersError, setSendRemindersError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const navigate = useNavigate();

  // Password strength check
  const checkPasswordStrength = (pwd) => {
    if (!pwd) return "";
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pwd)) return "Must include an uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Must include a lowercase letter.";
    if (!/\d/.test(pwd)) return "Must include a number.";
    if (!/[^A-Za-z\d]/.test(pwd)) return "Must include a special character.";
    return "Strong password";
  };

  // Send insights now
  const handleSendInsightsNow = async () => {
    setSendInsightsLoading(true);
    setSendInsightsSuccess("");
    setSendInsightsError("");
    try {
      await sendInsightsEmailNow();
      setSendInsightsSuccess("Insights email sent!");
    } catch (err) {
      setSendInsightsError("Failed to send insights email");
    } finally {
      setSendInsightsLoading(false);
    }
  };

  // Send reminders now
  const handleSendRemindersNow = async () => {
    setSendRemindersLoading(true);
    setSendRemindersSuccess("");
    setSendRemindersError("");
    try {
      await sendRemindersEmailNow();
      setSendRemindersSuccess("Reminders email sent!");
    } catch (err) {
      setSendRemindersError("Failed to send reminders email");
    } finally {
      setSendRemindersLoading(false);
    }
  };

  // Handle profile pic upload
  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicLoading(true);
    setPicSuccess("");
    setPicError("");
    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      const { data } = await uploadProfilePic(formData);
      setProfilePic(data.imageUrl);
      setPicSuccess("Profile picture updated!");
      // Refresh user context
      const userRes = await getUser();
      login(localStorage.getItem("token"), userRes.data);
    } catch (err) {
      setPicError(err?.response?.data?.msg || "Failed to upload profile picture");
    } finally {
      setPicLoading(false);
    }
  };

  // Change password handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess("");
    setPasswordError("");
    try {
      await changePassword({ oldPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setPasswordStrength("");
    } catch (err) {
      setPasswordError(err?.response?.data?.msg || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 relative">
      <BackButton className="left-6 top-6" />
  <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold mb-2 text-center text-green-700">Utilities</h1>

        {/* Row 1: AI Consent for Insights */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-lg p-4 border">
          <span className="font-medium text-gray-700 mb-2 md:mb-0">Would you like us to share your data with our AI model for spending insights?</span>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={aiConsent} onChange={e => handleAiConsentChange(e.target.checked)} className="sr-only" />
            <span className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 ${aiConsent ? 'bg-green-400' : ''}`}> 
              <span className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${aiConsent ? 'translate-x-4' : ''}`}></span>
            </span>
          </label>
        </div>

        {/* Row 2: Payment Reminders Toggle, Time, Date, Send Now */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-lg p-4 border gap-4">
          <span className="font-medium text-gray-700 mb-2 md:mb-0">Would you like to receive payment reminders on your associated email ID?</span>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={remindersEnabled} onChange={e => setRemindersEnabled(e.target.checked)} className="sr-only" />
              <span className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 ${remindersEnabled ? 'bg-green-400' : ''}`}> 
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${remindersEnabled ? 'translate-x-4' : ''}`}></span>
              </span>
            </label>
            {remindersEnabled && (
              <>
                <select value={remindersTime} onChange={e => setRemindersTime(e.target.value)} className="border rounded px-2 py-1">
                  {["07:00","09:00","12:00","15:00","18:00","21:00"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={remindersDay} onChange={e => setRemindersDay(Number(e.target.value))} className="border rounded px-2 py-1">
                  {Array.from({length:31},(_,i)=>i+1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <Button type="button" onClick={handleSendRemindersNow} disabled={sendRemindersLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1">
                  {sendRemindersLoading ? "Sending..." : "Send Mail Now"}
                </Button>
                {sendRemindersSuccess && <span className="text-green-600 text-xs">{sendRemindersSuccess}</span>}
                {sendRemindersError && <span className="text-red-600 text-xs">{sendRemindersError}</span>}
              </>
            )}
          </div>
        </div>

        {/* Row 3: Insights Email Toggle, Time, Date, Send Now */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-lg p-4 border gap-4">
          <span className="font-medium text-gray-700 mb-2 md:mb-0">Would you like to receive spending insights from our AI model on your associated email ID?</span>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={insightsEnabled} onChange={e => setInsightsEnabled(e.target.checked)} className="sr-only" />
              <span className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 ${insightsEnabled ? 'bg-green-400' : ''}`}> 
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${insightsEnabled ? 'translate-x-4' : ''}`}></span>
              </span>
            </label>
            {insightsEnabled && (
              <>
                <select value={insightsTime} onChange={e => setInsightsTime(e.target.value)} className="border rounded px-2 py-1">
                  {["07:00","09:00","12:00","15:00","18:00","21:00"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={insightsDay} onChange={e => setInsightsDay(Number(e.target.value))} className="border rounded px-2 py-1">
                  {Array.from({length:31},(_,i)=>i+1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <Button type="button" onClick={handleSendInsightsNow} disabled={sendInsightsLoading || !aiConsent} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1">
                  {sendInsightsLoading ? "Sending..." : "Send Mail Now"}
                </Button>
                {sendInsightsSuccess && <span className="text-green-600 text-xs">{sendInsightsSuccess}</span>}
                {sendInsightsError && <span className="text-red-600 text-xs">{sendInsightsError}</span>}
              </>
            )}
          </div>
        </div>

        {/* Row 4: Profile Pic */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-lg p-4 border gap-4">
          <span className="font-medium text-gray-700 mb-2 md:mb-0">Want to change Profile pic? Profile pic is visible to your contacts and group members.</span>
          <div className="flex flex-col items-center gap-2">
            <img
              src={getProfilePicUrl(profilePic)}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border shadow"
              style={{ background: "#f3f4f6" }}
            />
            <label className="block w-full">
              <span className="sr-only">Choose profile photo</span>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                onChange={handlePicChange}
                disabled={picLoading}
              />
            </label>
            {picLoading && <div className="text-gray-500 text-sm">Uploading...</div>}
            {picSuccess && <div className="text-green-600 text-sm">{picSuccess}</div>}
            {picError && <div className="text-red-600 text-sm">{picError}</div>}
          </div>
        </div>

        {/* Row 5: Password Change */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-lg p-4 border gap-4">
          <span className="font-medium text-gray-700 mb-2 md:mb-0">Want to change your password?</span>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-2 w-full md:w-2/3">
            <input
              id="oldPassword"
              type="password"
              placeholder="Current Password"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <input
              id="newPassword"
              type="password"
              placeholder="New Password"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordStrength(checkPasswordStrength(e.target.value));
              }}
              required
            />
            {newPassword && (
              <div className={`text-sm mt-1 ${passwordStrength === "Strong password" ? "text-green-600" : "text-red-600"}`}>{passwordStrength}</div>
            )}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-2" disabled={passwordLoading || passwordStrength !== "Strong password"}>
              {passwordLoading ? "Saving..." : "Change Password"}
            </Button>
            {passwordSuccess && <div className="text-green-600 text-sm mt-1">{passwordSuccess}</div>}
            {passwordError && <div className="text-red-600 text-sm mt-1">{passwordError}</div>}
          </form>
        </div>

        {/* Logout Button */}
        <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white mt-2">
          Logout
        </Button>
      </div>
    </div>
  );
}
