import React, {useContext} from 'react';
import {Button, Text, View} from 'react-native';
import {useMyContext} from '../../../context/Context';

export default function SettingsScreen() {
  const {setTheme, setVideoScreenStatus, videoScreenStatus, isPlaying} =
    useMyContext();

  return (
    <View>
      <Text>SettingsScreen{String(isPlaying)}</Text>
      <Button
        title="Open"
        onPress={() => {
          setVideoScreenStatus('opened');
        }}
      />

      <Button
        title="minimize"
        onPress={() => {
          setVideoScreenStatus('minimized');
        }}
      />
      <Button
        title="close"
        onPress={() => {
          setVideoScreenStatus('closed');
        }}
      />
    </View>
  );
}
