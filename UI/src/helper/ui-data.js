import { latest, nintiesCar, retroCar } from '../assets';
import { formatDateToDDMMYYYY } from './date';

export const cars = [
    { label: '1950–1969', from: '1950-01-01', to: '1969-12-31', imgSrc: retroCar },
    { label: '1970–1989', from: '1970-01-01', to: '1989-12-31', imgSrc: nintiesCar },
    { label: '1990–today', from: '1990-01-01', to: formatDateToDDMMYYYY(new Date()), imgSrc: latest },
];

export const colors = [
    { color: '#22092C', label: 'Curious' },
    { color: '#3E3232', label: 'On edge' },
    { color: '#872341', label: 'Gritty' },
    { color: '#BE3144', label: 'Heartfelt' },
    { color: '#F05941', label: 'Adventurous' },
    { color: '#F4CE14', label: 'Upbeat' },
];
