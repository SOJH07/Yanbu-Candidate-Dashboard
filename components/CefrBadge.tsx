
import React from 'react';

interface CefrBadgeProps {
    cefr: string;
}

const StarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 -ml-0.5 mr-0.5 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const CefrBadge: React.FC<CefrBadgeProps> = ({ cefr }) => {
    let baseClasses = "text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1";
    let specificClasses = "";
    let icon = null;

    switch (cefr?.toUpperCase()) {
        case 'A1':
        case 'A2':
            specificClasses = "bg-slate-gray/20 text-slate-gray dark:bg-slate-gray/20 dark:text-slate-gray";
            break;
        case 'B1':
            specificClasses = "bg-celadon-green/50 text-dark-green dark:bg-celadon-green/20 dark:text-celadon-green";
            break;
        case 'B2':
            specificClasses = "bg-celadon-green text-dark-green dark:bg-celadon-green/30 dark:text-celadon-green";
            break;
        case 'C1':
            specificClasses = "bg-primary-300 text-primary-900 dark:bg-primary-900 dark:text-primary-200";
            icon = <StarIcon />;
            break;
        case 'C2':
            specificClasses = "bg-primary-400 text-primary-950 dark:bg-primary-800 dark:text-primary-100";
            icon = <StarIcon />;
            break;
        default:
            specificClasses = "bg-slate-gray/20 text-slate-gray dark:bg-slate-gray/20 dark:text-slate-gray";
    }

    return (
        <span className={`${baseClasses} ${specificClasses}`}>
            {icon}
            <span className="leading-none">{cefr}</span>
        </span>
    );
};

export default CefrBadge;