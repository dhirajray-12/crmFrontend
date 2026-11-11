export type TourLayout = "client" | "admin" | "superadmin";

export interface TourStepDefinition {
  selector: string;
  title: string;
  description: string;
  isLayoutStep?: boolean;
}

export interface TourDefinition {
  key: string;
  title: string;
  subtitle: string;
  accentFrom: string;
  accentTo: string;
  showLauncher?: boolean;
  layout: TourLayout;
  steps: TourStepDefinition[];
}

const layoutSteps = {
  client: [
    {
      selector: '[data-tour-anchor="client-sidebar"]',
      title: "Main menu",
      description:
        "Use this menu to move between dashboard, accounts, funding, copy trading, partner tools, and support without leaving the client area.",
    },
    {
      selector: '[data-tour-anchor="client-topbar"]',
      title: "Search, alerts, and profile",
      description:
        "This bar keeps search, notifications, quick account actions, and profile controls available from every client page.",
    },
  ],
  admin: [
    {
      selector: '[data-tour-anchor="admin-sidebar"]',
      title: "Admin menu",
      description:
        "This menu groups the admin workflows for approvals, client review, support operations, payments, and reporting.",
    },
    {
      selector: '[data-tour-anchor="admin-topbar"]',
      title: "Admin search and alerts",
      description:
        "Use the top bar for quick search, notification checks, and account-level admin actions while staying inside the current workflow.",
    },
  ],
  superadmin: [
    {
      selector: '[data-tour-anchor="superadmin-sidebar"]',
      title: "Platform menu",
      description:
        "This menu is reserved for platform-wide configuration and high-privilege administration areas.",
    },
    {
      selector: '[data-tour-anchor="superadmin-topbar"]',
      title: "Notifications and account access",
      description:
        "This header keeps global notifications and profile actions available while you work on platform settings.",
    },
  ],
} satisfies Record<"client" | "admin" | "superadmin", TourStepDefinition[]>;

