export const getAccountFormSections = ({
    isProfileImageRequired,
    formData,
    preview,
    skillInput,
    setSkillInput,
    handleAddSkill,
    handleRemoveSkill,
    SkillsInput,
    Textinput
}) => [
    {
        id: "personal-details",
        title: "1. Personal Details",
        className: "account-form-section",
        titleClassName: "account-form-section-title",
        fieldsClassName: "account-form-grid account-personal-grid",
        fields: [
            {
                name: "avatar",
                label: "Choose Profile Photo (Under 2MB)",
                value: preview,
                type: "image",
                wrapperClassName: "account-form-profile-image",
                required: isProfileImageRequired,
                accept: "image/*",
                maxSize: 2 * 1024 * 1024,
                preview: true
            },
            {
                name: "firstName",
                wrapperClassName: "account-form-first-name",
                label: "First Name",
                type: "text",
                placeholder: "Enter First Name",
                required: true
            },
            {
                name: "middleName",
                wrapperClassName: "account-form-middle-name",
                label: "Middle Name",
                type: "text"
            },
            {
                name: "lastName",
                wrapperClassName: "account-form-last-name",
                label: "Last Name",
                type: "text",
                required: true
            },
            {
                name: "email",
                wrapperClassName: "account-form-email",
                label: "Email (Auto-filled)",
                type: "email",
                required: true,
                readOnly: true
            },
            {
                name: "gender",
                wrapperClassName: "account-form-gender",
                label: "Gender",
                type: "select",
                required: true,
                options: [
                    {
                        value: "",
                        label: "Select Gender"
                    },
                    {
                        value: "male",
                        label: "Male"
                    },
                    {
                        value: "female",
                        label: "Female"
                    },
                    {
                        value: "other",
                        label: "Other"
                    }
                ]
            },
            {
                name: "phone",
                wrapperClassName: "account-form-phone",
                required: true,
                render: ({ value, error, onChange, disabled }) => (
                    <div className="account-form-group">
                        <div className="account-whatsapp-row">
                            <Textinput
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                value={value}
                                placeholder="10-digit number"
                                onChange={onChange}
                                error={error}
                                required
                                disabled={disabled}
                            />

                            <a
                                href="https://wa.me/918984457601?text=Hello%20Tech%20Monster"
                                target="_blank"
                                rel="noreferrer"
                                className="account-whatsapp-link"
                            >
                                Join WhatsApp
                            </a>
                        </div>
                    </div>
                )
            },
            {
                name: "dateOfBirth",
                wrapperClassName: "account-form-date-of-birth",
                label: "Date of Birth",
                type: "date",
                required: true
            }
        ]
    },
    {
        id: "education-details",
        title: "2. Educational Information",
        className: "account-form-section",
        titleClassName: "account-form-section-title",
        fieldsClassName: "account-form-grid",
        fields: [
            {
                name: "education",
                label: "What are you studying?",
                type: "text",
                placeholder: "e.g. B.Tech / BCA",
                required: true
            },
            {
                name: "college",
                label: "College Name",
                type: "text",
                required: true
            },
            {
                name: "branch",
                label: "Branch",
                type: "text",
                required: true
            },
            {
                name: "year",
                label: "Year",
                type: "text",
                placeholder: "e.g. 3rd Year",
                required: true
            },
            {
                name: "semester",
                label: "Semester",
                type: "text",
                placeholder: "e.g. 5th Sem",
                required: true
            },
            {
                name: "skills",
                required: true,
                render: ({ error, disabled }) => (
                    <SkillsInput
                        skills={formData.skills}
                        skillInput={skillInput}
                        addSkill={handleAddSkill}
                        removeSkill={handleRemoveSkill}
                        setSkillInput={setSkillInput}
                        error={error}
                        disabled={disabled}
                    />
                )
            },
            {
                name: "github",
                label: "Github",
                type: "url"
            },
            {
                name: "linkedin",
                label: "LinkedIn",
                type: "url"
            }
        ]
    },
    {
        id: "address-details",
        title: "3. Address Details",
        className: "account-form-section",
        titleClassName: "account-form-section-title",
        fieldsClassName: "account-form-grid",
        fields: [
            {
                name: "currentAddress",
                label: "Current Address",
                type: "text",
                placeholder: "Enter current address",
                required: true
            },
            {
                name: "localAddress",
                label: "Local Address",
                type: "text",
                required: true
            },
            {
                name: "pincode",
                label: "Pincode",
                type: "text",
                placeholder: "Enter 6 digit pincode",
                maxLength: 6,
                required: true
            },
            {
                name: "district",
                label: "District (Auto-filled)",
                type: "text",
                readOnly: true
            },
            {
                name: "state",
                label: "State (Auto-filled)",
                type: "text",
                readOnly: true
            },
            {
                name: "bio",
                label: "Bio",
                type: "textarea",
                rows: 4
            }
        ]
    }
];
