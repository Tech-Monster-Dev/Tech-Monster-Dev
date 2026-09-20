import EditableField from "./EditableField";


export default function AddressDetails({
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
                3. Address Details
            </h3>


            <div className="form-grid">

                {/* Current Address */}

                <EditableField
                    field="currentAddress"
                    label="Current Address"
                    value={data?.currentAddress}

                    editingField={editingField}
                    tempValue={tempValue}
                    setTempValue={setTempValue}

                    handleEditClick={handleEditClick}
                    handleCancel={handleCancel}
                    handleSave={handleSave}

                    saving={saving}
                />


                {/* Local Address */}

                <EditableField
                    field="localAddress"
                    label="Local Address"
                    value={data?.localAddress}

                    editingField={editingField}
                    tempValue={tempValue}
                    setTempValue={setTempValue}

                    handleEditClick={handleEditClick}
                    handleCancel={handleCancel}
                    handleSave={handleSave}

                    saving={saving}
                />


                {/* Pincode */}

                <EditableField
                    field="pincode"
                    label="Pincode"
                    value={data?.pincode}

                    editingField={editingField}
                    tempValue={tempValue}
                    setTempValue={setTempValue}

                    handleEditClick={handleEditClick}
                    handleCancel={handleCancel}
                    handleSave={handleSave}

                    saving={saving}
                />


                {/* District */}

                <EditableField
                    field="district"
                    label="District (Auto-filled)"
                    value={data?.district}

                    readOnly
                />


                {/* State */}

                <EditableField
                    field="state"
                    label="State (Auto-filled)"
                    value={data?.state}

                    readOnly
                />

            </div>
        </>
    );
}