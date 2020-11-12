import React from 'react';
import {
    Animated,
    GestureResponderEvent,
    PanResponderGestureState,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import {
    Button,
} from 'react-native-paper';
import {
    GridLayoutSource,
    LayoutSource,
    RecyclerGridView,
    FlatLayoutSource,
    CustomLayoutSource,
} from 'evergrid';

export default function CondensedDemo() {
    const gridViewRef = React.useRef<RecyclerGridView>(null);
    const scale$ = React.useRef(new Animated.ValueXY({ x: 1, y: 1})).current;
    const itemSize$ = React.useRef(new Animated.ValueXY({
        x: 300,
        y: 300,
    })).current;
    const itemOrigin$ = React.useRef(new Animated.ValueXY()).current;
    const selectedLocationRef = React.useRef({ x: 0, y: 0 });
    const pointPhaseRef = React.useRef(0);
    const fontSize$ = React.useRef(Animated.multiply(scale$.x, 12)).current;

    const grid = React.useRef(new GridLayoutSource({
        reuseID: 'grid',
        itemSize: itemSize$, 
        origin: itemOrigin$,
        shouldRenderItem: () => true,
    })).current;

    const points = React.useRef(new CustomLayoutSource({
        itemSize: { x: 20, y: 20}, 
        reuseID: 'point',
        getItemLayout: i => {
            return {
                offset: { x: i * 40, y: Math.sin(pointPhaseRef.current + i * 0.2) * 100 },
            };
        },
        getVisibleIndexSet: (pointRange) => {
            let indexSet = new Set<number>();
            for (
                let i = Math.floor(pointRange[0].x / 40);
                i < Math.ceil(pointRange[1].x / 40);
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
                reuseID: 'B',
                itemSize: { x: itemSize$.x, y: 40}, 
                horizontal: true,
                stickyEdge: 'bottom',
                origin: { x: 0, y: -40 },
                shouldRenderItem: () => true,
            }),
            new FlatLayoutSource({
                reuseID: 'R',
                itemSize: { x: 40, y: itemSize$.y}, 
                stickyEdge: 'right',
                origin: { x: -40, y: 0 },
                // scale: { x: 0.5, y: 1 },
                shouldRenderItem: () => true,
            }),
        ];
    });

    const selectGrid = React.useCallback((e: GestureResponderEvent, g: PanResponderGestureState) => {
        let view = gridViewRef.current!;
        if (!view.isPanningContent) {
            let pContainer = view.getContainerLocationWithEvent(e);
            let pContent = grid.getLocation(pContainer, view);
            let i = grid.getGridIndex(
                pContent,
                view,
                { floor: true }
            );
            let i0 = selectedLocationRef.current;
            if (i.x !== i0.x || i.y !== i0.y) {
                selectedLocationRef.current = i;
                grid.setItemNeedsRender(i0);
                grid.setItemNeedsRender(i);
            }
        }
    }, []);

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

    const offsetPointPhase = React.useCallback((phaseOffset: number) => {
        pointPhaseRef.current += phaseOffset;
        points.updateItems(gridViewRef.current!, {
            animated: true,
        });
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
                if (reuseID === 'point') {
                    return (
                        <Animated.View
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: Animated.divide(
                                    animated.viewLayout.size.x,
                                    2
                                ),
                                backgroundColor: 'rgba(100, 130, 160, 0.5)',
                            }}
                        />
                    );
                }
                let backgroundColor = 'rgba(255,255,255,0.8)';
                if (reuseID === 'grid') {
                    let { x, y } = selectedLocationRef.current;
                    if (index.x === x && index.y === y) {
                        backgroundColor = 'rgba(200,200,200,0.8)';
                    }
                }
                return (
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderColor: reuseID === 'grid' ? 'red' : 'blue',
                            backgroundColor,
                            borderWidth: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <Animated.Text
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                fontSize: fontSize$,
                            }}
                        >
                            {JSON.stringify(index)}
                        </Animated.Text>
                        <Animated.Text
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                fontSize: fontSize$,
                            }}
                        >
                            {reuseID}
                        </Animated.Text>
                        <Animated.Text
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                fontSize: fontSize$,
                            }}
                        >
                            {JSON.stringify(index)}
                        </Animated.Text>
                    </View>
                );
            }}
            panResponderCallbacks={{
                onPanResponderMove: (e, g) => selectGrid(e, g),
            }}
            onLongPress={(e, g) => {
                gridViewRef.current!.preventDefaultPan();
                console.debug('Pan default prevented');
                selectGrid(e, g);
            }}
            style={styles.grid}
        />
        <View style={styles.toolbar}>
            <Button onPress={() => offsetPointPhase(-1)}>Phase –</Button>
            <Button onPress={() => offsetPointPhase(1)}>Phase +</Button>
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
