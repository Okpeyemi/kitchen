/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

const UserColors = {
  background: '#f9f3e9',
  text: '#112a46',
  accent: '#112a46',
  accentLight: '#112a4622',
};

export const Colors = {
  light: {
    text: UserColors.text,
    background: UserColors.background,
    accent: UserColors.accent,
    accentLight: UserColors.accentLight,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: UserColors.text,
    background: UserColors.background,
    accent: UserColors.accent,
    accentLight: UserColors.accentLight,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  bold: 'Montserrat_700Bold',
  title: 'Outfit_700Bold',
  titleRegular: 'Outfit_400Regular',
};
