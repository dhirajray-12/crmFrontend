interface AlertMessageProps {
    type: 'error' | 'success';
    message: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ type, message }) => {
    const styles = {
        error: 'border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200',
        success: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
    };

    return (
        <div className={`mb-4 rounded-2xl border p-4 text-sm shadow-inner ${styles[type]}`}>
            {message}
        </div>
    );
};
