import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
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
    const scale$ = React.useRef(new Animated.ValueXY()).current;
    const itemSize$ = React.useRef(new Animated.ValueXY({
        x: 300,
        y: 300,
    })).current;
    const itemOrigin$ = React.useRef(new Animated.ValueXY()).current;

    const [layoutSources] = React.useState<LayoutSource[]>(() => {
        return [
            new GridLayoutSource({
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
            }),
            new CustomLayoutSource({
                itemSize: { x: 20, y: 20}, 
                reuseID: 'point',
                getItemLayout: i => {
                    return {
                        offset: { x: i * 40, y: Math.sin(i * 0.2) * 100 + 150 },
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
            }),
            new FlatLayoutSource({
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
                itemSize: { x: 40, y: itemSize$.y}, 
                stickyEdge: 'right',
                origin: { x: -40, y: 0 },
                // scale: { x: 0.5, y: 1 },
                shouldRenderItem: () => true,
            }),
        ];
    });

    return (
        <RecyclerGridView
            // scale={scale$}
            // anchor={{ x: 0.5, y: 1 }}
            // onViewportSizeChanged={({ containerSize }) => {
            //     scale$.setValue({
            //         x: containerSize.x / kColumns,
            //         y: -containerSize.y / kRows,
            //     });
            // }}
            // panTarget={itemOrigin$}
            layoutSources={layoutSources}
            renderItem={(
                { contentLayout, animated, reuseID },
                layoutSource
            ) => {
                // console.debug(`[${layoutSource.id}] render item (${reuseID}): ${JSON.stringify(contentLayout.offset)}`);
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
                return (
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderColor: reuseID === 'grid' ? 'red' : 'blue',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            borderWidth: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <Text
                            style={{
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            {JSON.stringify(contentLayout.offset)}
                        </Text>
                        <Text
                            style={{
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            {reuseID}
                        </Text>
                        <Text
                            style={{
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            {JSON.stringify(contentLayout.offset)}
                        </Text>
                    </View>
                );
            }}
            // verticalScrollEnabled={false}
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
            style={styles.flatList}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flatList: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
