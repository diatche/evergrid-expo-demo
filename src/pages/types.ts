import { StackNavigationProp } from '@react-navigation/stack';

// Main Stack

export type MainStackList = {
    Menu: undefined;
    CondensedDemo: undefined;
};

export type MenuNavigationProp = StackNavigationProp<
    MainStackList,
    'Menu'
>;

export type CondensedDemoNavigationProp = StackNavigationProp<
    MainStackList,
    'CondensedDemo'
>;
