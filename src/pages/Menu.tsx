import React from 'react';
import { View, FlatList, StyleSheet } from "react-native";
import { Button } from 'react-native-paper';
import { MenuNavigationProp } from "./types";

export interface MenuProps {
    navigation: MenuNavigationProp;
}

const Menu = ({ navigation }: MenuProps) => {

    return (
        <FlatList
            data={[
                { id: 'CondensedDemo', title: 'Condensed Demo' },
            ]}
            renderItem={({ item }) => (
                <Button
                    key={item.id}
                    style={styles.item}
                    mode='contained'
                    onPress={() => {
                        console.info(`Opening page: ${item.id}`);
                        navigation.push(item.id as any);
                    }}
                >
                    {item.title}
                </Button>
            )}
            style={styles.listContent}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        flex: 1,
        width: '100%',
        maxWidth: 300,
        alignContent: 'stretch',
        // backgroundColor: 'gray',
        alignSelf: 'center',
    },
    item: {
        // height: 50,
        // width: '100%',
        // maxWidth: 300,
        marginHorizontal: 10,
        marginTop: 10,
        // alignContent: 'center',
        // justifyContent: 'center',
    },
});

export default Menu;
