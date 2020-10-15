import React from 'react';
import {
    Animated,
    AppState,
    StyleSheet,
    View,
} from 'react-native';
import {
    Text,
} from 'react-native-paper';
import {
    FlatLayoutSource,
    RecyclerGridView,
} from 'recyclergridview';

const kItemWidth = 300;
const kItemHeight = 60;
const kSenderHeight = 16;
const kPreviewHeight = 16;

const newItem = (): EmailItemProps => ({
    email: {
        sender: import('faker').then(faker => faker.internet.email()),
        preview: import('faker').then(faker => faker.lorem.lines(1)),
    },
    offset: new Animated.Value(0),
});

export default function Email() {
    const listRef = React.useRef<RecyclerGridView>(null);
    const items = React.useRef<EmailItemProps[]>([]).current;
    const selectedIndexRef = React.useRef<number | undefined>();

    const list = React.useRef(new FlatLayoutSource({
        itemSize: {
            x: kItemWidth,
            y: kItemHeight,
        },
        stickyEdge: 'left',
        shouldRenderItem: () => true,
        willShowItem: item => {
            items[item.index]?.offset.setValue(0);
        }
    })).current;

    React.useEffect(() => {
        let timer = setInterval(() => {
            if (AppState.currentState === 'active') {
                // Only add when app is active

                // Shift data
                console.debug('Received email');
                items.unshift(newItem());

                // Add row
                list.addItem(
                    { index: 0 },
                    listRef.current!,
                    { animated: true }
                );
            }
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    return (
        <View style={styles.container}>
        <RecyclerGridView
            ref={listRef}
            anchor={{ x: 0.5, y: 0 }}
            layoutSources={[list]}
            renderItem={({ index }) => {
                let item = items[index];
                if (!item) {
                    if (index < 0) {
                        return null;
                    }
                    item = newItem();
                    items[index] = item;
                }
                return <EmailItem {...item} />;
            }}
            style={styles.grid}
            panResponderCallbacks={{
                onPanResponderStart: (e, g) => {
                    let p = list.getLocation(listRef.current!.transformPointFromScreenToContainer({
                        x: g.x0,
                        y: g.y0,
                    }), listRef.current!);
                    let item = list.getVisibleItemAtLocation(p, listRef.current!);
                    if (item) {
                        console.debug(`Selected email at ${item.index}`);
                        selectedIndexRef.current = item.index;
                    } else {
                        console.debug(`Deselected email`);
                        selectedIndexRef.current = undefined;
                    }
                },
                onPanResponderMove: (e, g) => {
                    if (!selectedIndexRef.current) {
                        return;
                    }
                    Animated.event(
                        [null, { dx: items[selectedIndexRef.current].offset }],
                        { useNativeDriver: false }
                    )(e, g);
                },
                onPanResponderEnd: (e, g) => {
                    if (selectedIndexRef.current) {
                        let index = selectedIndexRef.current;
                        let item = items[index]
                        let remove = g.dx < (-kItemWidth * 0.3);

                        Animated.spring(item.offset, {
                            toValue: remove ? -kItemWidth : 0,
                            useNativeDriver: false,
                        }).start(() => {
                            item.offset.setValue(0);
                        });

                        if (remove) {
                            // Shift data
                            console.debug(`Deleted email at ${JSON.stringify(index)}`);
                            items.splice(index, 1);

                            // Remove row
                            list.removeItem(
                                { index },
                                listRef.current!,
                                { animated: true }
                            );
                        }
                    }
                },
            }}
        />
        </View>
    );
}

interface EmailItemProps {
    email: {
        sender: Promise<string>,
        preview: Promise<string>,
    };
    offset: Animated.Value;
}

const EmailItem = React.memo(({ email, offset }: EmailItemProps) => {
    const [sender, setSender] = React.useState('');
    const [preview, setPreview] = React.useState('');

    React.useEffect(() => {
        email.sender.then(data => setSender(data));
        email.preview.then(data => setPreview(data));
    }, [email]);

    return (
        <Animated.View
            style={[styles.item, {
                transform: [ { translateX: offset } ],
            }]}
        >
            <Text style={[styles.sender, sender ? {} : { color: 'gray' }]}>
                {sender || 'Loading...'}
            </Text>
            <Text style={[styles.preview, preview ? {} : { color: 'gray' }]}>
                {preview || 'Loading...'}
            </Text>
            {/* <Divider /> */}
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    grid: {
        flex: 1,
        width: kItemWidth,
        backgroundColor: 'transparent',
        borderColor: 'rgb(230,230,230)',
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
    },
    item: {
        flex: 1,
        height: kItemHeight,
        width: kItemWidth,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderColor: 'rgb(230,230,230)',
        borderTopWidth: 0.5,
    },
    sender: {
        marginTop: 8,
        fontWeight: 'bold',
        height: kSenderHeight,
    },
    preview: {
        marginTop: 8,
        height: kPreviewHeight,
        overflow: 'hidden',
        marginBottom: 8,
    },
});
