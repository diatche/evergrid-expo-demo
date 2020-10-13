import React from 'react';
import {
    Animated,
    GestureResponderEvent,
    InteractionManager,
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
} from 'recyclergridview';

const kRows = 1;
const kColumns = 1;

export default function App() {
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


    // React.useEffect(() => {
    //     let task: any;
    //     let timer = setInterval(() => {
    //         task?.cancel?.();
    //         task = InteractionManager.runAfterInteractions(() => {
    //             pointPhaseRef.current += 1;
    //             points.updateItems(gridViewRef.current!, {
    //                 animated: true,
    //                 timing: {
    //                     duration: 1000,
    //                     // easing: x => Math.sin(x * Math.PI / 2),
    //                 }
    //             });
    //         });
    //     }, 1000);
    //     return () => {
    //         clearInterval(timer);
    //         task?.cancel?.();
    //     };
    // }, []);

    const grid = React.useRef(new GridLayoutSource({
        reuseID: 'grid',
        itemSize: itemSize$, 
        origin: itemOrigin$,
        insets: {
            // top: 10,
            // bottom: 20,
            // right: scale$.x,
            // right: 50,
            // left: 50,
        },
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
                // scale: { x: 1, y: 0.1 },
                insets: {
                    // right: scale$.x,
                },
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
        // console.debug('onPanResponderMove: ' + JSON.stringify([g.dx, g.dy]));
        // let { moveX: x, moveY: y } = g;
        let view = gridViewRef.current!;
        if (!view.isPanningContent) {
            let pScreen = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
            // console.debug(`pScreen: ${JSON.stringify(pScreen)}`);
            let pContainer = view.transformPointFromScreenToContainer(pScreen);
            // console.debug(`pContainer: ${JSON.stringify(pContainer)}`);
            let pContent = grid.getLocation(pContainer, view);
            // console.debug(`pContent: ${JSON.stringify(pContent)}`);
            let i = grid.getGridIndex(
                pContent,
                view,
                { floor: true }
            );
            // console.debug(`i: ${JSON.stringify(i)}`);
            let i0 = selectedLocationRef.current;
            if (i.x !== i0.x || i.y !== i0.y) {
                selectedLocationRef.current = i;
                console.debug(`Selected grid: ${JSON.stringify(i)}`);
                grid.setItemNeedsRender(i0);
                grid.setItemNeedsRender(i);
                // let item = grid.getVisibleItem(i);
                // grid.updateItem()
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
            // timing: {
            //     duration: 1000,
            //     // easing: x => Math.sin(x * Math.PI / 2),
            // }
        });
    }, []);

    return (
        <View style={styles.container}>
        <RecyclerGridView
            ref={gridViewRef}
            scale={scale$}
            anchor={{ x: 0.5, y: 0.5 }}
            // onViewportSizeChanged={({ containerSize }) => {
            //     scale$.setValue({
            //         x: containerSize.x / kColumns,
            //         y: -containerSize.y / kRows,
            //     });
            // }}
            // panTarget={itemOrigin$}
            layoutSources={layoutSources}
            renderItem={(
                { index, animated, reuseID },
                layoutSource
            ) => {
                // console.debug(`[${layoutSource.id}] render item (${reuseID}): ${JSON.stringify(index)}`);
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
                    // console.debug(`Rendering grid item: ${JSON.stringify(index)}`);
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
            // verticalScrollEnabled={false}
            panResponderCallbacks={{
                // onPanResponderStart: () => {
                //     // console.debug('onPanResponderStart');
                // },
                onPanResponderMove: (e, g) => selectGrid(e, g),
            }}
            onLongPress={(e, g) => {
                gridViewRef.current!.preventDefaultPan();
                console.debug('Pan default prevented');
                selectGrid(e, g);
            }}
            snapToLocation={({ location: p, scaledVelocity: v }) => {
                return undefined;
                // console.debug('v: ' + v.x);
                let { x: i } = p;
                // console.debug('i: ' + i);
                let nearestIndex = Math.round(i);
                let distToNearestIndex = i % 1;
                if (distToNearestIndex < -0.5) {
                    distToNearestIndex += 1;
                }
                distToNearestIndex = Math.abs(distToNearestIndex);
                if (Math.abs(v.x) < 0.1) {
                    // Tiny velocitys
                    if (distToNearestIndex < 0.2) {
                        return { x: nearestIndex };
                    }
                    return undefined;
                } else if (Math.abs(v.x) < 0.4) {
                    // Small velocity: small step
                    if (v.x < 0) {
                        return { x: Math.ceil(i) - 1 };
                    } else {
                        return { x: Math.floor(i) + 1 };
                    }
                } else {
                    // High velocity: page step
                    if (v.x < 0) {
                        return {
                            x: (Math.ceil(i / kColumns) - 1) * kColumns,
                        };
                    } else {
                        return {
                            x:
                                (Math.floor(i / kColumns) + 1) *
                                kColumns,
                        };
                    }
                }
            }}
            // getItemLayout={({ index }) => engine.getSectionLayout(index)}
            // renderItem={renderItem}
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
        // backgroundColor: '#fff',
        // alignItems: 'center',
        // justifyContent: 'center',
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
