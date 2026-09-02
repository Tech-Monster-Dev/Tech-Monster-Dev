import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { createInternship, updateInternship } from "../../../../../services/api/internship.service";
import InternshipFormSkeleton from "../InternshipFormSkeleton";

import { toast } from "react-toastify";

import './InternshipsForm.css';

export default function InternshipsForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const editData = location.state?.internshipData;
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(
        Boolean(editData)
    );

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: '',
        level: '',
        description: '',
        duration: '',
        price: '',
        totalTasks: '',
        totalNotes: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (editData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                title: editData.title || '',
                slug: editData.slug || '',
                category: editData.category || '',
                level: editData.level || '',
                description: editData.description || '',
                duration: editData.duration || '',
                price: editData.price ?? '',
                totalTasks: editData.totalTasks || '',
                totalNotes: editData.totalNotes || '',
            });
            setIsEditMode(true);
            setLoading(false);
        }


    }, [editData]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {


        const file = e.target.files[0];


        setImageFile(file);


        setPreview(
            URL.createObjectURL(file)
        );


    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('slug', formData.slug);
        data.append('category', formData.category);
        data.append('level', formData.level);
        data.append('description', formData.description);
        data.append('duration', formData.duration);
        data.append('price', formData.price);
        data.append('totalTasks', formData.totalTasks);
        data.append('totalNotes', formData.totalNotes);

        if (imageFile) {
            data.append('img', imageFile); // 'img' matches multer middleware upload.single('img')
        }

        try {
            let response;
            if (isEditMode) {
                const id = editData._id || editData.id;
                // PUT request for update
                response = await updateInternship(id, data);
            } else {
                // POST request for create
                response = await createInternship(data);
            }

            if (response.data.success) {
                toast.success(
                    isEditMode
                        ?
                        "Internship updated successfully"
                        :
                        "Internship created successfully"
                );
                navigate('/admin/internships');
            }
        } catch (error) {
            console.error("Error submitting internship:", error);
            toast.error(
                error.response?.data?.message
                ||
                "Something went wrong"
            );
        }
    };

    if (loading) {

        return <InternshipFormSkeleton />;

    }



    return (
        <div id="internshipsForm" className="fade-in-section">
            <div id="backOption">
                <Link to={'/admin/internships'}>
                    <FiArrowLeft />
                </Link>
                <h1>{isEditMode ? "Edit Internship Form" : "Internship Add Form"}</h1>
            </div>

            <form onSubmit={handleSubmit} className="styled-form">
                <div id="formGroup">
                    <label htmlFor="img">Choose an internship logo</label>
                    <input type="file" name='img' id='img' onChange={handleFileChange} />
                    {
                        preview &&

                        <img

                            src={preview}

                            className="image-preview"

                        />

                    }
                </div>
                <div id="formGroup">
                    <label htmlFor="title">Title</label>
                    <input type="text" name='title' id='title' value={formData.title} placeholder='Enter Title' onChange={handleInputChange} required />
                </div>
                <div id="formGroup">
                    <label htmlFor="description">Description</label>
                    <input type="text" name='description' id='description' value={formData.description} placeholder='Enter description' onChange={handleInputChange} required />
                </div>
                <div id="formGroup">
                    <label htmlFor="duration">Duration</label>
                    <input type="text" name='duration' id='duration' value={formData.duration} placeholder='Enter duration (e.g., 3 Months)' onChange={handleInputChange} required />
                </div>
                <div id="formGroup">
                    <label htmlFor="price">Certificate Fee</label>
                    <input type="number" name="price" id="price" value={formData.price} placeholder="Enter certificate fee" min="0" step="0.01" onChange={handleInputChange} required />
                </div>
                <div id="formGroup">
                    <label>Slug</label>

                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        placeholder="Enter slug"
                        onChange={handleInputChange}
                        required
                    />

                </div>

                <div id="formGroup">

                    <label>Category</label>

                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        placeholder="Enter category"
                        onChange={handleInputChange}
                        required
                    />

                </div>

                <div id="formGroup">

                    <label>Level</label>

                    <select
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        required
                    >

                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>

                    </select>

                </div>

                <div id="formGroup">
                    <label htmlFor="totalNotes">Total Notes</label>
                    <input type="number" name='totalNotes' id='totalNotes' value={formData.totalNotes} placeholder='Enter total notes' onChange={handleInputChange} required />
                </div>
                <div id="formGroup">
                    <label htmlFor="totalTasks">Total Tasks</label>
                    <input type="number" name='totalTasks' id='totalTasks' value={formData.totalTasks} placeholder='Enter total tasks' onChange={handleInputChange} required />
                </div>

                <button type='submit' className="submit-btn">
                    {isEditMode ? "Update Internship" : "Add Internships"}
                </button>
            </form>
        </div>
    );
}