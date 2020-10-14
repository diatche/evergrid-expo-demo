import { StackNavigationProp } from '@react-navigation/stack';

// Main Stack

export type MainStackList = {
    Menu: undefined;
    Gallery: undefined;
    Email: undefined;
    Chart: undefined;
    CondensedDemo: undefined;
};

export type MenuNavigationProp = StackNavigationProp<
    MainStackList,
    'Menu'
>;

