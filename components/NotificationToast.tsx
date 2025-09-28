
import React, { useEffect, useState } from 'react';
import { Student, Translations } from '../types';

interface NotificationToastProps {
    notification: {
        id: number;
        title: string;
        message: string;
        student: Student;
    };
    onDismiss: () => void;
    onSelectStudent: (student: Student) => void;
    t: Translations;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss, onSelectStudent, t }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
        const timer = setTimeout(() => {
            handleDismiss();
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setShow(false);
        setTimeout(onDismiss, 400);
    };

    const handleViewClick = () => {
        onSelectStudent(notification.student);
        handleDismiss();
    };

    return (
        <div
            className={`
                max-w-sm w-full bg-white dark:bg-eerie-black-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
                transition-all duration-300 ease-in-out
                ${show ? 'transform opacity-100 translate-y-0 sm:translate-x-0' : 'transform opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2'}
            `}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <svg className="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-eerie-black dark:text-white">
                            {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-gray">
                            {notification.message}
                        </p>
                        <div className="mt-3 flex">
                            <button
                                onClick={handleViewClick}
                                className="bg-transparent text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                                {t.studentDetails}
                            </button>
                        </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={handleDismiss}
                            className="bg-white dark:bg-eerie-black-800 rounded-md inline-flex text-slate-gray hover:text-eerie-black dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;
