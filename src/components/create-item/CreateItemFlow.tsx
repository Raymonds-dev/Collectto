import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useItemCreation } from '@/hooks/useItemCreation';

/**
 * CreateItemFlow - Main component orchestrating the entire item creation flow
 * Combines permission gate, photo picker, metadata form, collection selector, and save flow
 *
 * TODO: Integrate the following components as they are created:
 * - PermissionGate: Check and request camera/gallery permissions
 * - PhotoPicker: Capture/select photos
 * - ItemMetadataForm: Collect name, description
 * - CollectionSelector: Select or create collection
 * - ItemSaveFlow: Orchestrate save operation
 */
export const CreateItemFlow: React.FC = () => {
  const { formData, localPhotos } = useItemCreation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Item</Text>
      <Text style={styles.placeholder}>
        CreateItemFlow will integrate:
        {'\n'}• Permission gating
        {'\n'}• Photo picker
        {'\n'}• Item metadata form
        {'\n'}• Collection selector
        {'\n'}• Save orchestration
      </Text>

      {/* Debug info - remove in production */}
      <Text style={styles.debug}>
        Debug: {localPhotos.length} photos, name: {`"${formData.name}"`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  debug: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
});
