import { normalizeAssetUrl } from "@/utils/assetUrl";

interface QrCodeDisplayProps {
    qrCode?: string;
    paymentLink?: string;
    title?: string;
    fallbackValue?: string;
}
const QR_FALLBACK_BASE = "https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=";

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
    qrCode,
    paymentLink,
    title = "QR Code",
    fallbackValue,
}) => {
    const fallbackQrValue = paymentLink || fallbackValue;
    const generatedQrUrl = fallbackQrValue
        ? `${QR_FALLBACK_BASE}${encodeURIComponent(fallbackQrValue)}`
        : "";
    const imageSrc = qrCode ? normalizeAssetUrl(qrCode) || generatedQrUrl : generatedQrUrl;

    return (
        <div className="text-center">
            {imageSrc ? (
                <img
                    src={imageSrc}
                    alt={title}
                    className="mx-auto h-32 w-32 rounded-lg border border-border bg-surface-strong/[0.03] object-contain p-2 sm:h-40 sm:w-40"
                    onError={(e) => {
                        if (generatedQrUrl && e.currentTarget.src !== generatedQrUrl) {
                            e.currentTarget.src = generatedQrUrl;
                            return;
                        }

                        e.currentTarget.style.display = "none";
                    }}
                />
            ) : (
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg border border-border bg-surface-strong/[0.03] sm:h-40 sm:w-40">
                    <span className="text-xs text-subtle">No QR Code</span>
                </div>
            )}
            <div className="mt-3 space-y-2">
                {imageSrc && (
                    <a
                        href={imageSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs font-semibold text-accent underline hover:text-accent"
                    >
                        View Full QR Code
                    </a>
                )}
                {paymentLink && (
                    <a
                        href={paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent"
                    >
                        Open Payment Link
                    </a>
                )}
            </div>
        </div>
    );
};