const clientRouteMeta = {
  "/client/dashboard": {
    key: "client-dashboard",
    title: "Client Dashboard",
    subtitle: "Overview, live performance, and account activity in one place.",
    showLauncher: false,
    featureSteps: [
      {
        selector: '[data-tour-anchor="dashboard-welcome"]',
        title: "Welcome panel",
        description:
          "This opening block gives you the live session summary before you move into balances and activity.",
      },
      {
        selector: '[data-tour-anchor="dashboard-server-name"]',
        title: "Server name",
        description:
          "This shows the backend server or brand environment currently driving your client session.",
      },
      {
        selector: '[data-tour-anchor="dashboard-operator"]',
        title: "Operator name",
        description:
          "Your logged-in identity is surfaced here so account activity is tied to the correct client session.",
      },
      {
        selector: '[data-tour-anchor="dashboard-total-balance"]',
        title: "Total balance",
        description:
          "This metric is the quickest balance health check across your linked trading accounts.",
      },
      {
        selector: '[data-tour-anchor="dashboard-mt5-accounts"]',
        title: "MT5 accounts",
        description:
          "Use this card to confirm how many active trading accounts are contributing to the dashboard totals.",
      },
      {
        selector: '[data-tour-anchor="dashboard-activity-chart"]',
        title: "Activity chart",
        description:
          "This chart tracks account movement over time so you can spot changes beyond headline balance numbers.",
      },
      {
        selector: '[data-tour-anchor="dashboard-transactions"]',
        title: "Recent activity",
        description:
          "Track recent movements here, then branch into deposits, withdrawals, or full transaction history when you need detail.",
      },
    ],
  },
  "/client/open-account": {
    key: "client-open-account",
    title: "Create Trading Account",
    subtitle: "Pick an account type, configure leverage, and generate the trading credentials for the new account.",
    featureSteps: [
      {
        selector: '[data-tour-anchor="open-account-types"]',
        title: "Choose account type",
        description:
          "Start here by selecting the trading setup you want to open, then continue into the configuration flow for that specific account.",
      },
      {
        selector: '[data-tour-anchor="open-account-config"]',
        title: "Account configuration",
        description:
          "After selection, this section handles leverage, server assignment, optional custom credentials, and the final create action.",
      },
    ],
  },
  "/client/account-list": {
    key: "client-account-list",
    title: "Live Accounts",
    subtitle: "Review balances, inspect account details, and open deposit or withdrawal actions from the account list.",
    featureSteps: [
      {
        selector: '[data-tour-anchor="account-list-summary"]',
        title: "Account summary",
        description:
          "These cards summarize the total balance, equity, and profit movement across every account currently linked to the client.",
      },
      {
        selector: '[data-tour-anchor="account-list-cards"]',
        title: "Account cards",
        description:
          "Each account card gives you funding shortcuts, password actions, and expandable transaction detail for that specific account.",
      },
    ],
  },
  "/client/trading-contest": {
    key: "client-trading-contest",
    title: "Trading Contest",
    subtitle: "Review contest standings, filter trade activity, and follow current performance inside the competition view.",
  },
  "/client/transfer": {
    key: "client-transfer",
    title: "Internal Transfers",
    subtitle: "Move balance between your own trading accounts and review the latest transfer activity in one place.",
    featureSteps: [
      {
        selector: '[data-tour-anchor="transfer-form"]',
        title: "Create transfer",
        description:
          "Choose the source account, destination account, and amount here to submit an internal balance transfer.",
      },
      {
        selector: '[data-tour-anchor="transfer-feed"]',
        title: "Recent transfers",
        description:
          "This section shows recent transfer entries, filter access, and export controls so internal balance movement is easy to audit.",
      },
    ],
  },
  "/client/deposit": {
    key: "client-deposit",
    title: "Recent Deposits",
    subtitle: "Review submitted funding requests and open a new deposit request directly from the action area on this page.",
    featureSteps: [
      {
        selector: '[data-tour-anchor="deposit-actions"]',
        title: "Create deposit request",
        description:
          "Use these actions to open filters or start a fresh deposit request without leaving the deposit history screen.",
      },
      {
        selector: '[data-tour-anchor="deposit-ledger"]',
        title: "Recent deposits list",
        description:
          "This list tracks submitted deposit requests, status updates, payment methods, and the latest funding activity across accounts.",
      },
    ],
  },
  "/client/withdrawal": {
    key: "client-withdrawal",
    title: "Withdrawal Queue",
    subtitle: "Open a withdrawal request, complete OTP verification, and track the latest outgoing requests from one page.",
    featureSteps: [
      {
        selector: '[data-tour-anchor="withdrawal-actions"]',
        title: "Start withdrawal",
        description:
          "Open filters here or launch the withdrawal form to begin a new payout request.",
      },
      {
        selector: '[data-tour-anchor="withdrawal-ledger"]',
        title: "Recent withdrawals",
        description:
          "Review approval status, available balance context, and the most recent withdrawal entries from this queue.",
      },
    ],
  },
  "/client/transfer-history": {
    key: "client-transfer-history",
    title: "Transaction Ledger",
    subtitle: "Search historical activity, filter the results, and export the visible transaction list when needed.",
    featureSteps: [
      {
        selector: '[data-tour-anchor="history-search"]',
        title: "Search and filters",
        description:
          "Refine the ledger here with keyword search and filters before moving through pages or exporting the current result set.",
      },
      {
        selector: '[data-tour-anchor="history-table"]',
        title: "Transaction results",
        description:
          "This table shows the filtered transaction results so status changes, movement, and timestamps can be reviewed quickly.",
      },
    ],
  },
  "/client/profile": {
    key: "client-profile",
    title: "Client Profile",
    subtitle: "Manage personal information, account details, and wallet settings from the profile workspace.",
  },
  "/client/partner/create": {
    key: "client-partner-create",
    title: "Create Partner Account",
    subtitle: "Set up a new partner or IB profile and review the activation details before submitting.",
  },
  "/client/partner/dashboard": {
    key: "client-partner-dashboard",
    title: "Partner Dashboard",
    subtitle: "Track partner performance, referral activity, and withdrawal history from the partner workspace.",
  },
  "/client/partner/commission": {
    key: "client-partner-commission",
    title: "IB Commission",
    subtitle: "Review commission performance, partner payouts, and earnings context for the current IB account.",
  },
  "/client/partner/withdrawal": {
    key: "client-partner-withdrawal",
    title: "IB Withdrawal",
    subtitle: "Submit or review partner withdrawal activity and monitor the current payout queue.",
  },
  "/client/copy/master": {
    key: "client-copy-master",
    title: "Master Accounts",
    subtitle: "Review available master accounts, performance details, and master-side copy trading configuration.",
  },
  "/client/copy/terms": {
    key: "client-copy-terms",
    title: "Copy Trading Terms",
    subtitle: "Read the copy trading terms and conditions before moving into copier or master setup.",
  },
  "/client/copy/copier": {
    key: "client-copy-copier",
    title: "Copier Setup",
    subtitle: "Configure how follower accounts copy trades and align the copier settings with the selected account.",
  },
  "/client/copy/rating": {
    key: "client-copy-rating",
    title: "Master Ratings",
    subtitle: "Compare rated masters, inspect performance metrics, and prepare a copy trading setup from the ranking view.",
  },
  "/client/platforms": {
    key: "client-platforms",
    title: "Trading Platforms",
    subtitle: "Browse supported trading platforms, review access details, and follow setup guidance from one page.",
  },
  "/client/refer": {
    key: "client-refer",
    title: "Refer a Friend",
    subtitle: "Share referral links, follow invite activity, and manage the referral flow from this page.",
  },
  "/client/support": {
    key: "client-support",
    title: "Support Inbox",
    subtitle: "Create tickets, follow replies, and manage open enquiry threads from the support workspace.",
  },
} satisfies Record<
  string,
  Omit<TourDefinition, "steps" | "accentFrom" | "accentTo" | "layout"> & {
    featureSteps?: TourStepDefinition[];
  }
