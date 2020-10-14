import React from 'react';
import {
    Animated,
    Image,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import {
    Button,
} from 'react-native-paper';
import {
    GridLayoutSource,
    RecyclerGridView,
} from 'recyclergridview';

const createID = (index: any) => `${index.x}_${index.y}`;

export default function Gallery() {
    const gridViewRef = React.useRef<RecyclerGridView>(null);
    const scale$ = React.useRef(new Animated.ValueXY({ x: 1, y: 1})).current;
    const items = React.useRef<{ [id: string]: {
        opacity: Animated.Value,
    } }>({}).current;

    const grid = React.useRef(new GridLayoutSource({
        reuseID: 'grid',
        itemSize: {
            x: 300,
            y: 300,
        }, 
        shouldRenderItem: ({ item }) => {
            // let id = createID(item.index);
            // console.debug(`will render ${id}`);
            return true;
        },
        // willShowItem: item => console.debug(`will show ${createID(item.index)}`),
        // willHideItem: item => console.debug(`will hide ${createID(item.index)}`),
    })).current;

    const applyScale = React.useCallback((coef: number) => {
        let animation = Animated.spring(scale$, {
            toValue: {
                x: (scale$.x as any)._value * coef,
                y: (scale$.y as any)._value * coef,
            },
            useNativeDriver: false,
        });
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <View style={styles.container}>
        <RecyclerGridView
            ref={gridViewRef}
            scale={scale$}
            anchor={{ x: 0.5, y: 0.5 }}
            layoutSources={[grid]}
            renderItem={({ index }) => {
                let id = createID(index);
                let item = items[id];
                let isNew = !item;
                if (!item) {
                    item = {
                        opacity: new Animated.Value(0),
                    };
                    items[id] = item;
                }
                let loadStartDate = 0;
                // console.debug(`rendering ${id} (isNew: ${isNew})`);
                return (
                    <Animated.View style={{
                        flex: 1,
                        opacity: item.opacity,
                    }}>
                        <Image
                            style={{ flex: 1 }}
                            key={id}
                            source={{
                                uri: `https://placeimg.com/${grid.itemSize.x}/${grid.itemSize.y}/nature?${id}`,
                            }}
                            resizeMode='cover'
                            onLoadStart={() => {
                                item.opacity.setValue(0);
                                loadStartDate = new Date().valueOf();
                            }}
                            onLoadEnd={() => {
                                let loadTime = new Date().valueOf() - loadStartDate;
                                if (isNew || loadTime > 100) {
                                    Animated.timing(item.opacity, {
                                        toValue: 1,
                                        duration: 300,
                                        useNativeDriver: true,
                                    }).start();
                                } else {
                                    item.opacity.setValue(1);
                                }
                            }}
                        />
                    </Animated.View>
                );
            }}
            style={styles.grid}
        />
        <View style={styles.toolbar}>
            <Button onPress={() => applyScale(1/1.6)}>Scale –</Button>
            <Button onPress={() => applyScale(1.6)}>Scale +</Button>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    grid: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'gray',
    },
    toolbar: {
        height: 50,
        marginBottom: Platform.OS === 'ios' ? 10 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    }
});
