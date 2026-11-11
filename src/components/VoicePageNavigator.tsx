import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Check,
  ChevronRight,
  Copy,
  Loader2,
  Mic,
  Send,
  Settings,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  type AssistantChatHistoryItem,
  type AssistantContext,
  type AssistantLanguage,
  type AssistantSentimentAnalysis,
  fetchAssistantContext,
  sendAssistantMessage,
} from "../API/voiceNavigatorApi";

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

const SENTIMENT_BADGE_STYLES: Record<string, string> = {
  frustrated: "border-rose-300/25 bg-rose-400/10 text-rose-100",
  urgent: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  confused: "border-accent/25 bg-accent/10 text-accent",
  positive: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  neutral: "border-border bg-surface-strong/[0.05] text-heading",
};

type AssistantBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

type LanguageOption = {
  value: AssistantLanguage;
  label: string;
  shortLabel: string;
  helper: string;
};

type PromptRule = {
  keywords: string[];
  toPrompt: (language: AssistantLanguage, routeLabel?: string) => string;
  routeLabel?: string;
  requiresNavigationVerb?: boolean;
};

type VoiceCommandAction =
  | { type: "navigate"; route: string; label: string; attempts?: number }
  | { type: "click"; target: string; attempts?: number }
  | { type: "fill"; field: string; value: string; attempts?: number }
  | {
      type: "select";
      field: string;
      value: string;
      attempts?: number;
      triggerClicked?: boolean;
    };

// Fields that render as custom dropdown/card widgets rather than native
// <input>/<select> elements — the AI sometimes classifies these as "fill"
// actions since their values look like plain text, but only the "select"
// executor knows how to open and pick from these custom controls.
const DROPDOWN_ONLY_FIELDS = new Set(["leverage", "account type"]);

type ActionExecutionResult = {
  success: boolean;
  message: string;
  waitForNextPage: boolean;
  waitAfterMs?: number;
  retryAction?: VoiceCommandAction | null;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    value: "en-IN",
    label: "English - India",
    shortLabel: "EN Girl",
    helper: "Prefers an Indian English female voice when available.",
  },
  {
    value: "hi-IN",
    label: "Hindi / Hinglish - India",
    shortLabel: "HI Girl",
    helper: "Prefers a Hindi female voice when available.",
  },
  {
    value: "tr-TR",
    label: "Turkish",
    shortLabel: "TR Girl",
    helper: "Prefers a Turkish female voice when available.",
  },
  {
    value: "ar-SA",
    label: "Arabic",
    shortLabel: "AR Girl",
    helper: "Prefers an Arabic female voice when available.",
  },
  {
    value: "ru-RU",
    label: "Russian",
    shortLabel: "RU Girl",
    helper: "Prefers a Russian female voice when available.",
  },
];

const FEMALE_VOICE_HINTS = [
  "female",
  "woman",
  "girl",
  "zira",
  "aria",
  "samantha",
  "heera",
  "priya",
  "swara",
  "kalpana",
  "linda",
  "anna",
  "katya",
  "victoria",
  "elena",
  "alina",
  "olga",
  "meryem",
  "dilara",
  "amira",
  "alya",
  "seda",
  "sophie",
  "eva",
];

const LOCALE_VOICE_HINTS: Partial<Record<AssistantLanguage, string[]>> = {
  "tr-TR": [
    "tr",
    "turkish",
    "türkçe",
    "seda",
    "dilara",
    "melis",
    "meryem",
    "female",
    "woman",
    "girl",
  ],
  "ar-SA": [
    "ar",
    "ar-sa",
    "arabic",
    "arab",
    "العربية",
    "amira",
    "alya",
    "zariyah",
    "hala",
    "leila",
    "layla",
    "mariam",
    "maryam",
    "fatima",
    "noura",
    "noora",
    "salma",
    "yasmin",
    "yasmine",
    "female",
    "woman",
    "girl",
  ],
};

const DEFAULT_SUGGESTIONS: Record<AssistantLanguage, string[]> = {
  "en-IN": [
    "Give me my dashboard summary",
    "What is my total balance?",
    "What is the latest forex outlook?",
    "Show my latest transactions",
    "Do I have unread notifications?",
    "Open withdrawal page",
  ],
  "hi-IN": [
    "Mera dashboard summary batao",
    "Mera total balance kya hai?",
    "Latest forex outlook batao",
    "Meri latest transactions dikhao",
    "Kya mere unread notifications hain?",
    "Withdrawal page kholo",
  ],
  "tr-TR": [
    "Panel özetimi göster",
    "Toplam bakiyem nedir?",
    "Son forex görünümünü göster",
    "Son işlemlerimi göster",
    "Okunmamış bildirimlerim var mı?",
    "Çekim sayfasını aç",
  ],
  "ar-SA": [
    "اعرض ملخص لوحة التحكم",
    "ما هو إجمالي رصيدي؟",
    "اعرض أحدث توقعات الفوركس",
    "اعرض آخر معاملاتي",
    "هل لدي إشعارات غير مقروءة؟",
    "افتح صفحة السحب",
  ],
  "ru-RU": [
    "Покажи сводку панели",
    "Какой у меня общий баланс?",
    "Покажи последний прогноз по форексу",
    "Покажи последние транзакции",
    "Есть ли у меня непрочитанные уведомления?",
    "Открой страницу вывода",
  ],
};

const AUTO_WELCOME_SESSION_KEY = "crmAssistantAutoWelcomed";
const MAX_CHAT_MESSAGES = 24;
const MAX_ACTION_RETRIES = 2;

const NAVIGATION_HINTS = [
  "open",
  "go to",
  "navigate",
  "take me",
  "show page",
  "page",
  "screen",
  "tab",
  "create",
  "banao",
  "banado",
  "oluştur",
  "أنشئ",
  "создай",
  "kholo",
  "le chalo",
  "dikhao",
  "aç",
  "git",
  "sayfa",
  "افتح",
  "اذهب",
  "صفحة",
  "открой",
  "перейди",
  "страница",
];

const ACTION_VERBS = [
  "open",
  "go to",
  "navigate",
  "take me",
  "show",
  "select",
  "choose",
  "pick",
  "fill",
  "set",
  "enter",
  "type",
  "put",
  "add",
  "click",
  "press",
  "submit",
  "create",
];

const MULTILINGUAL_ACTION_PATTERNS = {
  fill: [
    "fill",
    "set",
    "enter",
    "type",
    "put",
    "add",
    "bhar",
    "bharo",
    "bhar do",
    "daalo",
    "likho",
    "girin",
    "doldur",
    "yaz",
    "ekle",
    "املأ",
    "عبي",
    "ادخل",
    "اكتب",
    "заполни",
    "введи",
    "напиши",
    "укажи",
  ],
  select: [
    "select",
    "choose",
    "pick",
    "chuno",
    "select karo",
    "choose karo",
    "seç",
    "seçin",
    "sec",
    "اختَر",
    "اختر",
    "حدد",
    "выбери",
    "выберите",
  ],
  click: [
    "click",
    "press",
    "open",
    "show",
    "click karo",
    "dabao",
    "khol do",
    "aç",
    "bas",
    "göster",
    "افتح",
    "اضغط",
    "покажи",
    "нажми",
    "открой",
  ],
  submit: [
    "create",
    "submit",
    "banao",
    "create karo",
    "submit karo",
    "oluştur",
    "gönder",
    "أنشئ",
    "ارسل",
    "создай",
    "отправь",
  ],
  split: [
    "and then",
    "then",
    "after that",
    "phir",
    "fir",
    "uske baad",
    "sonra",
    "ardından",
    "ثم",
    "بعد ذلك",
    "затем",
    "потом",
  ],
  prepositions: [
    "with",
    "to",
    "as",
    "me",
    "mein",
    "ko",
    "ile",
    "olarak",
    "ب",
    "في",
    "إلى",
    "как",
    "в",
  ],
};

const VOICE_ROUTE_MATCHERS: Array<{
  route: string;
  label: string;
  keywords: string[];
  allowImplicitIntent?: boolean;
}> = [
  {
    route: "/client/open-account",
    label: "open account page",
    allowImplicitIntent: true,
    keywords: [
      "open account",
      "open account page",
      "open new account page",
      "new account",
      "create account",
      "create trading account",
      "create account page",
      "naya account",
      "naya trading account",
      "yeni hesap",
      "yeni trading hesabi",
      "hesap ac",
      "حساب جديد",
      "فتح حساب",
      "новый счет",
      "открыть счет",
    ],
  },
  {
    route: "/client/account-list",
    label: "account list page",
    keywords: [
      "account list",
      "my accounts",
      "trading accounts",
      "mere account",
      "trading account list",
      "hesaplarim",
      "islem hesaplari",
      "حساباتي",
      "حسابات التداول",
      "мои счета",
      "торговые счета",
    ],
  },
  {
    route: "/client/dashboard",
    label: "dashboard page",
    keywords: [
      "dashboard",
      "home page",
      "overview page",
      "home",
      "ghar ka page",
      "ana sayfa",
      "genel bakis",
      "الصفحة الرئيسية",
      "لوحة التحكم",
      "главная страница",
      "панель",
    ],
  },
  {
    route: "/client/deposit",
    label: "deposit page",
    keywords: [
      "deposit page",
      "deposit screen",
      "add funds page",
      "deposit",
      "paise jama",
      "fund add",
      "yatirim sayfasi",
      "para yatir",
      "الايداع",
      "صفحة الإيداع",
      "депозит",
      "пополнение",
    ],
  },
  {
    route: "/client/withdrawal",
    label: "withdrawal page",
    keywords: [
      "withdrawal page",
      "withdraw page",
      "cashout page",
      "withdrawal",
      "paise nikalo",
      "paisa nikalna",
      "cekim sayfasi",
      "para cek",
      "السحب",
      "صفحة السحب",
      "вывод",
      "вывод средств",
    ],
  },
  {
    route: "/client/transfer",
    label: "transfer page",
    keywords: [
      "transfer page",
      "transfer screen",
      "internal transfer",
      "transfer",
      "fund transfer",
      "paise transfer",
      "transfer sayfasi",
      "hesap transferi",
      "التحويل",
      "تحويل داخلي",
      "перевод",
      "внутренний перевод",
    ],
  },
  {
    route: "/client/transfer-history",
    label: "transaction history page",
    keywords: [
      "transaction history",
      "transfer history",
      "history page",
      "len den history",
      "transaction list",
      "islem gecmisi",
      "gecmis",
      "سجل المعاملات",
      "سجل التحويل",
      "история транзакций",
      "история переводов",
    ],
  },
  {
    route: "/client/profile",
    label: "profile page",
    keywords: [
      "profile page",
      "settings page",
      "kyc page",
      "profile",
      "setting",
      "meri profile",
      "profil",
      "ayarlar",
      "الملف الشخصي",
      "الاعدادات",
      "профиль",
      "настройки",
    ],
  },
  {
    route: "/client/support",
    label: "support page",
    keywords: [
      "support page",
      "ticket page",
      "help page",
      "support",
      "madad",
      "ticket",
      "destek",
      "yardim",
      "الدعم",
      "المساعدة",
      "поддержка",
      "помощь",
    ],
  },
  {
    route: "/client/trading-contest",
    label: "trading contest page",
    keywords: [
      "trading contest",
      "contest page",
      "competition page",
      "trading muqabala",
      "yarisma",
      "trading yarismasi",
      "مسابقة التداول",
      "конкурс трейдинга",
    ],
  },
  {
    route: "/client/platforms",
    label: "platforms page",
    keywords: [
      "platforms page",
      "trading platforms",
      "platform page",
      "platform",
      "trading platform",
      "platforms",
      "platformlar",
      "منصات التداول",
      "платформы",
    ],
  },
  {
    route: "/client/refer",
    label: "refer page",
    keywords: [
      "refer page",
      "refer a friend",
      "referral page",
      "invite friend",
      "refer",
      "dost ko invite",
      "arkadas davet",
      "دعوة صديق",
      "реферальная страница",
    ],
  },
  {
    route: "/client/partner/dashboard",
    label: "partner dashboard page",
    keywords: [
      "partner dashboard",
      "ib dashboard",
      "partner page",
      "ib panel",
      "partner panel",
      "ortak paneli",
      "لوحة الشريك",
      "партнерская панель",
    ],
  },
  {
    route: "/client/partner/create",
    label: "create partner account page",
    allowImplicitIntent: true,
    keywords: [
      "create partner account",
      "partner account page",
      "ib create account",
      "partner account",
      "partner banao",
      "ortak hesabi olustur",
      "إنشاء حساب شريك",
      "создать партнерский счет",
    ],
  },
  {
    route: "/client/partner/commission",
    label: "partner commission page",
    keywords: [
      "partner commission",
      "ib commission",
      "commission page",
      "commission",
      "kamishan",
      "komisyon",
      "العمولة",
      "комиссия",
    ],
  },
  {
    route: "/client/partner/withdrawal",
    label: "partner withdrawal page",
    keywords: [
      "partner withdrawal",
      "ib withdrawal",
      "partner cashout",
      "partner withdraw",
      "partner payout",
      "ortak cekim",
      "سحب الشريك",
      "вывод партнера",
    ],
  },
  {
    route: "/client/copy/master",
    label: "copy trading master page",
    keywords: [
      "copy trading master",
      "master page",
      "copy master",
      "master trader",
      "copy trading usta",
      "master sayfasi",
      "صفحة الماستر",
      "страница мастера",
    ],
  },
  {
    route: "/client/copy/terms",
    label: "copy trading terms page",
    keywords: [
      "copy trading terms",
      "terms page",
      "copy terms",
      "sharten",
      "kosullar",
      "الشروط",
      "условия",
    ],
  },
  {
    route: "/client/copy/copier",
    label: "copy trading copier page",
    keywords: [
      "copy trading copier",
      "copier page",
      "copy trader",
      "copy page",
      "copier",
      "kopya trading",
      "ناسخ التداول",
      "копирование сделок",
    ],
  },
  {
    route: "/client/copy/rating",
    label: "copy trading rating page",
    keywords: [
      "copy trading rating",
      "rating page",
      "copy rating",
      "rating",
      "rating page",
      "derecelendirme",
      "التقييم",
      "рейтинг",
    ],
  },
];

