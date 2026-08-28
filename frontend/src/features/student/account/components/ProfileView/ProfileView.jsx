import { motion } from "framer-motion";

import "./ProfileView.css";
import { FaCheck } from "react-icons/fa";

import useProfileEdit from "./hooks/useProfileEdit";
import useBadgesData from "../../../badges/hooks/useBadgesData";

import {
  ProfileHeader,
  PersonalDetails,
  EducationDetails,
  SkillsSection,
  AddressDetails,
  BioSection,
  BadgesSection
} from "./components";


export default function ProfileView({
  userData,
  onUpdateData,
  onEdit
}) {

  const {
    data,

    editingField,
    tempValue,

    saving,
    imageLoading,

    setTempValue,

    handleEditClick,
    handleCancel,
    handleSave,
    handleImageUpdate

  } = useProfileEdit({
    userData,
    onUpdateData
  });

  const male = data.gender === "male";
  const female = data.gender === "female";
  const other = data.gender === "other";

  const {
    badges,
    loading: badgesLoading
  } = useBadgesData();




  return (

    <motion.div
      id="profile-view-container"

      initial={{
        opacity: 0,
        y: 20
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={{
        duration: 0.5
      }}
    >

      {/* ============================== */}
      {/* PROFILE VIEW HEADER */}
      {/* ============================== */}

      <div id="profile-view-header">

        <h2>
          My Profile
          <span
            className={`profile-check ${male
              ? "profile-check-male"
              : female
                ? "profile-check-female"
                : other
                  ? "profile-check-other"
                  : ""
              }`}
          >
            <FaCheck />
          </span>
        </h2>

        <button
          type="button"
          id="edit-profile-btn"
          onClick={onEdit}
        >
          Edit Profile
        </button>

      </div>

      {/* ============================== */}
      {/* PROFILE HEADER */}
      {/* ============================== */}

      <ProfileHeader
        data={data}
        imageLoading={imageLoading}
        handleImageUpdate={
          handleImageUpdate
        }
      />


      {/* ============================== */}
      {/* PERSONAL DETAILS */}
      {/* ============================== */}

      <PersonalDetails
        data={data}

        editingField={editingField}
        tempValue={tempValue}
        setTempValue={setTempValue}

        handleEditClick={
          handleEditClick
        }

        handleCancel={
          handleCancel
        }

        handleSave={
          handleSave
        }

        saving={saving}
      />


      {/* ============================== */}
      {/* EDUCATION DETAILS */}
      {/* ============================== */}

      <EducationDetails
        data={data}

        editingField={editingField}
        tempValue={tempValue}
        setTempValue={setTempValue}

        handleEditClick={
          handleEditClick
        }

        handleCancel={
          handleCancel
        }

        handleSave={
          handleSave
        }

        saving={saving}
      />


      {/* ============================== */}
      {/* SKILLS */}
      {/* ============================== */}

      <SkillsSection
        skills={data?.skills}
      />


      {/* ============================== */}
      {/* ADDRESS DETAILS */}
      {/* ============================== */}

      <AddressDetails
        data={data}

        editingField={editingField}
        tempValue={tempValue}
        setTempValue={setTempValue}

        handleEditClick={
          handleEditClick
        }

        handleCancel={
          handleCancel
        }

        handleSave={
          handleSave
        }

        saving={saving}
      />


      {/* ============================== */}
      {/* BIO */}
      {/* ============================== */}

      <BioSection
        data={data}

        editingField={editingField}
        tempValue={tempValue}
        setTempValue={setTempValue}

        handleEditClick={
          handleEditClick
        }

        handleCancel={
          handleCancel
        }

        handleSave={
          handleSave
        }

        saving={saving}
      />


      {/* ============================== */}
      {/* BADGES */}
      {/* ============================== */}

      <BadgesSection
        badges={badges}
        loading={badgesLoading}
      />

    </motion.div>
  );
}