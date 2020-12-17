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
    Evergrid,
    FlatLayoutSource,
    CustomLayoutSource,
    IPoint,
    EvergridLayout,
} from 'evergrid';

const kInitialScale = 50;
const kStep: IPoint = { x: 1, y: 1 }
const kPointRadius = 0.15;
const kPointDensity = 1;
const kXAxisHeight = 38;
const kYAxisWidth = 60;
const kXAxisHeight$ = new Animated.Value(kXAxisHeight);
const kYAxisWidth$ = new Animated.Value(kYAxisWidth);

export default function Chart() {
    const scale$ = React.useRef(new Animated.ValueXY({ x: kInitialScale, y: -kInitialScale})).current;

    const [layout] = React.useState(() => {
        return new EvergridLayout({
            scale: scale$,
            anchor: { x: 0.5, y: 0.5 },
            layoutSources: [
                new FlatLayoutSource({
                    reuseID: 'verticalGrid',
                    itemSize: kStep,
                    getItemViewLayout: (i, layout) => ({
                        size: {
                            x: Animated.multiply(layout.getScale$().x, layout.itemSize.x),
                            y: '100%',
                        }
                    }),
                    horizontal: true,
                    stickyEdge: 'top',
                    shouldRenderItem: () => false,
                }),
                new FlatLayoutSource({
                    reuseID: 'horizontalGrid',
                    itemSize: kStep,
                    getItemViewLayout: (i, layout) => ({
                        size: {
                            x: '100%',
                            y: Animated.multiply(layout.getScale$().y, layout.itemSize.y),
                        }
                    }),
                    stickyEdge: 'left',
                    shouldRenderItem: () => false,
                }),
                new CustomLayoutSource({
                    reuseID: 'point',
                    itemSize: { x: kPointRadius * 2, y: kPointRadius * 2 },
                    itemOrigin: { x: 0.5, y: 0.5 },
                    getItemLayout: i => {
                        // i *= 0.1;
                        return {
                            offset: { x: i / kPointDensity, y: Math.sin(i * Math.PI * 0.1) * 2 },
                        };
                    },
                    getVisibleIndexSet: (pointRange) => {
                        let indexSet = new Set<number>();
                        for (
                            let i = Math.floor(pointRange[0].x * kPointDensity);
                            i < Math.ceil(pointRange[1].x * kPointDensity);
                            i++
                        ) {
                            indexSet.add(i);
                        }
                        return indexSet;
                    },
                    shouldRenderItem: () => false,
                }),
                new CustomLayoutSource({
                    reuseID: 'bottomAxis',
                    getItemViewLayout: (i, layout) => ({
                        offset: {
                            x: 0,
                            y: Animated.subtract(layout.root.containerSize$.y, kXAxisHeight),
                        },
                        size: {
                            x: '100%',
                            y: kXAxisHeight,
                        },
                    }),
                    getVisibleIndexSet: () => new Set([0]),
                    shouldRenderItem: () => false,
                }),
                new FlatLayoutSource({
                    reuseID: 'bottomAxisMajor',
                    itemSize: kStep,
                    willUseItemViewLayout: (i, layout) => {
                        layout.size = {
                            x: new Animated.Value(60),
                            y: kXAxisHeight$,
                        }
                    },
                    horizontal: true,
                    stickyEdge: 'bottom',
                    // itemOrigin: { x: 0.5, y: 1 },
                    shouldRenderItem: () => true,
                }),
                new CustomLayoutSource({
                    reuseID: 'rightAxis',
                    getItemViewLayout: (i, layout) => ({
                        offset: {
                            x: Animated.subtract(layout.root.containerSize$.x, kYAxisWidth),
                            y: 0,
                        },
                        size: {
                            x: kYAxisWidth,
                            y: '100%',
                        },
                    }),
                    getVisibleIndexSet: () => new Set([0]),
                    shouldRenderItem: () => false,
                }),
                new FlatLayoutSource({
                    reuseID: 'rightAxisMajor',
                    itemSize: kStep,
                    getItemViewLayout: () => ({
                        size: {
                            x: kYAxisWidth,
                            y: 40,
                        }
                    }),
                    stickyEdge: 'right',
                    itemOrigin: { x: 1, y: 0.5 },
                    shouldRenderItem: () => true,
                }),
            ],
        });
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
            <Evergrid
                layout={layout}
                renderItem={({ index, animated, reuseID }) => {
                    switch (reuseID) {
                        case 'point':
                            return <Animated.View style={[styles.point, {
                                borderRadius: Animated.divide(animated.viewLayout.size.x, 2),
                            }]} />;
                        case 'bottomAxis':
                            return <View style={styles.bottomAxis} />
                        case 'bottomAxisMajor':
                            return (
                                <View style={styles.bottomAxisMajorContainer}>
                                    <View style={styles.bottomAxisMajorTick} />
                                    <Text style={styles.bottomAxisMajorLabel}>{index}</Text>
                                </View>
                            );
                        case 'rightAxis':
                            return <View style={styles.rightAxis} />
                        case 'rightAxisMajor':
                            return (
                                <View style={styles.rightAxisMajorContainer}>
                                    <View style={styles.rightAxisMajorTick} />
                                    <View style={styles.rightAxisMajorLabelContainer}>
                                        <Text style={styles.rightAxisMajorLabel}>{index}</Text>
                                    </View>
                                </View>
                            );
                        case 'horizontalGrid':
                            return <View style={styles.horizontalGrid} />
                        case 'verticalGrid':
                            return <View style={styles.verticalGrid} />
                        default: 
                            return null;
                    }
                }}
                style={styles.container}
            />
            <View style={styles.toolbar}>
                <Button onPress={() => applyScale(1/1.6)}>Scale –</Button>
                <Button onPress={() => applyScale(1.6)}>Scale +</Button>
                <Button
                    mode='contained'
                    onPress={() => layout.scrollTo({
                        offset: { x: 0, y: 0 },
                        animated: true,
                    })}
                >
                    Origin
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    horizontalGrid: {
        flex: 1,
        borderTopWidth: 1,
        borderColor: 'rgba(200, 210, 230, 0.5)',
    },
    verticalGrid: {
        flex: 1,
        borderLeftWidth: 1,
        borderColor: 'rgba(200, 210, 230, 0.5)',
    },
    rightAxis: {
        flex: 1,
        borderLeftWidth: 1,
        borderColor: 'gray',
        backgroundColor: 'white',
    },
    rightAxisMajorContainer: {
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        // borderColor: 'gray',
        // borderWidth: 1,
    },
    rightAxisMajorTick: {
        width: 4,
        height: 1,
        alignSelf: 'center',
        backgroundColor: 'gray',
    },
    rightAxisMajorLabelContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    rightAxisMajorLabel: {
        marginHorizontal: 8,
        color: 'gray',
    },
    bottomAxis: {
        flex: 1,
        borderTopWidth: 1,
        borderColor: 'gray',
        backgroundColor: 'white',
    },
    bottomAxisMajorContainer: {
        flex: 1,
        alignContent: 'center',
    },
    bottomAxisMajorTick: {
        width: 1,
        height: 4,
        alignSelf: 'center',
        backgroundColor: 'gray',
    },
    bottomAxisMajorLabel: {
        margin: 5,
        textAlign: 'center',
        color: 'gray',
    },
    point: {
        flex: 1,
        backgroundColor: 'rgb(100, 150, 200)',
    },
    toolbar: {
        height: 50,
        marginBottom: Platform.OS === 'ios' ? 10 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderColor: 'gray',
        borderTopWidth: 1,
    }
});
