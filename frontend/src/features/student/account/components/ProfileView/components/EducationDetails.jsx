import EditableField from "./EditableField";


export default function EducationDetails({
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
        <>
            <h3 className="form-section-title">
                2. Education Details
            </h3>


            <div className="form-grid">

                <EditableField
                    field="college"
                    label="College Name"
                    value={data?.college}

                    editingField={editingField}
                    tempValue={tempValue}
                    setTempValue={setTempValue}

                    handleEditClick={handleEditClick}
                    handleCancel={handleCancel}
                    handleSave={handleSave}

                    saving={saving}
                />


                <EditableField
                    field="branch"
                    label="Branch"
                    value={data?.branch}

                    editingField={editingField}
                    tempValue={tempValue}
                    setTempValue={setTempValue}

                    handleEditClick={handleEditClick}
                    handleCancel={handleCancel}
                    handleSave={handleSave}

                    saving={saving}
                />

            </div>
        </>
    );
}