const FIELD_ALIASES: Record<string, string[]> = {
  leverage: [
    "leverage",
    "selected leverage",
    "leveraj",
    "उत्तोलन",
    "رافعة",
    "кредитное плечо",
  ],
  "account type": [
    "account type",
    "select account type",
    "trading account type",
    "profile",
    "account profile",
    "account ka type",
    "hesap tipi",
    "نوع الحساب",
    "тип счета",
  ],
  "mt5 account number": [
    "mt5 account number",
    "mt5 account",
    "custom mt5 account",
    "mt5 khata",
    "hesap numarasi",
    "رقم الحساب",
    "номер счета",
  ],
  "master password": [
    "master password",
    "main password",
    "master pass",
    "ana sifre",
    "كلمة مرور رئيسية",
    "мастер пароль",
  ],
  "investor password": [
    "investor password",
    "investor pass",
    "yatirimci sifresi",
    "كلمة مرور المستثمر",
    "пароль инвестора",
  ],
  amount: [
    "amount",
    "transfer amount",
    "deposit amount",
    "withdraw amount",
    "withdrawal amount",
    "raqam",
    "paisa",
    "miktar",
    "tutar",
    "المبلغ",
    "сумма",
  ],
  account: [
    "account",
    "trading account",
    "select account",
    "account number",
    "khata",
    "trading khata",
    "hesap",
    "islem hesabi",
    "الحساب",
    "حساب التداول",
    "счет",
    "торговый счет",
  ],
  "from account": [
    "from account",
    "source account",
    "jis account se",
    "gonderen hesap",
    "من الحساب",
    "со счета",
  ],
  "to account": [
    "to account",
    "destination account",
    "jis account me",
    "alan hesap",
    "إلى الحساب",
    "на счет",
  ],
  "transaction id": ["transaction id", "trx id"],
  "wallet address": ["wallet address", "wallet"],
  "usdt wallet address": ["usdt wallet address", "usdt wallet", "tether wallet address"],
  "eth wallet address": ["eth wallet address", "eth wallet", "ethereum wallet address"],
  "trx wallet address": ["trx wallet address", "trx wallet", "tron wallet address"],
  "bank name": ["bank name"],
  "account holder name": ["account holder name", "account holder", "holder name"],
  "bank account number": ["bank account number"],
  "ifsc code": ["ifsc code", "ifsc"],
  "otp code": ["otp code", "otp", "verification code"],
  "deposit account": ["deposit account"],
  "payment proof": ["payment proof", "proof of payment"],
  cryptocurrency: ["cryptocurrency", "crypto currency", "select cryptocurrency"],
  language: ["language", "locale"],
  voice: ["voice", "preferred voice"],
  search: [
    "search",
    "search box",
    "search master",
    "scanner search",
    "master search",
    "copy search",
    "talash",
    "ara",
    "arama",
    "بحث",
    "поиск",
  ],
};

const BUTTON_TARGET_ALIASES: Record<string, string[]> = {
  "create account": [
    "create trading account",
    "create the account",
    "account banao",
    "hesap oluştur",
    "حساب إنشاء",
    "создать аккаунт",
  ],
  "create trading account": [
    "create account",
    "submit account",
    "trading account banao",
    "işlem hesabı oluştur",
    "إنشاء حساب تداول",
    "создать торговый счет",
  ],
  "reset account": [
    "reset configuration",
    "reset",
    "dobara set karo",
    "sıfırla",
    "إعادة تعيين",
    "сбросить",
  ],
  "custom settings": [
    "show custom settings",
    "hide custom settings",
    "custom setting dikhao",
    "özel ayarlar",
    "الإعدادات المخصصة",
    "настройки",
  ],
  refresh: [
    "reload",
    "sync",
    "refresh data",
    "taza karo",
    "yenile",
    "تحديث",
    "обновить",
  ],
  "request withdrawal": [
    "withdraw request",
    "partner withdrawal",
    "withdrawal request",
    "nikasi request",
    "çekim talebi",
    "طلب سحب",
    "запрос на вывод",
  ],
  "review partner network": [
    "partner network",
    "show partners",
    "open partners tab",
    "partner network dikhao",
    "ortak ağını göster",
    "عرض شبكة الشركاء",
    "показать сеть партнеров",
  ],
  "withdrawal history": [
    "withdraw history",
    "show withdrawals",
    "open withdrawals tab",
    "withdrawal history dikhao",
    "çekim geçmişi",
    "سجل السحب",
    "история выводов",
  ],
  "copy code": [
    "copy referral code",
    "copy referral",
    "code copy karo",
    "kodu kopyala",
    "انسخ الرمز",
    "копировать код",
  ],
  "create partner account": [
    "create partner",
    "create ib account",
    "partner banao",
    "ortak hesabı oluştur",
    "إنشاء حساب شريك",
    "создать партнерский счет",
  ],
  "start copying": [
    "copy this master",
    "start copy",
    "copy trading shuru karo",
    "kopyalamayı başlat",
    "ابدأ النسخ",
    "начать копирование",
  ],
  "back to masters": [
    "back to master",
    "show masters",
    "masters par wapas",
    "ustalara dön",
    "العودة إلى المدراء",
    "назад к мастерам",
  ],
  "reset filters": [
    "clear filters",
    "scanner reset",
    "filters hatao",
    "filtreleri sıfırla",
    "إعادة ضبط الفلاتر",
    "сбросить фильтры",
  ],
  "view copiers": [
    "show copiers",
    "copiers dikhao",
    "kopyalayanları göster",
    "عرض الناسخين",
    "показать копировщиков",
  ],
  "view trades": [
    "show trades",
    "trade mirror",
    "trades dikhao",
    "işlemleri göster",
    "عرض الصفقات",
    "показать сделки",
  ],
  unlink: [
    "unlink copier",
    "remove copier",
    "copier hatao",
    "bağlantıyı kaldır",
    "إلغاء الربط",
    "отвязать",
  ],
  "get started free": [
    "get started",
    "start free",
    "shuru karo",
    "başla",
    "ابدأ",
    "начать",
  ],
  "view demo": [
    "demo dikhao",
    "show demo",
    "demoyu göster",
    "عرض التجربة",
    "показать демо",
  ],
  "play store": [
    "android app",
    "google play",
    "play store kholo",
    "play store aç",
    "متجر جوجل",
    "гугл плей",
  ],
  "app store": [
    "ios app",
    "apple store",
    "app store kholo",
    "app store aç",
    "متجر آبل",
    "эпп стор",
  ],
  "desktop mac": [
    "desktop and mac",
    "desktop",
    "mac",
    "desktop app",
    "desktop kholo",
    "masaüstü",
    "سطح المكتب",
    "десктоп",
  ],
  "web platform": [
    "web trader",
    "browser platform",
    "web platform kholo",
    "web platform aç",
    "منصة الويب",
    "веб платформа",
  ],
};

const SMART_PROMPT_RULES: PromptRule[] = [
  {
    keywords: [
      "dashboard",
      "summary",
      "overview",
      "snapshot",
      "all data",
      "crm status",
    ],
    toPrompt: (language) =>
      localizeValue(language, {
        "en-IN": "Give me my dashboard summary",
        "hi-IN": "Mera dashboard summary batao",
        "tr-TR": "Panel özetimi göster",
        "ar-SA": "اعرض ملخص لوحة التحكم",
        "ru-RU": "Покажи сводку панели",
      }),
  },
  {
    keywords: [
      "balance",
      "wallet",
      "funds",
      "money",
      "equity",
      "available balance",
    ],
    toPrompt: (language) =>
      localizeValue(language, {
        "en-IN": "What is my total balance?",
        "hi-IN": "Mera total balance kya hai?",
        "tr-TR": "Toplam bakiyem nedir?",
        "ar-SA": "ما هو إجمالي رصيدي؟",
        "ru-RU": "Какой у меня общий баланс?",
      }),
  },
  {
    keywords: [
      "deposit",
      "deposits",
      "add funds",
      "payment",
      "credited",
      "fund account",
    ],
    toPrompt: (language) =>
      localizeValue(language, {
        "en-IN": "Show my deposit status",
        "hi-IN": "Mere deposits ka status batao",
        "tr-TR": "Yatırım durumumu göster",
        "ar-SA": "اعرض حالة الإيداعات الخاصة بي",
        "ru-RU": "Покажи статус моих депозитов",
      }),
  },
  {
    keywords: ["withdraw", "withdrawal", "cashout", "cash out", "payout"],
    toPrompt: (language) =>
      localizeValue(language, {
        "en-IN": "Show my withdrawal status",
        "hi-IN": "Mere withdrawals ka status batao",
        "tr-TR": "Çekim durumumu göster",
        "ar-SA": "اعرض حالة السحب الخاصة بي",
        "ru-RU": "Покажи статус моих выводов",
      }),
  },
  {
    keywords: [
      "transaction",
      "transactions",
      "history",
      "statement",
      "recent activity",
      "activity",
    ],
    toPrompt: (language) =>
      localizeValue(language, {
        "en-IN": "Show my latest transactions",
        "hi-IN": "Meri latest transactions dikhao",
        "tr-TR": "Son işlemlerimi göster",
        "ar-SA": "اعرض آخر معاملاتي",
        "ru-RU": "Покажи последние транзакции",
      }),
  },
  {
    keywords: [
      "forex",
      "fx",
      "market",
      "forecast",
      "signal",
      "crypto",
      "bitcoin",
      "ethereum",
      "eurusd",
      "gbpusd",
      "usdjpy",
    ],
    toPrompt: (language) =>
      localizeValue(language, {
        "en-IN": "What is the latest forex outlook?",
        "hi-IN": "Latest forex outlook batao",
        "tr-TR": "Son forex görünümünü göster",
        "ar-SA": "اعرض أحدث توقعات الفوركس",
        "ru-RU": "Покажи последний прогноз по форексу",
      }),
  },
  {
    keywords: [
      "notification",
      "notifications",
      "alert",
      "alerts",
      "unread",
      "announcement",
    ],
    toPrompt: (language) =>
      localizeValue(language, {
        "en-IN": "Do I have unread notifications?",
        "hi-IN": "Kya mere unread notifications hain?",
        "tr-TR": "Okunmamış bildirimlerim var mı?",
        "ar-SA": "هل لدي إشعارات غير مقروءة؟",
        "ru-RU": "Есть ли у меня непрочитанные уведомления?",
      }),
  },
  {
    keywords: [
      "ticket",
      "tickets",
      "support",
      "issue",
      "complaint",
      "help desk",
    ],
    toPrompt: (language) =>
      localizeValue(language, {
        "en-IN": "Do I have open support tickets?",
        "hi-IN": "Kya mere open support tickets hain?",
        "tr-TR": "Açık destek taleplerim var mı?",
        "ar-SA": "هل لدي تذاكر دعم مفتوحة؟",
        "ru-RU": "Есть ли у меня открытые тикеты поддержки?",
      }),
  },
  {
    keywords: ["profile", "kyc", "email", "name", "account details"],
    toPrompt: (language) =>
      localizeValue(language, {
        "en-IN": "Show my profile details",
        "hi-IN": "Meri profile details dikhao",
        "tr-TR": "Profil bilgilerimi göster",
        "ar-SA": "اعرض تفاصيل ملفي الشخصي",
        "ru-RU": "Покажи данные моего профиля",
      }),
  },
  {
    keywords: ["dashboard", "home", "main page", "overview page"],
    routeLabel: "dashboard",
    requiresNavigationVerb: true,
    toPrompt: (language, routeLabel) =>
      localizeValue(language, {
        "en-IN": `Open ${routeLabel} page`,
        "hi-IN": `${routeLabel} page kholo`,
        "tr-TR": `${routeLabel} sayfasını aç`,
        "ar-SA": `افتح صفحة ${routeLabel}`,
        "ru-RU": `Открой страницу ${routeLabel}`,
      }),
  },
  {
    keywords: [
      "deposit page",
      "add funds page",
      "funding page",
      "deposit screen",
    ],
    routeLabel: "deposit",
    toPrompt: (language, routeLabel) =>
      localizeValue(language, {
        "en-IN": `Open ${routeLabel} page`,
        "hi-IN": `${routeLabel} page kholo`,
        "tr-TR": `${routeLabel} sayfasını aç`,
        "ar-SA": `افتح صفحة ${routeLabel}`,
        "ru-RU": `Открой страницу ${routeLabel}`,
      }),
  },
  {
    keywords: [
      "withdrawal page",
      "withdraw page",
      "cashout page",
      "payout page",
    ],
    routeLabel: "withdrawal",
    toPrompt: (language, routeLabel) =>
      localizeValue(language, {
        "en-IN": `Open ${routeLabel} page`,
        "hi-IN": `${routeLabel} page kholo`,
        "tr-TR": `${routeLabel} sayfasını aç`,
        "ar-SA": `افتح صفحة ${routeLabel}`,
        "ru-RU": `Открой страницу ${routeLabel}`,
      }),
  },
  {
    keywords: [
      "account page",
      "my accounts",
      "account list",
      "trading accounts",
    ],
    routeLabel: "account list",
    toPrompt: (language, routeLabel) =>
      localizeValue(language, {
        "en-IN": `Open ${routeLabel} page`,
        "hi-IN": `${routeLabel} page kholo`,
        "tr-TR": `${routeLabel} sayfasını aç`,
        "ar-SA": `افتح صفحة ${routeLabel}`,
        "ru-RU": `Открой страницу ${routeLabel}`,
      }),
  },
  {
    keywords: [
      "live trade",
      "live chart",
      "forex chart",
      "trading chart",
      "market chart page",
    ],
    routeLabel: "live chart",
    toPrompt: (language, routeLabel) =>
      localizeValue(language, {
        "en-IN": `Open ${routeLabel} page`,
        "hi-IN": `${routeLabel} page kholo`,
        "tr-TR": `${routeLabel} sayfasını aç`,
        "ar-SA": `افتح صفحة ${routeLabel}`,
        "ru-RU": `Открой страницу ${routeLabel}`,
      }),
  },
  {
    keywords: ["support page", "ticket page", "support center", "help page"],
    routeLabel: "support",
    toPrompt: (language, routeLabel) =>
      localizeValue(language, {
        "en-IN": `Open ${routeLabel} page`,
        "hi-IN": `${routeLabel} page kholo`,
        "tr-TR": `${routeLabel} sayfasını aç`,
        "ar-SA": `افتح صفحة ${routeLabel}`,
        "ru-RU": `Открой страницу ${routeLabel}`,
      }),
  },
  {
    keywords: ["profile page", "kyc page", "settings page"],
    routeLabel: "profile",
    toPrompt: (language, routeLabel) =>
      localizeValue(language, {
        "en-IN": `Open ${routeLabel} page`,
        "hi-IN": `${routeLabel} page kholo`,
        "tr-TR": `${routeLabel} sayfasını aç`,
        "ar-SA": `افتح صفحة ${routeLabel}`,
        "ru-RU": `Открой страницу ${routeLabel}`,
      }),
  },
];

