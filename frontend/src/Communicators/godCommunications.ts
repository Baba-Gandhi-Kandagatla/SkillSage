// use axios to communicate with the backend
import axios from "axios";

export const getAllColleges = async () => {
    try {
        const response = await axios.get("/god/getAllColleges");
        return response.data;
    } catch (error) {
        console.error("Error while fetching colleges:", error);
        return [];
    }
}

export const addCollege = async (college: any) => {
    try {
        const response = await axios.post("/god/addCollege", college);
        return response.data;
    } catch (error) {
        console.error("Error while adding college:", error);
        return null;
    }
}

export const deleteCollege = async (id: number) => {
    try {
        const response = await axios.delete(`/god/deleteCollege/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error while deleting college:", error);
        return null;
    }
}

export const getCollegeAdmins = async (id: number) => {
    try {
        const response = await axios.get(`/god/getCollegeAdmins/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error while fetching admins:", error);
        return [];
    }
}


export const addAdmin = async (id: number, admin: any) => {
    try {
        const response = await axios.post(`/god/addAdmin/${id}`, admin);
        return response.data;
    } catch (error) {
        console.error("Error while adding admin:", error);
        return null;
    }
}