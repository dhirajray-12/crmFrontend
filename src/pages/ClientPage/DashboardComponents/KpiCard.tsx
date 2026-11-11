type KpiCardProps = {
  label: string;
  value: string;
  delta?: string;
  className?: string;
};

export default function KpiCard({
  label,
  value,
  delta,
  className = "",
}: KpiCardProps) {
  const getColor = () => {
    if (label.toLowerCase().includes("balance")) {
      return {
        from: "#FF75F9",
        to: "#3D46F5",
        text: "#ffffff",
        delta: "#00008B",
      };
    }
    if (label.toLowerCase().includes("deposit")) {
      return {
        from: "#DFDFB5",
        to: "#33DC46",
        text: "#ffffff",
        delta: "#14532d",
      };
    }
    if (label.toLowerCase().includes("withdrawal")) {
      return {
        from: "#FFFF96",
        to: "#EB6125",
        text: "#ffffff",
        delta: "#7f1d1d",
      };
    }
    if (!delta)
      return {
        from: "#49D6FF",
        to: "#4143F2",
        text: "#ffffff",
        delta: "#4b5563",
      };
    if (delta.includes("↑"))
      return {
        from: "#10B981",
        to: "#6EE7B7",
        text: "#ffffff",
        delta: "#065f46",
      };
    if (delta.includes("↓"))
      return {
        from: "#FCA5A5",
        to: "#EF4444",
        text: "#ffffff",
        delta: "#7f1d1d",
      };

    return {
      from: "#EC4ECB",
      to: "#ECBA4E",
      text: "#ffffff",
      delta: "#4b5563",
    };
  };

  const color = getColor();

  return (
    <div
      className={`rounded-xl py-12 px-8 flex flex-col justify-center items-start
                  hover:scale-105 hover:shadow-2xl transition-all duration-500 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
      }}
    >
      <div className="text-lg font-medium" style={{ color: color.text }}>
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold" style={{ color: color.text }}>
        {value}
      </div>
      {delta && (
        <div
          className="mt-2 text-lg font-semibold"
          style={{ color: color.delta }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
