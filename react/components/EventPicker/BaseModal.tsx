import React, { FC, ReactNode } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';
import PressableArea from '../../UI/PressableArea';

interface BaseModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

const BaseModal: FC<BaseModalProps> = ({
    visible,
    onClose,
    title,
    children,
    onConfirm,
    onCancel,
    confirmText = "ВЫБРАТЬ",
    cancelText = "ЗАКРЫТЬ"
}) => {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            presentationStyle='overFullScreen'
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                    </View>

                    <View style={styles.contentContainer}>
                        {children}
                    </View>

                    <View style={styles.modalFooter}>
                        <PressableArea
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </PressableArea>

                        <PressableArea
                            style={[styles.button, styles.confirmButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </PressableArea>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        width: '80%',
        maxWidth: 400,
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        paddingVertical: 15,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.lightblue,
    },
    contentContainer: {
        maxHeight: 300,
        paddingHorizontal: 8,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },
    confirmButton: {
        backgroundColor: colors.lightblue,
    },
    cancelButtonText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '500',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default BaseModal;