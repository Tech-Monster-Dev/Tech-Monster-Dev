import EditableField from "./EditableField";


export default function PersonalDetails({
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
                1. Personal Details
            </h3>


            <div className="form-grid">

                <EditableField
                    field="firstName"
                    label="First Name"
                    value={data?.firstName}

                    editingField={editingField}
                    tempValue={tempValue}
                    setTempValue={setTempValue}

                    handleEditClick={handleEditClick}
                    handleCancel={handleCancel}
                    handleSave={handleSave}

                    saving={saving}
                />


                <EditableField
                    field="lastName"
                    label="Last Name"
                    value={data?.lastName}

                    editingField={editingField}
                    tempValue={tempValue}
                    setTempValue={setTempValue}

                    handleEditClick={handleEditClick}
                    handleCancel={handleCancel}
                    handleSave={handleSave}

                    saving={saving}
                />


                <EditableField
                    field="email"
                    label="Email"
                    value={data?.email}
                    type="email"

                    editingField={editingField}
                    tempValue={tempValue}
                    setTempValue={setTempValue}

                    handleEditClick={handleEditClick}
                    handleCancel={handleCancel}
                    handleSave={handleSave}

                    saving={saving}
                />


                <EditableField
                    field="phone"
                    label="Phone"
                    value={data?.phone}

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