import { ArrowLeft, Shield, AlertTriangle, FileText } from "lucide-react";

export default function TermsConditions() {
  return (
    <div className="client-theme-bg relative min-h-screen overflow-hidden p-4 md:p-8">
      {/* Animated background orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#4facfe] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-[#00f2fe] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#f093fb] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <div className="client-theme-surface rounded-3xl p-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FileText className="w-10 h-10 text-heading" />
            </div>
            <h1 className="text-4xl font-bold text-heading">
              Terms and Conditions
            </h1>
            <h2 className="text-xl font-semibold text-heading/90">
              TEST Copy Trading Service Agreement
            </h2>
          </div>
        </div>

        {/* Important Notice */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30 p-5 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-1" />
            <div>
              <p className="text-amber-700 dark:text-amber-300 font-semibold mb-1">
                Important Notice
              </p>
              <p className="text-heading/90 text-sm">
                Please read these terms carefully before using the TEST Copy
                service. By clicking <strong>"Start Copying"</strong>, you agree
                to these terms and conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="client-theme-surface space-y-6 rounded-2xl p-8">
          <section>
            <h3 className="text-xl font-semibold text-heading mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-700 dark:text-blue-300" />
              Service Overview
            </h3>
            <p className="text-heading/80 leading-relaxed">
              TEST Copy (hereinafter referred to as the "Service") is a service
              that allows traders (hereinafter referred to as "Copiers") to copy
              trades from other traders (hereinafter referred to as "Masters").
              This service is activated by clicking the "Start Copying" button.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-heading mb-3">
              1. Requirements for Copiers
            </h3>
            <ul className="space-y-2 text-heading/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-700 dark:text-blue-300 mt-1">•</span>
                <span>
                  Registration and login as a customer on the TEST website
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 dark:text-blue-300 mt-1">•</span>
                <span>Depositing funds into the wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 dark:text-blue-300 mt-1">•</span>
                <span>Starting the copying process</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-heading mb-3">
              2. Copier Rights
            </h3>
            <p className="text-heading/80 mb-2">
              The copier is entitled to the following:
            </p>
            <ul className="space-y-2 text-heading/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-700 dark:text-blue-300 mt-1">•</span>
                <span>
                  Copy any number of masters (subscriptions listed in copy area)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 dark:text-blue-300 mt-1">•</span>
                <span>Manually close copied trades anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 dark:text-blue-300 mt-1">•</span>
                <span>
                  Terminate a Master's subscription via "Stop Copying"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 dark:text-blue-300 mt-1">•</span>
                <span>Specify copy share size per Master</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 dark:text-blue-300 mt-1">•</span>
                <span>
                  Add support funds to protect against market fluctuations
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-heading mb-3">
              3. Process for Opening Copied Trades
            </h3>
            <p className="text-heading/80 leading-relaxed">
              Orders are copied from the Master to the Copier in real-time.
              Execution prices may differ based on market conditions and the
              number of copiers following a Master. Stop-loss and take-profit
              orders are also copied.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-heading mb-3">
              4. Trading Restrictions
            </h3>
            <p className="text-heading/80 leading-relaxed">
              The minimum trade size is 0.01 lot, and the maximum is 100 lots.
              Orders are rounded to the nearest 0.01 lot.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-heading mb-3">
              8. Commission Structure
            </h3>
            <p className="text-heading/80 leading-relaxed">
              Masters may charge commissions ranging from 0% to 50% of Copier
              profits. Commissions are paid weekly.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-heading mb-3">
              13. Service Fee
            </h3>
            <p className="text-heading/80 leading-relaxed">
              Copier service fee is included as a spread surcharge of 0.2 pips.
              Master Traders pay 12% of the commissions they receive.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-heading mb-3">
              14. Copy Trading Bonus
            </h3>
            <p className="text-heading/80 leading-relaxed">
              A 50% bonus is provided on funds invested when starting to copy a
              Master. The bonus cannot be withdrawn or reused once lost.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-heading mb-3">
              15. Free Trial
            </h3>
            <p className="text-heading/80 leading-relaxed">
              Master Traders can offer free trials. Once expired, normal fees
              apply to the Copier subscription.
            </p>
          </section>
        </div>

        {/* Risk Warning */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl border border-red-500/30 p-6 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-700 dark:text-red-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-red-700 dark:text-red-300 font-semibold mb-2">Risk Warning</h3>
              <p className="text-heading/90">
                Copy trading involves significant risk. Past performance is not
                indicative of future results. Consider your objectives,
                experience, and risk appetite carefully before engaging in copy
                trading.
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="client-theme-surface rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-heading mb-3">
            Contact & Support
          </h3>
          <p className="text-heading/80">
            For questions, please contact our support team. TEST reserves the
            right to update these Terms and Conditions without prior notice.
          </p>
        </div>

        {/* Footer */}
        <div className="client-theme-surface rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-heading/60 text-sm">
              Last updated: September 10, 2025
            </p>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-strong text-indigo-600 font-bold hover:bg-surface-strong/95 shadow-lg transition">
              <ArrowLeft className="w-4 h-4" />
              Back to Masters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
