import EditableField from "./EditableField";


export default function BioSection({
    data,

    editingField,
    tempValue,
    setTempValue,

    handleEditClick,
    handleCancel,
    handleSave,

    saving
}) {

    return (
        <div className="bio-profile-box">

            <EditableField
                field="bio"
                label="Bio"
                value={data?.bio}
                multiline

                editingField={editingField}
                tempValue={tempValue}
                setTempValue={setTempValue}

                handleEditClick={handleEditClick}
                handleCancel={handleCancel}
                handleSave={handleSave}

                saving={saving}
            />

        </div>
    );
}