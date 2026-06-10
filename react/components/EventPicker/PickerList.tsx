import React, { FC } from 'react';
import { FlatList } from 'react-native';
import PickerItem, { PickerItemType } from './PickerItem';

interface PickerListProps {
    items: PickerItemType[];
    selectedValues: string[];
    onItemPress: (value: string) => void;
    selectionMode: 'single' | 'multiple';
}

const PickerList: FC<PickerListProps> = ({
    items,
    selectedValues,
    onItemPress,
    selectionMode
}) => {
    const renderItem = ({ item }: { item: PickerItemType }) => {
        const isSelected = selectedValues.includes(item.value);
        return (
            <PickerItem
                item={item}
                isSelected={isSelected}
                onPress={onItemPress}
                selectionMode={selectionMode}
            />
        );
    };

    return (
        <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
        />
    );
};

export default PickerList;