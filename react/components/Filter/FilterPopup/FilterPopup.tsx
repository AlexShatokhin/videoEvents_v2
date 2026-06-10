import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTypedSelector, useTypedDispatch } from '../../../hooks/useRedux';
import { colors } from '../../../../constants/colors';
import { 
    setCurrentFilterValues as setArchiveCurrentFilterValues, 
    setFilterVisibility as setArchiveFilterVisibility, 
    toggleFitlerVisibility as toggleArchiveFilterVisibility 
} from '../../../modules/Archive/components/FilterComponents/FilterSlice';
import { 
    setCurrentFilterValues as setVideoCurrentFilterValues,
    setFilterVisibility as setVideoFilterVisibility,
    toggleFilterVisibility as toggleVideoFilterVisibility
} from '../../../modules/Video/slice/videoSlice';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRoute } from '@react-navigation/native';
import PressableArea from '../../../UI/PressableArea';


const filterStrategies = {
    archive: {
        toggling: toggleArchiveFilterVisibility,
        close: () => setArchiveFilterVisibility(false),
        init: setArchiveCurrentFilterValues,
        selector: (state: any) => state.filterReducer.isOpen,
    },
    video: {
        toggling: toggleVideoFilterVisibility,
        close: () => setVideoFilterVisibility(false),
        init: setVideoCurrentFilterValues,
        selector: (state: any) => state.videoReducer.isFilterOpen,
    }
}

const FilterPopup = ({type}: {type: keyof typeof filterStrategies}) => {
    const strategy = filterStrategies[type];
    const visible = useTypedSelector(strategy.selector);
    const dispatch = useTypedDispatch();
    const route = useRoute();
    const toggleVisibility = () => { 
        dispatch(strategy.toggling())
    };

    useEffect(() => { 
        dispatch(strategy.close())
    }, [route])

    useEffect(() => { 
        if (visible) {
            dispatch(strategy.init());
        }
    }, [visible]);

    return (
        <View style={styles.container}>
            <PressableArea onPress={toggleVisibility} style={styles.toggleButton}>
                <FontAwesome6 name={visible ? "filter-circle-xmark" : "filter"} size={35} color={colors.lightblue} />
            </PressableArea>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    toggleButton: {
        padding: 10,
        paddingTop: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default FilterPopup;