function localizeValue<T>(
  language: AssistantLanguage,
  values: Record<AssistantLanguage, T>,
) {
  return values[language] ?? values["en-IN"];
}

function formatMoney(value?: number) {
  const amount = Number(value || 0);
  return `$${amount.toFixed(2)}`;
}

function getLanguageBase(language: string) {
  return language.split("-")[0].toLowerCase();
}

function normalizePromptText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

function optimizeAssistantPrompt(prompt: string, language: AssistantLanguage) {
  const normalizedPrompt = normalizePromptText(prompt);
  if (!normalizedPrompt) {
    return { displayPrompt: prompt.trim(), requestPrompt: "" };
  }

  const hasNavigationIntent = includesAny(normalizedPrompt, NAVIGATION_HINTS);
  const matchedRule = SMART_PROMPT_RULES.find(
    ({ keywords, requiresNavigationVerb }) =>
      includesAny(normalizedPrompt, keywords) &&
      (!requiresNavigationVerb || hasNavigationIntent),
  );

  const requestPrompt = matchedRule
    ? matchedRule.toPrompt(language, matchedRule.routeLabel)
    : prompt.trim();

  return {
    displayPrompt: prompt.trim(),
    requestPrompt,
  };
}

function hasActionIntent(text: string) {
  return (
    includesAny(text, ACTION_VERBS) ||
    Object.values(MULTILINGUAL_ACTION_PATTERNS).some((values) =>
      includesAny(text, values),
    )
  );
}

function splitVoiceCommand(prompt: string) {
  const splitKeywords = MULTILINGUAL_ACTION_PATTERNS.split
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const continuationKeywords = [
    ...ACTION_VERBS,
    ...MULTILINGUAL_ACTION_PATTERNS.fill,
    ...MULTILINGUAL_ACTION_PATTERNS.select,
    ...MULTILINGUAL_ACTION_PATTERNS.click,
    ...MULTILINGUAL_ACTION_PATTERNS.submit,
  ]
    .sort((left, right) => right.length - left.length)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  return prompt
    .split(
      new RegExp(
        `\\b(?:${splitKeywords}|and (?=(?:${continuationKeywords})\\b))\\b|,`,
        "gi",
      ),
    )
    .map((part) => part.trim())
    .filter(Boolean);
}

function cleanExtractedValue(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function normalizeFieldActionValue(field: string, value: string) {
  const cleanedValue = cleanExtractedValue(value);
  const normalizedField = normalizePromptText(field);
  const normalizedValue = normalizePromptText(cleanedValue);

  if (normalizedField.includes("leverage")) {
    const leverageMatch = normalizedValue.match(/(?:^| )(\d{2,5})(?:x)?$/);
    if (leverageMatch) {
      return `1:${leverageMatch[1]}`;
    }
  }

  return cleanedValue;
}

function extractAccountNumber(value: string) {
  const directMatch = value.match(/\b\d{4,}\b/);
  if (directMatch) {
    return directMatch[0];
  }

  // Speech recognition commonly splits a long spoken number into
  // space-separated groups (e.g. "260 804 182" instead of "260804182").
  // Collapse runs of whitespace-separated digit groups before retrying,
  // so a dictated account number still matches its contiguous on-screen
  // form.
  const collapsed = value.replace(/(?:\d+\s+)+\d+/g, (run) =>
    run.replace(/\s+/g, ""),
  );
  const collapsedMatch = collapsed.match(/\b\d{4,}\b/);
  return collapsedMatch?.[0] || null;
}

function escapeRegexValue(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createVerbMatcher(verbs: string[]) {
  return new RegExp(
    `^(?:${verbs
      .sort((left, right) => right.length - left.length)
      .map(escapeRegexValue)
      .join("|")})\\s+(.+)$`,
    "iu",
  );
}

const FILL_VERB_MATCHER = createVerbMatcher(MULTILINGUAL_ACTION_PATTERNS.fill);
const SELECT_VERB_MATCHER = createVerbMatcher(
  MULTILINGUAL_ACTION_PATTERNS.select,
);
const CLICK_VERB_MATCHER = createVerbMatcher(
  MULTILINGUAL_ACTION_PATTERNS.click,
);
const SUBMIT_VERB_MATCHER = createVerbMatcher(
  MULTILINGUAL_ACTION_PATTERNS.submit,
);
const PREPOSITION_MATCHER = new RegExp(
  `^(.+?)\\s+(?:${MULTILINGUAL_ACTION_PATTERNS.prepositions
    .sort((left, right) => right.length - left.length)
    .map(escapeRegexValue)
    .join("|")})\\s+(.+)$`,
  "iu",
);

function matchFieldAliasPrefix(content: string) {
  const aliasEntries = Object.entries(FIELD_ALIASES)
    .flatMap(([field, aliases]) => aliases.map((alias) => ({ field, alias })))
    .sort((left, right) => right.alias.length - left.alias.length);

  for (const { field, alias } of aliasEntries) {
    const aliasMatch = content.match(
      new RegExp(`^${escapeRegexValue(alias)}(?:\\s+|$)(.*)$`, "iu"),
    );
    if (aliasMatch) {
      return {
        field,
        value: aliasMatch[1]?.trim() || "",
      };
    }
  }

  return null;
}

function extractFieldAndValue(content: string) {
  const prepositionMatch = content.match(PREPOSITION_MATCHER);
  if (prepositionMatch) {
    return {
      field: canonicalizeFieldName(prepositionMatch[1]),
      value: prepositionMatch[2].trim(),
    };
  }

  const aliasPrefixMatch = matchFieldAliasPrefix(content);
  if (aliasPrefixMatch && aliasPrefixMatch.value) {
    return aliasPrefixMatch;
  }

  return null;
}

function canonicalizeFieldName(field: string) {
  const normalizedField = normalizePromptText(field);

  // Pick the longest matching alias across ALL canonical fields, not the
  // first field object-order happens to visit. Otherwise a specific field
  // like "bank account number" gets swallowed by the bare "account" alias
  // (a substring of almost every account-related phrase) and canonicalized
  // to the generic trading-account field instead of staying specific.
  let bestField: string | null = null;
  let bestAliasLength = -1;

  for (const [canonicalField, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      const normalizedAlias = normalizePromptText(alias);
      if (
        normalizedAlias &&
        normalizedField.includes(normalizedAlias) &&
        normalizedAlias.length > bestAliasLength
      ) {
        bestAliasLength = normalizedAlias.length;
        bestField = canonicalField;
      }
    }
  }

  return bestField || field.trim();
}

const NAVIGATE_MATCH_THRESHOLD = 55;

function extractNavigateAction(
  segment: string,
  currentPath?: string,
): VoiceCommandAction | null {
  const normalizedSegment = normalizePromptText(segment);
  if (!includesAny(normalizedSegment, NAVIGATION_HINTS)) {
    return null;
  }

  // A segment that explicitly opens with an unambiguous "select" verb is
  // asking to pick a value/option on the current page, not navigate -
  // even if the selected target's name happens to also be registered as a
  // route keyword (e.g. "select create trading account" ends with the
  // "create trading account" keyword for /client/open-account, which
  // would otherwise get matched as a - harmless-looking but wrong -
  // "already on this page" navigate no-op instead of actually clicking
  // the Create Account button). Unlike "open"/"show", "select" has no
  // legitimate navigation meaning, so it's safe to rule out entirely.
  const selectVerbPrefix = MULTILINGUAL_ACTION_PATTERNS.select.find((verb) =>
    normalizedSegment.startsWith(`${normalizePromptText(verb)} `),
  );
  if (selectVerbPrefix) {
    return null;
  }

  // Fuzzy token-overlap match instead of a strict substring check, so a
  // route keyword still matches when the spoken phrase has extra words
  // wedged in between (e.g. "create A trading account" vs the keyword
  // "create trading account").
  let bestRoute: (typeof VOICE_ROUTE_MATCHERS)[number] | null = null;
  let bestScore = -1;

  for (const route of VOICE_ROUTE_MATCHERS) {
    for (const keyword of route.keywords) {
      const score = getTextMatchScore(normalizedSegment, keyword);
      if (score > bestScore) {
        bestScore = score;
        bestRoute = route;
      }
    }
  }

  if (!bestRoute || bestScore < NAVIGATE_MATCH_THRESHOLD) {
    return null;
  }

  // Navigating to the page the user is already on is never a useful
  // action, and matching one here would swallow the segment as a
  // harmless-looking "already on this page" no-op instead of letting it
  // fall through to click/select handling - which matters because some
  // on-page buttons are deliberately named after their own route's
  // keywords (e.g. "create partner account" is both the /client/partner/
  // create route keyword AND that page's own submit button, and "ticket"
  // is both the /client/support route keyword and matches phrases like
  // "open new ticket" meant to click the New Ticket button there).
  if (currentPath && bestRoute.route === currentPath) {
    return null;
  }

  return {
    type: "navigate",
    route: bestRoute.route,
    label: bestRoute.label,
  };
}

function extractImplicitNavigateAction(
  segment: string,
  currentPath: string,
): VoiceCommandAction | null {
  const normalizedSegment = normalizePromptText(segment);
  if (!normalizedSegment || includesAny(normalizedSegment, NAVIGATION_HINTS)) {
    return null;
  }

  const matchedRoute = VOICE_ROUTE_MATCHERS.find(
    ({ allowImplicitIntent, keywords }) =>
      allowImplicitIntent &&
      keywords.some((keyword) => {
        const normalizedKeyword = normalizePromptText(keyword);
        return (
          normalizedSegment === normalizedKeyword ||
          normalizedSegment.startsWith(`${normalizedKeyword} `) ||
          normalizedSegment.endsWith(` ${normalizedKeyword}`)
        );
      }),
  );

  if (!matchedRoute || matchedRoute.route === currentPath) {
    return null;
  }

  return {
    type: "navigate",
    route: matchedRoute.route,
    label: matchedRoute.label,
  };
}

function extractFillAction(segment: string): VoiceCommandAction | null {
  const forwardMatch = segment.match(FILL_VERB_MATCHER);
  const forwardContent = forwardMatch?.[1]?.trim();
  if (forwardContent) {
    const extracted = extractFieldAndValue(forwardContent);
    if (extracted) {
      return {
        type: "fill",
        field: extracted.field,
        value: normalizeFieldActionValue(extracted.field, extracted.value),
      };
    }
  }

  const reverseMatch = segment.match(
    new RegExp(
      `^(.+?)\\s+(?:${MULTILINGUAL_ACTION_PATTERNS.prepositions
        .sort((left, right) => right.length - left.length)
        .map(escapeRegexValue)
        .join("|")})\\s+(.+?)\\s+(?:${MULTILINGUAL_ACTION_PATTERNS.fill
        .sort((left, right) => right.length - left.length)
        .map(escapeRegexValue)
        .join("|")})$`,
      "iu",
    ),
  );
  if (reverseMatch) {
    return {
      type: "fill",
      field: canonicalizeFieldName(reverseMatch[1]),
      value: normalizeFieldActionValue(reverseMatch[1], reverseMatch[2]),
    };
  }

  const fieldPrefixMatch = matchFieldAliasPrefix(segment);
  if (fieldPrefixMatch) {
    const trailingVerbMatch = fieldPrefixMatch.value.match(
      new RegExp(
        `^(.+?)\\s+(?:${MULTILINGUAL_ACTION_PATTERNS.fill
          .sort((left, right) => right.length - left.length)
          .map(escapeRegexValue)
          .join("|")})$`,
        "iu",
      ),
    );
    if (trailingVerbMatch) {
      return {
        type: "fill",
        field: fieldPrefixMatch.field,
        value: normalizeFieldActionValue(
          fieldPrefixMatch.field,
          trailingVerbMatch[1],
        ),
      };
    }
  }

  return null;
}

function extractSelectAction(segment: string): VoiceCommandAction | null {
  const match =
    segment.match(SELECT_VERB_MATCHER) ||
    segment.match(
      new RegExp(
        `^(.+?)\\s+(?:${MULTILINGUAL_ACTION_PATTERNS.select
          .sort((left, right) => right.length - left.length)
          .map(escapeRegexValue)
          .join("|")})$`,
        "iu",
      ),
    );
  if (!match?.[1]) {
    return null;
  }

  const content = match[1].trim();
  const canonicalField = canonicalizeFieldName(content);
  const aliasPrefixMatch = matchFieldAliasPrefix(content);

  if (canonicalField !== content) {
    const rawValue = aliasPrefixMatch?.value || "";
    return {
      type: "select",
      field: canonicalField,
      value: normalizeFieldActionValue(canonicalField, rawValue || content),
    };
  }

  if (aliasPrefixMatch) {
    return {
      type: "select",
      field: aliasPrefixMatch.field,
      value: normalizeFieldActionValue(
        aliasPrefixMatch.field,
        aliasPrefixMatch.value,
      ),
    };
  }

  return {
    type: "select",
    field: "generic",
    value: cleanExtractedValue(content),
  };
}

function extractClickAction(segment: string): VoiceCommandAction | null {
  const createMatch =
    segment.match(SUBMIT_VERB_MATCHER) ||
    segment.match(
      new RegExp(
        `^(.+?)\\s+(?:${MULTILINGUAL_ACTION_PATTERNS.submit
          .sort((left, right) => right.length - left.length)
          .map(escapeRegexValue)
          .join("|")})$`,
        "iu",
      ),
    );
  if (createMatch) {
    return {
      type: "click",
      target: cleanExtractedValue(createMatch[1]),
    };
  }

  const clickMatch =
    segment.match(CLICK_VERB_MATCHER) ||
    segment.match(
      new RegExp(
        `^(.+?)\\s+(?:${MULTILINGUAL_ACTION_PATTERNS.click
          .sort((left, right) => right.length - left.length)
          .map(escapeRegexValue)
          .join("|")})$`,
        "iu",
      ),
    );
  if (!clickMatch) {
    return null;
  }

  return {
    type: "click",
    target: cleanExtractedValue(clickMatch[1]),
  };
}

const MAX_PLAUSIBLE_CLICK_TARGET_WORDS = 5;

// The "create ..." submit-verb regex is greedy: on a long compound sentence
// it can swallow everything after "create" as the click target instead of
// just a button name. Reject those so the caller falls back to the smarter
// AI assistant rather than trying (and failing) to click a made-up target.
function isPlausibleAction(action: VoiceCommandAction) {
  if (action.type !== "click") {
    return true;
  }

  const wordCount = action.target.trim().split(/\s+/).filter(Boolean).length;
  return wordCount > 0 && wordCount <= MAX_PLAUSIBLE_CLICK_TARGET_WORDS;
}

function parseVoiceCommandActions(prompt: string, currentPath?: string) {
  const segments = splitVoiceCommand(prompt);
  const actions: VoiceCommandAction[] = [];

  for (const segment of segments) {
    const action =
      extractNavigateAction(segment, currentPath) ||
      extractFillAction(segment) ||
      extractSelectAction(segment) ||
      extractClickAction(segment);

    if (action && isPlausibleAction(action)) {
      actions.push(action);
    }
  }

  return actions;
}

function cleanAssistantText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const lines = normalized.split("\n");

  const filtered = lines.filter((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return true;
    }

    if (
      index < 3 &&
      (/^user repeated question\b/i.test(trimmed) ||
        /^need to\b/i.test(trimmed) ||
        /^provide concise answer\b/i.test(trimmed))
    ) {
      return false;
    }

    return true;
  });

  return filtered.join("\n").trim();
}

