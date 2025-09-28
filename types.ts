export interface Grade {
    subject: string;
    score: number;
}

export interface Student {
    firstName: string;
    lastName: string;
    id: string;
    cefr: string;
    grades: Grade[];
    average: number;
    status: 'Pass' | 'Fail';
    rank: number;
    englishScore: number;
    combinedAverage: number;
}

export type Language = 'en' | 'ar';

export interface Translations {
    [key: string]: any;
}

export type SortKey = keyof Pick<Student, 'firstName' | 'lastName' | 'cefr' | 'rank' | 'combinedAverage'> | 'id';

export interface ScheduleSlot {
  time: string;
  studentId?: string;
}

export interface RoomSchedule {
  roomName: string;
  slots: ScheduleSlot[];
}

export interface DaySchedule {
  dayName: string;
  allTimes: string[];
  breakTimes: string[];
  rooms: RoomSchedule[];
}
