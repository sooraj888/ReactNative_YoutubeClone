import {createContext, useContext, useEffect, useMemo, useState} from 'react';

export type themeType = 'dark' | 'light';
export type videoScreenStatusType = 'opened' | 'closed' | 'minimized';

type ThemeContextType = {
  theme: themeType;
  setTheme: React.Dispatch<React.SetStateAction<themeType>>;
  videoScreenStatus: videoScreenStatusType;
  setVideoScreenStatus: React.Dispatch<
    React.SetStateAction<videoScreenStatusType>
  >;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isLockOrientation: boolean;
  setIsLockOrientation: React.Dispatch<React.SetStateAction<boolean>>;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: payload => {},
  videoScreenStatus: 'closed',
  setVideoScreenStatus: payload => {},
  isPlaying: false,
  setIsPlaying: payload => {},
  isLockOrientation: false,
  setIsLockOrientation: payload => {},
});

export const MyContext = ({
  children,
}: {
  children: React.ReactNode | [React.ReactNode];
}) => {
  const [theme, setTheme] = useState<themeType>('dark');
  const [videoScreenStatus, setVideoScreenStatus] =
    useState<videoScreenStatusType>('closed');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLockOrientation, setIsLockOrientation] = useState<boolean>(false);

  useEffect(() => {
    if (videoScreenStatus === 'closed') {
      setIsPlaying(false);
    }
  }, [videoScreenStatus]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        videoScreenStatus,
        setVideoScreenStatus,
        isPlaying,
        setIsPlaying,
        isLockOrientation,
        setIsLockOrientation,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useMyContext = () => {
  return useContext(ThemeContext);
};
