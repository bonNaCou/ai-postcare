"use client";

// ===============================================================
// 💜 AI POSTCARE — Multilingual i18n Configuration
// ===============================================================
// ✅ Supports English, Spanish, French, Galician, Nigerian Pidgin, Igbo, Hausa, Yoruba, Chinese, Arabic, Portuguese, German
// ✅ Used in Login, Register, Dashboard, and Home pages
// ✅ Automatically detects browser language + stores preference
// ===============================================================

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// ---------------------------------------------------------------
// 🌍 Translation Resources
// ---------------------------------------------------------------
const resources = {
  // 🇬🇧 English
  en: {
    translation: {
      welcome: "Welcome to AI PostCare",
      login: "Login",
      logging_in: "Logging in...",
      register: "Register",
      registering: "Registering...",
      email: "Email",
      password: "Password",
      confirm_password: "Confirm Password",
      or: "or",
      sign_in_google: "Sign in with Google",
      sign_in_facebook: "Sign in with Facebook",
      no_account: "Don’t have an account?",
      already_account: "Already have an account?",
      footer_message: "Recover accompanied, every day, in your language.",
      change_background: "Change Background Theme",
      doctor_dashboard: "Doctor Dashboard",
      patient_dashboard: "Patient Dashboard",
      home: "Home",
      logout: "Log out",
      loading: "Loading...",
      results: "Results",
      weight: "Weight",
      height: "Height",
      hydration: "Hydration",
    },
  },

  // 🇪🇸 Spanish
  es: {
    translation: {
      welcome: "Bienvenido a AI PostCare",
      login: "Iniciar sesión",
      logging_in: "Iniciando sesión...",
      register: "Registrarse",
      registering: "Registrando...",
      email: "Correo electrónico",
      password: "Contraseña",
      confirm_password: "Confirmar contraseña",
      or: "o",
      sign_in_google: "Iniciar sesión con Google",
      sign_in_facebook: "Iniciar sesión con Facebook",
      no_account: "¿No tienes una cuenta?",
      already_account: "¿Ya tienes una cuenta?",
      footer_message: "Recupérate acompañado, cada día, en tu idioma.",
      change_background: "Cambiar tema de fondo",
      doctor_dashboard: "Panel del Doctor",
      patient_dashboard: "Panel del Paciente",
      home: "Inicio",
      logout: "Cerrar sesión",
      loading: "Cargando...",
      results: "Resultados",
      weight: "Peso",
      height: "Altura",
      hydration: "Hidratación",
    },
  },

  // 🇫🇷 French
  fr: {
    translation: {
      welcome: "Bienvenue sur AI PostCare",
      login: "Se connecter",
      logging_in: "Connexion...",
      register: "S’inscrire",
      registering: "Inscription...",
      email: "E-mail",
      password: "Mot de passe",
      confirm_password: "Confirmer le mot de passe",
      or: "ou",
      sign_in_google: "Se connecter avec Google",
      sign_in_facebook: "Se connecter avec Facebook",
      no_account: "Pas de compte ?",
      already_account: "Vous avez déjà un compte ?",
      footer_message: "Rétablissez-vous accompagné, chaque jour, dans votre langue.",
      change_background: "Changer le fond d’écran",
      doctor_dashboard: "Tableau du Docteur",
      patient_dashboard: "Tableau du Patient",
      home: "Accueil",
      logout: "Se déconnecter",
      loading: "Chargement...",
      results: "Résultats",
      weight: "Poids",
      height: "Taille",
      hydration: "Hydratation",
    },
  },

  // 🏴‍☠️ Galician (Galego)
  gl: {
    translation: {
      welcome: "Benvido a AI PostCare",
      login: "Iniciar sesión",
      logging_in: "Iniciando sesión...",
      register: "Rexistrarse",
      registering: "Rexistrando...",
      email: "Correo electrónico",
      password: "Contrasinal",
      confirm_password: "Confirmar contrasinal",
      or: "ou",
      sign_in_google: "Iniciar sesión con Google",
      sign_in_facebook: "Iniciar sesión con Facebook",
      no_account: "Non tes unha conta?",
      already_account: "Xa tes unha conta?",
      footer_message: "Recupérate acompañado, cada día, no teu idioma.",
      change_background: "Cambiar tema de fondo",
      doctor_dashboard: "Panel do Doutor",
      patient_dashboard: "Panel do Paciente",
      home: "Inicio",
      logout: "Pechar sesión",
      loading: "Cargando...",
      results: "Resultados",
      weight: "Peso",
      height: "Altura",
      hydration: "Hidratación",
    },
  },

  // 🇳🇬 Nigerian Pidgin (Pidgin English)
  pcm: {
    translation: {
      welcome: "You don show for AI PostCare 😍",
      login: "Login",
      logging_in: "Dey log you in...",
      register: "Register",
      registering: "Dey register you...",
      email: "Email address",
      password: "Password",
      confirm_password: "Confirm am again",
      or: "or",
      sign_in_google: "Sign in with Google",
      sign_in_facebook: "Sign in with Facebook",
      no_account: "You never get account?",
      already_account: "You don get account?",
      footer_message: "We go walk with you, day by day, for your own tongue 💜",
      change_background: "Change background make e fine",
      doctor_dashboard: "Doctor Workbench",
      patient_dashboard: "Patient Side",
      home: "Home",
      logout: "Log out",
      loading: "Dey load...",
      results: "Results",
      weight: "Weight",
      height: "Height",
      hydration: "Water level",
    },
  },

  // 🇳🇬 Igbo
  ig: {
    translation: {
      welcome: "Nnọọ na AI PostCare",
      login: "Banye",
      register: "Debanye aha",
      password: "Okwu nzuzo",
      confirm_password: "Jiri n'aka ọzọ",
      no_account: "Ị nweghị akaụntụ?",
      already_account: "Ị nwere akaụntụ?",
      home: "Ụlọ",
      doctor_dashboard: "Ihu ngosi dọkịta",
      patient_dashboard: "Ihu ngosi onye ọrịa",
    },
  },

  // 🇳🇬 Hausa
  ha: {
    translation: {
      welcome: "Barka da zuwa AI PostCare",
      login: "Shiga",
      register: "Yi rajista",
      password: "Kalmar sirri",
      confirm_password: "Tabbatar da kalmar sirri",
      no_account: "Ba ka da asusu?",
      already_account: "Kana da asusu?",
      home: "Gida",
      doctor_dashboard: "Dashboard na Likita",
      patient_dashboard: "Dashboard na Mara lafiya",
    },
  },

  // 🇳🇬 Yoruba
  yo: {
    translation: {
      welcome: "Kaabo si AI PostCare",
      login: "Wọlé",
      register: "Forukọsilẹ",
      password: "Ọrọ aṣínà",
      confirm_password: "Jẹ́risi ọrọ aṣínà",
      no_account: "O kò ní àkọọlẹ̀?",
      already_account: "O ní àkọọlẹ̀ tẹlẹ̀?",
      home: "Ile",
      doctor_dashboard: "Dashboard Dokita",
      patient_dashboard: "Dashboard Alaisan",
    },
  },

  // 🇨🇳 Chinese
  zh: {
    translation: {
      welcome: "欢迎来到 AI PostCare",
      login: "登录",
      register: "注册",
      password: "密码",
      confirm_password: "确认密码",
      home: "首页",
      doctor_dashboard: "医生面板",
      patient_dashboard: "病人面板",
    },
  },

  // 🇸🇦 Arabic
  ar: {
    translation: {
      welcome: "مرحبًا بك في AI PostCare",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      password: "كلمة المرور",
      confirm_password: "تأكيد كلمة المرور",
      home: "الرئيسية",
      doctor_dashboard: "لوحة الطبيب",
      patient_dashboard: "لوحة المريض",
    },
  },

  // 🇵🇹 Portuguese
  pt: {
    translation: {
      welcome: "Bem-vindo ao AI PostCare",
      login: "Entrar",
      register: "Registrar-se",
      password: "Senha",
      confirm_password: "Confirmar senha",
      home: "Início",
      doctor_dashboard: "Painel do Médico",
      patient_dashboard: "Painel do Paciente",
    },
  },

  // 🇩🇪 German
  de: {
    translation: {
      welcome: "Willkommen bei AI PostCare",
      login: "Anmelden",
      register: "Registrieren",
      password: "Passwort",
      confirm_password: "Passwort bestätigen",
      home: "Startseite",
      doctor_dashboard: "Arzt-Dashboard",
      patient_dashboard: "Patienten-Dashboard",
    },
  },
};

// ---------------------------------------------------------------
// 🚀 Initialize i18next
// ---------------------------------------------------------------
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en", // default language
    supportedLngs: [
      "en",
      "es",
      "fr",
      "gl",
      "pcm",
      "ig",
      "ha",
      "yo",
      "zh",
      "ar",
      "pt",
      "de",
    ],
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator"],
      caches: ["localStorage", "cookie"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;