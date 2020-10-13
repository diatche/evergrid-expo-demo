import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Pages from './src/pages';

export default function App() {
    return (
        <PaperProvider>
            <Pages />
        </PaperProvider>
    );
}
