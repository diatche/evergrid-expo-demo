import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Menu from './Menu';
import Gallery from './Demos/Gallery';
import CondensedDemo from './Demos/CondensedDemo';
import {
    MainStackList,
} from './types';

const MainStack = createStackNavigator<MainStackList>();

const Main = () => (
    <MainStack.Navigator initialRouteName='Menu'>
        <MainStack.Screen
            name='Menu'
            component={Menu}
            options={{
                title: 'RecycleGridViewExpoDemo',
            }}
        />
        <MainStack.Screen
            name='Gallery'
            component={Gallery}
        />
        <MainStack.Screen
            name='CondensedDemo'
            component={CondensedDemo}
        />
    </MainStack.Navigator>
);

const Pages = () => (
    // TODO: set app background color (scrolling on iOS web shows white in dark mode)
    <NavigationContainer>
        <Main />
    </NavigationContainer>
);

export default Pages;
