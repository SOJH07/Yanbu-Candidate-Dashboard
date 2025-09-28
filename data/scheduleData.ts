import { DaySchedule, RoomSchedule, ScheduleSlot, Student } from '../types';
import { parseStudentData } from './studentData';

const students: Student[] = parseStudentData();
let studentIndex = 0;

const createRooms = (roomNames: string[], times: string[]): RoomSchedule[] => {
    // Initialize rooms with empty slots for all specified interview times
    const rooms: RoomSchedule[] = roomNames.map(name => ({
        roomName: name,
        slots: times.map(time => ({ time }))
    }));

    // Distribute students round-robin: fill one timeslot across all rooms, then the next, etc.
    // This ensures top candidates are spread out and all rooms are utilized.
    times.forEach(time => {
        roomNames.forEach(roomName => {
            if (studentIndex < students.length) {
                const room = rooms.find(r => r.roomName === roomName);
                if (room) {
                    const slot = room.slots.find(s => s.time === time);
                    if (slot) {
                       slot.studentId = students[studentIndex].id;
                       studentIndex++;
                    }
                }
            }
        });
    });

    return rooms;
};

const day1InterviewTimes = [
    '9:00', '9:20', '9:40', '10:00', '10:20', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40',
    '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40', '16:00', '16:20', '17:00'
];

const day1AllTimes = [
    '9:00', '9:20', '9:40', '10:00', '10:20', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40',
    '13:00',
    '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40', '16:00', '16:20', '17:00'
];

const day1Rooms = createRooms(['Room 1', 'Room 2', 'Room 3', 'Room 4'], day1InterviewTimes);

const day2InterviewTimes = [
    '8:00', '8:20', '8:40', '9:00',
    '9:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40',
    '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40', '16:00', '16:20', '16:40', '17:00'
];

const day2AllTimes = [
    '8:00', '8:20', '8:40', '9:00',
    '9:20',
    '9:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40',
    '13:00',
    '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40', '16:00', '16:20', '16:40', '17:00'
];

const day2Rooms = createRooms(['Room 1', 'Room 2', 'Room 3', 'Room 4'], day2InterviewTimes);


export const scheduleData: DaySchedule[] = [
    {
        dayName: 'Day 1 (29/Sep)',
        allTimes: day1AllTimes,
        breakTimes: ['13:00'],
        rooms: day1Rooms
    },
    {
        dayName: 'Day 2 (30/Sep)',
        allTimes: day2AllTimes,
        breakTimes: ['9:20', '13:00'],
        rooms: day2Rooms
    }
];