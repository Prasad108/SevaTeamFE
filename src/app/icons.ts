// src/app/icons.ts

import { addIcons } from 'ionicons';
import { 
  home, 
  person, 
  settings, 
  addCircle, 
  trash, 
  arrowForward, 
  location, 
  arrowBackOutline,
  close,
  business,
  calendar,
  people,
  document,
  logOutOutline,      // Import log-out-outline icon
  peopleOutline,      // Import people-outline icon
  calendarOutline,    // Import calendar-outline icon
  checkmarkDoneOutline, // Import checkmark-done-outline icon
  addCircleOutline,
  eye,
  eyeOff,
  refresh,
  removeCircle,
  male,
  female,
} from 'ionicons/icons';

export function registerIcons() {
  addIcons({
    'home': home,
    'person': person,
    'settings': settings,
    'add-circle': addCircle,
    'trash': trash,
    'arrow-forward': arrowForward,
    'location': location,
    'arrow-back-outline': arrowBackOutline,
    'business': business,      // Register business icon
    'calendar': calendar,      // Register calendar icon
    'people': people,          // Register people icon
    'document': document,      // Register document icon
    'close': close,
    'log-out-outline': logOutOutline,         // Register log-out-outline icon
    'people-outline': peopleOutline,          // Register people-outline icon
    'calendar-outline': calendarOutline,      // Register calendar-outline icon
    'checkmark-done-outline': checkmarkDoneOutline, // Register checkmark-done-outline icon
    'add-circle-outline': addCircleOutline,
    'eye':eye,
    'eye-off' :eyeOff,
    'refresh': refresh,
    'remove-circle': removeCircle,
    'male': male,
    'female':female,
  });
}
