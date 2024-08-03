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
  business,    // Import business icon
  calendar,    // Import calendar icon
  people,      // Import people icon
  document     // Import document icon
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
    'document': document       // Register document icon
  });
}