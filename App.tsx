import {Fragment, createContext, useMemo, useState} from 'react';
import {Text, View} from 'react-native';

import ChildComp from './src/Components/ChildComp';
import {MyContext, themeType} from './src/context/Context';
import SettingsScreen from './src/Components/Screens/BottomNavigationScreens/SettingsScreen';
import HomeScreen from './src/Components/Screens/BottomNavigationScreens/HomeScreen';

import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import CustomBottomTabBar from './src/Components/Screens/BottomNavigationScreens/CustomBottomTabBarProps';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <MyContext>
        <Tab.Navigator
          screenOptions={{headerShown: false}}
          tabBar={prop => <CustomBottomTabBar {...prop} />}>
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </MyContext>
    </NavigationContainer>
  );
}