>;

const adminRouteMeta = {
  "/admin/dashboard": {
    key: "admin-dashboard",
    title: "Admin Dashboard",
    subtitle: "Review platform performance, operational analytics, and the most important admin-side activity from one dashboard.",
    showLauncher: true,
    featureSteps: [
      {
        selector: '[data-tour-anchor="admin-dashboard-stats"]',
        title: "Performance summary",
        description:
          "These cards summarize the day’s performance so you can spot changes before moving into revenue or transaction detail.",
      },
      {
        selector: '[data-tour-anchor="admin-dashboard-analytics"]',
        title: "Revenue and activity panels",
        description:
          "Revenue analytics, recent transactions, and top-client visibility are grouped here for deeper operational review.",
      },
    ],
  },
  "/admin/withdrawals": {
    key: "admin-withdrawals",
    title: "Withdrawal Management",
    subtitle: "Review client withdrawal requests, verify payout details, and manage the outgoing approval flow.",
  },
  "/admin/kyc-verification": {
    key: "admin-kyc-verification",
    title: "KYC Verification",
    subtitle: "Inspect submitted identity documents and move verification cases through review and approval.",
  },
  "/admin/deposits": {
    key: "admin-deposits",
    title: "Deposit Management",
    subtitle: "Review incoming funding requests, confirm payment details, and manage deposit approval status.",
  },
  "/admin/client-page": {
    key: "admin-client-page",
    title: "Client List",
    subtitle: "Search clients, inspect linked accounts, and review profile context from the admin client directory.",
  },
  "/admin/add-payments": {
    key: "admin-add-payments",
    title: "Payment Methods",
    subtitle: "Configure and maintain the payment methods used for deposit and withdrawal operations.",
  },
  "/admin/admin-Copy-page": {
    key: "admin-copy",
    title: "Copy Trading Admin",
    subtitle: "Oversee copier activity, copy trading configuration, and operational checks from the admin side.",
  },
  "/admin/Admin-masters-page": {
    key: "admin-masters",
    title: "Master Accounts Admin",
    subtitle: "Manage master accounts, review performance, and control copy trading master-side settings.",
  },
  "/admin/Admin-rating-page": {
    key: "admin-rating",
    title: "Rating Admin",
    subtitle: "Review rated masters, inspect account-level detail, and manage rating-related setup flows.",
  },
  "/admin/Admin-transaction-page": {
    key: "admin-transactions",
    title: "Admin Transactions",
    subtitle: "Audit platform transaction history and inspect client activity streams from the admin ledger view.",
  },
  "/admin/Admin-customer-support": {
    key: "admin-customer-support",
    title: "Customer Support",
    subtitle: "Work support queues, respond to client tickets, and monitor conversation status from the support desk.",
  },
  "/admin/IB-Configuration": {
    key: "admin-ib-configuration",
    title: "IB Configuration",
    subtitle: "Control IB settings, thresholds, and rules that affect partner and commission operations.",
  },
  "/admin/IB-Withdrawals": {
    key: "admin-ib-withdrawals",
    title: "IB Withdrawals",
    subtitle: "Review IB withdrawal activity, payout status, and queue actions for partner withdrawals.",
  },
} satisfies Record<
  string,
  Omit<TourDefinition, "steps" | "accentFrom" | "accentTo" | "layout"> & {
    featureSteps?: TourStepDefinition[];
  }
