import { useEditorContext } from './editor-context';
import { useRecipe } from './hooks';

export const Title = () => {
  const { isEditing, editingFields, setEditingField } = useEditorContext();
  const { title } = useRecipe();

  return (
    <>
      {isEditing ? (
        <input
          className="text-5xl text-primary font-extrabold rounded-md flex justify-center w-full text-center p-2 my-2"
          onChange={(e) => setEditingField('title', e.target.value)}
          value={editingFields.title}
        />
      ) : (
        <h1 className="text-5xl text-primary text-center self-center p-2 my-2 font-satisfy">
          {title}
        </h1>
      )}
      <div className="hr" />
    </>
  );
};
