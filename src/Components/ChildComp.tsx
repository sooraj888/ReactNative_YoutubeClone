import {View, Text, Button} from 'react-native';
import React, {useContext} from 'react';
import {ThemeContext, themeType} from '../context/Context';

export default function ChildComp() {
  const {theme, setTheme} = useContext(ThemeContext);
  return (
    <View>
      <Text>{theme}</Text>
      <Button
        onPress={() => {
          setTheme((prev: themeType) => {
            if (prev === 'light') {
              return 'dark';
            } else {
              return 'light';
            }
          });
        }}
        title="asas"></Button>
    </View>
  );
}
