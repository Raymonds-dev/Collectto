import { Theme } from 'react-native-calendars';

declare module 'react-native-calendars' {
  interface Theme {
    'stylesheet.calendar.header'?: any;
  }
}

const t: Theme = {
  'stylesheet.calendar.header': { zIndex: 1 }
};
