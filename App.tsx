import * as React from 'react';
import {Button, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {MyContext} from './src/context/Context';
import BottomNavigation from './src/Components/Routes/BottomNavigation';

function HomeScreen({navigation}: any) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button
        onPress={() => navigation.navigate('Notifications')}
        title="Go to notifications"
      />
    </View>
  );
}

function NotificationsScreen({navigation}: any) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button onPress={() => navigation.goBack()} title="Go back home" />
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <MyContext>
      <NavigationContainer>
        <Drawer.Navigator
          detachInactiveScreens={false}
          drawerContent={props => <></>}
          screenOptions={{
            headerShown: false,
          }}>
          <Drawer.Screen name="Home1" component={BottomNavigation} />
        </Drawer.Navigator>
      </NavigationContainer>
    </MyContext>
  );
}