>;

const superAdminRouteMeta = {
  "/superadmin/dashboard": {
    key: "superadmin-dashboard",
    title: "Super Admin Dashboard",
    subtitle: "Monitor high-level platform status and privileged administration activity from the super admin overview.",
    showLauncher: false,
  },
  "/superadmin/configuration": {
    key: "superadmin-configuration",
    title: "Super Admin Configuration",
    subtitle: "Review and adjust the system-wide configuration values that affect the full platform.",
  },
  "/superadmin/edit-admin-credentials": {
    key: "superadmin-edit-admin-credentials",
    title: "Edit Admin Credentials",
    subtitle: "Manage privileged admin credentials and other access-sensitive settings from a protected workspace.",
  },
} satisfies Record<
  string,
  Omit<TourDefinition, "steps" | "accentFrom" | "accentTo" | "layout"> & {
    featureSteps?: TourStepDefinition[];
  }
>;

function buildTours(
  layout: TourLayout,
  routes: Record<
    string,
    Omit<TourDefinition, "steps" | "accentFrom" | "accentTo" | "layout"> & {
      featureSteps?: TourStepDefinition[];
    }
  >,
  accentFrom: string,
  accentTo: string,
) {
  return Object.fromEntries(
    Object.entries(routes).map(([pathname, meta]) => [
      pathname,
      {
        key: meta.key,
        title: meta.title,
        subtitle: meta.subtitle,
        accentFrom,
        accentTo,
        showLauncher: meta.showLauncher,
        layout,
        steps: [
          ...layoutSteps[layout].map((step) => ({ ...step, isLayoutStep: true })),
          {
            selector: `[data-tour-page="${meta.key}"]`,
            title: meta.title,
            description: meta.subtitle,
          },
          ...(meta.featureSteps ?? []),
        ],
      } satisfies TourDefinition,
    ]),
  ) as Record<string, TourDefinition>;
}

export const tourDefinitions = {
  ...buildTours("client", clientRouteMeta, "from-sky-400", "to-cyan-300"),
  ...buildTours("admin", adminRouteMeta, "from-blue-500", "to-indigo-400"),
  ...buildTours(
    "superadmin",
    superAdminRouteMeta,
    "from-indigo-500",
    "to-violet-400",
  ),
};

export function getTourForPath(pathname: string) {
  return tourDefinitions[pathname] ?? null;
}

export function getTourPageKey(pathname: string) {
  return getTourForPath(pathname)?.key ?? "generic-page";
}

export function getTourShortcutLabel() {
  return "Press ? to open";
}
