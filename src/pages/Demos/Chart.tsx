import React from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import {
    Text,
    Button,
} from 'react-native-paper';
import {
    GridLayoutSource,
    LayoutSource,
    RecyclerGridView,
    FlatLayoutSource,
    CustomLayoutSource,
    IPoint,
} from 'recyclergridview';

const kStep: IPoint = { x: 10, y: 10 }

export default function Chart() {
    const gridViewRef = React.useRef<RecyclerGridView>(null);
    const scale$ = React.useRef(new Animated.ValueXY({ x: 30, y: -30})).current;

    const grid = React.useRef(new GridLayoutSource({
        reuseID: 'grid',
        itemSize: kStep,
        shouldRenderItem: () => false,
    })).current;

    const points = React.useRef(new CustomLayoutSource({
        itemSize: { x: 1, y: 1}, 
        reuseID: 'point',
        getItemLayout: i => {
            i *= 0.1;
            return {
                offset: { x: i * 10, y: Math.sin(i) * 5 },
            };
        },
        getVisibleIndexSet: (pointRange) => {
            let indexSet = new Set<number>();
            for (
                let i = Math.floor(pointRange[0].x);
                i < Math.ceil(pointRange[1].x);
                i++
            ) {
                indexSet.add(i);
            }
            return indexSet;
        },
        shouldRenderItem: () => false,
    })).current;

    const [layoutSources] = React.useState<LayoutSource[]>(() => {
        return [
            grid,
            points,
            new FlatLayoutSource({
                reuseID: 'bottom',
                itemSize: { x: kStep.x, y: 60}, 
                horizontal: true,
                stickyEdge: 'bottom',
                origin: { x: 0, y: -60 },
                shouldRenderItem: () => true,
            }),
            new FlatLayoutSource({
                reuseID: 'right',
                itemSize: { x: 60, y: kStep.y }, 
                stickyEdge: 'right',
                origin: { x: -60, y: 0 },
                shouldRenderItem: () => true,
            }),
        ];
    });

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
                layoutSources={layoutSources}
                renderItem={(
                    { index, animated, reuseID },
                    layoutSource
                ) => {
                    switch (reuseID) {
                        case 'point':
                            return (
                                <View style={{
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <View style={styles.point} />
                                </View>
                            );
                        case 'grid':
                            return <View style={styles.grid} />
                        case 'right':
                            return (
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row-reverse'
                                }}>
                                    <View style={styles.right}>
                                        <View style={{ flex: 1}} />
                                        <View style={{
                                            height: 20,
                                            marginLeft: 10,
                                            marginVertical: -10,
                                            overflow: 'visible',
                                        }}>
                                            <Text style={{ color: 'gray' }}>{index}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        default: 
                            return null;
                    }
                }}
                style={styles.container}
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
        backgroundColor: 'white',
    },
    grid: {
        flex: 1,
        borderTopWidth: 0.5,
        borderLeftWidth: 0.5,
        borderColor: 'gray',
        borderStyle: 'dotted'
    },
    right: {
        width: 60,
        borderLeftWidth: 0.5,
        borderColor: 'gray',
        backgroundColor: 'white',
    },
    point: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(100, 130, 160, 0.5)',
    },
    toolbar: {
        height: 50,
        marginBottom: Platform.OS === 'ios' ? 10 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    }
});
