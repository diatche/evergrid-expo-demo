import { StackNavigationProp } from '@react-navigation/stack';

// Main Stack

export type MainStackList = {
    Menu: undefined;
    Gallery: undefined;
    Email: undefined;
    CondensedDemo: undefined;
};

export type MenuNavigationProp = StackNavigationProp<
    MainStackList,
    'Menu'
>;

export type GalleryNavigationProp = StackNavigationProp<
    MainStackList,
    'Gallery'
>;

export type EmailNavigationProp = StackNavigationProp<
    MainStackList,
    'Email'
>;

export type CondensedDemoNavigationProp = StackNavigationProp<
    MainStackList,
    'CondensedDemo'
>;