function parseMarkdownTable(lines: string[]) {
  const rowLines = lines.filter((line) => line.trim().startsWith("|"));
  if (rowLines.length < 2) {
    return null;
  }

  const splitRow = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);

  const headers = splitRow(rowLines[0]);
  const divider = rowLines[1].replace(/[|\-\s:]/g, "");

  if (!headers.length || divider.length > 0) {
    return null;
  }

  const rows = rowLines
    .slice(2)
    .map(splitRow)
    .filter((row) => row.length > 0);
  if (!rows.length) {
    return null;
  }

  return {
    headers,
    rows,
  };
}

function parseAssistantBlocks(text: string): AssistantBlock[] {
  const cleaned = cleanAssistantText(text);
  if (!cleaned) {
    return [];
  }

  const blocks: AssistantBlock[] = [];
  const lines = cleaned.split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }

      const table = parseMarkdownTable(tableLines);
      if (table) {
        blocks.push({
          type: "table",
          headers: table.headers,
          rows: table.rows,
        });
        continue;
      }

      blocks.push({ type: "paragraph", text: tableLines.join("\n") });
      continue;
    }

    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      blocks.push({ type: "heading", text: headingMatch[1].trim() });
      index += 1;
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*•]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*•]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("|") &&
      !/^[-*•]\s+/.test(lines[index].trim()) &&
      !/^\*\*(.+?)\*\*$/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function createSpokenAssistantText(text: string) {
  const blocks = parseAssistantBlocks(text);

  if (!blocks.length) {
    return cleanAssistantText(text)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/[`*_#>~]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return blocks
    .map((block) => {
      if (block.type === "heading") {
        return `${block.text}.`;
      }

      if (block.type === "list") {
        return block.items.map((item) => item.trim()).join(". ");
      }

      if (block.type === "table") {
        return block.rows
          .map((row) =>
            row
              .map((cell, index) => {
                const header = block.headers[index]?.replace(/\*/g, "").trim();
                const value = cell.replace(/\*\*/g, "").trim();
                return header ? `${header}: ${value}` : value;
              })
              .join(", "),
          )
          .join(". ");
      }

      return block.text;
    })
    .join(" ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[`*_#>~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function AssistantMessageBody({ text }: { text: string }) {
  const blocks = useMemo(() => parseAssistantBlocks(text), [text]);

  if (!blocks.length) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div className="space-y-2.5">
      {blocks.map((block, blockIndex) => {
        if (block.type === "heading") {
          return (
            <p
              key={`assistant-block-${blockIndex}`}
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={`assistant-block-${blockIndex}`}
              className="space-y-1.5 text-heading"
            >
              {block.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "table") {
          return (
            <div
              key={`assistant-block-${blockIndex}`}
              className="overflow-x-auto rounded-[18px] border border-border bg-surface-strong"
            >
              <table className="min-w-full text-left text-[12px]">
                <thead className="bg-surface-strong/5 text-subtle">
                  <tr>
                    {block.headers.map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-3 py-2 font-semibold"
                      >
                        {header.replace(/\*/g, "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr
                      key={`assistant-row-${rowIndex}`}
                      className="border-t border-border text-heading"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`assistant-cell-${rowIndex}-${cellIndex}`}
                          className="whitespace-nowrap px-3 py-2 align-top"
                        >
                          {cell.replace(/\*\*/g, "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p
            key={`assistant-block-${blockIndex}`}
            className="whitespace-pre-wrap text-[13px] leading-5 text-heading"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function AssistantTypewriter({
  id,
  text,
  animate,
  onDone,
}: {
  id: string;
  text: string;
  animate: boolean;
  onDone: () => void;
}) {
  const [visibleLength, setVisibleLength] = useState(
    animate ? 0 : text.length,
  );

  useEffect(() => {
    if (!animate) {
      setVisibleLength(text.length);
      return;
    }

    setVisibleLength(0);
    let current = 0;
    const step = Math.max(1, Math.round(text.length / 90));

    const interval = window.setInterval(() => {
      current = Math.min(text.length, current + step);
      setVisibleLength(current);

      if (current >= text.length) {
        window.clearInterval(interval);
        onDone();
      }
    }, 16);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return <AssistantMessageBody text={text.slice(0, visibleLength)} />;
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-accent" />
      <span
        className="thinking-dot h-1.5 w-1.5 rounded-full bg-accent"
        style={{ animationDelay: "0.15s" }}
      />
      <span
        className="thinking-dot h-1.5 w-1.5 rounded-full bg-accent"
        style={{ animationDelay: "0.3s" }}
      />
    </span>
  );
}

function formatMessageTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-subtle transition hover:text-accent"
      title="Copy message"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function isLikelyFemaleVoice(voice: SpeechSynthesisVoice) {
  const haystack = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  return FEMALE_VOICE_HINTS.some((hint) => haystack.includes(hint));
}

function getLocaleVoiceScore(
  voice: SpeechSynthesisVoice,
  language: AssistantLanguage,
) {
  const haystack =
    `${voice.name} ${voice.voiceURI} ${voice.lang}`.toLowerCase();
  const localeHints = LOCALE_VOICE_HINTS[language] || [];
  let score = 0;

  if (voice.lang.toLowerCase() === language.toLowerCase()) {
    score += 6;
  }

  if (getLanguageBase(voice.lang) === getLanguageBase(language)) {
    score += 3;
  }

  if (isLikelyFemaleVoice(voice)) {
    score += 4;
  }

  for (const hint of localeHints) {
    if (haystack.includes(hint)) {
      score += 2;
    }
  }

  return score;
}

function getPreferredVoice(
  voiceList: SpeechSynthesisVoice[],
  language: AssistantLanguage,
  savedVoiceName?: string | null,
) {
  if (!voiceList.length) return null;

  if (savedVoiceName) {
    const savedVoice = voiceList.find((voice) => voice.name === savedVoiceName);
    if (savedVoice) {
      return savedVoice;
    }
  }

  const languageBase = getLanguageBase(language);
  const sameLanguage = voiceList.filter(
    (voice) =>
      voice.lang.toLowerCase() === language.toLowerCase() ||
      getLanguageBase(voice.lang) === languageBase,
  );

  const rankedVoices = [...sameLanguage].sort(
    (left, right) =>
      getLocaleVoiceScore(right, language) -
      getLocaleVoiceScore(left, language),
  );

  return rankedVoices[0] || voiceList.find(isLikelyFemaleVoice) || voiceList[0];
}

function isVisibleElement(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    !element.hasAttribute("disabled") &&
    element.getClientRects().length > 0
  );
}

function getReadableElementText(element: Element | null) {
  let associatedLabelText = "";

  if (element instanceof HTMLElement) {
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      associatedLabelText = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent || "")
        .join(" ");
    }
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    if (element.labels?.length) {
      associatedLabelText = Array.from(element.labels)
        .map((label) => label.textContent || "")
        .join(" ");
    }
  }

  return normalizePromptText(
    (element instanceof HTMLElement ? element.dataset.voiceTarget || "" : "") ||
      (element instanceof HTMLElement
        ? element.dataset.voiceValue || ""
        : "") ||
      (element instanceof HTMLElement
        ? element.dataset.voiceField || ""
        : "") ||
      element?.textContent ||
      (element instanceof HTMLElement ? element.title : "") ||
      (element instanceof HTMLElement
        ? element.getAttribute("aria-label") || ""
        : "") ||
      associatedLabelText ||
      (element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
        ? element.placeholder || ""
        : "") ||
      (element instanceof HTMLElement
        ? element.getAttribute("name") || ""
        : "") ||
      (element instanceof HTMLElement ? element.id : "") ||
      (element instanceof HTMLInputElement ? element.value : "") ||
      "",
  );
}

function textMatchesTarget(source: string, target: string) {
  const normalizedSource = normalizePromptText(source);
  const normalizedTarget = normalizePromptText(target);

  if (!normalizedSource || !normalizedTarget) {
    return false;
  }

  return (
    normalizedSource.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedSource)
  );
}

// Common filler words that carry no identifying signal on their own — if
// two texts only share words like these, that isn't a real match.
const MATCH_STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "on",
  "in",
  "at",
  "to",
  "for",
  "of",
  "and",
  "or",
  "with",
  "as",
  "is",
  "it",
  "this",
  "that",
  "please",
  "kindly",
  "my",
]);

function meaningfulTokens(normalizedText: string) {
  return normalizedText
    .split(" ")
    .filter((token) => token && !MATCH_STOPWORDS.has(token));
}

function getTextMatchScore(source: string, target: string) {
  const normalizedSource = normalizePromptText(source);
  const normalizedTarget = normalizePromptText(target);

  if (!normalizedSource || !normalizedTarget) {
    return -1;
  }

  if (normalizedSource === normalizedTarget) {
    return 100;
  }

  if (normalizedSource.startsWith(`${normalizedTarget} `)) {
    return 92;
  }

  if (normalizedSource.endsWith(` ${normalizedTarget}`)) {
    return 90;
  }

  if (normalizedSource.includes(normalizedTarget)) {
    return 80;
  }

  if (normalizedTarget.includes(normalizedSource)) {
    return 70;
  }

  const sourceTokens = meaningfulTokens(normalizedSource);
  const targetTokens = meaningfulTokens(normalizedTarget);

  if (!targetTokens.length) {
    return -1;
  }

  const sharedTokens = targetTokens.filter((token) =>
    sourceTokens.includes(token),
  );
  const overlapRatio = sharedTokens.length / targetTokens.length;

  // Require at least half of the meaningful spoken words to actually be
  // present. Without this floor, two texts that only share one common word
  // out of several (or nothing but filler words) would still register as a
  // "match" and cause the wrong element to be clicked or selected.
  if (overlapRatio < 0.5) {
    return -1;
  }

  return Math.round(overlapRatio * 60);
}

function clickElement(element: HTMLElement) {
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.focus?.();
  element.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  element.click();

  if (
    element instanceof HTMLInputElement &&
    (element.type === "checkbox" || element.type === "radio")
  ) {
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

// When a modal (or any element marked [data-voice-scope]) is open, voice
// element searches should be confined to it. Without this, a search that
// fails to find its target inside the modal falls through to matching real
// page content sitting behind the modal overlay — which is still visible to
// the DOM (isVisibleElement) even though blurred/obscured on screen.
// Clicking such an element bubbles a real mousedown outside the modal's
// root, which triggers this app's own "click outside closes modal"
// handlers and closes the modal mid-flow.
function getVoiceSearchRoot(): ParentNode {
  // [data-voice-scope] is reused for two different purposes: narrow,
  // local scoping (e.g. the Transfer page's From/To Account dropdown
  // wrappers, or a single account/ticket card) used by
  // findScopedSelectOptionElement, and marking a full-page modal overlay
  // (withdrawal/deposit/password/transaction modals). Only the latter
  // should narrow EVERY search on the page - narrowing on the former
  // would make fields outside that widget (e.g. the amount input next to
  // the account dropdowns) unfindable. All current modal scopes include
  // "modal" in their value; local widget scopes don't.
  const scopes = Array.from(
    document.querySelectorAll<HTMLElement>("[data-voice-scope]"),
  ).filter(isVisibleElement);
  const modalScope = scopes.find((element) =>
    (element.dataset.voiceScope || "").toLowerCase().includes("modal"),
  );
  return modalScope || document;
}

function findVoiceHookElement(target: string) {
  const normalizedTargets =
    expandButtonTargetAliases(target).map(normalizePromptText);
  const candidates = Array.from(
    getVoiceSearchRoot().querySelectorAll<HTMLElement>(
      "[data-voice-target], [data-voice-value]",
    ),
  ).filter(isVisibleElement);

  let bestMatch: HTMLElement | null = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const candidateValue =
      candidate.dataset.voiceTarget || candidate.dataset.voiceValue || "";
    const candidateScore = Math.max(
      ...normalizedTargets.map((currentTarget) =>
        getTextMatchScore(candidateValue, currentTarget),
      ),
    );

    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestMatch = candidate;
    }
  }

  return bestScore >= 0 ? bestMatch : null;
}

function findVoiceFieldElement(field: string) {
  const normalizedField = normalizePromptText(field);
  const candidates = Array.from(
    getVoiceSearchRoot().querySelectorAll<HTMLElement>("[data-voice-field]"),
  ).filter(isVisibleElement);

  let bestMatch: HTMLElement | null = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const candidateScore = getTextMatchScore(
      candidate.dataset.voiceField || "",
      normalizedField,
    );
    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestMatch = candidate;
    }
  }

  return bestScore >= 0 ? bestMatch : null;
}

function expandButtonTargetAliases(target: string) {
  const normalizedTarget = normalizePromptText(target);

  for (const [canonicalTarget, aliases] of Object.entries(
    BUTTON_TARGET_ALIASES,
  )) {
    const normalizedCanonical = normalizePromptText(canonicalTarget);
    const normalizedAliases = aliases.map(normalizePromptText);

    if (
      normalizedTarget === normalizedCanonical ||
      normalizedAliases.includes(normalizedTarget)
    ) {
      return [canonicalTarget, ...aliases];
    }
  }

  return [target];
}

function setNativeValue(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
) {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function findButtonLikeElement(target: string) {
  const hookMatch = findVoiceHookElement(target);
  if (hookMatch) {
    return hookMatch;
  }

  const candidates = Array.from(
    getVoiceSearchRoot().querySelectorAll<HTMLElement>(
      "button, [role='button'], a, label, input[type='button'], input[type='submit'], [class*='cursor-pointer'], [tabindex='0']",
    ),
  ).filter(isVisibleElement);

  const targets = expandButtonTargetAliases(target);

  let bestMatch: HTMLElement | null = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const candidateText = getReadableElementText(candidate);
    const candidateScore = Math.max(
      ...targets.map((currentTarget) =>
        getTextMatchScore(candidateText, currentTarget),
      ),
    );

    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestMatch = candidate;
    }
  }

  return bestScore >= 0 ? bestMatch : null;
}

function findSelectOptionElement(target: string) {
  return (
    findVoiceHookElement(target) ||
    findButtonLikeElement(target) ||
    findAccountOptionElement(target)
  );
}

function createRetryAction<T extends VoiceCommandAction>(action: T): T | null {
  if ((action.attempts || 0) >= MAX_ACTION_RETRIES) {
    return null;
  }

  return {
    ...action,
    attempts: (action.attempts || 0) + 1,
  };
}

function findFieldControl(field: string) {
  const normalizedField = normalizePromptText(field);
  const controls = Array.from(
    getVoiceSearchRoot().querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select"),
  ).filter(isVisibleElement);

  const hookMatch = controls
    .map((control) => ({
      control,
      score: getTextMatchScore(
        control.dataset.voiceField || "",
        normalizedField,
      ),
    }))
    .sort((left, right) => right.score - left.score)[0];
  if (hookMatch && hookMatch.score >= 0) {
    return hookMatch.control;
  }

  const directMatch = controls
    .map((control) => {
      const tokens = [
        control.name,
        control.id,
        control.getAttribute("placeholder") || "",
        control.getAttribute("aria-label") || "",
      ]
        .filter(Boolean)
        .join(" ");

      return {
        control,
        score: getTextMatchScore(tokens, normalizedField),
      };
    })
    .sort((left, right) => right.score - left.score)[0];

  if (directMatch && directMatch.score >= 0) {
    return directMatch.control;
  }

  const labels = Array.from(
    getVoiceSearchRoot().querySelectorAll("label"),
  ).filter((label) =>
    textMatchesTarget(getReadableElementText(label), normalizedField),
  );

  for (const label of labels) {
    const htmlFor = label.getAttribute("for");
    if (htmlFor) {
      const control = document.getElementById(htmlFor);
      if (
        control instanceof HTMLInputElement ||
        control instanceof HTMLTextAreaElement ||
        control instanceof HTMLSelectElement
      ) {
        return control;
      }
    }

    const nestedControl = label.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select");
    if (nestedControl && isVisibleElement(nestedControl)) {
      return nestedControl;
    }

    const nearbyControl = label.parentElement?.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select");
    if (nearbyControl && isVisibleElement(nearbyControl)) {
      return nearbyControl;
    }
  }

  return null;
}

function ensureExpandableSection(field: string) {
  const normalizedField = normalizePromptText(field);

  if (
    normalizedField.includes("password") ||
    normalizedField.includes("mt5 account") ||
    normalizedField.includes("account number")
  ) {
    const toggle = findButtonLikeElement("show custom settings");
    if (toggle) {
      clickElement(toggle);
      return true;
    }
  }

  return false;
}

function findSelectionTrigger(field: string) {
  const fieldHook = findVoiceFieldElement(field);
  if (fieldHook) {
    return fieldHook;
  }

  // Deliberately has no further fallback. A prior version scanned for any
  // visible section/div whose full text merely contained the field name and
  // clicked the first button inside it - but large wrapping containers
  // (e.g. an entire modal card) routinely contain the field name somewhere
  // in a heading or label, so this ended up grabbing whatever button
  // happened to be first inside that container (e.g. the modal's own close
  // button) instead of a genuine dropdown toggle, closing the modal
  // mid-flow. A field that needs a trigger to reveal hidden options (like
  // leverage) must be wired with an explicit data-voice-field/
  // data-voice-target instead of relying on this kind of guesswork.

  return null;
}

function findScopedSelectOptionElement(field: string, target: string) {
  const fieldAnchor =
    findVoiceFieldElement(field) || findVoiceHookElement(field);
  const scopeRoot =
    fieldAnchor?.closest<HTMLElement>("[data-voice-scope]") ||
    fieldAnchor?.parentElement ||
    null;

  if (!scopeRoot) {
    return null;
  }

  const candidates = Array.from(
    scopeRoot.querySelectorAll<HTMLElement>(
      "[data-voice-target], [data-voice-value], button, li, [role='option'], [role='button']",
    ),
  ).filter(
    (candidate) => isVisibleElement(candidate) && candidate !== fieldAnchor,
  );

  let bestMatch: HTMLElement | null = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const candidateText = getReadableElementText(candidate);
    const candidateScore = getTextMatchScore(candidateText, target);
    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestMatch = candidate;
    }
  }

  return bestScore >= 0 ? bestMatch : null;
}

function findOpenAccountTypeCard(target: string) {
  const openAccountSection = document.querySelector(
    "[data-tour-anchor='open-account-types']",
  );

  if (!openAccountSection) {
    return null;
  }

  const cards = Array.from(
    openAccountSection.querySelectorAll<HTMLElement>("button"),
  ).filter(isVisibleElement);

  return (
    cards.find((card) =>
      textMatchesTarget(getReadableElementText(card), target),
    ) || null
  );
}

function accountTargetMatches(text: string, target: string) {
  const normalizedText = normalizePromptText(text);
  const normalizedTarget = normalizePromptText(target);
  const targetAccountNumber = extractAccountNumber(target);
  const textAccountNumber = extractAccountNumber(text);

  if (
    targetAccountNumber &&
    textAccountNumber &&
    targetAccountNumber === textAccountNumber
  ) {
    return true;
  }

  return textMatchesTarget(normalizedText, normalizedTarget);
}

function findAccountOptionElement(target: string) {
  const hookMatch = findVoiceHookElement(target);
  if (hookMatch) {
    return hookMatch;
  }

  const candidates = Array.from(
    getVoiceSearchRoot().querySelectorAll<HTMLElement>(
      "button, li, label, [role='option'], [role='radio'], [role='menuitem'], [data-value]",
    ),
  ).filter(isVisibleElement);

  return (
    candidates.find((candidate) =>
      accountTargetMatches(
        getReadableElementText(candidate) ||
          candidate.textContent ||
          candidate.getAttribute("aria-label") ||
          "",
        target,
      ),
    ) || null
  );
}

function getRouteLabel(route: string) {
  return (
    VOICE_ROUTE_MATCHERS.find((matcher) => matcher.route === route)?.label ||
    route.replace(/^\/+/, "").replace(/[-/]+/g, " ").trim() ||
    "page"
  );
}

function getLanguageCopy(language: AssistantLanguage) {
  return localizeValue(language, {
    "en-IN": {
      title: "Private CRM AI",
      listening: "Listening. Speak now.",
      speak: "Start Listening",
      placeholder:
        "Ask about your CRM, balance, tickets, accounts, forex outlook, crypto outlook, or tell me which CRM page to open...",
      ready: "Ask about your CRM data or open a CRM page.",
      unsupported: "Your browser does not support voice recognition.",
      crmOnly:
        "This assistant uses your CRM backend context and, when configured in the backend, an AI provider for richer answers.",
      voiceError: "Voice input failed. Please try again.",
      dataError: "I could not reach your CRM assistant data right now.",
      statusReady: "Assistant ready.",
      ui: {
        livePrompt: "Live CRM Prompt",
        status: "Status",
        asked: "You Asked",
        reply: "Assistant Reply",
        settings: "Voice And Locale Packs",
        selectedLocale: "Selected Locale",
        preferredVoice: "Preferred Voice",
        snapshot: "CRM Snapshot",
        currentBalance: "Current Balance",
        totalAccounts: "Total Accounts",
        unreadAlerts: "Unread Alerts",
        openTickets: "Open Tickets",
        messages: "Chat Stream",
        suggestions: "Suggested Prompts",
      },
    },
    "hi-IN": {
      title: "Private CRM AI",
      listening: "Listening. Boliye.",
      speak: "Sunna Shuru Karo",
      placeholder:
        "Apne CRM, balance, tickets, accounts, forex outlook, crypto outlook ya kisi CRM page ke bare me poochiye...",
      ready: "Apne CRM data ke bare me poochiye ya koi CRM page kholiye.",
      unsupported: "Aapka browser voice recognition support nahi karta.",
      crmOnly:
        "Yeh assistant aapke CRM backend context ko use karta hai aur backend me configured hone par AI provider se richer answers deta hai.",
      voiceError: "Voice input fail hua. Dobara koshish kariye.",
      dataError: "Main abhi aapke CRM assistant data tak nahi pahunch paaya.",
      statusReady: "Assistant ready hai.",
      ui: {
        livePrompt: "Live CRM Prompt",
        status: "Status",
        asked: "Aapne Poocha",
        reply: "Assistant Reply",
        settings: "Voice Aur Locale Packs",
        selectedLocale: "Selected Locale",
        preferredVoice: "Preferred Voice",
        snapshot: "CRM Snapshot",
        currentBalance: "Current Balance",
        totalAccounts: "Total Accounts",
        unreadAlerts: "Unread Alerts",
        openTickets: "Open Tickets",
        messages: "Chat Stream",
        suggestions: "Suggested Prompts",
      },
    },
    "tr-TR": {
      title: "Ozel CRM AI",
      listening: "Dinleniyor. Konuşabilirsiniz.",
      speak: "Dinlemeyi Başlat",
      placeholder:
        "CRM, arka uç verileri, destek talepleri, bildirimler, hesaplar, bakiye veya açılacak CRM sayfası hakkında sorun...",
      ready: "CRM verilerinizi sorun veya bir CRM sayfası açın.",
      unsupported: "Tarayıcınız sesli tanımayı desteklemiyor.",
      crmOnly:
        "Bu asistan yalnızca doğrulanmış CRM verileriniz ve CRM arka uç etkinliğiniz üzerinden yanıt verir.",
      voiceError: "Sesli giriş başarısız oldu. Lütfen tekrar deneyin.",
      dataError: "CRM asistan verilerinize şu anda ulaşamadım.",
      statusReady: "Asistan hazır.",
      ui: {
        livePrompt: "Canlı CRM İsteği",
        status: "Durum",
        asked: "Sorduğunuz",
        reply: "Asistan Yanıtı",
        settings: "Ses ve Dil Paketleri",
        selectedLocale: "Seçili Dil",
        preferredVoice: "Tercih Edilen Ses",
        snapshot: "CRM Özeti",
        currentBalance: "Güncel Bakiye",
        totalAccounts: "Toplam Hesap",
        unreadAlerts: "Okunmamış Uyarılar",
        openTickets: "Açık Talepler",
        messages: "Sohbet Akışı",
        suggestions: "Önerilen İstekler",
      },
    },
    "ar-SA": {
      title: "مساعد CRM الخاص",
      listening: "جاري الاستماع. تحدث الآن.",
      speak: "ابدأ الاستماع",
      placeholder:
        "اسأل عن CRM أو بيانات الواجهة الخلفية أو التذاكر أو الإشعارات أو الحسابات أو الرصيد أو أخبرني بصفحة CRM التي تريد فتحها...",
      ready: "اسأل عن بيانات CRM الخاصة بك أو افتح صفحة CRM.",
      unsupported: "متصفحك لا يدعم التعرف الصوتي.",
      crmOnly:
        "هذا المساعد يجيب فقط من بيانات CRM الموثقة الخاصة بك ومن نشاط الواجهة الخلفية للـ CRM.",
      voiceError: "فشل الإدخال الصوتي. حاول مرة أخرى.",
      dataError: "تعذر الوصول إلى بيانات مساعد CRM الآن.",
      statusReady: "المساعد جاهز.",
      ui: {
        livePrompt: "طلب CRM المباشر",
        status: "الحالة",
        asked: "لقد طلبت",
        reply: "رد المساعد",
        settings: "حزم الصوت واللغة",
        selectedLocale: "اللغة المختارة",
        preferredVoice: "الصوت المفضل",
        snapshot: "ملخص CRM",
        currentBalance: "الرصيد الحالي",
        totalAccounts: "إجمالي الحسابات",
        unreadAlerts: "التنبيهات غير المقروءة",
        openTickets: "التذاكر المفتوحة",
        messages: "سجل المحادثة",
        suggestions: "الاقتراحات",
      },
    },
    "ru-RU": {
      title: "Private CRM AI",
      listening: "Слушаю. Говорите.",
      speak: "Начать Прослушивание",
      placeholder:
        "Спросите о CRM, backend-данных, тикетах, уведомлениях, счетах, балансе или назовите страницу CRM, которую нужно открыть...",
      ready: "Спросите о данных CRM или откройте страницу CRM.",
      unsupported: "Ваш браузер не поддерживает распознавание речи.",
      crmOnly:
        "Этот ассистент отвечает только на основе ваших аутентифицированных данных CRM и backend-активности CRM.",
      voiceError: "Ошибка голосового ввода. Попробуйте еще раз.",
      dataError: "Сейчас не удалось получить данные CRM-ассистента.",
      statusReady: "Ассистент готов.",
      ui: {
        livePrompt: "Живой Запрос CRM",
        status: "Статус",
        asked: "Вы Спросили",
        reply: "Ответ Ассистента",
        settings: "Голос и Язык",
        selectedLocale: "Выбранный Язык",
        preferredVoice: "Предпочтительный Голос",
        snapshot: "Снимок CRM",
        currentBalance: "Текущий Баланс",
        totalAccounts: "Всего Счетов",
        unreadAlerts: "Непрочитанные Уведомления",
        openTickets: "Открытые Тикеты",
        messages: "Поток Чата",
        suggestions: "Подсказки",
      },
    },
  });
}

export default function VoicePageNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const lastPathRef = useRef(location.pathname);
  const navigationTimeoutRef = useRef<number | null>(null);
  const pendingNavigationRef = useRef<{ route: string; label: string } | null>(
    null,
  );
  const pendingActionTimeoutRef = useRef<number | null>(null);
  const pendingActionsRef = useRef<VoiceCommandAction[]>([]);
  const pendingActionMessagesRef = useRef<string[]>([]);
  const animatedMessageIdsRef = useRef<Set<string>>(new Set());
  const messagesRef = useRef<ChatMessage[]>([]);

  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [heard, setHeard] = useState("");
  const [status, setStatus] = useState("Click mic to start");
  const [language, setLanguage] = useState<AssistantLanguage>("en-IN");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [context, setContext] = useState<AssistantContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastSentiment, setLastSentiment] =
    useState<AssistantSentimentAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(
    DEFAULT_SUGGESTIONS["en-IN"],
  );

  const supported = !!SpeechRecognition && !!window.speechSynthesis;
  const copy = useMemo(() => getLanguageCopy(language), [language]);

  const filteredVoices = useMemo(() => {
    const base = getLanguageBase(language);
    const matches = voices.filter(
      (voice) =>
        voice.lang.toLowerCase() === language.toLowerCase() ||
        getLanguageBase(voice.lang) === base,
    );

    return matches.length ? matches : voices;
  }, [language, voices]);

  const selectedLanguageOption =
    LANGUAGE_OPTIONS.find((option) => option.value === language) ||
    LANGUAGE_OPTIONS[0];

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  function openAssistant() {
    setExpanded(true);
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, expanded]);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  useEffect(() => {
    const savedLanguage =
      (sessionStorage.getItem("assistantLang") as AssistantLanguage) || "en-IN";
    const savedVoiceName = sessionStorage.getItem("assistantVoice");
    setLanguage(savedLanguage);

    function loadVoices() {
      const nextVoices = window.speechSynthesis.getVoices();
      setVoices(nextVoices);
      setSelectedVoice(
        getPreferredVoice(nextVoices, savedLanguage, savedVoiceName),
      );
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadContext() {
      try {
        const nextContext = await fetchAssistantContext(language);
        if (!active) return;

        setContext(nextContext);
        setSuggestions(
          nextContext.suggestions.length
            ? nextContext.suggestions
            : DEFAULT_SUGGESTIONS[language],
        );
        setStatus(copy.statusReady);

        if (!greetedRef.current) {
          setMessages((current) =>
            current.length
              ? current
              : [
                  {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    text: nextContext.welcomeMessage,
                    timestamp: Date.now(),
                  },
                ],
          );

          if (!sessionStorage.getItem(AUTO_WELCOME_SESSION_KEY)) {
            speak(nextContext.welcomeMessage, language, selectedVoice);
            sessionStorage.setItem(AUTO_WELCOME_SESSION_KEY, "true");
          }

          greetedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to load assistant context:", error);
        if (!active) return;
        setStatus(copy.dataError);
      }
    }

    void loadContext();

    return () => {
      active = false;
    };
  }, [copy.dataError, copy.statusReady, language]);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current !== null) {
        window.clearTimeout(navigationTimeoutRef.current);
      }

      if (pendingActionTimeoutRef.current !== null) {
        window.clearTimeout(pendingActionTimeoutRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort?.();
        recognitionRef.current = null;
      }

      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(
    message: string,
    targetLanguage = language,
    voice = selectedVoice,
  ) {
    if (!window.speechSynthesis) return;

    const spokenMessage = createSpokenAssistantText(message);
    if (!spokenMessage) return;

    const utterance = new SpeechSynthesisUtterance(spokenMessage);
    utterance.lang = targetLanguage;
    utterance.rate = 1;
    utterance.pitch = 1;

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function appendMessage(role: ChatMessage["role"], text: string) {
    setMessages((current) =>
      [
        ...current,
        { id: crypto.randomUUID(), role, text, timestamp: Date.now() },
      ].slice(-MAX_CHAT_MESSAGES),
    );
  }

  function buildHistory(nextUserText: string): AssistantChatHistoryItem[] {
    const priorHistory = messagesRef.current
      .slice(-10)
      .map((item) => ({ role: item.role, text: item.text }));

    return [...priorHistory, { role: "user", text: nextUserText }];
  }

  function queueNavigation(route: string, label?: string, delay = 0) {
    const resolvedLabel = label || getRouteLabel(route);
    pendingNavigationRef.current = { route, label: resolvedLabel };
    setStatus(`Opening ${resolvedLabel}...`);

    if (navigationTimeoutRef.current !== null) {
      window.clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = window.setTimeout(() => {
      navigate(route);
      navigationTimeoutRef.current = null;
    }, delay);
  }

  function closeAssistantPanel() {
    setExpanded(false);
    setShowSettings(false);
    setListening(false);
  }

  function schedulePendingActions(delay = 700) {
    if (pendingActionTimeoutRef.current !== null) {
      window.clearTimeout(pendingActionTimeoutRef.current);
    }

    pendingActionTimeoutRef.current = window.setTimeout(() => {
      void runPendingActions();
    }, delay);
  }

  async function executeVoiceAction(
    action: VoiceCommandAction,
  ): Promise<ActionExecutionResult> {
    if (action.type === "fill" && DROPDOWN_ONLY_FIELDS.has(action.field)) {
      return executeVoiceAction({
        type: "select",
        field: action.field,
        value: action.value,
        attempts: action.attempts,
      });
    }

    if (action.type === "navigate") {
      const needsNavigation = location.pathname !== action.route;
      if (!needsNavigation) {
        return {
          success: true,
          message: `Already on ${action.label}.`,
          waitForNextPage: false,
        };
      }

      queueNavigation(action.route, action.label);

      return {
        success: true,
        message: `Opening ${action.label}.`,
        waitForNextPage: needsNavigation,
        waitAfterMs: needsNavigation ? 900 : 0,
      };
    }

    if (action.type === "click") {
      const targetElement = findButtonLikeElement(action.target);
      if (!targetElement) {
        return {
          success: false,
          message: `I could not find "${action.target}" on this page.`,
          waitForNextPage: false,
        };
      }

      clickElement(targetElement);
      return {
        success: true,
        message: `Clicked ${action.target}.`,
        waitForNextPage: false,
        waitAfterMs: 350,
      };
    }

    if (action.type === "fill") {
      const expandedSection = ensureExpandableSection(action.field);
      const control = findFieldControl(action.field);
      if (!control) {
        if (expandedSection) {
          return {
            success: true,
            message: `Opening ${action.field} settings.`,
            waitForNextPage: false,
            waitAfterMs: 350,
            retryAction: action,
          };
        }

        return {
          success: false,
          message: `I could not find the ${action.field} field on this page.`,
          waitForNextPage: false,
        };
      }

      control.scrollIntoView({ behavior: "smooth", block: "center" });
      control.focus();
      setNativeValue(control, action.value);
      const currentValue =
        control instanceof HTMLSelectElement
          ? control.options[control.selectedIndex]?.text || control.value
          : control.value;

      if (!textMatchesTarget(currentValue, action.value)) {
        const retryAction = createRetryAction(action);
        if (retryAction) {
          return {
            success: true,
            message: `Trying again to fill ${action.field}.`,
            waitForNextPage: false,
            waitAfterMs: 220,
            retryAction,
          };
        }
      }

      return {
        success: true,
        message: `Filled ${action.field} with ${action.value}.`,
        waitForNextPage: false,
        waitAfterMs: 120,
      };
    }

    if (action.type === "select") {
      if (action.field === "generic") {
        if (location.pathname === "/client/open-account") {
          const accountTypeCard = findOpenAccountTypeCard(action.value);
          if (accountTypeCard) {
            clickElement(accountTypeCard);
            return {
              success: true,
              message: `Selected ${action.value}.`,
              waitForNextPage: false,
              waitAfterMs: 350,
            };
          }
        }

        const accountOption = findAccountOptionElement(action.value);
        if (accountOption) {
          clickElement(accountOption);
          return {
            success: true,
            message: `Selected ${action.value}.`,
            waitForNextPage: false,
            waitAfterMs: 300,
          };
        }

        const optionButton = findButtonLikeElement(action.value);
        if (!optionButton) {
          return {
            success: false,
            message: `I could not find ${action.value} to select.`,
            waitForNextPage: false,
          };
        }

        clickElement(optionButton);
        return {
          success: true,
          message: `Selected ${action.value}.`,
          waitForNextPage: false,
          waitAfterMs: 350,
        };
      }

      if (
        action.field === "account type" &&
        location.pathname === "/client/open-account"
      ) {
        const openAccountSection = document.querySelector<HTMLElement>(
          "[data-tour-anchor='open-account-types']",
        );
        if (!action.value.trim()) {
          openAccountSection?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          return {
            success: true,
            message: "Choose an account type from the open account options.",
            waitForNextPage: false,
            waitAfterMs: 0,
          };
        }

        const accountTypeCard = findOpenAccountTypeCard(action.value);
        if (!accountTypeCard) {
          return {
            success: false,
            message: `I could not find ${action.value} for ${action.field}.`,
            waitForNextPage: false,
          };
        }

        clickElement(accountTypeCard);
        return {
          success: true,
          message: `Selected ${action.value} for ${action.field}.`,
          waitForNextPage: false,
          waitAfterMs: 350,
        };
      }

      if (
        action.field === "account" ||
        action.field === "from account" ||
        action.field === "to account"
      ) {
        // Try to find the option directly first — on pages where account
        // cards are already visible (e.g. the withdrawal page), there is no
        // dropdown to open, and clicking a "trigger" here would instead
        // fall back to a sitewide fuzzy search that can match an unrelated
        // sidebar/header nav link containing the word "account" and
        // navigate away from the page entirely.
        let accountOption = findAccountOptionElement(action.value);

        if (!accountOption && !action.triggerClicked) {
          const trigger = findSelectionTrigger(action.field);
          if (trigger) {
            clickElement(trigger);
          }

          accountOption = findAccountOptionElement(action.value);

          if (!accountOption) {
            const nextAttempt = trigger ? createRetryAction(action) : null;
            if (nextAttempt) {
              return {
                success: true,
                message: `Opening ${action.field} options.`,
                waitForNextPage: false,
                waitAfterMs: 250,
                retryAction: { ...nextAttempt, triggerClicked: true },
              };
            }
          }
        }

        if (!accountOption) {
          return {
            success: false,
            message: `I could not find ${action.value} for ${action.field}.`,
            waitForNextPage: false,
          };
        }

        clickElement(accountOption);
        return {
          success: true,
          message: `Selected ${action.value} for ${action.field}.`,
          waitForNextPage: false,
          waitAfterMs: 300,
        };
      }

      const nativeControl = findFieldControl(action.field);
      if (nativeControl instanceof HTMLSelectElement) {
        const matchingOption = Array.from(nativeControl.options).find(
          (option) => textMatchesTarget(option.text, action.value),
        );

        if (!matchingOption) {
          return {
            success: false,
            message: `I could not find ${action.value} in ${action.field}.`,
            waitForNextPage: false,
          };
        }

        nativeControl.focus();
        setNativeValue(nativeControl, matchingOption.value);
        return {
          success: true,
          message: `Selected ${action.value} for ${action.field}.`,
          waitForNextPage: false,
          waitAfterMs: 180,
        };
      }

      // Try to find the option directly first (it may already be visible on
      // the page), before falling back to clicking a trigger to reveal a
      // collapsed dropdown — clicking a trigger unconditionally risks a
      // sitewide fuzzy match landing on an unrelated element.
      let optionButton =
        findScopedSelectOptionElement(action.field, action.value) ||
        findSelectOptionElement(action.value);
      let trigger: HTMLElement | null = null;

      if (!optionButton && !action.triggerClicked) {
        trigger = findSelectionTrigger(action.field);
        if (trigger) {
          clickElement(trigger);
        }

        optionButton =
          findScopedSelectOptionElement(action.field, action.value) ||
          findSelectOptionElement(action.value);
      }

      if (!optionButton) {
        const nextAttempt = trigger ? createRetryAction(action) : null;
        if (nextAttempt) {
          return {
            success: true,
            message: `Opening ${action.field} options.`,
            waitForNextPage: false,
            waitAfterMs: 250,
            retryAction: { ...nextAttempt, triggerClicked: true },
          };
        }

        return {
          success: false,
          message: `I could not find ${action.value} for ${action.field}.`,
          waitForNextPage: false,
        };
      }

      clickElement(optionButton);
      return {
        success: true,
        message: `Selected ${action.value} for ${action.field}.`,
        waitForNextPage: false,
        waitAfterMs: 300,
      };
    }

    return {
      success: false,
      message: "I could not complete that action.",
      waitForNextPage: false,
    };
  }

  async function runPendingActions() {
    while (pendingActionsRef.current.length > 0) {
      const nextAction = pendingActionsRef.current.shift();
      if (!nextAction) {
        break;
      }

      const result = await executeVoiceAction(nextAction);
      pendingActionMessagesRef.current.push(result.message);

      if (result.retryAction) {
        pendingActionsRef.current.unshift(result.retryAction);
      }

      if (!result.success) {
        const failureMessage = pendingActionMessagesRef.current.join(" ");
        appendMessage("assistant", failureMessage);
        setStatus(failureMessage);
        speak(failureMessage);
        pendingActionsRef.current = [];
        pendingActionMessagesRef.current = [];
        return;
      }

      if (result.waitForNextPage) {
        if (pendingActionsRef.current.length > 0) {
          schedulePendingActions(900);
        }
        return;
      }

      if (
        result.waitAfterMs &&
        result.waitAfterMs > 0 &&
        pendingActionsRef.current.length > 0
      ) {
        schedulePendingActions(result.waitAfterMs);
        return;
      }
    }

    if (pendingActionMessagesRef.current.length > 0) {
      const successMessage = pendingActionMessagesRef.current.join(" ");
      appendMessage("assistant", successMessage);
      setStatus(successMessage);
      speak(successMessage);
      pendingActionMessagesRef.current = [];
      closeAssistantPanel();
    }
  }

  async function submitPrompt(prompt: string) {
    const actionPrompt = normalizePromptText(prompt);
    const implicitNavigateAction = extractImplicitNavigateAction(
      prompt,
      location.pathname,
    );
    const voiceActions = implicitNavigateAction
      ? [implicitNavigateAction]
      : hasActionIntent(actionPrompt)
        ? parseVoiceCommandActions(prompt, location.pathname)
        : [];

    if (voiceActions.length > 0) {
      appendMessage("user", prompt.trim());
      setHeard(prompt.trim());
      setStatus(copy.ui.reply);
      pendingActionsRef.current = voiceActions;
      pendingActionMessagesRef.current = [];
      await runPendingActions();
      return;
    }

    const { displayPrompt, requestPrompt } = optimizeAssistantPrompt(
      prompt,
      language,
    );
    if (!requestPrompt) return;

    appendMessage("user", displayPrompt);
    setHeard(displayPrompt);
    setLoading(true);
    setStatus(copy.ui.reply);

    try {
      const result = await sendAssistantMessage({
        message: requestPrompt,
        language,
        history: buildHistory(requestPrompt),
      });

      setContext(result.context);
      setLastSentiment(result.sentiment || null);
      setSuggestions(
        result.suggestions.length
          ? result.suggestions
          : DEFAULT_SUGGESTIONS[language],
      );
      appendMessage("assistant", result.reply);
      setStatus(copy.statusReady);
      speak(result.reply);

      if (result.navigation?.route) {
        queueNavigation(
          result.navigation.route,
          result.navigation.label || getRouteLabel(result.navigation.route),
          900,
        );
      }

      if (result.actions?.length) {
        pendingActionsRef.current = result.actions as VoiceCommandAction[];
        pendingActionMessagesRef.current = [];
        schedulePendingActions(result.navigation?.route ? 900 : 0);
      }
    } catch (error) {
      console.error("Assistant request failed:", error);
      appendMessage("assistant", copy.dataError);
      setStatus(copy.dataError);
      speak(copy.dataError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const pathChanged = lastPathRef.current !== location.pathname;
    lastPathRef.current = location.pathname;

    if (!pathChanged) {
      return;
    }

    closeAssistantPanel();

    const pendingNavigation = pendingNavigationRef.current;
    if (
      pendingNavigation &&
      normalizePromptText(pendingNavigation.route) ===
        normalizePromptText(location.pathname)
    ) {
      const confirmationMessage = `Opened ${pendingNavigation.label}.`;
      pendingNavigationRef.current = null;

      if (pendingActionsRef.current.length > 0) {
        pendingActionMessagesRef.current.push(confirmationMessage);
      } else {
        appendMessage("assistant", confirmationMessage);
        setStatus(confirmationMessage);
        speak(confirmationMessage);
      }
    }

    if (pendingActionsRef.current.length > 0) {
      schedulePendingActions(550);
    }
  }, [location.pathname]);

  function handleTextSubmit() {
    const nextPrompt = textInput.trim();
    if (!nextPrompt) return;

    void submitPrompt(nextPrompt);
    setTextInput("");
  }

  function startListening() {
    if (!supported) {
      setStatus(copy.unsupported);
      appendMessage("assistant", copy.unsupported);
      speak(copy.unsupported);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onstart = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.abort?.();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setStatus(copy.listening);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      setHeard(transcript);
      void submitPrompt(transcript);
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
      setListening(false);
      setStatus(copy.voiceError);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setStatus(copy.ready);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function handleVoiceChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextVoice =
      voices.find((voice) => voice.name === event.target.value) || null;
    setSelectedVoice(nextVoice);

    if (nextVoice) {
      sessionStorage.setItem("assistantVoice", nextVoice.name);
    }
  }

  function handleLanguageSelection(nextLanguage: AssistantLanguage) {
    setLanguage(nextLanguage);
    sessionStorage.setItem("assistantLang", nextLanguage);

    const nextVoice = getPreferredVoice(voices, nextLanguage, null);
    setSelectedVoice(nextVoice);

    if (nextVoice) {
      sessionStorage.setItem("assistantVoice", nextVoice.name);
    }
  }

  return (
    <>
      {/* z-[9000]+ - deliberately above every modal in the app (the highest
          found elsewhere is Deposit's z-[999]) so the assistant trigger stays
          clickable no matter what popup is open. Kept below Toast's
          z-[9999] so alerts still surface above the assistant when both are
          up. Previously this sat at z-50: any modal with a higher z-index
          (like Deposit's full-screen backdrop) painted over the same screen
          position and silently absorbed the click - the button was still
          visible in the dark theme's near-black overlay, but hit-tested to
          the modal's own onClick={onClose} instead of opening the assistant,
          so tapping "voice" while a popup was open just closed the popup. */}
      <div data-voice-ui-root="true" className="fixed bottom-5 right-5 z-[9000]">
        <style>{`
          @keyframes navigator-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes navigator-ring {
            0% { transform: scale(0.9); opacity: 0.7; }
            100% { transform: scale(1.35); opacity: 0; }
          }
          @keyframes navigator-scan {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(120%); }
          }
          @keyframes thinking-dot-bounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
            30% { transform: translateY(-3px); opacity: 1; }
          }
          .thinking-dot { animation: thinking-dot-bounce 1s ease-in-out infinite; }
          .navigator-float { animation: navigator-float 3s ease-in-out infinite; }
          .navigator-ring {
            position: absolute;
            inset: -8px;
            border-radius: 9999px;
            border: 1px solid rgba(92, 224, 230, 0.4);
            animation: navigator-ring 1.8s ease-out infinite;
          }
          .navigator-scan::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
            animation: navigator-scan 2.6s linear infinite;
          }
        `}</style>

        {!expanded && (
          <button
            onClick={openAssistant}
            className="group relative h-16 w-16 overflow-hidden rounded-[22px] border border-accent/30 bg-surface-strong text-heading shadow-[0_18px_50px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(8,145,178,0.32)]"
            title="Open Private CRM AI"
          >
            <span className="navigator-ring" />
            <span
              className="navigator-ring"
              style={{ animationDelay: "0.9s" }}
            />
            <span className="navigator-scan absolute inset-0 rounded-[22px]" />
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--accent-glow),transparent_55%)] bg-surface-strong" />
            <span className="relative z-10 flex h-full w-full items-center justify-center">
              <Mic
                className={`h-7 w-7 ${
                  listening ? "text-rose-700 dark:text-rose-300" : "text-accent"
                } navigator-float`}
              />
            </span>
          </button>
        )}

        {expanded
          ? createPortal(
              <div data-voice-ui-root="true">
                <div className="fixed inset-0 z-[9001] bg-black/50 backdrop-blur-md" />
                <div className="fixed inset-0 z-[9002] overflow-y-auto p-3 sm:p-4">
                  <div className="flex min-h-full items-start justify-center">
                    <div className="my-3 w-full max-w-5xl overflow-hidden rounded-[28px] border border-accent/20 bg-background shadow-[0_20px_70px_rgba(2,6,23,0.68)] sm:my-5">
                      <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,var(--accent-soft),transparent_36%),radial-gradient(circle_at_top_right,var(--accent-soft),transparent_24%)] px-4 py-4 sm:px-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                              <Bot className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.28em] text-accent/70">
                                Backend CRM Assistant
                              </p>
                              <h2 className="mt-1 text-base font-semibold text-heading sm:text-lg">
                                {copy.title}
                              </h2>
                              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-subtle sm:text-xs">
                                {copy.crmOnly}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowSettings((value) => !value)}
                              className={`rounded-xl border p-2 text-heading transition ${
                                showSettings
                                  ? "border-accent/40 bg-accent/10"
                                  : "border-border bg-surface-strong/5 hover:border-accent/35 hover:bg-accent/10"
                              }`}
                              title="Settings"
                            >
                              <Settings size={16} />
                            </button>
                            <button
                              onClick={() => setExpanded(false)}
                              className="rounded-xl border border-border bg-surface-strong/5 p-2 text-heading transition hover:border-rose-300/35 hover:bg-rose-400/10"
                              title="Close"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.3fr)_300px]">
                        <div className="flex flex-col overflow-hidden rounded-[30px] border border-border bg-surface-strong shadow-[0_28px_90px_rgba(2,6,23,0.42)]">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-strong/[0.03] px-4 py-3 sm:px-5">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                                <Bot className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-heading">
                                  {copy.title}
                                </p>
                                <p className="truncate text-[12px] text-subtle">
                                  {copy.crmOnly}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                  loading
                                    ? "bg-amber-300/12 text-amber-100"
                                    : listening
                                      ? "bg-rose-300/12 text-rose-100"
                                      : "bg-emerald-300/12 text-emerald-100"
                                }`}
                              >
                                {status || copy.ready}
                              </span>

                              {heard && (
                                <div className="hidden max-w-[260px] truncate rounded-full border border-accent/15 bg-accent/8 px-2.5 py-1 text-[11px] text-accent lg:block">
                                  <span className="mr-1 text-accent/70">
                                    {copy.ui.asked}:
                                  </span>
                                  {heard}
                                </div>
                              )}

                              {lastSentiment && (
                                <span
                                  className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] xl:inline-flex ${SENTIMENT_BADGE_STYLES[lastSentiment.label] || SENTIMENT_BADGE_STYLES.neutral}`}
                                  title={`Tone: ${lastSentiment.recommendedTone}`}
                                >
                                  {lastSentiment.label}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="overflow-y-auto bg-[radial-gradient(circle_at_top,var(--accent-soft),transparent_32%)] px-3 py-4 sm:px-4 max-h-[38vh] min-h-[220px] sm:max-h-[42vh] lg:max-h-[48vh]">
                            <div className="mx-auto flex max-w-4xl flex-col gap-3">
                              {heard && (
                                <div className="rounded-full border border-accent/15 bg-accent/8 px-3 py-1.5 text-[11px] text-accent lg:hidden">
                                  <span className="mr-1 text-accent/70">
                                    {copy.ui.asked}:
                                  </span>
                                  {heard}
                                </div>
                              )}

                              {lastSentiment && (
                                <div
                                  className={`self-start rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] xl:hidden ${SENTIMENT_BADGE_STYLES[lastSentiment.label] || SENTIMENT_BADGE_STYLES.neutral}`}
                                >
                                  {lastSentiment.label}
                                </div>
                              )}

                              <div className="self-center rounded-full border border-border bg-surface-strong/[0.04] px-3 py-1 text-[11px] text-subtle">
                                {copy.ui.messages}
                              </div>

                              <div className="space-y-2">
                                {messages.map((message) => {
                                  const alreadyAnimated =
                                    animatedMessageIdsRef.current.has(
                                      message.id,
                                    );

                                  return (
                                    <div
                                      key={message.id}
                                      className={`flex flex-col ${
                                        message.role === "user"
                                          ? "items-end"
                                          : "items-start"
                                      }`}
                                    >
                                      <div
                                        className={`max-w-[90%] rounded-[22px] px-3.5 py-2.5 text-[13px] leading-5 shadow-[0_12px_36px_rgba(2,6,23,0.2)] sm:max-w-[80%] ${
                                          message.role === "user"
                                            ? "rounded-br-md bg-linear-to-br from-accent to-accent-hover text-heading"
                                            : "rounded-bl-md border border-accent/12 bg-surface-strong text-heading"
                                        }`}
                                      >
                                        {message.role === "assistant" ? (
                                          <AssistantTypewriter
                                            id={message.id}
                                            text={message.text}
                                            animate={!alreadyAnimated}
                                            onDone={() =>
                                              animatedMessageIdsRef.current.add(
                                                message.id,
                                              )
                                            }
                                          />
                                        ) : (
                                          message.text
                                        )}
                                      </div>
                                      <div
                                        className={`mt-1 flex items-center gap-1.5 px-1 text-[10px] text-subtle ${
                                          message.role === "user"
                                            ? "flex-row-reverse"
                                            : ""
                                        }`}
                                      >
                                        <span>
                                          {formatMessageTime(
                                            message.timestamp,
                                          )}
                                        </span>
                                        {message.role === "assistant" && (
                                          <CopyMessageButton
                                            text={message.text}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                {loading && (
                                  <div className="flex justify-start">
                                    <div className="inline-flex items-center gap-2 rounded-[20px] rounded-bl-md border border-accent/15 bg-surface-strong px-3 py-2.5 text-[13px] text-heading">
                                      <Bot className="h-4 w-4 text-accent" />
                                      <ThinkingDots />
                                    </div>
                                  </div>
                                )}

                                <div ref={chatEndRef} />
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-border bg-surface-strong p-3 sm:p-4">
                            <div className="mx-auto max-w-4xl">
                              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200/80">
                                <Sparkles className="h-4 w-4" />
                                {copy.ui.suggestions}
                              </div>

                              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                                {suggestions.map((suggestion) => (
                                  <button
                                    key={suggestion}
                                    onClick={() => {
                                      setTextInput("");
                                      void submitPrompt(suggestion);
                                    }}
                                    className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface-strong/[0.05] px-3 py-2 text-left text-[12px] leading-5 text-heading transition hover:border-accent/25 hover:bg-accent/8"
                                  >
                                    <span>{suggestion}</span>
                                    <ChevronRight className="h-3.5 w-3.5 text-subtle" />
                                  </button>
                                ))}
                              </div>

                              <div className="rounded-[26px] border border-accent/12 bg-surface-strong p-2.5 shadow-[0_18px_50px_rgba(2,6,23,0.35)]">
                                <div className="flex items-end gap-2">
                                  <button
                                    onClick={startListening}
                                    disabled={listening || loading}
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-heading transition ${
                                      listening
                                        ? "bg-rose-500/90"
                                        : loading
                                          ? "bg-slate-700"
                                          : "bg-linear-to-br from-accent to-accent-hover hover:brightness-110"
                                    }`}
                                    title={
                                      listening ? copy.listening : copy.speak
                                    }
                                  >
                                    {loading || listening ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Volume2 className="h-4 w-4" />
                                    )}
                                  </button>

                                  <textarea
                                    value={textInput}
                                    onChange={(event) =>
                                      setTextInput(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                      if (
                                        event.key === "Enter" &&
                                        !event.shiftKey
                                      ) {
                                        event.preventDefault();
                                        handleTextSubmit();
                                      }
                                    }}
                                    placeholder={copy.placeholder}
                                    rows={1}
                                    className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-2 py-2 text-sm text-heading outline-none transition placeholder:text-subtle"
                                  />

                                  <button
                                    onClick={handleTextSubmit}
                                    disabled={!textInput.trim() || loading}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-40"
                                    title="Send"
                                  >
                                    <Send className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {showSettings && (
                            <div className="rounded-[24px] border border-accent/15 bg-accent/5 p-3.5">
                              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-heading">
                                <Settings className="h-4 w-4 text-accent" />
                                {copy.ui.settings}
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                {LANGUAGE_OPTIONS.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() =>
                                      handleLanguageSelection(option.value)
                                    }
                                    className={`rounded-[18px] border px-3 py-2.5 text-left transition ${
                                      language === option.value
                                        ? "border-accent/45 bg-accent/12"
                                        : "border-border bg-surface-strong/5 hover:border-accent/25 hover:bg-accent/8"
                                    }`}
                                  >
                                    <div className="text-sm font-semibold text-heading">
                                      {option.shortLabel}
                                    </div>
                                    <div className="mt-1 text-xs text-subtle">
                                      {option.label}
                                    </div>
                                  </button>
                                ))}
                              </div>

                              <div className="mt-3 rounded-[18px] border border-border bg-surface-strong p-3">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-subtle">
                                  {copy.ui.selectedLocale}
                                </p>
                                <p className="mt-1 text-sm font-medium text-heading">
                                  {selectedLanguageOption.label}
                                </p>
                                <p className="mt-1 text-xs text-subtle">
                                  {selectedLanguageOption.helper}
                                </p>
                              </div>

                              <label className="mt-4 block text-xs font-medium text-subtle">
                                {copy.ui.preferredVoice}
                                <select
                                  className="mt-1.5 w-full rounded-[16px] border border-border bg-surface-strong px-3 py-2 text-sm text-heading outline-none transition focus:border-accent/40"
                                  value={selectedVoice?.name || ""}
                                  onChange={handleVoiceChange}
                                >
                                  {filteredVoices.map((voice) => (
                                    <option key={voice.name} value={voice.name}>
                                      {voice.name} ({voice.lang})
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <p className="mt-2 text-xs text-subtle">
                                Female voice preference is applied automatically
                                when your browser or operating system provides
                                one for the selected language.
                              </p>
                            </div>
                          )}

                          <div className="rounded-[24px] border border-border bg-surface-strong/5 p-3.5">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-subtle">
                              {copy.ui.snapshot}
                            </p>

                            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                              <div className="rounded-[18px] border border-border bg-surface p-3">
                                <div className="text-xs text-subtle">
                                  {copy.ui.currentBalance}
                                </div>
                                <div className="mt-1 text-lg font-semibold text-heading">
                                  {formatMoney(context?.overview.totalBalance)}
                                </div>
                              </div>

                              <div className="rounded-[18px] border border-border bg-surface p-3">
                                <div className="text-xs text-subtle">
                                  {copy.ui.totalAccounts}
                                </div>
                                <div className="mt-1 text-lg font-semibold text-heading">
                                  {context?.accounts.total ?? 0}
                                </div>
                              </div>

                              <div className="rounded-[18px] border border-border bg-surface p-3">
                                <div className="text-xs text-subtle">
                                  {copy.ui.unreadAlerts}
                                </div>
                                <div className="mt-1 text-lg font-semibold text-heading">
                                  {context?.notifications.unreadCount ?? 0}
                                </div>
                              </div>

                              <div className="rounded-[18px] border border-border bg-surface p-3">
                                <div className="text-xs text-subtle">
                                  {copy.ui.openTickets}
                                </div>
                                <div className="mt-1 text-lg font-semibold text-heading">
                                  {context?.tickets.openCount ?? 0}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 rounded-[18px] border border-accent/12 bg-accent/6 p-3 text-xs leading-6 text-heading">
                              <span className="font-semibold text-heading">
                                {context?.profile.fullName || "Client"}
                              </span>
                              {context?.profile.email
                                ? ` • ${context.profile.email}`
                                : ""}
                              {context?.profile.kycStatus
                                ? ` • KYC ${context.profile.kycStatus}`
                                : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null}
      </div>
    </>
  );
}
