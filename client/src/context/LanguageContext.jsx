import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    appName: 'CivicPulse AI',
    tagline: 'Smart Civic Complaint & Resolution Platform',
    heroTitle: 'Your City. Your Voice. Your Impact.',
    heroSubtitle: 'Report civic problems, track every action, and help build a better city.',
    reportIssue: 'Report an Issue',
    exploreIssues: 'Explore Civic Issues',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    myComplaints: 'My Complaints',
    civicMap: 'Civic Map',
    activeReports: 'Active Reports',
    totalReports: 'Total Reports',
    resolved: 'Resolved',
    awaitingVerification: 'Awaiting Verification',
    title: 'Complaint Title',
    description: 'Description',
    category: 'Category',
    severity: 'Severity',
    location: 'Location',
    evidence: 'Upload Evidence',
    submit: 'Submit Complaint',
    voiceInput: 'Click to Speak (Voice Input)',
    listening: 'Listening... Speak now',
    voicePrompt: 'Speak in Tamil or English to auto-fill your complaint',
    downloadReport: 'Official Action Report (PDF)',
    verifiedResolved: 'Issue Resolved Satisfactorily',
    issueStillExists: 'Issue Still Exists',
    ratingTitle: 'How satisfied are you with the resolution?',
    officerDashboard: 'Officer Dashboard',
    assignedTasks: 'My Assigned Tasks',
    borderIssues: 'Issues in My Border / Jurisdiction',
    claimAccept: 'Claim & Accept',
    startWork: 'Start Work',
    markResolved: 'Mark Resolved',
    uploadBefore: 'Upload Before Photo',
    uploadAfter: 'Upload After Photo',
    commandCenter: 'Municipal Command Center',
    liveMap: 'Live City Map',
    analytics: 'Analytics',
    departments: 'Departments',
    hotspots: 'Civic Hotspots'
  },
  ta: {
    appName: 'சிவிக்பல்ஸ் AI',
    tagline: 'ஸ்மார்ட் நகராட்சி புகார் & தீர்வு தளம்',
    heroTitle: 'உங்கள் நகரம். உங்கள் குரல். உங்கள் தாக்கம்.',
    heroSubtitle: 'நகரப் பிரச்சினைகளைப் புகாரளிக்கவும், நடவடிக்கை ஒவ்வொன்றையும் கண்காணிக்கவும்.',
    reportIssue: 'புகார் பதிவு செய்க',
    exploreIssues: 'நகர பிரச்சனைகள்',
    login: 'உள்நுழைக',
    register: 'பதிவு செய்க',
    dashboard: 'முகப்பு பலகை',
    myComplaints: 'எனது புகார்கள்',
    civicMap: 'நகர வரைபடம்',
    activeReports: 'செயலில் உள்ள புகார்கள்',
    totalReports: 'மொத்த புகார்கள்',
    resolved: 'தீர்க்கப்பட்டவை',
    awaitingVerification: 'சரிபார்ப்புக்கு காத்திருக்கிறது',
    title: 'புகார் தலைப்பு',
    description: 'விளக்கம்',
    category: 'துறை / வகை',
    severity: 'தீவிரம்',
    location: 'இடம்',
    evidence: 'புகைப்பட சான்று',
    submit: 'புகாரைச் சமர்ப்பிக்கவும்',
    voiceInput: 'பேசிப் பதிவு செய்க (குரல் உள்ளீடு)',
    listening: 'கேட்கிறது... இப்போது பேசுங்கள்',
    voicePrompt: 'புகாரை தமிழில் அல்லது ஆங்கிலத்தில் பேசுங்கள்',
    downloadReport: 'அரசு அறிக்கை (PDF)',
    verifiedResolved: 'பிரச்சனை தீர்க்கப்பட்டது',
    issueStillExists: 'பிரச்சனை இன்னும் உள்ளது',
    ratingTitle: 'இந்த தீர்வில் நீங்கள் எவ்வளவு திருப்தி அடைகிறீர்கள்?',
    officerDashboard: 'அதிகாரி கட்டுப்பாட்டு பலகை',
    assignedTasks: 'எனக்கு ஒதுக்கப்பட்ட பணிகள்',
    borderIssues: 'எனது எல்லைப் பகுதி புகார்கள்',
    claimAccept: 'ஏற்றுக்கொள்கிறேன்',
    startWork: 'பணியைத் தொடங்கு',
    markResolved: 'தீர்க்கப்பட்டது என குறிக்க',
    uploadBefore: 'ஆரம்ப புகைப்படம்',
    uploadAfter: 'தீர்வு புகைப்படம்',
    commandCenter: 'நகராட்சி கட்டளை மையம்',
    liveMap: 'நேரடி வரைபடம்',
    analytics: 'புள்ளிவிவரங்கள்',
    departments: 'துறைகள்',
    hotspots: 'அதிக பாதிப்பு பகுதிகள்'
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('civicpulse_lang') || 'en';
  });

  const toggleLanguage = (newLang) => {
    const target = newLang || (lang === 'en' ? 'ta' : 'en');
    setLang(target);
    localStorage.setItem('civicpulse_lang', target);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
