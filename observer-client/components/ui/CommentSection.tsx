import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';

import CustomAlert from './CustomAlert';
import commentService from '../../app/(services)/commentApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Comment } from '../../types/comment';

import { API_URL } from '~/config';

interface CommentSectionProps {
  eventId: string;
  organizerId: string;
}

export default function CommentSection({ eventId, organizerId }: CommentSectionProps) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<{ id: string; isOwner: boolean } | null>(
    null
  );

  useEffect(() => {
    loadComments();
  }, [eventId]);

  const loadComments = async () => {
    try {
      const data = await commentService.getEventComments(eventId);
      setComments(data);
    } catch (error) {
      console.log('Error loading comments:', error);
      setErrorMessage('Failed to load comments');
      setShowErrorAlert(true);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      await commentService.createComment(eventId, { content: newComment.trim() });
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.log('Error adding comment:', error);
      setErrorMessage('Failed to add comment');
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !editingComment.content.trim()) return;

    setIsLoading(true);
    try {
      await commentService.updateComment(editingComment.id, editingComment.content.trim());
      setEditingComment(null);
      await loadComments();
    } catch (error) {
      console.log('Error updating comment:', error);
      setErrorMessage('Failed to update comment');
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = (commentId: string, isOwner: boolean) => {
    setCommentToDelete({ id: commentId, isOwner });
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    setShowDeleteAlert(false);
    setIsLoading(true);

    try {
      if (commentToDelete.isOwner) {
        await commentService.deleteComment(commentToDelete.id);
      } else {
        await commentService.deleteCommentAsOrganizer(commentToDelete.id);
      }
      await loadComments();
    } catch (error) {
      console.log('Error deleting comment:', error);
      setErrorMessage('Failed to delete comment');
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="mt-8">
      <Text
        className={`text-lg font-semibold underline ${isDarkMode ? 'text-primary-light' : 'text-primary-dark'}`}>
        Comments
      </Text>

      <View className="mt-4 flex-row items-center gap-2">
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor={isDarkMode ? '#ffffff80' : '#14132A80'}
          className={`flex-1 rounded-full border px-4 py-3 ${
            isDarkMode
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
          }`}
        />
        <TouchableOpacity
          onPress={handleAddComment}
          disabled={isLoading || !newComment.trim()}
          className={`rounded-full border border-green-500 bg-green-500/10 p-3 ${
            (!newComment.trim() || isLoading) && 'opacity-50'
          }`}>
          <Feather name="send" size={20} color={isDarkMode ? '#22c55e' : '#22c55e'} />
        </TouchableOpacity>
      </View>

      {comments.map((comment) => (
        // console.log('profile f comment', comment.user.profilePicture),
        <View
          key={comment._id}
          className={`mt-4 rounded-2xl p-4 ${isDarkMode ? 'bg-white/10' : 'bg-primary-dark/10'}`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Image
                source={
                  API_URL + comment.user.profilePicture
                    ? { uri: API_URL + comment.user.profilePicture }
                    : require('../../assets/profile-icon.jpg')
                }
                className="h-10 w-10 rounded-full"
              />
              <View>
                <Text
                  className={`font-semibold ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
                  {`${comment.user.firstName} ${comment.user.lastName}`}
                </Text>
                <Text
                  className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-primary-dark/60'}`}>
                  {new Date(comment.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>

            {(comment.user._id === user?._id || organizerId === user?._id) && (
              <View className="flex-row gap-2">
                {comment.user._id === user?._id && (
                  <TouchableOpacity
                    onPress={() => setEditingComment({ id: comment._id, content: comment.content })}
                    className={`rounded-full p-2 ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'
                    }`}>
                    <Feather name="edit-2" size={16} color={isDarkMode ? '#3b82f6' : '#2563eb'} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleDeleteComment(comment._id, comment.user._id === user?._id)}
                  className={`rounded-full p-2 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
                  <Feather name="trash-2" size={16} color={isDarkMode ? '#ef4444' : '#dc2626'} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {editingComment?.id === comment._id ? (
            <View className="mt-2">
              <TextInput
                value={editingComment.content}
                onChangeText={(text) => setEditingComment({ ...editingComment, content: text })}
                className={`rounded-2xl border px-4 py-3 ${
                  isDarkMode
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-primary-dark/20 bg-primary-dark/10 text-primary-dark'
                }`}
                multiline
              />
              <View className="mt-2 flex-row justify-end gap-2">
                <TouchableOpacity
                  onPress={() => setEditingComment(null)}
                  className="rounded-full border border-red-500 bg-red-500/10 px-4 py-2">
                  <Text className="text-red-500">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUpdateComment}
                  className="rounded-full border border-green-500 bg-green-500/10 px-4 py-2">
                  <Text className="text-green-500">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text className={`mt-2 ${isDarkMode ? 'text-white' : 'text-primary-dark'}`}>
              {comment.content}
            </Text>
          )}
        </View>
      ))}

      <CustomAlert
        visible={showDeleteAlert}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
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
    </View>
  );
}
