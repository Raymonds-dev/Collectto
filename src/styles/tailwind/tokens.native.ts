import rawTokens from './tokens.js';

type ColorScale = {
  [key: string]: string;
};

type AppColors = {
  brand: ColorScale & { primary: string };
  neutral: ColorScale;
  surface: ColorScale;
  text: ColorScale;
  feedback: ColorScale;
  overlay: ColorScale;
  dark: {
    surface: ColorScale;
    text: ColorScale;
    brand: ColorScale;
    feedback: ColorScale;
    overlay: ColorScale;
  };
};

type TailwindTokens = {
  colors: AppColors;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  gradients: Record<string, string[] | number[]>;
  motion: {
    duration: Record<string, number>;
    distance: Record<string, number>;
    scale: Record<string, number>;
    opacity: Record<string, number>;
    stagger: Record<string, number>;
    underline: {
      width: number;
    };
  };
  fontFamily: Record<string, string[]>;
};

export const tokens = rawTokens as TailwindTokens;
