import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import interestService from './(services)/interestApi';
import CustomAlert from '../components/ui/CustomAlert';
import { Interest } from '../types/interest';
import AddInterest from '../components/ui/AddInterest';
import UpdateInterest from '../components/ui/UpdateInterest';

export default function InterestManagement() {
  const { isDarkMode } = useTheme();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [interestToDelete, setInterestToDelete] = useState<Interest | null>(null);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      const data = await interestService.getAllInterests();

      const sortedInterests = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInterests(sortedInterests);
    } catch (error) {
      setErrorMessage('Failed to load interests');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterest = async (updatedInterest: Interest) => {
    try {
      await interestService.updateInterest(updatedInterest._id, {
        category: updatedInterest.category,
        description: updatedInterest.description,
      });
      setIsUpdateModalVisible(false);
      loadInterests();
      setShowSuccessAlert(true);
    } catch (error) {
      setErrorMessage('Failed to update interest');
      setShowErrorAlert(true);
    }
  };

  const handleDelete = (interest: Interest) => {
    setInterestToDelete(interest);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!interestToDelete) return;

    try {
      await interestService.deleteInterest(interestToDelete._id);
      setShowDeleteAlert(false);
      loadInterests();
      setShowSuccessAlert(true);
    } catch (error) {
      setErrorMessage('Failed to delete interest');
      setShowDeleteAlert(false);
      setShowErrorAlert(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-primary-dark' : 'bg-primary-light'}`}>
      <View className="flex-1 px-4">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-6">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <Text
                  className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  ← Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="flex-row items-center gap-2 rounded-full border border-red-500 bg-red-500/10 px-6 py-2">
                <Feather name="plus" size={24} color="red" />
                <Text className="text-red-500">Add Interest</Text>
              </TouchableOpacity>
            </View>

            <Text className={`text-2xl mt-6 text-center font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Manage Interests
            </Text>

            <View className="my-4">
              {interests.map((interest) => (
                <View
                  key={interest._id}
                  className={`mt-4 rounded-2xl p-4 ${
                    isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'
                  }`}>
                  <View>
                    <Text
                      className={`gap-2 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {/* <Text className="underline">Category:</Text>
                      {'  '} */}
                      {interest.category}
                    </Text>
                    <Text className={`mt-1 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                      {/* <Text className="underline">Description:</Text>
                      {'  '} */}
                      {interest.description}
                    </Text>
                    <View className="mt-3 flex-row justify-end gap-2">
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedInterest(interest);
                          setIsUpdateModalVisible(true);
                        }}
                        className="rounded-full border border-green-500 bg-green-500/10 px-6 py-2">
                        <Text className="text-green-500">Update</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(interest)}
                        className="rounded-full border border-red-500 bg-red-500/10 px-6 py-2">
                        <Text className="text-red-500">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <AddInterest
        visible={showAddModal}
        onClose={(success) => {
          setShowAddModal(false);
          if (success) {
            loadInterests();
            setShowSuccessAlert(true);
          }
        }}
      />

      {selectedInterest && (
        <Modal visible={isUpdateModalVisible} animationType="slide">
          <UpdateInterest
            isVisible={isUpdateModalVisible}
            interest={selectedInterest}
            onClose={() => setIsUpdateModalVisible(false)}
            onUpdate={handleUpdateInterest}
          />
        </Modal>
      )}

      <CustomAlert
        visible={showDeleteAlert}
        title="Delete Interest"
        message="Are you sure you want to delete this interest? This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowDeleteAlert(false),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: confirmDelete,
          },
        ]}
      />

      <CustomAlert
        visible={showSuccessAlert}
        title="Success"
        message="Operation completed successfully"
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowSuccessAlert(false),
          },
        ]}
      />

      <CustomAlert
        visible={showErrorAlert}
        title="Error"
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowErrorAlert(false),
          },
        ]}
      />
    </SafeAreaView>
  );
}
