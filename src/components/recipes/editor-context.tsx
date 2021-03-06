import { createEditorStateWithText } from '@draft-js-plugins/editor';
import { useUpdateRecipeMutation } from 'graphql-codegen';
import React, { useContext, useState } from 'react';
import { useRef } from 'react';
import { useRouterId, useUserId } from 'utils';
import { useRecipe } from './hooks';
import { convertDraftStateToString, convertStringToDraftState } from './utils';

const defaultEditingFields = {
  shouldSet: true,
  title: '',
  description: '',
  cookTime: '',
  headerImageUrl: '',
  serveCount: '',
};

const EditorContext = React.createContext<{
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  editingFields: {
    shouldSet: boolean;
    title: string;
    description: string;
    cookTime: string;
    headerImageUrl: string;
    serveCount: string;
  };
  setEditingField: (key: string, value: string) => void;
  setEditingFields: (value: any) => void;
  editorState: any;
  setEditorState: (v: any) => void;
  editorRef: any | null;
  onChange: (v: any) => void;
  focus: () => void;
  recipeHasChanged: boolean;
  saveLoading: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}>({
  isEditing: false,
  setIsEditing: () => ({}),
  editingFields: defaultEditingFields,
  setEditingField: () => ({}),
  setEditingFields: () => ({}),
  editorState: createEditorStateWithText(''),
  setEditorState: () => ({}),
  editorRef: null,
  onChange: () => ({}),
  focus: () => ({}),
  recipeHasChanged: false,
  saveLoading: false,
  onSave: () => ({}),
  onCancel: () => ({}),
  onEdit: () => ({}),
});

export const EditorProvider = ({ children }) => {
  const [id] = useRouterId();
  const userId = useUserId();
  const [isEditing, setIsEditing] = useState(false);
  const [editingFields, setEditingFields] = useState(defaultEditingFields);
  const [editorState, setEditorState] = useState(createEditorStateWithText(''));
  const editorRef = useRef<any | null>();
  const editorStateAsString = convertDraftStateToString(editorState);
  const recipe = useRecipe();
  const userOwnsRecipe = String(recipe.userId) === String(userId);
  const recipeTextHasChanged = editorStateAsString !== recipe.text;

  let recipeHasChanged = recipeTextHasChanged;

  Object.entries(editingFields).forEach(([key, value]) => {
    if (value && value !== recipe[key]) {
      recipeHasChanged = true;
    }
  });

  const [updateRecipe, { loading: saveLoading }] = useUpdateRecipeMutation({
    onError: (error) => {
      console.log('error', error);
    },
    onCompleted: () => {
      setIsEditing(false);
    },
  });

  const onChange = (value) => {
    setEditorState(value);
  };

  const focus = () => editorRef.current?.focus();

  const onSave = () => {
    if (recipeHasChanged) {
      window.localStorage.removeItem(`draft-${id}`);

      console.log({ editingFields });

      const updateProps = Object.entries(editingFields).reduce(
        (prop, [key, value]) => {
          if (value && value !== recipe[key] && key !== '__typename') {
            return {
              ...prop,
              [key]: {
                set: value,
              },
            };
          }

          return prop;
        },
        {}
      );

      updateRecipe({
        variables: {
          data: {
            ...updateProps,
            text: {
              set: convertDraftStateToString(editorState),
            },
          },
          where: {
            id,
          },
        },
      });
    }
  };

  const onCancel = () => {
    window.localStorage.removeItem(`draft-${id}`);

    setIsEditing(false);
  };

  const onEdit = () => {
    if (userOwnsRecipe) {
      if (recipe.text) {
        setEditorState(convertStringToDraftState(recipe.text));
      }

      setIsEditing(true);
      setTimeout(focus, 50);
    }
  };

  const setEditingField = (key: string, value: string) => {
    setEditingFields({
      ...editingFields,
      [key]: value,
    });
  };

  const value = {
    isEditing,
    setIsEditing,
    editingFields,
    setEditingField,
    setEditingFields,
    editorState,
    setEditorState,
    editorRef,
    onChange,
    focus,
    saveLoading,
    onCancel,
    onSave,
    onEdit,
    recipeHasChanged,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};

export const useEditorContext = () => useContext(EditorContext);
