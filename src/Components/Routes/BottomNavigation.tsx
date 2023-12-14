import {View, Text} from 'react-native';
import React from 'react';
import CustomBottomTabBar from '../Screens/BottomNavigationScreens/TabBar/CustomBottomTabBarProps';

import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screens/BottomNavigationScreens/HomeScreen';
import SettingsScreen from '../Screens/BottomNavigationScreens/SettingsScreen';
const Tab = createBottomTabNavigator();
export default function BottomNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      backBehavior="history"
      tabBar={prop => <CustomBottomTabBar {...prop} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Home2" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
