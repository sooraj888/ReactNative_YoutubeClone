import React, {useContext, useEffect} from 'react';
import {Alert, BackHandler, Button, Text, View} from 'react-native';
import {useMyContext} from '../../../context/Context';
import {useIsFocused} from '@react-navigation/native';

export default function SettingsScreen({navigation}: any) {
  const {setVideoScreenStatus, isPlaying} = useMyContext();

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
