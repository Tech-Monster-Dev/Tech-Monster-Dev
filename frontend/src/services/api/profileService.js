import api from "./axios";
import { API } from "./endpoints";

export const getProfile=()=>{

    return api.get(API.PROFILE.GET);

}

export const getUserProfile = (userId) => {
    return api.get(API.PROFILE.GET_USER(userId));
};

export const updateProfile=(data)=>{

    return api.put(API.PROFILE.UPDATE,data);

}

export const updateProfileField=(data)=>{

    return api.patch(API.PROFILE.UPDATE,data);

}

export const uploadProfileImage=(formData)=>{

    return api.put(

        API.PROFILE.IMAGE,

        formData,

        {

            headers:{

                "Content-Type":"multipart/form-data"

            }

        }

    );

}