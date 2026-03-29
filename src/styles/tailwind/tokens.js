const colors = {
  brand: {
    50: '#FFF4ED',
    100: '#FFE6D6',
    200: '#FFCCAD',
    300: '#FFB07F',
    400: '#FF8A40',
    500: '#FE5E00',
    600: '#E45300',
    700: '#B74200',
    800: '#8F3300',
    900: '#6E2700',
    950: '#451700',
    primary: '#FE5E00',
  },
  neutral: {
    black: '#151515',
    white: '#F8F8F8',
  },
  surface: {
    base: '#F8F8F8',
    canvas: '#FFFFFF',
    muted: '#EFEFEF',
    card: '#FFFFFF',
    border: '#D9D9D9',
    borderStrong: '#B8B8B8',
    inverse: '#151515',
  },
  text: {
    base: '#151515',
    muted: '#4B4B4B',
    subtle: '#6F6F6F',
    disabled: '#A3A3A3',
    inverse: '#F8F8F8',
  },
  feedback: {
    success: '#0BC264',
    successSoft: '#E7FAEF',
    warning: '#FFCC01',
    warningSoft: '#FFF8D6',
    error: '#E53833',
    errorSoft: '#FDEBEB',
    info: '#0B6CCD',
    infoSoft: '#E8F1FB',
  },
  overlay: {
    scrim: 'rgba(21, 21, 21, 0.55)',
    scrimSoft: 'rgba(21, 21, 21, 0.35)',
  },
  dark: {
    surface: {
      base: '#111111',
      canvas: '#151515',
      muted: '#1E1E1E',
      card: '#222222',
      border: '#333333',
      borderStrong: '#4A4A4A',
      elevated: '#2B2B2B',
    },
    text: {
      base: '#F8F8F8',
      muted: '#D1D1D1',
      subtle: '#AFAFAF',
      disabled: '#7A7A7A',
      inverse: '#151515',
    },
    brand: {
      primary: '#FE5E00',
      hover: '#FF8A40',
      pressed: '#E45300',
      soft: 'rgba(254, 94, 0, 0.18)',
    },
    feedback: {
      success: '#0BC264',
      successSoft: 'rgba(11, 194, 100, 0.18)',
      warning: '#FFCC01',
      warningSoft: 'rgba(255, 204, 1, 0.2)',
      error: '#E53833',
      errorSoft: 'rgba(229, 56, 51, 0.2)',
      info: '#0B6CCD',
      infoSoft: 'rgba(11, 108, 205, 0.2)',
    },
    overlay: {
      scrim: 'rgba(0, 0, 0, 0.7)',
      scrimSoft: 'rgba(0, 0, 0, 0.5)',
    },
  },
};

const spacing = {
  18: '4.5rem',
  22: '5.5rem',
  26: '6.5rem',
  30: '7.5rem',
};

const radius = {
  xl: '0.875rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
};

const shadow = {
  card: '0 10px 28px rgba(21, 21, 21, 0.08)',
  cardStrong: '0 16px 40px rgba(21, 21, 21, 0.12)',
  cardDark: '0 10px 28px rgba(0, 0, 0, 0.35)',
  cardDarkStrong: '0 16px 40px rgba(0, 0, 0, 0.5)',
  focus: '0 0 0 3px rgba(11, 108, 205, 0.25)',
  focusBrand: '0 0 0 3px rgba(254, 94, 0, 0.25)',
};

const gradients = {
  brandJourney: ['#D9534F', '#85AF24', '#FFCC01', '#155CA2'],
  brandJourneyStops: [0, 0.35, 0.73, 1],
  brandWarm: ['#FE5E00', '#FFCC01'],
  darkBrandJourney: ['#7A2E2B', '#536C1A', '#A68600', '#114575'],
  darkBrandJourneyStops: [0, 0.35, 0.73, 1],
};

const fontFamily = {
  logo: ['PoetsenOne', 'System'],
  sans: ['Inter', 'System'],
  heading: ['Inter', 'System'],
  body: ['Inter', 'System'],
};

module.exports = {
  colors,
  spacing,
  radius,
  shadow,
  gradients,
  fontFamily,
};
