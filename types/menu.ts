export interface MenuItem {
  name: string;
}

export interface Station {
  name: string;
  items: string[];
}

export interface DiningHall {
  name: string;
  hours: string;
  status?: 'open' | 'closed';
  stations: Station[];
}

export interface MenuData {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'latenight';
  timestamp: string;
  diningHalls: DiningHall[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'latenight';
