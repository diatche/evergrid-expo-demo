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
    Evergrid,
    FlatLayoutSource,
    CustomLayoutSource,
    EvergridLayout,
    IInsets,
    zeroPoint,
} from 'evergrid';

const topAxisWidth = 30;
const leftAxisWidth = 30;
const bottomAxisWidth = 60;
const rightAxisWidth = 60;

const insets: IInsets<number> = {
    left: leftAxisWidth,
    right: rightAxisWidth,
    top: topAxisWidth,
    bottom: bottomAxisWidth,
};

export default function CondensedDemo() {
    const scale$ = React.useRef(new Animated.ValueXY({ x: 1, y: 1 })).current;
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
        insets,
    })).current;

    const points = React.useRef(new CustomLayoutSource({
        itemSize: { x: 20, y: 20}, 
        reuseID: 'point',
        insets,
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

    const [layout] = React.useState(() => {
        return new EvergridLayout({
            scale: scale$,
            // anchor: { x: 0, y: 0 },
            anchor: { x: 0.5, y: 0.5 },
            // anchor: { x: 1, y: 1 },
            layoutSources: [
                grid,
                points,
                new FlatLayoutSource({
                    reuseID: 'T',
                    itemSize: itemSize$,
                    willUseItemViewLayout: itemViewLayout => {
                        itemViewLayout.size.y = new Animated.Value(insets.top);
                    },
                    horizontal: true,
                    stickyEdge: 'top',
                    shouldRenderItem: () => true,
                    insets: {
                        left: insets.left,
                        right: insets.right,
                    },
                }),
                new FlatLayoutSource({
                    reuseID: 'L',
                    itemSize: itemSize$,
                    willUseItemViewLayout: itemViewLayout => {
                        itemViewLayout.size.x = new Animated.Value(insets.left);
                    },
                    stickyEdge: 'left',
                    shouldRenderItem: () => true,
                    insets: {
                        top: insets.top,
                        bottom: insets.bottom,
                    },
                }),
                new FlatLayoutSource({
                    reuseID: 'B',
                    itemSize: itemSize$,
                    willUseItemViewLayout: itemViewLayout => {
                        itemViewLayout.size.y = new Animated.Value(insets.bottom);
                    },
                    horizontal: true,
                    stickyEdge: 'bottom',
                    shouldRenderItem: () => true,
                    insets: {
                        left: insets.left,
                        right: insets.right,
                    },
                }),
                new FlatLayoutSource({
                    reuseID: 'R',
                    itemSize: itemSize$,
                    willUseItemViewLayout: itemViewLayout => {
                        itemViewLayout.size.x = new Animated.Value(insets.right);
                    },
                    stickyEdge: 'right',
                    shouldRenderItem: () => true,
                    insets: {
                        top: insets.top,
                        bottom: insets.bottom,
                    },
                }),
            ],
            onPanResponderMove: (e, g) => selectGrid(e, g),
            onLongPress: (e, g) => {
                layout.preventDefaultPan();
                // console.debug('Pan default prevented');
                selectGrid(e, g);
            }
        });
    });

    const selectGrid = React.useCallback((e: GestureResponderEvent, g: PanResponderGestureState) => {
        if (!layout.isPanningContent) {
            let pContainer = layout.getContainerLocationWithEvent(e);
            let pContent = grid.getLocation(pContainer);
            let i = grid.getGridIndex(
                pContent,
                { floor: true }
            );
            let i0 = selectedLocationRef.current;
            if (i.x !== i0.x || i.y !== i0.y) {
                console.debug(`Selecting grid at ${JSON.stringify(i)}`);
                selectedLocationRef.current = i;
                grid.setItemNeedsRender(i0);
                grid.setItemNeedsRender(i);

                // Zoom to item
                let itemLayout = grid.getItemContentLayout(i);
                let insetOffset = zeroPoint();
                // let insetOffset = insetTranslation(
                //     insets,
                //     {
                //         anchor: layout.anchor,
                //         invertX: layout.scale.x < 0,
                //         invertY: layout.scale.y < 0,
                //     }
                // );
                layout.scrollTo({
                    range: [
                        {
                            x: itemLayout.offset.x + insetOffset.x / layout.scale.x,
                            y: itemLayout.offset.y + insetOffset.y / layout.scale.y,
                        },
                        {
                            x: itemLayout.offset.x + itemLayout.size.x,
                            y: itemLayout.offset.y + itemLayout.size.y,
                        },
                    ],
                    insets,
                    // insets: anchoredInsets(insets, layout.anchor),
                    animated: true,
                    timing: {
                        duration: 400,
                    },
                });
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
        points.updateItems({
            animated: true,
        });
    }, []);

    return (
        <View style={styles.container}>
        <Evergrid
            layout={layout}
            renderItem={(
                { index, animated, reuseID },
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
